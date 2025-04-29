import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Update cart count whenever cartItems changes
    const newCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(newCount);
  }, [cartItems]);

  const addToCart = async (product) => {
    try {
      const response = await fetch('http://localhost:3001/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      const newItem = await response.json();
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item._id === newItem._id);
        if (existingItem) {
          return prevItems.map(item =>
            item._id === newItem._id
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
        }
        return [...prevItems, newItem];
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch(`http://localhost:3001/api/cart/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }

      const updatedItem = await response.json();
      setCartItems(prevItems =>
        prevItems.map(item =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const removeItem = async (itemId) => {
    try {
      console.log('Attempting to remove item:', itemId);
      
      if (!itemId) {
        throw new Error('No item ID provided for deletion');
      }
      
      const response = await fetch(`http://localhost:3001/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Delete response:', data);

      if (!response.ok) {
        console.error('Failed to remove item:', data);
        throw new Error(data.message || 'Failed to remove item');
      }

      if (!data.success) {
        console.error('Operation not successful:', data);
        throw new Error(data.message || 'Failed to remove item');
      }

      console.log('Item removed successfully:', data);
      setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error in removeItem:', error);
      // Show a more user-friendly error message
      const errorMessage = error.message === 'Failed to fetch' 
        ? 'Unable to connect to the server. Please check your connection and try again.'
        : error.message;
      throw new Error(errorMessage);
    }
  };

  const clearCart = async () => {
    try {
      console.log('Attempting to clear cart...');
      const response = await fetch('http://localhost:3001/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Server responded with error:', data);
        throw new Error(data.message || 'Failed to clear cart');
      }

      if (!data.success) {
        console.error('Operation not successful:', data);
        throw new Error(data.message || 'Failed to clear cart');
      }

      console.log('Cart cleared successfully:', data);
      setCartItems([]);
      return data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      setCartItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};