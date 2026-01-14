# Switch from Local MongoDB to MongoDB Atlas

This guide will help you switch from local MongoDB (MongoDB Compass) to MongoDB Atlas.

## 📋 Overview

**Current Setup:**
- Local MongoDB: `mongodb://localhost:27017/Ressichem`
- Database: `Ressichem`
- Using MongoDB Compass locally

**Target Setup:**
- MongoDB Atlas (Cloud): `mongodb+srv://username:password@cluster.mongodb.net/Ressichem`
- Same database: `Ressichem`
- All your data migrated

## 🚀 Step-by-Step Guide

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign Up"
3. Sign up with:
   - Email, or
   - Google/GitHub account
4. Verify your email if required

### Step 2: Create a Free Cluster

1. After login, click **"Build a Database"**
2. Select **FREE** tier (M0)
3. Choose cloud provider:
   - **AWS** (recommended)
   - **Google Cloud**
   - **Azure**
4. Select region:
   - Choose closest to you (e.g., **US East** or **US West**)
5. Cluster name: Keep default or name it (e.g., "Cluster0")
6. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 3: Create Database User

1. In the setup wizard, you'll be asked to create a database user
2. **Username**: Create a username (e.g., `admin`, `ressichem_user`)
3. **Password**: 
   - Click "Autogenerate Secure Password" (recommended)
   - **OR** create your own strong password
   - **⚠️ SAVE THIS PASSWORD** - You'll need it for the connection string
4. **Database User Privileges**: Select "Atlas Admin" (or "Read and write to any database")
5. Click **"Create Database User"**

### Step 4: Whitelist IP Addresses

1. In the setup wizard, you'll be asked about network access
2. For **development/testing**:
   - Click **"Add My Current IP Address"**
   - Click **"Add IP Address"**
3. For **production** (or if you want to access from anywhere):
   - Click **"Allow Access from Anywhere"**
   - This adds `0.0.0.0/0` (all IPs)
   - ⚠️ **Security Note**: For production, restrict to specific IPs later
4. Click **"Finish and Close"**

### Step 5: Get Connection String

1. In Atlas dashboard, click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Update it with your database name:**
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
   ```
   - Replace `<username>` with your database user
   - Replace `<password>` with your database password
   - Keep `Ressichem` as the database name

**Example:**
```
mongodb+srv://admin:MySecurePass123@cluster0.abc123.mongodb.net/Ressichem?retryWrites=true&w=majority
```

### Step 6: Export Your Local Database

Before switching, export your local data:

#### Option A: Using Command Line (Recommended)

1. **Install MongoDB Database Tools** (if not installed):
   - Download: [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools)
   - Or use MongoDB Shell (mongosh) which includes these tools

2. **Export your database:**
   ```bash
   # Navigate to your project root
   cd C:\Users\Arman\Desktop\1theme\Ressichem
   
   # Export the database
   mongodump --uri="mongodb://localhost:27017/Ressichem" --out=./mongodb-backup
   ```

3. **Verify export:**
   ```bash
   # Check what was exported
   dir mongodb-backup\Ressichem
   # You should see .bson files for each collection
   ```

#### Option B: Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Select `Ressichem` database
4. For each collection:
   - Click on the collection
   - Click "Export Collection"
   - Save as JSON or CSV
   - Repeat for all collections

### Step 7: Import Data to MongoDB Atlas

#### Option A: Using Command Line (Recommended)

1. **Import to Atlas:**
   ```bash
   mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority" ./mongodb-backup/Ressichem
   ```

   **Replace:**
   - `username` with your Atlas database user
   - `password` with your Atlas database password
   - `cluster0.xxxxx` with your actual cluster address

   **Example:**
   ```bash
   mongorestore --uri="mongodb+srv://admin:MyPass123@cluster0.abc123.mongodb.net/Ressichem?retryWrites=true&w=majority" ./mongodb-backup/Ressichem
   ```

2. **Verify import:**
   - Check Atlas dashboard → "Browse Collections"
   - Verify all collections are there
   - Check document counts match your local database

#### Option B: Using MongoDB Compass (GUI)

1. **Connect to Atlas in Compass:**
   - Connection string: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem`
   - Replace username, password, and cluster address

2. **Import each collection:**
   - For each exported JSON file:
     - Click "Import Data"
     - Select the JSON file
     - Choose collection name
     - Click "Import"

### Step 8: Update Backend Configuration

1. **Create `.env` file in `backend` directory** (if it doesn't exist):
   ```bash
   cd backend
   # Create .env file
   ```

2. **Add to `backend/.env`:**
   ```env
   # MongoDB Atlas Connection
   CONNECTION_STRING=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-secure
   JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-here-make-it-very-long-and-secure
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Encryption Key (if you have one)
   ENCRYPTION_KEY=1PkGcK8xkXi8lZKQSCNgjzjJwTkEoXy08QZEVt9AqfA=
   ```

   **Replace:**
   - `username` with your Atlas database user
   - `password` with your Atlas database password
   - `cluster0.xxxxx` with your actual cluster address

3. **Important**: 
   - If your password contains special characters, URL-encode them:
     - `@` becomes `%40`
     - `#` becomes `%23`
     - `$` becomes `%24`
     - `%` becomes `%25`
     - etc.

### Step 9: Test the Connection

1. **Start your backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Check console output:**
   - You should see: `✅ MongoDB connected to 'Ressichem' database`
   - If you see errors, check the troubleshooting section below

3. **Test API endpoints:**
   - Test a few endpoints to verify data is accessible
   - Check if users, orders, products, etc. are loading correctly

### Step 10: Verify Data in Atlas

1. **In MongoDB Atlas Dashboard:**
   - Click "Browse Collections"
   - Verify all collections are present:
     - users
     - companies
     - customers
     - orders
     - products
     - invoices
     - notifications
     - etc.

2. **Check document counts:**
   - Click on each collection
   - Verify document counts match your local database

## 🔧 Troubleshooting

### Error: "authentication failed"
- **Solution**: 
  - Verify username and password are correct
  - Check if password needs URL-encoding (special characters)
  - Verify user has "Atlas Admin" or "Read and write" permissions

### Error: "connection timeout"
- **Solution**:
  - Check IP whitelist in Atlas (add `0.0.0.0/0` temporarily)
  - Verify connection string format
  - Check network connectivity

### Error: "database not found"
- **Solution**:
  - Atlas creates databases automatically on first write
  - Ensure database name is correct: `Ressichem`
  - Check connection string includes database name

### Error: "MongoServerError: bad auth"
- **Solution**:
  - Verify username/password
  - Check user permissions in Atlas
  - Try creating a new database user

### Password with Special Characters
If your password has special characters, URL-encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

**Example:**
- Password: `My@Pass#123`
- Encoded: `My%40Pass%23123`
- Connection string: `mongodb+srv://admin:My%40Pass%23123@cluster0.xxxxx.mongodb.net/Ressichem`

## ✅ Migration Checklist

- [ ] MongoDB Atlas account created
- [ ] Free cluster (M0) created
- [ ] Database user created
- [ ] IP addresses whitelisted
- [ ] Local database exported (mongodump)
- [ ] Backup folder verified
- [ ] Data imported to Atlas (mongorestore)
- [ ] Collections verified in Atlas dashboard
- [ ] Document counts verified
- [ ] Backend `.env` file created/updated
- [ ] Connection string tested
- [ ] Backend started successfully
- [ ] API endpoints tested
- [ ] Data accessible from frontend

## 📝 Quick Reference

### Connection String Format:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
```

### Export Local Database:
```bash
mongodump --uri="mongodb://localhost:27017/Ressichem" --out=./mongodb-backup
```

### Import to Atlas:
```bash
mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority" ./mongodb-backup/Ressichem
```

### Backend .env File:
```env
CONNECTION_STRING=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
```

## 🎯 After Migration

1. **Keep local MongoDB** (for development):
   - You can keep using local MongoDB for local development
   - Use Atlas connection string only when you want to use Atlas

2. **Switch between local and Atlas:**
   - **Local**: Comment out `CONNECTION_STRING` in `.env` (uses default)
   - **Atlas**: Set `CONNECTION_STRING` in `.env`

3. **Production Deployment:**
   - When deploying backend to Railway/Render, use Atlas connection string
   - Never use local MongoDB in production

## 💡 Tips

- **Free Tier Limits**: 512MB storage (enough for most small-medium apps)
- **Automatic Backups**: Atlas provides automatic backups
- **Monitoring**: Check Atlas dashboard for usage and performance
- **Security**: Use strong passwords and restrict IP access in production

## 📚 Additional Resources

- MongoDB Atlas Docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Migration Guide: See `MIGRATE_TO_ATLAS.md` for detailed migration steps
- Database Setup: See `DATABASE_DEPLOYMENT.md` for deployment architecture

---

**Need Help?**
- Check MongoDB Atlas dashboard for support options
- Review error messages in backend console
- Verify connection string format

