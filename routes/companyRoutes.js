const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');
const companyController = require('../controllers/companyController');

// Get all companies (super admin only)
router.get('/', auth, requireSuperAdmin, companyController.getAllCompanies);

// Get company by ID
router.get('/:id', auth, companyController.getCompanyById);

// Create new company (super admin only)
router.post('/', auth, requireSuperAdmin, companyController.createCompany);

// Update company
router.put('/:id', auth, requireSuperAdmin, companyController.updateCompany);

// Delete company
router.delete('/:id', auth, requireSuperAdmin, companyController.deleteCompany);

// Get company statistics
router.get('/:company_id/stats', auth, companyController.getCompanyStats);

module.exports = router;