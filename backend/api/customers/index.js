// Vercel serverless function for /api/customers routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const customerRoutes = require('../../routes/customerRoutes');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(customerRoutes, { requireAuth: false, connectDb: true });
