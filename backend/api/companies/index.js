// Vercel serverless function for /api/companies routes
// Uses Express router adapter to reuse existing routes

const { createRouterHandler } = require('../_utils/expressRouter');
const companyRoutes = require('../../routes/companyRoutes');

// Convert Express router to Vercel handler
module.exports = createRouterHandler(companyRoutes, { requireAuth: false, connectDb: true });
