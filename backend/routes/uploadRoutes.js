import express from 'express';
import { uploadFile, getUserUploads, deleteUpload } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', authenticate, upload.single('image'), uploadFile);
router.get('/', authenticate, getUserUploads);
router.delete('/:id', authenticate, deleteUpload);

export default router;
