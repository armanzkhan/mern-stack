# Ressichem System Flow: Customers, Managers, and Product Categories

## Overview
This document explains how customers, managers, and product categories interact in the Ressichem system, including how orders are routed and managed based on category assignments.

---

## 1. **Customer Flow**

### 1.1 Customer Creation
**Location**: `/users/create` or `/customers/create`

**Process**:
1. **User Account Creation**:
   - User is created with `isCustomer: true`
   - User gets `customerProfile` object with:
     - `customer_id`: Reference to Customer record
     - `companyName`: "Ressichem" (auto-filled)
     - `customerType`: "regular" (default)
     - `assignedManager`: Initially empty (optional)
     - `preferences`: Notification and category preferences

2. **Customer Record Creation**:
   - A separate `Customer` record is created in the `customers` collection
   - Contains business information:
     - `companyName`, `contactName`, `email`, `phone`
     - `street`, `city`, `state`, `zip`, `country`
     - `customerType`, `status`, `paymentTerms`, `creditLimit`
   - `user_id`: Links to the User record
   - `assignedManager`: Optional direct manager assignment (legacy)

**Key Models**:
- `User` (with `isCustomer: true` and `customerProfile`)
- `Customer` (separate business entity)

### 1.2 Customer Capabilities
- **View Products**: Can browse all products
- **Create Orders**: Can create orders with products
- **View Own Orders**: Can only see their own orders
- **View Own Invoices**: Can only see their own invoices
- **Dashboard**: Customer-specific dashboard with their statistics

### 1.3 Customer-Product Relationship
- Customers can view **all products** regardless of category
- No category restrictions for customers
- Products are filtered by `company_id` only

---

## 2. **Manager Flow**

### 2.1 Manager Creation
**Location**: `/managers/create` or `/users/create` (with userType: "Manager")

**Process**:
1. **User Account Creation**:
   - User is created with `isManager: true`
   - User gets `managerProfile` object with:
     - `manager_id`: Reference to Manager record (set after Manager creation)
     - `assignedCategories`: Array of category names (initially empty)
     - `managerLevel`: "junior" | "senior" | "lead" | "head"
     - `canAssignCategories`: false (default)
     - `notificationPreferences`: Various notification settings

2. **Manager Record Creation**:
   - A `Manager` record is created in the `managers` collection
   - Contains:
     - `user_id`: Links to User record
     - `company_id`: Company identifier
     - `assignedCategories`: Array of category objects:
       ```javascript
       {
         category: "Building Care & Maintenance",
         subCategory: "Optional subcategory",
         assignedBy: ObjectId,
         assignedAt: Date,
         isActive: true
       }
       ```
     - `managerLevel`: Manager hierarchy level
     - `performance`: Tracking metrics
     - `isActive`: Status flag

3. **Category Assignment**:
   - Categories are assigned via `/categories` page
   - Only **8 allowed categories** can be assigned:
     - Building Care & Maintenance
     - Concrete Admixtures
     - Decorative Concrete
     - Dry Mix Mortars / Premix Plasters
     - Epoxy Adhesives and Coatings
     - Epoxy Floorings & Coatings
     - Specialty Products
     - Tiling and Grouting Materials
   - When categories are assigned:
     - `Manager.assignedCategories` is updated
     - `User.managerProfile.assignedCategories` is synced
     - `CategoryAssignment` records are created (one per category)

**Key Models**:
- `User` (with `isManager: true` and `managerProfile`)
- `Manager` (separate manager entity)
- `CategoryAssignment` (tracks category-manager relationships)

### 2.2 Manager Capabilities
- **View Orders**: Only orders containing products from their assigned categories
- **Update Order Status**: Only for orders in their categories
- **View Products**: All products, but filtered by category when managing orders
- **Category Management**: Can view and manage products in assigned categories
- **Reports**: Category-specific reports and statistics

### 2.3 Manager-Product Relationship
- Managers see **all products** but only manage orders containing products from their assigned categories
- Order filtering is done by matching:
  - Product's `category.mainCategory` with manager's `assignedCategories`
  - Product's `category.subCategory` with manager's `assignedCategories`
  - Product's `category.subSubCategory` with manager's `assignedCategories`

---

## 3. **Product Category Flow**

### 3.1 Product Structure
**Model**: `Product`

**Category Structure**:
```javascript
{
  category: {
    mainCategory: "Building Care & Maintenance",  // Required
    subCategory: "Optional subcategory",           // Optional
    subSubCategory: "Optional sub-subcategory"    // Optional
  }
}
```

**Key Points**:
- Every product **must** have a `mainCategory`
- `subCategory` and `subSubCategory` are optional
- Categories are stored as strings, not references
- Products are filtered by `company_id` first, then by category

### 3.2 Allowed Categories
Only **8 main categories** are allowed in the system:
1. Building Care & Maintenance
2. Concrete Admixtures
3. Decorative Concrete
4. Dry Mix Mortars / Premix Plasters
5. Epoxy Adhesives and Coatings
6. Epoxy Floorings & Coatings
7. Specialty Products
8. Tiling and Grouting Materials

**Note**: Subcategories can exist under these main categories, but only these 8 main categories can be assigned to managers.

### 3.3 Product-Category Assignment
- Products are created with a category at creation time
- Category cannot be changed after product creation (in current implementation)
- Products are linked to managers through category matching

---

## 4. **Order Flow: How Everything Connects**

### 4.1 Order Creation
**Location**: `/orders/create`

**Process**:
1. **Customer Creates Order**:
   - Customer selects products from any category
   - Order is created with:
     - `customer`: Reference to Customer record
     - `items`: Array of order items, each containing:
       - `product`: Reference to Product
       - `quantity`: Number
       - `unitPrice`: From `product.price`
       - `total`: `unitPrice * quantity`
     - `categories`: Auto-populated array of unique `mainCategory` values from all products
     - `status`: "pending" (default)
     - `approvalStatus`: "pending" (default)

2. **Category Extraction**:
   - System extracts `mainCategory` from each product's `category.mainCategory`
   - Stores unique categories in `order.categories` array
   - Example: If order has products from "Building Care & Maintenance" and "Epoxy Floorings & Coatings", then:
     ```javascript
     order.categories = ["Building Care & Maintenance", "Epoxy Floorings & Coatings"]
     ```

### 4.2 Order Routing to Managers
**Location**: Backend `orderController.js` and `managerController.js`

**Process**:
1. **When Manager Views Orders** (`GET /api/orders`):
   - System checks `req.user.isManager` and `req.user.managerProfile.assignedCategories`
   - Filters orders where:
     - `order.categories` contains any of manager's `assignedCategories`, OR
     - Order items contain products whose `category.mainCategory` matches manager's `assignedCategories`

2. **Order Filtering Logic**:
   ```javascript
   // Manager's assigned categories
   const managerCategories = ["Building Care & Maintenance", "Epoxy Floorings & Coatings"];
   
   // Query filters orders where:
   {
     $or: [
       { categories: { $in: managerCategories } },  // Direct category match
       { 
         "items.product": {
           $in: products.filter(p => 
             managerCategories.includes(p.category.mainCategory)
           )
         }
       }
     ]
   }
   ```

3. **Manager Can Only See**:
   - Orders containing at least one product from their assigned categories
   - Their own order statistics (filtered by category)

### 4.3 Order Approval Flow
**Location**: Backend `orderController.js` and `itemApprovalService.js`

**Process**:
1. **Category-Based Approvals**:
   - Each order can have multiple approvals, one per category
   - `order.approvals` array contains:
     ```javascript
     {
       category: "Building Care & Maintenance",
       approvedBy: ObjectId (Manager),
       approvedAt: Date,
       status: "pending" | "approved" | "rejected",
       comments: String,
       discountPercentage: Number,
       discountAmount: Number,
       originalAmount: Number
     }
     ```

2. **Manager Approval**:
   - Manager can approve/reject orders for their assigned categories
   - Only managers assigned to a category can approve orders containing products from that category
   - System finds managers for each category using `CategoryAssignment` model

3. **Approval Status**:
   - Order `approvalStatus` is "pending" until all categories are approved
   - Order `approvalStatus` becomes "approved" when all categories are approved
   - Order `approvalStatus` becomes "rejected" if any category is rejected

---

## 5. **Data Models Relationship Diagram**

```
┌─────────────┐
│    User     │
│             │
│ isCustomer  │───┐
│ isManager   │───┤
│             │   │
│ customerProfile││
│ managerProfile││
└─────────────┘   │
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│   Customer   │    │   Manager    │
│              │    │              │
│ companyName  │    │ assignedCategories│
│ contactName  │    │ managerLevel │
│ email        │    │ performance  │
│ user_id      │    │ user_id      │
└──────────────┘    └──────────────┘
        │                   │
        │                   │
        │                   │ (assignedCategories)
        │                   │
        │                   ▼
        │            ┌──────────────────┐
        │            │CategoryAssignment│
        │            │                  │
        │            │ category         │
        │            │ manager_id       │
        │            │ isActive         │
        └────────────┴──────────────────┘
                     │
                     │ (category matching)
                     │
                     ▼
              ┌──────────────┐
              │   Product    │
              │              │
              │ category: {  │
              │   mainCategory│
              │   subCategory│
              │ }            │
              └──────────────┘
                     │
                     │ (items.product)
                     │
                     ▼
              ┌──────────────┐
              │    Order     │
              │              │
              │ customer     │
              │ items[]      │
              │ categories[] │
              │ approvals[]  │
              └──────────────┘
```

---

## 6. **Complete Flow Example**

### Scenario: Customer Creates Order with Products from Multiple Categories

**Step 1: Customer Creates Order**
- Customer "Ressichem" (yousuf@gmail.com) creates an order
- Adds products:
  - Product A: "Building Care & Maintenance" category
  - Product B: "Epoxy Floorings & Coatings" category

**Step 2: Order is Created**
```javascript
{
  orderNumber: "ORD-1763628392068-pp4aqg918",
  customer: ObjectId("customer_id"),
  items: [
    { product: ObjectId("productA_id"), quantity: 10, unitPrice: 161, total: 1610 },
    { product: ObjectId("productB_id"), quantity: 5, unitPrice: 200, total: 1000 }
  ],
  categories: ["Building Care & Maintenance", "Epoxy Floorings & Coatings"],
  status: "pending",
  approvalStatus: "pending"
}
```

**Step 3: Managers See the Order**
- Manager 1 (assigned to "Building Care & Maintenance") → **SEES** the order
- Manager 2 (assigned to "Epoxy Floorings & Coatings") → **SEES** the order
- Manager 3 (assigned to "Concrete Admixtures") → **DOES NOT SEE** the order

**Step 4: Managers Approve**
- Manager 1 approves the "Building Care & Maintenance" portion
- Manager 2 approves the "Epoxy Floorings & Coatings" portion
- Order `approvalStatus` becomes "approved" (all categories approved)

**Step 5: Order Processing**
- Order status can be updated by either manager (for their category)
- Order moves through workflow: pending → approved → confirmed → processing → dispatched → completed

---

## 7. **Key API Endpoints**

### Customer Endpoints
- `POST /api/customers` - Create customer
- `GET /api/customers` - Get all customers (filtered by role)
- `GET /api/customers/:id` - Get single customer
- `GET /api/orders` - Get customer's own orders
- `GET /api/invoices` - Get customer's own invoices

### Manager Endpoints
- `POST /api/managers` - Create manager
- `GET /api/managers/all` - Get all managers
- `POST /api/managers/assign-categories` - Assign categories to manager
- `GET /api/orders` - Get orders (filtered by manager's categories)
- `PUT /api/orders/:id/status` - Update order status (only for manager's categories)

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products?category=...` - Get products by category
- `POST /api/products` - Create product (with category)
- `PUT /api/products/:id` - Update product

### Category Endpoints
- `GET /api/product-categories` - Get all categories
- `POST /api/managers/assign-categories` - Assign categories to manager

---

## 8. **Important Notes**

### 8.1 Category Assignment Restrictions
- Only **8 main categories** can be assigned to managers
- Subcategories can exist but are not directly assignable
- Managers are matched to products by `mainCategory` only

### 8.2 Order Visibility Rules
- **Customers**: See only their own orders
- **Managers**: See orders containing products from their assigned categories
- **Admins**: See all orders

### 8.3 Manager Assignment
- Managers are **not** directly assigned to customers
- Managers are assigned to **categories**
- Orders are routed to managers based on product categories in the order
- This allows dynamic routing: if a customer orders products from different categories, multiple managers handle the order

### 8.4 Data Synchronization
- When categories are assigned to a manager:
  1. `Manager.assignedCategories` is updated
  2. `User.managerProfile.assignedCategories` is synced
  3. `CategoryAssignment` records are created/updated
- This ensures consistency across all models

---

## 9. **Frontend Pages**

### Customer Pages
- `/orders/create` - Create new order
- `/orders` - View own orders
- `/invoices` - View own invoices
- `/products` - Browse all products
- `/customer-dashboard` - Customer dashboard

### Manager Pages
- `/managers` - View all managers (admin)
- `/managers/create` - Create manager (admin)
- `/categories` - Assign categories to managers (admin)
- `/orders` - View orders (filtered by categories)
- `/manager-dashboard` - Manager dashboard

### Admin Pages
- `/users/create` - Create users (customers/managers/staff)
- `/customers` - Manage customers
- `/products` - Manage products
- `/orders` - View all orders
- `/categories` - Manage categories and assignments

---

## 10. **Summary**

**The Flow in Simple Terms**:
1. **Customers** create orders with products from various categories
2. **Products** belong to categories (mainCategory, subCategory, subSubCategory)
3. **Managers** are assigned to specific categories (only 8 allowed)
4. **Orders** are automatically routed to managers based on the categories of products in the order
5. **Managers** can only see and manage orders containing products from their assigned categories
6. **Approvals** are category-based: each category in an order needs approval from its assigned manager

This system ensures that:
- Orders are automatically routed to the right managers
- Managers only see relevant orders
- Multiple managers can handle different parts of the same order
- The system scales as new categories and managers are added

