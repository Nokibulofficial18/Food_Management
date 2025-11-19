import ConsumptionLog from '../models/ConsumptionLog.js';
import InventoryItem from '../models/InventoryItem.js';
import Resource from '../models/Resource.js';

// @desc    Get summary/dashboard data
// @route   GET /api/summary
// @access  Private
export const getSummary = async (req, res) => {
  try {
    const userId = req.userId;

    // Get inventory counts and stats
    const inventoryItems = await InventoryItem.find({ userId });
    const totalInventoryItems = inventoryItems.length;
    const expiredItems = inventoryItems.filter(item => item.expirationDate < new Date()).length;
    const expiringSoon = inventoryItems.filter(item => {
      const daysUntilExpiration = Math.ceil((item.expirationDate - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiration > 0 && daysUntilExpiration <= 3;
    }).length;

    // Get inventory by category
    const inventoryByCategory = {};
    inventoryItems.forEach(item => {
      inventoryByCategory[item.category] = (inventoryByCategory[item.category] || 0) + 1;
    });

    // Get recent consumption logs (last 10)
    const recentLogs = await ConsumptionLog.find({ userId })
      .sort({ date: -1 })
      .limit(10);

    // Get consumption by category from recent logs
    const consumptionByCategory = {};
    const allRecentLogs = await ConsumptionLog.find({ userId })
      .sort({ date: -1 })
      .limit(50);
    
    allRecentLogs.forEach(log => {
      consumptionByCategory[log.category] = (consumptionByCategory[log.category] || 0) + log.quantity;
    });

    // Find top consumed categories
    const topCategories = Object.entries(consumptionByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    // Get recommended resources based on consumption patterns
    let recommendedResources = [];
    let explanation = '';

    if (topCategories.length > 0) {
      recommendedResources = await Resource.find({
        relatedCategory: { $in: [...topCategories, 'general'] }
      }).limit(5);

      const categoriesText = topCategories.join(', ');
      explanation = `Recommended because you recently logged items in these categories: ${categoriesText}. These resources can help you reduce waste and improve sustainability.`;
    } else {
      recommendedResources = await Resource.find({ relatedCategory: 'general' }).limit(5);
      explanation = 'General sustainability resources to help you get started with food management.';
    }

    res.json({
      inventory: {
        total: totalInventoryItems,
        expired: expiredItems,
        expiringSoon: expiringSoon,
        byCategory: inventoryByCategory
      },
      consumption: {
        recentLogs,
        byCategory: consumptionByCategory,
        topCategories
      },
      recommendedResources: {
        resources: recommendedResources,
        explanation
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Error fetching summary', error: error.message });
  }
};
