const express = require('express');
const cors = require('cors');
const app = express();
const partsData = require('./data/parts_bottleneck.json');

// Enable CORS with more permissive settings
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// API - Get all parts
app.get('/api/parts', (req, res) => {
  try {
    const cpuList = partsData.filter(p => p.type === 'cpu');
    const gpuList = partsData.filter(p => p.type === 'gpu');
    const monitorList = partsData.filter(p => p.type === 'monitor');
    console.log('CPU List:', cpuList.length);
    console.log('GPU List:', gpuList.length);
    console.log('Monitor List:', monitorList.length);
    res.json({ cpuList, gpuList, monitorList });
  } catch (error) {
    console.error('Error fetching parts:', error);
    res.status(500).json({ error: 'Failed to fetch parts' });
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

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`🚀 Bottleneck Server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET /api/parts');
});
