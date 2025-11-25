/**
 * Expiration Risk Prediction Service
 * Calculates risk scores based on multiple factors including
 * category, expiration date, consumption patterns, and seasonal effects
 */

/**
 * Category-specific expiration profiles
 * Days indicate typical shelf life
 */
const CATEGORY_PROFILES = {
  fruit: {
    typicalShelfLife: 7,
    seasonalMultiplier: true, // Affected by temperature/season
    highRisk: true,
    perishability: 0.9
  },
  vegetable: {
    typicalShelfLife: 7,
    seasonalMultiplier: true,
    highRisk: true,
    perishability: 0.85
  },
  dairy: {
    typicalShelfLife: 7,
    seasonalMultiplier: false,
    highRisk: true,
    perishability: 0.95
  },
  protein: {
    typicalShelfLife: 3,
    seasonalMultiplier: true,
    highRisk: true,
    perishability: 1.0 // Highest perishability
  },
  grain: {
    typicalShelfLife: 30,
    seasonalMultiplier: false,
    highRisk: false,
    perishability: 0.3
  },
  beverage: {
    typicalShelfLife: 30,
    seasonalMultiplier: false,
    highRisk: false,
    perishability: 0.4
  },
  snack: {
    typicalShelfLife: 60,
    seasonalMultiplier: false,
    highRisk: false,
    perishability: 0.2
  },
  other: {
    typicalShelfLife: 14,
    seasonalMultiplier: false,
    highRisk: false,
    perishability: 0.5
  }
};

/**
 * Calculate seasonal multiplier based on current month
 * Warm months (May-September) increase spoilage risk for perishables
 */
const getSeasonalMultiplier = (category) => {
  const profile = CATEGORY_PROFILES[category] || CATEGORY_PROFILES.other;
  
  if (!profile.seasonalMultiplier) {
    return 1.0;
  }

  const currentMonth = new Date().getMonth(); // 0-11
  
  // Warm season: May (4) to September (8)
  // Peak summer: June (5), July (6), August (7)
  if (currentMonth >= 4 && currentMonth <= 8) {
    if (currentMonth >= 5 && currentMonth <= 7) {
      // Peak summer - highest risk
      return 1.3;
    }
    // Early/late summer
    return 1.15;
  }
  
  // Cold season: October (9) to April (3)
  if (currentMonth >= 10 || currentMonth <= 2) {
    // Winter months - lowest risk
    return 0.85;
  }
  
  // Spring/Fall transition
  return 0.95;
};

/**
 * Calculate consumption frequency score
 * Higher score = item is consumed frequently (lower waste risk)
 */
const calculateConsumptionFrequency = (itemName, category, consumptionLogs) => {
  if (!consumptionLogs || consumptionLogs.length === 0) {
    return 0; // No consumption history
  }

  // Filter logs for this item or category
  const itemLogs = consumptionLogs.filter(log => 
    log.itemName?.toLowerCase().includes(itemName.toLowerCase()) ||
    log.category === category
  );

  if (itemLogs.length === 0) {
    return 0;
  }

  // Calculate frequency over last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentLogs = itemLogs.filter(log => new Date(log.date) >= thirtyDaysAgo);
  
  // Frequency score: 0-10 scale
  // 10+ consumptions in 30 days = 10 (very frequent)
  // 0 consumptions = 0 (never consumed)
  const frequencyScore = Math.min(recentLogs.length, 10);

  return frequencyScore;
};

/**
 * Calculate days until expiration
 */
const getDaysUntilExpiration = (expirationDate) => {
  const now = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Calculate comprehensive risk score (0-100)
 * 100 = Highest risk (about to expire, never consumed)
 * 0 = Lowest risk (far from expiration, frequently consumed)
 */
export const calculateRiskScore = (item, consumptionLogs = []) => {
  const category = item.category || 'other';
  const profile = CATEGORY_PROFILES[category] || CATEGORY_PROFILES.other;
  
  // 1. Days until expiration factor (0-40 points)
  const daysUntilExp = getDaysUntilExpiration(item.expirationDate);
  let expirationScore = 0;
  
  if (daysUntilExp < 0) {
    // Already expired
    expirationScore = 40;
  } else if (daysUntilExp === 0) {
    // Expires today
    expirationScore = 38;
  } else if (daysUntilExp <= 1) {
    // 1 day left
    expirationScore = 35;
  } else if (daysUntilExp <= 3) {
    // 2-3 days
    expirationScore = 30;
  } else if (daysUntilExp <= 7) {
    // 4-7 days
    expirationScore = 20;
  } else if (daysUntilExp <= 14) {
    // 1-2 weeks
    expirationScore = 10;
  } else {
    // More than 2 weeks
    expirationScore = Math.max(0, 10 - (daysUntilExp - 14) / 7);
  }

  // 2. Category perishability factor (0-25 points)
  const perishabilityScore = profile.perishability * 25;

  // 3. Seasonal factor (0-15 points)
  const seasonalMultiplier = getSeasonalMultiplier(category);
  const seasonalScore = (seasonalMultiplier - 0.85) * 60; // Scale to 0-15 range
  const seasonalScoreCapped = Math.max(0, Math.min(15, seasonalScore));

  // 4. Consumption frequency factor (0-20 points)
  // Lower consumption = higher risk
  const frequencyScore = calculateConsumptionFrequency(
    item.itemName, 
    category, 
    consumptionLogs
  );
  const consumptionRiskScore = 20 - (frequencyScore * 2); // Invert: low frequency = high risk

  // 5. Quantity factor (bonus points for large quantities)
  // More items = higher waste potential
  let quantityBonus = 0;
  if (item.quantity > 5) {
    quantityBonus = Math.min(10, (item.quantity - 5) * 2);
  }

  // Calculate total risk score
  let totalRisk = expirationScore + 
                  perishabilityScore + 
                  seasonalScoreCapped + 
                  consumptionRiskScore +
                  quantityBonus;

  // Apply seasonal multiplier to final score
  totalRisk *= seasonalMultiplier;

  // Cap at 100
  totalRisk = Math.min(100, Math.round(totalRisk));

  return {
    riskScore: totalRisk,
    breakdown: {
      expirationScore: Math.round(expirationScore),
      perishabilityScore: Math.round(perishabilityScore),
      seasonalScore: Math.round(seasonalScoreCapped),
      consumptionScore: Math.round(consumptionRiskScore),
      quantityBonus: Math.round(quantityBonus),
      seasonalMultiplier: seasonalMultiplier.toFixed(2)
    },
    daysUntilExpiration: daysUntilExp,
    isExpired: daysUntilExp < 0,
    consumptionFrequency: frequencyScore
  };
};

/**
 * Generate risk level and alert message
 */
export const getRiskLevel = (riskScore) => {
  if (riskScore >= 80) {
    return {
      level: 'critical',
      color: 'red',
      priority: 1,
      alert: 'URGENT: Use immediately or discard',
      icon: '🚨'
    };
  } else if (riskScore >= 60) {
    return {
      level: 'high',
      color: 'orange',
      priority: 2,
      alert: 'High risk: Use within 1-2 days',
      icon: '⚠️'
    };
  } else if (riskScore >= 40) {
    return {
      level: 'medium',
      color: 'yellow',
      priority: 3,
      alert: 'Moderate risk: Plan to use soon',
      icon: '⚡'
    };
  } else if (riskScore >= 20) {
    return {
      level: 'low',
      color: 'blue',
      priority: 4,
      alert: 'Low risk: Monitor regularly',
      icon: '📊'
    };
  } else {
    return {
      level: 'minimal',
      color: 'green',
      priority: 5,
      alert: 'Minimal risk: Safe to store',
      icon: '✅'
    };
  }
};

/**
 * Generate actionable recommendations
 */
export const generateRecommendations = (item, riskData) => {
  const recommendations = [];
  const { riskScore, daysUntilExpiration, consumptionFrequency } = riskData;

  // Expiration-based recommendations
  if (daysUntilExpiration < 0) {
    recommendations.push({
      type: 'discard',
      priority: 'critical',
      message: `This item has expired. Discard immediately for safety.`
    });
  } else if (daysUntilExpiration <= 1) {
    recommendations.push({
      type: 'consume',
      priority: 'critical',
      message: `Consume today! Only ${daysUntilExpiration} day(s) remaining.`
    });
  } else if (daysUntilExpiration <= 3) {
    recommendations.push({
      type: 'cook',
      priority: 'high',
      message: `Cook or prepare this item within ${daysUntilExpiration} days.`
    });
  } else if (daysUntilExpiration <= 7) {
    recommendations.push({
      type: 'plan',
      priority: 'medium',
      message: `Plan meals using this item within the next week.`
    });
  }

  // Consumption pattern recommendations
  if (consumptionFrequency === 0) {
    recommendations.push({
      type: 'usage',
      priority: 'medium',
      message: `You haven't consumed this item recently. Consider incorporating it into meals.`
    });
  }

  // Category-specific recommendations
  const profile = CATEGORY_PROFILES[item.category] || CATEGORY_PROFILES.other;
  if (profile.highRisk && daysUntilExpiration <= 5) {
    recommendations.push({
      type: 'preserve',
      priority: 'medium',
      message: `Consider freezing or preserving this ${item.category} to extend shelf life.`
    });
  }

  // Quantity-based recommendations
  if (item.quantity > 5 && daysUntilExpiration <= 7) {
    recommendations.push({
      type: 'share',
      priority: 'low',
      message: `Large quantity detected. Consider sharing with friends or donating.`
    });
  }

  return recommendations;
};

/**
 * Sort items by risk score (highest first)
 */
export const sortByRisk = (itemsWithRisk) => {
  return itemsWithRisk.sort((a, b) => {
    // First sort by risk score (highest first)
    if (b.riskScore !== a.riskScore) {
      return b.riskScore - a.riskScore;
    }
    // Then by days until expiration (soonest first)
    return a.daysUntilExpiration - b.daysUntilExpiration;
  });
};

export default {
  calculateRiskScore,
  getRiskLevel,
  generateRecommendations,
  sortByRisk,
  CATEGORY_PROFILES
};
