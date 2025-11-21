import ConsumptionLog from '../models/ConsumptionLog.js';
import InventoryItem from '../models/InventoryItem.js';

/**
 * AI Consumption Pattern Analyzer
 * Analyzes user consumption patterns and predicts waste risk
 */
export const analyzeConsumption = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all consumption logs for the user
    const logs = await ConsumptionLog.find({ userId }).sort({ date: -1 }).lean();

    // Fetch current inventory items
    const inventoryItems = await InventoryItem.find({ userId }).lean();

    // Default response if no data
    if (logs.length === 0) {
      return res.json({
        weeklyTrends: {},
        categoryTotals: {},
        flags: {
          overConsumption: [],
          underConsumption: []
        },
        wastePrediction: [],
        message: 'No consumption data available yet. Start logging your meals!'
      });
    }

    // 1. GROUP LOGS BY WEEKDAY → weeklyTrends
    const weeklyTrends = {};
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Initialize weekdays
    weekdays.forEach(day => {
      weeklyTrends[day] = { count: 0, quantity: 0 };
    });

    logs.forEach(log => {
      const dayOfWeek = weekdays[new Date(log.date).getDay()];
      weeklyTrends[dayOfWeek].count += 1;
      weeklyTrends[dayOfWeek].quantity += log.quantity || 0;
    });

    // 2. COMPUTE TOTAL CONSUMPTION PER CATEGORY → categoryTotals
    const categoryTotals = {};
    const categoryFrequency = {}; // Track frequency for waste prediction

    logs.forEach(log => {
      if (!categoryTotals[log.category]) {
        categoryTotals[log.category] = 0;
        categoryFrequency[log.category] = 0;
      }
      categoryTotals[log.category] += log.quantity || 0;
      categoryFrequency[log.category] += 1;
    });

    // 3. DETECT OVER/UNDER CONSUMPTION
    const categories = Object.keys(categoryTotals);
    const totalConsumption = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    const averagePerCategory = totalConsumption / (categories.length || 1);

    const flags = {
      overConsumption: [],
      underConsumption: [],
      imbalancedPatterns: []
    };

    categories.forEach(category => {
      const categoryTotal = categoryTotals[category];
      const percentageOfAverage = (categoryTotal / averagePerCategory) * 100;

      if (percentageOfAverage > 130) {
        flags.overConsumption.push({
          category,
          total: categoryTotal,
          average: averagePerCategory,
          percentage: percentageOfAverage.toFixed(1)
        });
      } else if (percentageOfAverage < 60 && percentageOfAverage > 0) {
        flags.underConsumption.push({
          category,
          total: categoryTotal,
          average: averagePerCategory,
          percentage: percentageOfAverage.toFixed(1)
        });
      }
    });

    // Detect imbalanced dietary patterns
    const nutritionTargets = {
      vegetable: { min: 5, optimal: 10, message: 'Low vegetable intake - aim for 5+ servings/day' },
      fruit: { min: 3, optimal: 5, message: 'Low fruit consumption - aim for 3+ servings/day' },
      protein: { min: 4, optimal: 6, message: 'Insufficient protein - aim for 4+ servings/day' },
      dairy: { min: 2, optimal: 3, message: 'Low dairy intake - consider 2+ servings/day' },
      grain: { min: 4, optimal: 6, message: 'Low whole grains - aim for 4+ servings/day' }
    };

    Object.entries(nutritionTargets).forEach(([category, targets]) => {
      const categoryConsumption = categoryFrequency[category] || 0;
      const dailyAverage = categoryConsumption / 7; // Average per day over a week

      if (dailyAverage < targets.min) {
        flags.imbalancedPatterns.push({
          category,
          currentDaily: dailyAverage.toFixed(1),
          targetMin: targets.min,
          targetOptimal: targets.optimal,
          deficitPercent: (((targets.min - dailyAverage) / targets.min) * 100).toFixed(1),
          severity: dailyAverage < targets.min * 0.5 ? 'critical' : 'moderate',
          recommendation: targets.message
        });
      }
    });

    // 4. PREDICT WASTE RISK
    const wastePrediction = [];

    inventoryItems.forEach(item => {
      let riskScore = 0;
      const reasons = [];

      // Calculate days until expiration
      const today = new Date();
      const expirationDate = new Date(item.expirationDate);
      const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

      // Check if category is historically under-consumed
      const categoryFreq = categoryFrequency[item.category] || 0;
      const avgFrequency = Object.values(categoryFrequency).reduce((a, b) => a + b, 0) / (categories.length || 1);
      const isUnderConsumed = flags.underConsumption.some(flag => flag.category === item.category);

      // Risk Factor 1: Low usage frequency AND expires soon
      if (categoryFreq < avgFrequency * 0.7 && daysUntilExpiration <= 7 && daysUntilExpiration > 0) {
        riskScore += 50;
        reasons.push('Low usage frequency with near expiration');
      }

      // Risk Factor 2: Category historically under-consumed
      if (isUnderConsumed) {
        riskScore += 20;
        reasons.push('Category is under-consumed');
      }

      // Risk Factor 3: Already expired
      if (daysUntilExpiration < 0) {
        riskScore += 80;
        reasons.push('Already expired');
      }

      // Risk Factor 4: Expires within 3 days
      if (daysUntilExpiration >= 0 && daysUntilExpiration <= 3) {
        riskScore += 30;
        reasons.push(`Expires in ${daysUntilExpiration} day(s)`);
      }

      // Risk Factor 5: Large quantity with low consumption
      if (item.quantity > 5 && categoryFreq < 3) {
        riskScore += 15;
        reasons.push('Large quantity with low consumption rate');
      }

      // Only include items with risk score > 0
      if (riskScore > 0) {
        wastePrediction.push({
          itemId: item._id,
          itemName: item.itemName,
          category: item.category,
          quantity: item.quantity,
          daysUntilExpiration,
          expirationDate: item.expirationDate,
          riskScore,
          reasons,
          recommendation: getRiskRecommendation(riskScore, daysUntilExpiration)
        });
      }
    });

    // Sort by risk score (highest first)
    wastePrediction.sort((a, b) => b.riskScore - a.riskScore);

    // 5. GENERATE HEATMAP DATA INSIGHTS
    const heatmapData = generateHeatmapInsights(logs, weeklyTrends, categoryTotals);

    // 6. RETURN COMPREHENSIVE ANALYSIS
    res.json({
      weeklyTrends,
      categoryTotals,
      flags,
      wastePrediction,
      heatmapData,
      summary: {
        totalLogs: logs.length,
        totalCategories: categories.length,
        totalInventoryItems: inventoryItems.length,
        highRiskItems: wastePrediction.filter(item => item.riskScore >= 50).length,
        imbalancedCategories: flags.imbalancedPatterns.length,
        analyzedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      message: 'Failed to analyze consumption patterns', 
      error: error.message 
    });
  }
};

/**
 * Helper function to generate recommendations based on risk score
 */
const getRiskRecommendation = (riskScore, daysUntilExpiration) => {
  if (riskScore >= 80) {
    return 'URGENT: Consume immediately or discard if expired';
  } else if (riskScore >= 50) {
    return 'HIGH PRIORITY: Plan to use within next meal or freeze';
  } else if (riskScore >= 30) {
    return 'MODERATE: Consider using soon or incorporating into recipes';
  } else if (riskScore >= 15) {
    return 'LOW: Monitor and plan usage within the week';
  }
  return 'Normal consumption pattern';
};

/**
 * Get consumption trends over time
 */
export const getConsumptionTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await ConsumptionLog.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            category: '$category'
          },
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    res.json({
      trends: logs,
      period: `${days} days`,
      startDate,
      endDate: new Date()
    });

  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ 
      message: 'Failed to get consumption trends', 
      error: error.message 
    });
  }
};

/**
 * Get category statistics
 */
export const getCategoryStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await ConsumptionLog.aggregate([
      {
        $match: { userId: userId }
      },
      {
        $group: {
          _id: '$category',
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 },
          averageQuantity: { $avg: '$quantity' }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      }
    ]);

    res.json({
      stats,
      totalCategories: stats.length
    });

  } catch (error) {
    console.error('Category stats error:', error);
    res.status(500).json({ 
      message: 'Failed to get category statistics', 
      error: error.message 
    });
  }
};

/**
 * Generate heatmap-style data insights
 * Shows consumption intensity across days and categories
 */
const generateHeatmapInsights = (logs, weeklyTrends, categoryTotals) => {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const categories = Object.keys(categoryTotals);
  
  // Initialize heatmap matrix: days x categories
  const matrix = {};
  weekdays.forEach(day => {
    matrix[day] = {};
    categories.forEach(category => {
      matrix[day][category] = 0;
    });
  });

  // Populate matrix with actual consumption data
  logs.forEach(log => {
    const dayOfWeek = weekdays[new Date(log.date).getDay()];
    const category = log.category;
    if (matrix[dayOfWeek] && matrix[dayOfWeek][category] !== undefined) {
      matrix[dayOfWeek][category] += log.quantity || 1;
    }
  });

  // Calculate intensity levels (0-100 scale)
  const maxConsumption = Math.max(
    ...Object.values(matrix).flatMap(day => Object.values(day))
  );

  const intensityMatrix = {};
  Object.entries(matrix).forEach(([day, categories]) => {
    intensityMatrix[day] = {};
    Object.entries(categories).forEach(([category, value]) => {
      intensityMatrix[day][category] = {
        value,
        intensity: maxConsumption > 0 ? Math.round((value / maxConsumption) * 100) : 0,
        level: getIntensityLevel(value, maxConsumption)
      };
    });
  });

  // Generate insights from heatmap patterns
  const insights = analyzeHeatmapPatterns(matrix, weekdays, categories);

  return {
    matrix: intensityMatrix,
    insights,
    metadata: {
      weekdays,
      categories,
      maxConsumption,
      generatedAt: new Date()
    }
  };
};

/**
 * Get intensity level description
 */
const getIntensityLevel = (value, max) => {
  if (max === 0) return 'none';
  const percentage = (value / max) * 100;
  
  if (percentage === 0) return 'none';
  if (percentage < 25) return 'low';
  if (percentage < 50) return 'moderate';
  if (percentage < 75) return 'high';
  return 'very-high';
};

/**
 * Analyze heatmap patterns for insights
 */
const analyzeHeatmapPatterns = (matrix, weekdays, categories) => {
  const insights = [];

  // 1. Identify peak consumption days
  const dailyTotals = weekdays.map(day => ({
    day,
    total: Object.values(matrix[day]).reduce((sum, val) => sum + val, 0)
  }));
  
  const maxDayTotal = Math.max(...dailyTotals.map(d => d.total));
  const peakDays = dailyTotals.filter(d => d.total === maxDayTotal).map(d => d.day);
  
  if (peakDays.length > 0 && maxDayTotal > 0) {
    insights.push({
      type: 'peak-consumption',
      severity: 'info',
      title: 'Peak Consumption Days',
      description: `Highest consumption on ${peakDays.join(', ')} with ${maxDayTotal.toFixed(1)} total servings`,
      recommendation: 'Plan grocery shopping before these days'
    });
  }

  // 2. Identify consumption gaps (days with very low activity)
  const lowConsumptionDays = dailyTotals
    .filter(d => d.total < maxDayTotal * 0.3 && d.total > 0)
    .map(d => d.day);
  
  if (lowConsumptionDays.length > 0) {
    insights.push({
      type: 'low-activity',
      severity: 'warning',
      title: 'Low Consumption Days',
      description: `Minimal eating on ${lowConsumptionDays.join(', ')}`,
      recommendation: 'Consider meal prepping to ensure consistent nutrition'
    });
  }

  // 3. Category concentration patterns
  categories.forEach(category => {
    const categoryByDay = weekdays.map(day => matrix[day][category]);
    const totalCategory = categoryByDay.reduce((sum, val) => sum + val, 0);
    const avgCategory = totalCategory / 7;
    
    // Find days with spike in this category
    const spikeDays = weekdays.filter((day, idx) => 
      categoryByDay[idx] > avgCategory * 2 && categoryByDay[idx] > 0
    );
    
    if (spikeDays.length > 0) {
      insights.push({
        type: 'category-spike',
        severity: 'info',
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Concentration`,
        description: `Heavy ${category} consumption on ${spikeDays.join(', ')}`,
        recommendation: `Distribute ${category} intake more evenly throughout the week`
      });
    }

    // Find days with zero consumption of essential categories
    const essentialCategories = ['vegetable', 'fruit', 'protein'];
    if (essentialCategories.includes(category)) {
      const zeroDays = weekdays.filter((day, idx) => categoryByDay[idx] === 0);
      
      if (zeroDays.length >= 3) {
        insights.push({
          type: 'missing-essential',
          severity: 'critical',
          title: `Missing ${category.charAt(0).toUpperCase() + category.slice(1)}`,
          description: `No ${category} consumed on ${zeroDays.length} days: ${zeroDays.slice(0, 3).join(', ')}`,
          recommendation: `Add ${category} to daily meals - essential for balanced nutrition`
        });
      }
    }
  });

  // 4. Weekend vs Weekday patterns
  const weekendDays = ['Saturday', 'Sunday'];
  const weekdayDays = weekdays.filter(d => !weekendDays.includes(d));
  
  const weekendTotal = weekendDays.reduce((sum, day) => 
    sum + Object.values(matrix[day]).reduce((s, v) => s + v, 0), 0
  );
  const weekdayTotal = weekdayDays.reduce((sum, day) => 
    sum + Object.values(matrix[day]).reduce((s, v) => s + v, 0), 0
  );
  
  const weekendAvg = weekendTotal / weekendDays.length;
  const weekdayAvg = weekdayTotal / weekdayDays.length;
  
  if (weekendAvg > weekdayAvg * 1.5) {
    insights.push({
      type: 'weekend-pattern',
      severity: 'info',
      title: 'Weekend Eating Pattern',
      description: `${((weekendAvg / weekdayAvg - 1) * 100).toFixed(0)}% more consumption on weekends`,
      recommendation: 'Balance weekend indulgence with lighter weekday meals'
    });
  } else if (weekdayAvg > weekendAvg * 1.5) {
    insights.push({
      type: 'weekday-pattern',
      severity: 'info',
      title: 'Weekday Eating Pattern',
      description: `${((weekdayAvg / weekendAvg - 1) * 100).toFixed(0)}% more consumption on weekdays`,
      recommendation: 'Ensure adequate weekend nutrition and meal planning'
    });
  }

  return insights;
};
