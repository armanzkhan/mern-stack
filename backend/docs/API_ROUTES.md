# API Routes Documentation

## Base URL
Your Vercel deployment URL: `https://mern-stack-dtgy.vercel.app`

## Health Check
- **GET** `/api/health` - Health check (no auth required)
- **GET** `/api/health/test` - Health check test (no auth required)

## Authentication Routes (`/api/auth`)
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user
- **POST** `/api/auth/refresh` - Refresh access token
- **GET** `/api/auth/me` - Get current user (requires auth)
- **GET** `/api/auth/current-user` - Get current user (requires auth)

## User Routes (`/api/users`)
- **GET** `/api/users/me` - Get current user profile
- **PUT** `/api/users/me` - Update current user profile
- **GET** `/api/users` - Get all users (requires auth + permissions)
- **POST** `/api/users` - Create user (requires auth + permissions)
- **GET** `/api/users/:id` - Get user by ID (requires auth + permissions)
- **PUT** `/api/users/:id` - Update user (requires auth + permissions)
- **DELETE** `/api/users/:id` - Delete user (requires auth + permissions)
- **PUT** `/api/users/:id/password` - Reset user password (admin only)
- **POST** `/api/users/test` - Test route (for testing, no auth)

## Company Routes (`/api/companies`)
- **GET** `/api/companies` - Get all companies (requires auth)
- **POST** `/api/companies` - Create company (requires auth)
- **GET** `/api/companies/:id` - Get company by ID (requires auth)
- **PUT** `/api/companies/:id` - Update company (requires auth)
- **DELETE** `/api/companies/:id` - Delete company (requires auth)

## Customer Routes (`/api/customers`)
- **GET** `/api/customers` - Get all customers (requires auth)
- **POST** `/api/customers` - Create customer (requires auth)
- **GET** `/api/customers/:id` - Get customer by ID (requires auth)
- **PUT** `/api/customers/:id` - Update customer (requires auth)
- **DELETE** `/api/customers/:id` - Delete customer (requires auth)
- **GET** `/api/customers/:id/orders` - Get customer orders (requires auth)

## Order Routes (`/api/orders`)
- **GET** `/api/orders` - Get all orders (requires auth)
- **POST** `/api/orders` - Create order (requires auth)
- **GET** `/api/orders/:id` - Get order by ID (requires auth)
- **PUT** `/api/orders/:id` - Update order (requires auth)
- **DELETE** `/api/orders/:id` - Delete order (requires auth)

## Product Routes (`/api/products`)
- **GET** `/api/products` - Get all products (requires auth)
- **POST** `/api/products` - Create product (requires auth)
- **GET** `/api/products/:id` - Get product by ID (requires auth)
- **PUT** `/api/products/:id` - Update product (requires auth)
- **DELETE** `/api/products/:id` - Delete product (requires auth)

## Role Routes (`/api/roles`)
- **GET** `/api/roles` - Get all roles (requires auth)
- **POST** `/api/roles` - Create role (requires auth)
- **GET** `/api/roles/:id` - Get role by ID (requires auth)
- **PUT** `/api/roles/:id` - Update role (requires auth)
- **DELETE** `/api/roles/:id` - Delete role (requires auth)

## Permission Routes (`/api/permissions`)
- **GET** `/api/permissions` - Get all permissions (requires auth)
- **POST** `/api/permissions` - Create permission (requires auth)
- **GET** `/api/permissions/:id` - Get permission by ID (requires auth)
- **PUT** `/api/permissions/:id` - Update permission (requires auth)
- **DELETE** `/api/permissions/:id` - Delete permission (requires auth)

## Permission Group Routes (`/api/permission-groups`)
- **GET** `/api/permission-groups` - Get all permission groups (requires auth)
- **POST** `/api/permission-groups` - Create permission group (requires auth)
- **GET** `/api/permission-groups/:id` - Get permission group by ID (requires auth)
- **PUT** `/api/permission-groups/:id` - Update permission group (requires auth)
- **DELETE** `/api/permission-groups/:id` - Delete permission group (requires auth)

## Notification Routes (`/api/notifications`)
- **GET** `/api/notifications` - Get all notifications (requires auth)
- **POST** `/api/notifications` - Create notification (requires auth)
- **GET** `/api/notifications/:id` - Get notification by ID (requires auth)
- **PUT** `/api/notifications/:id` - Update notification (requires auth)
- **DELETE** `/api/notifications/:id` - Delete notification (requires auth)
- **PUT** `/api/notifications/:id/read` - Mark notification as read (requires auth)

## Manager Routes (`/api/managers`)
- **GET** `/api/managers` - Get all managers (requires auth)
- **POST** `/api/managers` - Create manager (requires auth)
- **GET** `/api/managers/:id` - Get manager by ID (requires auth)
- **PUT** `/api/managers/:id` - Update manager (requires auth)
- **DELETE** `/api/managers/:id` - Delete manager (requires auth)

## Product Category Routes (`/api/product-categories`)
- **GET** `/api/product-categories` - Get all product categories (requires auth)
- **POST** `/api/product-categories` - Create product category (requires auth)
- **GET** `/api/product-categories/:id` - Get product category by ID (requires auth)
- **PUT** `/api/product-categories/:id` - Update product category (requires auth)
- **DELETE** `/api/product-categories/:id` - Delete product category (requires auth)

## Invoice Routes (`/api/invoices`)
- **GET** `/api/invoices` - Get all invoices (requires auth)
- **POST** `/api/invoices` - Create invoice (requires auth)
- **GET** `/api/invoices/:id` - Get invoice by ID (requires auth)
- **PUT** `/api/invoices/:id` - Update invoice (requires auth)
- **DELETE** `/api/invoices/:id` - Delete invoice (requires auth)

## Customer Ledger Routes (`/api/customer-ledger`)
- **GET** `/api/customer-ledger` - Get all customer ledger entries (requires auth)
- **POST** `/api/customer-ledger` - Create customer ledger entry (requires auth)
- **GET** `/api/customer-ledger/:id` - Get customer ledger entry by ID (requires auth)
- **PUT** `/api/customer-ledger/:id` - Update customer ledger entry (requires auth)
- **DELETE** `/api/customer-ledger/:id` - Delete customer ledger entry (requires auth)

## Product Image Routes (`/api/product-images`)
- **GET** `/api/product-images` - Get all product images (requires auth)
- **POST** `/api/product-images` - Upload product image (requires auth)
- **GET** `/api/product-images/:id` - Get product image by ID (requires auth)
- **DELETE** `/api/product-images/:id` - Delete product image (requires auth)

## How to Verify Deployment

### 1. Check Vercel Dashboard
- Go to your Vercel dashboard: https://vercel.com/dashboard
- Check the deployment status (should be "Ready" or "Building")
- Check the deployment logs for any errors

### 2. Test Health Check Endpoint
```bash
# Using curl
curl https://mern-stack-dtgy.vercel.app/api/health

# Using browser
# Open: https://mern-stack-dtgy.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-10T17:30:00.000Z"
}
```

### 3. Test Health Check with Database
```bash
curl https://mern-stack-dtgy.vercel.app/api/health/test
```

### 4. Check Function Logs
- Go to Vercel Dashboard → Your Project → Functions
- Click on `api/index.js`
- Check the "Logs" tab for any errors

### 5. Test Authentication Endpoint
```bash
# Test login (should return error if no credentials, but should not timeout)
curl -X POST https://mern-stack-dtgy.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 6. Check Environment Variables
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Ensure `CONNECTION_STRING` is set (if you want to override default MongoDB connection)

## Common Issues

### 1. Function Timeout
- **Symptom**: 504 Gateway Timeout
- **Solution**: Check database connection, reduce timeout in code

### 2. Function Crashes
- **Symptom**: 500 Internal Server Error
- **Solution**: Check Vercel logs for specific error messages

### 3. Route Not Found
- **Symptom**: 404 Not Found
- **Solution**: Check that route path matches exactly (case-sensitive)

### 4. Database Connection Issues
- **Symptom**: 503 Service Unavailable
- **Solution**: Check MongoDB Atlas connection string and network access

## Testing Checklist

- [ ] Health check endpoint responds (`/api/health`)
- [ ] Health check test endpoint responds (`/api/health/test`)
- [ ] Login endpoint accepts requests (`/api/auth/login`)
- [ ] Register endpoint accepts requests (`/api/auth/register`)
- [ ] No timeout errors in logs
- [ ] No crash errors in logs
- [ ] Database connection works (check logs)

## Quick Test Script

Save this as `test-deployment.sh`:

```bash
#!/bin/bash

BASE_URL="https://mern-stack-dtgy.vercel.app"

echo "Testing Health Check..."
curl -s "$BASE_URL/api/health" | jq .

echo -e "\nTesting Health Check Test..."
curl -s "$BASE_URL/api/health/test" | jq .

echo -e "\nTesting Login (should fail without credentials)..."
curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}' | jq .
```

Or for Windows PowerShell:

```powershell
$baseUrl = "https://mern-stack-dtgy.vercel.app"

Write-Host "Testing Health Check..."
Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get

Write-Host "`nTesting Health Check Test..."
Invoke-RestMethod -Uri "$baseUrl/api/health/test" -Method Get

Write-Host "`nTesting Login..."
Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"test","password":"test"}'
```

