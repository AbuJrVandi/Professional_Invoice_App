const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const invoiceController = require('../controllers/invoiceController');

// Create a new invoice
router.post('/', authenticateJWT, invoiceController.createInvoice);

// Get all invoices
router.get('/', authenticateJWT, invoiceController.getInvoices);

// Get a specific invoice
router.get('/:id', authenticateJWT, invoiceController.getInvoice);

// Update an invoice
router.patch('/:id', authenticateJWT, invoiceController.updateInvoice);

// Delete an invoice
router.delete('/:id', authenticateJWT, invoiceController.deleteInvoice);

// Generate PDF for an invoice
router.get('/:id/pdf', authenticateJWT, invoiceController.generatePDF);

// Get all invoices for the authenticated user
router.get('/list', authenticateJWT, invoiceController.listInvoices);

module.exports = router; 