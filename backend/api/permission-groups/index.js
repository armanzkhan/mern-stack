// Vercel serverless function for /api/permission-groups routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const permissionGroupRoutes = require('../../routes/permissionGroupRoutes');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(permissionGroupRoutes, { requireAuth: false, connectDb: true });
