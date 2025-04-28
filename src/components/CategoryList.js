import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/category.css';

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3001/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const backgroundStyle = {
    backgroundImage: "url('/background1.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    padding: '40px',
    color: '#fff',
    textAlign: 'center'
  };
  

  return (
    <div style={backgroundStyle}>
      <h1 className="category-heading">🔥 Choose Your PC Part Category</h1>
      <div className="category-grid">
        {categories.map((cat, index) => (
          <div
            key={index}
            onClick={() => navigate(`/products/${cat}`)}
            className="category-card"
          >
            {cat}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryList;
