import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  analyzeConsumption, 
  getConsumptionTrends,
  getCategoryStats 
} from '../controllers/analysisController.js';

const router = express.Router();

/**
 * @route   GET /api/analysis/weekly
 * @desc    Analyze consumption patterns and predict waste risk
 * @access  Private
 */
router.get('/weekly', authenticate, analyzeConsumption);

/**
 * @route   GET /api/analysis/trends
 * @desc    Get consumption trends over specified period
 * @access  Private
 * @query   days - Number of days to analyze (default: 30)
 */
router.get('/trends', authenticate, getConsumptionTrends);

/**
 * @route   GET /api/analysis/category-stats
 * @desc    Get statistics by category
 * @access  Private
 */
router.get('/category-stats', authenticate, getCategoryStats);

export default router;
