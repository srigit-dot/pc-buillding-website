const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

// Import routes
const orderRoutes = require('./src/routes/orderRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const purchaseRoutes = require('./src/routes/purchaseRoutes');

// Import models
const Order = require('./src/models/Order');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pcBuilder')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// API Routes - must come before static file serving
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/purchases', purchaseRoutes);

app.get('/api/ai-build', async (req, res) => {
  console.log('Received request:', req.query);
  
  const { task, budget } = req.query;
  const budgetInDollars = parseFloat(budget);

  if (!task || isNaN(budgetInDollars)) {
    console.log('Invalid request parameters:', { task, budget });
    return res.status(400).json({ error: 'Missing or invalid task/budget' });
  }

  try {
    const filePath = path.join(__dirname, 'data', 'ml_validatedpc.json');
    console.log('Looking for file at:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.log('File not found:', filePath);
      return res.status(500).json({ error: 'PC component data file not found' });
    }

    console.log('Reading file...');
    const rawData = fs.readFileSync(filePath, 'utf8');
    console.log('File read successfully, length:', rawData.length);
    
    const pcData = JSON.parse(rawData);
    console.log('JSON parsed successfully, items:', pcData.length);
    
    // Group components by type and filter out invalid prices
    const groupedComponents = {};
    pcData.forEach(component => {
      const type = component.type.toUpperCase();
      const price = parseFloat(component.price);
      
      // Only include components with valid prices
      if (!isNaN(price) && price > 0) {
        if (!groupedComponents[type]) {
          groupedComponents[type] = [];
        }
        groupedComponents[type].push({
          ...component,
          price: price,
          score: getScoreForTask(component, task)
        });
      }
    });

    // Define budget allocation percentages based on task
    const budgetAllocation = {
      general: {
        CPU: 0.25,
        GPU: 0.30,
        RAM: 0.10,
        STORAGE: 0.10,
        MOTHERBOARD: 0.10,
        PSU: 0.08,
        CASE: 0.07
      },
      cpu: {
        CPU: 0.35,
        GPU: 0.25,
        RAM: 0.12,
        STORAGE: 0.10,
        MOTHERBOARD: 0.10,
        PSU: 0.05,
        CASE: 0.03
      },
      gpu: {
        CPU: 0.20,
        GPU: 0.40,
        RAM: 0.10,
        STORAGE: 0.10,
        MOTHERBOARD: 0.10,
        PSU: 0.07,
        CASE: 0.03
      }
    };

    // Get allocation for current task or use general as default
    const allocation = budgetAllocation[task] || budgetAllocation.general;

    // Select components based on budget allocation
    const selectedBuild = [];
    let totalPrice = 0;

    for (const [type, percentage] of Object.entries(allocation)) {
      const typeBudget = budgetInDollars * percentage;
      const availableComponents = groupedComponents[type] || [];
      
      // Sort components by score and filter by budget
      const sortedComponents = availableComponents
        .filter(comp => comp.price <= typeBudget && comp.price > 0)
        .sort((a, b) => b.score - a.score);

      if (sortedComponents.length > 0) {
        const selectedComponent = sortedComponents[0];
        selectedBuild.push({
          type: selectedComponent.type,
          model: selectedComponent.name,
          price: selectedComponent.price,
          score: selectedComponent.score,
          capacity: selectedComponent.type === 'STORAGE' ? extractStorageCapacity(selectedComponent.name) : null
        });
        totalPrice += selectedComponent.price;
      } else {
        console.log(`No valid components found for ${type} within budget ${typeBudget}`);
      }
    }

    // If no components were selected, return an error
    if (selectedBuild.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No components found within the specified budget',
        budget: budgetInDollars
      });
    }

    const response = {
      success: true,
      message: 'Build generated successfully',
      task,
      budget: budgetInDollars,
      build: selectedBuild,
      totalPrice: totalPrice
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error('Build generation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate build',
      details: error.message 
    });
  }
});

// Add a route for /api/components/:task
app.get('/api/components/:task', (req, res) => {
  const task = req.params.task;
  console.log(`Fetching components for task: ${task}`);
  
  // Sample component data based on task type
  let components = [];
  
  if (task === 'general') {
    components = [
      { type: 'CPU', model: 'Intel Core i5-12400', price: 200 },
      { type: 'GPU', model: 'NVIDIA GeForce GTX 1660', price: 250 },
      { type: 'RAM', model: 'Corsair Vengeance 16GB', price: 80 },
      { type: 'Storage', model: 'Samsung 970 EVO 500GB', price: 70 },
      { type: 'Motherboard', model: 'MSI B660M-A', price: 150 },
      { type: 'PSU', model: 'EVGA 600W Bronze', price: 60 },
      { type: 'Case', model: 'NZXT H510', price: 90 }
    ];
  } else if (task === 'cpu') {
    components = [
      { type: 'CPU', model: 'AMD Ryzen 7 5800X', price: 350 },
      { type: 'GPU', model: 'NVIDIA GeForce RTX 3060', price: 350 },
      { type: 'RAM', model: 'G.Skill Ripjaws 32GB', price: 120 },
      { type: 'Storage', model: 'WD Black 1TB', price: 100 },
      { type: 'Motherboard', model: 'ASUS ROG B550-F', price: 180 },
      { type: 'PSU', model: 'Corsair RM750', price: 100 },
      { type: 'Case', model: 'Lian Li Lancool II', price: 120 }
    ];
  } else if (task === 'gpu') {
    components = [
      { type: 'CPU', model: 'Intel Core i7-12700K', price: 400 },
      { type: 'GPU', model: 'NVIDIA GeForce RTX 3070', price: 500 },
      { type: 'RAM', model: 'Corsair Dominator 32GB', price: 150 },
      { type: 'Storage', model: 'Samsung 980 Pro 1TB', price: 130 },
      { type: 'Motherboard', model: 'MSI MPG Z690', price: 250 },
      { type: 'PSU', model: 'EVGA 850W Gold', price: 130 },
      { type: 'Case', model: 'Phanteks Enthoo 719', price: 200 }
    ];
  } else {
    return res.status(400).json({ error: 'Invalid task type' });
  }
  
  res.json(components);
});

// Helper function to extract storage capacity from part name
function extractStorageCapacity(name) {
  if (!name) return null;
  
  const nameLower = name.toLowerCase();
  
  // Try to extract capacity from common patterns
  const gbMatch = nameLower.match(/(\d+)\s*gb/i);
  if (gbMatch) return parseInt(gbMatch[1]);
  
  const tbMatch = nameLower.match(/(\d+)\s*tb/i);
  if (tbMatch) return parseInt(tbMatch[1]) * 1024; // Convert TB to GB
  
  // Check for common storage sizes
  if (nameLower.includes('1tb') || nameLower.includes('1 tb')) return 1024;
  if (nameLower.includes('2tb') || nameLower.includes('2 tb')) return 2048;
  if (nameLower.includes('500gb') || nameLower.includes('500 gb')) return 500;
  if (nameLower.includes('250gb') || nameLower.includes('250 gb')) return 250;
  if (nameLower.includes('120gb') || nameLower.includes('120 gb')) return 120;
  if (nameLower.includes('240gb') || nameLower.includes('240 gb')) return 240;
  if (nameLower.includes('480gb') || nameLower.includes('480 gb')) return 480;
  if (nameLower.includes('960gb') || nameLower.includes('960 gb')) return 960;
  
  return null; // Return null if capacity can't be determined
}

function getScoreForTask(part, task) {
  const baseScore = parseFloat(part.benchmark_score) || 0;
  const threads = parseInt(part.threads || 1);
  const vram = parseInt(part.vram || 1);
  const cores = parseInt(part.cores || 1);
  const type = part.type.toUpperCase();
  const name = part.name.toLowerCase();

  // Boost scores for higher-end models
  let modelBoost = 1.0;
  if (type === 'CPU') {
    if (name.includes('i9') || name.includes('ryzen 9')) modelBoost = 1.5;
    else if (name.includes('i7') || name.includes('ryzen 7')) modelBoost = 1.3;
    else if (name.includes('i5') || name.includes('ryzen 5')) modelBoost = 1.1;
    else if (name.includes('i3') || name.includes('ryzen 3')) modelBoost = 1.0;
    else if (name.includes('celeron') || name.includes('atom')) modelBoost = 0.5;
  } else if (type === 'GPU') {
    if (name.includes('rtx 4090') || name.includes('rtx 4080')) modelBoost = 1.5;
    else if (name.includes('rtx 4070') || name.includes('rtx 3070')) modelBoost = 1.3;
    else if (name.includes('rtx 3060') || name.includes('rtx 2060')) modelBoost = 1.1;
    else if (name.includes('gtx 1660') || name.includes('gtx 1650')) modelBoost = 1.0;
    else if (name.includes('gt 710') || name.includes('gt 730')) modelBoost = 0.5;
  }

  switch (task) {
    case 'cpu':
      if (type === 'CPU') {
        // Enhanced CPU scoring for CPU-intensive tasks
        return (baseScore + (threads * 25) + (cores * 15)) * modelBoost;
      }
      if (type === 'GPU') return baseScore * 0.3;
      if (type === 'RAM') return baseScore * 1.5; // RAM is more important for CPU tasks
      break;
    case 'gpu':
      if (type === 'GPU') {
        // Enhanced GPU scoring for GPU-intensive tasks
        return (baseScore + (vram * 30)) * modelBoost;
      }
      if (type === 'CPU') return baseScore * 0.3;
      if (type === 'PSU') return baseScore * 1.2; // PSU is more important for GPU tasks
      break;
    case 'general':
      // Balanced scoring for general tasks
      if (type === 'CPU') return (baseScore + (threads * 15)) * modelBoost;
      if (type === 'GPU') return (baseScore + (vram * 15)) * modelBoost;
      break;
  }

  return baseScore * modelBoost;
}

function getCombinations(groupedParts) {
  const categories = Object.keys(groupedParts);
  const results = [];

  function helper(currentBuild, depth) {
    if (depth === categories.length) {
      results.push(currentBuild);
      return;
    }

    const cat = categories[depth];
    for (let part of groupedParts[cat]) {
      helper([...currentBuild, part], depth + 1);
    }
  }

  helper([], 0);
  return results;
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));