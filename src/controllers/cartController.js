const Cart = require('../models/Cart');

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    console.log('Adding to cart - Request body:', req.body);
    
    // Validate required fields
    const requiredFields = ['productId', 'productName', 'price'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: 'Missing required fields',
        missingFields 
      });
    }

    // Create new cart item
    const cartItem = new Cart({
      productId: req.body.productId,
      productName: req.body.productName,
      price: parseFloat(req.body.price),
      quantity: req.body.quantity || 1
    });

    console.log('Created cart item:', cartItem);

    // Save to database
    const savedItem = await cartItem.save();
    console.log('Item saved to cart:', savedItem);
    
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(400).json({ 
      message: 'Failed to add item to cart',
      error: error.message 
    });
  }
};

// Get all cart items
exports.getCartItems = async (req, res) => {
  try {
    console.log('Fetching all cart items');
    const cartItems = await Cart.find();
    console.log('Found cart items:', cartItems);
    res.json(cartItems);
  } catch (error) {
    console.error('Error getting cart items:', error);
    res.status(500).json({ 
      message: 'Failed to get cart items',
      error: error.message 
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    console.log('Updating cart item:', req.params.id);
    const cartItem = await Cart.findById(req.params.id);
    
    if (!cartItem) {
      console.log('Cart item not found:', req.params.id);
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    cartItem.quantity = req.body.quantity;
    const updatedItem = await cartItem.save();
    console.log('Updated cart item:', updatedItem);
    
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(400).json({ 
      message: 'Failed to update cart item',
      error: error.message 
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    console.log('Removing cart item:', req.params.id);
    const cartItem = await Cart.findById(req.params.id);
    
    if (!cartItem) {
      console.log('Cart item not found:', req.params.id);
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    await cartItem.deleteOne();
    console.log('Cart item removed:', req.params.id);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ 
      message: 'Failed to remove item from cart',
      error: error.message 
    });
  }
}; 