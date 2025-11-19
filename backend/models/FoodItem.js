import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Food name is required'],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['fruit', 'vegetable', 'dairy', 'grain', 'protein', 'beverage', 'snack', 'other']
  },
  typicalExpirationDays: {
    type: Number,
    required: [true, 'Typical expiration days is required'],
    min: 1
  },
  costPerUnit: {
    type: Number,
    required: [true, 'Cost per unit is required'],
    min: 0
  },
  unit: {
    type: String,
    default: 'piece'
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model('FoodItem', foodItemSchema);
