// Vercel serverless function for /api/auth routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const authRoutes = require('../../routes/authRoutes');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(authRoutes, { requireAuth: false, connectDb: true });
