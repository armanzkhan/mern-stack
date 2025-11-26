const OrderItemApproval = require('../models/OrderItemApproval');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Customer = require('../models/Customer');
const notificationService = require('./notificationService');
const invoiceService = require('./invoiceService');
const realtimeService = require('./realtimeService');

class ItemApprovalService {
  
  /**
   * Normalize category name for comparison
   * Handles variations like "and" vs "&", case differences, extra spaces, etc.
   */
  normalizeCategoryName(category) {
    if (!category || typeof category !== 'string') return '';
    return category
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .replace(/\s*&\s*/g, ' and ') // Replace & with " and "
      .replace(/\s+and\s+/g, ' and ') // Normalize "and" spacing
      .trim();
  }
  
  /**
   * Check if two category names match (handles variations)
   */
  categoriesMatch(category1, category2) {
    const norm1 = this.normalizeCategoryName(category1);
    const norm2 = this.normalizeCategoryName(category2);
    
    // Exact match after normalization
    if (norm1 === norm2) return true;
    
    // Check if one contains the other (for partial matches)
    if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
    
    return false;
  }
  
  /**
   * Create approval entries for each item in an order
   * Routes items to their respective category managers
   */
  async createItemApprovals(order) {
    try {
      console.log('🔍 Creating item approvals for order:', order.orderNumber);
      
      const itemApprovals = [];
      
      // Get all products with their categories
      const productIds = order.items.map(item => item.product);
      const products = await Product.find({ _id: { $in: productIds } });
      const productMap = new Map(products.map(p => [p._id.toString(), p]));
      
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        const product = productMap.get(item.product.toString());
        
        if (!product) {
          console.error(`❌ Product not found for item ${i}:`, item.product);
          continue;
        }
        
        // Determine the category for this item
        let category = '';
        if (typeof product.category === 'string') {
          category = product.category;
        } else if (product.category && product.category.mainCategory) {
          category = product.category.mainCategory;
        }
        
        if (!category) {
          console.warn(`⚠️ No category found for product ${product.name}, skipping approval`);
          continue;
        }
        
        // Find managers assigned to this category AND to the customer
        console.log(`🔍 Looking for managers for item ${i}: category="${category}", customer="${order.customer}"`);
        const managers = await this.getManagersForCategory(category, order.company_id, order.customer);
        console.log(`👥 Found ${managers.length} manager(s) for item ${i} (category: ${category})`);
        
        if (managers.length === 0) {
          console.warn(`⚠️ No managers found for category "${category}" and customer "${order.customer}", auto-approving item ${i}`);
          // Auto-approve if no manager is assigned
          itemApprovals.push({
            orderId: order._id,
            itemIndex: i,
            product: item.product,
            category: category,
            assignedManager: null, // No manager assigned
            status: 'approved',
            approvedBy: null,
            approvedAt: new Date(),
            originalAmount: item.total,
            company_id: order.company_id
          });
        } else if (managers.length === 1) {
          // Only one manager - assign to them
          const assignedManager = managers[0];
          console.log(`📋 Assigning item ${i} (${category}) to manager: ${assignedManager.email} (User._id: ${assignedManager._id}, user_id: ${assignedManager.user_id})`);
          
          itemApprovals.push({
            orderId: order._id,
            itemIndex: i,
            product: item.product,
            category: category,
            assignedManager: assignedManager._id,
            status: 'pending',
            originalAmount: item.total,
            company_id: order.company_id
          });
        } else {
          // Multiple managers have this category - assign to ALL of them
          // This ensures all relevant managers can see and approve the order
          console.log(`📋 Multiple managers (${managers.length}) found for category "${category}" - assigning to ALL managers`);
          
          for (const manager of managers) {
            console.log(`   - Assigning to manager: ${manager.email} (User._id: ${manager._id}, user_id: ${manager.user_id})`);
            
            itemApprovals.push({
              orderId: order._id,
              itemIndex: i,
              product: item.product,
              category: category,
              assignedManager: manager._id,
              status: 'pending',
              originalAmount: item.total,
              company_id: order.company_id
            });
          }
        }
      }
      
      // Save all approval entries
      if (itemApprovals.length > 0) {
        await OrderItemApproval.insertMany(itemApprovals);
        console.log(`✅ Created ${itemApprovals.length} item approval entries`);
        
        // Send notifications to managers
        await this.notifyManagers(itemApprovals);
        
        // Check if all items are auto-approved (no pending approvals)
        // If so, update order status immediately
        const hasPendingApprovals = itemApprovals.some(a => a.status === 'pending');
        if (!hasPendingApprovals) {
          console.log(`📋 All items auto-approved, checking order completion...`);
          await this.checkOrderCompletion(order._id);
        }
      }
      
      return itemApprovals;
    } catch (error) {
      console.error('❌ Error creating item approvals:', error);
      throw error;
    }
  }
  
  /**
   * Get managers assigned to a specific category
   * If customerId is provided, only returns managers assigned to that customer
   */
  async getManagersForCategory(category, companyId, customerId = null) {
    try {
      console.log(`🔍 getManagersForCategory called: category="${category}", companyId="${companyId}", customerId="${customerId}"`);
      
      // First, get all managers
      let managers = await User.find({
        company_id: companyId,
        isManager: true,
        isActive: true
      });
      
      // Filter managers who have this category - check both User.managerProfile and Manager record
      const Manager = require('../models/Manager');
      const managersWithCategory = [];
      
      for (const manager of managers) {
        let hasCategory = false;
        let categories = [];
        
        // Check User.managerProfile.assignedCategories
        if (manager.managerProfile && manager.managerProfile.assignedCategories) {
          categories = manager.managerProfile.assignedCategories;
          hasCategory = categories.some(cat => {
            const catStr = typeof cat === 'string' ? cat : (cat.category || cat);
            return this.categoriesMatch(catStr, category);
          });
        }
        
        // If not found in User.managerProfile, check Manager record
        if (!hasCategory && manager.user_id) {
          const managerRecord = await Manager.findOne({ user_id: manager.user_id, company_id: companyId });
          if (managerRecord && managerRecord.assignedCategories) {
            categories = managerRecord.assignedCategories.map(cat => typeof cat === 'string' ? cat : cat.category);
            hasCategory = categories.some(cat => {
              const catStr = typeof cat === 'string' ? cat : (cat.category || cat);
              return this.categoriesMatch(catStr, category);
            });
          }
        }
        
        if (hasCategory) {
          managersWithCategory.push(manager);
        } else {
          console.log(`⚠️ Manager ${manager.email} does not have category "${category}". Checked categories:`, categories);
        }
      }
      
      managers = managersWithCategory;
      
      console.log(`👥 Found ${managers.length} managers with category "${category}"`);
      managers.forEach(m => console.log(`   - ${m.email} (user_id: ${m.user_id})`));
      
      // If customerId is provided, filter to:
      // 1. Managers assigned to this customer (if customer has assigned managers)
      // 2. OR all managers with the category (if customer has no assigned managers)
      if (customerId) {
        const Manager = require('../models/Manager');
        const customer = await Customer.findById(customerId);
        
        if (!customer) {
          console.warn(`⚠️ Customer not found: ${customerId}`);
          return [];
        }
        
        console.log(`👤 Customer: ${customer.companyName} (${customer.email})`);
        
        // Get manager IDs assigned to this customer
        const assignedManagerIds = new Set();
        
        // Check legacy assignedManager
        if (customer.assignedManager?.manager_id) {
          console.log(`   Checking assignedManager.manager_id: ${customer.assignedManager.manager_id}`);
          const manager = await Manager.findById(customer.assignedManager.manager_id);
          if (manager && manager.user_id) {
            assignedManagerIds.add(manager.user_id);
            console.log(`   ✅ Found manager via assignedManager: ${manager.user_id}`);
          } else {
            console.log(`   ⚠️ Manager record not found for assignedManager.manager_id: ${customer.assignedManager.manager_id}`);
          }
        }
        
        // Check assignedManagers array
        if (customer.assignedManagers && Array.isArray(customer.assignedManagers)) {
          console.log(`   Checking assignedManagers array (${customer.assignedManagers.length} entries)`);
          for (const am of customer.assignedManagers) {
            if (am.manager_id && am.isActive !== false) {
              console.log(`   Checking assignedManagers entry: manager_id=${am.manager_id}, isActive=${am.isActive}`);
              const manager = await Manager.findById(am.manager_id);
              if (manager && manager.user_id) {
                assignedManagerIds.add(manager.user_id);
                console.log(`   ✅ Found manager via assignedManagers: ${manager.user_id}`);
              } else {
                console.log(`   ⚠️ Manager record not found for assignedManagers.manager_id: ${am.manager_id}`);
              }
            }
          }
        }
        
        console.log(`👥 Customer has ${assignedManagerIds.size} assigned manager(s) (user_ids):`, Array.from(assignedManagerIds));
        
        if (assignedManagerIds.size > 0) {
          // Customer has assigned managers - only assign to those managers (if they have the category)
          const beforeCount = managers.length;
          managers = managers.filter(manager => {
            const isAssigned = assignedManagerIds.has(manager.user_id);
            if (!isAssigned) {
              console.log(`   ⚠️ Manager ${manager.email} (user_id: ${manager.user_id}) is not assigned to customer`);
            } else {
              console.log(`   ✅ Manager ${manager.email} (user_id: ${manager.user_id}) IS assigned to customer AND has category`);
            }
            return isAssigned;
          });
          console.log(`✅ Filtered from ${beforeCount} to ${managers.length} manager(s) assigned to customer and category ${category}`);
          
          // If no managers found after filtering, it means assigned managers don't have this category
          // In this case, we should still assign to ALL managers with the category (fallback)
          if (managers.length === 0) {
            console.log(`⚠️ No assigned managers have category "${category}" - falling back to ALL managers with this category`);
            // Re-fetch all managers with this category (before customer filtering)
            managers = await User.find({
              company_id: companyId,
              isManager: true,
              isActive: true
            });
            managers = managers.filter(manager => {
              if (!manager.managerProfile || !manager.managerProfile.assignedCategories) {
                return false;
              }
              const categories = manager.managerProfile.assignedCategories;
              return categories.some(cat => {
                const catStr = typeof cat === 'string' ? cat : (cat.category || cat);
                return this.categoriesMatch(catStr, category);
              });
            });
            console.log(`✅ Fallback: Found ${managers.length} manager(s) with category "${category}" (not filtered by customer)`);
          }
        } else {
          // Customer has NO assigned managers - assign to ALL managers with this category
          // This allows category-only managers to receive orders
          console.log(`✅ Customer has no assigned managers - assigning to all ${managers.length} manager(s) with category ${category}`);
        }
      }
      
      console.log(`✅ Returning ${managers.length} manager(s) for category "${category}"`);
      return managers;
    } catch (error) {
      console.error('❌ Error getting managers for category:', error);
      return [];
    }
  }
  
  /**
   * Notify managers about items requiring approval
   */
  async notifyManagers(itemApprovals) {
    try {
      // Group approvals by manager
      const managerApprovals = new Map();
      
      for (const approval of itemApprovals) {
        if (!approval.assignedManager) continue;
        
        if (!managerApprovals.has(approval.assignedManager.toString())) {
          managerApprovals.set(approval.assignedManager.toString(), []);
        }
        managerApprovals.get(approval.assignedManager.toString()).push(approval);
      }
      
      // Send notification to each manager
      for (const [managerId, approvals] of managerApprovals) {
        const manager = await User.findById(managerId);
        if (!manager) continue;
        
        const order = await Order.findById(approvals[0].orderId);
        if (!order) continue;
        
        // Create notification
        const notification = await notificationService.createNotification({
          title: 'Items Require Your Approval',
          message: `You have ${approvals.length} item(s) from order #${order.orderNumber} requiring approval`,
          type: 'approval_required',
          priority: 'high',
          targetType: 'user',
          targetIds: [managerId],
          company_id: order.company_id,
          sender_id: 'system',
          sender_name: 'System',
          data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            itemCount: approvals.length,
            categories: [...new Set(approvals.map(a => a.category))],
            url: `/orders/${order._id}/approve`
          }
        });
        
        await notificationService.sendNotification(notification._id);
        
        // Send real-time notification
        realtimeService.sendToUser(managerId, {
          type: 'item_approval_required',
          orderId: order._id,
          orderNumber: order.orderNumber,
          itemCount: approvals.length,
          categories: [...new Set(approvals.map(a => a.category))]
        });
        
        console.log(`📧 Sent approval notification to manager ${manager.email}`);
      }
    } catch (error) {
      console.error('❌ Error notifying managers:', error);
    }
  }
  
  /**
   * Get pending approvals for a specific manager
   */
  async getManagerAllApprovals(managerId, companyId) {
    try {
      console.log(`🔍 Getting all approvals for manager ${managerId} in company ${companyId}`);
      
      // Get manager's assigned categories to ensure proper filtering
      const User = require('../models/User');
      const Manager = require('../models/Manager');
      
      let assignedCategories = [];
      
      // managerId is User._id, so first get the User to find their user_id
      const user = await User.findById(managerId);
      if (!user) {
        console.log(`⚠️ User not found for managerId: ${managerId}`);
        return [];
      }
      
      // Try to find Manager record using user_id
      let manager = await Manager.findOne({ user_id: user.user_id, company_id: companyId });
      
      if (manager) {
        // Get categories from Manager record
        assignedCategories = manager.assignedCategories?.map(cat => {
          return typeof cat === 'string' ? cat : (cat.category || cat);
        }) || [];
      } else if (user.managerProfile && user.managerProfile.assignedCategories) {
        // Fallback to User's managerProfile
        assignedCategories = user.managerProfile.assignedCategories.map(cat => {
          return typeof cat === 'string' ? cat : (cat.category || cat);
        });
      }
      
      console.log(`🔍 Manager assigned categories (${assignedCategories.length}):`, assignedCategories);
      
      // Category is the PRIMARY filter - managers see ALL orders in their assigned categories
      // Customer assignment is informational only and doesn't restrict visibility
      
      // First get all approvals assigned to this manager
      console.log(`🔍 Querying OrderItemApproval for managerId: ${managerId}, companyId: ${companyId}`);
      let approvals = await OrderItemApproval.find({
        assignedManager: managerId,
        company_id: companyId
      })
      .populate({
        path: 'orderId',
        select: 'orderNumber customer status createdAt',
        populate: {
          path: 'customer',
          select: 'companyName contactName email'
        }
      })
      .populate('product', 'name description price category')
      .sort({ createdAt: -1 });
      
      console.log(`📋 Found ${approvals.length} approvals assigned to manager ${managerId} (before category filtering)`);
      
      // Log details of each approval found
      if (approvals.length > 0) {
        console.log(`📋 Approval details:`);
        approvals.forEach((approval, idx) => {
          console.log(`   [${idx}] Approval ID: ${approval._id}`);
          console.log(`       Category: ${approval.category}`);
          console.log(`       Order: ${approval.orderId?.orderNumber || 'N/A'}`);
          console.log(`       Customer: ${approval.orderId?.customer?.email || 'N/A'}`);
          console.log(`       Status: ${approval.status}`);
          console.log(`       AssignedManager: ${approval.assignedManager}`);
        });
      } else {
        console.log(`⚠️ No approvals found with assignedManager=${managerId} and company_id=${companyId}`);
        // Let's also check if there are any approvals at all for this company
        const allApprovals = await OrderItemApproval.find({ company_id: companyId }).limit(5);
        console.log(`📊 Total approvals in company: ${await OrderItemApproval.countDocuments({ company_id: companyId })}`);
        if (allApprovals.length > 0) {
          console.log(`📊 Sample approvals (first 5):`);
          allApprovals.forEach(approval => {
            console.log(`   - Approval ID: ${approval._id}, assignedManager: ${approval.assignedManager}, category: ${approval.category}`);
          });
        }
      }
      
      // Additional security: Filter by manager's assigned categories
      // This ensures managers only see approvals for categories they're assigned to
      approvals = approvals.filter(approval => {
        // Check category match
        let categoryMatches = true;
        if (assignedCategories.length > 0) {
          const approvalCategory = approval.category || '';
          categoryMatches = assignedCategories.some(assignedCat => {
            const assignedCatStr = typeof assignedCat === 'string' ? assignedCat : (assignedCat.category || assignedCat);
            return this.categoriesMatch(assignedCatStr, approvalCategory);
          });
          if (!categoryMatches) {
            console.log(`⚠️ Filtering out approval ${approval._id} - category "${approvalCategory}" not in manager's assigned categories`);
          }
        }
        
        // Category is the PRIMARY filter - managers see ALL orders in their assigned categories
        // Customer assignment is informational only - it doesn't restrict visibility
        // If manager has categories, they see ALL orders with items in those categories (from ANY customer)
        // This includes orders from their assigned customers AND orders from other customers
        
        // No customer filtering needed - category match is sufficient
        return categoryMatches;
      });
      
      console.log(`✅ Found ${approvals.length} total approvals (after category filtering)`);
      
      // Transform the data to match frontend expectations
      const transformedApprovals = approvals.map(approval => {
        // Add null checks for populated fields
        if (!approval.orderId) {
          console.warn(`⚠️ OrderId is null for approval ${approval._id}`);
        }
        if (!approval.product) {
          console.warn(`⚠️ Product is null for approval ${approval._id}`);
        }
        
        return {
          _id: approval._id,
          orderId: approval.orderId?._id || null,
          itemIndex: approval.itemIndex,
          product: approval.product ? {
            _id: approval.product._id,
            name: approval.product.name,
            description: approval.product.description || '',
            price: approval.product.price
          } : null,
          category: approval.category,
          status: approval.status,
          originalAmount: approval.originalAmount,
          comments: approval.comments,
          discountPercentage: approval.discountPercentage,
          discountAmount: approval.discountAmount,
          approvedBy: approval.approvedBy,
          approvedAt: approval.approvedAt,
          rejectedAt: approval.rejectedAt,
          order: approval.orderId ? {
            _id: approval.orderId._id,
            orderNumber: approval.orderId.orderNumber,
            status: approval.orderId.status || 'pending',
            customer: approval.orderId.customer ? {
              _id: approval.orderId.customer._id,
              companyName: approval.orderId.customer.companyName || 'Unknown Company',
              contactName: approval.orderId.customer.contactName || 'Unknown Contact',
              email: approval.orderId.customer.email || 'Unknown Email'
            } : {
              _id: null,
              companyName: 'Unknown Company',
              contactName: 'Unknown Contact',
              email: 'Unknown Email'
            },
            createdAt: approval.orderId.createdAt
          } : {
            _id: null,
            orderNumber: 'Unknown Order',
            status: 'pending',
            customer: {
              _id: null,
              companyName: 'Unknown Company',
              contactName: 'Unknown Contact',
              email: 'Unknown Email'
            },
            createdAt: null
          }
        };
      });
      
      return transformedApprovals;
    } catch (error) {
      console.error('❌ Error getting all manager approvals:', error);
      return [];
    }
  }

  async getManagerPendingApprovals(managerId, companyId) {
    try {
      console.log(`🔍 Getting pending approvals for manager ${managerId} in company ${companyId}`);
      
      // Get manager's assigned categories to ensure proper filtering
      const User = require('../models/User');
      const Manager = require('../models/Manager');
      
      let assignedCategories = [];
      
      // managerId is User._id, so first get the User to find their user_id
      const user = await User.findById(managerId);
      if (!user) {
        console.log(`⚠️ User not found for managerId: ${managerId}`);
        return [];
      }
      
      // Try to find Manager record using user_id
      let manager = await Manager.findOne({ user_id: user.user_id, company_id: companyId });
      
      if (manager) {
        // Get categories from Manager record
        assignedCategories = manager.assignedCategories?.map(cat => {
          return typeof cat === 'string' ? cat : (cat.category || cat);
        }) || [];
      } else if (user.managerProfile && user.managerProfile.assignedCategories) {
        // Fallback to User's managerProfile
        assignedCategories = user.managerProfile.assignedCategories.map(cat => {
          return typeof cat === 'string' ? cat : (cat.category || cat);
        });
      }
      
      console.log(`🔍 Manager assigned categories (${assignedCategories.length}):`, assignedCategories);
      
      // Category is the PRIMARY filter - managers see ALL orders in their assigned categories
      // Customer assignment is informational only and doesn't restrict visibility
      
      // First get all pending approvals assigned to this manager
      let approvals = await OrderItemApproval.find({
        assignedManager: managerId,
        status: 'pending',
        company_id: companyId
      })
      .populate({
        path: 'orderId',
        select: 'orderNumber customer status createdAt',
        populate: {
          path: 'customer',
          select: 'companyName contactName email'
        }
      })
      .populate('product', 'name description price category')
      .sort({ createdAt: -1 });
      
      // Additional security: Filter by manager's assigned categories AND assigned customers
      // This ensures managers only see approvals for:
      // 1. Categories they're assigned to
      // 2. Customers they're assigned to
      approvals = approvals.filter(approval => {
        // Check category match
        let categoryMatches = true;
        if (assignedCategories.length > 0) {
          const approvalCategory = approval.category || '';
          categoryMatches = assignedCategories.some(assignedCat => {
            const assignedCatStr = typeof assignedCat === 'string' ? assignedCat : (assignedCat.category || assignedCat);
            return this.categoriesMatch(assignedCatStr, approvalCategory);
          });
          if (!categoryMatches) {
            console.log(`⚠️ Filtering out pending approval ${approval._id} - category "${approvalCategory}" not in manager's assigned categories`);
          }
        }
        
        // Category is the PRIMARY filter - managers see ALL orders in their assigned categories
        // Customer assignment is informational only - it doesn't restrict visibility
        // If manager has categories, they see ALL orders with items in those categories (from ANY customer)
        // This includes orders from their assigned customers AND orders from other customers
        
        // No customer filtering needed - category match is sufficient
        return categoryMatches;
      });
      
      console.log(`✅ Found ${approvals.length} pending approvals (after category filtering)`);
      
      // Transform the data to match frontend expectations
      const transformedApprovals = approvals.map(approval => {
        // Add null checks for populated fields
        if (!approval.orderId) {
          console.warn(`⚠️ OrderId is null for approval ${approval._id}`);
        }
        if (!approval.product) {
          console.warn(`⚠️ Product is null for approval ${approval._id}`);
        }
        
        return {
          _id: approval._id,
          orderId: approval.orderId?._id || null,
          itemIndex: approval.itemIndex,
          product: approval.product ? {
            _id: approval.product._id,
            name: approval.product.name,
            description: approval.product.description || '',
            price: approval.product.price
          } : null,
          category: approval.category,
          status: approval.status,
          originalAmount: approval.originalAmount,
          comments: approval.comments,
          discountPercentage: approval.discountPercentage,
          discountAmount: approval.discountAmount,
          order: approval.orderId ? {
            _id: approval.orderId._id,
            orderNumber: approval.orderId.orderNumber,
            status: approval.orderId.status || 'pending',
            customer: approval.orderId.customer ? {
              _id: approval.orderId.customer._id,
              companyName: approval.orderId.customer.companyName || 'Unknown Company',
              contactName: approval.orderId.customer.contactName || 'Unknown Contact',
              email: approval.orderId.customer.email || 'Unknown Email'
            } : {
              _id: null,
              companyName: 'Unknown Company',
              contactName: 'Unknown Contact',
              email: 'Unknown Email'
            },
            createdAt: approval.orderId.createdAt
          } : {
            _id: null,
            orderNumber: 'Unknown Order',
            status: 'pending',
            customer: {
              _id: null,
              companyName: 'Unknown Company',
              contactName: 'Unknown Contact',
              email: 'Unknown Email'
            },
            createdAt: null
          }
        };
      });
      
      return transformedApprovals;
    } catch (error) {
      console.error('❌ Error getting manager pending approvals:', error);
      return [];
    }
  }
  
  /**
   * Approve or reject a specific item
   */
  async approveItem(approvalId, managerId, action, comments = '', discountPercentage = 0, discountAmount = 0) {
    try {
      console.log(`🔍 Approving item - ID: ${approvalId}, Manager: ${managerId}, Action: ${action}`);
      
      const approval = await OrderItemApproval.findById(approvalId);
      if (!approval) {
        throw new Error('Approval not found');
      }
      
      if (approval.assignedManager.toString() !== managerId.toString()) {
        throw new Error('You are not authorized to approve this item');
      }
      
      if (approval.status !== 'pending') {
        const error = new Error('This item has already been processed');
        error.statusCode = 400;
        error.isBusinessLogicError = true;
        throw error;
      }
      
      // Update approval status
      approval.status = action;
      approval.comments = comments;
      approval.discountPercentage = discountPercentage;
      approval.discountAmount = discountAmount;
      
      if (action === 'approved') {
        approval.approvedBy = managerId;
        approval.approvedAt = new Date();
      } else if (action === 'rejected') {
        approval.approvedBy = managerId; // Set approvedBy for rejected items too for notification purposes
        approval.rejectedAt = new Date();
      }
      
      console.log(`💾 Saving approval with status: ${action}`);
      await approval.save();
      console.log(`✅ Approval saved successfully`);
      
      // If item is approved, set order status to processing immediately
      if (action === 'approved') {
        const order = await Order.findById(approval.orderId).populate('customer');
        if (order) {
          // Always set to processing when item is approved, unless order is already completed or cancelled
          if (order.status !== 'completed' && order.status !== 'cancelled') {
            const previousStatus = order.status;
            order.status = 'processing';
            await order.save();
            console.log(`✅ Order ${order.orderNumber} status updated to processing after item approval (was: ${previousStatus})`);
            
            // Send notification to customer about order status change to processing
            try {
              await this.notifyCustomerAboutOrderStatus(order, previousStatus);
              console.log(`✅ Customer notified about order status change to processing`);
            } catch (notificationError) {
              console.error('⚠️ Failed to send order status notification (non-critical):', notificationError);
              // Don't throw here as this is not critical
            }
          }
        }
      }
      
      // If item is rejected, update order status to rejected immediately
      if (action === 'rejected') {
        const order = await Order.findById(approval.orderId).populate('customer');
        if (order) {
          // Set order status to rejected when any item is rejected
          if (order.status !== 'completed' && order.status !== 'cancelled') {
            const previousStatus = order.status;
            order.status = 'rejected';
            order.approvalStatus = 'rejected';
            order.rejectedAt = new Date();
            await order.save();
            console.log(`✅ Order ${order.orderNumber} status updated to rejected after item rejection (was: ${previousStatus})`);
            
            // Send notification to customer about order rejection
            try {
              await this.notifyCustomerAboutOrderStatus(order, previousStatus);
              console.log(`✅ Customer notified about order rejection`);
            } catch (notificationError) {
              console.error('⚠️ Failed to send order rejection notification (non-critical):', notificationError);
              // Don't throw here as this is not critical
            }
          }
        }
      }
      
      // Check if all items in the order are now processed
      console.log(`🔍 Checking order completion for order: ${approval.orderId}`);
      await this.checkOrderCompletion(approval.orderId);
      console.log(`✅ Order completion check completed`);
      
      // Send notification to customer about item status
      console.log(`📧 Sending customer notification for item status`);
      await this.notifyCustomerAboutItemStatus(approval);
      console.log(`✅ Customer notification sent`);
      
      // Fetch order and product data for notifications (outside try blocks so both notifications can use them)
      const order = await Order.findById(approval.orderId).populate('customer');
      const product = await Product.findById(approval.product);
      const productName = product ? product.name : 'Unknown Product';
      
      // Get manager details for proper sender information
      const manager = await User.findById(managerId).select('firstName lastName email role isCompanyAdmin isManager isSuperAdmin').populate('roles', 'name');
      let managerName = 'Unknown Manager';
      let managerRole = 'User';
      
      if (manager) {
        const fullName = `${manager.firstName || ''} ${manager.lastName || ''}`.trim();
        managerName = fullName || manager.email || 'Unknown Manager';
        
        // Determine role display
        if (manager.isSuperAdmin) {
          managerRole = 'Super Admin';
        } else if (manager.isCompanyAdmin) {
          managerRole = 'Company Admin';
        } else if (manager.isManager) {
          managerRole = 'Manager';
        } else if (manager.roles && manager.roles.length > 0) {
          managerRole = manager.roles[0].name || 'User';
        } else if (manager.role) {
          managerRole = manager.role;
        }
      }
      
      // Create database notification for the manager who approved the item
      console.log(`💾 Creating database notification for manager`);
      try {
        
        const managerNotification = await notificationService.createNotification({
          title: `Item ${action === 'approved' ? 'Approved' : 'Rejected'}`,
          message: `${managerName} (${managerRole}) has ${action} the item "${productName}" from order #${order?.orderNumber || 'Unknown'}`,
          type: 'item_approval_status',
          priority: 'medium',
          targetType: 'user',
          targetIds: [managerId],
          company_id: approval.company_id,
          sender_id: managerId,
          sender_name: managerName,
          data: {
            approvalId: approval._id,
            orderId: order?._id,
            orderNumber: order?.orderNumber,
            productName: productName,
            status: action,
            comments: comments,
            discountAmount: discountAmount,
            customerName: order?.customer?.companyName || 'Unknown Customer',
            managerRole: managerRole
          }
        });
        
        console.log(`💾 Sending manager notification: ${managerNotification._id}`);
        await notificationService.sendNotification(managerNotification._id);
        console.log(`✅ Manager database notification sent`);
      } catch (notificationError) {
        console.error(`⚠️ Manager database notification failed (non-critical):`, notificationError);
        // Don't throw here as this is not critical
      }
      
      // Send realtime notification about status change
      console.log(`📡 Sending realtime notification to manager ID: ${managerId}`);
      console.log(`📡 Manager ID type: ${typeof managerId}`);
      try {
        const realtimeService = require('./realtimeService');
        
        console.log(`📡 Manager user details:`, manager ? {
          id: manager._id,
          email: manager.email,
          name: managerName
        } : 'Not found');
        
        const notificationData = {
          type: 'notification',
          notification: {
            _id: `item_approval_${approval._id}`,
            title: `Item ${action === 'approved' ? 'Approved' : 'Rejected'}`,
            message: `${managerName} (${managerRole}) has ${action} the item "${productName}" from order #${order?.orderNumber || 'Unknown'}`,
            type: 'item_approval_status',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            data: {
              approvalId: approval._id,
              status: action,
              orderNumber: order?.orderNumber,
              productName: productName,
              comments: comments,
              discountAmount: discountAmount,
              managerRole: managerRole
            },
            sender_name: managerName
          }
        };
        
        console.log(`📡 Notification data:`, notificationData);
        const sent = await realtimeService.sendToUser(managerId, notificationData);
        console.log(`📡 Realtime notification sent: ${sent}`);
      } catch (realtimeError) {
        console.error(`⚠️ Realtime notification failed (non-critical):`, realtimeError);
        // Don't throw here as this is not critical
      }
      
      console.log(`✅ Item ${action} by manager ${managerId}`);
      return approval;
    } catch (error) {
      console.error('❌ Error approving item:', error);
      console.error('❌ Error stack:', error.stack);
      throw error;
    }
  }
  
  /**
   * Update discount for an already approved item
   */
  async updateDiscount(approvalId, managerId, discountAmount, comments) {
    try {
      console.log(`🔍 Updating discount for approval: ${approvalId}, Manager: ${managerId}`);
      
      const approval = await OrderItemApproval.findById(approvalId);
      if (!approval) {
        const error = new Error('Approval not found');
        error.statusCode = 404;
        error.isBusinessLogicError = true;
        throw error;
      }
      
      if (approval.assignedManager.toString() !== managerId.toString()) {
        const error = new Error('You are not authorized to update this item');
        error.statusCode = 403;
        error.isBusinessLogicError = true;
        throw error;
      }
      
      if (approval.status !== 'approved') {
        const error = new Error('Only approved items can have their discount updated');
        error.statusCode = 400;
        error.isBusinessLogicError = true;
        throw error;
      }
      
      // Update discount information
      const oldDiscountAmount = approval.discountAmount || 0;
      approval.discountAmount = discountAmount || 0;
      approval.comments = comments || approval.comments;
      
      console.log(`💾 Updating discount from ${oldDiscountAmount} to ${discountAmount}`);
      await approval.save();
      console.log(`✅ Discount updated successfully`);
      
      // Recalculate order totals since discount changed
      await this.checkOrderCompletion(approval.orderId);
      console.log(`✅ Order totals recalculated`);
      
      // Create database notification for discount update
      console.log(`💾 Creating database notification for discount update`);
      try {
        const order = await Order.findById(approval.orderId).populate('customer');
        const product = await Product.findById(approval.product);
        const productName = product ? product.name : 'Unknown Product';
        
        // Get manager details for proper sender information
        const manager = await User.findById(managerId).select('firstName lastName email');
        const managerName = manager ? `${manager.firstName} ${manager.lastName}`.trim() : 'Unknown Manager';
        
        const discountNotification = await notificationService.createNotification({
          title: 'Discount Updated',
          message: `You have updated the discount for "${productName}" from order #${order?.orderNumber || 'Unknown'} from PKR ${oldDiscountAmount} to PKR ${discountAmount}`,
          type: 'discount_updated',
          priority: 'medium',
          targetType: 'user',
          targetIds: [managerId],
          company_id: approval.company_id,
          sender_id: managerId,
          sender_name: managerName,
          data: {
            approvalId: approval._id,
            orderId: order?._id,
            orderNumber: order?.orderNumber,
            productName: productName,
            oldDiscountAmount,
            newDiscountAmount: discountAmount,
            comments: comments,
            customerName: order?.customer?.companyName || 'Unknown Customer'
          }
        });
        
        console.log(`💾 Sending discount notification: ${discountNotification._id}`);
        await notificationService.sendNotification(discountNotification._id);
        console.log(`✅ Discount database notification sent`);
      } catch (notificationError) {
        console.error(`⚠️ Discount database notification failed (non-critical):`, notificationError);
        // Don't throw here as this is not critical
      }
      
      // Send realtime notification about discount update
      try {
        const realtimeService = require('./realtimeService');
        // Get order and product details for better notification message
        const order = await Order.findById(approval.orderId).populate('customer');
        const product = await Product.findById(approval.product);
        const productName = product ? product.name : 'Unknown Product';
        
        // Get manager details for real-time notification
        const manager = await User.findById(managerId).select('firstName lastName email');
        const managerName = manager ? `${manager.firstName} ${manager.lastName}`.trim() : 'Unknown Manager';
        
        await realtimeService.sendToUser(managerId, {
          type: 'notification',
          notification: {
            _id: `discount_update_${approval._id}`,
            title: 'Discount Updated',
            message: `You have updated the discount for "${productName}" from order #${order?.orderNumber || 'Unknown'} from PKR ${oldDiscountAmount} to PKR ${discountAmount}`,
            type: 'discount_updated',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            data: {
              approvalId: approval._id,
              oldDiscountAmount,
              newDiscountAmount: discountAmount,
              orderNumber: order?.orderNumber,
              productName: productName,
              comments: comments
            },
            sender_name: managerName
          }
        });
        console.log(`✅ Realtime notification sent for discount update`);
      } catch (realtimeError) {
        console.error(`⚠️ Realtime notification failed (non-critical):`, realtimeError);
        // Don't throw here as this is not critical
      }
      
      console.log(`✅ Discount updated by manager ${managerId}`);
      return approval;
    } catch (error) {
      console.error('❌ Error updating discount:', error);
      console.error('❌ Error stack:', error.stack);
      throw error;
    }
  }
  
  /**
   * Check if all items in an order are processed and update order status
   */
  async checkOrderCompletion(orderId) {
    try {
      const order = await Order.findById(orderId);
      if (!order) return;
      
      const allApprovals = await OrderItemApproval.find({ orderId: orderId });
      const pendingApprovals = allApprovals.filter(a => a.status === 'pending');
      const rejectedApprovals = allApprovals.filter(a => a.status === 'rejected');
      const approvedApprovals = allApprovals.filter(a => a.status === 'approved');
      
      if (pendingApprovals.length === 0) {
        // All items have been processed
        if (rejectedApprovals.length > 0) {
          // Some items were rejected
          order.status = 'rejected';
          order.approvalStatus = 'rejected';
          order.rejectedAt = new Date();
        } else if (approvedApprovals.length > 0) {
          // All items were approved - set status to processing
          order.status = 'processing';
          order.approvalStatus = 'approved';
          order.approvedAt = new Date();
          
          // Calculate final total with discounts
          const totalDiscount = approvedApprovals.reduce((sum, approval) => {
            return sum + (approval.discountAmount || 0);
          }, 0);
          
          order.totalDiscount = totalDiscount;
          order.finalTotal = order.total - totalDiscount;
          
          // Create invoice for approved items
          console.log(`📄 Creating invoice for approved order: ${order.orderNumber}`);
          try {
            const invoice = await invoiceService.createInvoiceFromApprovedItems(orderId, order.company_id);
            console.log(`✅ Invoice created successfully: ${invoice.invoiceNumber}`);
            
            // Send notification about invoice creation
            await this.notifyInvoiceCreated(order, invoice);
          } catch (invoiceError) {
            console.error('❌ Error creating invoice:', invoiceError);
            // Don't fail the order approval if invoice creation fails
          }
        }
        
        await order.save();
        console.log(`📋 Order ${order.orderNumber} status updated to: ${order.status}`);
        
        // Notify customer about order status
        await this.notifyCustomerAboutOrderStatus(order);
      }
    } catch (error) {
      console.error('❌ Error checking order completion:', error);
    }
  }
  
  /**
   * Notify customer about item status change
   */
  async notifyCustomerAboutItemStatus(approval) {
    try {
      console.log(`📧 Notifying customer about item status for approval: ${approval._id}`);
      
      const order = await Order.findById(approval.orderId).populate('customer');
      if (!order || !order.customer) {
        console.log(`⚠️ Order or customer not found for approval: ${approval._id}`);
        return;
      }
      
      const product = await Product.findById(approval.product);
      const productName = product ? product.name : 'Unknown Product';
      
      // Get manager details for proper sender information
      const manager = await User.findById(approval.approvedBy).select('firstName lastName email role isCompanyAdmin isManager isSuperAdmin').populate('roles', 'name');
      let managerName = 'Unknown Manager';
      let managerRole = 'User';
      
      if (manager) {
        const fullName = `${manager.firstName || ''} ${manager.lastName || ''}`.trim();
        managerName = fullName || manager.email || 'Unknown Manager';
        
        // Determine role display
        if (manager.isSuperAdmin) {
          managerRole = 'Super Admin';
        } else if (manager.isCompanyAdmin) {
          managerRole = 'Company Admin';
        } else if (manager.isManager) {
          managerRole = 'Manager';
        } else if (manager.roles && manager.roles.length > 0) {
          managerRole = manager.roles[0].name || 'User';
        } else if (manager.role) {
          managerRole = manager.role;
        }
      }
      
      console.log(`📧 Creating notification for customer: ${order.customer._id}`);
      const notification = await notificationService.createNotification({
        title: `Item ${approval.status === 'approved' ? 'Approved' : 'Rejected'}`,
        message: `Your item "${productName}" from order #${order.orderNumber} has been ${approval.status} by ${managerName} (${managerRole})`,
        type: 'item_status_update',
        priority: 'medium',
        targetType: 'customer',
        targetIds: [order.customer._id],
        company_id: order.company_id,
        sender_id: approval.approvedBy || 'system',
        sender_name: managerName,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          itemName: productName,
          status: approval.status,
          comments: approval.comments,
          approvedBy: managerName,
          managerRole: managerRole
        }
      });
      
      console.log(`📧 Sending notification: ${notification._id}`);
      await notificationService.sendNotification(notification._id);
      console.log(`✅ Customer notification sent successfully`);
    } catch (error) {
      console.error('❌ Error notifying customer about item status:', error);
      console.error('❌ Error stack:', error.stack);
      // Don't throw here as this is not critical for the main operation
    }
  }
  
  /**
   * Notify customer about order status change
   */
  async notifyCustomerAboutOrderStatus(order, previousStatus = null) {
    try {
      let title = '';
      let message = '';
      
      // Determine notification title and message based on status
      switch (order.status) {
        case 'processing':
          title = 'Order Now Processing';
          message = `Your order #${order.orderNumber} is now being processed`;
          break;
        case 'approved':
          title = 'Order Approved';
          message = `Your order #${order.orderNumber} has been approved`;
          break;
        case 'rejected':
          title = 'Order Rejected';
          message = `Your order #${order.orderNumber} has been rejected`;
          break;
        case 'allocated':
          title = 'Order Allocated';
          message = `Your order #${order.orderNumber} has been allocated`;
          break;
        case 'dispatched':
          title = 'Order Dispatched';
          message = `Your order #${order.orderNumber} has been dispatched`;
          break;
        case 'shipped':
          title = 'Order Shipped';
          message = `Your order #${order.orderNumber} has been shipped`;
          break;
        case 'completed':
          title = 'Order Completed';
          message = `Your order #${order.orderNumber} has been completed`;
          break;
        default:
          title = 'Order Status Updated';
          message = `Your order #${order.orderNumber} status has been updated to ${order.status}`;
      }
      
      const notification = await notificationService.createNotification({
        title: title,
        message: message,
        type: 'order_status_update',
        priority: order.status === 'processing' || order.status === 'completed' ? 'high' : 'medium',
        targetType: 'customer',
        targetIds: [order.customer],
        company_id: order.company_id,
        sender_id: 'system',
        sender_name: 'System',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          previousStatus: previousStatus,
          finalTotal: order.finalTotal || order.total
        }
      });
      
      await notificationService.sendNotification(notification._id);
      console.log(`✅ Order status notification sent to customer for status: ${order.status}`);
    } catch (error) {
      console.error('❌ Error notifying customer about order status:', error);
    }
  }

  /**
   * Notify customer about invoice creation
   */
  async notifyInvoiceCreated(order, invoice) {
    try {
      const notification = await notificationService.createNotification({
        title: 'Invoice Created',
        message: `Invoice ${invoice.invoiceNumber} has been created for your order #${order.orderNumber}`,
        type: 'invoice',
        priority: 'high',
        targetType: 'customer',
        targetIds: [order.customer],
        company_id: order.company_id,
        sender_id: 'system',
        sender_name: 'System',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          total: invoice.total,
          dueDate: invoice.dueDate
        }
      });

      await notificationService.sendNotification(notification._id);
      console.log(`✅ Invoice notification sent to customer`);
    } catch (error) {
      console.error('❌ Error notifying customer about invoice creation:', error);
    }
  }
}

module.exports = new ItemApprovalService();
