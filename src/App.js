// App.jsx
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Cart from './components/Cart';
import CategoryList from './components/CategoryList';
import ProductList from './components/ProductList';
import './styles/main.css';



function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<CategoryList />} />
          <Route path="/products/:category" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} /> 

        </Routes>
      </div>
    </Router>
  );
}

export default App;
