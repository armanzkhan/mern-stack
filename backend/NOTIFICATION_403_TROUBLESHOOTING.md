# 🔔 Notification 403 Error Troubleshooting

## Current Issue
```
GET /api/notifications/recent 403 in 1506ms
GET /api/notifications/recent 403 in 60ms
```

## 🚨 **Root Cause: Backend Not Running**

The 403 errors occur because the frontend is trying to fetch notifications, but the backend server is not running.

## ✅ **Solution Steps**

### 1. Start Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:5000
✅ MongoDB connected to 'Ressichem' database
```

### 2. Verify Backend is Running
- Backend should be running on `http://localhost:5000`
- Check browser console for connection errors
- Verify API endpoints are accessible

### 3. Check Authentication
The notifications API requires authentication. Make sure you're logged in:

1. **Login to the application**: `http://localhost:3000/auth/sign-in`
2. **Use valid credentials**:
   - Email: `admin@example.com`
   - Password: `admin123`
3. **Check localStorage** for token: `localStorage.getItem('token')`

## 🔧 **Debug Steps**

### Check Backend Status
```bash
# Test backend health
curl http://localhost:5000/api/health
```

### Check Authentication Token
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Check localStorage for 'token' key
4. Verify token exists and is not expired

### Check Network Tab
1. Open DevTools → Network tab
2. Look for `/api/notifications/recent` requests
3. Check if they're going to the right URL
4. Verify Authorization header is present

## 🎯 **Expected Behavior After Fix**

Once backend is running and you're logged in:

1. **No more 403 errors** in console
2. **Notifications load** in the header bell icon
3. **Real-time updates** work when creating/updating data
4. **Web push notifications** work (if permission granted)

## 🚀 **Quick Test**

1. **Start backend**: `cd backend && npm run dev`
2. **Login to frontend**: `http://localhost:3000/auth/sign-in`
3. **Check notifications**: Click the bell icon in header
4. **Create test data**: Add a company or user to trigger notifications

## 📝 **Common Issues**

### Backend Not Running
- **Symptom**: 403 errors, connection refused
- **Solution**: Start backend server

### Not Logged In
- **Symptom**: 401/403 errors, no token
- **Solution**: Login with valid credentials

### Invalid Token
- **Symptom**: 403 errors, token exists but invalid
- **Solution**: Logout and login again

### Wrong API URL
- **Symptom**: Connection errors, wrong port
- **Solution**: Check `NEXT_PUBLIC_API_URL` in frontend

## 🎉 **Success Indicators**

When everything is working:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ User logged in with valid token
- ✅ No 403 errors in console
- ✅ Notifications appear in header
- ✅ Real-time updates work



