import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/OrderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [error, setError] = useState(null);

  useEffect(() => {
    const clearCartData = async () => {
      try {
        await clearCart();
        setError(null);
      } catch (err) {
        console.error('Failed to clear cart:', err);
        setError(err.message);
      }
    };

    clearCartData();
  }, [clearCart]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  return (
    <div className="order-success-container">
      <div className="success-content">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h1>Order Successful!</h1>
        <p>Thank you for your purchase. Your order has been confirmed.</p>
        <p>You will receive an email confirmation shortly.</p>
        {error && (
          <p className="error-message">
            Note: There was an issue clearing your cart. Please try refreshing the page.
          </p>
        )}
        <button 
          className="continue-shopping-btn"
          onClick={handleContinueShopping}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess; 