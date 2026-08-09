import React, { useEffect, useState } from 'react';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeItem, setCartItems } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      console.log('Fetching cart items...');
      const response = await fetch('http://localhost:3001/api/cart', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }

      const data = await response.json();
      console.log('Cart items received:', data);
      updateCartItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItems = (items) => {
    try {
      // Ensure all items have the required fields
      const validatedItems = items.map(item => ({
        _id: item._id,
        productName: item.productName,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity) || 1
      }));
      setCartItems(validatedItems);
    } catch (error) {
      console.error('Error updating cart items:', error);
      setError('Failed to update cart items');
    }
  };

  const handleQuantityUpdate = async (itemId, newQuantity) => {
    try {
      if (newQuantity < 1) return;
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError(error.message);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      console.error('Error removing item:', error);
      setError(error.message);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="cart-loading">
          <h2>Loading cart...</h2>
          <p>Please wait while we fetch your items</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container">
        <div className="cart-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={fetchCartItems} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <p>Add some items to get started!</p>
          <button onClick={() => navigate('/')} className="continue-shopping">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item._id} className="cart-item">
            <div className="item-details">
              <h3>{item.productName}</h3>
              <p className="item-price">${item.price}</p>
            </div>
            <div className="quantity-controls">
              <button
                onClick={() => handleQuantityUpdate(item._id, item.quantity - 1)}
                className="quantity-btn"
                disabled={item.quantity <= 1}
              >
                <FaMinus />
              </button>
              <span className="quantity">{item.quantity}</span>
              <button
                onClick={() => handleQuantityUpdate(item._id, item.quantity + 1)}
                className="quantity-btn"
              >
                <FaPlus />
              </button>
            </div>
            <div className="item-total">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
            <button
              onClick={() => handleRemoveItem(item._id)}
              className="remove-btn"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping:</span>
          <span>Free</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
        <button 
          className="checkout-btn"
          onClick={() => navigate('/checkout')}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart; 