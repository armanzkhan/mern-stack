# Deployment Guide: Frontend on Netlify + Backend on Vercel

## Architecture Overview

```
Frontend (Next.js) → Netlify (FREE)
Backend (Express) → Vercel Serverless Functions (FREE)
Database → MongoDB Atlas (FREE)
```

## ⚠️ Important Considerations

### Backend on Vercel - Challenges

Vercel is designed for **serverless functions**, not long-running Express servers. Your current backend needs significant modifications:

1. **WebSocket Support**: Limited on Vercel (you'll need an alternative like Pusher or Ably)
2. **File Uploads**: Need to use external storage (Cloudinary, AWS S3, etc.)
3. **Execution Time**: 10 seconds on free tier, 60 seconds on pro
4. **MongoDB Connections**: Need connection pooling/reuse strategies
5. **Express Routes**: Must be converted to individual serverless functions

## 📋 Deployment Steps

### Part 1: Frontend on Netlify (Easy ✅)

#### Step 1: Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up for free account
3. Connect your GitHub account

#### Step 2: Deploy Frontend
1. **Via Dashboard** (Recommended):
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository
   - Configure:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`

2. **Via CLI**:
   ```bash
   cd frontend
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

#### Step 3: Set Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables:
```
NEXT_PUBLIC_BACKEND_URL=https://your-vercel-backend.vercel.app
NEXT_PUBLIC_API_URL=https://your-vercel-backend.vercel.app
```

### Part 2: Backend on Vercel (Complex ⚠️)

#### Option A: Convert to Vercel Serverless Functions (Recommended for Vercel)

This requires restructuring your Express app into individual serverless functions.

**Step 1: Create Vercel Configuration**

Create `backend/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

**Step 2: Convert Express Routes to Serverless Functions**

Each route needs to become a separate function in `backend/api/`:

Example: `backend/api/auth/login.js`
```javascript
const mongoose = require('mongoose');
const authController = require('../../controllers/authController');

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const uri = process.env.CONNECTION_STRING;
  const client = await mongoose.connect(uri);
  cachedDb = client;
  return cachedDb;
}

module.exports = async (req, res) => {
  await connectToDatabase();
  
  if (req.method === 'POST') {
    return authController.login(req, res);
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
};
```

**Step 3: Handle WebSocket Alternative**

Since Vercel doesn't support WebSocket, you'll need:
- **Pusher** (free tier available)
- **Ably** (free tier available)
- Or remove real-time features

**Step 4: Handle File Uploads**

Use external storage:
- **Cloudinary** (free tier)
- **AWS S3** (pay-as-you-go)
- **Vercel Blob Storage** (paid)

#### Option B: Use Vercel for API Routes Only (Simpler)

Keep your Express server but deploy only API routes as serverless functions.

### Part 3: Alternative Recommendation

**Consider using Railway or Render for backend instead:**

- ✅ **Easier**: No code changes needed
- ✅ **Better**: Full Express support, WebSocket, file uploads
- ✅ **Free**: Both have free tiers
- ✅ **Faster**: Less setup time

**Recommended Architecture:**
```
Frontend (Next.js) → Netlify (FREE)
Backend (Express) → Railway or Render (FREE)
Database → MongoDB Atlas (FREE)
```

## 🚀 Quick Start (Recommended Approach)

### 1. Deploy Frontend to Netlify
```bash
cd frontend
# Push to GitHub first
git push origin main

# Then deploy via Netlify dashboard or CLI
netlify deploy --prod
```

### 2. Deploy Backend to Railway (Easier than Vercel)
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Select `backend` folder
4. Add environment variables
5. Deploy

### 3. Connect Everything
- Set `NEXT_PUBLIC_BACKEND_URL` in Netlify to your Railway backend URL
- Update CORS in backend to allow Netlify domain

## 📝 Environment Variables

### Frontend (Netlify)
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Backend (Vercel or Railway)
```
CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/Ressichem?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
PORT=5000
NODE_ENV=production
```

## ⚡ Next Steps

1. **If using Netlify + Vercel**: Prepare for significant backend refactoring
2. **If using Netlify + Railway**: Much simpler, deploy as-is
3. **Test deployment**: Verify all endpoints work
4. **Update CORS**: Add Netlify domain to backend CORS whitelist

## 💡 Recommendation

**For easiest deployment**: Use **Netlify + Railway** instead of **Netlify + Vercel** for the backend. This avoids the complexity of converting Express to serverless functions.

