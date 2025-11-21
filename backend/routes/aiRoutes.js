import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  optimizeMealPlan,
  getMealSuggestions
} from '../controllers/aiController.js';

const router = express.Router();

/**
 * @route   POST /api/ai/meal-optimize
 * @desc    Generate optimized 7-day meal plan
 * @access  Private
 * @body    { budget: Number, preferences: Object }
 */
router.post('/meal-optimize', authenticate, optimizeMealPlan);

/**
 * @route   POST /api/ai/meal-suggestions
 * @desc    Get meal suggestions for specific meal type
 * @access  Private
 * @body    { mealType: String, budget: Number, preferences: Object }
 */
router.post('/meal-suggestions', authenticate, getMealSuggestions);

export default router;
