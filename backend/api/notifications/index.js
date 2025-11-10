// Vercel serverless function for /api/notifications routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const notificationRoutes = require('../../routes/notificationRoutes');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(notificationRoutes, { requireAuth: false, connectDb: true });
