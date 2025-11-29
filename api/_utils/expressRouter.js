// Express Router adapter for Vercel serverless functions
// This allows Express routes to work in Vercel serverless environment

const express = require('express');
const { connectToDatabase } = require('./db');

/**
 * Creates a Vercel serverless function from an Express router
 * @param {express.Router} router - Express router instance
 * @param {Object} options - Options
 */
function createRouterHandler(router, options = {}) {
  const { requireAuth = false, connectDb = true } = options;

  return async (req, res) => {
    try {
      // Connect to database
      if (connectDb) {
        await connectToDatabase();
      }

      // Handle CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-company-id');

      // Handle preflight
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      // Create Express app to handle the router
      const app = express();
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));

      // Apply auth middleware if needed
      if (requireAuth) {
        const authMiddleware = require('../../middleware/authMiddleware');
        app.use(authMiddleware);
      }

      // Mount the router
      app.use('/', router);

      // Handle the request
      app(req, res, (err) => {
        if (err) {
          console.error('Router error:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: err.message });
          }
        }
      });
    } catch (error) {
      console.error('Router handler error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  };
}

module.exports = { createRouterHandler };

