const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

// Create a new purchase
router.post('/', purchaseController.createPurchase);

// Get all purchases
router.get('/', purchaseController.getPurchases);

// Update purchase status (specific route should come before parameterized route)
router.patch('/status/:id', purchaseController.updatePurchaseStatus);

// Get purchase by ID
router.get('/purchase/:id', purchaseController.getPurchaseById);

// Cancel purchase
router.delete('/purchase/:id', purchaseController.cancelPurchase);

module.exports = router; 