import Upload from '../models/Upload.js';
import path from 'path';

// @desc    Upload file
// @route   POST /api/uploads
// @access  Private
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { relatedTo, relatedId } = req.body;

    const upload = await Upload.create({
      userId: req.userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      relatedTo: relatedTo || 'other',
      relatedId: relatedId || null
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      upload,
      fileUrl: `/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
};

// @desc    Get all uploads for user
// @route   GET /api/uploads
// @access  Private
export const getUserUploads = async (req, res) => {
  try {
    const uploads = await Upload.find({ userId: req.userId }).sort({ createdAt: -1 });
    
    res.json({ uploads, count: uploads.length });
  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({ message: 'Error fetching uploads', error: error.message });
  }
};

// @desc    Delete upload
// @route   DELETE /api/uploads/:id
// @access  Private
export const deleteUpload = async (req, res) => {
  try {
    const upload = await Upload.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    // Optionally delete the file from filesystem
    // fs.unlinkSync(upload.path);

    res.json({ message: 'Upload deleted successfully' });
  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({ message: 'Error deleting upload', error: error.message });
  }
};
