// components/ProductList.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBuild } from '../context/BuildContext';
import '../styles/product.css';
import ProductCard from './ProductCard';

function ProductList() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { 
    getMissingComponents, 
    getRecommendedNext,
    buildComponents
  } = useBuild();

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    axios.get(`http://localhost:3001/api/products/category/${category}`)
      .then((res) => {
        console.log('Products response:', res.data);
        setProducts(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message);
        setProducts([]);
        setLoading(false);
      });
  }, [category]);

  const missingComponents = getMissingComponents();
  const nextRecommended = getRecommendedNext();

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="product-container">
      <div className="build-progress">
        <h2>Build Progress</h2>
        <div className="progress-info">
          <p>Required Components Missing: {missingComponents.length}</p>
          {nextRecommended && (
            <p>Recommended Next: <strong>{nextRecommended}</strong></p>
          )}
        </div>
        <div className="component-list">
          {Object.entries(buildComponents).map(([type, component]) => (
            <div key={type} className="selected-component">
              <span className="component-type">{type}:</span>
              <span className="component-name">{component.name}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="product-heading">🛠 {category.toUpperCase()} Components</h2>
      <div className="product-grid">
        {products.length > 0 ? (
          products.map((product, index) => (
            <ProductCard 
              key={index} 
              product={product} 
              category={category}
            />
          ))
        ) : (
          <div className="no-products">No products found for this category.</div>
        )}
      </div>
    </div>
  );
}

export default ProductList;
