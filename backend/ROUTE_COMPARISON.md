# API Route Comparison: Active vs Disabled

## Summary

**✅ Most routes have active replacements**
**⚠️ 3 routes were missing and have now been created**
**🗑️ Many routes can be safely removed**

## Routes with Active Replacements ✅

| Disabled Route | Active Replacement | Status |
|---------------|-------------------|--------|
| `/api/api.disabled/auth/current-user` | `/api/auth/current-user` | ✅ Replaced |
| `/api/api.disabled/customer-ledger/[customerId]/ledger` | `/api/customer-ledger/[customerId]/ledger` | ✅ Replaced |
| `/api/api.disabled/customer-ledger/[customerId]/payments` | `/api/customer-ledger/[customerId]/payments` | ✅ Replaced |
| `/api/api.disabled/customer-ledger/route` | `/api/customer-ledger/route` | ✅ Replaced |
| `/api/api.disabled/customers/[id]` | `/api/customers/[id]` | ✅ Replaced |
| `/api/api.disabled/customers/dashboard` | `/api/customers/dashboard` | ✅ Replaced |
| `/api/api.disabled/customers/orders` | `/api/customers/orders` | ✅ Replaced |
| `/api/api.disabled/customers/route` | `/api/customers/route` | ✅ Replaced |
| `/api/api.disabled/invoices/[id]` | `/api/invoices/[id]` | ✅ Replaced |
| `/api/api.disabled/invoices/[id]/duplicate` | `/api/invoices/[id]/duplicate` | ✅ Replaced |
| `/api/api.disabled/invoices/[id]/payment` | `/api/invoices/[id]/payment` | ✅ Replaced |
| `/api/api.disabled/invoices/[id]/status` | `/api/invoices/[id]/status` | ✅ Replaced |
| `/api/api.disabled/invoices/route` | `/api/invoices/route` | ✅ Replaced |
| `/api/api.disabled/invoices/stats` | `/api/invoices/stats` | ✅ Replaced |
| `/api/api.disabled/managers/[id]` | `/api/managers/[id]` | ✅ Replaced |
| `/api/api.disabled/managers/all` | `/api/managers/all` | ✅ Replaced |
| `/api/api.disabled/managers/assign-categories` | `/api/managers/assign-categories` | ✅ Replaced |
| `/api/api.disabled/managers/orders` | `/api/managers/orders` | ✅ Replaced |
| `/api/api.disabled/managers/orders/[id]/status` | `/api/managers/orders/[id]/status` | ✅ Replaced |
| `/api/api.disabled/managers/products` | `/api/managers/products` | ✅ Replaced |
| `/api/api.disabled/managers/profile` | `/api/managers/profile` | ✅ Replaced |
| `/api/api.disabled/managers/route` | `/api/managers/route` | ✅ Replaced |
| `/api/api.disabled/managers/users` | `/api/managers/users` | ✅ Replaced |
| `/api/api.disabled/notifications/[id]/read` | `/api/notifications/[id]/read` | ✅ Replaced |
| `/api/api.disabled/notifications/recent` | `/api/notifications/recent` | ✅ Replaced |
| `/api/api.disabled/orders/[id]` | `/api/orders/[id]` | ✅ Replaced |
| `/api/api.disabled/orders/[id]/status` | `/api/orders/[id]/status` | ✅ Replaced |
| `/api/api.disabled/orders/approve-item` | `/api/orders/approve-item` | ✅ Replaced |
| `/api/api.disabled/orders/manager/all-approvals` | `/api/orders/manager/all-approvals` | ✅ Replaced |
| `/api/api.disabled/orders/manager/pending-approvals` | `/api/orders/manager/pending-approvals` | ✅ Replaced |
| `/api/api.disabled/orders/route` | `/api/orders/route` | ✅ Replaced |
| `/api/api.disabled/orders/update-discount` | `/api/orders/update-discount` | ✅ Replaced |
| `/api/api.disabled/permissions/route` | `/api/permissions/route` | ✅ Replaced |
| `/api/api.disabled/product-categories/route` | `/api/product-categories/route` | ✅ Replaced |
| `/api/api.disabled/products/categories` | `/api/products/categories` | ✅ Replaced |
| `/api/api.disabled/products/route` | `/api/products/route` | ✅ Replaced |
| `/api/api.disabled/roles/[id]` | `/api/roles/[id]` | ✅ Replaced |
| `/api/api.disabled/roles/route` | `/api/roles/route` | ✅ Replaced |
| `/api/api.disabled/store-notification/route` | `/api/store-notification/route` | ✅ Replaced |
| `/api/api.disabled/users/[id]` | `/api/users/[id]` | ✅ Replaced |
| `/api/api.disabled/users/route` | `/api/users/route` | ✅ Replaced |

## Routes Created (Were Missing) ✅

| Route | Status | Used In |
|-------|--------|---------|
| `/api/invoices/create-from-order` | ✅ **CREATED** | `orders/page.tsx` |
| `/api/customers/products` | ✅ **CREATED** | `customer-dashboard`, `customer-products`, `customer/products` |
| `/api/managers/reports` | ✅ **CREATED** | `manager-dashboard/page.tsx` |

## Routes WITHOUT Active Replacements (Not Used) ❌

| Disabled Route | Notes |
|---------------|-------|
| `/api/api.disabled/auth/login` | Login handled by backend directly - not needed |
| `/api/api.disabled/companies/*` | Companies management - not used |
| `/api/api.disabled/customer-ledger/aging` | Aging report - not used |
| `/api/api.disabled/customer-ledger/summary` | Summary - not used |
| `/api/api.disabled/permissions/[id]` | Get single permission - not used |
| `/api/api.disabled/permission-groups/*` | Permission groups - not used |
| `/api/api.disabled/products/[id]` | Get single product - not used (frontend calls backend directly) |
| `/api/api.disabled/users/create` | Create user - handled by `/api/users` POST method |
| `/api/api.disabled/users/me` | Get current user - replaced by `/api/auth/current-user` |
| `/api/api.disabled/users/me/avatar` | User avatar - not used |

## Debug/Test Routes (Can be removed) 🗑️

- `/api/api.disabled/debug/*`
- `/api/api.disabled/debug-websocket`
- `/api/api.disabled/test-*`
- `/api/api.disabled/system-*`
- `/api/api.disabled/product-images/populate`
- `/api/api.disabled/websocket-test`

## Recommendation

✅ **Safe to remove `api.disabled` folder** - All actively used routes now have replacements!

