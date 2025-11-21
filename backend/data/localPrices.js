/**
 * Dummy Local Price Dataset
 * Simulates local grocery prices for meal optimization
 */

export const localPrices = {
  // Proteins
  'chicken breast': { price: 6.99, unit: 'lb', category: 'protein', nutrition: { protein: 31, carbs: 0, fat: 3.6, calories: 165 } },
  'ground beef': { price: 5.99, unit: 'lb', category: 'protein', nutrition: { protein: 26, carbs: 0, fat: 15, calories: 250 } },
  'salmon': { price: 12.99, unit: 'lb', category: 'protein', nutrition: { protein: 25, carbs: 0, fat: 13, calories: 206 } },
  'tilapia': { price: 7.99, unit: 'lb', category: 'protein', nutrition: { protein: 26, carbs: 0, fat: 3, calories: 128 } },
  'eggs': { price: 3.49, unit: 'dozen', category: 'protein', nutrition: { protein: 6, carbs: 0.6, fat: 5, calories: 72 } },
  'tofu': { price: 2.99, unit: 'lb', category: 'protein', nutrition: { protein: 10, carbs: 2, fat: 6, calories: 94 } },
  'lentils': { price: 1.99, unit: 'lb', category: 'protein', nutrition: { protein: 18, carbs: 40, fat: 0.8, calories: 230 } },
  'black beans': { price: 1.49, unit: 'lb', category: 'protein', nutrition: { protein: 15, carbs: 41, fat: 0.9, calories: 227 } },
  
  // Grains
  'white rice': { price: 2.49, unit: 'lb', category: 'grain', nutrition: { protein: 4, carbs: 45, fat: 0.4, calories: 205 } },
  'brown rice': { price: 3.49, unit: 'lb', category: 'grain', nutrition: { protein: 5, carbs: 45, fat: 1.8, calories: 218 } },
  'quinoa': { price: 5.99, unit: 'lb', category: 'grain', nutrition: { protein: 8, carbs: 39, fat: 3.6, calories: 222 } },
  'pasta': { price: 1.99, unit: 'lb', category: 'grain', nutrition: { protein: 8, carbs: 43, fat: 1.3, calories: 221 } },
  'bread': { price: 2.99, unit: 'loaf', category: 'grain', nutrition: { protein: 3, carbs: 15, fat: 1, calories: 79 } },
  'oatmeal': { price: 3.99, unit: 'lb', category: 'grain', nutrition: { protein: 5, carbs: 27, fat: 2.5, calories: 154 } },
  
  // Vegetables
  'broccoli': { price: 2.99, unit: 'lb', category: 'vegetable', nutrition: { protein: 2.8, carbs: 6, fat: 0.4, calories: 34 } },
  'carrots': { price: 1.99, unit: 'lb', category: 'vegetable', nutrition: { protein: 0.9, carbs: 10, fat: 0.2, calories: 41 } },
  'spinach': { price: 3.49, unit: 'lb', category: 'vegetable', nutrition: { protein: 2.9, carbs: 3.6, fat: 0.4, calories: 23 } },
  'tomatoes': { price: 2.49, unit: 'lb', category: 'vegetable', nutrition: { protein: 0.9, carbs: 3.9, fat: 0.2, calories: 18 } },
  'bell peppers': { price: 3.99, unit: 'lb', category: 'vegetable', nutrition: { protein: 1, carbs: 6, fat: 0.3, calories: 31 } },
  'onions': { price: 1.49, unit: 'lb', category: 'vegetable', nutrition: { protein: 1.1, carbs: 9, fat: 0.1, calories: 40 } },
  'lettuce': { price: 2.49, unit: 'head', category: 'vegetable', nutrition: { protein: 1.4, carbs: 2.9, fat: 0.2, calories: 15 } },
  'cucumbers': { price: 1.99, unit: 'lb', category: 'vegetable', nutrition: { protein: 0.7, carbs: 3.6, fat: 0.1, calories: 16 } },
  
  // Fruits
  'apples': { price: 2.99, unit: 'lb', category: 'fruit', nutrition: { protein: 0.3, carbs: 14, fat: 0.2, calories: 52 } },
  'bananas': { price: 0.79, unit: 'lb', category: 'fruit', nutrition: { protein: 1.1, carbs: 23, fat: 0.3, calories: 89 } },
  'oranges': { price: 3.49, unit: 'lb', category: 'fruit', nutrition: { protein: 0.9, carbs: 12, fat: 0.1, calories: 47 } },
  'berries': { price: 4.99, unit: 'lb', category: 'fruit', nutrition: { protein: 1, carbs: 12, fat: 0.3, calories: 57 } },
  'grapes': { price: 3.99, unit: 'lb', category: 'fruit', nutrition: { protein: 0.7, carbs: 18, fat: 0.2, calories: 69 } },
  
  // Dairy
  'milk': { price: 3.99, unit: 'gallon', category: 'dairy', nutrition: { protein: 8, carbs: 12, fat: 8, calories: 149 } },
  'yogurt': { price: 4.99, unit: 'lb', category: 'dairy', nutrition: { protein: 10, carbs: 17, fat: 0.4, calories: 100 } },
  'cheese': { price: 5.99, unit: 'lb', category: 'dairy', nutrition: { protein: 25, carbs: 1.3, fat: 33, calories: 402 } },
  'butter': { price: 4.49, unit: 'lb', category: 'dairy', nutrition: { protein: 0.9, carbs: 0.1, fat: 81, calories: 717 } },
  
  // Beverages
  'coffee': { price: 7.99, unit: 'lb', category: 'beverage', nutrition: { protein: 0.3, carbs: 0, fat: 0, calories: 2 } },
  'tea': { price: 5.99, unit: 'box', category: 'beverage', nutrition: { protein: 0, carbs: 0, fat: 0, calories: 2 } },
  'orange juice': { price: 4.99, unit: 'gallon', category: 'beverage', nutrition: { protein: 1.7, carbs: 26, fat: 0.5, calories: 112 } },
  
  // Snacks
  'almonds': { price: 8.99, unit: 'lb', category: 'snack', nutrition: { protein: 21, carbs: 22, fat: 49, calories: 579 } },
  'peanut butter': { price: 6.99, unit: 'jar', category: 'snack', nutrition: { protein: 25, carbs: 20, fat: 50, calories: 588 } },
  'crackers': { price: 3.49, unit: 'box', category: 'snack', nutrition: { protein: 2, carbs: 10, fat: 2, calories: 70 } },
  
  // Other
  'olive oil': { price: 8.99, unit: 'bottle', category: 'other', nutrition: { protein: 0, carbs: 0, fat: 14, calories: 119 } },
  'salt': { price: 1.99, unit: 'container', category: 'other', nutrition: { protein: 0, carbs: 0, fat: 0, calories: 0 } },
  'pepper': { price: 4.99, unit: 'container', category: 'other', nutrition: { protein: 0.3, carbs: 1.4, fat: 0.1, calories: 6 } }
};

/**
 * Get price for an item
 * @param {String} itemName - Item name
 * @returns {Object} - Price information
 */
export const getPrice = (itemName) => {
  const normalized = itemName.toLowerCase().trim();
  return localPrices[normalized] || { price: 5.0, unit: 'item', category: 'other' };
};

/**
 * Get cheaper alternatives for an item
 * @param {String} itemName - Original item
 * @param {Number} maxPrice - Maximum acceptable price
 * @returns {Array} - List of alternatives
 */
export const getCheaperAlternatives = (itemName, maxPrice) => {
  const item = getPrice(itemName);
  const category = item.category;
  
  const alternatives = Object.entries(localPrices)
    .filter(([name, data]) => 
      data.category === category && 
      data.price < item.price &&
      data.price <= maxPrice
    )
    .map(([name, data]) => ({
      name,
      ...data,
      savings: ((item.price - data.price) / item.price * 100).toFixed(1)
    }))
    .sort((a, b) => a.price - b.price);
  
  return alternatives;
};

/**
 * Calculate total nutrition for ingredients
 * @param {Array} ingredients - List of ingredients with quantities
 * @returns {Object} - Total nutrition
 */
export const calculateNutrition = (ingredients) => {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  ingredients.forEach(({ name, quantity = 1 }) => {
    const item = getPrice(name);
    if (item.nutrition) {
      totals.calories += (item.nutrition.calories || 0) * quantity;
      totals.protein += (item.nutrition.protein || 0) * quantity;
      totals.carbs += (item.nutrition.carbs || 0) * quantity;
      totals.fat += (item.nutrition.fat || 0) * quantity;
    }
  });
  
  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat)
  };
};

export default localPrices;
