import React, { useState } from 'react';
import '../styles/PurchaseForm.css';

const PurchaseForm = ({ product, onPurchaseComplete }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    paymentMethod: 'credit_card',
    quantity: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const purchaseData = {
        productId: product.id,
        productName: product.name,
        price: product.price,
        ...formData
      };

      const response = await fetch('http://localhost:3001/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });

      if (!response.ok) {
        throw new Error('Purchase failed');
      }

      const result = await response.json();
      onPurchaseComplete(result);
      alert('Purchase successful!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to complete purchase. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="purchase-form">
      <h2>Complete Your Purchase</h2>
      <div className="form-group">
        <label>Name:</label>
        <input
          type="text"
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          name="customerEmail"
          value={formData.customerEmail}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Street:</label>
        <input
          type="text"
          name="shippingAddress.street"
          value={formData.shippingAddress.street}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>City:</label>
        <input
          type="text"
          name="shippingAddress.city"
          value={formData.shippingAddress.city}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>State:</label>
        <input
          type="text"
          name="shippingAddress.state"
          value={formData.shippingAddress.state}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Zip Code:</label>
        <input
          type="text"
          name="shippingAddress.zipCode"
          value={formData.shippingAddress.zipCode}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Country:</label>
        <input
          type="text"
          name="shippingAddress.country"
          value={formData.shippingAddress.country}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Payment Method:</label>
        <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          required
        >
          <option value="credit_card">Credit Card</option>
          <option value="debit_card">Debit Card</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>
      <div className="form-group">
        <label>Quantity:</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          required
        />
      </div>
      <button type="submit" className="submit-button">Complete Purchase</button>
    </form>
  );
};

export default PurchaseForm; 