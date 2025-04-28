// components/Cart.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/cart.css';



function Cart() {
  const navigate = useNavigate();

  // Example initial cart data
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Gaming CPU', price: 300 },
    { id: 2, name: 'RTX 3060 GPU', price: 450 },
  ]);

  const handleRemove = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="cart-container">
      <h1 className="cart-heading">🛒 Your Cart</h1>

      {cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-list">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <span>{item.name}</span>
                <span>${item.price}</span>
                <button onClick={() => handleRemove(item.id)}>Remove</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Total: ${totalPrice}</h2>
            <button onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
