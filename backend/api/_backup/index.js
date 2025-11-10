// Vercel serverless function for /api/product-images routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const productImageRoutes = require('../../routes/productImageRoutes');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(productImageRoutes, { requireAuth: false, connectDb: true });
