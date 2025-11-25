import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  optimizeMealPlan,
  getMealSuggestions,
  getExpirationRisk,
  getWasteEstimate
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

/**
 * @route   GET /api/ai/exp-risk
 * @desc    Get expiration risk predictions for inventory items
 * @access  Private
 */
router.get('/exp-risk', authenticate, getExpirationRisk);

/**
 * @route   GET /api/ai/waste-estimate
 * @desc    Get waste estimation with community comparison
 * @access  Private
 */
router.get('/waste-estimate', authenticate, getWasteEstimate);

export default router;
