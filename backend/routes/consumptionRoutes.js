import express from 'express';
import { 
  getLogs, 
  createLog, 
  getLogById, 
  updateLog, 
  deleteLog 
} from '../controllers/consumptionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getLogs);
router.post('/', authenticate, createLog);
router.get('/:id', authenticate, getLogById);
router.put('/:id', authenticate, updateLog);
router.delete('/:id', authenticate, deleteLog);

export default router;
