import React, { useState, useContext } from "react";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./App";

const Login = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        // Store the token in localStorage
        localStorage.setItem('token', data.token);
        // Update authentication state
        setIsAuthenticated(true);
        // Navigate to home page
        navigate("/");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Error logging in. Please try again.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-container">
      <div className="circle-animation"></div>
      <div className="login-box">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
        <div className="login-links">
          <Link to="/signup">Don't have an account? Sign up</Link>
          <Link to="/forget-password">Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
