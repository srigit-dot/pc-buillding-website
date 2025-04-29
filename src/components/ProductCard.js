import React, { useState } from 'react';
import { FaExclamationTriangle, FaLock, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useBuild } from '../context/BuildContext';
import { useCart } from '../context/CartContext';
import '../styles/card.css';

function ProductCard({ product, category }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { 
    canAddComponent, 
    isComponentRequired,
    addComponent,
    buildComponents
  } = useBuild();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const canAdd = canAddComponent(category);
  const isRequired = isComponentRequired(category);
  const isAlreadyAdded = buildComponents[category] !== undefined;

  const handleAddToCart = async () => {
    try {
      if (!canAdd) {
        setError('Prerequisites not met for this component');
        return;
      }

      if (isAlreadyAdded) {
        setError('This component type is already in your build');
        return;
      }

      // Validate product data
      if (!product.name || !product.price) {
        setError('Invalid product data: Missing name or price');
        return;
      }

      setIsAdding(true);
      setError(null);
      
      // Prepare the product data with the correct field names
      const productToAdd = {
        productId: product._id || product.id || `${category}-${Date.now()}`,
        productName: product.name,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        quantity,
        category,
        // Include any additional product details that might be useful
        ...Object.entries(product).reduce((acc, [key, value]) => {
          if (!['_id', 'id', 'name', 'price'].includes(key)) {
            acc[key] = value;
          }
          return acc;
        }, {})
      };

      console.log('Adding product to cart:', productToAdd);
      
      await addToCart(productToAdd);

      // Add to build context
      addComponent(category, productToAdd);
      
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error.message || 'Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={`product-card ${!canAdd ? 'disabled' : ''} ${isRequired ? 'required' : ''}`}>
      <div className="product-card-content">
        <div className="product-header">
          <h3>{product.name || 'Unknown Product'}</h3>
          <p>${typeof product.price === 'number' ? product.price.toFixed(2) : product.price || '0.00'}</p>
          {isRequired && <span className="required-badge">Required</span>}
          {!canAdd && <span className="locked-badge"><FaLock /> Prerequisites needed</span>}
          {isAlreadyAdded && <span className="added-badge">Already in build</span>}
        </div>
        
        <div className="product-details">
          <ul>
            {Object.entries(product).map(([key, value], i) =>
              key !== "name" && key !== "price" ? (
                <li key={i}><strong>{key}:</strong> {value}</li>
              ) : null
            )}
          </ul>
        </div>

        {canAdd && !isAlreadyAdded && (
          <>
            <div className="quantity-selector">
              <button 
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="quantity-btn"
                disabled={isAdding}
              >
                -
              </button>
              <span className="quantity">{quantity}</span>
              <button 
                onClick={() => setQuantity(prev => prev + 1)}
                className="quantity-btn"
                disabled={isAdding}
              >
                +
              </button>
            </div>

            <button 
              onClick={handleAddToCart} 
              disabled={isAdding}
              className={`add-to-cart-btn ${isAdding ? 'adding' : ''}`}
            >
              <FaShoppingCart /> {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
          </>
        )}
        
        {error && (
          <p className="error-message">
            <FaExclamationTriangle /> {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductCard; 