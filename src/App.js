// App.jsx
import React, { useState, useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import Cart from './components/Cart';
import CartIcon from './components/CartIcon';
import CategoryList from './components/CategoryList';
import OrderSuccess from './components/OrderSuccess';
import Payment from './components/Payment';
import ProductList from './components/ProductList';
import { BuildProvider } from './context/BuildContext';
import { CartProvider } from './context/CartContext';
import './styles/main.css';
import SimStore from './SimStore';
import Login from './login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import BottleneckChecker from './BottleneckChecker';

// Create Auth Context
export const AuthContext = React.createContext();

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);

    // Add/remove auth-page class based on current route
    const isAuthPage = ['/login', '/signup', '/forget-password'].includes(location.pathname);
    document.body.classList.toggle('auth-page', isAuthPage);
  }, [location.pathname]);

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <div>Loading...</div>;
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <BuildProvider>
        <CartProvider>
          <div className="app-container">
            {isAuthenticated && !['/login', '/signup', '/forget-password'].includes(location.pathname) && (
              <header className="app-header">
                <div className="header-left">
                  <Link to="/" className="header-title">
                    <h1>Product Store</h1>
                  </Link>
                  <Link to="/simstore" className="simstore-link">
                    <button className="simstore-btn">Simulation Store</button>
                  </Link>
                  <Link to="/bottleneck-checker" className="simstore-link">
                    <button className="simstore-btn">Bottleneck Checker</button>
                  </Link>
                </div>
                <CartIcon />
              </header>
            )}
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forget-password" element={<ForgotPassword />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <CategoryList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/:category"
                element={
                  <ProtectedRoute>
                    <ProductList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-success"
                element={
                  <ProtectedRoute>
                    <OrderSuccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/simstore"
                element={
                  <ProtectedRoute>
                    <SimStore />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bottleneck-checker"
                element={
                  <ProtectedRoute>
                    <BottleneckChecker />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </CartProvider>
      </BuildProvider>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
