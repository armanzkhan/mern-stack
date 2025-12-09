// Product Image Service - Backend
// Populates product images based on categories from Ressichem website

const Product = require('../models/Product');

class ProductImageService {
  constructor() {
    this.categoryImageMap = {
      // Dry Mix Mortars / Premix Plasters
      'Dry Mix Mortars': {
        imageUrl: 'https://ressichem.com/images/products/dry-mix-mortars.jpg',
        altText: 'Dry Mix Mortars and Premix Plasters',
        category: 'Dry Mix Mortars / Premix Plasters'
      },
      'Premix Plasters': {
        imageUrl: 'https://ressichem.com/images/products/premix-plasters.jpg',
        altText: 'Premix Plasters',
        category: 'Dry Mix Mortars / Premix Plasters'
      },

      // Epoxy Floorings & Coatings
      'Epoxy Floorings': {
        imageUrl: 'https://ressichem.com/images/products/epoxy-floorings.jpg',
        altText: 'Epoxy Floorings and Coatings',
        category: 'Epoxy Floorings & Coatings'
      },
      'Epoxy Coatings': {
        imageUrl: 'https://ressichem.com/images/products/epoxy-coatings.jpg',
        altText: 'Epoxy Coatings',
        category: 'Epoxy Floorings & Coatings'
      },
      'Epoxy Crack Fillers': {
        imageUrl: 'https://ressichem.com/images/products/epoxy-crack-fillers.jpg',
        altText: 'Epoxy Crack Fillers',
        category: 'Epoxy Floorings & Coatings',
        subcategory: 'Epoxy Crack Fillers'
      },
      'Epoxy Primers': {
        imageUrl: 'https://ressichem.com/images/products/epoxy-primers.jpg',
        altText: 'Epoxy Primers',
        category: 'Epoxy Floorings & Coatings',
        subcategory: 'Epoxy Primers'
      },
      'Epoxy Mid Coats': {
        imageUrl: 'https://ressichem.com/images/products/epoxy-mid-coats.jpg',
        altText: 'Epoxy Mid Coats',
        category: 'Epoxy Floorings & Coatings',
        subcategory: 'Epoxy Mid Coats'
      },
      'Cementitious Screeds': {
        imageUrl: 'https://ressichem.com/images/products/cementitious-screeds.jpg',
        altText: 'Cementitious Screeds and Repair Materials',
        category: 'Epoxy Floorings & Coatings',
        subcategory: 'Cementitious Screeds and Repair Materials'
      },
      'Two Component Epoxy': {
        imageUrl: 'https://ressichem.com/images/products/two-component-epoxy.jpg',
        altText: 'Two Component Epoxy Top Coats',
        category: 'Epoxy Floorings & Coatings',
        subcategory: 'Two Component Epoxy Top Coats'
      },
      'Three Component Epoxy': {
        imageUrl: 'https://ressichem.com/images/products/three-component-epoxy.jpg',
        altText: 'Three Component Heavy Duty Epoxy Floorings',
        category: 'Epoxy Floorings & Coatings',
        subcategory: 'Three Component Heavy Duty Epoxy Floorings'
      },

      // Building Care & Maintenance
      'Building Care': {
        imageUrl: 'https://ressichem.com/images/products/building-care.jpg',
        altText: 'Building Care and Maintenance',
        category: 'Building Care & Maintenance'
      },
      'Maintenance': {
        imageUrl: 'https://ressichem.com/images/products/maintenance.jpg',
        altText: 'Building Maintenance',
        category: 'Building Care & Maintenance'
      },

      // Epoxy Adhesives and Coatings
      'Epoxy Adhesives': {
        imageUrl: 'https://ressichem.com/images/products/epoxy-adhesives.jpg',
        altText: 'Epoxy Adhesives and Coatings',
        category: 'Epoxy Adhesives and Coatings'
      },
      'Resins': {
        imageUrl: 'https://ressichem.com/images/products/resins.jpg',
        altText: 'Epoxy Resins',
        category: 'Epoxy Adhesives and Coatings',
        subcategory: 'Resins'
      },
      'Hardeners': {
        imageUrl: 'https://ressichem.com/images/products/hardeners.jpg',
        altText: 'Epoxy Hardeners',
        category: 'Epoxy Adhesives and Coatings',
        subcategory: 'Hardeners'
      },
      'Mixed Formulated Systems': {
        imageUrl: 'https://ressichem.com/images/products/mixed-systems.jpg',
        altText: 'Mixed Formulated Systems',
        category: 'Epoxy Adhesives and Coatings',
        subcategory: 'Mixed Formulated Systems'
      },
      'Additives': {
        imageUrl: 'https://ressichem.com/images/products/additives.jpg',
        altText: 'Epoxy Additives',
        category: 'Epoxy Adhesives and Coatings',
        subcategory: 'Additives'
      },

      // Tiling and Grouting Materials
      'Tiling': {
        imageUrl: 'https://ressichem.com/images/products/tiling.jpg',
        altText: 'Tiling and Grouting Materials',
        category: 'Tiling and Grouting Materials'
      },
      'Grouting': {
        imageUrl: 'https://ressichem.com/images/products/grouting.jpg',
        altText: 'Grouting Materials',
        category: 'Tiling and Grouting Materials'
      },
      'Tile Adhesives': {
        imageUrl: 'https://ressichem.com/images/products/tile-adhesives.jpg',
        altText: 'Tile Adhesives',
        category: 'Tiling and Grouting Materials',
        subcategory: 'Tile Adhesives'
      },
      'Cement-Based': {
        imageUrl: 'https://ressichem.com/images/products/cement-based.jpg',
        altText: 'Cement-Based Tile Adhesives',
        category: 'Tiling and Grouting Materials',
        subcategory: 'Cement-Based'
      },

      // Concrete Admixtures
      'Concrete Admixtures': {
        imageUrl: 'https://ressichem.com/images/products/concrete-admixtures.jpg',
        altText: 'Concrete Admixtures',
        category: 'Concrete Admixtures'
      },

      // Building Insulation
      'Building Insulation': {
        imageUrl: 'https://ressichem.com/images/products/building-insulation.jpg',
        altText: 'Building Insulation',
        category: 'Building Insulation'
      },

      // Decorative Concrete
      'Decorative Concrete': {
        imageUrl: 'https://ressichem.com/images/products/decorative-concrete.jpg',
        altText: 'Decorative Concrete',
        category: 'Decorative Concrete'
      },

      // Specialty Products
      'Specialty Products': {
        imageUrl: 'https://ressichem.com/images/products/specialty-products.jpg',
        altText: 'Specialty Products',
        category: 'Specialty Products'
      },

      // Default fallback
      'default': {
        imageUrl: 'https://ressichem.com/images/products/default-product.jpg',
        altText: 'Ressichem Product',
        category: 'General'
      }
    };
  }

  /**
   * Get product image based on category
   */
  getProductImage(category) {
    let categoryKey = 'default';
    
    if (typeof category === 'string') {
      categoryKey = this.findBestMatch(category);
    } else if (typeof category === 'object' && category) {
      // Handle different category object structures
      if (category.name) {
        categoryKey = this.findBestMatch(category.name);
      } else if (category.mainCategory) {
        categoryKey = this.findBestMatch(category.mainCategory);
        if (category.subCategory) {
          const subKey = this.findBestMatch(category.subCategory);
          if (subKey !== 'default') {
            categoryKey = subKey;
          }
        }
      }
    }

    const imageData = this.categoryImageMap[categoryKey] || this.categoryImageMap['default'];
    
    return {
      imageUrl: imageData.imageUrl,
      altText: imageData.altText,
      category: imageData.category
    };
  }

  /**
   * Find best matching category key
   */
  findBestMatch(categoryString) {
    if (!categoryString) return 'default';
    
    const normalizedCategory = categoryString.toLowerCase().trim();
    
    // Direct matches first
    for (const key of Object.keys(this.categoryImageMap)) {
      if (key.toLowerCase() === normalizedCategory) {
        return key;
      }
    }
    
    // Partial matches
    for (const key of Object.keys(this.categoryImageMap)) {
      if (key.toLowerCase().includes(normalizedCategory) || 
          normalizedCategory.includes(key.toLowerCase())) {
        return key;
      }
    }
    
    // Check for specific keywords
    const keywords = [
      'epoxy', 'tile', 'adhesive', 'grout', 'mortar', 'plaster', 
      'concrete', 'insulation', 'decorative', 'specialty', 'building'
    ];
    
    for (const keyword of keywords) {
      if (normalizedCategory.includes(keyword)) {
        for (const key of Object.keys(this.categoryImageMap)) {
          if (key.toLowerCase().includes(keyword)) {
            return key;
          }
        }
      }
    }
    
    return 'default';
  }

  /**
   * Get image for specific product name
   */
  getProductImageByName(productName, category) {
    const normalizedName = productName.toLowerCase();
    
    // Check for specific product keywords
    if (normalizedName.includes('tile adhesive') || normalizedName.includes('tile glue')) {
      return this.categoryImageMap['Tile Adhesives'];
    }
    
    if (normalizedName.includes('epoxy') && normalizedName.includes('adhesive')) {
      return this.categoryImageMap['Epoxy Adhesives'];
    }
    
    if (normalizedName.includes('grout')) {
      return this.categoryImageMap['Grouting'];
    }
    
    if (normalizedName.includes('mortar')) {
      return this.categoryImageMap['Dry Mix Mortars'];
    }
    
    if (normalizedName.includes('plaster')) {
      return this.categoryImageMap['Premix Plasters'];
    }
    
    if (normalizedName.includes('epoxy') && normalizedName.includes('floor')) {
      return this.categoryImageMap['Epoxy Floorings'];
    }
    
    if (normalizedName.includes('concrete')) {
      return this.categoryImageMap['Concrete Admixtures'];
    }
    
    // Fall back to category-based matching
    return this.getProductImage(category);
  }

  /**
   * Populate product images for all products
   */
  async populateProductImages(companyId = 'RESSICHEM') {
    try {
      console.log('🖼️ Starting to populate product images...');
      
      const products = await Product.find({ 
        company_id: companyId,
        isActive: true 
      });
      
      console.log(`📦 Found ${products.length} products to update`);
      
      let updatedCount = 0;
      
      for (const product of products) {
        const imageData = this.getProductImageByName(product.name, product.category);
        
        // Update product with image data
        await Product.findByIdAndUpdate(product._id, {
          $set: {
            'images.category': imageData.imageUrl,
            'images.primary': imageData.imageUrl,
            'imageAlt': imageData.altText
          }
        });
        
        updatedCount++;
        
        if (updatedCount % 10 === 0) {
          console.log(`✅ Updated ${updatedCount}/${products.length} products`);
        }
      }
      
      console.log(`🎉 Successfully updated ${updatedCount} products with images`);
      return { success: true, updatedCount };
      
    } catch (error) {
      console.error('❌ Error populating product images:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get image mapping for frontend
   */
  getImageMapping() {
    return this.categoryImageMap;
  }
}

module.exports = new ProductImageService();
