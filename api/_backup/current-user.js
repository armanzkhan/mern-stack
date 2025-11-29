// Vercel serverless function for GET /api/auth/current-user
const { createHandler } = require('../_utils/handler');
const { getCurrentUser } = require('../../controllers/authController');

module.exports = createHandler(getCurrentUser, { requireAuth: true, connectDb: true });

