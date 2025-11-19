import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  relatedCategory: {
    type: String,
    required: [true, 'Related category is required'],
    enum: ['fruit', 'vegetable', 'dairy', 'grain', 'protein', 'beverage', 'snack', 'general', 'other']
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['article', 'video', 'guide', 'tip', 'recipe', 'other']
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.model('Resource', resourceSchema);
