import InventoryItem from '../models/InventoryItem.js';
import FoodItem from '../models/FoodItem.js';
import { generateMealSuggestions, optimizeMealPlan as llmOptimize } from '../services/llmService.js';
import { getPrice, getCheaperAlternatives, calculateNutrition } from '../data/localPrices.js';

/**
 * Nutrition rules for meal planning
 */
const NUTRITION_RULES = {
  dailyTargets: {
    calories: { min: 1800, max: 2400, optimal: 2000 },
    protein: { min: 50, max: 150, optimal: 80 }, // grams
    carbs: { min: 200, max: 350, optimal: 250 }, // grams
    fat: { min: 40, max: 90, optimal: 65 } // grams
  },
  mealDistribution: {
    breakfast: 0.25, // 25% of daily calories
    lunch: 0.35,     // 35% of daily calories
    dinner: 0.35,    // 35% of daily calories
    snack: 0.05      // 5% of daily calories
  }
};

/**
 * @desc    Generate optimized 7-day meal plan
 * @route   POST /api/ai/meal-optimize
 * @access  Private
 */
export const optimizeMealPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { budget = 100, preferences = {} } = req.body;

    // 1. Fetch user's current inventory
    const inventory = await InventoryItem.find({ userId }).lean();
    
    // 2. Fetch seeded food items from database
    const seededFoods = await FoodItem.find().limit(50).lean();

    // 3. Get user dietary preferences
    const userProfile = await req.user;
    const dietaryPreferences = userProfile.dietaryPreferences || [];

    // 4. Generate meal suggestions using LLM service
    const context = {
      budget,
      inventory,
      dietaryPreferences,
      daysRequired: 7
    };

    const mealSuggestions = await generateMealSuggestions(context);

    // 5. Build 7-day meal plan using rule-based engine
    const weeklyMealPlan = generateWeeklyPlan(
      mealSuggestions,
      inventory,
      budget,
      dietaryPreferences
    );

    // 6. Calculate shopping list
    const shoppingList = calculateShoppingList(
      weeklyMealPlan,
      inventory,
      budget
    );

    // 7. Calculate nutritional summary
    const nutritionalSummary = calculateNutritionalSummary(weeklyMealPlan);

    // 8. Generate cost breakdown
    const costBreakdown = calculateCostBreakdown(shoppingList);

    res.json({
      weeklyMealPlan,
      shoppingList,
      nutritionalSummary,
      costBreakdown,
      metadata: {
        totalBudget: budget,
        estimatedSpend: costBreakdown.total,
        budgetRemaining: budget - costBreakdown.total,
        wasteReduction: calculateWasteReduction(inventory, weeklyMealPlan),
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Meal optimization error:', error);
    res.status(500).json({ 
      message: 'Failed to optimize meal plan', 
      error: error.message 
    });
  }
};

/**
 * Generate 7-day meal plan
 */
const generateWeeklyPlan = (mealSuggestions, inventory, budget, dietaryPreferences) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weeklyPlan = {};
  
  const dailyBudget = budget / 7;
  const { suggestions } = mealSuggestions;

  days.forEach((day, index) => {
    const dayPlan = {
      date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      meals: {}
    };

    // Assign breakfast, lunch, dinner
    suggestions.forEach(mealType => {
      const availableOptions = mealType.options.filter(meal => 
        meal.cost <= dailyBudget * NUTRITION_RULES.mealDistribution[mealType.type]
      );

      if (availableOptions.length > 0) {
        // Rotate options to add variety
        const selectedMeal = availableOptions[index % availableOptions.length];
        
        // Check if we can use inventory items
        const inventoryMatches = findInventoryMatches(selectedMeal, inventory);
        
        dayPlan.meals[mealType.type] = {
          ...selectedMeal,
          usesInventory: inventoryMatches,
          adjustedCost: calculateAdjustedCost(selectedMeal, inventoryMatches)
        };
      }
    });

    weeklyPlan[day] = dayPlan;
  });

  return weeklyPlan;
};

/**
 * Find inventory items that match meal ingredients
 */
const findInventoryMatches = (meal, inventory) => {
  const matches = [];
  
  meal.ingredients.forEach(ingredientCategory => {
    const inventoryMatch = inventory.find(item => 
      item.category === ingredientCategory && 
      new Date(item.expirationDate) > new Date() &&
      item.quantity > 0
    );
    
    if (inventoryMatch) {
      matches.push({
        itemId: inventoryMatch._id,
        itemName: inventoryMatch.itemName,
        category: inventoryMatch.category,
        availableQuantity: inventoryMatch.quantity,
        daysUntilExpiration: Math.ceil(
          (new Date(inventoryMatch.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)
        )
      });
    }
  });
  
  return matches;
};

/**
 * Calculate adjusted cost after using inventory
 */
const calculateAdjustedCost = (meal, inventoryMatches) => {
  const inventoryValue = inventoryMatches.length * 2; // Estimate $2 per inventory item used
  return Math.max(0, meal.cost - inventoryValue);
};

/**
 * Calculate shopping list with estimated costs
 */
const calculateShoppingList = (weeklyPlan, inventory, budget) => {
  const requiredItems = {};
  const inventoryItemIds = new Set(inventory.map(item => item.itemName.toLowerCase()));

  // Collect all required ingredients from meal plan
  Object.values(weeklyPlan).forEach(day => {
    Object.values(day.meals).forEach(meal => {
      meal.ingredients.forEach(ingredient => {
        // Skip if already in inventory
        const hasInInventory = meal.usesInventory?.some(
          inv => inv.category === ingredient
        );
        
        if (!hasInInventory) {
          if (!requiredItems[ingredient]) {
            requiredItems[ingredient] = {
              category: ingredient,
              quantity: 0,
              estimatedCost: 0,
              mealsUsedIn: []
            };
          }
          requiredItems[ingredient].quantity += 1;
          requiredItems[ingredient].mealsUsedIn.push(meal.name);
        }
      });
    });
  });

  // Convert to detailed shopping list with prices and alternatives
  const shoppingList = Object.entries(requiredItems).map(([category, data]) => {
    // Find a representative item for this category
    const sampleItem = getSampleItemForCategory(category);
    const priceInfo = getPrice(sampleItem);
    const basePrice = priceInfo.price;
    const estimatedCost = basePrice * data.quantity;
    
    // Get cheaper alternatives from local price data
    const alternatives = getCheaperAlternatives(sampleItem, budget / 5);
    
    // Calculate potential savings if using cheapest alternative
    let potentialSavings = 0;
    let recommendedAlternative = null;
    
    if (alternatives.length > 0) {
      const cheapest = alternatives[0];
      potentialSavings = (basePrice - cheapest.price) * data.quantity;
      recommendedAlternative = {
        name: cheapest.name,
        price: cheapest.price,
        unit: cheapest.unit,
        totalCost: (cheapest.price * data.quantity).toFixed(2),
        savings: potentialSavings.toFixed(2),
        savingsPercent: cheapest.savings,
        nutrition: cheapest.nutrition,
        reason: `Save $${potentialSavings.toFixed(2)} by switching to ${cheapest.name}`
      };
    }

    return {
      item: sampleItem,
      category,
      quantity: data.quantity,
      unit: priceInfo.unit,
      pricePerUnit: parseFloat(basePrice.toFixed(2)),
      estimatedCost: parseFloat(estimatedCost.toFixed(2)),
      mealsUsedIn: [...new Set(data.mealsUsedIn)].slice(0, 3), // Unique meals, max 3
      potentialSavings: parseFloat(potentialSavings.toFixed(2)),
      recommendedAlternative,
      alternatives: alternatives.slice(0, 5).map(alt => ({
        name: alt.name,
        price: parseFloat(alt.price.toFixed(2)),
        unit: alt.unit,
        totalCost: parseFloat((alt.price * data.quantity).toFixed(2)),
        savings: `${alt.savings}%`,
        savingsAmount: parseFloat(((basePrice - alt.price) * data.quantity).toFixed(2)),
        nutrition: alt.nutrition,
        category: alt.category
      })),
      nutrition: priceInfo.nutrition
    };
  });

  // Sort by estimated cost (highest first) to show budget priorities
  return shoppingList.sort((a, b) => b.estimatedCost - a.estimatedCost);
};

/**
 * Get sample item name for a category
 */
const getSampleItemForCategory = (category) => {
  const samples = {
    fruit: 'apples',
    vegetable: 'broccoli',
    dairy: 'milk',
    grain: 'rice',
    protein: 'chicken breast',
    beverage: 'orange juice',
    snack: 'almonds',
    other: 'olive oil'
  };
  return samples[category] || 'rice';
};

/**
 * Calculate nutritional summary for the week
 */
const calculateNutritionalSummary = (weeklyPlan) => {
  const dailySummaries = [];
  let weeklyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  Object.entries(weeklyPlan).forEach(([day, dayPlan]) => {
    let dailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    Object.values(dayPlan.meals).forEach(meal => {
      if (meal.nutrition) {
        dailyTotals.calories += meal.nutrition.calories;
        dailyTotals.protein += meal.nutrition.protein;
        dailyTotals.carbs += meal.nutrition.carbs;
        dailyTotals.fat += meal.nutrition.fat;
      }
    });

    dailySummaries.push({
      day,
      date: dayPlan.date,
      totals: dailyTotals,
      meetsTargets: checkNutritionTargets(dailyTotals)
    });

    weeklyTotals.calories += dailyTotals.calories;
    weeklyTotals.protein += dailyTotals.protein;
    weeklyTotals.carbs += dailyTotals.carbs;
    weeklyTotals.fat += dailyTotals.fat;
  });

  return {
    daily: dailySummaries,
    weekly: {
      totals: weeklyTotals,
      averages: {
        calories: Math.round(weeklyTotals.calories / 7),
        protein: Math.round(weeklyTotals.protein / 7),
        carbs: Math.round(weeklyTotals.carbs / 7),
        fat: Math.round(weeklyTotals.fat / 7)
      }
    },
    nutritionTargets: NUTRITION_RULES.dailyTargets
  };
};

/**
 * Check if daily nutrition meets targets
 */
const checkNutritionTargets = (dailyTotals) => {
  const targets = NUTRITION_RULES.dailyTargets;
  
  return {
    calories: dailyTotals.calories >= targets.calories.min && 
              dailyTotals.calories <= targets.calories.max,
    protein: dailyTotals.protein >= targets.protein.min,
    carbs: dailyTotals.carbs >= targets.carbs.min && 
           dailyTotals.carbs <= targets.carbs.max,
    fat: dailyTotals.fat >= targets.fat.min && 
         dailyTotals.fat <= targets.fat.max,
    overall: true // Calculate overall health score
  };
};

/**
 * Calculate cost breakdown
 */
const calculateCostBreakdown = (shoppingList) => {
  const total = shoppingList.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalPotentialSavings = shoppingList.reduce((sum, item) => sum + (item.potentialSavings || 0), 0);
  const optimizedTotal = shoppingList.reduce((sum, item) => {
    const optimizedCost = item.recommendedAlternative 
      ? parseFloat(item.recommendedAlternative.totalCost)
      : item.estimatedCost;
    return sum + optimizedCost;
  }, 0);
  
  const byCategory = {};
  const savingsOpportunities = [];
  
  shoppingList.forEach(item => {
    // Category breakdown
    if (!byCategory[item.category]) {
      byCategory[item.category] = {
        cost: 0,
        items: 0,
        potentialSavings: 0
      };
    }
    byCategory[item.category].cost += item.estimatedCost;
    byCategory[item.category].items += 1;
    byCategory[item.category].potentialSavings += item.potentialSavings || 0;
    
    // Track significant savings opportunities (>$2 or >20%)
    if (item.potentialSavings > 2 || (item.potentialSavings / item.estimatedCost * 100) > 20) {
      savingsOpportunities.push({
        item: item.item,
        currentCost: item.estimatedCost,
        alternativeName: item.recommendedAlternative?.name,
        alternativeCost: parseFloat(item.recommendedAlternative?.totalCost || 0),
        savings: item.potentialSavings,
        savingsPercent: ((item.potentialSavings / item.estimatedCost) * 100).toFixed(1) + '%',
        priority: item.potentialSavings > 5 ? 'high' : 'medium'
      });
    }
  });

  return {
    total: parseFloat(total.toFixed(2)),
    optimizedTotal: parseFloat(optimizedTotal.toFixed(2)),
    totalPotentialSavings: parseFloat(totalPotentialSavings.toFixed(2)),
    savingsPercent: total > 0 ? ((totalPotentialSavings / total) * 100).toFixed(1) + '%' : '0%',
    itemCount: shoppingList.length,
    byCategory: Object.entries(byCategory).map(([category, data]) => ({
      category,
      cost: parseFloat(data.cost.toFixed(2)),
      items: data.items,
      potentialSavings: parseFloat(data.potentialSavings.toFixed(2)),
      percentage: ((data.cost / total) * 100).toFixed(1) + '%'
    })).sort((a, b) => b.cost - a.cost),
    savingsOpportunities: savingsOpportunities.sort((a, b) => b.savings - a.savings).slice(0, 5),
    budgetOptimizationTip: totalPotentialSavings > 10 
      ? `You could save $${totalPotentialSavings.toFixed(2)} by choosing recommended alternatives!`
      : 'Your current selections are already well-optimized for cost.'
  };
};

/**
 * Calculate waste reduction percentage
 */
const calculateWasteReduction = (inventory, weeklyPlan) => {
  let inventoryUsed = 0;
  let totalInventoryItems = inventory.length;

  Object.values(weeklyPlan).forEach(day => {
    Object.values(day.meals).forEach(meal => {
      if (meal.usesInventory && meal.usesInventory.length > 0) {
        inventoryUsed += meal.usesInventory.length;
      }
    });
  });

  const wasteReductionPercent = totalInventoryItems > 0 
    ? ((inventoryUsed / totalInventoryItems) * 100).toFixed(1)
    : 0;

  return {
    itemsUsed: inventoryUsed,
    totalItems: totalInventoryItems,
    reductionPercent: wasteReductionPercent + '%',
    message: `Using ${inventoryUsed} inventory items reduces waste by ${wasteReductionPercent}%`
  };
};

/**
 * @desc    Get meal suggestions for a specific day
 * @route   POST /api/ai/meal-suggestions
 * @access  Private
 */
export const getMealSuggestions = async (req, res) => {
  try {
    const { mealType, budget = 10, preferences = {} } = req.body;
    
    const context = {
      budget,
      dietaryPreferences: preferences.dietary || [],
      daysRequired: 1
    };

    const suggestions = await generateMealSuggestions(context);
    
    const relevantMeals = suggestions.suggestions.find(
      s => s.type === mealType
    );

    res.json({
      mealType,
      suggestions: relevantMeals?.options || [],
      metadata: suggestions.metadata
    });

  } catch (error) {
    console.error('Meal suggestions error:', error);
    res.status(500).json({ 
      message: 'Failed to get meal suggestions', 
      error: error.message 
    });
  }
};
