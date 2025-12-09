# Vercel Deployment Checklist

## Overview
This guide will help you deploy both backend and frontend to Vercel with MongoDB Atlas.

## Prerequisites
- ✅ Backend deployed to Vercel (already done)
- ✅ Frontend deployed to Vercel (already done)
- ✅ MongoDB Atlas database (already set up)

## Step 1: Backend Vercel Configuration

### 1.1 Environment Variables (Backend)
In your **backend Vercel project**, set these environment variables:

```bash
# MongoDB Connection
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Node Environment
NODE_ENV=production

# Optional: Firebase (if using push notifications)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

**How to set in Vercel:**
1. Go to your backend project on Vercel
2. Settings → Environment Variables
3. Add each variable above
4. Make sure to select "Production", "Preview", and "Development" environments

### 1.2 Verify Backend Deployment
- Backend URL should be: `https://your-backend-project.vercel.app`
- Test health endpoint: `https://your-backend-project.vercel.app/api/health`
- Should return: `{ "status": "ok", "timestamp": "..." }`

## Step 2: Frontend Vercel Configuration

### 2.1 Environment Variables (Frontend)
In your **frontend Vercel project**, set these environment variables:

```bash
# Backend API URL (CRITICAL - use your backend Vercel URL)
NEXT_PUBLIC_BACKEND_URL=https://your-backend-project.vercel.app
# OR
NEXT_PUBLIC_API_URL=https://your-backend-project.vercel.app

# Node Environment
NODE_ENV=production
```

**Important Notes:**
- Use `NEXT_PUBLIC_` prefix for variables that need to be accessible in the browser
- The backend URL should be your **backend Vercel deployment URL**
- Do NOT use `http://localhost:5000` in production

### 2.2 Verify Frontend Deployment
- Frontend URL should be: `https://your-frontend-project.vercel.app`
- Test connection: `https://your-frontend-project.vercel.app/api/test-connection`

## Step 3: CORS Configuration

### 3.1 Backend CORS
The backend already has CORS enabled in `backend/api/index.js`:
```javascript
app.use(cors());
```

This allows all origins. For production, you may want to restrict it:

```javascript
app.use(cors({
  origin: [
    'https://your-frontend-project.vercel.app',
    'https://your-frontend-project.vercel.app'
  ],
  credentials: true
}));
```

### 3.2 Update CORS if Needed
If you need to restrict CORS, update `backend/api/index.js`:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://your-frontend-project.vercel.app',
      'http://localhost:3000' // For local development
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
```

## Step 4: MongoDB Atlas Configuration

### 4.1 Network Access
1. Go to MongoDB Atlas Dashboard
2. Network Access → Add IP Address
3. Add `0.0.0.0/0` to allow all IPs (or specific Vercel IPs if preferred)

### 4.2 Database User
1. Database Access → Create Database User
2. Set username and password
3. Grant "Atlas Admin" or appropriate permissions
4. Use this user in your `MONGODB_URI`

### 4.3 Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

## Step 5: Testing Deployment

### 5.1 Test Backend
```bash
# Health check
curl https://your-backend-project.vercel.app/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### 5.2 Test Frontend-Backend Connection
1. Visit: `https://your-frontend-project.vercel.app/api/test-connection`
2. Should show connection status
3. Check browser console for any errors

### 5.3 Test Authentication
1. Try logging in through the frontend
2. Check if JWT token is received
3. Verify API calls work after login

## Step 6: Common Issues & Solutions

### Issue 1: CORS Errors
**Symptoms:** Browser console shows CORS errors
**Solution:** 
- Verify backend CORS configuration
- Check that frontend URL is in allowed origins
- Ensure `NEXT_PUBLIC_BACKEND_URL` is set correctly

### Issue 2: 404 Errors on API Routes
**Symptoms:** API calls return 404
**Solution:**
- Verify `vercel.json` routes configuration
- Check that routes are prefixed with `/api/`
- Ensure backend is deployed correctly

### Issue 3: Database Connection Errors
**Symptoms:** 503 errors, database timeout
**Solution:**
- Verify `MONGODB_URI` is set correctly in backend
- Check MongoDB Atlas network access
- Verify database user credentials
- Check connection string format

### Issue 4: Environment Variables Not Working
**Symptoms:** Frontend still uses localhost URLs
**Solution:**
- Restart Vercel deployment after adding env vars
- Verify variable names (case-sensitive)
- Check that `NEXT_PUBLIC_` prefix is used for browser-accessible vars
- Clear browser cache

### Issue 5: Function Timeout
**Symptoms:** Requests timeout after 10 seconds
**Solution:**
- Check `vercel.json` maxDuration setting
- Optimize database queries
- Consider upgrading Vercel plan for longer timeouts

## Step 7: Post-Deployment Verification

### 7.1 Backend Verification
- [ ] Health endpoint works
- [ ] Database connection successful
- [ ] API routes respond correctly
- [ ] Authentication works
- [ ] CORS allows frontend origin

### 7.2 Frontend Verification
- [ ] Frontend loads correctly
- [ ] Can connect to backend
- [ ] Login works
- [ ] API calls succeed
- [ ] No console errors

### 7.3 Feature Verification
- [ ] User creation works
- [ ] Manager creation works
- [ ] Order creation works
- [ ] Manager can see orders
- [ ] Notifications work
- [ ] All CRUD operations work

## Step 8: Monitoring & Logs

### 8.1 Vercel Logs
- Backend logs: Vercel Dashboard → Your Backend Project → Functions → Logs
- Frontend logs: Vercel Dashboard → Your Frontend Project → Logs

### 8.2 MongoDB Atlas Logs
- Go to MongoDB Atlas → Monitoring → Logs
- Check for connection issues or slow queries

## Step 9: Performance Optimization

### 9.1 Backend
- Enable Vercel Edge Caching where appropriate
- Optimize database queries
- Use connection pooling
- Minimize function cold starts

### 9.2 Frontend
- Enable Next.js Image Optimization
- Use static generation where possible
- Minimize bundle size
- Enable Vercel Analytics

## Step 10: Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB credentials are secure
- [ ] CORS is properly configured
- [ ] Environment variables are not exposed
- [ ] API routes have proper authentication
- [ ] Input validation is in place
- [ ] Rate limiting is configured (if needed)

## Quick Reference

### Backend Vercel Project
- **URL:** `https://your-backend-project.vercel.app`
- **Health Check:** `https://your-backend-project.vercel.app/api/health`

### Frontend Vercel Project
- **URL:** `https://your-frontend-project.vercel.app`
- **Test Connection:** `https://your-frontend-project.vercel.app/api/test-connection`

### Required Environment Variables

**Backend:**
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
NODE_ENV=production
```

**Frontend:**
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-project.vercel.app
NODE_ENV=production
```

## Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Test backend health endpoint directly
5. Verify MongoDB Atlas connection

