// Vercel serverless function for /api/product-categories routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const categoryRoutes = require('../../routes/categoryRoutes');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(categoryRoutes, { requireAuth: false, connectDb: true });
