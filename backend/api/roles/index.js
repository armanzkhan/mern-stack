// Vercel serverless function for /api/roles routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const roleRoutes = require('../../routes/roleRoutes');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(roleRoutes, { requireAuth: false, connectDb: true });
