// Vercel serverless function for /api/managers routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const managerRoutes = require('../../routes/managerRoutes');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(managerRoutes, { requireAuth: false, connectDb: true });
