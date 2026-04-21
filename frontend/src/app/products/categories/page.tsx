"use client";

import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { PermissionGate } from "@/components/Auth/PermissionGate";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ProductCategory {
  _id: string;
  name: string;
  level: number;
  parent?: string;
  path: string;
  isActive: boolean;
  subCategories?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryProduct {
  _id: string;
  name: string;
  price?: number;
  sku?: string;
  unit?: string;
  category?: {
    mainCategory?: string;
    subCategory?: string;
    subSubCategory?: string;
  };
}

export default function ProductCategoriesPage() {
  const normalizeCategory = (category: Partial<ProductCategory> & { mainCategory?: string }, index: number): ProductCategory => {
    const name = String(category?.name || category?.mainCategory || "").trim() || `Unnamed Category ${index + 1}`;
    const levelNumber = Number(category?.level);
    const level = levelNumber === 2 || levelNumber === 3 ? levelNumber : 1;
    const path = String(category?.path || "").trim() || name;
    const parent = category?.parent ? String(category.parent) : undefined;
    const subCategories = Array.isArray(category?.subCategories)
      ? category.subCategories
          .map((value) => String(value || "").trim())
          .filter(Boolean)
      : [];

    return {
      _id: String(category?._id || ""),
      name,
      level,
      parent,
      path,
      isActive: category?.isActive !== false,
      subCategories,
      createdAt: category?.createdAt,
      updatedAt: category?.updatedAt,
    };
  };

  const compareCategoryNames = (a: ProductCategory, b: ProductCategory) =>
    String(a?.name || "").localeCompare(String(b?.name || ""));

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const filterLevel: number = 1;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryLevel, setNewCategoryLevel] = useState<1 | 2 | 3>(1);
  const [newCategoryParent, setNewCategoryParent] = useState("");
  const [newSubCategoriesText, setNewSubCategoriesText] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [loadingEditCategoryProducts, setLoadingEditCategoryProducts] = useState(false);
  const [editCategoryProducts, setEditCategoryProducts] = useState<CategoryProduct[]>([]);
  const [selectedMappedProductIds, setSelectedMappedProductIds] = useState<string[]>([]);
  const [removingMappedProducts, setRemovingMappedProducts] = useState(false);
  const [movingMappedProducts, setMovingMappedProducts] = useState(false);
  const [moveTargetMainCategory, setMoveTargetMainCategory] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryLevel, setEditCategoryLevel] = useState<1 | 2 | 3>(1);
  const [editCategoryParent, setEditCategoryParent] = useState("");
  const [editSubCategoriesText, setEditSubCategoriesText] = useState("");
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<ProductCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkMoveParentId, setBulkMoveParentId] = useState("");
  const [bulkMovingParent, setBulkMovingParent] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Allowed main categories for manager assignment
  const allowedMainCategories = [
    'Building Care & Maintenance',
    'Concrete Admixtures',
    'Decorative Concrete',
    'Dry Mix Mortars / Premix Plasters',
    'Epoxy Adhesives and Coatings',
    'Epoxy Floorings & Coatings',
    'Specialty Products',
    'Tiling and Grouting Materials'
  ];

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/product-categories', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const categoriesList = Array.isArray(data) ? data : data.categories || [];
        const normalizedCategories: ProductCategory[] = categoriesList.map(
          (category: Partial<ProductCategory> & { mainCategory?: string }, index: number) =>
            normalizeCategory(category, index)
        );

        // Show all active main categories on this page.
        const activeMainCategories = normalizedCategories.filter(
          (category: ProductCategory) =>
            category.level === 1 &&
            category.isActive
        );

        // De-duplicate by category name (prefer first active entry).
        const deduped = Array.from(
          activeMainCategories.reduce((acc: Map<string, ProductCategory>, category: ProductCategory) => {
            const key = String(category.name || "").toLowerCase();
            if (!acc.has(key)) acc.set(key, category);
            return acc;
          }, new Map<string, ProductCategory>()).values()
        ).sort(compareCategoryNames);

        setCategories(deduped);
      } else {
        console.error('Failed to fetch categories:', response.status);
        toast.error('Failed to load product categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error loading product categories');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  useEffect(() => {
    void fetchCategories();
  }, []);

  useEffect(() => {
    setSelectedCategoryIds((prev) => prev.filter((id) => categories.some((cat) => cat._id === id)));
  }, [categories]);

  useEffect(() => {
    setBulkMoveParentId("");
  }, [selectedCategoryIds]);

  const levelOneCategories = categories
    .filter((cat) => cat.level === 1 && cat.isActive)
    .sort(compareCategoryNames);
  const levelTwoCategories = categories
    .filter((cat) => cat.level === 2 && cat.isActive)
    .sort(compareCategoryNames);
  const parentOptions = newCategoryLevel === 2 ? levelOneCategories : levelTwoCategories;
  const editParentOptions = (editCategoryLevel === 2 ? levelOneCategories : levelTwoCategories).filter(
    (cat) => cat._id !== editingCategoryId
  );

  const resetCreateForm = () => {
    setNewCategoryName("");
    setNewCategoryLevel(1);
    setNewCategoryParent("");
    setNewSubCategoriesText("");
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    if (newCategoryLevel > 1 && !newCategoryParent) {
      toast.error("Please select a parent category");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    const subCategories = newSubCategoriesText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: {
      name: string;
      level: number;
      parent?: string;
      subCategories?: string[];
    } = {
      name,
      level: newCategoryLevel,
    };
    if (newCategoryLevel > 1) payload.parent = newCategoryParent;
    if (newCategoryLevel === 1 && subCategories.length > 0) payload.subCategories = subCategories;

    try {
      setCreatingCategory(true);
      const response = await fetch("/api/product-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.error || "Failed to create category");
        return;
      }

      toast.success("Category created successfully");
      setShowCreateModal(false);
      resetCreateForm();
      await fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Error creating category");
    } finally {
      setCreatingCategory(false);
    }
  };

  const resetEditForm = () => {
    setEditingCategoryId("");
    setEditCategoryName("");
    setEditCategoryLevel(1);
    setEditCategoryParent("");
    setEditSubCategoriesText("");
    setEditCategoryProducts([]);
    setSelectedMappedProductIds([]);
    setRemovingMappedProducts(false);
    setMovingMappedProducts(false);
    setMoveTargetMainCategory("");
    setLoadingEditCategoryProducts(false);
  };

  const fetchProductsForCategoryEdit = async (category: ProductCategory) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoadingEditCategoryProducts(true);
      const params = new URLSearchParams();
      params.set("limit", "2000");

      const directParent = category.parent
        ? categories.find((cat) => cat._id === String(category.parent))
        : undefined;
      const grandParent = directParent?.parent
        ? categories.find((cat) => cat._id === String(directParent.parent))
        : undefined;

      if (category.level === 1) {
        params.set("mainCategory", String(category.name || ""));
      } else if (category.level === 2) {
        params.set("mainCategory", String(directParent?.name || ""));
        params.set("subCategory", String(category.name || ""));
      } else if (category.level === 3) {
        if (grandParent?.name) params.set("mainCategory", String(grandParent.name));
        if (directParent?.name) params.set("subCategory", String(directParent.name));
      }

      const response = await fetch(`/api/products?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await response.json().catch(() => ([]));
      if (!response.ok) {
        setEditCategoryProducts([]);
        return;
      }

      const products: CategoryProduct[] = (Array.isArray(payload) ? payload : payload.products || []).map(
        (product: CategoryProduct) => ({
          _id: String(product?._id || ""),
          name: String(product?.name || ""),
          price: Number(product?.price || 0),
          sku: String(product?.sku || ""),
          unit: String(product?.unit || ""),
          category: product?.category || {},
        })
      );

      // Backend doesn't currently filter by subSubCategory query; finalize it client-side for level 3.
      if (category.level === 3) {
        const targetSubSub = String(category.name || "").toLowerCase();
        setEditCategoryProducts(
          products.filter(
            (product: CategoryProduct) =>
              String(product?.category?.subSubCategory || "").toLowerCase() === targetSubSub
          )
        );
      } else {
        setEditCategoryProducts(products);
      }
    } catch (error) {
      console.error("Error loading category products for edit:", error);
      setEditCategoryProducts([]);
    } finally {
      setLoadingEditCategoryProducts(false);
    }
  };

  const openEditModal = (category: ProductCategory) => {
    setEditingCategoryId(category._id);
    setEditCategoryName(category.name || "");
    setEditCategoryLevel((category.level as 1 | 2 | 3) || 1);
    setEditCategoryParent(category.parent ? String(category.parent) : "");
    setEditSubCategoriesText((category.subCategories || []).join("\n"));
    setEditCategoryProducts([]);
    setSelectedMappedProductIds([]);
    setMoveTargetMainCategory("");
    setShowEditModal(true);
    void fetchProductsForCategoryEdit(category);
  };

  const toggleMappedProductSelection = (productId: string) => {
    setSelectedMappedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const buildCategoryPayloadAfterRemoval = (product: CategoryProduct) => {
    const currentMain = String(product?.category?.mainCategory || "").trim();
    const currentSub = String(product?.category?.subCategory || "").trim();

    if (editCategoryLevel === 1) {
      return null;
    }

    if (editCategoryLevel === 2) {
      return {
        mainCategory: currentMain || String(editCategoryName || "").trim(),
        subCategory: "",
        subSubCategory: "",
      };
    }

    return {
      mainCategory: currentMain,
      subCategory: currentSub,
      subSubCategory: "",
    };
  };

  const handleRemoveMappedProducts = async (productIds: string[]) => {
    if (productIds.length === 0) {
      toast.error("Select at least one mapped product to remove");
      return;
    }

    if (editCategoryLevel === 1) {
      toast.error("Remove from main category is not supported here. Move products to another category instead.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    const byId = new Map(editCategoryProducts.map((product) => [String(product._id), product]));
    const targets = productIds
      .map((id) => byId.get(String(id)))
      .filter((product): product is CategoryProduct => Boolean(product));

    if (targets.length === 0) {
      toast.error("No matching mapped products found");
      return;
    }

    try {
      setRemovingMappedProducts(true);
      const results = await Promise.all(
        targets.map(async (product) => {
          const nextCategory = buildCategoryPayloadAfterRemoval(product);
          if (!nextCategory) return false;

          const response = await fetch(`/api/products/${product._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ category: nextCategory }),
          });
          return response.ok;
        })
      );

      const successCount = results.filter(Boolean).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`Removed ${successCount} product${successCount !== 1 ? "s" : ""} from this category`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} product${failCount !== 1 ? "s" : ""} could not be removed`);
      }

      setSelectedMappedProductIds([]);
      const virtualCategoryForRefresh: ProductCategory = {
        _id: editingCategoryId,
        name: String(editCategoryName || ""),
        level: editCategoryLevel,
        parent: editCategoryParent || undefined,
        path: String(editCategoryName || ""),
        isActive: true,
      };
      await fetchProductsForCategoryEdit(virtualCategoryForRefresh);
    } catch (error) {
      console.error("Error removing mapped products from category:", error);
      toast.error("Error removing mapped products");
    } finally {
      setRemovingMappedProducts(false);
    }
  };

  const handleMoveMappedProductsToMainCategory = async () => {
    if (editCategoryLevel !== 1) {
      toast.error("Move action is only needed for main categories");
      return;
    }
    if (selectedMappedProductIds.length === 0) {
      toast.error("Select at least one product first");
      return;
    }
    const targetMain = String(moveTargetMainCategory || "").trim();
    if (!targetMain) {
      toast.error("Select a target main category");
      return;
    }
    if (targetMain.toLowerCase() === String(editCategoryName || "").trim().toLowerCase()) {
      toast.error("Target category must be different");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    try {
      setMovingMappedProducts(true);
      const results = await Promise.all(
        selectedMappedProductIds.map(async (productId) => {
          const response = await fetch(`/api/products/${productId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              category: {
                mainCategory: targetMain,
                subCategory: "",
                subSubCategory: "",
              },
            }),
          });
          return response.ok;
        })
      );

      const successCount = results.filter(Boolean).length;
      const failCount = results.length - successCount;
      if (successCount > 0) {
        toast.success(`Moved ${successCount} product${successCount !== 1 ? "s" : ""} to ${targetMain}`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} product${failCount !== 1 ? "s" : ""} could not be moved`);
      }

      setSelectedMappedProductIds([]);
      const virtualCategoryForRefresh: ProductCategory = {
        _id: editingCategoryId,
        name: String(editCategoryName || ""),
        level: editCategoryLevel,
        parent: editCategoryParent || undefined,
        path: String(editCategoryName || ""),
        isActive: true,
      };
      await fetchProductsForCategoryEdit(virtualCategoryForRefresh);
    } catch (error) {
      console.error("Error moving mapped products:", error);
      toast.error("Error moving selected products");
    } finally {
      setMovingMappedProducts(false);
    }
  };

  const handleUpdateCategory = async () => {
    const name = editCategoryName.trim();
    if (!name) {
      toast.error("Category name is required");
      return;
    }
    if (editCategoryLevel > 1 && !editCategoryParent) {
      toast.error("Please select a parent category");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    const subCategories = editSubCategoriesText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: {
      name: string;
      level: number;
      parent?: string | null;
      subCategories?: string[];
    } = {
      name,
      level: editCategoryLevel,
    };
    if (editCategoryLevel > 1) {
      payload.parent = editCategoryParent;
    } else {
      payload.parent = null;
      payload.subCategories = subCategories;
    }

    try {
      setUpdatingCategory(true);
      const response = await fetch(`/api/product-categories/${editingCategoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.error || "Failed to update category");
        return;
      }

      toast.success("Category updated successfully");
      setShowEditModal(false);
      resetEditForm();
      await fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Error updating category");
    } finally {
      setUpdatingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryTarget?._id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    try {
      setDeletingCategory(true);
      const response = await fetch(`/api/product-categories/${deleteCategoryTarget._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.error || "Failed to delete category");
        return;
      }

      toast.success("Category deleted successfully");
      setDeleteCategoryTarget(null);
      setSelectedCategoryIds((prev) => prev.filter((id) => id !== deleteCategoryTarget._id));
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Error deleting category");
    } finally {
      setDeletingCategory(false);
    }
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedCategoryIds((prev) =>
        prev.filter((id) => !filteredCategories.some((cat) => cat._id === id))
      );
      return;
    }
    const filteredIds = filteredCategories.map((cat) => cat._id);
    setSelectedCategoryIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedCategoryIds.length === 0) {
      toast.error("Select at least one category first");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    try {
      setBulkUpdating(true);
      const response = await fetch("/api/product-categories/bulk-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ids: selectedCategoryIds,
          isActive,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.error || "Failed to update selected categories");
        return;
      }

      toast.success(
        isActive
          ? `Activated ${selectedCategoryIds.length} categories`
          : `Deactivated ${selectedCategoryIds.length} categories`
      );
      setSelectedCategoryIds([]);
      await fetchCategories();
    } catch (error) {
      console.error("Error updating selected categories:", error);
      toast.error("Error updating selected categories");
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkMoveParent = async () => {
    if (selectedCategoryIds.length === 0) {
      toast.error("Select at least one category first");
      return;
    }
    if (!selectedLevelForBulkMove || selectedLevels.length !== 1) {
      toast.error("Select categories from the same level to move");
      return;
    }
    if (selectedLevelForBulkMove === 1) {
      toast.error("Main categories cannot be moved under a parent");
      return;
    }
    if (!bulkMoveParentId) {
      toast.error("Please select a target parent category");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    try {
      setBulkMovingParent(true);
      const response = await fetch("/api/product-categories/bulk-move-parent", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ids: selectedCategoryIds,
          newParentId: bulkMoveParentId,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.error || "Failed to move selected categories");
        return;
      }

      toast.success(`Moved ${selectedCategoryIds.length} categories to new parent`);
      setSelectedCategoryIds([]);
      setBulkMoveParentId("");
      await fetchCategories();
    } catch (error) {
      console.error("Error moving selected categories:", error);
      toast.error("Error moving selected categories");
    } finally {
      setBulkMovingParent(false);
    }
  };

  const handleBulkDeleteSelected = async () => {
    if (selectedCategoryIds.length === 0) {
      toast.error("Select at least one category first");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedCategoryIds.length} selected categories?\n\nThis will mark them inactive (soft delete).`
    );
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    try {
      setBulkDeleting(true);
      const response = await fetch("/api/product-categories/bulk-delete", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ids: selectedCategoryIds,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data?.error || "Failed to delete selected categories");
        return;
      }

      toast.success(`Deleted ${selectedCategoryIds.length} categories`);
      setSelectedCategoryIds([]);
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting selected categories:", error);
      toast.error("Error deleting selected categories");
    } finally {
      setBulkDeleting(false);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (category.path && category.path.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLevel = category.level === 1;

    return matchesSearch && matchesLevel;
  });

  // Group categories by level
  const mainCategories = categories.filter(cat => cat.level === 1);
  const assignableMainCategories = categories.filter(
    (cat) => cat.level === 1 && allowedMainCategories.includes(cat.name)
  );
  const subCategories = categories.filter(cat => cat.level === 2);
  const subSubCategories = categories.filter(cat => cat.level === 3);
  const categoryById = new Map(categories.map((cat) => [cat._id, cat]));
  const allFilteredSelected =
    filteredCategories.length > 0 &&
    filteredCategories.every((cat) => selectedCategoryIds.includes(cat._id));
  const selectedCategories = categories.filter((cat) => selectedCategoryIds.includes(cat._id));
  const selectedLevels = Array.from(new Set(selectedCategories.map((cat) => Number(cat.level))));
  const selectedLevelForBulkMove = selectedLevels.length === 1 ? selectedLevels[0] : null;
  const bulkMoveParentOptions =
    selectedLevelForBulkMove === 2
      ? levelOneCategories.filter((cat) => !selectedCategoryIds.includes(cat._id))
      : selectedLevelForBulkMove === 3
        ? levelTwoCategories.filter((cat) => !selectedCategoryIds.includes(cat._id))
        : [];
  const moveMainCategoryOptions = mainCategories
    .filter(
      (cat) =>
        cat.isActive &&
        String(cat.name || "").trim().toLowerCase() !== String(editCategoryName || "").trim().toLowerCase()
    )
    .sort(compareCategoryNames);
  return (
    <ProtectedRoute requiredPermission="categories.read">
      <div className="w-full min-w-0">
        <Breadcrumb pageName="Product Categories" />

        {/* Header Section */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg sm:shadow-xl lg:shadow-2xl border border-white/20 dark:border-gray-700/20 p-3 sm:p-4 lg:p-6 xl:p-8">
            <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-900 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-blue-900 dark:text-white truncate">
                    Product Categories
                  </h1>
                  <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm lg:text-base mt-1 truncate">
                    View all active main product categories.
                  </p>
                </div>
                <PermissionGate permission="categories.create">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg hover:bg-blue-800 transition-all"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Category
                  </button>
                </PermissionGate>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg lg:shadow-xl border border-white/20 dark:border-gray-700/20 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                    Main Categories
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {filteredCategories.length}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 truncate">All active level 1 categories</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-900 rounded-md sm:rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg lg:shadow-xl border border-white/20 dark:border-gray-700/20 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 truncate">Main Categories (Level 1)</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {mainCategories.length}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 truncate">Assignable: {assignableMainCategories.length}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-900 rounded-md sm:rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg lg:shadow-xl border border-white/20 dark:border-gray-700/20 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 truncate">Sub Categories (Hidden)</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    0
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-900 rounded-md sm:rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg lg:shadow-xl border border-white/20 dark:border-gray-700/20 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 truncate">Active Categories</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {categories.filter(cat => cat.isActive).length}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-900 rounded-md sm:rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg lg:shadow-xl border border-white/20 dark:border-gray-700/20 p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search categories by name or path..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-md sm:rounded-lg border border-gray-300 bg-white px-3 py-2 sm:px-4 sm:py-3 pl-8 sm:pl-10 lg:pl-12 text-gray-900 focus:border-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900/50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 transition-all duration-300 text-xs sm:text-sm lg:text-base"
                  />
                  <svg className="absolute left-2 sm:left-3 lg:left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={1}
                  disabled
                  className="w-full rounded-md sm:rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 sm:px-4 sm:py-3 text-gray-700 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-xs sm:text-sm lg:text-base"
                >
                  <option value={1}>Main Categories Only (Fixed 8)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg lg:shadow-xl border border-white/20 dark:border-gray-700/20 p-3 sm:p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900 dark:text-white">
                Categories List
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
              </div>
            </div>

            <PermissionGate permission="categories.update">
              <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/80 p-3 dark:border-blue-900/30 dark:bg-blue-900/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAllFiltered}
                      className="h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                    />
                    <span className="text-xs font-medium text-blue-900 dark:text-blue-200 sm:text-sm">
                      Select all in current view ({filteredCategories.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-blue-800 dark:text-blue-300">
                      Selected: {selectedCategoryIds.length}
                    </span>
                    <select
                      value={bulkMoveParentId}
                      onChange={(e) => setBulkMoveParentId(e.target.value)}
                      disabled={
                        bulkUpdating ||
                        bulkMovingParent ||
                        selectedCategoryIds.length === 0 ||
                        !selectedLevelForBulkMove ||
                        selectedLevels.length !== 1 ||
                        selectedLevelForBulkMove === 1
                      }
                      className="min-w-44 rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-xs text-blue-900 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-blue-900/40 dark:bg-gray-800 dark:text-blue-200 dark:disabled:bg-gray-700"
                    >
                      <option value="">
                        {selectedLevels.length !== 1
                          ? "Select same-level categories first"
                          : selectedLevelForBulkMove === 1
                            ? "Main categories cannot be moved"
                            : "Choose new parent"}
                      </option>
                      {bulkMoveParentOptions.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={
                        bulkUpdating ||
                        bulkMovingParent ||
                        bulkDeleting ||
                        selectedCategoryIds.length === 0 ||
                        !bulkMoveParentId
                      }
                      onClick={() => void handleBulkMoveParent()}
                      className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-900/40 dark:bg-indigo-900/20 dark:text-indigo-300"
                    >
                      {bulkMovingParent ? "Moving..." : "Move Parent"}
                    </button>
                    <button
                      type="button"
                      disabled={bulkUpdating || bulkMovingParent || bulkDeleting || selectedCategoryIds.length === 0}
                      onClick={() => void handleBulkStatusUpdate(true)}
                      className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300"
                    >
                      Activate Selected
                    </button>
                    <button
                      type="button"
                      disabled={bulkUpdating || bulkMovingParent || bulkDeleting || selectedCategoryIds.length === 0}
                      onClick={() => void handleBulkStatusUpdate(false)}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300"
                    >
                      Deactivate Selected
                    </button>
                    <PermissionGate permission="categories.delete">
                      <button
                        type="button"
                        disabled={bulkUpdating || bulkMovingParent || bulkDeleting || selectedCategoryIds.length === 0}
                        onClick={() => void handleBulkDeleteSelected()}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
                      >
                        {bulkDeleting ? "Deleting..." : "Delete Selected"}
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              </div>
            </PermissionGate>
            
            {loading ? (
              <div className="flex items-center justify-center py-8 sm:py-12 lg:py-16">
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                  <div className="inline-block h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 animate-spin rounded-full border-2 border-solid border-blue-900 border-r-transparent"></div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">Loading categories...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <div
                      key={category._id}
                      className={`bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm sm:shadow-md lg:shadow-lg border border-white/30 dark:border-gray-600/30 p-3 sm:p-4 lg:p-6 hover:shadow-md sm:hover:shadow-lg lg:hover:shadow-xl transition-all duration-300 ${
                        category.isActive ? "" : "opacity-75"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <PermissionGate permission="categories.update">
                              <input
                                type="checkbox"
                                checked={selectedCategoryIds.includes(category._id)}
                                onChange={() => toggleCategorySelection(category._id)}
                                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
                              />
                            </PermissionGate>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl lg:rounded-2xl bg-blue-900 flex items-center justify-center shadow-lg flex-shrink-0">
                              <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-blue-900 dark:text-white truncate">
                                {category.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                                Path: {category.path}
                              </p>
                              {category.parent && categoryById.get(String(category.parent)) && (
                                <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                                  Parent: {categoryById.get(String(category.parent))?.name}
                                </p>
                              )}
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {String(category.path || "")
                                  .split(">")
                                  .map((part) => part.trim())
                                  .filter(Boolean)
                                  .map((part, index) => (
                                    <span
                                      key={`${category._id}-${part}-${index}`}
                                      className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-900/25 dark:text-indigo-300"
                                    >
                                      {part}
                                    </span>
                                  ))}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  category.level === 1 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                  category.level === 2 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                  'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                }`}>
                                  Level {category.level}
                                </span>
                                {category.isActive ? (
                                  <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 text-xs font-medium">
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 text-xs font-medium">
                                    Inactive
                                  </span>
                                )}
                                {category.subCategories && category.subCategories.length > 0 && (
                                  <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 px-2 py-1 text-xs font-medium">
                                    {category.subCategories.length} sub-categor{category.subCategories.length !== 1 ? 'ies' : 'y'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <PermissionGate permission="categories.update">
                            <button
                              type="button"
                              onClick={() => openEditModal(category)}
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 dark:border-blue-800/40 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1-1v2m-7 8l8-8 4 4-8 8H5v-4z" />
                              </svg>
                              Edit
                            </button>
                          </PermissionGate>
                          <PermissionGate permission="categories.delete">
                            <button
                              type="button"
                              onClick={() => setDeleteCategoryTarget(category)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5h6v2m-7 4v6m4-6v6m5-10l-1 12a2 2 0 01-2 2H10a2 2 0 01-2-2L7 7" />
                              </svg>
                              Delete
                            </button>
                          </PermissionGate>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 sm:py-12 lg:py-16">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-blue-900 dark:text-white mb-2">
                      No categories found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
                      {searchTerm
                        ? "No categories match your current search criteria."
                        : "No product categories have been created yet."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white/95 p-5 shadow-2xl dark:border-gray-700/30 dark:bg-gray-800/95">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-blue-900 dark:text-white">Create Product Category</h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Add a new main/sub/sub-sub category for product mapping.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-blue-900 dark:text-blue-100">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Waterproofing Compounds"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-blue-900 dark:text-blue-100">
                    Category Level
                  </label>
                  <select
                    value={newCategoryLevel}
                    onChange={(e) => {
                      const lv = Number(e.target.value) as 1 | 2 | 3;
                      setNewCategoryLevel(lv);
                      setNewCategoryParent("");
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                  >
                    <option value={1}>Level 1 - Main Category</option>
                    <option value={2}>Level 2 - Sub Category</option>
                    <option value={3}>Level 3 - Sub-Sub Category</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-blue-900 dark:text-blue-100">
                    Parent Category
                  </label>
                  <select
                    value={newCategoryParent}
                    onChange={(e) => setNewCategoryParent(e.target.value)}
                    disabled={newCategoryLevel === 1}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-700/50"
                  >
                    <option value="">
                      {newCategoryLevel === 1 ? "No parent required" : "Select parent category"}
                    </option>
                    {parentOptions.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {newCategoryLevel === 1 && (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-blue-900 dark:text-blue-100">
                      Subcategories (optional)
                    </label>
                    <textarea
                      value={newSubCategoriesText}
                      onChange={(e) => setNewSubCategoriesText(e.target.value)}
                      rows={3}
                      placeholder={"Comma or new-line separated, e.g.\nTile Adhesives, Tile Grouts, Sealants"}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCategory}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingCategory ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                      Creating...
                    </>
                  ) : (
                    "Create Category"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-white/95 p-5 shadow-2xl dark:border-gray-700/30 dark:bg-gray-800/95">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-blue-900 dark:text-white">Edit Product Category</h3>
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Update category details and hierarchy mapping.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditForm();
                  }}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-blue-900 dark:text-blue-100">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    placeholder="e.g. Waterproofing Compounds"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-blue-900 dark:text-blue-100">
                    Category Level
                  </label>
                  <select
                    value={editCategoryLevel}
                    onChange={(e) => {
                      const lv = Number(e.target.value) as 1 | 2 | 3;
                      setEditCategoryLevel(lv);
                      setEditCategoryParent("");
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                  >
                    <option value={1}>Level 1 - Main Category</option>
                    <option value={2}>Level 2 - Sub Category</option>
                    <option value={3}>Level 3 - Sub-Sub Category</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-blue-900 dark:text-blue-100">
                    Parent Category
                  </label>
                  <select
                    value={editCategoryParent}
                    onChange={(e) => setEditCategoryParent(e.target.value)}
                    disabled={editCategoryLevel === 1}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-700/50"
                  >
                    <option value="">
                      {editCategoryLevel === 1 ? "No parent required" : "Select parent category"}
                    </option>
                    {editParentOptions.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {editCategoryLevel === 1 && (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-blue-900 dark:text-blue-100">
                      Subcategories
                    </label>
                    <textarea
                      value={editSubCategoriesText}
                      onChange={(e) => setEditSubCategoriesText(e.target.value)}
                      rows={3}
                      placeholder={"Comma or new-line separated, e.g.\nTile Adhesives, Tile Grouts, Sealants"}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 dark:border-blue-900/30 dark:bg-blue-900/10">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Products In This Category
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-700 dark:text-blue-300">
                          {loadingEditCategoryProducts
                            ? "Loading..."
                            : `${editCategoryProducts.length} product${editCategoryProducts.length !== 1 ? "s" : ""}`}
                        </span>
                        {editCategoryLevel === 1 ? (
                          <>
                            <select
                              value={moveTargetMainCategory}
                              onChange={(e) => setMoveTargetMainCategory(e.target.value)}
                              className="min-w-[190px] rounded-lg border border-blue-200 bg-white px-2 py-1 text-[11px] text-blue-900 dark:border-blue-700 dark:bg-gray-800 dark:text-blue-100"
                            >
                              <option value="">Move selected to...</option>
                              {moveMainCategoryOptions.map((cat) => (
                                <option key={cat._id} value={cat.name}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => void handleMoveMappedProductsToMainCategory()}
                              disabled={
                                movingMappedProducts ||
                                selectedMappedProductIds.length === 0 ||
                                !String(moveTargetMainCategory || "").trim()
                              }
                              className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300"
                            >
                              {movingMappedProducts
                                ? "Moving..."
                                : `Move Selected (${selectedMappedProductIds.length})`}
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleRemoveMappedProducts(selectedMappedProductIds)}
                            disabled={removingMappedProducts || selectedMappedProductIds.length === 0}
                            className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
                          >
                            {removingMappedProducts
                              ? "Removing..."
                              : `Remove Selected (${selectedMappedProductIds.length})`}
                          </button>
                        )}
                      </div>
                    </div>
                    {editCategoryLevel === 1 && (
                      <p className="mb-2 text-[11px] text-blue-700 dark:text-blue-300">
                        Safe action: move selected products to another main category.
                      </p>
                    )}
                    {loadingEditCategoryProducts ? (
                      <div className="py-2 text-xs text-gray-600 dark:text-gray-300">
                        Loading products mapped to this category...
                      </div>
                    ) : editCategoryProducts.length === 0 ? (
                      <div className="py-2 text-xs text-gray-600 dark:text-gray-300">
                        No products are currently mapped to this category.
                      </div>
                    ) : (
                      <div className="max-h-48 space-y-2 overflow-auto pr-1">
                        {editCategoryProducts.slice(0, 100).map((product) => (
                          <div
                            key={product._id}
                            className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-xs dark:border-blue-900/40 dark:bg-gray-800"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedMappedProductIds.includes(product._id)}
                                  onChange={() => toggleMappedProductSelection(product._id)}
                                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-600 disabled:cursor-not-allowed"
                                />
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-blue-900 dark:text-blue-100">{product.name}</p>
                                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                                    SKU: {product.sku || "-"} | Price: PKR {Number(product.price || 0).toLocaleString()}
                                  </p>
                                </div>
                              </label>
                              <button
                                type="button"
                                onClick={() => void handleRemoveMappedProducts([product._id])}
                                disabled={removingMappedProducts || editCategoryLevel === 1}
                                className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                        {editCategoryProducts.length > 100 && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            Showing first 100 products.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditForm();
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateCategory}
                  disabled={updatingCategory}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingCategory ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteCategoryTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-white/95 p-5 shadow-2xl dark:border-gray-700/30 dark:bg-gray-800/95">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-red-700 dark:text-red-400">Delete Category</h3>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete <span className="font-semibold">{deleteCategoryTarget.name}</span>?
                  This action will mark the category inactive.
                </p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
                If this category has active child categories, deletion will be blocked until children are moved or deleted.
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteCategoryTarget(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  disabled={deletingCategory}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCategory}
                  disabled={deletingCategory}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingCategory ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Category"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

