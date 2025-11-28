# Verify Deployed System Connections

## 🔍 Overview

This guide helps you verify that your deployed frontend and backend are properly connected to MongoDB Atlas.

**Database:** `Ressichem`  
**MongoDB Atlas:** `https://cloud.mongodb.com/v2/690efc820e0b191b3893ef75#/metrics/replicaSet/690f137b8e3d81774a95d674/explorer/Ressichem/`  
**Backend:** `https://mern-stack-dtgy.vercel.app`  
**Frontend:** `https://ressichem-frontend.vercel.app`

---

## ✅ Quick Verification Methods

### Method 1: Run Verification Script (Recommended)

```bash
cd backend
node scripts/verify-deployed-connections.js
```

**This script will:**
- ✅ Test MongoDB Atlas connection
- ✅ Verify all collections are accessible
- ✅ Count documents in each collection
- ✅ Test backend API endpoints
- ✅ Test frontend-backend connection
- ✅ Check environment variables

### Method 2: Test Backend Health Endpoint

```bash
curl https://mern-stack-dtgy.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Server is running",
  "database": "connected"
}
```

### Method 3: Test Backend Database Connection

```bash
curl https://mern-stack-dtgy.vercel.app/api/users/all
```

**Expected:** Returns array of users (or empty array if no users)

### Method 4: Check Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select: `mern-stack-dtgy` project
3. Go to: **Settings → Environment Variables**
4. **Verify these are set:**
   - `MONGODB_URI` or `CONNECTION_STRING` = `mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority`
   - `JWT_SECRET` = (your secret key)
   - `NODE_ENV` = `production`

### Method 5: Check MongoDB Atlas Network Access

1. Go to: https://cloud.mongodb.com/
2. Navigate to: **Network Access**
3. **Verify:**
   - ✅ IP `0.0.0.0/0` is allowed (allows all IPs including Vercel)
   - OR specific Vercel IP ranges are allowed

### Method 6: Test Frontend Connection

1. Go to: `https://ressichem-frontend.vercel.app`
2. Open browser DevTools (F12) → Console
3. Login to the application
4. **Check for errors:**
   - ❌ No "Failed to fetch" errors
   - ❌ No "Network error" messages
   - ✅ API calls return data successfully

---

## 📊 Detailed Verification Steps

### Step 1: Database Connection

**Check if backend can connect to MongoDB:**

```bash
# Test from local machine
cd backend
node -e "
const mongoose = require('mongoose');
const uri = 'mongodb+srv://armanzaman4_db_user:1JJORz7jP2VFgTaP@cluster0.qn1babq.mongodb.net/Ressichem?retryWrites=true&w=majority';
mongoose.connect(uri).then(() => {
  console.log('✅ Connected to MongoDB');
  process.exit(0);
}).catch(err => {
  console.error('❌ Connection failed:', err.message);
  process.exit(1);
});
"
```

**Expected:** `✅ Connected to MongoDB`

### Step 2: Collection Access

**Verify collections exist and are accessible:**

1. Go to MongoDB Atlas: https://cloud.mongodb.com/v2/690efc820e0b191b3893ef75#/metrics/replicaSet/690f137b8e3d81774a95d674/explorer/Ressichem/
2. **Check these collections exist:**
   - ✅ `users`
   - ✅ `customers`
   - ✅ `managers`
   - ✅ `orders`
   - ✅ `products`
   - ✅ `invoices`
   - ✅ `notifications`

### Step 3: Backend API Test

**Test backend endpoints:**

```bash
# Health check
curl https://mern-stack-dtgy.vercel.app/api/health

# Users (should return data)
curl https://mern-stack-dtgy.vercel.app/api/users/all

# Products (should return data)
curl https://mern-stack-dtgy.vercel.app/api/products
```

**Expected:** All endpoints return data (or empty arrays if no data)

### Step 4: Frontend-Backend Connection

**Test if frontend can reach backend:**

1. Go to: `https://ressichem-frontend.vercel.app`
2. Open DevTools (F12) → Network tab
3. Login to the application
4. **Check API calls:**
   - ✅ Requests to `https://mern-stack-dtgy.vercel.app/api/*` succeed
   - ✅ Status codes are 200 (or 401 if not authenticated)
   - ❌ No CORS errors
   - ❌ No network errors

### Step 5: Environment Variables Check

**Verify Vercel environment variables:**

**Backend Project (`mern-stack-dtgy`):**
- [ ] `MONGODB_URI` or `CONNECTION_STRING` is set
- [ ] `JWT_SECRET` is set
- [ ] `NODE_ENV` = `production`

**Frontend Project (`ressichem-frontend`):**
- [ ] `NEXT_PUBLIC_BACKEND_URL` = `https://mern-stack-dtgy.vercel.app`
- [ ] `NEXT_PUBLIC_API_URL` = `https://mern-stack-dtgy.vercel.app` (optional)

---

## 🔧 Troubleshooting

### Issue: Database Connection Failed

**Symptoms:**
- Backend returns 500 errors
- Health check shows "database disconnected"

**Solutions:**
1. **Check MongoDB Atlas Network Access:**
   - Allow IP `0.0.0.0/0` (allows all IPs)
   - Or add Vercel IP ranges

2. **Check Connection String:**
   - Verify `MONGODB_URI` or `CONNECTION_STRING` is set in Vercel
   - Connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/Ressichem?retryWrites=true&w=majority`

3. **Check Database User:**
   - Verify database user exists in MongoDB Atlas
   - Verify user has read/write permissions

### Issue: Frontend Can't Reach Backend

**Symptoms:**
- CORS errors in browser console
- "Failed to fetch" errors
- Network errors

**Solutions:**
1. **Check Backend URL:**
   - Verify `NEXT_PUBLIC_BACKEND_URL` is set in frontend Vercel project
   - Should be: `https://mern-stack-dtgy.vercel.app`

2. **Check CORS:**
   - Backend should allow requests from `https://ressichem-frontend.vercel.app`
   - Check `backend/api/index.js` for CORS configuration

3. **Check Backend Deployment:**
   - Verify backend is deployed and running
   - Check Vercel deployment logs for errors

### Issue: Collections Not Found

**Symptoms:**
- API returns empty arrays
- 404 errors for specific resources

**Solutions:**
1. **Check Database Name:**
   - Verify database name is `Ressichem` (case-sensitive)
   - Check connection string includes `Ressichem` as database name

2. **Check Collection Names:**
   - Verify collections exist in MongoDB Atlas
   - Collection names should match model names (lowercase, plural)

---

## ✅ Success Criteria

Your system is **properly connected** when:

1. ✅ **Database Connection:**
   - Backend can connect to MongoDB Atlas
   - All collections are accessible
   - Can read/write data

2. ✅ **Backend API:**
   - Health endpoint returns `{ status: "ok" }`
   - API endpoints return data (or empty arrays)
   - No 500 errors

3. ✅ **Frontend-Backend:**
   - Frontend can make API calls to backend
   - No CORS errors
   - Data loads correctly in UI

4. ✅ **Environment Variables:**
   - All required variables are set in Vercel
   - Connection string is correct
   - Backend URL is set in frontend

---

## 📋 Quick Checklist

- [ ] Run verification script: `node scripts/verify-deployed-connections.js`
- [ ] Test backend health: `curl https://mern-stack-dtgy.vercel.app/api/health`
- [ ] Check MongoDB Atlas collections exist
- [ ] Verify Vercel environment variables are set
- [ ] Test frontend can login and load data
- [ ] Check browser console for errors
- [ ] Verify network access in MongoDB Atlas

---

**Next Steps:**
1. Run the verification script
2. Check any issues reported
3. Fix environment variables if needed
4. Redeploy if changes were made

