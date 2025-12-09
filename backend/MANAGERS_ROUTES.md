# Managers API Routes

## Base URL
`https://mern-stack-dtgy.vercel.app/api/managers`

## Available Routes

### Manager Profile Routes
- **GET** `/api/managers/profile` - Get manager profile (requires auth)
- **POST** `/api/managers/profile` - Create or update manager profile (requires auth)

### Manager Data Routes
- **GET** `/api/managers/orders` - Get manager's orders (requires auth)
- **GET** `/api/managers/products` - Get manager's products (requires auth)
- **GET** `/api/managers/reports` - Get manager reports (requires auth)

### Order Management Routes
- **PUT** `/api/managers/orders/:orderId/status` - Update order status (requires auth)
  - Example: `/api/managers/orders/12345/status`

### Admin Routes for Manager Management
- **GET** `/api/managers/all` - Get all managers (requires auth)
- **POST** `/api/managers/assign-categories` - Assign categories to manager (requires auth + `assign_categories` permission)

### CRUD Routes for Managers
- **GET** `/api/managers/users` - Get users (requires auth)
- **POST** `/api/managers` - Create manager (requires auth)
- **PUT** `/api/managers/:id` - Update manager (requires auth)
  - Example: `/api/managers/12345`
- **DELETE** `/api/managers/:id` - Delete manager (requires auth)
  - Example: `/api/managers/12345`

## Testing Examples

### Test 1: Get All Managers (requires auth token)
```bash
curl -X GET https://mern-stack-dtgy.vercel.app/api/managers/all \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 2: Get Manager Profile (requires auth token)
```bash
curl -X GET https://mern-stack-dtgy.vercel.app/api/managers/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test 3: Without Auth (should return 401)
```bash
curl -X GET https://mern-stack-dtgy.vercel.app/api/managers/all
```

Expected response: `401 Unauthorized` or `403 Forbidden`

## Common Issues

### "Route not found" Error
- **Cause**: You're accessing a route that doesn't exist
- **Solution**: Check the exact route path above (case-sensitive, no trailing `*`)

### 401/403 Errors
- **Cause**: Missing or invalid authentication token
- **Solution**: Include `Authorization: Bearer YOUR_TOKEN` header

### 404 on `/api/managers/*`
- **Cause**: The `*` is literal, not a wildcard
- **Solution**: Use actual routes like `/api/managers/all` or `/api/managers/profile`

