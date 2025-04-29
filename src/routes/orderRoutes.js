const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Create a new order
router.post('/', orderController.createOrder);

// Get all orders
router.get('/', orderController.getOrders);

// Update order status (specific route should come before parameterized route)
router.patch('/status/:id', orderController.updateOrderStatus);

// Get a specific order by ID
router.get('/order/:id', orderController.getOrderById);

module.exports = router; 