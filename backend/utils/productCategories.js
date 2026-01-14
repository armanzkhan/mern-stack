//utils/productCategories.js
const productCategories = {
  "Dry Mix Mortars / Premix Plasters": {},
  
  "Epoxy Floorings & Coatings": {
    "Epoxy Crack Fillers": [],
    "Epoxy Primers": [],
    "Epoxy Mid Coats": [],
    "Cementitious Screeds and Repair Materials": [],
    "Two Component Epoxy Top Coats": [],
    "Three Component Heavy Duty Epoxy Floorings": [],
    "Thin Coat Brush, Roller and Spray Applied": []
  },
  
  "Building Care and Maintenance": {},
  
  "Epoxy Adhesives and Coatings": {
    "Resins": {
      "Unmodified Resins": [],
      "Solvent Cut Resins": [],
      "Reactive Diluent Modified Resins": [],
      "Solid Resins": [],
      "Special Liquid Resins": [],
      "Other Resins": []
    },
    "Hardeners": {
      "Polyamides": [],
      "Amidoamines": [],
      "Cycloaliphatic amines": [],
      "Phenalkamines": [],
      "Aliphatic amines": [],
      "Anhydrides": [],
      "Other Hardeners": []
    },
    "Mixed Formulated Systems": {
      "Brush Potting": [],
      "Electronic Component Potting": [],
      "Clear Coating": [],
      "Other Coatings": [],
      "Tabletop Pouring": [],
      "Composite Manufacturing": [],
      "Adhesives": [],
      "Other Systems": []
    },
    "Additives": []
  },
  
  "Tiling and Grouting Materials": {},
  
  "Concrete Admixtures": {},
  
  "Building Insulation": {},
  
  "Decorative Concrete": {},
  
  "Specialty Products": {}
};

// Helper function to get all categories as a flat array
const getAllCategories = () => {
  const categories = [];
  
  Object.keys(productCategories).forEach(mainCategory => {
    categories.push(mainCategory);
    
    const subCategories = productCategories[mainCategory];
    if (subCategories && typeof subCategories === 'object') {
      Object.keys(subCategories).forEach(subCategory => {
        categories.push(`${mainCategory} > ${subCategory}`);
        
        // Add sub-sub categories if they exist and are arrays
        const subSubCategories = subCategories[subCategory];
        if (Array.isArray(subSubCategories)) {
          subSubCategories.forEach(subSubCategory => {
            categories.push(`${mainCategory} > ${subCategory} > ${subSubCategory}`);
          });
        } else if (subSubCategories && typeof subSubCategories === 'object') {
          // Handle nested objects (like Resins, Hardeners, etc.)
          Object.keys(subSubCategories).forEach(subSubCategory => {
            categories.push(`${mainCategory} > ${subCategory} > ${subSubCategory}`);
          });
        }
      });
    }
  });
  
  return categories;
};

// Helper function to get main categories
const getMainCategories = () => {
  return Object.keys(productCategories);
};

// Helper function to get subcategories for a main category
const getSubCategories = (mainCategory) => {
  if (!productCategories[mainCategory]) return [];
  return Object.keys(productCategories[mainCategory]);
};

// Helper function to get sub-subcategories for a main and sub category
const getSubSubCategories = (mainCategory, subCategory) => {
  if (!productCategories[mainCategory] || !productCategories[mainCategory][subCategory]) return [];
  return productCategories[mainCategory][subCategory];
};

module.exports = {
  productCategories,
  getAllCategories,
  getMainCategories,
  getSubCategories,
  getSubSubCategories
};
