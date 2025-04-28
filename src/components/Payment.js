import React, { useState } from 'react';
import { FaCreditCard, FaPaypal, FaUniversity } from 'react-icons/fa';
import { SiRazorpay } from 'react-icons/si';
import '../styles/Payment.css';

const Payment = ({ amount, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    accountNumber: '',
    accountName: '',
    bankName: '',
    ifscCode: '',
    upiId: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Here you would typically integrate with a payment gateway
      console.log('Payment details:', { paymentMethod, ...formData });
      onPaymentComplete({ success: true, paymentMethod });
    } catch (error) {
      console.error('Payment failed:', error);
      onPaymentComplete({ success: false, error: error.message });
    }
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'credit_card':
        return (
          <div className="payment-form-section">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
                required
              />
            </div>
            <div className="form-group">
              <label>Card Holder Name</label>
              <input
                type="text"
                name="cardName"
                value={formData.cardName}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  maxLength="5"
                  required
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="password"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  maxLength="3"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'net_banking':
        return (
          <div className="payment-form-section">
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Enter your account number"
                required
              />
            </div>
            <div className="form-group">
              <label>Account Holder Name</label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                placeholder="Enter account holder name"
                required
              />
            </div>
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="Enter bank name"
                required
              />
            </div>
            <div className="form-group">
              <label>IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="Enter IFSC code"
                required
              />
            </div>
          </div>
        );

      case 'razorpay':
        return (
          <div className="payment-form-section">
            <div className="razorpay-info">
              <p>You will be redirected to Razorpay's secure payment gateway.</p>
              <p>Amount to be paid: ${amount}</p>
            </div>
          </div>
        );

      case 'upi':
        return (
          <div className="payment-form-section">
            <div className="form-group">
              <label>UPI ID</label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                placeholder="username@upi"
                required
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="payment-container">
      <h2>Payment Details</h2>
      <div className="amount-display">
        <span>Total Amount:</span>
        <span className="amount">${amount}</span>
      </div>

      <div className="payment-methods">
        <button
          className={`payment-method ${paymentMethod === 'credit_card' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('credit_card')}
        >
          <FaCreditCard /> Credit Card
        </button>
        <button
          className={`payment-method ${paymentMethod === 'net_banking' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('net_banking')}
        >
          <FaUniversity /> Net Banking
        </button>
        <button
          className={`payment-method ${paymentMethod === 'razorpay' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('razorpay')}
        >
          <SiRazorpay /> Razorpay
        </button>
        <button
          className={`payment-method ${paymentMethod === 'upi' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('upi')}
        >
          <FaPaypal /> UPI
        </button>
      </div>

      <form onSubmit={handleSubmit} className="payment-form">
        {renderPaymentForm()}
        <button type="submit" className="pay-button">
          Pay ${amount}
        </button>
      </form>
    </div>
  );
};

export default Payment; 