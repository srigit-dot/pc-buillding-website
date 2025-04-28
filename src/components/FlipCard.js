import React, { useEffect, useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/card.css';

function FlipCard({ product }) {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);
  const [isServerRunning, setIsServerRunning] = useState(true);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/test', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error('Server not responding');
        }
        
        const data = await response.json();
        console.log('Server status:', data);
        setIsServerRunning(true);
        setError(null);
      } catch (error) {
        console.error('Server check failed:', error);
        setIsServerRunning(false);
        setError('Server is not running. Please start the server.');
      }
    };

    checkServer();
    // Check server status every 30 seconds
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = async () => {
    if (!isServerRunning) {
      setError('Server is not running. Please start the server.');
      return;
    }

    try {
      setIsAdding(true);
      setError(null);
      
      // Log the product data to see what we're receiving
      console.log('Product data:', product);

      // Create a unique ID if not present
      const productId = product.id || `prod_${Date.now()}`;
      
      const cartItem = {
        productId: productId,
        productName: product.name || 'Unknown Product',
        price: parseFloat(product.price) || 0,
        quantity: 1
      };

      console.log('Sending cart item:', cartItem);

      const response = await fetch('http://localhost:3001/api/cart', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(cartItem),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add to cart');
      }

      const data = await response.json();
      console.log('Item added to cart:', data);
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
          <button 
            onClick={handleAddToCart} 
            disabled={isAdding || !isServerRunning}
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
