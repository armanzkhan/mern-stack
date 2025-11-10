// Vercel serverless function for /api/products routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const productRoutes = require('../../routes/productRoutes');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(productRoutes, { requireAuth: false, connectDb: true });
