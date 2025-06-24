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

// API - Calculate bottleneck
app.post('/api/bottleneck', (req, res) => {
  try {
    const { selectedCPU, selectedGPU, selectedMonitor, taskType } = req.body;

    if (!selectedCPU || !selectedGPU) {
      return res.status(400).json({ error: 'CPU and GPU must be selected' });
    }

    const cpuScore = selectedCPU.benchmark_score;
    const gpuScore = selectedGPU.benchmark_score;
    const resolution = selectedMonitor?.resolution || '1920x1080';

    let bottleneck = Math.abs(cpuScore - gpuScore) / Math.max(cpuScore, gpuScore) * 100;

    // Adjust based on usage
    if (taskType === 'Gaming' && (resolution.includes('3840') || resolution.includes('4K'))) {
      bottleneck *= 0.8; // GPU focus
    } else if (taskType === 'Gaming' && resolution.includes('1920')) {
      bottleneck *= 1.2; // CPU load
    } else if (taskType === 'CPU-Intensive') {
      bottleneck *= 1.5;
    } else if (taskType === 'GPU-Intensive') {
      bottleneck *= 0.7;
    }

    let suggestion = "Ideal build!";
    if (bottleneck > 20) {
      suggestion = cpuScore > gpuScore ? "GPU upgrade suggested" : "CPU upgrade suggested";
    } else if (bottleneck > 10) {
      suggestion = "Minor imbalance. Still acceptable.";
    }

    res.json({ bottleneck: bottleneck.toFixed(2), suggestion });
  } catch (error) {
    console.error('Error calculating bottleneck:', error);
    res.status(500).json({ error: 'Failed to calculate bottleneck' });
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
  console.log('- POST /api/bottleneck');
});
