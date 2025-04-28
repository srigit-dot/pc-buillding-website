const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const cors = require('cors');
const path = require('path');
const connectDB = require('./src/config/db');
const purchaseController = require('./src/controllers/purchaseController');
const cartController = require('./src/controllers/cartController');

const app = express();

// Enable CORS for all routes with more permissive settings
app.use(cors({
  origin: '*', // Allow all origins
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

const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Map category name to CSV path
const fileMap = {
    'case-accessory': path.join(__dirname, 'data/case-accessory.csv'),
    'case-fan': path.join(__dirname, 'data/case-fan.csv'),
    'case': path.join(__dirname, 'data/case.csv'),
    'cpu-cooler': path.join(__dirname, 'data/cpu-cooler.csv'),
    'cpu': path.join(__dirname, 'data/cpu.csv'),
    'external-hard-drive': path.join(__dirname, 'data/external-hard-drive.csv'),
    'fan-controller': path.join(__dirname, 'data/fan-controller.csv'),
    'headphones': path.join(__dirname, 'data/headphones.csv'),
    'internal-hard-drive': path.join(__dirname, 'data/internal-hard-drive.csv'),
    'keyboard': path.join(__dirname, 'data/keyboard.csv'),
    'memory': path.join(__dirname, 'data/memory.csv'),
    'monitor': path.join(__dirname, 'data/monitor.csv'),
    'motherboard': path.join(__dirname, 'data/motherboard.csv'),
    'mouse': path.join(__dirname, 'data/mouse.csv'),
    'optical-drive': path.join(__dirname, 'data/optical-drive.csv'),
    'os': path.join(__dirname, 'data/os.csv'),
    'power-supply': path.join(__dirname, 'data/power-supply.csv'),
    'sound-card': path.join(__dirname, 'data/sound-card.csv'),
    'speakers': path.join(__dirname, 'data/speakers.csv'),
    'thermal-paste': path.join(__dirname, 'data/thermal-paste.csv'),
    'ups': path.join(__dirname, 'data/ups.csv'),
    'video-card': path.join(__dirname, 'data/video-card.csv'),
    'webcam': path.join(__dirname, 'data/webcam.csv'),
    'wired-network-card': path.join(__dirname, 'data/wired-network-card.csv'),
    'wireless-network-card': path.join(__dirname, 'data/wireless-network-card.csv'),
  };
  

// CSV file reader
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

app.get('/categories', (req, res) => {
    const dataDir = path.join(__dirname, 'data');
    console.log('Reading directory:', dataDir);
  
    try {
      const files = fs.readdirSync(dataDir);
      console.log('Files found:', files);
  
      const categories = files
        .filter(file => path.extname(file).toLowerCase() === '.csv')
        .map(file => path.basename(file, '.csv'));
  
      console.log('Categories:', categories);
      res.json(categories);
    } catch (err) {
      console.error('Error reading directory:', err);
      res.status(500).json({ error: 'Failed to read categories' });
    }
  });
  
  

// Route to fetch product data by category
app.get('/products/:category', async (req, res) => {
  const category = req.params.category;
  const filePath = fileMap[category];

  if (!filePath) {
    return res.status(404).json({ error: 'Invalid category' });
  }

  try {
    const data = await readCSV(filePath);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read CSV' });
  }
});

// Purchase routes
app.post('/api/purchases', purchaseController.createPurchase);
app.get('/api/purchases', purchaseController.getPurchases);
app.get('/api/purchases/:id', purchaseController.getPurchaseById);
app.patch('/api/purchases/:id/status', purchaseController.updatePurchaseStatus);
app.delete('/api/purchases/:id', purchaseController.cancelPurchase);

// Cart routes
app.post('/api/cart', async (req, res, next) => {
  try {
    console.log('Received cart request:', req.body);
    if (!req.body.productId || !req.body.productName || !req.body.price) {
      console.error('Missing required fields:', req.body);
      return res.status(400).json({ 
        message: 'Missing required fields',
        received: req.body
      });
    }
    await cartController.addToCart(req, res, next);
  } catch (error) {
    console.error('Error in cart route:', error);
    next(error);
  }
});

app.get('/api/cart', async (req, res, next) => {
  try {
    console.log('Fetching cart items');
    await cartController.getCartItems(req, res, next);
  } catch (error) {
    console.error('Error fetching cart:', error);
    next(error);
  }
});

app.patch('/api/cart/:id', async (req, res, next) => {
  try {
    console.log('Updating cart item:', req.params.id);
    await cartController.updateCartItem(req, res, next);
  } catch (error) {
    console.error('Error updating cart:', error);
    next(error);
  }
});

app.delete('/api/cart/:id', async (req, res, next) => {
  try {
    console.log('Removing cart item:', req.params.id);
    await cartController.removeFromCart(req, res, next);
  } catch (error) {
    console.error('Error removing from cart:', error);
    next(error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: err.message 
  });
});

// Test route with CORS headers
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.json({ 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('- GET /api/test');
  console.log('- POST /api/cart');
  console.log('- GET /api/cart');
  console.log('- PATCH /api/cart/:id');
  console.log('- DELETE /api/cart/:id');
});
