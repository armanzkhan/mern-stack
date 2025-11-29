const express = require('express');
const router = express.Router();
const customerLedgerController = require('../controllers/customerLedgerController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Customer ledger routes
router.get('/customers/:customerId/ledger', customerLedgerController.getCustomerLedger);
router.get('/customers/ledgers', customerLedgerController.getAllCustomerLedgers);
router.post('/customers/:customerId/payments', customerLedgerController.recordPayment);
router.put('/customers/:customerId/ledger', customerLedgerController.updateCustomerLedger);
router.get('/customers/ledger/aging', customerLedgerController.getAgingAnalysis);
router.get('/customers/ledger/summary', customerLedgerController.getCustomerLedgerSummary);

module.exports = router;
