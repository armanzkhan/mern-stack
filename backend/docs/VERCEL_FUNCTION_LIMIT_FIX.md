# Vercel Function Limit Fix

## Problem
Vercel free tier (Hobby plan) has a limit of **12 serverless functions** per deployment. We had 15+ individual function files, which exceeded this limit.

## Solution
Consolidated all routes into a **single catch-all serverless function** (`api/index.js`).

## Changes Made

### 1. Created Single Catch-All Function
- **File**: `api/index.js`
- **Purpose**: Handles all API routes using Express
- **Routes**: All routes from `routes/` directory are mounted

### 2. Moved Individual Functions
- **Location**: `api/_backup/`
- **Reason**: Prevent Vercel from detecting them as separate functions
- **Files moved**: All individual function files (login.js, register.js, etc.)

### 3. Updated Configuration
- **`vercel.json`**: Simplified to route all `/api/*` to `api/index.js`
- **`.vercelignore`**: Added to ignore backup directory and utils

## Current Structure

```
api/
  ├── index.js          ← Single serverless function (handles all routes)
  ├── _utils/           ← Utility modules (not detected as functions)
  │   ├── db.js
  │   ├── handler.js
  │   └── expressRouter.js
  └── _backup/          ← Individual function files (backup, ignored by Vercel)
      └── ...
```

## Function Count

**Before**: 15+ functions (exceeded limit)
**After**: 1 function (within limit) ✅

## How It Works

1. All API requests (`/api/*`) are routed to `api/index.js`
2. `api/index.js` creates an Express app and mounts all routes
3. Routes work exactly the same as before
4. All existing functionality is preserved

## Benefits

- ✅ **Within free tier limit**: Only 1 function instead of 15+
- ✅ **Same functionality**: All routes work exactly as before
- ✅ **Easier maintenance**: Single entry point for all routes
- ✅ **Better performance**: No cold start for individual functions

## Deployment

The deployment should now work without the function limit error. All routes are accessible through the single `api/index.js` function.

