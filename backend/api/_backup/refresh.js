// Vercel serverless function for POST /api/auth/refresh
const { createHandler } = require('../_utils/handler');
const { refresh } = require('../../controllers/authController');

module.exports = createHandler(refresh, { requireAuth: false, connectDb: true });

