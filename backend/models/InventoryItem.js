import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['fruit', 'vegetable', 'dairy', 'grain', 'protein', 'beverage', 'snack', 'other']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  expirationDate: {
    type: Date,
    required: [true, 'Expiration date is required']
  },
  notes: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Virtual to check if item is expired
inventoryItemSchema.virtual('isExpired').get(function() {
  return this.expirationDate < new Date();
});

// Virtual to check days until expiration
inventoryItemSchema.virtual('daysUntilExpiration').get(function() {
  const today = new Date();
  const diffTime = this.expirationDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

inventoryItemSchema.set('toJSON', { virtuals: true });
inventoryItemSchema.set('toObject', { virtuals: true });

export default mongoose.model('InventoryItem', inventoryItemSchema);
