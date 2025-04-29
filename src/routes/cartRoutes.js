const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Add item to cart
router.post('/', cartController.addToCart);

// Get cart items
router.get('/', cartController.getCartItems);

// Clear cart (specific route should come before parameterized route)
router.delete('/clear', cartController.clearCart);

// Update cart item
router.patch('/item/:id', cartController.updateCartItem);

// Remove item from cart
router.delete('/item/:id', cartController.removeCartItem);

module.exports = router; 