// Vercel serverless function for POST /api/auth/register
const { createHandler } = require('../_utils/handler');
const { register } = require('../../controllers/authController');

module.exports = createHandler(register, { requireAuth: false, connectDb: true });

