// Vercel serverless function for /api/customer-ledger routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const customerLedgerRoutes = require('../../routes/customerLedgerRoutes');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(customerLedgerRoutes, { requireAuth: false, connectDb: true });
