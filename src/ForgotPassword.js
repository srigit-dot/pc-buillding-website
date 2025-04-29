import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // 1. Send OTP to email
  const sendOtpToEmail = async () => {
    try {
      const response = await fetch("http://localhost:5000/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: email }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setOtpSent(true);
        setError("");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  // 2. Verify OTP
  const verifyOtp = async () => {
    try {
      const response = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: email, otp: enteredOtp }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setOtpVerified(true);
        setError("");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error verifying OTP. Please try again.");
    }
  };

  // 3. Handle password reset
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail: email, newPassword }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setError("");
        alert("Password reset successful!");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error resetting password. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="circle-animation"></div>
      <div className="login-box">
        <h2>Forgot Password</h2>

        {!otpSent ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={sendOtpToEmail}>Send OTP</button>
          </>
        ) : !otpVerified ? (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
            />
            <button onClick={verifyOtp}>Verify OTP</button>
          </>
        ) : (
          <>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={handleResetPassword}>Reset Password</button>
          </>
        )}

        {error && <div className="error">{error}</div>}

        <div className="options">
          <Link to="/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
