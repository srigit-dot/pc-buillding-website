import React, { useEffect, useState } from 'react';
import { FaCreditCard, FaLock, FaMoneyBill, FaPaypal } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/Payment.css';

function Payment() {
  const navigate = useNavigate();
  const { cartItems, cartCount, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Fetch user address from localStorage or your auth system
  useEffect(() => {
    const savedAddress = localStorage.getItem('userAddress');
    if (savedAddress) {
      try {
        setUserAddress(JSON.parse(savedAddress));
      } catch (err) {
        console.error('Error parsing saved address:', err);
        localStorage.removeItem('userAddress');
      }
    }
  }, []);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (!userAddress) {
      setError('Shipping address is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare order data
      const orderData = {
        items: cartItems.map(item => ({
          productId: item._id,
          productName: item.productName,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity, 10)
        })),
        total: parseFloat(total),
        paymentMethod: paymentMethod.toLowerCase(),
        shippingAddress: {
          street: userAddress.street,
          city: userAddress.city,
          state: userAddress.state,
          zipCode: userAddress.zipCode
        }
      };

      console.log('Sending order data:', orderData);

      // Create order
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData),
      });

      let responseData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        responseData = await response.json();
      } else {
        // Handle non-JSON response
        const text = await response.text();
        throw new Error('Server returned non-JSON response: ' + text);
      }

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to process payment');
      }

      // Clear cart
      console.log('Order created successfully, clearing cart...');
      try {
        await clearCart();
        console.log('Cart cleared successfully');
        navigate('/order-success');
      } catch (clearError) {
        console.error('Error clearing cart:', clearError);
        // Even if cart clearing fails, the order was created successfully
        navigate('/order-success');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressUpdate = (updatedAddress) => {
    setUserAddress(updatedAddress);
    localStorage.setItem('userAddress', JSON.stringify(updatedAddress));
    setIsEditingAddress(false);
  };

  if (cartCount === 0) {
    return (
      <div className="payment-container empty">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/')} className="continue-shopping">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <h2>Checkout</h2>
      
      {/* Order Summary */}
      <div className="order-summary">
        <h3>Order Summary</h3>
        <div className="items-list">
          {cartItems.map((item) => (
            <div key={item._id} className="summary-item">
              <span className="item-name">{item.productName}</span>
              <span className="item-quantity">×{item.quantity}</span>
              <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="total">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="shipping-address">
        <h3>Shipping Address</h3>
        {userAddress && !isEditingAddress ? (
          <div className="address-display">
            <p>{userAddress.street}</p>
            <p>{userAddress.city}, {userAddress.state} {userAddress.zipCode}</p>
            <button 
              onClick={() => setIsEditingAddress(true)}
              className="edit-address"
            >
              Edit Address
            </button>
          </div>
        ) : (
          <AddressForm 
            address={userAddress || { street: '', city: '', state: '', zipCode: '' }}
            onSave={handleAddressUpdate}
            onCancel={() => setIsEditingAddress(false)}
          />
        )}
      </div>

      {/* Payment Method Selection */}
      <div className="payment-methods">
        <h3>Payment Method</h3>
        <div className="payment-options">
          <div
            className={`payment-option ${paymentMethod === 'credit-card' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('credit-card')}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="credit-card"
              checked={paymentMethod === 'credit-card'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <FaCreditCard />
            <span>Credit Card</span>
          </div>

          <div
            className={`payment-option ${paymentMethod === 'paypal' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('paypal')}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <FaPaypal />
            <span>PayPal</span>
          </div>

          <div
            className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
            onClick={() => setPaymentMethod('cash')}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <FaMoneyBill />
            <span>Cash on Delivery</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handlePaymentSubmit}
        disabled={loading || !paymentMethod || !userAddress}
        className="submit-payment"
      >
        {loading ? (
          'Processing...'
        ) : (
          <>
            <FaLock /> Complete Order (${total.toFixed(2)})
          </>
        )}
      </button>
    </div>
  );
}

// Address Form Component
const AddressForm = ({ address, onSave, onCancel }) => {
  const [formData, setFormData] = useState(address);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form className="address-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Street Address"
        value={formData.street}
        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="City"
        value={formData.city}
        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="State"
        value={formData.state}
        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="ZIP Code"
        value={formData.zipCode}
        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
        required
      />
      <div className="form-buttons">
        <button type="submit" className="save-address">Save Address</button>
        <button type="button" className="cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default Payment; 