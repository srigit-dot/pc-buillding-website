import React, { useState } from "react";
import "./signup.css";
import { Link, useNavigate } from "react-router-dom";
const Signup = () => {
    const navigate= useNavigate()
  const [form, setForm] = useState({
    username: "",
    password: "",
    mail: "",
    address: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async () => {
    try {
        console.log("Form data:", form);

      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      alert(data.message);
      navigate('/login')
    } catch (err) {
      alert("Error during signup");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-circle"></div>
      <div className="signup-box">
        <h2>Signup</h2>
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <input name="mail" placeholder="Email" onChange={handleChange} />
        <input
          name="address"
          placeholder="Address"
          onChange={handleChange}
        />
        <button onClick={handleSignup}>Register</button>
        <div className="signup-options">
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
