// App.jsx
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Cart from './components/Cart';
import CartIcon from './components/CartIcon';
import CategoryList from './components/CategoryList';
import ProductList from './components/ProductList';
import { CartProvider } from './context/CartContext';
import './styles/main.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app-container">
          <header className="app-header">
            <h1>Product Store</h1>
            <CartIcon />
          </header>
          <Routes>
            <Route path="/" element={<CategoryList />} />
            <Route path="/products/:category" element={<ProductList />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
