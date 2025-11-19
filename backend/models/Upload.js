import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  path: {
    type: String,
    required: [true, 'File path is required']
  },
  mimetype: {
    type: String,
    required: [true, 'Mimetype is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  relatedTo: {
    type: String,
    enum: ['inventory', 'consumption', 'profile', 'other'],
    default: 'other'
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  }
}, {
  timestamps: true
});

export default mongoose.model('Upload', uploadSchema);
