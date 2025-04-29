const Order = require('../models/Order');
const Cart = require('../models/Cart');

exports.createOrder = async (req, res) => {
  try {
    const { items, total, paymentMethod, shippingAddress } = req.body;

    // Validate required fields
    if (!items || !items.length || !total || !paymentMethod || !shippingAddress) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['items', 'total', 'paymentMethod', 'shippingAddress']
      });
    }

    // Validate payment method
    const validPaymentMethods = ['credit-card', 'paypal', 'cash'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: 'Invalid payment method',
        validMethods: validPaymentMethods
      });
    }

    // Validate shipping address
    const requiredAddressFields = ['street', 'city', 'state', 'zipCode'];
    const missingAddressFields = requiredAddressFields.filter(field => !shippingAddress[field]);
    if (missingAddressFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required address fields',
        missingFields: missingAddressFields
      });
    }

    // Validate items
    for (const item of items) {
      if (!item.productId || !item.productName || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        return res.status(400).json({
          message: 'Invalid item data',
          required: ['productId', 'productName', 'price (number)', 'quantity (number)']
        });
      }
      if (item.price <= 0 || item.quantity <= 0) {
        return res.status(400).json({
          message: 'Price and quantity must be positive numbers'
        });
      }
    }

    // Validate total
    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (Math.abs(calculatedTotal - total) > 0.01) { // Allow for small floating-point differences
      return res.status(400).json({
        message: 'Order total does not match item prices',
        calculated: calculatedTotal,
        received: total
      });
    }

    // Create new order
    const order = new Order({
      items,
      total,
      paymentMethod,
      shippingAddress,
      status: 'pending'
    });

    // Save the order
    await order.save();

    // Clear the cart after successful order creation
    await Cart.deleteMany({});

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      message: 'Failed to create order',
      error: error.message
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update order status',
      error: error.message
    });
  }
}; 