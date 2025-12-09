# Backend Setup

1. Copy `.env.example` to `.env` and set variables:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/rbac_demo
JWT_SECRET=_changeme
# 32 random bytes base64, e.g.:
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
ENCRYPTION_KEY=BASE64_32_BYTES
```

2. Install and run:

```
npm install
npm run dev
```




