# Vercel Redeployment Steps - Quick Reference

## 🚀 Quick Steps

### Backend: https://mern-stack-dtgy.vercel.app

1. **Go to Vercel Dashboard** → Select backend project
2. **Settings** → **Environment Variables**
3. **Add/Verify:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Ressichem?retryWrites=true&w=majority
   JWT_SECRET=your-secure-jwt-secret
   NODE_ENV=production
   ```
4. **Redeploy:** Deployments → Redeploy (or push to Git)

### Frontend: https://ressichem-frontend.vercel.app

1. **Go to Vercel Dashboard** → Select frontend project
2. **Settings** → **Environment Variables**
3. **Add/Verify:**
   ```
   NEXT_PUBLIC_BACKEND_URL=https://mern-stack-dtgy.vercel.app
   NODE_ENV=production
   ```
4. **Redeploy:** Deployments → Redeploy (or push to Git)

## ✅ Verification

### Backend Test
```bash
curl https://mern-stack-dtgy.vercel.app/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Frontend Test
1. Visit: https://ressichem-frontend.vercel.app
2. Test connection: https://ressichem-frontend.vercel.app/api/test-connection
3. Try logging in

## 🔧 If Something Doesn't Work

1. **Check Vercel Logs:**
   - Backend: Vercel Dashboard → Backend Project → Functions → Logs
   - Frontend: Vercel Dashboard → Frontend Project → Logs

2. **Verify Environment Variables:**
   - Make sure all variables are set
   - Check variable names (case-sensitive)
   - Ensure `NEXT_PUBLIC_` prefix for frontend vars

3. **Clear Cache:**
   - Browser: Ctrl+Shift+Delete
   - Vercel: Redeploy after env var changes

4. **Test Backend Directly:**
   - https://mern-stack-dtgy.vercel.app/api/health
   - Should work even if frontend has issues

## 📝 Important Notes

- ✅ Backend URL is already configured in code as fallback
- ✅ Frontend will use `NEXT_PUBLIC_BACKEND_URL` if set
- ✅ If env var not set, it falls back to hardcoded URL
- ⚠️ **Best Practice:** Always set `NEXT_PUBLIC_BACKEND_URL` in Vercel

## 🎯 Your URLs

- **Backend:** https://mern-stack-dtgy.vercel.app
- **Frontend:** https://ressichem-frontend.vercel.app
- **Backend Health:** https://mern-stack-dtgy.vercel.app/api/health
- **Frontend Test:** https://ressichem-frontend.vercel.app/api/test-connection

