# Database Deployment Guide

## 🗄️ MongoDB Database Deployment

Your application uses **MongoDB**. For production, you need to deploy it to the cloud using **MongoDB Atlas** (FREE).

## Current Setup

- **Local Development**: `mongodb://localhost:27017/Ressichem`
- **Production**: Need MongoDB Atlas (cloud)

## Recommended: MongoDB Atlas (FREE)

MongoDB Atlas is the official cloud MongoDB service with a generous free tier.

### ✅ Free Tier Includes:
- **512 MB storage** (enough for small-medium apps)
- **Shared cluster** (M0 tier)
- **Automatic backups**
- **Global clusters**
- **No credit card required** (for free tier)

### Step-by-Step Setup

#### 1. Create MongoDB Atlas Account
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign Up"
3. Sign up with email or Google/GitHub

#### 2. Create a Free Cluster
1. After login, click "Build a Database"
2. Select **FREE** tier (M0)
3. Choose a cloud provider:
   - **AWS** (recommended)
   - **Google Cloud**
   - **Azure**
4. Select a region closest to your backend:
   - If backend is on Railway (US): Choose **US East** or **US West**
   - If backend is on Render (US): Choose **US East**
5. Click "Create Cluster" (takes 3-5 minutes)

#### 3. Create Database User
1. In the "Database Access" section, click "Add New Database User"
2. Choose "Password" authentication
3. Create username and password (save these!)
4. Set privileges: "Atlas Admin" (or "Read and write to any database")
5. Click "Add User"

#### 4. Whitelist IP Addresses
1. In "Network Access", click "Add IP Address"
2. For development: Click "Add Current IP Address"
3. For production: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ **Security Note**: For production, restrict to your backend server IPs
4. Click "Confirm"

#### 5. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Select driver: **Node.js** and version: **5.5 or later**
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

#### 6. Update Connection String
Replace the connection string with your database name:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
```

Replace:
- `<username>` with your database user
- `<password>` with your database password
- `Ressichem` is your database name (keep this)

#### 7. Update Backend Environment Variables

In your backend deployment (Railway/Render), set:

```env
CONNECTION_STRING=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
```

**Example:**
```env
CONNECTION_STRING=mongodb+srv://admin:MySecurePass123@cluster0.abc123.mongodb.net/Ressichem?retryWrites=true&w=majority
```

## Complete Deployment Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │         │   Database      │
│   (Next.js)     │────────▶│   (Node.js)     │────────▶│   (MongoDB)     │
│   Vercel        │         │   Railway/Render │         │   MongoDB Atlas │
│   (FREE)        │         │   (FREE)        │         │   (FREE)        │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## Environment Variables Summary

### Frontend (Vercel)
```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Backend (Railway/Render)
```env
PORT=5000
JWT_SECRET=your-secret-key-here
CONNECTION_STRING=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
ENCRYPTION_KEY=1PkGcK8xkXi8lZKQSCNgjzjJwTkEoXy08QZEVt9AqfA=
NODE_ENV=production
```

## Testing the Connection

### Test Locally First
1. Update your local `backend/.env`:
   ```env
   CONNECTION_STRING=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
   ```

2. Start backend:
   ```bash
   cd backend
   npm start
   ```

3. Check console for: `✅ MongoDB connected to 'Ressichem' database`

### Test in Production
1. Deploy backend with MongoDB Atlas connection string
2. Check backend logs for successful connection
3. Test API endpoints

## Migration from Local to Atlas

### ⚠️ Important: Atlas does NOT automatically import your data!

You need to **manually migrate** your existing local database to Atlas.

### Option 1: Start Fresh (For new deployments)
- Let your app create collections automatically
- Seed initial data using your seed scripts
- **Use this if**: You don't have important data yet

### Option 2: Migrate Existing Data (Recommended if you have data)
1. **Export from local MongoDB:**
   ```bash
   mongodump --uri="mongodb://localhost:27017/Ressichem" --out=./mongodb-backup
   ```

2. **Import to Atlas:**
   ```bash
   mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority" ./mongodb-backup/Ressichem
   ```

3. **Verify migration:**
   - Check Atlas dashboard → Browse Collections
   - Verify all collections and document counts
   - Test backend connection

**📄 See `MIGRATE_TO_ATLAS.md` for detailed step-by-step migration guide**

## Security Best Practices

1. **Strong Passwords**: Use complex passwords for database users
2. **IP Whitelisting**: Restrict to known IPs in production
3. **Environment Variables**: Never commit connection strings to Git
4. **Regular Backups**: MongoDB Atlas provides automatic backups
5. **Monitor Usage**: Check Atlas dashboard for storage/usage

## Troubleshooting

### Connection Timeout
- Check IP whitelist in Atlas
- Verify connection string format
- Check network access settings

### Authentication Failed
- Verify username/password
- Check user permissions in Atlas
- Ensure password is URL-encoded in connection string

### Database Not Found
- Atlas creates databases automatically on first write
- Ensure database name is correct: `Ressichem`

## Cost Summary

- **MongoDB Atlas M0**: FREE ✅ (512MB storage)
- **Upgrade needed when**: You exceed 512MB storage
- **Next tier**: M10 ($57/month) - Only if needed

## Next Steps

1. ✅ Create MongoDB Atlas account
2. ✅ Create free cluster
3. ✅ Get connection string
4. ✅ Update backend environment variables
5. ✅ Test connection
6. ✅ Deploy backend with Atlas connection

---

**Need Help?**
- MongoDB Atlas Docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Support: Check Atlas dashboard for support options

