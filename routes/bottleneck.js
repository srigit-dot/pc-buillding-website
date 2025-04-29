const express = require('express');
const { calculateBottleneck } = require('../utils/bottleneck');

const router = express.Router();

// POST /api/bottleneck
router.post('/', (req, res) => {
  try {
    const result = calculateBottleneck(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
