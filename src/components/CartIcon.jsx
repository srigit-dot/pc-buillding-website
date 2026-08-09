import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/CartIcon.css';

const CartIcon = () => {
  const { cartCount } = useCart();

  return (
    <Link to="/cart" className="cart-icon">
      <FaShoppingCart />
      {cartCount > 0 && (
        <span className="cart-count">{cartCount}</span>
      )}
    </Link>
  );
};

export default CartIcon; 