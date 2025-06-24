const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/pcBuilder", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Add this after mongoose connection
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// User schema
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  mail: String,
  otp: String, 
  address: String 
});

const User = mongoose.model("User", UserSchema);
//signup
app.post("/signup", async (req, res) => {
  const { username, password,  mail, address } = req.body;
  console.log(req.body)
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const newUser = new User({ username, password, mail, address });
    await newUser.save();

    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });

    if (user) {
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      res.json({ 
        message: "Login successful",
        token: token,
        user: { name: user.username }
      });
    } else {
      res.status(401).json({ message: "Wrong username or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
const nodemailer = require('nodemailer');

// Route: Send OTP to email
app.post("/send-otp", async (req, res) => {
  const { mail } = req.body;

  const user = await User.findOne({ mail });
  if (!user) return res.status(404).json({ message: "Email not found" });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP in the user's document
  user.otp = otp;
  await user.save();

  // Send email using nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "drunkendog4@gmail.com",       // <-- replace with your email
      pass: "siov qool hqrn svci",          // <-- use App Password if Gmail
    },
  });

  const mailOptions = {
    from: "your-email@gmail.com",
    to: mail,
    subject: "Your OTP for password reset",
    text: `Your OTP is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Error sending OTP email:", err);
      return res.status(500).json({ message: "Failed to send email" });
    } else {
      console.log("OTP email sent:", info.response);
      return res.json({ message: "OTP sent successfully" });
    }
  });
});

// Route: Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { mail, otp } = req.body;

  const user = await User.findOne({ mail });
  if (!user || user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  return res.json({ message: "OTP verified" });
});

// Route: Reset Password
app.post("/reset-password", async (req, res) => {
  const { mail, newPassword } = req.body;

  const user = await User.findOne({ mail });
  if (!user) return res.status(404).json({ message: "User not found" });

  user.password = newPassword;
  user.otp = ""; // clear OTP
  await user.save();

  res.json({ message: "Password reset successful" });
});
