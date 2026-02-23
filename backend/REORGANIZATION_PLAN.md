# Project Reorganization Plan

## Current Problem
- Backend files are duplicated at root level and in `backend/` folder
- Nested `backend/backend/` folder exists
- Root has backend files (server.js, routes/, controllers/, models/, etc.) that should be in `backend/`
- This creates confusion and maintenance issues

## Target Structure

```
Ressichem/
├── README.md                    # Main project README
├── .gitignore                   # Root gitignore
├── vercel.json                  # Vercel config (points to api/index.js)
├── api/                         # Vercel serverless functions (stays at root)
│   ├── index.js                 # Updated to reference ../backend/routes/
│   └── _utils/                  # Vercel-specific utilities
│
├── backend/                     # ALL backend code
│   ├── server.js               # Express server entry point
│   ├── package.json            # Backend dependencies
│   ├── package-lock.json
│   ├── nodemon.json
│   ├── vercel.json             # (can be removed, using root one)
│   ├── routes/                 # API routes
│   ├── controllers/            # Business logic
│   ├── models/                 # Mongoose models
│   ├── middleware/             # Auth & permission middleware
│   ├── services/               # Business services
│   ├── utils/                  # Helper functions
│   ├── scripts/                # Seed & utility scripts
│   ├── tests/                  # Test files
│   ├── config/                 # Configuration
│   ├── data/                   # Data files
│   ├── uploads/                # Uploaded files
│   ├── docs/                   # Backend documentation
│   └── [all .md files]         # Backend-specific docs
│
└── frontend/                    # ALL frontend code (already organized)
    ├── package.json
    ├── src/
    └── ...
```

## Files to Move from Root to Backend/

### Directories:
- `routes/` → `backend/routes/`
- `controllers/` → `backend/controllers/`
- `models/` → `backend/models/`
- `middleware/` → `backend/middleware/`
- `services/` → `backend/services/`
- `utils/` → `backend/utils/`
- `scripts/` → `backend/scripts/`
- `tests/` → `backend/tests/`
- `config/` → `backend/config/`
- `data/` → `backend/data/`
- `uploads/` → `backend/uploads/`
- `docs/` → `backend/docs/` (merge with existing)

### Files:
- `server.js` → `backend/server.js` (if different, merge)
- `package.json` → `backend/package.json` (if different, merge)
- `package-lock.json` → `backend/package-lock.json`
- `nodemon.json` → `backend/nodemon.json`
- `vercel.json` → Can be removed from backend (using root one)
- `test-*.js` → `backend/tests/`
- `verify-all-connections.js` → `backend/scripts/`

### Documentation Files:
All `.md` files related to backend should be in `backend/docs/` or `backend/`:
- Keep only `README.md` at root
- Move all other `.md` files to `backend/docs/` or `backend/`

## Files to Keep at Root

- `README.md` - Main project documentation
- `.gitignore` - Root gitignore
- `vercel.json` - Vercel deployment config
- `api/` - Vercel serverless functions (must stay at root for Vercel)

## Files to Remove

- `backend/backend/` - Nested duplicate folder (remove entirely)

## Path Updates Required

1. ✅ `api/index.js` - Updated to reference `../backend/routes/` instead of `../routes/`
2. Check all files in `api/` for any other path references
3. Update any scripts that reference root-level paths

## Steps Completed

1. ✅ Updated `api/index.js` to reference `../backend/routes/`

## Next Steps

1. Move all backend directories from root to `backend/`
2. Move all backend files from root to `backend/`
3. Remove `backend/backend/` folder
4. Organize documentation files
5. Test that everything still works

## Notes

- The `api/` folder must stay at root for Vercel deployment
- All backend code should be in `backend/` folder
- Frontend code is already properly organized in `frontend/`
- After reorganization, run tests to ensure nothing is broken

