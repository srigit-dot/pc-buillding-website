const Cart = require('../models/Cart');
const mongoose = require('mongoose');

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, productName, price, quantity = 1 } = req.body;

    // Validate required fields
    if (!productId || !productName || !price) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['productId', 'productName', 'price']
      });
    }

    // Validate price is a positive number
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ 
        message: 'Price must be a positive number'
      });
    }

    // Validate quantity is a positive integer
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ 
        message: 'Quantity must be a positive integer'
      });
    }

    // Check if item already exists in cart
    const existingItem = await Cart.findOne({ productId });
    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      return res.json(existingItem);
    }

    // Create new cart item
    const cartItem = new Cart({
      productId,
      productName,
      price,
      quantity
    });

    await cartItem.save();
    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
};

// Get all cart items
exports.getCartItems = async (req, res) => {
  try {
    const cartItems = await Cart.find().sort({ addedAt: -1 });
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart items', error: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ 
        message: 'Quantity must be a positive integer'
      });
    }

    const cartItem = await Cart.findByIdAndUpdate(
      id,
      { quantity },
      { new: true, runValidators: true }
    );

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Attempting to remove cart item with ID:', id);
    
    if (!id) {
      console.error('No ID provided in request');
      return res.status(400).json({ 
        success: false,
        message: 'No ID provided for deletion' 
      });
    }

    // Validate MongoDB ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('Invalid MongoDB ID format:', id);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid item ID format' 
      });
    }
    
    // First check if the item exists
    const existingItem = await Cart.findById(id);
    if (!existingItem) {
      console.log('Cart item not found with ID:', id);
      return res.status(404).json({ 
        success: false,
        message: 'Cart item not found' 
      });
    }
    
    console.log('Found cart item:', existingItem);
    
    // Delete the item
    const cartItem = await Cart.findByIdAndDelete(id);
    console.log('Delete operation result:', cartItem);

    res.json({ 
      success: true,
      message: 'Item removed from cart',
      deletedItem: cartItem
    });
  } catch (error) {
    console.error('Error in removeCartItem:', error);
    console.error('Error stack:', error.stack);
    
    // Check for specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid item ID format',
        error: error.message 
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({ 
        success: false,
        message: 'Database error occurred',
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error removing item from cart', 
      error: error.message 
    });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    console.log('Clearing cart...');
    
    // First check if there are any items in the cart
    const cartItems = await Cart.find({});
    console.log(`Found ${cartItems.length} items to clear`);
    
    if (cartItems.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: 'Cart is already empty',
        deletedCount: 0 
      });
    }

    // Delete all items
    const result = await Cart.deleteMany({});
    console.log('Cart cleared successfully:', result);
    
    if (!result || !result.acknowledged) {
      throw new Error('Database operation not acknowledged');
    }

    res.status(200).json({ 
      success: true,
      message: 'Cart cleared successfully',
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error clearing cart', 
      error: error.message || 'Internal server error'
    });
  }
}; 