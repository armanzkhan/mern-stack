// Vercel serverless function for /api/invoices routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const invoiceRoutes = require('../../routes/invoiceRoutes');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(invoiceRoutes, { requireAuth: false, connectDb: true });
