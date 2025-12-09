# Quick Vercel Deployment Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Backend Environment Variables

In your **backend Vercel project**, go to **Settings → Environment Variables** and add:

```bash
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret_key
NODE_ENV=production
```

**Get your MongoDB URI:**
1. Go to MongoDB Atlas
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password

### Step 2: Frontend Environment Variables

In your **frontend Vercel project**, go to **Settings → Environment Variables** and add:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-project.vercel.app
NODE_ENV=production
```

**Find your backend URL:**
1. Go to Vercel Dashboard
2. Select your backend project
3. Copy the production URL (e.g., `your-backend.vercel.app`)
4. Use it in `NEXT_PUBLIC_BACKEND_URL`

### Step 3: Redeploy

1. **Backend:** Vercel will auto-redeploy when you add env vars, or manually trigger a redeploy
2. **Frontend:** Same - auto-redeploy or manual trigger

### Step 4: Test

1. **Backend Health:** `https://your-backend.vercel.app/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend Connection:** `https://your-frontend.vercel.app/api/test-connection`
   - Should show backend connection status

3. **Login Test:** Try logging in through the frontend

## ✅ Verification Checklist

- [ ] Backend health endpoint works
- [ ] Frontend can connect to backend
- [ ] Login works
- [ ] API calls succeed after login
- [ ] No CORS errors in browser console
- [ ] No 404 errors on API routes

## 🔧 Troubleshooting

### CORS Errors
- Verify `NEXT_PUBLIC_BACKEND_URL` is set correctly
- Check backend CORS configuration allows your frontend URL

### 404 Errors
- Verify backend is deployed correctly
- Check that routes start with `/api/`
- Verify `vercel.json` configuration

### Database Connection Errors
- Verify `MONGODB_URI` is set correctly
- Check MongoDB Atlas network access (allow all IPs: `0.0.0.0/0`)
- Verify database user credentials

### Environment Variables Not Working
- Restart Vercel deployment after adding vars
- Verify variable names are correct (case-sensitive)
- Check that `NEXT_PUBLIC_` prefix is used for browser vars
- Clear browser cache

## 📝 Important Notes

1. **Never commit `.env` files** - use Vercel environment variables
2. **Use HTTPS URLs** in production (not `http://localhost`)
3. **Restart deployments** after adding environment variables
4. **Test thoroughly** after deployment

## 🎯 Your Deployment URLs

After deployment, you'll have:
- **Backend:** `https://your-backend-project.vercel.app`
- **Frontend:** `https://your-frontend-project.vercel.app`

Make sure to update `NEXT_PUBLIC_BACKEND_URL` in frontend with your actual backend URL!

