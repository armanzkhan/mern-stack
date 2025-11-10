// Vercel serverless function for POST /api/auth/login
const { createHandler } = require('../_utils/handler');
const { login } = require('../../controllers/authController');

module.exports = createHandler(login, { requireAuth: false, connectDb: true });

