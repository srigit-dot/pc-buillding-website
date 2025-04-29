const express = require('express');
const router = express.Router();
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Get all categories (this route should come before the parameterized route)
router.get('/categories/list', (req, res) => {
  const dataDir = path.join(__dirname, '../../data');
  
  try {
    const files = fs.readdirSync(dataDir);
    const categories = files
      .filter(file => path.extname(file).toLowerCase() === '.csv')
      .map(file => path.basename(file, '.csv'));
    
    res.json(categories);
  } catch (error) {
    console.error('Error reading categories:', error);
    res.status(500).json({ error: 'Failed to read categories' });
  }
});

// Get all products by category
router.get('/category/:categoryName', async (req, res) => {
  const category = req.params.categoryName;
  const filePath = path.join(__dirname, '../../data', `${category}.csv`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        res.json(results);
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        res.status(500).json({ error: 'Failed to read product data' });
      });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 