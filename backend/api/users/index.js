// Vercel serverless function for /api/users routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const userRoutes = require('../../routes/userRoutes');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(userRoutes, { requireAuth: false, connectDb: true });
