import express from 'express';
import { processImage, confirmItems, getOCRInfo } from '../controllers/ocrController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Process image with OCR
router.post('/process-image', upload.single('image'), processImage);

// Confirm and add extracted items
router.post('/confirm-items', confirmItems);

// Get OCR service info
router.get('/info', getOCRInfo);

export default router;
