# Redeployment Guide for Vercel

## 🎯 Your Deployment URLs

- **Backend:** https://mern-stack-dtgy.vercel.app
- **Frontend:** https://ressichem-frontend.vercel.app

## Step 1: Backend Redeployment

### 1.1 Set Environment Variables in Backend Vercel Project

Go to your **backend Vercel project** (`mern-stack-dtgy`):
1. Open Vercel Dashboard
2. Select your backend project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

```bash
# MongoDB Connection (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Ressichem?retryWrites=true&w=majority

# JWT Secret (REQUIRED)
JWT_SECRET=your-secure-jwt-secret-key-minimum-32-characters

# Node Environment
NODE_ENV=production
```

**Important:**
- Replace `username` and `password` with your MongoDB Atlas credentials
- Use a strong JWT_SECRET (at least 32 characters)
- Select **Production**, **Preview**, and **Development** for each variable

### 1.2 Verify Backend Configuration

Check `backend/vercel.json`:
- ✅ Routes configured: `/api/(.*)` → `/api/index.js`
- ✅ Function timeout: 10 seconds
- ✅ NODE_ENV: production

### 1.3 Redeploy Backend

**Option A: Automatic (Recommended)**
- Push changes to your Git repository
- Vercel will auto-deploy

**Option B: Manual**
1. Go to Vercel Dashboard → Your Backend Project
2. Click **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Or trigger via: `vercel --prod` (if you have Vercel CLI)

### 1.4 Test Backend

After deployment, test:
```bash
# Health check
curl https://mern-stack-dtgy.vercel.app/api/health

# Should return:
# {"status":"ok","timestamp":"2025-11-26T..."}
```

## Step 2: Frontend Redeployment

### 2.1 Set Environment Variables in Frontend Vercel Project

Go to your **frontend Vercel project** (`ressichem-frontend`):
1. Open Vercel Dashboard
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Add/Update this variable:

```bash
# Backend API URL (REQUIRED)
NEXT_PUBLIC_BACKEND_URL=https://mern-stack-dtgy.vercel.app

# Optional (alternative name)
NEXT_PUBLIC_API_URL=https://mern-stack-dtgy.vercel.app

# Node Environment
NODE_ENV=production
```

**Critical:** Make sure `NEXT_PUBLIC_BACKEND_URL` is set to `https://mern-stack-dtgy.vercel.app`

### 2.2 Verify Frontend Configuration

Check `frontend/vercel.json`:
- ✅ Framework: Next.js
- ✅ Build command: `npm run build`
- ✅ Region: iad1

### 2.3 Redeploy Frontend

**Option A: Automatic (Recommended)**
- Push changes to your Git repository
- Vercel will auto-deploy

**Option B: Manual**
1. Go to Vercel Dashboard → Your Frontend Project
2. Click **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Or trigger via: `vercel --prod` (if you have Vercel CLI)

### 2.4 Test Frontend

After deployment, test:
1. Visit: https://ressichem-frontend.vercel.app
2. Check browser console (F12) for any errors
3. Test connection: https://ressichem-frontend.vercel.app/api/test-connection

## Step 3: Verification Checklist

### Backend Verification
- [ ] Health endpoint works: https://mern-stack-dtgy.vercel.app/api/health
- [ ] Database connection successful (check Vercel logs)
- [ ] No errors in Vercel function logs
- [ ] API routes respond correctly

### Frontend Verification
- [ ] Frontend loads: https://ressichem-frontend.vercel.app
- [ ] No console errors in browser
- [ ] Connection test works: https://ressichem-frontend.vercel.app/api/test-connection
- [ ] Can login successfully
- [ ] API calls work after login

### Integration Verification
- [ ] Login works end-to-end
- [ ] Manager dashboard loads
- [ ] Orders page shows data
- [ ] Managers can see their orders
- [ ] All CRUD operations work

## Step 4: Common Issues & Quick Fixes

### Issue: Backend returns 404
**Fix:** 
- Verify `vercel.json` routes configuration
- Check that `/api/index.js` exists
- Ensure routes start with `/api/`

### Issue: Frontend can't connect to backend
**Fix:**
- Verify `NEXT_PUBLIC_BACKEND_URL=https://mern-stack-dtgy.vercel.app` is set
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for CORS errors
- Verify backend CORS allows frontend origin

### Issue: Database connection fails
**Fix:**
- Verify `MONGODB_URI` is set correctly
- Check MongoDB Atlas network access (allow `0.0.0.0/0`)
- Verify database user credentials
- Check Vercel logs for connection errors

### Issue: Environment variables not working
**Fix:**
- Redeploy after adding variables
- Verify variable names are correct (case-sensitive)
- Check that `NEXT_PUBLIC_` prefix is used for browser vars
- Restart Vercel deployment

## Step 5: Post-Deployment Testing

### 5.1 Test Backend API
```bash
# Health check
curl https://mern-stack-dtgy.vercel.app/api/health

# Test login (replace with actual credentials)
curl -X POST https://mern-stack-dtgy.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 5.2 Test Frontend
1. **Homepage:** https://ressichem-frontend.vercel.app
2. **Login:** Try logging in
3. **Manager Dashboard:** https://ressichem-frontend.vercel.app/manager-dashboard
4. **Orders:** https://ressichem-frontend.vercel.app/orders
5. **Managers:** https://ressichem-frontend.vercel.app/managers

### 5.3 Check Logs
- **Backend Logs:** Vercel Dashboard → Backend Project → Functions → Logs
- **Frontend Logs:** Vercel Dashboard → Frontend Project → Logs
- **Browser Console:** F12 → Console tab

## Step 6: MongoDB Atlas Configuration

Ensure MongoDB Atlas is configured:

1. **Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Add IP Address: `0.0.0.0/0` (allow all) OR specific Vercel IPs

2. **Database User:**
   - Go to Database Access
   - Verify user has correct permissions
   - Use credentials in `MONGODB_URI`

3. **Connection String:**
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/Ressichem?retryWrites=true&w=majority`
   - Replace `username` and `password` with actual credentials

## Quick Command Reference

### Using Vercel CLI (if installed)

**Backend:**
```bash
cd backend
vercel --prod
```

**Frontend:**
```bash
cd frontend
vercel --prod
```

### Check Deployment Status
```bash
# Backend
vercel ls --scope=your-team backend-project

# Frontend
vercel ls --scope=your-team frontend-project
```

## Environment Variables Summary

### Backend (`mern-stack-dtgy`)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### Frontend (`ressichem-frontend`)
```
NEXT_PUBLIC_BACKEND_URL=https://mern-stack-dtgy.vercel.app
NODE_ENV=production
```

## Success Indicators

✅ **Backend is working if:**
- Health endpoint returns `{"status":"ok"}`
- No errors in Vercel function logs
- Database connects successfully

✅ **Frontend is working if:**
- Page loads without errors
- Can connect to backend (test connection works)
- Login functionality works
- API calls succeed after authentication

✅ **Integration is working if:**
- Managers can see orders
- Orders page displays data
- All features work as expected

## Need Help?

If deployment fails:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test backend health endpoint directly
4. Check browser console for errors
5. Verify MongoDB Atlas connection

