// Vercel serverless function for /api/orders routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const orderRoutes = require('../../routes/orderRoutes');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(orderRoutes, { requireAuth: false, connectDb: true });
