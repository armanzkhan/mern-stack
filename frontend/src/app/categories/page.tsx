"use client";

import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { PermissionGate } from "@/components/Auth/PermissionGate";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeaders, handleAuthError } from "@/lib/auth";

interface Category {
  _id: string;
  mainCategory: string;
  subCategories: Array<{
    name: string;
    subSubCategories: string[];
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Manager {
  _id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  assignedCategories: string[];
  managerLevel: string;
  isActive: boolean;
}

export default function CategoriesPage() {
  const normalizeCategoryKey = (value: string) =>
    String(value || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/speciality/g, "specialty")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const [categories, setCategories] = useState<Category[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Fetch categories and managers
  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Fetching data with proper authentication...');
      
      // Fetch categories with authentication
      console.log('🔍 Fetching categories with authentication...');
      const token = localStorage.getItem('token');
      console.log('🔍 Token from localStorage:', token ? 'Present' : 'Missing');
      if (token) {
        console.log('🔍 Token preview:', token.substring(0, 50) + '...');
      }
      console.log('🔍 Auth headers:', getAuthHeaders());
      const categoriesRes = await fetch('/api/product-categories', {
        headers: getAuthHeaders()
      });
      console.log('📡 Categories API response:', categoriesRes.status);

      // Fetch managers with authentication
      const managersRes = await fetch('/api/managers/all', { 
        headers: getAuthHeaders() 
      });
      console.log('📡 Managers API response:', managersRes.status);
      const productsRes = await fetch('/api/products?limit=2000', {
        headers: getAuthHeaders()
      });
      console.log('📡 Products API response:', productsRes.status);

      console.log('📡 API Responses:');
      console.log('  Categories:', categoriesRes.status, categoriesRes.statusText);
      console.log('  Managers:', managersRes.status, managersRes.statusText);
      console.log('  Products:', productsRes.status, productsRes.statusText);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        console.log('✅ Categories data received:', categoriesData);
        console.log('✅ Categories count:', categoriesData.length);
        console.log('✅ Categories type:', typeof categoriesData);
        console.log('✅ Categories is array:', Array.isArray(categoriesData));
        
        const productsData = productsRes.ok ? await productsRes.json() : [];
        const products = Array.isArray(productsData) ? productsData : productsData.products || [];
        const activeMainCategoriesWithProducts = new Set(
          products
            .map((product: any) => normalizeCategoryKey(String(product?.category?.mainCategory || '').trim()))
            .filter(Boolean)
        );

        // Show active main categories that currently have products.
        const filteredData: Category[] = (Array.isArray(categoriesData) ? categoriesData : []).filter((cat: any) => {
          const categoryName = String(cat?.name || cat?.mainCategory || '').trim();
          const isMainLevel = Number(cat?.level) === 1 || !cat?.parent;
          const isActive = cat?.isActive !== false;
          return (
            Boolean(categoryName) &&
            isMainLevel &&
            isActive &&
            activeMainCategoriesWithProducts.has(normalizeCategoryKey(categoryName))
          );
        });

        const deduped: Category[] = Array.from(
          filteredData.reduce((acc: Map<string, Category>, cat: Category) => {
            const key = String((cat as any)?.name || cat?.mainCategory || '').trim().toLowerCase();
            if (!acc.has(key)) acc.set(key, cat);
            return acc;
          }, new Map<string, Category>()).values()
        ).sort((a: Category, b: Category) =>
          String((a as any)?.name || a?.mainCategory || '').localeCompare(String((b as any)?.name || b?.mainCategory || ''))
        );

        console.log('✅ Main active categories with products count:', deduped.length);
        console.log('✅ Category names:', deduped.map((c: any) => c.name || c.mainCategory));
        // Debug: Check subcategories for all categories
        deduped.forEach((cat: any, index: number) => {
          const catName = cat.name || cat.mainCategory;
          console.log(`✅ Category ${index + 1} (${catName}):`, {
            subCategories: cat.subCategories,
            subCategoriesType: typeof cat.subCategories,
            subCategoriesIsArray: Array.isArray(cat.subCategories),
            subCategoriesLength: Array.isArray(cat.subCategories) ? cat.subCategories.length : 'N/A',
            fullCategory: cat
          });
        });
        setCategories(deduped);
      } else {
        console.error('❌ Categories API failed with status:', categoriesRes.status);
        console.error('❌ Categories API status text:', categoriesRes.statusText);
        
        if (handleAuthError(categoriesRes.status, "Please log in to view categories")) {
          return;
        }
        
        const errorText = await categoriesRes.text();
        console.error('❌ Failed to fetch categories:', categoriesRes.status, errorText);
        setCategories([]);
      }

      if (managersRes.ok) {
        const managersData = await managersRes.json();
        console.log('✅ Managers data received:', managersData);
        console.log('✅ Managers count:', managersData.managers?.length || 0);
        
        // Debug: Log all manager emails to see if shariqsales@gmail.com is in the list
        if (managersData.managers && Array.isArray(managersData.managers)) {
          console.log('✅ Manager emails:', managersData.managers.map((m: any) => m.email));
          console.log('✅ Manager user_ids:', managersData.managers.map((m: any) => m.user_id));
          console.log('✅ Manager names:', managersData.managers.map((m: any) => `${m.firstName} ${m.lastName}`));
          
          // Check specifically for shariqsales@gmail.com
          const shariqManager = managersData.managers.find((m: any) => m.email === 'shariqsales@gmail.com');
          if (shariqManager) {
            console.log('✅ Found shariqsales@gmail.com in managers:', shariqManager);
          } else {
            console.log('❌ shariqsales@gmail.com NOT found in managers list');
            console.log('   Available emails:', managersData.managers.map((m: any) => m.email));
          }
        }
        
        setManagers(managersData.managers || []);
      } else {
        if (handleAuthError(managersRes.status, "Please log in to view managers")) {
          return;
        }
        const errorText = await managersRes.text();
        console.error('❌ Failed to fetch managers:', managersRes.status, errorText);
        setManagers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear any previous error messages on page load
    setMessage("");
    fetchData();
  }, []);

  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    if (message && message.includes('❌')) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handle category assignment
  const handleAssignCategories = async () => {
    if (!selectedManager || selectedCategories.length === 0) {
      setMessage("❌ Please select a manager and at least one category");
      return;
    }

    // Authentication will be handled by the API call and handleAuthError

    setAssigning(true);
    setMessage("");

    try {
      console.log('🔍 Assigning categories with headers:', getAuthHeaders());
      console.log('🔍 Token present:', !!localStorage.getItem('token'));
      
      const response = await fetch('/api/managers/assign-categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          managerId: selectedManager,
          categories: selectedCategories
        })
      });
      
      console.log('📡 Assignment response status:', response.status);

      if (response.ok) {
        setMessage("✅ Categories assigned successfully!");
        setSelectedManager("");
        setSelectedCategories([]);
        fetchData(); // Refresh data
      } else {
        // Handle 401 (unauthorized) - redirect to login
        if (response.status === 401) {
          if (handleAuthError(response.status, "Please log in to assign categories")) {
            return;
          }
        }
        
        // Handle 403 (forbidden) - show permission error, don't redirect
        if (response.status === 403) {
          const error = await response.json().catch(() => ({ message: 'You do not have permission to assign categories' }));
          setMessage(`❌ Permission Denied: ${error.message || 'You do not have permission to assign categories. Please contact an administrator.'}`);
          return;
        }
        
        // Handle other errors
        const error = await response.json().catch(() => ({ message: 'Failed to assign categories' }));
        setMessage(`❌ Error: ${error.message || 'Failed to assign categories'}`);
      }
    } catch (error) {
      setMessage("❌ Error assigning categories");
    } finally {
      setAssigning(false);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(category => {
    if (!category) return false;
    
    // Get category name
    const categoryName = (category as any).name || category.mainCategory;
    
    if (!categoryName) {
      return false;
    }
    
    // Handle different category structures for search
    if ((category as any).name) {
      // Database format: { name, level, parent, path, isActive, subCategories }
      return (category as any).name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (category.subCategories && category.subCategories.some((sub: any) => 
               typeof sub === 'string' ? sub.toLowerCase().includes(searchTerm.toLowerCase()) : false
             ));
    } else if (category.mainCategory) {
      // Legacy format: { mainCategory, subCategories }
      return category.mainCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (category.subCategories && category.subCategories.some(sub => 
               sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase())
             ));
    }
    return false;
  });

  // Get only main categories for manager assignment selection
  const allCategories = categories
    .map(category => {
      // Handle different category structures
      if ((category as any).name) {
        // Database format: { name, level, parent, path, isActive, subCategories }
        return ((category as any).name || '').trim();
      } else if (category.mainCategory) {
        // Legacy format: { mainCategory, subCategories }
        return (category.mainCategory || '').trim();
      }
      return null;
    })
    .filter((categoryName): categoryName is string => categoryName !== null && categoryName !== '');

  // Debug logging
  console.log('Categories count:', categories.length);
  console.log('All categories count:', allCategories.length);
  console.log('Sample categories:', allCategories.slice(0, 5));
  
  // Debug category structure
  if (categories.length > 0) {
    console.log('Sample category structure:', categories[0]);
  }

  return (
    <ProtectedRoute>
      <div className="w-full min-w-0 max-w-full overflow-x-hidden">
        <Breadcrumb pageName="Categories Management" />

        {/* Header */}
        <div className="mb-3 sm:mb-4 lg:mb-6">
          <p className="text-xs sm:text-sm lg:text-base text-blue-700 dark:text-blue-300">
            Manage product categories and assign them to managers
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Category Assignment */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-white mb-4">Assign Categories to Manager</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-white mb-2">
                  Select Manager
                </label>
                <select
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-blue-900 dark:text-white focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                >
                  <option value="">Choose a manager...</option>
                  {Array.isArray(managers) && managers.length > 0 ? (
                    managers.map((manager) => {
                      const displayName = `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || manager.email || 'Unknown';
                      const displayText = displayName ? `${displayName} (${manager.email || 'No email'})` : manager.email || 'Unknown Manager';
                      
                      return (
                        <option key={manager._id || manager.user_id} value={manager._id || manager.user_id}>
                          {displayText}
                        </option>
                      );
                    })
                  ) : (
                    <option value="" disabled>No managers available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-white mb-2">
                  Select Categories
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                  {allCategories.length === 0 ? (
                    <div className="px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                      {loading ? 'Loading categories...' : 'No categories available'}
                    </div>
                  ) : (
                    allCategories.map((category, index) => (
                      <label key={index} className="flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            }
                          }}
                          className="mr-3 text-blue-900 focus:ring-blue-900"
                        />
                        <span className="text-sm text-blue-900 dark:text-white">{category}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAssignCategories}
                disabled={assigning || !selectedManager || selectedCategories.length === 0}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-900/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {assigning ? 'Assigning...' : 'Assign Categories'}
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md border border-white/20 dark:border-gray-700/20 p-3 sm:p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-blue-900 dark:text-white focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-blue-900 dark:text-white">Categories</h2>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'} found
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => {
                  // Handle different category structures
                  const categoryName = (category as any).name || category.mainCategory || 'Unnamed Category';
                  const subCategories = category.subCategories || (category as any).subCategories || [];
                  
                  // Debug logging
                  console.log('Category:', categoryName, 'Subcategories:', subCategories, 'Full category:', category);
                  
                  return (
                    <div key={category._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-white/20 dark:border-gray-700/20 p-4 sm:p-6">
                      <h3 className="font-semibold text-blue-900 dark:text-white text-lg mb-3">
                        {categoryName}
                      </h3>
                      
                      <div className="space-y-2">
                        {subCategories.length > 0 ? (
                          subCategories.map((sub: any, index: number) => (
                            <div key={index} className="ml-4">
                              {typeof sub === 'string' ? (
                                // If subCategories is array of strings
                                <div className="text-sm font-medium text-blue-900 dark:text-white mb-1">
                                  • {sub}
                                </div>
                              ) : (
                                // If subCategories is array of objects with name and subSubCategories
                                <>
                                  <div className="text-sm font-medium text-blue-900 dark:text-white mb-1">
                                    {sub.name || sub}
                                  </div>
                                  {sub.subSubCategories && sub.subSubCategories.length > 0 && (
                                    <div className="ml-4 space-y-1">
                                      {sub.subSubCategories.map((subSub: string, subIndex: number) => (
                                        <div key={subIndex} className="text-xs text-gray-600 dark:text-gray-400">
                                          • {subSub}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            No subcategories
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-white mb-2">No categories found</h3>
                  <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
