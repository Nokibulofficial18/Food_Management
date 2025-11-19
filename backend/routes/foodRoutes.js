import express from 'express';
import { getFoodItems, getFoodItemById } from '../controllers/foodController.js';

const router = express.Router();

router.get('/', getFoodItems);
router.get('/:id', getFoodItemById);

export default router;
