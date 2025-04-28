const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cart', cartSchema); 