const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const { authenticateJWT } = require('../middleware/auth');

// Create a new receipt
router.post('/', authenticateJWT, receiptController.createReceipt);

// Get all receipts for the authenticated user
router.get('/', authenticateJWT, receiptController.listReceipts);

// Get a specific receipt
router.get('/:id', authenticateJWT, receiptController.getReceipt);

// Generate PDF for a receipt
router.get('/:id/pdf', authenticateJWT, receiptController.generatePDF);

module.exports = router; 