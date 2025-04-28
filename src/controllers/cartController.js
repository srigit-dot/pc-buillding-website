const Cart = require('../models/Cart');

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
    const cartItem = await Cart.findByIdAndDelete(id);

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({});
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
}; 