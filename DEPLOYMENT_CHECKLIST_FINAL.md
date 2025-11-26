# Final Deployment Checklist

## ✅ Pre-Deployment Checklist

### Backend Configuration
- [x] `backend/vercel.json` configured correctly
- [x] `backend/api/index.js` exists and routes are set up
- [x] Database connection uses `MONGODB_URI` environment variable
- [x] CORS is enabled (allows all origins)

### Frontend Configuration
- [x] `frontend/vercel.json` configured for Next.js
- [x] `getBackendUrl()` functions use environment variables
- [x] Fallback to `https://mern-stack-dtgy.vercel.app` if env var not set
- [x] All API routes use correct backend URL

## 🚀 Deployment Steps

### Step 1: Backend Environment Variables

**Project:** `mern-stack-dtgy` on Vercel

**Required Variables:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Ressichem?retryWrites=true&w=majority
JWT_SECRET=your-secure-jwt-secret-key
NODE_ENV=production
```

**How to Set:**
1. Go to https://vercel.com/dashboard
2. Select your backend project
3. Settings → Environment Variables
4. Add each variable
5. Select: Production, Preview, Development
6. Save

### Step 2: Frontend Environment Variables

**Project:** `ressichem-frontend` on Vercel

**Required Variables:**
```
NEXT_PUBLIC_BACKEND_URL=https://mern-stack-dtgy.vercel.app
NODE_ENV=production
```

**How to Set:**
1. Go to https://vercel.com/dashboard
2. Select your frontend project
3. Settings → Environment Variables
4. Add `NEXT_PUBLIC_BACKEND_URL`
5. Select: Production, Preview, Development
6. Save

### Step 3: Redeploy

**Backend:**
1. Vercel Dashboard → Backend Project
2. Deployments tab
3. Click "Redeploy" on latest deployment
   OR
   Push to Git repository (auto-deploy)

**Frontend:**
1. Vercel Dashboard → Frontend Project
2. Deployments tab
3. Click "Redeploy" on latest deployment
   OR
   Push to Git repository (auto-deploy)

## 🧪 Post-Deployment Testing

### Test 1: Backend Health
```bash
curl https://mern-stack-dtgy.vercel.app/api/health
```
**Expected:** `{"status":"ok","timestamp":"..."}`

### Test 2: Frontend Connection
Visit: https://ressichem-frontend.vercel.app/api/test-connection
**Expected:** Shows connection status to backend

### Test 3: Full Integration
1. Visit: https://ressichem-frontend.vercel.app
2. Login with manager credentials
3. Check manager dashboard
4. Verify orders are visible

## 📋 Verification URLs

- **Backend Health:** https://mern-stack-dtgy.vercel.app/api/health
- **Frontend Home:** https://ressichem-frontend.vercel.app
- **Frontend Test:** https://ressichem-frontend.vercel.app/api/test-connection
- **Manager Dashboard:** https://ressichem-frontend.vercel.app/manager-dashboard
- **Orders Page:** https://ressichem-frontend.vercel.app/orders

## 🔍 Troubleshooting

### Backend Issues
- Check Vercel function logs
- Verify `MONGODB_URI` is correct
- Test health endpoint directly
- Check MongoDB Atlas network access

### Frontend Issues
- Check browser console (F12)
- Verify `NEXT_PUBLIC_BACKEND_URL` is set
- Clear browser cache
- Check Vercel build logs

### Connection Issues
- Verify backend URL in frontend env vars
- Check CORS configuration
- Test backend health endpoint
- Verify both projects are deployed

## ✅ Success Criteria

- [ ] Backend health endpoint returns OK
- [ ] Frontend loads without errors
- [ ] Frontend can connect to backend
- [ ] Login works
- [ ] Manager dashboard loads
- [ ] Orders are visible to managers
- [ ] No console errors
- [ ] All features work as expected

