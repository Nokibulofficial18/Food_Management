import express from 'express';
import { 
  getInventory, 
  createItem, 
  getItemById, 
  updateItem, 
  deleteItem 
} from '../controllers/inventoryController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getInventory);
router.post('/', authenticate, createItem);
router.get('/:id', authenticate, getItemById);
router.put('/:id', authenticate, updateItem);
router.delete('/:id', authenticate, deleteItem);

export default router;
