# Simple Redeployment Steps

## 🎯 Your URLs
- **Backend:** https://mern-stack-dtgy.vercel.app
- **Frontend:** https://ressichem-frontend.vercel.app

## 📝 Step-by-Step Instructions

### PART 1: Backend (mern-stack-dtgy)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Find your backend project: `mern-stack-dtgy`

2. **Set Environment Variables**
   - Click on the project
   - Go to **Settings** → **Environment Variables**
   - Add these variables:

   ```
   Name: MONGODB_URI
   Value: mongodb+srv://username:password@cluster.mongodb.net/Ressichem?retryWrites=true&w=majority
   Environments: Production, Preview, Development
   ```

   ```
   Name: JWT_SECRET
   Value: your-very-secure-secret-key-at-least-32-characters
   Environments: Production, Preview, Development
   ```

   ```
   Name: NODE_ENV
   Value: production
   Environments: Production, Preview, Development
   ```

3. **Redeploy**
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**
   - OR push to Git (auto-deploys)

4. **Test Backend**
   - Visit: https://mern-stack-dtgy.vercel.app/api/health
   - Should see: `{"status":"ok","timestamp":"..."}`

### PART 2: Frontend (ressichem-frontend)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Find your frontend project: `ressichem-frontend`

2. **Set Environment Variables**
   - Click on the project
   - Go to **Settings** → **Environment Variables**
   - Add this variable:

   ```
   Name: NEXT_PUBLIC_BACKEND_URL
   Value: https://mern-stack-dtgy.vercel.app
   Environments: Production, Preview, Development
   ```

   ```
   Name: NODE_ENV
   Value: production
   Environments: Production, Preview, Development
   ```

3. **Redeploy**
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**
   - OR push to Git (auto-deploys)

4. **Test Frontend**
   - Visit: https://ressichem-frontend.vercel.app
   - Open browser console (F12)
   - Check for errors
   - Try logging in

## ✅ Quick Verification

### Backend Test
Open in browser: https://mern-stack-dtgy.vercel.app/api/health
**Should show:** `{"status":"ok","timestamp":"..."}`

### Frontend Test
1. Visit: https://ressichem-frontend.vercel.app
2. Open console (F12)
3. Look for: `[getBackendUrl] Using NEXT_PUBLIC_BACKEND_URL: https://mern-stack-dtgy.vercel.app`
4. Test connection: https://ressichem-frontend.vercel.app/api/test-connection

## 🔧 If Something Goes Wrong

### Backend Not Working?
1. Check Vercel logs: Dashboard → Project → Functions → Logs
2. Verify `MONGODB_URI` is correct
3. Test health endpoint directly
4. Check MongoDB Atlas network access

### Frontend Not Connecting?
1. Verify `NEXT_PUBLIC_BACKEND_URL` is set correctly
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check browser console for errors
4. Verify backend health endpoint works

### Still Having Issues?
1. Check both projects are deployed
2. Verify environment variables are saved
3. Wait a few minutes after redeploy
4. Check Vercel deployment logs

## 📋 Environment Variables Summary

### Backend Project (`mern-stack-dtgy`)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
NODE_ENV=production
```

### Frontend Project (`ressichem-frontend`)
```
NEXT_PUBLIC_BACKEND_URL=https://mern-stack-dtgy.vercel.app
NODE_ENV=production
```

## 🎉 Success!

Once deployed:
- ✅ Backend: https://mern-stack-dtgy.vercel.app/api/health works
- ✅ Frontend: https://ressichem-frontend.vercel.app loads
- ✅ Login works
- ✅ Manager dashboard shows orders
- ✅ All features work

