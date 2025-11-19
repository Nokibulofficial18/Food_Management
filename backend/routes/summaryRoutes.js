import express from 'express';
import { getSummary } from '../controllers/summaryController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getSummary);

export default router;
