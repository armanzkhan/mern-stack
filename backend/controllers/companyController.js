const Company = require("../models/Company");
const User = require("../models/User");
const notificationService = require("../services/notificationService");

// Get all companies (super admin only)
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find({}).sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    console.error("Get all companies error:", err);
    res.status(500).json({ message: "Error fetching companies", error: err.message });
  }
};

// Get company by ID
exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findOne({ company_id: id });
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    
    res.json(company);
  } catch (err) {
    console.error("Get company error:", err);
    res.status(500).json({ message: "Error fetching company", error: err.message });
  }
};

// Create new company (super admin only)
exports.createCompany = async (req, res) => {
  try {
    const { company_id, name, email, address, industry, departments = [] } = req.body;
    
    // Check if company already exists
    const existingCompany = await Company.findOne({ company_id });
    if (existingCompany) {
      return res.status(400).json({ message: "Company with this ID already exists" });
    }
    
    const company = new Company({
      company_id,
      name,
      email,
      address,
      industry,
      departments,
      userCount: 0,
      isActive: true
    });
    
    await company.save();
    
    // Send notification
    await notificationService.sendNotification({
      type: 'company_created',
      title: 'New Company Created',
      message: `Company ${company.name} has been created`,
      company_id: 'SYSTEM'
    });
    
    res.status(201).json(company);
  } catch (err) {
    console.error("Create company error:", err);
    res.status(500).json({ message: "Error creating company", error: err.message });
  }
};

// Update company
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const company = await Company.findOneAndUpdate(
      { company_id: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    
    // Send notification
    await notificationService.sendNotification({
      type: 'company_updated',
      title: 'Company Updated',
      message: `Company ${company.name} has been updated`,
      company_id: 'SYSTEM'
    });
    
    res.json(company);
  } catch (err) {
    console.error("Update company error:", err);
    res.status(500).json({ message: "Error updating company", error: err.message });
  }
};

// Delete company
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    
    const company = await Company.findOneAndDelete({ company_id: id });
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    
    // Send notification
    await notificationService.sendNotification({
      type: 'company_deleted',
      title: 'Company Deleted',
      message: `Company ${company.name} has been deleted`,
      company_id: 'SYSTEM'
    });
    
    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    console.error("Delete company error:", err);
    res.status(500).json({ message: "Error deleting company", error: err.message });
  }
};

// Get company statistics
exports.getCompanyStats = async (req, res) => {
  try {
    const { company_id } = req.params;
    
    const [userCount, customerCount, orderCount, productCount] = await Promise.all([
      User.countDocuments({ company_id }),
      require("../models/Customer").countDocuments({ company_id }),
      require("../models/Order").countDocuments({ company_id }),
      require("../models/Product").countDocuments({ company_id })
    ]);
    
    res.json({
      userCount,
      customerCount,
      orderCount,
      productCount
    });
  } catch (err) {
    console.error("Get company stats error:", err);
    res.status(500).json({ message: "Error fetching company statistics", error: err.message });
  }
};
