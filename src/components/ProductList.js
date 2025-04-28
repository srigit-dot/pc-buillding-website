// components/ProductList.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import FlipCard from './FlipCard';
import '../styles/product.css';


function ProductList() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3001/products/${category}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, [category]);

  return (
    <div className="product-container">
      <h2 className="product-heading">🛠 {category.toUpperCase()} Components</h2>
      <div className="product-grid">
        {products.map((product, index) => (
          <FlipCard key={index} product={product} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
