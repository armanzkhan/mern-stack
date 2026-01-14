# Fix Frontend Connection Issue

## Problem
You're getting: "Cannot connect to server at https://mern-stack-dtgy.vercel.app/"

## Root Cause
The `.env.local` file is missing or not being read by Next.js. The `getBackendUrl()` function defaults to `http://localhost:5000` when running on localhost.

## Solution

### Step 1: Create `.env.local` file

Create a file named `.env.local` in your `frontend` directory with this content:

```env
NEXT_PUBLIC_BACKEND_URL=https://mern-stack-dtgy.vercel.app
NEXT_PUBLIC_API_URL=https://mern-stack-dtgy.vercel.app
```

**Important:** 
- No trailing slashes
- No quotes around the URLs
- File must be named exactly `.env.local` (starts with a dot)

### Step 2: Restart Next.js Dev Server

After creating `.env.local`, you MUST restart your Next.js dev server:

1. Stop the current server (Ctrl+C)
2. Start it again: `npm run dev`

**Why?** Next.js only reads `.env.local` files when the server starts.

### Step 3: Verify It's Working

1. Open browser console (F12)
2. Look for: `[getBackendUrl] Using NEXT_PUBLIC_BACKEND_URL: https://mern-stack-dtgy.vercel.app`
3. Try logging in again

## Manual File Creation

If you can't create the file via command line, do this:

1. Navigate to your `frontend` folder
2. Create a new file named `.env.local` (make sure it starts with a dot)
3. Add these two lines:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://mern-stack-dtgy.vercel.app
   NEXT_PUBLIC_API_URL=https://mern-stack-dtgy.vercel.app
   ```
4. Save the file
5. Restart your Next.js dev server

## Troubleshooting

### Still not working?

1. **Check file location:** `.env.local` must be in the `frontend` root directory (same level as `package.json`)

2. **Check file name:** Must be exactly `.env.local` (not `env.local` or `.env.local.txt`)

3. **Check file content:** No extra spaces, no quotes, no trailing slashes

4. **Restart server:** Always restart after creating/modifying `.env.local`

5. **Check browser console:** Look for the `[getBackendUrl]` log messages

6. **Clear browser cache:** Sometimes helps

## Expected Behavior

After fixing:
- Browser console should show: `[getBackendUrl] Using NEXT_PUBLIC_BACKEND_URL: https://mern-stack-dtgy.vercel.app`
- Login should connect to: `https://mern-stack-dtgy.vercel.app/api/auth/login`
- No more "Cannot connect to server" error

