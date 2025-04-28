const Purchase = require('../models/Purchase');

// Create a new purchase
exports.createPurchase = async (req, res) => {
  try {
    const purchase = new Purchase(req.body);
    await purchase.save();
    res.status(201).json(purchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all purchases
exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find();
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single purchase by ID
exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update purchase status
exports.updatePurchaseStatus = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    purchase.status = req.body.status;
    await purchase.save();
    
    res.json(purchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel a purchase
exports.cancelPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    if (purchase.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel a delivered purchase' });
    }
    
    purchase.status = 'cancelled';
    await purchase.save();
    
    res.json(purchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 