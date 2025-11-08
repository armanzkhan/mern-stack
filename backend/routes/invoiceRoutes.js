const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get all invoices
router.get('/', invoiceController.getInvoices);

// Get invoice statistics
router.get('/stats', invoiceController.getInvoiceStats);

// Get invoices by order number
router.get('/order/:orderNumber', invoiceController.getInvoicesByOrder);

// Get invoice by ID
router.get('/:id', invoiceController.getInvoiceById);

// Create invoice from order
router.post('/create-from-order', invoiceController.createInvoiceFromOrder);

// Create new invoice manually
router.post('/', invoiceController.createInvoice);

// Update invoice
router.put('/:id', invoiceController.updateInvoice);

// Delete invoice
router.delete('/:id', invoiceController.deleteInvoice);

// Duplicate invoice
router.post('/:id/duplicate', invoiceController.duplicateInvoice);

// Update invoice status
router.put('/:id/status', invoiceController.updateInvoiceStatus);

// Add payment to invoice
router.post('/:id/payment', invoiceController.addPayment);

module.exports = router;
