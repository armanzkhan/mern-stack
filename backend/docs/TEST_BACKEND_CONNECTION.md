# Testing Backend Connection - Step by Step Guide

## ✅ Backend Status

**Backend URL:** https://mern-stack-dtgy.vercel.app  
**Status:** ✅ **WORKING** (Health check passed)

Test result:
```json
{"status":"ok","timestamp":"2025-12-09T07:43:24.040Z"}
```

## Step 1: Create Frontend Environment File

Create a file `frontend/.env.local` with the following content:

```env
# Backend API Configuration for Local Development
# Point to the deployed Vercel backend
NEXT_PUBLIC_BACKEND_URL=https://mern-stack-dtgy.vercel.app
NEXT_PUBLIC_API_URL=https://mern-stack-dtgy.vercel.app
```

**Important:** 
- `.env.local` is already in `.gitignore`, so it won't be committed
- This file is for local development only
- When you deploy the frontend, you'll set these in Vercel environment variables

## Step 2: Update API Base URL (if needed)

The frontend uses `getBackendUrl()` function which should automatically use the environment variables. However, check if `frontend/src/lib/api.ts` needs updating.

Current API base uses: `process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api"`

If this doesn't work, you may need to update it to use `getBackendUrl()`.

## Step 3: Start Frontend Development Server

```bash
cd frontend
npm install  # If you haven't already
npm run dev
```

## Step 4: Test the Connection

### Option A: Test via Browser Console

1. Open http://localhost:3000 in your browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. You should see logs showing which backend URL is being used:
   ```
   [getBackendUrl] Using NEXT_PUBLIC_BACKEND_URL: https://mern-stack-dtgy.vercel.app
   ```

### Option B: Test via API Route

Visit: http://localhost:3000/api/test-connection

This should show:
- Backend URL being used
- Connection status
- Health check result

### Option C: Test Login

1. Go to http://localhost:3000/login
2. Try logging in with your credentials
3. Check browser console for any errors
4. Check Network tab to see API requests going to `https://mern-stack-dtgy.vercel.app`

## Step 5: Verify API Calls

In browser Developer Tools → Network tab:
- All API requests should go to `https://mern-stack-dtgy.vercel.app/api/...`
- Requests should return 200 OK (or appropriate status codes)
- Check for CORS errors (shouldn't have any if backend CORS is configured)

## Common Issues & Solutions

### Issue 1: Still using localhost:5000

**Solution:** 
- Make sure `.env.local` file exists in `frontend/` directory
- Restart the Next.js dev server after creating `.env.local`
- Check browser console for which URL is being used

### Issue 2: CORS Errors

**Solution:** 
- Backend CORS should allow `http://localhost:3000`
- Check `backend/api/index.js` CORS configuration
- Backend should allow credentials if using cookies

### Issue 3: Environment Variables Not Loading

**Solution:**
- Next.js requires `NEXT_PUBLIC_` prefix for client-side variables
- Restart dev server after changing `.env.local`
- Clear browser cache if needed

## Step 6: Once Testing is Complete

After verifying everything works locally:

1. **Commit your changes** (but NOT `.env.local` - it's in .gitignore)
2. **Deploy frontend to Vercel**
3. **Set environment variables in Vercel Dashboard:**
   - Go to Vercel project settings
   - Environment Variables → Add:
     - `NEXT_PUBLIC_BACKEND_URL` = `https://mern-stack-dtgy.vercel.app`
     - `NEXT_PUBLIC_API_URL` = `https://mern-stack-dtgy.vercel.app`
4. **Redeploy frontend**

## Quick Test Commands

```bash
# Test backend health
curl https://mern-stack-dtgy.vercel.app/api/health

# Test from PowerShell
Invoke-WebRequest -Uri "https://mern-stack-dtgy.vercel.app/api/health" -UseBasicParsing
```

## Next Steps

Once local testing is successful:
1. ✅ Backend is working on Vercel
2. ✅ Frontend connects to backend locally
3. → Deploy frontend to Vercel
4. → Set environment variables in Vercel
5. → Test production deployment

