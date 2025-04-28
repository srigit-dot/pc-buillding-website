import React, { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/card.css';

function FlipCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      setError(null);
      
      await addToCart({
        ...product,
        quantity
      });
      
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flip-card">
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <h3>{product.name || 'Unknown Product'}</h3>
          <p>${product.price || '0.00'}</p>
        </div>
        <div className="flip-card-back">
          <ul>
            {Object.entries(product).map(([key, value], i) =>
              key !== "name" && key !== "price" ? (
                <li key={i}><strong>{key}:</strong> {value}</li>
              ) : null
            )}
          </ul>
          <div className="quantity-selector">
            <button 
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              className="quantity-btn"
            >
              -
            </button>
            <span className="quantity">{quantity}</span>
            <button 
              onClick={() => setQuantity(prev => prev + 1)}
              className="quantity-btn"
            >
              +
            </button>
          </div>
          <button 
            onClick={handleAddToCart} 
            disabled={isAdding}
            className={isAdding ? 'adding' : ''}
          >
            <FaShoppingCart /> {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default FlipCard;
