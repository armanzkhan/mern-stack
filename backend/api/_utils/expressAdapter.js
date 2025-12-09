// Express-to-Vercel adapter that can handle Express Router
// This allows us to reuse existing Express routes with minimal changes

const { connectToDatabase } = require('./db');

/**
 * Converts an Express Router to a Vercel serverless function
 * @param {express.Router} router - Express router instance
 */
function expressRouterToVercel(router) {
  return async (req, res) => {
    try {
      // Connect to database
      await connectToDatabase();

      // Handle CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-company-id');

      // Handle preflight
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      // Create Express-like request/response objects
      const expressReq = {
        ...req,
        method: req.method,
        url: req.url,
        path: req.url.split('?')[0],
        query: new URL(req.url, `http://${req.headers.host}`).searchParams,
        body: req.body || {},
        headers: req.headers,
        get: (header) => req.headers[header.toLowerCase()],
      };

      const expressRes = {
        ...res,
        status: (code) => {
          res.statusCode = code;
          return expressRes;
        },
        json: (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.status(res.statusCode || 200);
          res.end(JSON.stringify(data));
        },
        send: (data) => {
          res.end(data);
        },
        end: () => {
          res.end();
        },
        setHeader: (name, value) => {
          res.setHeader(name, value);
        },
      };

      // Handle the request with Express router
      router(expressReq, expressRes, (err) => {
        if (err) {
          console.error('Router error:', err);
          if (!res.headersSent) {
            res.status(500).json({ error: err.message });
          }
        }
      });
    } catch (error) {
      console.error('Adapter error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  };
}

module.exports = { expressRouterToVercel };

