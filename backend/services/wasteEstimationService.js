/**
 * Waste Estimation Service
 * Estimates food waste based on consumption patterns, expiration data, and category spoilage rates
 */

import { getPrice } from '../data/localPrices.js';

/**
 * Category-specific spoilage rates and waste factors
 */
const CATEGORY_WASTE_FACTORS = {
  vegetable: {
    spoilageRate: 0.25, // 25% typical waste rate
    averageWastePerItem: 150, // grams
    commonReasons: ['Wilting', 'Rot', 'Overripening']
  },
  fruit: {
    spoilageRate: 0.22,
    averageWastePerItem: 120,
    commonReasons: ['Overripening', 'Mold', 'Bruising']
  },
  protein: {
    spoilageRate: 0.18,
    averageWastePerItem: 200,
    commonReasons: ['Expiration', 'Freezer burn', 'Spoilage']
  },
  dairy: {
    spoilageRate: 0.15,
    averageWastePerItem: 180,
    commonReasons: ['Expiration', 'Souring', 'Mold']
  },
  grain: {
    spoilageRate: 0.08,
    averageWastePerItem: 100,
    commonReasons: ['Staleness', 'Pest infestation', 'Expiration']
  },
  beverage: {
    spoilageRate: 0.10,
    averageWastePerItem: 250,
    commonReasons: ['Expiration', 'Going flat', 'Taste deterioration']
  },
  snack: {
    spoilageRate: 0.12,
    averageWastePerItem: 80,
    commonReasons: ['Staleness', 'Expiration', 'Packaging damage']
  },
  other: {
    spoilageRate: 0.15,
    averageWastePerItem: 150,
    commonReasons: ['Expiration', 'Quality loss', 'Spoilage']
  }
};

/**
 * Dummy community data for comparison
 * Represents average household waste statistics
 */
const COMMUNITY_BENCHMARKS = {
  weekly: {
    grams: 2800, // Average household wastes ~2.8kg per week
    money: 25.50, // ~$25.50 per week
    itemCount: 12
  },
  monthly: {
    grams: 11200, // ~11.2kg per month
    money: 102.00, // ~$102 per month
    itemCount: 48
  },
  byCategory: {
    vegetable: { percentage: 28, grams: 3136 },
    fruit: { percentage: 22, grams: 2464 },
    protein: { percentage: 18, grams: 2016 },
    dairy: { percentage: 12, grams: 1344 },
    grain: { percentage: 8, grams: 896 },
    beverage: { percentage: 6, grams: 672 },
    snack: { percentage: 4, grams: 448 },
    other: { percentage: 2, grams: 224 }
  },
  nationalAverage: {
    weeklyGrams: 3200,
    monthlyGrams: 12800,
    weeklyMoney: 28.00,
    monthlyMoney: 112.00
  }
};

/**
 * Calculate waste from expired/spoiled items
 */
const calculateExpiredItemsWaste = (inventory, referenceDate = new Date()) => {
  let totalGrams = 0;
  let totalMoney = 0;
  let wastedItems = [];

  inventory.forEach(item => {
    const expirationDate = new Date(item.expirationDate);
    
    // Check if item is expired or will expire within the time window
    if (expirationDate < referenceDate) {
      const category = item.category || 'other';
      const wasteFactor = CATEGORY_WASTE_FACTORS[category];
      
      // Estimate waste amount (quantity × average waste per item)
      const estimatedGrams = item.quantity * wasteFactor.averageWastePerItem;
      
      // Estimate money value
      const priceData = getPrice(item.itemName);
      const estimatedPrice = priceData?.price || 3.00; // Default $3 if not found
      const estimatedMoney = item.quantity * estimatedPrice;

      totalGrams += estimatedGrams;
      totalMoney += estimatedMoney;

      wastedItems.push({
        itemName: item.itemName,
        category: category,
        quantity: item.quantity,
        grams: estimatedGrams,
        money: estimatedMoney,
        expirationDate: item.expirationDate,
        daysExpired: Math.floor((referenceDate - expirationDate) / (1000 * 60 * 60 * 24)),
        reason: wasteFactor.commonReasons[0]
      });
    }
  });

  return { totalGrams, totalMoney, wastedItems };
};

/**
 * Calculate predicted waste from high-risk items (not yet expired but likely to be wasted)
 */
const calculatePredictedWaste = (inventory, consumptionLogs, riskThreshold = 60) => {
  let totalGrams = 0;
  let totalMoney = 0;
  let predictedWasteItems = [];

  // Calculate consumption frequency for each item
  const consumptionFrequency = {};
  consumptionLogs.forEach(log => {
    const itemName = log.foodName || log.itemName;
    if (!consumptionFrequency[itemName]) {
      consumptionFrequency[itemName] = 0;
    }
    consumptionFrequency[itemName]++;
  });

  inventory.forEach(item => {
    const category = item.category || 'other';
    const wasteFactor = CATEGORY_WASTE_FACTORS[category];
    const expirationDate = new Date(item.expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.floor((expirationDate - today) / (1000 * 60 * 60 * 24));
    
    // Calculate simple risk score
    const frequency = consumptionFrequency[item.itemName] || 0;
    let riskScore = 0;
    
    // Expiration proximity (0-40 points)
    if (daysUntilExpiration <= 0) riskScore += 40;
    else if (daysUntilExpiration <= 3) riskScore += 35;
    else if (daysUntilExpiration <= 7) riskScore += 25;
    else if (daysUntilExpiration <= 14) riskScore += 15;
    else riskScore += 5;
    
    // Perishability (0-30 points)
    riskScore += wasteFactor.spoilageRate * 100 * 0.3;
    
    // Consumption frequency (0-30 points) - inverse relationship
    const frequencyScore = Math.max(0, 30 - (frequency * 3));
    riskScore += frequencyScore;
    
    // Items with risk score above threshold are predicted waste
    if (riskScore >= riskThreshold && daysUntilExpiration > 0) {
      // Estimate 60% probability they'll be wasted
      const wasteProbability = 0.6;
      const estimatedGrams = item.quantity * wasteFactor.averageWastePerItem * wasteProbability;
      
      const priceData = getPrice(item.itemName);
      const estimatedPrice = priceData?.price || 3.00;
      const estimatedMoney = item.quantity * estimatedPrice * wasteProbability;

      totalGrams += estimatedGrams;
      totalMoney += estimatedMoney;

      predictedWasteItems.push({
        itemName: item.itemName,
        category: category,
        quantity: item.quantity,
        grams: estimatedGrams,
        money: estimatedMoney,
        daysUntilExpiration: daysUntilExpiration,
        riskScore: Math.round(riskScore),
        wasteProbability: Math.round(wasteProbability * 100),
        reason: `Low consumption (${frequency}x) + expiring soon`
      });
    }
  });

  return { totalGrams, totalMoney, predictedWasteItems };
};

/**
 * Calculate category-wise waste breakdown
 */
const calculateCategoryBreakdown = (wastedItems, predictedWasteItems) => {
  const breakdown = {};

  // Initialize all categories
  Object.keys(CATEGORY_WASTE_FACTORS).forEach(category => {
    breakdown[category] = {
      grams: 0,
      money: 0,
      itemCount: 0,
      percentage: 0
    };
  });

  // Add actual waste
  wastedItems.forEach(item => {
    const category = item.category || 'other';
    breakdown[category].grams += item.grams;
    breakdown[category].money += item.money;
    breakdown[category].itemCount += item.quantity;
  });

  // Add predicted waste
  predictedWasteItems.forEach(item => {
    const category = item.category || 'other';
    breakdown[category].grams += item.grams;
    breakdown[category].money += item.money;
    breakdown[category].itemCount += item.quantity;
  });

  // Calculate percentages
  const totalGrams = Object.values(breakdown).reduce((sum, cat) => sum + cat.grams, 0);
  Object.keys(breakdown).forEach(category => {
    breakdown[category].percentage = totalGrams > 0 
      ? Math.round((breakdown[category].grams / totalGrams) * 100) 
      : 0;
  });

  return breakdown;
};

/**
 * Compare user performance to community benchmarks
 */
const compareToCommunity = (weeklyWaste, monthlyWaste) => {
  const weeklyComparison = {
    grams: {
      user: weeklyWaste.grams,
      community: COMMUNITY_BENCHMARKS.weekly.grams,
      difference: weeklyWaste.grams - COMMUNITY_BENCHMARKS.weekly.grams,
      percentageDiff: Math.round(((weeklyWaste.grams - COMMUNITY_BENCHMARKS.weekly.grams) / COMMUNITY_BENCHMARKS.weekly.grams) * 100),
      performance: weeklyWaste.grams < COMMUNITY_BENCHMARKS.weekly.grams ? 'better' : 'worse'
    },
    money: {
      user: weeklyWaste.money,
      community: COMMUNITY_BENCHMARKS.weekly.money,
      difference: weeklyWaste.money - COMMUNITY_BENCHMARKS.weekly.money,
      percentageDiff: Math.round(((weeklyWaste.money - COMMUNITY_BENCHMARKS.weekly.money) / COMMUNITY_BENCHMARKS.weekly.money) * 100),
      performance: weeklyWaste.money < COMMUNITY_BENCHMARKS.weekly.money ? 'better' : 'worse'
    }
  };

  const monthlyComparison = {
    grams: {
      user: monthlyWaste.grams,
      community: COMMUNITY_BENCHMARKS.monthly.grams,
      difference: monthlyWaste.grams - COMMUNITY_BENCHMARKS.monthly.grams,
      percentageDiff: Math.round(((monthlyWaste.grams - COMMUNITY_BENCHMARKS.monthly.grams) / COMMUNITY_BENCHMARKS.monthly.grams) * 100),
      performance: monthlyWaste.grams < COMMUNITY_BENCHMARKS.monthly.grams ? 'better' : 'worse'
    },
    money: {
      user: monthlyWaste.money,
      community: COMMUNITY_BENCHMARKS.monthly.money,
      difference: monthlyWaste.money - COMMUNITY_BENCHMARKS.monthly.money,
      percentageDiff: Math.round(((monthlyWaste.money - COMMUNITY_BENCHMARKS.monthly.money) / COMMUNITY_BENCHMARKS.monthly.money) * 100),
      performance: monthlyWaste.money < COMMUNITY_BENCHMARKS.monthly.money ? 'better' : 'worse'
    }
  };

  // Generate performance message
  let performanceRating;
  let performanceMessage;
  const avgPercentDiff = (weeklyComparison.grams.percentageDiff + weeklyComparison.money.percentageDiff) / 2;

  if (avgPercentDiff <= -50) {
    performanceRating = 'excellent';
    performanceMessage = '🌟 Excellent! You\'re wasting significantly less than average households.';
  } else if (avgPercentDiff <= -20) {
    performanceRating = 'good';
    performanceMessage = '✅ Good job! You\'re wasting less than most households.';
  } else if (avgPercentDiff <= 10) {
    performanceRating = 'average';
    performanceMessage = '📊 You\'re close to community average. Room for improvement!';
  } else if (avgPercentDiff <= 30) {
    performanceRating = 'below-average';
    performanceMessage = '⚠️ You\'re wasting more than average. Consider our recommendations.';
  } else {
    performanceRating = 'needs-improvement';
    performanceMessage = '🚨 Significant waste detected. Use our AI tools to reduce waste!';
  }

  return {
    weekly: weeklyComparison,
    monthly: monthlyComparison,
    performanceRating,
    performanceMessage,
    ranking: generateRanking(avgPercentDiff),
    nationalAverage: COMMUNITY_BENCHMARKS.nationalAverage
  };
};

/**
 * Generate user ranking based on performance
 */
const generateRanking = (percentDiff) => {
  if (percentDiff <= -50) return { percentile: 95, message: 'Top 5% - Exceptional waste management!' };
  if (percentDiff <= -30) return { percentile: 85, message: 'Top 15% - Great waste reduction!' };
  if (percentDiff <= -10) return { percentile: 70, message: 'Top 30% - Above average performance!' };
  if (percentDiff <= 10) return { percentile: 50, message: 'Average - You\'re doing okay!' };
  if (percentDiff <= 30) return { percentile: 30, message: 'Bottom 30% - Needs improvement' };
  return { percentile: 10, message: 'Bottom 10% - Urgent action needed' };
};

/**
 * Generate waste reduction recommendations
 */
const generateRecommendations = (categoryBreakdown, communityComparison) => {
  const recommendations = [];

  // Category-specific recommendations
  const sortedCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1].grams - a[1].grams)
    .slice(0, 3);

  sortedCategories.forEach(([category, data]) => {
    if (data.grams > 0) {
      const wasteFactor = CATEGORY_WASTE_FACTORS[category];
      recommendations.push({
        category: category,
        priority: 'high',
        issue: `High waste in ${category} (${data.grams.toFixed(0)}g, $${data.money.toFixed(2)})`,
        suggestion: `Common causes: ${wasteFactor.commonReasons.join(', ')}. Use our Meal Planner to consume ${category} items faster.`,
        potentialSavings: data.money
      });
    }
  });

  // Performance-based recommendations
  if (communityComparison.performanceRating === 'needs-improvement' || 
      communityComparison.performanceRating === 'below-average') {
    recommendations.push({
      category: 'general',
      priority: 'high',
      issue: 'Above-average waste levels',
      suggestion: 'Use our Expiration Risk predictions to identify at-risk items. Enable notifications for items expiring soon.',
      potentialSavings: Math.abs(communityComparison.weekly.money.difference) * 4 // Monthly savings
    });
  }

  // Add specific action items
  recommendations.push({
    category: 'general',
    priority: 'medium',
    issue: 'Optimize meal planning',
    suggestion: 'Use AI Meal Optimizer to create plans based on your inventory. This reduces over-purchasing.',
    potentialSavings: communityComparison.monthly.money.user * 0.2 // Potential 20% reduction
  });

  recommendations.push({
    category: 'general',
    priority: 'medium',
    issue: 'Monitor high-risk items',
    suggestion: 'Check Expiration Risk page daily. Prioritize consuming critical and high-risk items.',
    potentialSavings: communityComparison.monthly.money.user * 0.15
  });

  return recommendations.slice(0, 5); // Top 5 recommendations
};

/**
 * Main function: Estimate waste for a user
 */
export const estimateWaste = (inventory, consumptionLogs) => {
  const now = new Date();
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  // Calculate actual waste from expired items
  const weeklyExpired = calculateExpiredItemsWaste(
    inventory.filter(item => new Date(item.expirationDate) >= oneWeekAgo)
  );
  
  const monthlyExpired = calculateExpiredItemsWaste(
    inventory.filter(item => new Date(item.expirationDate) >= oneMonthAgo)
  );

  // Calculate predicted waste from high-risk items
  const weeklyPredicted = calculatePredictedWaste(
    inventory,
    consumptionLogs.filter(log => new Date(log.date) >= oneWeekAgo),
    65 // Higher threshold for weekly (more conservative)
  );

  const monthlyPredicted = calculatePredictedWaste(
    inventory,
    consumptionLogs.filter(log => new Date(log.date) >= oneMonthAgo),
    60 // Standard threshold for monthly
  );

  // Combine actual + predicted waste
  const weeklyWaste = {
    grams: Math.round(weeklyExpired.totalGrams + weeklyPredicted.totalGrams),
    money: parseFloat((weeklyExpired.totalMoney + weeklyPredicted.totalMoney).toFixed(2)),
    itemCount: weeklyExpired.wastedItems.length + weeklyPredicted.predictedWasteItems.length,
    actual: {
      grams: Math.round(weeklyExpired.totalGrams),
      money: parseFloat(weeklyExpired.totalMoney.toFixed(2)),
      items: weeklyExpired.wastedItems
    },
    predicted: {
      grams: Math.round(weeklyPredicted.totalGrams),
      money: parseFloat(weeklyPredicted.totalMoney.toFixed(2)),
      items: weeklyPredicted.predictedWasteItems
    }
  };

  const monthlyWaste = {
    grams: Math.round(monthlyExpired.totalGrams + monthlyPredicted.totalGrams),
    money: parseFloat((monthlyExpired.totalMoney + monthlyPredicted.totalMoney).toFixed(2)),
    itemCount: monthlyExpired.wastedItems.length + monthlyPredicted.predictedWasteItems.length,
    actual: {
      grams: Math.round(monthlyExpired.totalGrams),
      money: parseFloat(monthlyExpired.totalMoney.toFixed(2)),
      items: monthlyExpired.wastedItems
    },
    predicted: {
      grams: Math.round(monthlyPredicted.totalGrams),
      money: parseFloat(monthlyPredicted.totalMoney.toFixed(2)),
      items: monthlyPredicted.predictedWasteItems
    }
  };

  // Category breakdown
  const categoryBreakdown = calculateCategoryBreakdown(
    [...weeklyExpired.wastedItems, ...monthlyExpired.wastedItems],
    [...weeklyPredicted.predictedWasteItems, ...monthlyPredicted.predictedWasteItems]
  );

  // Community comparison
  const communityComparison = compareToCommunity(weeklyWaste, monthlyWaste);

  // Recommendations
  const recommendations = generateRecommendations(categoryBreakdown, communityComparison);

  return {
    weeklyWaste,
    monthlyWaste,
    categoryBreakdown,
    communityComparison,
    recommendations,
    metadata: {
      analyzedAt: now,
      inventoryItemsAnalyzed: inventory.length,
      consumptionLogsAnalyzed: consumptionLogs.length,
      timeRange: '30 days'
    }
  };
};

export default {
  estimateWaste,
  CATEGORY_WASTE_FACTORS,
  COMMUNITY_BENCHMARKS
};
