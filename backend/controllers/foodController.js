import FoodItem from '../models/FoodItem.js';

// @desc    Get all food items
// @route   GET /api/food
// @access  Public
export const getFoodItems = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = {};

    if (category) query.category = category;
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const foodItems = await FoodItem.find(query).sort({ name: 1 });
    
    res.json({ foodItems, count: foodItems.length });
  } catch (error) {
    console.error('Get food items error:', error);
    res.status(500).json({ message: 'Error fetching food items', error: error.message });
  }
};

// @desc    Get single food item
// @route   GET /api/food/:id
// @access  Public
export const getFoodItemById = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json({ foodItem });
  } catch (error) {
    console.error('Get food item error:', error);
    res.status(500).json({ message: 'Error fetching food item', error: error.message });
  }
};
