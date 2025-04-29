const Order = require('../models/Order');
const Cart = require('../models/Cart');

exports.createOrder = async (req, res) => {
  try {
    console.log('Received order creation request:', JSON.stringify(req.body, null, 2));
    
    const { items, total, paymentMethod, shippingAddress } = req.body;

    // Validate required fields
    if (!items || !items.length || !total || !paymentMethod || !shippingAddress) {
      console.log('Missing required fields:', { 
        items: items ? 'present' : 'missing',
        total: total ? 'present' : 'missing',
        paymentMethod: paymentMethod ? 'present' : 'missing',
        shippingAddress: shippingAddress ? 'present' : 'missing'
      });
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['items', 'total', 'paymentMethod', 'shippingAddress']
      });
    }

    // Validate payment method
    const validPaymentMethods = ['credit-card', 'paypal', 'cash'];
    const normalizedPaymentMethod = paymentMethod.toLowerCase();
    if (!validPaymentMethods.includes(normalizedPaymentMethod)) {
      console.log('Invalid payment method:', paymentMethod);
      return res.status(400).json({
        message: 'Invalid payment method',
        validMethods: validPaymentMethods
      });
    }

    // Validate shipping address
    const requiredAddressFields = ['street', 'city', 'state', 'zipCode'];
    const missingAddressFields = requiredAddressFields.filter(field => !shippingAddress[field]);
    if (missingAddressFields.length > 0) {
      console.log('Missing address fields:', missingAddressFields);
      return res.status(400).json({
        message: 'Missing required address fields',
        missingFields: missingAddressFields
      });
    }

    // Format and validate items
    const formattedItems = items.map(item => {
      console.log('Processing item:', item);
      // Ensure all required fields are present and properly formatted
      const formattedItem = {
        productId: item.productId || item._id || '',
        productName: item.productName || item.name || '',
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1
      };
      console.log('Formatted item:', formattedItem);
      return formattedItem;
    });

    // Validate formatted items
    for (const item of formattedItems) {
      if (!item.productId || !item.productName || item.price <= 0 || item.quantity <= 0) {
        console.log('Invalid item data:', item);
        return res.status(400).json({
          message: 'Invalid item data',
          item,
          required: ['productId', 'productName', 'price (positive number)', 'quantity (positive number)']
        });
      }
    }

    // Validate total
    const calculatedTotal = formattedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (Math.abs(calculatedTotal - total) > 0.01) {
      console.log('Total mismatch:', { calculated: calculatedTotal, received: total });
      return res.status(400).json({
        message: 'Order total does not match item prices',
        calculated: calculatedTotal,
        received: total
      });
    }

    // Create new order
    const order = new Order({
      items: formattedItems,
      total,
      paymentMethod: normalizedPaymentMethod,
      shippingAddress,
      status: 'pending'
    });

    console.log('Creating order:', JSON.stringify(order, null, 2));

    try {
      // Save the order
      await order.save();
      console.log('Order saved successfully');

      // Clear the cart after successful order creation
      try {
        await Cart.deleteMany({});
        console.log('Cart cleared after order creation');
      } catch (error) {
        console.error('Error clearing cart:', error);
        // Don't fail the order if cart clearing fails
      }

      res.status(201).json({
        message: 'Order created successfully',
        order
      });
    } catch (saveError) {
      console.error('Error saving order:', saveError);
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.values(saveError.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        console.log('Validation errors:', validationErrors);
        return res.status(400).json({
          message: 'Validation error',
          errors: validationErrors
        });
      }
      throw saveError;
    }
  } catch (error) {
    console.error('Error creating order:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      message: 'Failed to create order',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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