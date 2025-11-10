// Vercel serverless function for /api/permissions routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const permissionRoutes = require('../../routes/permissionRoutes');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(permissionRoutes, { requireAuth: false, connectDb: true });
