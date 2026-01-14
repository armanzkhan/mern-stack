# Migrate Local MongoDB to MongoDB Atlas

This guide will help you migrate your existing local MongoDB database (`Ressichem`) to MongoDB Atlas.

## ⚠️ Important Notes

- **Atlas does NOT automatically import** - You need to migrate manually
- **All your data will be available** after migration
- **Backup first** - Always backup before migration
- **Test connection** - Verify migration worked before switching

## Prerequisites

1. **MongoDB Atlas account** created
2. **MongoDB Atlas cluster** created (free M0 tier)
3. **Database user** created in Atlas
4. **IP whitelisted** in Atlas (0.0.0.0/0 for now)
5. **MongoDB tools installed** (mongodump, mongorestore)

## Step 1: Install MongoDB Database Tools

You need `mongodump` and `mongorestore` to export/import data.

### Windows:
1. Download: [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools)
2. Extract and add to PATH
3. Or use MongoDB Shell (mongosh) which includes these tools

### macOS:
```bash
brew install mongodb-database-tools
```

### Linux:
```bash
# Ubuntu/Debian
wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2004-x86_64-100.9.4.tgz
tar -xzf mongodb-database-tools-*.tgz
export PATH=$PATH:$(pwd)/mongodb-database-tools-ubuntu2004-x86_64-100.9.4/bin
```

## Step 2: Export Data from Local MongoDB

Export your local `Ressichem` database:

```bash
# Navigate to your project root
cd C:\Users\Arman\Desktop\1theme\Ressichem

# Export the database
mongodump --uri="mongodb://localhost:27017/Ressichem" --out=./mongodb-backup

# This creates a folder: mongodb-backup/Ressichem/
```

**What this does:**
- Exports all collections from `Ressichem` database
- Creates BSON files for each collection
- Saves metadata in JSON files

**Verify export:**
```bash
# Check what was exported
dir mongodb-backup\Ressichem
# You should see files like:
# - users.bson
# - companies.bson
# - orders.bson
# - products.bson
# - etc.
```

## Step 3: Get MongoDB Atlas Connection String

1. Go to MongoDB Atlas dashboard
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Update it with your database name:**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
   ```

## Step 4: Import Data to MongoDB Atlas

Import your exported data to Atlas:

```bash
# Import to Atlas
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

## Step 5: Verify Migration

### Check in MongoDB Atlas Dashboard:
1. Go to Atlas dashboard
2. Click "Browse Collections"
3. You should see all your collections:
   - users
   - companies
   - customers
   - orders
   - products
   - notifications
   - invoices
   - etc.

### Check Document Counts:
1. Click on each collection
2. Verify document counts match your local database

### Test with Backend:
1. Update backend `.env`:
   ```env
   CONNECTION_STRING=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
   ```

2. Start backend:
   ```bash
   cd backend
   npm start
   ```

3. Check console for: `✅ MongoDB connected to 'Ressichem' database`

4. Test API endpoints to verify data is accessible

## Alternative: Using MongoDB Compass (GUI)

If you prefer a GUI tool:

### Export:
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Select `Ressichem` database
4. For each collection:
   - Click collection
   - Click "Export Collection"
   - Save as JSON

### Import:
1. Connect to Atlas in Compass:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem
   ```
2. For each collection:
   - Click "Import Data"
   - Select exported JSON file
   - Import

## Troubleshooting

### Error: "authentication failed"
- Verify username/password are correct
- Check user has "Atlas Admin" or "Read and write" permissions
- Ensure password is URL-encoded if it contains special characters

### Error: "connection timeout"
- Check IP whitelist in Atlas (add 0.0.0.0/0 temporarily)
- Verify connection string format
- Check network connectivity

### Error: "database not found"
- Atlas creates databases automatically on first write
- Ensure database name is correct: `Ressichem`
- Check connection string includes database name

### Large Database (>512MB)
- Free tier has 512MB limit
- If your database is larger:
  - Option 1: Upgrade to paid tier (M10: $57/month)
  - Option 2: Clean up old data before migration
  - Option 3: Archive old data separately

### Check Database Size:
```bash
# In MongoDB shell
use Ressichem
db.stats()
```

## Migration Checklist

- [ ] MongoDB Atlas account created
- [ ] Atlas cluster created (M0 free tier)
- [ ] Database user created
- [ ] IP addresses whitelisted
- [ ] Local database exported (mongodump)
- [ ] Backup folder verified
- [ ] Data imported to Atlas (mongorestore)
- [ ] Collections verified in Atlas dashboard
- [ ] Document counts verified
- [ ] Backend tested with Atlas connection
- [ ] API endpoints tested
- [ ] Old local connection removed from production

## After Migration

1. **Update Backend Environment Variables:**
   ```env
   CONNECTION_STRING=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
   ```

2. **Deploy Backend** with new connection string

3. **Keep Local Database** (for development):
   - Keep local MongoDB running for local dev
   - Use Atlas connection string only in production

4. **Backup Strategy:**
   - Atlas provides automatic backups
   - You can also export periodically:
     ```bash
     mongodump --uri="mongodb+srv://..." --out=./backups/$(date +%Y%m%d)
     ```

## Quick Migration Script

Save this as `migrate-to-atlas.bat` (Windows):

```batch
@echo off
echo ====================================
echo MongoDB Migration to Atlas
echo ====================================
echo.

echo Step 1: Exporting local database...
mongodump --uri="mongodb://localhost:27017/Ressichem" --out=./mongodb-backup
if %errorlevel% neq 0 (
    echo ERROR: Export failed!
    pause
    exit /b 1
)
echo Export completed!
echo.

echo Step 2: Enter Atlas connection string:
set /p ATLAS_URI="Connection string: "

echo Step 3: Importing to Atlas...
mongorestore --uri="%ATLAS_URI%" ./mongodb-backup/Ressichem
if %errorlevel% neq 0 (
    echo ERROR: Import failed!
    pause
    exit /b 1
)
echo.
echo ====================================
echo Migration completed successfully!
echo ====================================
pause
```

**Usage:**
```bash
migrate-to-atlas.bat
# Enter: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/Ressichem?retryWrites=true&w=majority
```

## Summary

✅ **Yes, all your data will be available** after migration
✅ **Atlas does NOT auto-import** - You need to migrate manually
✅ **Process**: Export (mongodump) → Import (mongorestore)
✅ **Verify**: Check collections and document counts
✅ **Test**: Verify backend connection works

---

**Need Help?**
- MongoDB Migration Guide: [docs.mongodb.com/manual/core/migration](https://docs.mongodb.com/manual/core/migration/)
- Atlas Support: Check Atlas dashboard

