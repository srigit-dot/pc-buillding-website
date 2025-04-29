const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');

// Import routes
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();

// Enable CORS for all routes with more permissive settings
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

const PORT = process.env.PORT || 3003;

// Connect to MongoDB
connectDB();

// Mount API routes first
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route for the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('- GET /api/test');
  console.log('- GET /api/products/categories/list');
  console.log('- GET /api/products/category/:categoryName');
  console.log('- POST /api/cart');
  console.log('- DELETE /api/cart/item/:id');
  console.log('- POST /api/orders');
});
