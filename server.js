const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

const PORT = 3001;

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

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
