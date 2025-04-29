// App.jsx
import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Cart from './components/Cart';
import CartIcon from './components/CartIcon';
import CategoryList from './components/CategoryList';
import OrderSuccess from './components/OrderSuccess';
import Payment from './components/Payment';
import ProductList from './components/ProductList';
import { BuildProvider } from './context/BuildContext';
import { CartProvider } from './context/CartContext';
import './styles/main.css';

function App() {
  return (
    <BuildProvider>
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
              <Route path="/checkout" element={<Payment />} />
              <Route path="/order-success" element={<OrderSuccess />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </BuildProvider>
  );
}

export default App;
