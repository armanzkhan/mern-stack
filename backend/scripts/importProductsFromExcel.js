// backend/scripts/importProductsFromExcel.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

// Product data extracted from Excel sheets
const productData = [
  // ===== CONCRETE ADMIXTURES =====
  ...[
    { name: "Max Flo P", unit: "LTR", sku: 1, price: 489, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P", unit: "LTR", sku: 5, price: 1955, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P", unit: "LTR", sku: 10, price: 3680, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P", unit: "LTR", sku: 15, price: 5175, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P", unit: "LTR", sku: 25, price: 8050, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P", unit: "LTR", sku: 200, price: 59800, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P 800", unit: "LTR", sku: 1, price: 529, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P 800", unit: "LTR", sku: 5, price: 2070, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P 800", unit: "LTR", sku: 10, price: 4025, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P 800", unit: "LTR", sku: 15, price: 5865, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P 800", unit: "LTR", sku: 25, price: 9488, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P 800", unit: "LTR", sku: 200, price: 71300, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P 801", unit: "LTR", sku: 1, price: 575, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P 801", unit: "LTR", sku: 5, price: 2358, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P 801", unit: "LTR", sku: 10, price: 4600, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P 801", unit: "LTR", sku: 15, price: 6728, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P 801", unit: "LTR", sku: 25, price: 10925, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P 801", unit: "LTR", sku: 200, price: 80500, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 802", unit: "LTR", sku: 1, price: 598, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 802", unit: "LTR", sku: 5, price: 2444, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 802", unit: "LTR", sku: 10, price: 4715, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 802", unit: "LTR", sku: 15, price: 6900, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 802", unit: "LTR", sku: 25, price: 11213, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 802", unit: "LTR", sku: 200, price: 85100, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 803", unit: "LTR", sku: 1, price: 633, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 803", unit: "LTR", sku: 5, price: 2588, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 803", unit: "LTR", sku: 10, price: 5060, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 803", unit: "LTR", sku: 15, price: 7504, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 803", unit: "LTR", sku: 25, price: 12219, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 803", unit: "LTR", sku: 200, price: 92000, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 804", unit: "LTR", sku: 1, price: 667, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 804", unit: "LTR", sku: 5, price: 2818, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 804", unit: "LTR", sku: 10, price: 5520, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 804", unit: "LTR", sku: 15, price: 8108, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 804", unit: "LTR", sku: 25, price: 13225, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 804", unit: "LTR", sku: 200, price: 103500, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 805", unit: "LTR", sku: 1, price: 679, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 805", unit: "LTR", sku: 5, price: 2933, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 805", unit: "LTR", sku: 10, price: 5750, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 805", unit: "LTR", sku: 15, price: 8453, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 805", unit: "LTR", sku: 25, price: 13800, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 805", unit: "LTR", sku: 200, price: 105800, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 900", unit: "LTR", sku: 1, price: 748, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 900", unit: "LTR", sku: 5, price: 3105, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 900", unit: "LTR", sku: 10, price: 6095, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 900", unit: "LTR", sku: 15, price: 9315, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 900", unit: "LTR", sku: 25, price: 15238, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 900", unit: "LTR", sku: 200, price: 115000, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 901", unit: "LTR", sku: 1, price: 771, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 901", unit: "LTR", sku: 5, price: 3220, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 901", unit: "LTR", sku: 10, price: 6325, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 901", unit: "LTR", sku: 15, price: 9315, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 901", unit: "LTR", sku: 25, price: 15238, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 901", unit: "LTR", sku: 200, price: 112700, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 902", unit: "LTR", sku: 1, price: 851, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 902", unit: "LTR", sku: 5, price: 3680, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 902", unit: "LTR", sku: 10, price: 7245, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 902", unit: "LTR", sku: 15, price: 10695, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 902", unit: "LTR", sku: 25, price: 17538, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 902", unit: "LTR", sku: 200, price: 133400, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo VE", unit: "LTR", sku: 1, price: 1219, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo VE", unit: "LTR", sku: 5, price: 5750, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo VE", unit: "LTR", sku: 10, price: 11270, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo VE", unit: "LTR", sku: 15, price: 16388, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo VE", unit: "LTR", sku: 25, price: 26450, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo VE", unit: "LTR", sku: 200, price: 204700, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo R", unit: "LTR", sku: 1, price: 690, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo R", unit: "LTR", sku: 5, price: 3163, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo R", unit: "LTR", sku: 10, price: 6095, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo R", unit: "LTR", sku: 15, price: 8798, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo R", unit: "LTR", sku: 25, price: 14088, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo R", unit: "LTR", sku: 200, price: 103500, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo Air Intra", unit: "LTR", sku: 1, price: 2013, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo Air Intra", unit: "LTR", sku: 5, price: 9775, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo Air Intra", unit: "LTR", sku: 10, price: 18975, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo Air Intra", unit: "LTR", sku: 15, price: 27600, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo Air Intra", unit: "LTR", sku: 25, price: 44563, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo Air Intra", unit: "LTR", sku: 200, price: 345000, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo Integra 1 (Powder)", unit: "KG", sku: 2, price: 782, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo Integra 1 (Powder)", unit: "KG", sku: 20, price: 7130, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo Integra 2 (Powder)", unit: "KG", sku: 2, price: 1058, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo Integra 2 (Powder)", unit: "KG", sku: 20, price: 10120, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo Integra 3 (Powder)", unit: "KG", sku: 2, price: 1380, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo Integra 3 (Powder)", unit: "KG", sku: 20, price: 13340, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo Integra 4 (Powder)", unit: "KG", sku: 2, price: 2185, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo Integra 4 (Powder)", unit: "KG", sku: 20, price: 21160, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo CI", unit: "LTR", sku: 1, price: 558, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo CI", unit: "LTR", sku: 5, price: 2588, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo CI", unit: "LTR", sku: 10, price: 4830, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo CI", unit: "LTR", sku: 15, price: 6900, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo CI", unit: "LTR", sku: 25, price: 10638, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo CI", unit: "LTR", sku: 200, price: 78200, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo PB", unit: "LTR", sku: 1, price: 920, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo PB", unit: "LTR", sku: 5, price: 3853, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo PB", unit: "LTR", sku: 10, price: 7590, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo PB", unit: "LTR", sku: 15, price: 12075, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo PB", unit: "LTR", sku: 25, price: 19550, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo PB", unit: "LTR", sku: 200, price: 151800, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo MP", unit: "LTR", sku: 1, price: 702, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo MP", unit: "LTR", sku: 5, price: 2875, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo MP", unit: "LTR", sku: 10, price: 5635, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo MP", unit: "LTR", sku: 15, price: 8280, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo MP", unit: "LTR", sku: 25, price: 13513, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo MP", unit: "LTR", sku: 200, price: 103500, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SAL", unit: "LTR", sku: 1, price: 771, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SAL", unit: "LTR", sku: 5, price: 3335, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SAL", unit: "LTR", sku: 10, price: 6555, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SAL", unit: "LTR", sku: 15, price: 9660, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SAL", unit: "LTR", sku: 25, price: 15813, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SAL", unit: "LTR", sku: 200, price: 120750, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SAP (Powder)", unit: "KG", sku: 2, price: 2990, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SAP (Powder)", unit: "KG", sku: 20, price: 28750, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P 800 (Powder)", unit: "KG", sku: 2, price: 460, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo P 800 (Powder)", unit: "KG", sku: 20, price: 3680, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 900 (Powder)", unit: "KG", sku: 2, price: 828, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 900 (Powder)", unit: "KG", sku: 20, price: 7590, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 802 (Powder)", unit: "KG", sku: 2, price: 575, category: { mainCategory: "Concrete Admixtures" } },
    { name: "Max Flo SP 802 (Powder)", unit: "KG", sku: 20, price: 5175, category: { mainCategory: "Concrete Admixtures" } },
  ].map(p => ({
    ...p,
    fullName: `${p.name} - ${p.sku} ${p.unit}`,
    company_id: "RESSICHEM"
  })),

  // ===== EPOXY FLOORINGS & COATINGS =====
  ...[
    // Epoxy Crack Fillers
    { name: "Ressi EPO Crack Fill", unit: "LTR", sku: 2.16, price: 813, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
    { name: "Ressi EPO Crack Fill", unit: "LTR", sku: 21.6, price: 7500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
    { name: "Ressi EPO Crack Fill LV", unit: "LTR", sku: 2.18, price: 550, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
    { name: "Ressi EPO Crack Fill LV", unit: "LTR", sku: 21.8, price: 4088, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
    { name: "Ressi EPO Crack Fill WR", unit: "LTR", sku: 2.18, price: 681, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
    { name: "Ressi EPO Crack Fill WR", unit: "LTR", sku: 21.8, price: 5450, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
    { name: "Ressi EPO Crack Fill CR", unit: "LTR", sku: 2.15, price: 806, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
    { name: "Ressi EPO Crack Fill CR", unit: "LTR", sku: 21.5, price: 6719, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Crack Fillers" } },
    // Epoxy Primers
    { name: "Ressi EPO Primer", unit: "LTR", sku: 1.6, price: 3750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Primer", unit: "LTR", sku: 16, price: 34800, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Primer", unit: "LTR", sku: 48, price: 102500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Primer LV", unit: "LTR", sku: 1.8, price: 3563, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Primer LV", unit: "LTR", sku: 18, price: 32963, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Primer LV", unit: "LTR", sku: 54, price: 97875, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Primer WR", unit: "LTR", sku: 1.8, price: 5625, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Primer WR", unit: "LTR", sku: 18, price: 54000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Primer WR", unit: "LTR", sku: 54, price: 155250, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Primer CR", unit: "LTR", sku: 1.5, price: 6125, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Primer CR", unit: "LTR", sku: 15, price: 56250, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Primer CR", unit: "LTR", sku: 45, price: 160000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Primer WCR", unit: "LTR", sku: 1.8, price: 7875, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Primer WCR", unit: "LTR", sku: 18, price: 73125, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Primer WCR", unit: "LTR", sku: 54, price: 202500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Iron Primer", unit: "LTR", sku: 1.16, price: 2356, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Iron Primer", unit: "LTR", sku: 11.6, price: 21750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Iron Primer", unit: "LTR", sku: 23.2, price: 41250, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Chem Prime 402", unit: "LTR", sku: 1.5, price: 5000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Chem Prime 402", unit: "LTR", sku: 15, price: 48750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    { name: "Ressi EPO Chem Prime 402", unit: "LTR", sku: 45, price: 93750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Primers" } },
    // Epoxy Mid Coats
    { name: "Ressi EPO Mid Coat S - GP", unit: "LTR", sku: 2.96, price: 2368, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    { name: "Ressi EPO Mid Coat S - GP", unit: "LTR", sku: 14.8, price: 11285, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    { name: "Ressi EPO Mid Coat S - GP", unit: "LTR", sku: 29.6, price: 21830, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    { name: "Ressi EPO Mid Coat S - GP", unit: "LTR", sku: 59.2, price: 41440, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    { name: "Ressi EPO Mid Coat F - GP", unit: "LTR", sku: 2.96, price: 3330, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    { name: "Ressi EPO Mid Coat F - GP", unit: "LTR", sku: 14.8, price: 13320, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    { name: "Ressi EPO Mid Coat F - GP", unit: "LTR", sku: 29.6, price: 24420, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    { name: "Ressi EPO Mid Coat F - GP", unit: "LTR", sku: 59.2, price: 45140, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    { name: "Ressi EPO Mid Coat S - CR", unit: "LTR", sku: 2.8, price: 3150, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    { name: "Ressi EPO Mid Coat S - CR", unit: "LTR", sku: 14, price: 14875, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    { name: "Ressi EPO Mid Coat S - CR", unit: "LTR", sku: 28, price: 28000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    { name: "Ressi EPO Mid Coat S - CR", unit: "LTR", sku: 56, price: 52500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    { name: "Ressi EPO Mid Coat F - CR", unit: "LTR", sku: 2.8, price: 3325, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    { name: "Ressi EPO Mid Coat F - CR", unit: "LTR", sku: 14, price: 15750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    { name: "Ressi EPO Mid Coat F - CR", unit: "LTR", sku: 28, price: 29750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    { name: "Ressi EPO Mid Coat F - CR", unit: "LTR", sku: 56, price: 56000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Epoxy Mid Coats" } },
    // Two Component Epoxy Top Coats
    { name: "Ressi EPO Tough Might", unit: "LTR", sku: 1.4, price: 3525, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Tough Might", unit: "LTR", sku: 14, price: 33750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Tough Might", unit: "LTR", sku: 28, price: 66150, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Tough Might Econo", unit: "LTR", sku: 1.6, price: 3063, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Tough Might Econo", unit: "LTR", sku: 16, price: 28300, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Tough Might Econo", unit: "LTR", sku: 32, price: 54000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Gloss Might", unit: "LTR", sku: 1.4, price: 3360, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Gloss Might", unit: "LTR", sku: 14, price: 31763, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Gloss Might", unit: "LTR", sku: 28, price: 61600, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Chem Might", unit: "LTR", sku: 1.5, price: 4688, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Chem Might", unit: "LTR", sku: 15, price: 45000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Chem Might", unit: "LTR", sku: 30, price: 86250, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Clear Coat-Floor", unit: "LTR", sku: 1.5, price: 4688, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Clear Coat-Floor", unit: "LTR", sku: 15, price: 45000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Clear Coat-Floor", unit: "LTR", sku: 30, price: 86250, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Clear Coat-Walls", unit: "LTR", sku: 1.5, price: 3938, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Clear Coat-Walls", unit: "LTR", sku: 15, price: 37500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Clear Coat-Walls", unit: "LTR", sku: 30, price: 67500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Anti-static", unit: "LTR", sku: 1.5, price: 5375, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Anti-static", unit: "LTR", sku: 15, price: 50625, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    { name: "Ressi EPO Anti-static", unit: "LTR", sku: 30, price: 97500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Two Component Epoxy Top Coats" } },
    // Three Component Heavy Duty Epoxy Floorings
    { name: "Ressi EPO FLOOR PLUS Econo", unit: "LTR", sku: 3.2, price: 2963, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
    { name: "Ressi EPO FLOOR PLUS Econo", unit: "LTR", sku: 16, price: 14400, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
    { name: "Ressi EPO FLOOR PLUS Econo", unit: "LTR", sku: 32, price: 28200, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
    { name: "Ressi EPO FLOOR PLUS Econo", unit: "LTR", sku: 64, price: 54400, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
    { name: "Ressi EPO FLOOR PLUS", unit: "LTR", sku: 2.8, price: 3325, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
    { name: "Ressi EPO FLOOR PLUS", unit: "LTR", sku: 28, price: 31500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
    { name: "Ressi EPO FLOOR PLUS", unit: "LTR", sku: 56, price: 58450, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
    { name: "Ressi EPO Gloss Plus", unit: "LTR", sku: 2.7, price: 3875, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
    { name: "Ressi EPO Gloss Plus", unit: "LTR", sku: 13.5, price: 18563, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
    { name: "Ressi EPO Gloss Plus", unit: "LTR", sku: 27, price: 35438, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
    { name: "Ressi EPO Gloss Plus", unit: "LTR", sku: 54, price: 67500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
    { name: "Ressi EPO Chem Plus", unit: "LTR", sku: 2.7, price: 4900, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
    { name: "Ressi EPO Chem Plus", unit: "LTR", sku: 13.5, price: 23625, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
    { name: "Ressi EPO Chem Plus", unit: "LTR", sku: 27, price: 45563, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
    { name: "Ressi EPO Chem Plus", unit: "LTR", sku: 54, price: 87750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Three Component Heavy Duty Epoxy Floorings" } },
    // Thin Coat Brush, Roller and Spray Applied
    { name: "Ressi EPO Roll Coat-Floor", unit: "LTR", sku: 1.4, price: 3875, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
    { name: "Ressi EPO Roll Coat-Floor", unit: "LTR", sku: 14, price: 37625, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
    { name: "Ressi EPO Roll Coat-Floor", unit: "LTR", sku: 28, price: 73500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
    { name: "Ressi EPO Roll Coat Plus", unit: "LTR", sku: 1.16, price: 2050, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
    { name: "Ressi EPO Roll Coat Plus", unit: "LTR", sku: 11.6, price: 18750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
    { name: "Ressi EPO Roll Coat Plus", unit: "LTR", sku: 23.2, price: 36000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
    { name: "Ressi EPO Iron Coat", unit: "LTR", sku: 1.16, price: 2350, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
    { name: "Ressi EPO Iron Coat", unit: "LTR", sku: 11.6, price: 22000, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
    { name: "Ressi EPO Iron Coat", unit: "LTR", sku: 23.2, price: 42500, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
    { name: "Ressi EPO Iron Coat CR", unit: "LTR", sku: 1.16, price: 2625, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
    { name: "Ressi EPO Iron Coat CR", unit: "LTR", sku: 11.6, price: 25375, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
    { name: "Ressi EPO Iron Coat CR", unit: "LTR", sku: 23.2, price: 49300, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
    { name: "Ressi EPO Chem Coat 406", unit: "LTR", sku: 1.5, price: 4875, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
    { name: "Ressi EPO Chem Coat 406", unit: "LTR", sku: 15, price: 47813, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
    { name: "Ressi EPO Chem Coat 406", unit: "LTR", sku: 30, price: 93750, category: { mainCategory: "Epoxy Floorings & Coatings", subCategory: "Thin Coat Brush, Roller and Spray Applied" } },
  ].map(p => ({
    ...p,
    fullName: `${p.name} - ${p.sku} ${p.unit}`,
    company_id: "RESSICHEM"
  })),

  // ===== SPECIALTY PRODUCTS =====
  ...[
    { name: "Ressi Anchor Fix", unit: "KG", sku: 3.8, price: 7245, category: { mainCategory: "Specialty Products" } },
    { name: "Ressi Anchor Fix", unit: "KG", sku: 38, price: 70680, category: { mainCategory: "Specialty Products" } },
    { name: "Ressi EPO Anchor Pro 3:1", unit: "KG", sku: 0.565, price: 2340, category: { mainCategory: "Specialty Products" } },
    { name: "Ressi NSG 710", unit: "KG", sku: 20, price: 2100, category: { mainCategory: "Specialty Products" } },
    { name: "Ressi Kerb Grout 102", unit: "KG", sku: 20, price: 960, category: { mainCategory: "Specialty Products" } },
    { name: "Ressi KerbFix 101", unit: "KG", sku: 20, price: 900, category: { mainCategory: "Specialty Products" } },
    { name: "Zepoxy LEEG 10", unit: "KG", sku: 25, price: 66000, category: { mainCategory: "Specialty Products" } },
  ].map(p => ({
    ...p,
    fullName: `${p.name} - ${p.sku} ${p.unit}`,
    company_id: "RESSICHEM"
  })),

  // ===== DECORATIVE CONCRETE =====
  ...[
    { name: "Ressi Overlay", unit: "KG", sku: 50, price: 3220, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Pigmented Hardener - 0001", unit: "KG", sku: 20, price: 4600, category: { mainCategory: "Decorative Concrete" }, colorCode: "White" },
    { name: "Ressi Pigmented Hardener - 3700", unit: "KG", sku: 20, price: 4600, category: { mainCategory: "Decorative Concrete" }, colorCode: "Terracotta" },
    { name: "Ressi Pigmented Hardener - 1600", unit: "KG", sku: 20, price: 4600, category: { mainCategory: "Decorative Concrete" }, colorCode: "Yellow" },
    { name: "Ressi Pigmented Hardener - 9000", unit: "KG", sku: 20, price: 4600, category: { mainCategory: "Decorative Concrete" }, colorCode: "Grey" },
    { name: "Ressi Pigmented Hardener - 5210 - 1", unit: "KG", sku: 20, price: 4600, category: { mainCategory: "Decorative Concrete" }, colorCode: "Sky Blue" },
    { name: "Ressi Pigmented Hardener - 9321", unit: "KG", sku: 20, price: 4600, category: { mainCategory: "Decorative Concrete" }, colorCode: "Brown" },
    { name: "Ressi Powder Release - 0001", unit: "KG", sku: 10, price: 7906, category: { mainCategory: "Decorative Concrete" }, colorCode: "White" },
    { name: "Ressi Powder Release - 3700", unit: "KG", sku: 10, price: 7906, category: { mainCategory: "Decorative Concrete" }, colorCode: "Terracotta" },
    { name: "Ressi Powder Release - 1600", unit: "KG", sku: 10, price: 7906, category: { mainCategory: "Decorative Concrete" }, colorCode: "Yellow" },
    { name: "Ressi Powder Release - 9000", unit: "KG", sku: 10, price: 7906, category: { mainCategory: "Decorative Concrete" }, colorCode: "Grey" },
    { name: "Ressi Powder Release - 5210 - 1", unit: "KG", sku: 10, price: 7906, category: { mainCategory: "Decorative Concrete" }, colorCode: "Sky Blue" },
    { name: "Ressi Powder Release - 9321", unit: "KG", sku: 10, price: 7906, category: { mainCategory: "Decorative Concrete" }, colorCode: "Brown" },
    { name: "Ressi Acid Itch", unit: "LTR", sku: 1, price: 592, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Acid Itch", unit: "LTR", sku: 5, price: 2243, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Acid Itch", unit: "LTR", sku: 10, price: 4370, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Acid Itch", unit: "LTR", sku: 15, price: 6383, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Acid Itch", unit: "LTR", sku: 25, price: 12420, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Honey White", unit: "LTR", sku: 1, price: 1898, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Honey White", unit: "LTR", sku: 5, price: 5750, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Honey White", unit: "LTR", sku: 10, price: 10925, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Honey White", unit: "LTR", sku: 15, price: 15525, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Honey White", unit: "LTR", sku: 25, price: 24438, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Nectarine", unit: "LTR", sku: 1, price: 1898, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Nectarine", unit: "LTR", sku: 5, price: 5750, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Nectarine", unit: "LTR", sku: 10, price: 10925, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Nectarine", unit: "LTR", sku: 15, price: 15525, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Nectarine", unit: "LTR", sku: 25, price: 24438, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Persimmon", unit: "LTR", sku: 1, price: 1898, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Persimmon", unit: "LTR", sku: 5, price: 5750, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Persimmon", unit: "LTR", sku: 10, price: 10925, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Persimmon", unit: "LTR", sku: 15, price: 15525, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Persimmon", unit: "LTR", sku: 25, price: 24438, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Rust Brown", unit: "LTR", sku: 1, price: 1898, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Rust Brown", unit: "LTR", sku: 5, price: 5750, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Rust Brown", unit: "LTR", sku: 10, price: 10925, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Rust Brown", unit: "LTR", sku: 15, price: 15525, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Rust Brown", unit: "LTR", sku: 25, price: 24438, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Storm Green", unit: "LTR", sku: 1, price: 1898, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Storm Green", unit: "LTR", sku: 5, price: 5750, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Storm Green", unit: "LTR", sku: 10, price: 10925, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Storm Green", unit: "LTR", sku: 15, price: 15525, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Storm Green", unit: "LTR", sku: 25, price: 24438, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Kahlua", unit: "LTR", sku: 1, price: 1898, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Kahlua", unit: "LTR", sku: 5, price: 5750, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Kahlua", unit: "LTR", sku: 10, price: 10925, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Kahlua", unit: "LTR", sku: 15, price: 15525, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Kahlua", unit: "LTR", sku: 25, price: 24438, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Citrus Green", unit: "LTR", sku: 1, price: 1898, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Citrus Green", unit: "LTR", sku: 5, price: 5750, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Citrus Green", unit: "LTR", sku: 10, price: 10925, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Citrus Green", unit: "LTR", sku: 15, price: 15525, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Citrus Green", unit: "LTR", sku: 25, price: 24438, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Cool Blue", unit: "LTR", sku: 1, price: 1898, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Cool Blue", unit: "LTR", sku: 5, price: 5750, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Cool Blue", unit: "LTR", sku: 10, price: 10925, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Cool Blue", unit: "LTR", sku: 15, price: 15525, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Reactive Stain - Cool Blue", unit: "LTR", sku: 25, price: 24438, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Neutraliser", unit: "LTR", sku: 1, price: 920, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Neutraliser", unit: "LTR", sku: 5, price: 4543, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Neutraliser", unit: "LTR", sku: 10, price: 8855, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Neutraliser", unit: "LTR", sku: 15, price: 13110, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Neutraliser", unit: "LTR", sku: 25, price: 26220, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Polymer", unit: "LTR", sku: 1, price: 3335, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Polymer", unit: "LTR", sku: 5, price: 16100, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Polymer", unit: "LTR", sku: 10, price: 31050, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Polymer", unit: "LTR", sku: 15, price: 44850, category: { mainCategory: "Decorative Concrete" } },
    { name: "Ressi Polymer", unit: "LTR", sku: 30, price: 86250, category: { mainCategory: "Decorative Concrete" } },
    { name: "MT Base Coat", unit: "KG", sku: 20, price: 1610, category: { mainCategory: "Decorative Concrete" } },
    { name: "MT Top Coat", unit: "KG", sku: 20, price: 2300, category: { mainCategory: "Decorative Concrete" } },
    { name: "MT - Polymer Liquid", unit: "KG", sku: 1, price: 3335, category: { mainCategory: "Decorative Concrete" } },
    { name: "MT - Polymer Liquid", unit: "KG", sku: 5, price: 16100, category: { mainCategory: "Decorative Concrete" } },
    { name: "MT - Polymer Liquid", unit: "KG", sku: 10, price: 31050, category: { mainCategory: "Decorative Concrete" } },
    { name: "MT - Polymer Liquid", unit: "KG", sku: 15, price: 44850, category: { mainCategory: "Decorative Concrete" } },
    { name: "MT - Polymer Liquid", unit: "KG", sku: 25, price: 86250, category: { mainCategory: "Decorative Concrete" } },
    { name: "Terrazzo Retarder", unit: "LTR", sku: 1, price: 1254, category: { mainCategory: "Decorative Concrete" } },
    { name: "Terrazzo Retarder", unit: "LTR", sku: 5, price: 6153, category: { mainCategory: "Decorative Concrete" } },
    { name: "Terrazzo Retarder", unit: "LTR", sku: 10, price: 12075, category: { mainCategory: "Decorative Concrete" } },
    { name: "Terrazzo Retarder", unit: "LTR", sku: 15, price: 17768, category: { mainCategory: "Decorative Concrete" } },
    { name: "Terrazzo Retarder", unit: "LTR", sku: 25, price: 29038, category: { mainCategory: "Decorative Concrete" } },
  ].map(p => ({
    ...p,
    fullName: `${p.name} - ${p.sku} ${p.unit}`,
    company_id: "RESSICHEM"
  })),

  // ===== EPOXY ADHESIVES AND COATINGS - ZEPOXY RESINS =====
  // Only products from user's list (excluding entries with "-" for price)
  ...[
    // Zepoxy Electropot
    { name: "Zepoxy Electropot", unit: "KG", sku: 0.615, price: 1007, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Electropot", unit: "KG", sku: 1.23, price: 1651, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Electropot", unit: "KG", sku: 24.6, price: 25917, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Electropot DT-W
    { name: "Zepoxy Electropot DT-W", unit: "KG", sku: 0.625, price: 914, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Electropot DT-W", unit: "KG", sku: 1.25, price: 1707, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Electropot DT-W", unit: "KG", sku: 25, price: 29579, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Electropot Econo
    { name: "Zepoxy Electropot Econo", unit: "KG", sku: 0.6, price: 1142, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Electropot Econo", unit: "KG", sku: 24, price: 27054, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Electropot Plus (skipping entries with "-" price)
    
    // Zepoxy Clear
    { name: "Zepoxy Clear", unit: "KG", sku: 0.15, price: 313, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Clear", unit: "KG", sku: 0.75, price: 1178, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Clear", unit: "KG", sku: 1.5, price: 2188, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Clear", unit: "KG", sku: 15, price: 20633, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Clear", unit: "KG", sku: 45, price: 61322, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Clear AS
    { name: "Zepoxy Clear AS", unit: "KG", sku: 0.15, price: 312, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Clear AS", unit: "KG", sku: 0.75, price: 1200, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Clear AS", unit: "KG", sku: 1.5, price: 2220, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    // Skipping 15 KG and 45 KG (price is "-")
    
    // Zepoxy 300
    { name: "Zepoxy 300", unit: "KG", sku: 0.15, price: 361, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 300", unit: "KG", sku: 0.75, price: 1320, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 300", unit: "KG", sku: 1.5, price: 2509, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 300", unit: "KG", sku: 15, price: 23860, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 300", unit: "KG", sku: 45, price: 71004, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy 350
    { name: "Zepoxy 350", unit: "KG", sku: 1.5, price: 2895, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 350", unit: "KG", sku: 15, price: 28095, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 350", unit: "KG", sku: 45, price: 83454, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Resin Art
    { name: "Zepoxy Resin Art", unit: "KG", sku: 0.75, price: 1279, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Resin Art", unit: "KG", sku: 1.5, price: 2343, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Resin Art", unit: "KG", sku: 15, price: 21997, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Resin Art", unit: "KG", sku: 45, price: 64863, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Felxicure
    { name: "Zepoxy Felxicure", unit: "KG", sku: 1.4, price: 4124, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy 400
    { name: "Zepoxy 400", unit: "KG", sku: 1.56, price: 5291, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Table Top Deep Pour
    { name: "Zepoxy Table Top Deep Pour", unit: "KG", sku: 1.5, price: 4377, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Table Top Deep Pour", unit: "KG", sku: 15, price: 42805, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Table Top Deep Pour", unit: "KG", sku: 45, price: 129017, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy 100 (Mini GM, Half GM, Full KG, CP KG)
    { name: "Zepoxy 100", unit: "Mini GM", sku: 0.18, price: 333, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 100", unit: "Half GM", sku: 0.9, price: 1389, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 100", unit: "Full KG", sku: 1.8, price: 2725, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 100", unit: "CP KG", sku: 54, price: 75911, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 100", unit: "CP KG", sku: 63, price: 88883, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy 100 Y
    { name: "Zepoxy 100 Y", unit: "Mini GM", sku: 0.18, price: 303, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 100 Y", unit: "Full KG", sku: 1.8, price: 2465, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 100 Y", unit: "CP KG", sku: 54, price: 73954, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy 100 Plus
    { name: "Zepoxy 100 Plus", unit: "Mini GM", sku: 0.18, price: 314, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 100 Plus", unit: "Half GM", sku: 0.9, price: 1293, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 100 Plus", unit: "Full KG", sku: 1.8, price: 2528, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 100 Plus", unit: "CP KG", sku: 54, price: 74130, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 100 Plus", unit: "CP KG", sku: 63, price: 85693, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy 100 CL
    { name: "Zepoxy 100 CL", unit: "Mini GM", sku: 0.18, price: 372, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 100 CL", unit: "Half GM", sku: 0.9, price: 1620, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 100 CL", unit: "Full KG", sku: 1.8, price: 2760, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy 150
    { name: "Zepoxy 150", unit: "Full KG", sku: 1.8, price: 2826, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 150", unit: "CP KG", sku: 54, price: 89879, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy 200
    { name: "Zepoxy 200", unit: "Full KG", sku: 1.8, price: 4930, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy 200", unit: "CP KG", sku: 54, price: 137434, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Kara Garh
    { name: "Zepoxy Kara Garh", unit: "Mini GM", sku: 0.18, price: 283, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Kara Garh", unit: "Half GM", sku: 0.9, price: 1208, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Kara Garh", unit: "Full KG", sku: 1.8, price: 2397, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Kara Garh", unit: "CP KG", sku: 54, price: 67409, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Kara Garh", unit: "CP KG", sku: 63, price: 77960, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Wood Master
    { name: "Zepoxy Wood Master", unit: "Mini GM", sku: 0.18, price: 283, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Wood Master", unit: "Half GM", sku: 0.9, price: 1208, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Wood Master", unit: "Full KG", sku: 1.8, price: 2397, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Wood Master", unit: "CP KG", sku: 54, price: 67409, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Wood Master", unit: "CP KG", sku: 63, price: 77960, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Clutch Leather
    { name: "Zepoxy Clutch Leather", unit: "Mini GM", sku: 0.18, price: 277, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Clutch Leather", unit: "Half GM", sku: 0.9, price: 1238, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Clutch Leather", unit: "Full KG", sku: 1.8, price: 2459, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Clutch Leather", unit: "CP KG", sku: 54, price: 69138, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Clutch Leather", unit: "CP KG", sku: 63, price: 79959, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Kara Noor
    { name: "Zepoxy Kara Noor", unit: "Mini GM", sku: 0.15, price: 361, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Kara Noor", unit: "Half GM", sku: 0.75, price: 1587, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Kara Noor", unit: "Full KG", sku: 1.5, price: 2928, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Kara Noor", unit: "CP KG", sku: 15, price: 28376, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Steel 5 Min
    { name: "Zepoxy Steel 5 Min", unit: "STS GM", sku: 0.01, price: 40, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Steel 5 Min", unit: "MTS GM", sku: 0.03, price: 121, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Steel 90 Min
    { name: "Zepoxy Steel 90 Min", unit: "STS GM", sku: 0.01, price: 35, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Steel 90 Min", unit: "MTS GM", sku: 0.03, price: 99, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Crystal
    { name: "Zepoxy Crystal", unit: "STS GM", sku: 0.01, price: 55, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Crystal", unit: "MTS GM", sku: 0.03, price: 176, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Crystal", unit: "CP KG", sku: 2, price: 7551, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Crystal", unit: "BP KG", sku: 40, price: 154335, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Ultimate
    { name: "Zepoxy Ultimate", unit: "STS GM", sku: 0.01, price: 66, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    { name: "Zepoxy Ultimate", unit: "MTS GM", sku: 0.03, price: 132, category: { mainCategory: "Epoxy Adhesives and Coatings" } },
    
    // Zepoxy Products (moved from Building Care and Maintenance)
    ...require('./zepoxyProductsList').zepoxyProducts,
  ].map(p => ({
    ...p,
    fullName: `${p.name} - ${p.sku} ${p.unit}`,
    company_id: "RESSICHEM"
  })),

  // ===== DRY MIX MORTARS / PREMIX PLASTERS =====
  // Only products from user's filtered list
  ...require('./dryMixProductsList').dryMixProducts,

  // ===== TILING AND GROUTING MATERIALS =====
  // Only products from user's filtered list
  ...require('./tilingGroutingProductsList').tilingGroutingProducts,
    { name: "Ressi TG 810 - 1211", unit: "KG", sku: 15, price: 2243, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 1421", unit: "KG", sku: 1, price: 161, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 1421", unit: "KG", sku: 15, price: 2243, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 1600", unit: "KG", sku: 1, price: 161, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 1600", unit: "KG", sku: 15, price: 2243, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 2400", unit: "KG", sku: 1, price: 161, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 2400", unit: "KG", sku: 15, price: 2243, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 2770", unit: "KG", sku: 1, price: 161, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 2770", unit: "KG", sku: 15, price: 2243, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 1950", unit: "KG", sku: 1, price: 161, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 1950", unit: "KG", sku: 15, price: 2243, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 9000", unit: "KG", sku: 1, price: 161, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 9000", unit: "KG", sku: 15, price: 2243, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 9111", unit: "KG", sku: 1, price: 161, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 9111", unit: "KG", sku: 15, price: 2243, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 9200", unit: "KG", sku: 1, price: 161, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 9200", unit: "KG", sku: 15, price: 2243, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 5210-1", unit: "KG", sku: 1, price: 161, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 5210-1", unit: "KG", sku: 15, price: 2243, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 5410-1", unit: "KG", sku: 1, price: 161, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "Ressi TG 810 - 5410-1", unit: "KG", sku: 15, price: 2243, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 3100", unit: "KG", sku: 1, price: 173, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 3100", unit: "KG", sku: 15, price: 2415, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 3700", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 3700", unit: "KG", sku: 15, price: 3278, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 4720", unit: "KG", sku: 1, price: 196, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 4720", unit: "KG", sku: 15, price: 2588, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 5110", unit: "KG", sku: 1, price: 196, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 5110", unit: "KG", sku: 15, price: 2415, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 5210-2", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 5210-2", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 5410", unit: "KG", sku: 1, price: 495, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 5410", unit: "KG", sku: 15, price: 7073, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 5960", unit: "KG", sku: 1, price: 702, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 5960", unit: "KG", sku: 15, price: 10178, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 5650", unit: "KG", sku: 1, price: 196, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 5650", unit: "KG", sku: 15, price: 2760, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 6400", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 6400", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 9111-1", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 9111-1", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 6110", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 6110", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 9321", unit: "KG", sku: 1, price: 460, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 9321", unit: "KG", sku: 15, price: 6555, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 9642", unit: "KG", sku: 1, price: 460, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 9642", unit: "KG", sku: 15, price: 6555, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 9960", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    { name: "TG 810 - 9960", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 810" } },
    
    // Ressi TG 820 Series
    { name: "Ressi TG 820 - 0001", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 0001", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 1110", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 1110", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 8111", unit: "KG", sku: 1, price: 460, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 8111", unit: "KG", sku: 15, price: 6555, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 1211", unit: "KG", sku: 1, price: 460, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 1211", unit: "KG", sku: 15, price: 6555, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 1421", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 1421", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 1600", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 1600", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 2400", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 2400", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 2770", unit: "KG", sku: 1, price: 253, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 2770", unit: "KG", sku: 15, price: 3450, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 1950", unit: "KG", sku: 1, price: 253, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 1950", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 9000", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 9000", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 9111", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 9111", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 9200", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 9200", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 5410-1", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "Ressi TG 820 - 5410-1", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 3100", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 3100", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 3700", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 3700", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 4720", unit: "KG", sku: 1, price: 460, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 4720", unit: "KG", sku: 15, price: 6555, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 5110", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 5110", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 5210-1", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 5210-1", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 5210-2", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 5210-2", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 5410", unit: "KG", sku: 1, price: 460, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 5410", unit: "KG", sku: 15, price: 6555, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 5960", unit: "KG", sku: 1, price: 633, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 5960", unit: "KG", sku: 15, price: 9143, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 5650", unit: "KG", sku: 1, price: 920, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 5650", unit: "KG", sku: 15, price: 13455, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 6400", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 6400", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 6110", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 6110", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 9321", unit: "KG", sku: 1, price: 460, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 9321", unit: "KG", sku: 15, price: 6555, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 9642", unit: "KG", sku: 1, price: 460, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 9642", unit: "KG", sku: 15, price: 6555, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 9960", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    { name: "TG 820 - 9960", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 820" } },
    
    // Ressi TG CR High Gloss Series
    { name: "Ressi TG CR High Gloss - 0001", unit: "KG", sku: 1.4, price: 5175, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG CR High Gloss" } },
    { name: "Ressi TG CR High Gloss - 1110", unit: "KG", sku: 1.4, price: 5175, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG CR High Gloss" } },
    { name: "Ressi TG CR High Gloss - 1211", unit: "KG", sku: 1.4, price: 5175, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG CR High Gloss" } },
    { name: "Ressi TG CR High Gloss - 5110", unit: "KG", sku: 1.4, price: 5175, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG CR High Gloss" } },
    { name: "Ressi TG CR High Gloss - 5210-1", unit: "KG", sku: 1.4, price: 5175, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG CR High Gloss" } },
    { name: "Ressi TG CR High Gloss - 9960", unit: "KG", sku: 1.4, price: 5175, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG CR High Gloss" } },
    
    // Ressi TG CR Semi Gloss Series
    { name: "Ressi TG CR Semi Gloss - 0001", unit: "KG", sku: 1.54, price: 6095, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG CR Semi Gloss" } },
    { name: "Ressi TG CR Semi Gloss - 1110", unit: "KG", sku: 1.54, price: 6095, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG CR Semi Gloss" } },
    { name: "Ressi TG CR Semi Gloss - 1211", unit: "KG", sku: 1.54, price: 6095, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG CR Semi Gloss" } },
    { name: "Ressi TG CR Semi Gloss - 5110", unit: "KG", sku: 1.54, price: 6095, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG CR Semi Gloss" } },
    { name: "Ressi TG CR Semi Gloss - 5210 - 1", unit: "KG", sku: 1.54, price: 6095, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG CR Semi Gloss" } },
    { name: "Ressi TG CR Semi Gloss - 9960", unit: "KG", sku: 1.54, price: 6095, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG CR Semi Gloss" } },
    
    // Ressi ETG DP Matt Series
    { name: "ETG DP Matt - 0001", unit: "KG", sku: 1.6, price: 2645, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "ETG DP Matt" } },
    { name: "ETG DP Matt - 1110", unit: "KG", sku: 1.6, price: 2645, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "ETG DP Matt" } },
    { name: "ETG DP Matt - 1211", unit: "KG", sku: 1.6, price: 2645, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "ETG DP Matt" } },
    { name: "ETG DP Matt - 5110", unit: "KG", sku: 1.6, price: 2645, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "ETG DP Matt" } },
    { name: "ETG DP Matt - 5210", unit: "KG", sku: 1.6, price: 2645, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "ETG DP Matt" } },
    { name: "ETG DP Matt - 9960", unit: "KG", sku: 1.6, price: 2645, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "ETG DP Matt" } },
    
    // Ressi Tile Latex
    { name: "Ressi Tile Latex", unit: "LTR", sku: 1, price: 891, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi Tile Latex", unit: "LTR", sku: 5, price: 4313, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi Tile Latex", unit: "LTR", sku: 10, price: 8338, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi Tile Latex", unit: "LTR", sku: 15, price: 12075, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi Tile Latex", unit: "LTR", sku: 25, price: 19550, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi Tile Latex", unit: "LTR", sku: 200, price: 151800, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    
    // Ressi Grout Latex
    { name: "Ressi Grout Latex", unit: "KG", sku: 1, price: 978, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    { name: "Ressi Grout Latex", unit: "KG", sku: 5, price: 4744, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    { name: "Ressi Grout Latex", unit: "KG", sku: 10, price: 9200, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    { name: "Ressi Grout Latex", unit: "KG", sku: 15, price: 13369, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    { name: "Ressi Grout Latex", unit: "KG", sku: 30, price: 21563, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    { name: "Ressi Grout Latex", unit: "KG", sku: 200, price: 166750, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    
    // Ressi TA 2K Series
    { name: "Ressi TA 2K (Grey)", unit: "KG", sku: 25, price: 3903, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 2K (White)", unit: "KG", sku: 25, price: 4536, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA HPA", unit: "KG", sku: 20, price: 25875, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    
    // Ressi Grout Seal
    { name: "Ressi Grout Seal", unit: "LTR", sku: 1, price: 1840, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    { name: "Ressi Grout Seal", unit: "LTR", sku: 5, price: 8625, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    { name: "Ressi Grout Seal", unit: "LTR", sku: 10, price: 16100, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    { name: "Ressi Grout Seal", unit: "LTR", sku: 15, price: 22425, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    { name: "Ressi Grout Seal", unit: "LTR", sku: 25, price: 34500, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    { name: "Ressi Grout Seal", unit: "LTR", sku: 200, price: 253000, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    
    // Ressi Grout Admix
    { name: "Ressi Grout Admix", unit: "LTR", sku: 1, price: 1955, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    { name: "Ressi Grout Admix", unit: "LTR", sku: 5, price: 9200, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    { name: "Ressi Grout Admix", unit: "LTR", sku: 10, price: 17250, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    { name: "Ressi Grout Admix", unit: "LTR", sku: 15, price: 24150, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    { name: "Ressi Grout Admix", unit: "LTR", sku: 25, price: 37375, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    { name: "Ressi Grout Admix", unit: "LTR", sku: 200, price: 276000, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Grouting Materials" } },
    
    // Ressi TG 2K Series
    { name: "TG 2K - 0001", unit: "KG", sku: 1.5, price: 1150, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 2K" } },
    { name: "TG 2K - 1110", unit: "KG", sku: 1.5, price: 1150, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 2K" } },
    { name: "TG 2K - 1211", unit: "KG", sku: 1.5, price: 1150, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 2K" } },
    { name: "TG 2K - 5110", unit: "KG", sku: 1.5, price: 1150, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 2K" } },
    { name: "TG 2K - 5210 - 1", unit: "KG", sku: 1.5, price: 1150, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 2K" } },
    { name: "TG 2K - 9960", unit: "KG", sku: 1.5, price: 1150, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "TG 2K" } },
    
    // Ressi TG Bath Seal 2K Series
    { name: "Bath Seal 2K - 0001", unit: "KG", sku: 1.5, price: 1380, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Bath Seal 2K" } },
    { name: "Bath Seal 2K - 1110", unit: "KG", sku: 1.5, price: 1380, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Bath Seal 2K" } },
    { name: "Bath Seal 2K - 1211", unit: "KG", sku: 1.5, price: 1380, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Bath Seal 2K" } },
    { name: "Bath Seal 2K - 5110", unit: "KG", sku: 1.5, price: 1380, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Bath Seal 2K" } },
    { name: "Bath Seal 2K - 5210 - 1", unit: "KG", sku: 1.5, price: 1380, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Bath Seal 2K" } },
    { name: "Bath Seal 2K - 9960", unit: "KG", sku: 1.5, price: 1380, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Bath Seal 2K" } },
    
    // Ressi TA Series (210, 220, 230, etc.)
    // According to price list: Ressi TA 210 and Ressi TA 210 Plus have SKU 20 KG only
    { name: "Ressi TA 210", unit: "KG", sku: 20, price: 603, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 210 Plus", unit: "KG", sku: 20, price: 867, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA Re Bond 245", unit: "KG", sku: 1, price: 460, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA Re Bond 245", unit: "KG", sku: 15, price: 6555, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 220", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 220", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 230 (Grey)", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 230 (Grey)", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 230 (White)", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 230 (White)", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 240", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 240", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 250", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 250", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 260", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 260", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 270", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 270", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 280", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 280", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 290", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 290", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 300", unit: "KG", sku: 1, price: 230, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 300", unit: "KG", sku: 15, price: 3105, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 0001 B", unit: "KG", sku: 1, price: 161, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA 0001 B", unit: "KG", sku: 15, price: 2243, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA QS - 1", unit: "KG", sku: 1, price: 161, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },
    { name: "Ressi TA QS - 1", unit: "KG", sku: 15, price: 2243, category: { mainCategory: "Tiling and Grouting Materials", subCategory: "Tile Adhesives" } },

  // ===== DRY MIX MORTARS / PREMIX PLASTERS - CONTINUED =====
  ...[
    // PlastoRend 110 Series (50 KG SKU)
    { name: "Ressi PlastoRend 110 - 0001 B", unit: "KG", sku: 50, price: 6900, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 0001", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 0003", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 8400 - 1 HD", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 1100", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 1101", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 9111 TG", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 6110 TG", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 1111", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 1211-2", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 1200", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 1210", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 7000 W", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 7000 WL", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 9000 W", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - GRG", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 9210 W", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 9110 W", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - TG", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 9311 HD", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - GOG", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - NW", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 1211", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - CHG", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 3990 X 9", unit: "KG", sku: 50, price: 9200, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 6800", unit: "KG", sku: 50, price: 9200, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 6400", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 3400", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 8820 X 2 HD", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 1320", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 1220", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - CHW", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 8810 X 1", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 8500 HD", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 5211", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 - 5210", unit: "KG", sku: 50, price: 5405, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    
    // PlastoRend 100 (Market Grade / Machine Grade - 50 KG)
    { name: "Ressi PlastoRend 100 (Market Grade)", unit: "KG", sku: 50, price: 943, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 100" } },
    { name: "Ressi PlastoRend 100 (Machine Grade)", unit: "KG", sku: 50, price: 1553, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 100" } },
    
    // PlastoRend 110 (Market Grade / Machine Grade - 50 KG)
    { name: "Ressi PlastoRend 110 (Market Grade)", unit: "KG", sku: 50, price: 943, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 (Machine Grade)", unit: "KG", sku: 50, price: 1553, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    
    // PlastoRend 120 (RPR 120 C Series - 50 KG)
    { name: "RPR 120 C - 0001 B", unit: "KG", sku: 50, price: 3335, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 0001", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 0003", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 8400 - 1 HD", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 1100", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 1101", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 9111 TG", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 6110 TG", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 1111", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 1211-2", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 1200", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 1210", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 7000 W", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 7000 WL", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 9000 W", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - GRG", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 9210", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 9110 W", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 9311 HD", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - GOG", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - NW", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 1211", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - CHG", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 3990 X 9", unit: "KG", sku: 50, price: 4600, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 6800", unit: "KG", sku: 50, price: 3738, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 6400", unit: "KG", sku: 50, price: 3738, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 3400", unit: "KG", sku: 50, price: 3738, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 8820 X 2 HD", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 1320", unit: "KG", sku: 50, price: 3565, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 1220", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - CHW", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 8810 X 1", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 8500 HD", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 5211", unit: "KG", sku: 50, price: 2415, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "RPR 120 C - 5210", unit: "KG", sku: 50, price: 3623, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    
    // Ressi SC 310 Series (50 KG)
    { name: "Ressi SC 310 - 0001", unit: "KG", sku: 50, price: 10925, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 1100", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 8400 - 1", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 8500", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 8700", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 8820 X 2", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 1422", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 8900", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 8810 X 1", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 8920 X 2", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 1950 X 2", unit: "KG", sku: 50, price: 9200, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 3110 X 4", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 9110 W", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 7000 W", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 9311", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "SC 310 - 9640", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "SC 310 - 9400", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "SC 310 - 9600", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "SC 310 - 9620", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "SC 310 - 9700", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "SC 310 - 9522", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "SC 310 - 9800", unit: "KG", sku: 50, price: 8740, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "SC 310 - 9960", unit: "KG", sku: 50, price: 8740, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "SC 310 - 3400 X 4", unit: "KG", sku: 50, price: 5750, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "SC 310 - 3700 X 4", unit: "KG", sku: 50, price: 8740, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 3900 X 1 - 1", unit: "KG", sku: 50, price: 8740, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 3900 X 1", unit: "KG", sku: 50, price: 7475, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 4740", unit: "KG", sku: 50, price: 8740, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 4810 X 4", unit: "KG", sku: 50, price: 8740, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 4900", unit: "KG", sku: 50, price: 8740, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    { name: "Ressi SC 310 - 1762", unit: "KG", sku: 50, price: 7475, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "SC 310" } },
    
    // RDR (Ressi DecoRend) Series - 50 KG
    { name: "RDR 1200", unit: "KG", sku: 50, price: 1380, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "DecoRend" } },
    { name: "RDR 0001", unit: "KG", sku: 50, price: 1380, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "DecoRend" } },
    { name: "RDR 9000 W", unit: "KG", sku: 50, price: 1380, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "DecoRend" } },
    { name: "RDR 7000 W", unit: "KG", sku: 50, price: 1380, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "DecoRend" } },
    { name: "RDR 9111", unit: "KG", sku: 50, price: 1380, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "DecoRend" } },
    { name: "RDR 8500", unit: "KG", sku: 50, price: 1380, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "DecoRend" } },
    
    // Ressi PlastoRend 100 Market / Machine Grade (KG 50)
    { name: "Ressi PlastoRend 100 (Market Grade)", unit: "KG", sku: 50, price: 943, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 100" } },
    { name: "Ressi PlastoRend 100 (Machine Grade)", unit: "KG", sku: 50, price: 1553, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 100" } },
    
    // Ressi PlastoRend 110 Market / Machine Grade (KG 50)
    { name: "Ressi PlastoRend 110 (Market Grade)", unit: "KG", sku: 50, price: 943, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    { name: "Ressi PlastoRend 110 (Machine Grade)", unit: "KG", sku: 50, price: 1553, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 110" } },
    
    // Ressi PFS 620, Gyps O Might 9000, Lime O Might 8000, SLS 610, SLS Primer, BLM 510, BRC 7000
    { name: "Ressi PFS 620", unit: "KG", sku: 50, price: 1380, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "Specialty Mixes" } },
    // Building Care and Maintenance - Ressi Lime O Might 8000
    { name: "Ressi Lime O Might 8000", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi Lime O Might 8000", unit: "KG", sku: 20, price: 4000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi Lime O Might 8000", unit: "KG", sku: 2.5, price: 1025, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi Lime O Might 8000", unit: "KG", sku: 25, price: 9688, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi Lime O Might 8000", unit: "KG", sku: 50, price: 1380, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    
    // Building Care and Maintenance - Ressi Gyps O Might 9000
    { name: "Ressi Gyps O Might 9000", unit: "KG", sku: 1, price: 344, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi Gyps O Might 9000", unit: "KG", sku: 20, price: 4750, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi Gyps O Might 9000", unit: "KG", sku: 2.5, price: 1025, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi Gyps O Might 9000", unit: "KG", sku: 25, price: 9688, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi Gyps O Might 9000", unit: "KG", sku: 50, price: 1380, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    
    // Building Care and Maintenance - Ressi SLS 610 (decimal SKU)
    { name: "Ressi SLS 610", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi SLS 610", unit: "KG", sku: 20, price: 4000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi SLS 610", unit: "KG", sku: 2.18, price: 1438, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi SLS 610", unit: "KG", sku: 21.8, price: 12263, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    
    // Building Care and Maintenance - Ressi SLS Primer (decimal SKU)
    { name: "Ressi SLS Primer", unit: "KG", sku: 2.5, price: 1025, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi SLS Primer", unit: "KG", sku: 25, price: 9688, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi SLS Primer", unit: "KG", sku: 2.17, price: 1188, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi SLS Primer", unit: "KG", sku: 21.7, price: 8875, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    
    // Building Care and Maintenance - Ressi BLM 510 (fixed category and prices)
    { name: "Ressi BLM 510", unit: "KG", sku: 1, price: 1563, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi BLM 510", unit: "KG", sku: 20, price: 26875, category: { mainCategory: "Building Care and Maintenance", subCategory: "Specialty Products" } },
    { name: "Ressi BRC 7000", unit: "KG", sku: 50, price: 2875, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "Specialty Mixes" } },
    
    // Ressi PlastoRend 100 / 110 / 120 Base (KG 50 - 1380)
    // NOTE: Removed duplicate base products - Market and Machine Grade versions are listed above
    { name: "Ressi PlastoRend 120", unit: "KG", sku: 2.18, price: 1438, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
    { name: "Ressi PlastoRend 120", unit: "KG", sku: 21.8, price: 12263, category: { mainCategory: "Dry Mix Mortars / Premix Plasters", subCategory: "PlastoRend 120" } },
  ].map(p => ({
    ...p,
    fullName: `${p.name} - ${p.sku} ${p.unit}`,
    company_id: "RESSICHEM"
  })),

  // ===== BUILDING CARE AND MAINTENANCE =====
  ...[
    // Crack Heal Series
    { name: "Crack Heal 910", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Building Care and Maintenance", subCategory: "Crack Heal" } },
    { name: "Crack Heal 910", unit: "KG", sku: 20, price: 4000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Crack Heal" } },
    { name: "Crack Heal 910 2K", unit: "KG", sku: 2.5, price: 1025, category: { mainCategory: "Building Care and Maintenance", subCategory: "Crack Heal" } },
    { name: "Crack Heal 910 2K", unit: "KG", sku: 25, price: 9688, category: { mainCategory: "Building Care and Maintenance", subCategory: "Crack Heal" } },
    { name: "Crack Heal 920", unit: "KG", sku: 1, price: 344, category: { mainCategory: "Building Care and Maintenance", subCategory: "Crack Heal" } },
    { name: "Crack Heal 920", unit: "KG", sku: 20, price: 4750, category: { mainCategory: "Building Care and Maintenance", subCategory: "Crack Heal" } },
    { name: "Crack Heal 920 2K", unit: "KG", sku: 2.5, price: 1025, category: { mainCategory: "Building Care and Maintenance", subCategory: "Crack Heal" } },
    { name: "Crack Heal 920 2K", unit: "KG", sku: 25, price: 9688, category: { mainCategory: "Building Care and Maintenance", subCategory: "Crack Heal" } },
    { name: "Crack Heal 940", unit: "KG", sku: 2.18, price: 1438, category: { mainCategory: "Building Care and Maintenance", subCategory: "Crack Heal" } },
    { name: "Crack Heal 940", unit: "KG", sku: 21.8, price: 12263, category: { mainCategory: "Building Care and Maintenance", subCategory: "Crack Heal" } },
    { name: "Crack Heal Flexi 950", unit: "KG", sku: 1, price: 1563, category: { mainCategory: "Building Care and Maintenance", subCategory: "Crack Heal" } },
    { name: "Crack Heal Flexi 950", unit: "KG", sku: 20, price: 26875, category: { mainCategory: "Building Care and Maintenance", subCategory: "Crack Heal" } },
    
    // Tough Guard Series
    { name: "Tough Guard 12,000 E", unit: "KG", sku: 2.17, price: 1188, category: { mainCategory: "Building Care and Maintenance", subCategory: "Tough Guard" } },
    { name: "Tough Guard 12,000 E", unit: "KG", sku: 21.7, price: 8875, category: { mainCategory: "Building Care and Maintenance", subCategory: "Tough Guard" } },
    
    // Water Guard Series
    { name: "Water Guard 491", unit: "KG", sku: 3.2, price: 1875, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard 491", unit: "KG", sku: 16, price: 8125, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard 491", unit: "KG", sku: 20, price: 10156, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard 5010", unit: "KG", sku: 3.2, price: 1225, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard 5010", unit: "KG", sku: 16, price: 5438, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard 5010", unit: "KG", sku: 20, price: 6688, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard 5253", unit: "KG", sku: 3.2, price: 938, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard 5253", unit: "KG", sku: 16, price: 3063, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard 5253", unit: "KG", sku: 20, price: 4813, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    
    // Water Guard Series - 3020 N (20 KG)
    { name: "Water Guard 3020 N - 0001", unit: "KG", sku: 20, price: 25213, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard 3020 N" } },
    { name: "Water Guard 3020 N - 9400", unit: "KG", sku: 20, price: 25213, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard 3020 N" } },
    { name: "Water Guard 3020 N - 3900 X1 - 1", unit: "KG", sku: 20, price: 25213, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard 3020 N" } },
    { name: "Water Guard 3020 N - 1200", unit: "KG", sku: 20, price: 25213, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard 3020 N" } },
    { name: "Water Guard 3020 N - 5210", unit: "KG", sku: 20, price: 25213, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard 3020 N" } },
    { name: "Water Guard 3020 N - 2400", unit: "KG", sku: 20, price: 25213, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard 3020 N" } },
    
    // Water Guard Series - 1530 Econo (20 KG)
    { name: "Water Guard 1530 Econo - 0001", unit: "KG", sku: 20, price: 15500, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard 1530 Econo" } },
    { name: "Water Guard 1530 Econo - 9400", unit: "KG", sku: 20, price: 15500, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard 1530 Econo" } },
    { name: "Water Guard 1530 Econo - 3900 X1 - 1", unit: "KG", sku: 20, price: 15500, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard 1530 Econo" } },
    { name: "Water Guard 1530 Econo - 1200", unit: "KG", sku: 20, price: 15500, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard 1530 Econo" } },
    { name: "Water Guard 1530 Econo - 5210", unit: "KG", sku: 20, price: 15625, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard 1530 Econo" } },
    { name: "Water Guard 1530 Econo - 2400", unit: "KG", sku: 20, price: 15688, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard 1530 Econo" } },
    
    // Rain Sheild Series - 1810 (20 KG)
    { name: "Rain Sheild 1810 - 0001", unit: "KG", sku: 20, price: 22000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Rain Sheild 1810" } },
    { name: "Rain Sheild 1810 - 9400", unit: "KG", sku: 20, price: 22000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Rain Sheild 1810" } },
    { name: "Rain Sheild 1810 - 3900 X1 - 1", unit: "KG", sku: 20, price: 22000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Rain Sheild 1810" } },
    { name: "Rain Sheild 1810 - 1200", unit: "KG", sku: 20, price: 22000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Rain Sheild 1810" } },
    { name: "Rain Sheild 1810 - 5210", unit: "KG", sku: 20, price: 22000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Rain Sheild 1810" } },
    { name: "Rain Sheild 1810 - 2400", unit: "KG", sku: 20, price: 22000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Rain Sheild 1810" } },
    
    // Silprime 3K
    { name: "Silprime 3K", unit: "KG", sku: 1.25, price: 5000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silprime" } },
    
    // Damp Seal
    { name: "Damp Seal", unit: "KG", sku: 1.25, price: 4688, category: { mainCategory: "Building Care and Maintenance", subCategory: "Damp Seal" } },
    
    // Silmix
    { name: "Silmix", unit: "LTR", sku: 1, price: 1088, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silmix" } },
    { name: "Silmix", unit: "LTR", sku: 5, price: 5375, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silmix" } },
    { name: "Silmix", unit: "LTR", sku: 10, price: 10625, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silmix" } },
    { name: "Silmix", unit: "LTR", sku: 15, price: 15750, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silmix" } },
    { name: "Silmix", unit: "LTR", sku: 25, price: 25938, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silmix" } },
    { name: "Silmix", unit: "LTR", sku: 200, price: 200000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silmix" } },
    
    // Ressi SBR Series
    { name: "Ressi SBR 5850", unit: "KG", sku: 1, price: 1125, category: { mainCategory: "Building Care and Maintenance", subCategory: "SBR" } },
    { name: "Ressi SBR 5850", unit: "KG", sku: 5, price: 5469, category: { mainCategory: "Building Care and Maintenance", subCategory: "SBR" } },
    { name: "Ressi SBR 5850", unit: "KG", sku: 10, price: 10688, category: { mainCategory: "Building Care and Maintenance", subCategory: "SBR" } },
    { name: "Ressi SBR 5850", unit: "KG", sku: 15, price: 15750, category: { mainCategory: "Building Care and Maintenance", subCategory: "SBR" } },
    { name: "Ressi SBR 5850", unit: "KG", sku: 25, price: 25781, category: { mainCategory: "Building Care and Maintenance", subCategory: "SBR" } },
    { name: "Ressi SBR 5850", unit: "KG", sku: 200, price: 198000, category: { mainCategory: "Building Care and Maintenance", subCategory: "SBR" } },
    
    // Ressi Guru
    { name: "Ressi Guru", unit: "KG", sku: 1, price: 606, category: { mainCategory: "Building Care and Maintenance", subCategory: "Ressi Guru" } },
    { name: "Ressi Guru", unit: "KG", sku: 5, price: 2969, category: { mainCategory: "Building Care and Maintenance", subCategory: "Ressi Guru" } },
    { name: "Ressi Guru", unit: "KG", sku: 10, price: 5813, category: { mainCategory: "Building Care and Maintenance", subCategory: "Ressi Guru" } },
    { name: "Ressi Guru", unit: "KG", sku: 25, price: 13906, category: { mainCategory: "Building Care and Maintenance", subCategory: "Ressi Guru" } },
    { name: "Ressi Guru", unit: "KG", sku: 200, price: 107500, category: { mainCategory: "Building Care and Maintenance", subCategory: "Ressi Guru" } },
    
    // Ressi SBR 5840
    { name: "Ressi SBR 5840", unit: "KG", sku: 1, price: 563, category: { mainCategory: "Building Care and Maintenance", subCategory: "SBR" } },
    { name: "Ressi SBR 5840", unit: "KG", sku: 5, price: 2750, category: { mainCategory: "Building Care and Maintenance", subCategory: "SBR" } },
    { name: "Ressi SBR 5840", unit: "KG", sku: 10, price: 5375, category: { mainCategory: "Building Care and Maintenance", subCategory: "SBR" } },
    { name: "Ressi SBR 5840", unit: "KG", sku: 15, price: 7781, category: { mainCategory: "Building Care and Maintenance", subCategory: "SBR" } },
    { name: "Ressi SBR 5840", unit: "KG", sku: 25, price: 12813, category: { mainCategory: "Building Care and Maintenance", subCategory: "SBR" } },
    { name: "Ressi SBR 5840", unit: "KG", sku: 200, price: 100000, category: { mainCategory: "Building Care and Maintenance", subCategory: "SBR" } },
    
    // Water Guard L 100
    { name: "Water Guard L 100", unit: "KG", sku: 1, price: 3125, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard L 100", unit: "KG", sku: 5, price: 15000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard L 100", unit: "KG", sku: 10, price: 28750, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard L 100", unit: "KG", sku: 15, price: 42750, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard L 100", unit: "KG", sku: 25, price: 69375, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard L 100", unit: "KG", sku: 200, price: 550000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    
    // Water Guard P 200
    { name: "Water Guard P 200", unit: "KG", sku: 1, price: 175, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard P 200", unit: "KG", sku: 20, price: 3250, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    
    // Silblock (first set - lower prices)
    { name: "Silblock", unit: "LTR", sku: 1, price: 1513, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silblock" } },
    { name: "Silblock", unit: "LTR", sku: 5, price: 7500, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silblock" } },
    { name: "Silblock", unit: "LTR", sku: 10, price: 14750, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silblock" } },
    { name: "Silblock", unit: "LTR", sku: 15, price: 21750, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silblock" } },
    { name: "Silblock", unit: "LTR", sku: 25, price: 35625, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silblock" } },
    { name: "Silblock", unit: "LTR", sku: 200, price: 280000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silblock" } },
    // Silblock (second set - higher prices, named as Silblock PLUS to differentiate)
    { name: "Silblock PLUS", unit: "LTR", sku: 1, price: 2688, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silblock" } },
    { name: "Silblock PLUS", unit: "LTR", sku: 5, price: 13313, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silblock" } },
    { name: "Silblock PLUS", unit: "LTR", sku: 10, price: 26375, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silblock" } },
    { name: "Silblock PLUS", unit: "LTR", sku: 15, price: 39375, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silblock" } },
    { name: "Silblock PLUS", unit: "LTR", sku: 25, price: 64063, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silblock" } },
    { name: "Silblock PLUS", unit: "LTR", sku: 200, price: 500000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Silblock" } },
    
    // Patch Series
    { name: "Patch 365", unit: "KG", sku: 1, price: 88, category: { mainCategory: "Building Care and Maintenance", subCategory: "Patch" } },
    { name: "Patch 365", unit: "KG", sku: 20, price: 1075, category: { mainCategory: "Building Care and Maintenance", subCategory: "Patch" } },
    { name: "Patch 365 Plus", unit: "KG", sku: 2.5, price: 1875, category: { mainCategory: "Building Care and Maintenance", subCategory: "Patch" } },
    { name: "Patch 365 Plus", unit: "KG", sku: 25, price: 13750, category: { mainCategory: "Building Care and Maintenance", subCategory: "Patch" } },
    { name: "Patch Epoxy 111", unit: "KG", sku: 2.5, price: 2250, category: { mainCategory: "Building Care and Maintenance", subCategory: "Patch" } },
    { name: "Patch Epoxy 111", unit: "KG", sku: 25, price: 14063, category: { mainCategory: "Building Care and Maintenance", subCategory: "Patch" } },
    { name: "Patch Epoxy 222", unit: "KG", sku: 16, price: 19875, category: { mainCategory: "Building Care and Maintenance", subCategory: "Patch" } },
    { name: "Rapid Patch 999", unit: "KG", sku: 1, price: 250, category: { mainCategory: "Building Care and Maintenance", subCategory: "Patch" } },
    { name: "Rapid Patch 999", unit: "KG", sku: 20, price: 4375, category: { mainCategory: "Building Care and Maintenance", subCategory: "Patch" } },
    
    // Heat Guard
    { name: "Heat Guard 1000", unit: "KG", sku: 20, price: 23125, category: { mainCategory: "Building Care and Maintenance", subCategory: "Heat Guard" } },
    
    // Water Guard Crysta Series
    { name: "Water Guard Crysta Coat 101", unit: "KG", sku: 1, price: 563, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard Crysta Coat 101", unit: "KG", sku: 20, price: 10000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard Crysta Coat 102", unit: "KG", sku: 1, price: 500, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard Crysta Coat 102", unit: "KG", sku: 20, price: 8750, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard Crysta Admix 103", unit: "KG", sku: 1, price: 713, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    { name: "Water Guard Crysta Admix 103", unit: "KG", sku: 20, price: 13000, category: { mainCategory: "Building Care and Maintenance", subCategory: "Water Guard" } },
    
    // Zepoxy Products - Building Care and Maintenance
    ...require('./buildingCareProductsList').buildingCareProducts,
  ].map(p => ({
    ...p,
    fullName: `${p.name} - ${p.sku} ${p.unit}`,
    company_id: "RESSICHEM"
  })),

  // ===== DECORATIVE CONCRETE - ADDITIONAL COLOR VARIANTS =====
  ...[
    // Additional Pigmented Hardener variants (50 KG)
    { name: "Ressi Pigmented Hardener - 0001 B", unit: "KG", sku: 50, price: 6325, category: { mainCategory: "Decorative Concrete" }, colorCode: "Brilliant White" },
    { name: "Ressi Pigmented Hardener - 0001", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "White" },
    { name: "Ressi Pigmented Hardener - 0003", unit: "KG", sku: 50, price: 4600, category: { mainCategory: "Decorative Concrete" }, colorCode: "Med White" },
    { name: "Ressi Pigmented Hardener - 8400 - 1 HD", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Adobe Buff" },
    { name: "Ressi Pigmented Hardener - 1100", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Dessert Sand 3" },
    { name: "Ressi Pigmented Hardener - 1101", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Dessert Sand 4" },
    { name: "Ressi Pigmented Hardener - 9111 TG", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Ash White 1" },
    { name: "Ressi Pigmented Hardener - 6110 TG", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Ash White 2" },
    { name: "Ressi Pigmented Hardener - 1111", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Dessert Sand 5" },
    { name: "Ressi Pigmented Hardener - 1211-2", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Dirty White" },
    { name: "Ressi Pigmented Hardener - 1200", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Dessert Sand 1" },
    { name: "Ressi Pigmented Hardener - 1210", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Dessert Sand 2" },
    { name: "Ressi Pigmented Hardener - 7000 W", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "F/F Cement Medium" },
    { name: "Ressi Pigmented Hardener - 7000 WL", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "F/F Cement Light" },
    { name: "Ressi Pigmented Hardener - 9000 W", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "F/F Cement" },
    { name: "Ressi Pigmented Hardener - GRG", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Grey 2" },
    { name: "Ressi Pigmented Hardener - 9210", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Grey 3" },
    { name: "Ressi Pigmented Hardener - 9110 W", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Medium Grey" },
    { name: "Ressi Pigmented Hardener - TG", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Light Grey" },
    { name: "Ressi Pigmented Hardener - 9311 HD", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Grey 1" },
    { name: "Ressi Pigmented Hardener - GOG", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Light Grey 2" },
    { name: "Ressi Pigmented Hardener - NW", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Ultra Light Pink" },
    { name: "Ressi Pigmented Hardener - 1211", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Beige" },
    { name: "Ressi Pigmented Hardener - CHG", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Light Walnut Brown" },
    { name: "Ressi Pigmented Hardener - 3990 X 9", unit: "KG", sku: 50, price: 9200, category: { mainCategory: "Decorative Concrete" }, colorCode: "Red" },
    { name: "Ressi Pigmented Hardener - 6800", unit: "KG", sku: 50, price: 9200, category: { mainCategory: "Decorative Concrete" }, colorCode: "Dark Orange" },
    { name: "Ressi Pigmented Hardener - 6400", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Light Orange" },
    { name: "Ressi Pigmented Hardener - 3400", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Pink" },
    { name: "Ressi Pigmented Hardener - 8820 X 2 HD", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Wheatish 1" },
    { name: "Ressi Pigmented Hardener - 1320", unit: "KG", sku: 50, price: 5405, category: { mainCategory: "Decorative Concrete" }, colorCode: "Wheatish 2" },
    { name: "Ressi Pigmented Hardener - 1220", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Wheatish 3" },
    { name: "Ressi Pigmented Hardener - CHW", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Wheatish 4" },
    { name: "Ressi Pigmented Hardener - 8810 X 1", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Wheatish 5" },
    { name: "Ressi Pigmented Hardener - 8500 HD", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Dessert Sand 3" },
    { name: "Ressi Pigmented Hardener - 5211", unit: "KG", sku: 50, price: 5175, category: { mainCategory: "Decorative Concrete" }, colorCode: "Light Sky Blue" },
    { name: "Ressi Pigmented Hardener - 5210", unit: "KG", sku: 50, price: 5520, category: { mainCategory: "Decorative Concrete" }, colorCode: "Sky Blue" },
  ].map(p => ({
    ...p,
    fullName: `${p.name} - ${p.sku} ${p.unit}`,
    company_id: "RESSICHEM"
  })),

  // ===== REMOVED DUPLICATE ZEPOXY SECTION - Products are now in main Epoxy Adhesives and Coatings section above =====
  // All Zepoxy products are now in the main section above (lines 327-464)
  // The duplicate section below has been commented out to prevent importing old products
  
  // ===== COMMENTED OUT - DUPLICATE ZEPOXY SECTION (DO NOT UNCOMMENT) =====
  // All products below are commented out - they are duplicates and should not be imported
  /*
  ...[
    // Specialty Products (duplicate section - keeping for reference)
    { name: "Zepoxy Electropot", unit: "KG", sku: 24, price: 7447, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Electropot", unit: "KG", sku: 45, price: 114149, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Electropot DT-W", unit: "KG", sku: 0.615, price: 745, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Electropot DT-W", unit: "KG", sku: 1.23, price: 1383, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Electropot DT-W", unit: "KG", sku: 24.6, price: 20282, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Electropot Econo", unit: "KG", sku: 0.625, price: 809, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Electropot Econo", unit: "KG", sku: 1.25, price: 1511, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Electropot Econo", unit: "KG", sku: 25, price: 26170, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    
    // Zepoxy Clear, 300, 350, 400 Series (with prices)
    { name: "Zepoxy Clear", unit: "KG", sku: 0.6, price: 1011, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Clear", unit: "KG", sku: 24, price: 23936, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 300", unit: "KG", sku: 0.15, price: 276, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 300", unit: "KG", sku: 0.75, price: 1043, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 300", unit: "KG", sku: 1.5, price: 1936, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 300", unit: "KG", sku: 15, price: 18255, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 300", unit: "KG", sku: 45, price: 54255, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 350", unit: "KG", sku: 0.15, price: 319, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 350", unit: "KG", sku: 0.75, price: 1144, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 350", unit: "KG", sku: 1.5, price: 2181, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 350", unit: "KG", sku: 15, price: 20745, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 350", unit: "KG", sku: 45, price: 61702, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 400", unit: "KG", sku: 1.56, price: 4681, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    
    // Zepoxy Resin Art, Felxicure, Table Top Deep Pour
    // NOTE: SKU 24 removed (not in user's list), but keeping SKUs 0.75, 1.5, 15, 45
    // Prices updated to match user's list
    { name: "Zepoxy Resin Art", unit: "KG", sku: 0.75, price: 1170.21, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Resin Art", unit: "KG", sku: 1.5, price: 2170.21, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Resin Art", unit: "KG", sku: 15, price: 19680.85, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Resin Art", unit: "KG", sku: 45, price: 59042.55, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Felxicure", unit: "KG", sku: 1.4, price: 3649, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Table Top Deep Pour", unit: "KG", sku: 0.18, price: 245, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Table Top Deep Pour", unit: "KG", sku: 0.9, price: 1068, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Table Top Deep Pour", unit: "KG", sku: 1.8, price: 2121, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Table Top Deep Pour", unit: "KG", sku: 54, price: 59641, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Table Top Deep Pour", unit: "KG", sku: 63, price: 68977, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    
    // Zepoxy 100, 100 Y, 100 Plus, 150, 200 Series
    { name: "Zepoxy 100", unit: "KG", sku: 0.18, price: 245, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 100", unit: "KG", sku: 0.9, price: 1068, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 100", unit: "KG", sku: 1.8, price: 2500, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 100", unit: "KG", sku: 54, price: 79521, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 100 Y", unit: "KG", sku: 0.18, price: 245, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 100 Y", unit: "KG", sku: 0.9, price: 1068, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 100 Y", unit: "KG", sku: 1.8, price: 4362, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 100 Y", unit: "KG", sku: 54, price: 121596, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 100 Plus", unit: "KG", sku: 0.18, price: 245, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 100 Plus", unit: "KG", sku: 0.9, price: 1096, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 100 Plus", unit: "KG", sku: 1.8, price: 2176, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 100 Plus", unit: "KG", sku: 54, price: 61170, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 100 Plus", unit: "KG", sku: 63, price: 70745, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 150", unit: "KG", sku: 0.15, price: 319, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 150", unit: "KG", sku: 0.75, price: 1144, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 150", unit: "KG", sku: 1.5, price: 2181, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 150", unit: "KG", sku: 15, price: 20745, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 150", unit: "KG", sku: 45, price: 61702, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 200", unit: "KG", sku: 0.15, price: 319, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 200", unit: "KG", sku: 0.75, price: 1144, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 200", unit: "KG", sku: 1.5, price: 2181, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 200", unit: "KG", sku: 15, price: 20745, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy 200", unit: "KG", sku: 45, price: 61702, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    
    // Zepoxy Specialty Applications (GM units)
    { name: "Zepoxy Kara Garh", unit: "GM", sku: 0.18, price: 249, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Kara Garh", unit: "GM", sku: 0.9, price: 1089, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Kara Garh", unit: "GM", sku: 1.8, price: 2147, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Kara Garh", unit: "GM", sku: 54, price: 62753, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Kara Garh", unit: "GM", sku: 63, price: 72606, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Wood Master", unit: "GM", sku: 0.18, price: 249, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Wood Master", unit: "GM", sku: 0.9, price: 1089, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Wood Master", unit: "GM", sku: 1.8, price: 2147, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Wood Master", unit: "GM", sku: 54, price: 62753, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Wood Master", unit: "GM", sku: 63, price: 72606, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Clutch Leather", unit: "GM", sku: 0.18, price: 249, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Clutch Leather", unit: "GM", sku: 0.9, price: 1089, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Clutch Leather", unit: "GM", sku: 1.8, price: 2147, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Clutch Leather", unit: "GM", sku: 54, price: 62753, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Clutch Leather", unit: "GM", sku: 63, price: 72606, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Kara Noor", unit: "GM", sku: 0.18, price: 249, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Kara Noor", unit: "GM", sku: 0.9, price: 1089, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Kara Noor", unit: "GM", sku: 1.8, price: 2147, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Kara Noor", unit: "GM", sku: 54, price: 62753, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Kara Noor", unit: "GM", sku: 63, price: 72606, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    
    // Zepoxy Steel Series (with prices)
    { name: "Zepoxy Steel 5 Min", unit: "KG", sku: 0.01, price: 38, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Steel 5 Min", unit: "KG", sku: 0.03, price: 117, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Steel 5 Min", unit: "KG", sku: 2, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Steel 5 Min", unit: "KG", sku: 40, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Steel 90 Min", unit: "KG", sku: 0.01, price: 34, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Steel 90 Min", unit: "KG", sku: 0.03, price: 96, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Steel 90 Min", unit: "KG", sku: 2, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Steel 90 Min", unit: "KG", sku: 40, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    
    // Zepoxy Premium Products
    { name: "Zepoxy Crystal", unit: "KG", sku: 0.18, price: 245, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Crystal", unit: "KG", sku: 0.9, price: 1068, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Crystal", unit: "KG", sku: 1.8, price: 2121, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Crystal", unit: "KG", sku: 24.6, price: 20282, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Ultimate", unit: "KG", sku: 0.01, price: 54, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Ultimate", unit: "KG", sku: 0.03, price: 170, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Ultimate", unit: "KG", sku: 2, price: 7287, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy Ultimate", unit: "KG", sku: 40, price: 148936, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    
    // Zepoxy RER, RFR, RLH, REH Series (with updated prices from pasted data)
    { name: "Zepoxy RER 011 X 75", unit: "KG", sku: 30, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RER 011 X 75", unit: "KG", sku: 230, price: 201250, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RER 128 Y", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RER 128 Y", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RER 128 Y", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RER 128 Y", unit: "KG", sku: 30, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RER 128 Y", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RFR 128 V", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RFR 128 V", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RFR 128 V", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RFR 128 V", unit: "KG", sku: 30, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RFR 128 V", unit: "KG", sku: 200, price: 202400, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy HLH 011 X /S", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy HLH 011 X /S", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy HLH 011 X /S", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy HLH 011 X /S", unit: "KG", sku: 30, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy HLH 011 X /S", unit: "KG", sku: 250, price: 194750, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RLH 100", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RLH 100", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RLH 100", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RLH 100", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy RLH 100", unit: "KG", sku: 200, price: 289000, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 115", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 115", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 115", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 115", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 115", unit: "KG", sku: 200, price: 280000, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    
    // Additional Zepoxy REH Series
    { name: "Zepoxy REH 125", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 125", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 125", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 125", unit: "KG", sku: 15, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 125", unit: "KG", sku: 200, price: 275000, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 140", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 140", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 140", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 140", unit: "KG", sku: 15, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 140", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 140-LVD", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 140-LVD", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 140-LVD", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 140-LVD", unit: "KG", sku: 15, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 140-LVD", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 147", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 147", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 147", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 147", unit: "KG", sku: 15, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 147", unit: "KG", sku: 200, price: 285000, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 148", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 148", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 148", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 148", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 148", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 149", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 149", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 149", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 149", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 149", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 160", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 160", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 160", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 160", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 160", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 161", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 161", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 161", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 161", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 161", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 205", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 205", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 205", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 205", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 205", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 206", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 206", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 206", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 206", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 206", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 207", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 207", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 207", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 207", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 207", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 208", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 208", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 208", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 208", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 208", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 241", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 241", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 241", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 241", unit: "KG", sku: 15, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 241", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 243", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 243", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 243", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 243", unit: "KG", sku: 15, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 243", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 2958", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 2958", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 2958", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 2958", unit: "KG", sku: 15, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 2958", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 347", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 347", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 347", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 347", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 347", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 348", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 348", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 348", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 348", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 348", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 360", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 360", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 360", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 360", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 360", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 361", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 361", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 361", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 361", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 361", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 541", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 541", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 541", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 541", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 541", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 5569", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 5569", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 5569", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 5569", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 5569", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 7269", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 7269", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 7269", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 7269", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 7269", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 7301", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 7301", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 7301", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 7301", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 7301", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 953 U", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 953 U", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 953 U", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 953 U", unit: "KG", sku: 15, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 953 U", unit: "KG", sku: 200, price: 285000, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy WH 230", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy WH 230", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy WH 230", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy WH 230", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy WH 230", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy WR 110", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy WR 110", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy WR 110", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy WR 110", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy WR 110", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy WR 220", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy WR 220", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy WR 220", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy WR 220", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy WR 220", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 2257", unit: "KG", sku: 1, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 2257", unit: "KG", sku: 5, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 2257", unit: "KG", sku: 10, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 2257", unit: "KG", sku: 25, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Zepoxy REH 2257", unit: "KG", sku: 200, price: 0, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    
    // Zepoxy Pigmented H Series
    { name: "Zepoxy WH 230", unit: "KG", sku: 50, price: 3220, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Pigmented H - 0001", unit: "KG", sku: 20, price: 4600, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Pigmented H - 3700", unit: "KG", sku: 20, price: 4600, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Pigmented H - 1600", unit: "KG", sku: 20, price: 4600, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Pigmented H - 9000", unit: "KG", sku: 20, price: 4600, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Pigmented H - 5210 - 1", unit: "KG", sku: 20, price: 4600, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "Pigmented H - 9321", unit: "KG", sku: 20, price: 4600, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "P Release - 0001", unit: "KG", sku: 10, price: 7906, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "P Release - 3700", unit: "KG", sku: 10, price: 7906, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "P Release - 1600", unit: "KG", sku: 10, price: 7906, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "P Release - 9000", unit: "KG", sku: 10, price: 7906, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "P Release - 5210 - 1", unit: "KG", sku: 10, price: 7906, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    { name: "P Release - 9321", unit: "KG", sku: 10, price: 7906, category: { mainCategory: "Epoxy Adhesives and Coatings", subCategory: "Resins" } },
    
    // Zepoxy Reactive Stain and Acid Itch
    // NOTE: Ressi Reactive Stain and all color variants are correctly listed in "Decorative Concrete" section (lines 258-297)
    // These duplicate entries in "Epoxy Adhesives and Coatings" have been removed
    
    // Ressi Reactive Stain, Ressi Neutraliser, Polymer, MT Base Coat, MT Top Coat, MT - Polymer Liquid, Terrazzo Retarder
    // REMOVED - All duplicates, correct entries are in Decorative Concrete section
  ].map(p => ({
    ...p,
    fullName: `${p.name} - ${p.sku} ${p.unit}`,
    company_id: "RESSICHEM"
  })),
  */
  
  // ===== SPECIALTY PRODUCTS (DUPLICATE SECTION - KEEPING FOR REFERENCE) =====
  ...[
    // Specialty Products
    { name: "Ressi NSG 710", unit: "KG", sku: 20, price: 2100, category: { mainCategory: "Specialty Products", subCategory: "Specialty" } },
    { name: "Ressi Kerb Grout 102", unit: "KG", sku: 20, price: 960, category: { mainCategory: "Specialty Products", subCategory: "Specialty" } },
    { name: "Ressi KerbFix 101", unit: "KG", sku: 20, price: 900, category: { mainCategory: "Specialty Products", subCategory: "Specialty" } },
    { name: "Zepoxy LEEG 10", unit: "KG", sku: 25, price: 66000, category: { mainCategory: "Specialty Products", subCategory: "Specialty" } },
    { name: "Ressi Anchor Fix", unit: "KG", sku: 3.8, price: 7245, category: { mainCategory: "Specialty Products", subCategory: "Specialty" } },
    { name: "Ressi Anchor Fix", unit: "KG", sku: 38, price: 70680, category: { mainCategory: "Specialty Products", subCategory: "Specialty" } },
    { name: "Ressi EPO Anchor Pro 3:1", unit: "KG", sku: 0.565, price: 2340, category: { mainCategory: "Specialty Products", subCategory: "Specialty" } },
  ].map(p => ({
    ...p,
    fullName: `${p.name} - ${p.sku} ${p.unit}`,
    company_id: "RESSICHEM"
  })),
];

// Import products
async function importProducts() {
  try {
    await connect();
    console.log("📦 Starting product import...\n");

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let errors = [];

    for (const productInfo of productData) {
      try {
        // Create full product name with SKU and unit
        const productName = productInfo.fullName || `${productInfo.name} - ${productInfo.sku} ${productInfo.unit}`;
        
        // Check if product already exists (by name and company_id)
        const existingProduct = await Product.findOne({
          name: productName,
          company_id: productInfo.company_id
        });

        const productPayload = {
          name: productName,
          description: productInfo.colorCode ? `${productInfo.name} (${productInfo.colorCode})` : productInfo.name,
          price: productInfo.price,
          unit: productInfo.unit,
          sku: productInfo.sku ? String(productInfo.sku) : '', // Store SKU separately
          category: productInfo.category,
          company_id: productInfo.company_id,
          stock: 0, // Default stock, can be updated later
          minStock: 0,
          isActive: true
        };

        if (existingProduct) {
          // Update existing product
          await Product.findByIdAndUpdate(existingProduct._id, productPayload, { new: true });
          updated++;
          console.log(`✅ Updated: ${productName} - ${productInfo.price} PKR`);
        } else {
          // Create new product
          await Product.create(productPayload);
          created++;
          console.log(`✨ Created: ${productName} - ${productInfo.price} PKR`);
        }
      } catch (error) {
        errors.push({ product: productInfo.fullName || productInfo.name, error: error.message });
        skipped++;
        console.error(`❌ Error processing ${productInfo.fullName || productInfo.name}:`, error.message);
      }
    }

    console.log("\n📊 Import Summary:");
    console.log(`   ✨ Created: ${created} products`);
    console.log(`   ✅ Updated: ${updated} products`);
    console.log(`   ⏭️  Skipped: ${skipped} products`);
    
    if (errors.length > 0) {
      console.log("\n⚠️  Errors:");
      errors.forEach(err => {
        console.log(`   - ${err.product}: ${err.error}`);
      });
    }

    console.log("\n🎉 Product import completed!");
  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

// Run import
if (require.main === module) {
  importProducts()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { importProducts };

