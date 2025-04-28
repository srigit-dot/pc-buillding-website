const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: [true, 'Product ID is required'],
    trim: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  strict: true,
  timestamps: true
});

// Ensure no default items are added
cartSchema.pre('save', function(next) {
  if (!this.productId || !this.productName || !this.price) {
    next(new Error('Missing required fields'));
  }
  next();
});

module.exports = mongoose.model('Cart', cartSchema); 