# Backend–Frontend Alignment Verification

**Date:** Verification run against current codebase  
**Backend:** Vercel serverless (`api/index.js`) + Express routes  
**Frontend:** Next.js 15 (App Router) with API proxy routes under `src/app/api/`

---

## 1. Configuration alignment

| Item | Frontend | Backend | Status |
|------|----------|---------|--------|
| **Backend URL (local)** | `NEXT_PUBLIC_BACKEND_URL` / `NEXT_PUBLIC_API_URL` → `http://localhost:5000` (`.env.local`) | `PORT=5000` (`.env`) | OK |
| **Backend URL (prod)** | Same env vars → e.g. `https://mern-stack-dtgy.vercel.app` | Deployed on Vercel at that URL | OK |
| **API base** | `getBackendUrl()` / `getBackendUrlServer()` → `{url}/api` | All routes under `/api/*` | OK |
| **Auth** | `Authorization: Bearer <token>`, `x-company-id` (when set) | Expects same headers | OK |

---

## 2. Endpoint alignment

### Auth

| Frontend call | Backend route | Notes |
|---------------|---------------|--------|
| `POST {backend}/api/auth/login` (Signin direct) | `POST /api/auth/login` | Aligned |
| `GET /api/auth/current-user` (proxy) | `GET /api/auth/current-user` | Proxy in `app/api/auth/current-user/route.ts` |

### Users

| Frontend call | Backend route | Notes |
|---------------|---------------|--------|
| `GET /api/users/me` | `GET /api/users/me` | Handled by `app/api/users/[id]/route.ts` with `id=me` → backend `/api/users/me`. Backend returns `{ user }`; frontend uses `data.user?.avatarUrl` — aligned |
| `GET/POST/PUT/DELETE /api/users`, `/api/users/:id` | Same on backend | Proxied via `app/api/users/route.ts` and `[id]/route.ts` |

### Orders

| Frontend call | Backend route | Notes |
|---------------|---------------|--------|
| `GET/POST/PUT /api/orders`, `/api/orders/:id`, `/api/orders/:id/status`, etc. | Same on backend | Backend has `getOrders`, `getOrderById`, `updateOrderStatus`, `updateDiscount`, manager approvals, etc. |
| `GET /api/invoices/order/:orderNumber` | `GET /api/invoices/order/:orderNumber` | Backend `invoiceRoutes`: `router.get('/order/:orderNumber', ...)` — aligned |

### Products & categories

| Frontend call | Backend route | Notes |
|---------------|---------------|--------|
| `GET /api/products`, `/api/products/:id`, `/api/products/categories` | Same on backend | Backend `productRoutes`: `get('/categories', ...)` — aligned |
| `GET /api/product-categories` | `GET /api/product-categories` | Backend `categoryRoutes` mounted at `/api/product-categories` — aligned |

### Customers

| Frontend call | Backend route | Notes |
|---------------|---------------|--------|
| `GET/POST/PUT /api/customers`, `/api/customers/:id`, `/api/customers/dashboard`, `/api/customers/orders`, etc. | Same on backend | Aligned |

### Managers

| Frontend call | Backend route | Notes |
|---------------|---------------|--------|
| `GET/POST/PUT /api/managers`, `/api/managers/:id`, `/api/managers/all`, `/api/managers/orders`, `/api/managers/assign-categories`, etc. | Same on backend | Aligned |

### Invoices

| Frontend call | Backend route | Notes |
|---------------|---------------|--------|
| `GET /api/invoices`, `/api/invoices/order/:orderNumber`, `POST /api/invoices/create-from-order`, etc. | Same on backend | Aligned |

### Customer ledger

| Frontend call | Backend route | Notes |
|---------------|---------------|--------|
| `GET /api/customer-ledger/:customerId/ledger` | `GET /api/customer-ledger/customers/:customerId/ledger` | Frontend proxy rewrites path correctly — aligned |
| `POST /api/customer-ledger/:customerId/payments` | `POST /api/customer-ledger/customers/:customerId/payments` | Same — aligned |

### Notifications

| Frontend call | Backend route | Notes |
|---------------|---------------|--------|
| `POST /api/store-notification` (frontend route) | `POST /api/notifications/store-realtime` | Frontend `store-notification/route.ts` forwards to backend `/api/notifications/store-realtime` — aligned |
| `GET /api/notifications/recent`, `POST /api/notifications/:id/read` | Same on backend | Aligned |

### Roles, permissions, companies

| Frontend call | Backend route | Notes |
|---------------|---------------|--------|
| `/api/roles`, `/api/permissions`, `/api/permission-groups`, `/api/companies` | Same on backend | Aligned |

---

## 3. Response shape alignment (spot-check)

- **`GET /api/users/me`**  
  Backend: `res.json({ user })`.  
  Frontend (user-info): `data.user?.avatarUrl` — aligned.

- **Auth login**  
  Frontend expects `token`, `refreshToken`, `user` (e.g. `_id`, `email`, `firstName`, `lastName`, `role`, `department`, `isSuperAdmin`, `isCompanyAdmin`, `isCustomer`, `isManager`, `userType`, `company_id`). Backend auth routes return compatible shape.

---

## 4. Summary

- **Configuration:** Backend URL and API base are consistent between frontend and backend for local and production.
- **Endpoints:** All checked frontend API calls map to the correct backend routes (direct or via Next.js API proxy).
- **Auth:** Token and company-id usage are aligned; login and current-user flows match.
- **Response shapes:** Spot-checked `/api/users/me` and auth login; no mismatch found.

**Conclusion:** Backend and frontend are aligned for the verified endpoints and configuration. For any new feature, ensure:

1. Frontend uses `getBackendUrl()` / `getBackendUrlServer()` (or proxy through `app/api/`) so the same backend URL is used everywhere.
2. New backend routes are mounted under `/api/*` and frontend proxy routes (if used) forward to the same path.
3. Auth: send `Authorization: Bearer <token>` and `x-company-id` when the user has a selected company.
