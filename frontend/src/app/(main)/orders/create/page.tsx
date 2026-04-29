"use client";

import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { PermissionGate } from "@/components/Auth/PermissionGate";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/Auth/user-context";
import { getAuthHeaders, handleAuthError } from "@/lib/auth";

interface Customer {
  _id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  assignedManager?: {
    manager_id?: string | { _id?: string };
  };
  assignedManagers?: Array<{
    manager_id?: string | { _id?: string };
  }>;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  unit?: string;
  category: string | {
    mainCategory: string;
    subCategory?: string;
    subSubCategory?: string;
  };
  stock: number;
  sku: string;
  tdsLink?: string;
}

interface Category {
  _id: string;
  name: string;
  type: string;
  parent?: string;
  level: number;
}

interface OrderItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  price: number;
  deliveryCharges: number;
  biltyCharges: number;
  tdsLink?: string;
  selectedCategory?: string; // Category filter for this item
}

/** Aligns with backend `categoryNotificationService` — "&" vs "and", spacing, case. */
function normalizeCategoryName(category: string): string {
  if (!category || typeof category !== "string") return "";
  return category
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\bspeciality\b/g, "specialty")
    .replace(/\s*&\s*/g, " and ")
    .replace(/\s+and\s+/g, " and ")
    .trim();
}

function categoriesMatch(a: string, b: string): boolean {
  const n1 = normalizeCategoryName(a);
  const n2 = normalizeCategoryName(b);
  if (!n1 || !n2) return false;
  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;
  return false;
}

/** Supports `{ mainCategory }` (normal) and legacy `category` as a plain string. */
function filterCustomersForPicker(customers: Customer[], search: string): Customer[] {
  const t = search.toLowerCase().trim();
  if (!t) {
    return [...customers].sort((a, b) =>
      (a.companyName || "").localeCompare(b.companyName || "", undefined, { sensitivity: "base" })
    );
  }
  return customers.filter(
    (c) =>
      (c.companyName || "").toLowerCase().includes(t) ||
      (c.contactName || "").toLowerCase().includes(t) ||
      (c.email || "").toLowerCase().includes(t) ||
      (c.phone && String(c.phone).toLowerCase().includes(t))
  );
}

function getProductMainCategory(product: Product): string | null {
  const c = product.category;
  if (c == null) return null;
  if (typeof c === "string") {
    const s = c.trim();
    return s ? s : null;
  }
  if (typeof c === "object" && c.mainCategory) {
    const s = String(c.mainCategory).trim();
    return s ? s : null;
  }
  return null;
}

/** Match product main category to a dropdown option label (controlled `<select>` needs exact option values). */
function resolveCategoryOptionForProduct(product: Product, options: string[]): string {
  const main = getProductMainCategory(product);
  if (!main) return "";
  if (options.includes(main)) return main;
  const matched = options.find((o) => categoriesMatch(o, main));
  return matched ?? main;
}

/** Search full product pool by name / SKU / description (same rules as order line search). */
function filterProductsBySearchQuery(query: string, pool: Product[]): Product[] {
  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return [];
  return pool.filter((product) => {
    const nameMatch = product.name?.toLowerCase().includes(searchTerm);
    const skuMatch = String(product.sku || "")
      .toLowerCase()
      .includes(searchTerm);
    const descMatch = (product.description || "").toLowerCase().includes(searchTerm);
    return nameMatch || skuMatch || descMatch;
  });
}

/**
 * When the user types in Product Name (not only when clicking the list), pick a product if unambiguous:
 * exact name, exact SKU, or a single substring match (min length 2).
 */
function pickProductFromSearchMatches(candidates: Product[], rawQuery: string): Product | null {
  const q = rawQuery.trim();
  if (!q || candidates.length === 0) return null;
  const qLower = q.toLowerCase();

  const exactName = candidates.find((p) => (p.name || "").trim().toLowerCase() === qLower);
  if (exactName) return exactName;

  const exactSku = candidates.find(
    (p) => String(p.sku || "").trim().toLowerCase() === qLower
  );
  if (exactSku) return exactSku;

  if (candidates.length === 1 && q.length >= 2) return candidates[0];

  return null;
}

/** One label per semantic category: merged manager + product lists used to add duplicates like "&" vs "and". */
function dedupeCategoryDropdownLabels(
  merged: string[],
  productDerived: string[]
): string[] {
  const groups = new Map<string, string[]>();
  for (const label of merged) {
    const key = normalizeCategoryName(label);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    if (!list.includes(label)) list.push(label);
    groups.set(key, list);
  }

  const out: string[] = [];
  for (const variants of groups.values()) {
    let chosen: string | undefined;
    for (const p of productDerived) {
      if (variants.some((v) => categoriesMatch(v, p))) {
        chosen = p;
        break;
      }
    }
    out.push(
      chosen ??
        variants.slice().sort((a, b) => a.localeCompare(b))[0]
    );
  }
  return out.sort((a, b) => a.localeCompare(b));
}

export default function CreateOrderPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [managerProfile, setManagerProfile] = useState<any>(null);
  const [customerAssignedManagers, setCustomerAssignedManagers] = useState<any[]>([]);
  const [customerManagerCategories, setCustomerManagerCategories] = useState<string[]>([]);
  const [customerManagerDetails, setCustomerManagerDetails] = useState<any[]>([]); // Store manager details for display
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [customerNotFound, setCustomerNotFound] = useState(false);
  const [savingTdsLinks, setSavingTdsLinks] = useState<Set<string>>(new Set());
  const [productSearchTerms, setProductSearchTerms] = useState<{ [key: number]: string }>({});
  const [productSearchOpen, setProductSearchOpen] = useState<{ [key: number]: boolean }>({});
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [isCategoryChanging, setIsCategoryChanging] = useState<{ [key: number]: boolean }>({});
  const [orderAttachmentFile, setOrderAttachmentFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    customer: "",
    items: [] as OrderItem[],
    notes: "",
  });
  const [customerStats, setCustomerStats] = useState<{
    totalOrders: number;
    orderStatuses: { [key: string]: number };
    outstandingBalance: number;
    loading: boolean;
  }>({
    totalOrders: 0,
    orderStatuses: {},
    outstandingBalance: 0,
    loading: true
  });
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const customerBootstrapAttemptedRef = useRef(false);
  const categoryProductsCacheRef = useRef<Record<string, Product[]>>({});
  const categoryFetchInFlightRef = useRef<Set<string>>(new Set());
  const formDataRef = useRef(formData);
  formDataRef.current = formData;
  const calculateItemTotal = (item: Pick<OrderItem, "quantity" | "unitPrice" | "deliveryCharges" | "biltyCharges">) => {
    const qty = Math.max(1, Number(item.quantity || 1));
    const unit = Math.max(0, Number(item.unitPrice || 0));
    const delivery = Math.max(0, Number(item.deliveryCharges || 0));
    const bilty = Math.max(0, Number(item.biltyCharges || 0));
    return qty * unit + delivery + bilty;
  };

  const productSearchResolveTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    return () => {
      Object.values(productSearchResolveTimersRef.current).forEach((id) => clearTimeout(id));
    };
  }, []);
  const roleNames = (user?.roles || [])
    .map((r: any) => {
      if (typeof r === "string") return r.toLowerCase();
      if (r && typeof r === "object") return String(r.name || r.role || "").toLowerCase();
      return "";
    })
    .filter(Boolean);
  const userRoleName = String(user?.role || "").toLowerCase();
  const isSuperAdminUser =
    !!user?.isSuperAdmin ||
    userRoleName === "super admin" ||
    userRoleName === "super_admin" ||
    userRoleName === "superadmin" ||
    roleNames.includes("super admin") ||
    roleNames.includes("super_admin") ||
    roleNames.includes("superadmin");
  const isCompanyAdminUser =
    !isSuperAdminUser &&
    (Boolean(user?.isCompanyAdmin) ||
      userRoleName === "company admin" ||
      userRoleName === "company_admin" ||
      userRoleName === "companyadmin" ||
      roleNames.includes("company admin") ||
      roleNames.includes("company_admin") ||
      roleNames.includes("companyadmin"));
  const isCustomerSession =
    !!(
      user?.isCustomer ||
      user?.userType === "customer" ||
      String(user?.role || "").toLowerCase() === "customer"
    );
  const isManagerSession =
    !isCustomerSession &&
    !isCompanyAdminUser &&
    !isSuperAdminUser &&
    Boolean(user?.isManager);
  const canEditUnitPrice = !isCustomerSession;

  // Prefetch neighbor route to reduce transition latency.
  useEffect(() => {
    router.prefetch('/orders');
  }, [router]);

  const visibleCustomersForCurrentUser = useMemo(() => {
    if (!isManagerSession) return customers;

    const managerIdCandidates = new Set<string>();
    const addCandidate = (value: unknown) => {
      const id = String(value || "").trim();
      if (id) managerIdCandidates.add(id);
    };

    addCandidate((user as any)?._id);
    addCandidate((user as any)?.id);
    addCandidate((user as any)?.managerProfile?.manager_id);

    if (managerIdCandidates.size === 0) return [];

    return customers.filter((customer) => {
      const assignedIds = new Set<string>();
      const addAssignedId = (value: unknown) => {
        const id = String(value || "").trim();
        if (id) assignedIds.add(id);
      };

      addAssignedId((customer as any)?.assignedManager?.manager_id);
      addAssignedId((customer as any)?.assignedManager?.manager_id?._id);

      if (Array.isArray((customer as any)?.assignedManagers)) {
        (customer as any).assignedManagers.forEach((entry: any) => {
          addAssignedId(entry?.manager_id);
          addAssignedId(entry?.manager_id?._id);
        });
      }

      for (const managerId of managerIdCandidates) {
        if (assignedIds.has(managerId)) return true;
      }
      return false;
    });
  }, [customers, isManagerSession, user]);

  const customerPickerMatches = useMemo(
    () => filterCustomersForPicker(visibleCustomersForCurrentUser, customerSearchTerm),
    [visibleCustomersForCurrentUser, customerSearchTerm]
  );

  // Get products for display - show ALL products to keep catalog complete and selectable.
  const getFilteredProducts = () => {
    return products;
  };

  const mergeUniqueProducts = (existing: Product[], incoming: Product[]): Product[] => {
    if (incoming.length === 0) return existing;
    const merged = [...existing, ...incoming];
    const seen = new Set<string>();
    return merged.filter((product) => {
      const id = String(product._id || "");
      if (!id) return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };

  const getCategoryVariants = (selectedCategory: string): string[] => {
    const raw = String(selectedCategory || "").trim();
    if (!raw) return [];
    const variants = new Set<string>([raw]);
    if (/\band\b/i.test(raw)) {
      variants.add(raw.replace(/\band\b/gi, "&"));
    }
    if (raw.includes("&")) {
      variants.add(raw.replace(/\s*&\s*/g, " and "));
    }
    return Array.from(variants).map((v) => v.replace(/\s+/g, " ").trim()).filter(Boolean);
  };

  const fetchProductsByExactMainCategory = async (mainCategory: string): Promise<Product[]> => {
    const pageSize = 200;
    const firstRes = await fetch(
      `/api/products?limit=${pageSize}&page=1&meta=1&mainCategory=${encodeURIComponent(mainCategory)}`,
      { headers: getAuthHeaders() }
    );
    if (!firstRes.ok) return [];
    const firstRaw: unknown = await firstRes.json();
    const firstBody = Array.isArray(firstRaw)
      ? { products: firstRaw as Product[], pagination: { totalPages: 1 } }
      : (firstRaw as { products?: Product[]; pagination?: { totalPages?: number } });
    const merged = [...(firstBody.products || [])];
    const totalPages = Math.max(1, Number(firstBody.pagination?.totalPages || 1));
    for (let page = 2; page <= totalPages; page++) {
      const res = await fetch(
        `/api/products?limit=${pageSize}&page=${page}&meta=1&mainCategory=${encodeURIComponent(mainCategory)}`,
        { headers: getAuthHeaders() }
      );
      if (!res.ok) break;
      const raw: unknown = await res.json();
      const body = Array.isArray(raw)
        ? { products: raw as Product[] }
        : (raw as { products?: Product[] });
      const chunk = body.products || [];
      if (chunk.length === 0) break;
      merged.push(...chunk);
    }
    return mergeUniqueProducts([], merged);
  };

  const ensureCategoryProductsLoaded = async (selectedCategory?: string) => {
    const key = normalizeCategoryName(String(selectedCategory || ""));
    if (!key) return;
    if (categoryProductsCacheRef.current[key]) return;
    if (categoryFetchInFlightRef.current.has(key)) return;

    categoryFetchInFlightRef.current.add(key);
    try {
      const variants = getCategoryVariants(String(selectedCategory || ""));
      let fetchedProducts: Product[] = [];

      for (const variant of variants) {
        const chunk = await fetchProductsByExactMainCategory(variant);
        if (chunk.length > 0) {
          fetchedProducts = mergeUniqueProducts(fetchedProducts, chunk);
        }
      }

      // If exact category queries return nothing, keep client-side fallback filtering available.
      categoryProductsCacheRef.current[key] = fetchedProducts;
      setProducts((prev) => mergeUniqueProducts(prev, fetchedProducts));
    } catch (error) {
      console.warn("Category-specific product fetch failed:", error);
    } finally {
      categoryFetchInFlightRef.current.delete(key);
    }
  };

  // Filter products by category for a specific item
  // Category structure: { mainCategory: string, subCategory?: string, subSubCategory?: string }
  const getProductsByCategory = (selectedCategory?: string) => {
    const baseProducts = getFilteredProducts();
    
    if (!selectedCategory || selectedCategory === '') {
      return baseProducts;
    }

    const key = normalizeCategoryName(String(selectedCategory));
    const cached = categoryProductsCacheRef.current[key];

    /** DB string on products vs dropdown label can differ; API uses exact mainCategory match. */
    const fromClient = baseProducts.filter((product) => {
      const mainCategory = getProductMainCategory(product);
      if (!mainCategory) return false;
      return categoriesMatch(mainCategory, selectedCategory);
    });

    if (cached && cached.length > 0) {
      const byId = new Map<string, Product>();
      for (const p of cached) {
        const id = String(p._id || "");
        if (id) byId.set(id, p);
      }
      for (const p of fromClient) {
        const id = String(p._id || "");
        if (id && !byId.has(id)) byId.set(id, p);
      }
      return Array.from(byId.values());
    }

    return fromClient;
  };

  // Get unique categories from products
  // Category structure: { mainCategory: string, subCategory?: string, subSubCategory?: string }
  const getUniqueCategories = (): string[] => {
    const categorySet = new Set<string>();
    const baseProducts = getFilteredProducts();

    baseProducts.forEach(product => {
      const main = getProductMainCategory(product);
      if (main) categorySet.add(main);
    });

    return Array.from(categorySet).sort();
  };

  /**
   * Categories shown in the Order Items "Category" dropdown.
   * For customers, keep this strict to assigned manager categories only.
   * For non-customers, merge manager/profile categories with product-derived categories.
   */
  const getCategoryOptionsForDropdown = (): string[] => {
    const fromProducts = getUniqueCategories();

    if (user?.userType === "customer" || user?.isCustomer) {
      if (customerManagerCategories.length > 0) {
        return dedupeCategoryDropdownLabels(
          [...customerManagerCategories],
          fromProducts
        );
      }
      return fromProducts;
    }

    if (managerProfile?.assignedCategories?.length) {
      const fromManager = managerProfile.assignedCategories
        .map((cat: unknown) =>
          typeof cat === "string" ? cat : (cat as { category?: string; name?: string }).category || (cat as { name?: string }).name || ""
        )
        .filter(Boolean) as string[];
      return dedupeCategoryDropdownLabels([...fromManager, ...fromProducts], fromProducts);
    }

    return fromProducts;
  };

  // Filter products by search term (searches name, SKU, and description)
  const getFilteredProductsBySearch = (itemIndex: number, category?: string) => {
    const baseProducts = getProductsByCategory(category);
    const searchTerm = (productSearchTerms[itemIndex] || '').toLowerCase().trim();
    
    if (!searchTerm) {
      return baseProducts;
    }

    return baseProducts.filter(product => {
      const nameMatch = product.name?.toLowerCase().includes(searchTerm);
      const skuMatch = product.sku?.toLowerCase().includes(searchTerm);
      const descMatch = product.description?.toLowerCase().includes(searchTerm);
      
      return nameMatch || skuMatch || descMatch;
    });
  };

  // Fetch customers, products, categories, and manager profile
  const fetchData = async () => {
    try {
      setLoading(true);
      setCustomersLoading(true);
      setProductsLoading(true);
      const isCustomerUser = isCustomerSession;

      // Customer flow doesn't need full customer directory (very heavy), keep it instant.
      const customersPromise = isCustomerUser
        ? Promise.resolve().then(() => {
            setCustomers([]);
            setCustomersLoading(false);
          })
        : (async () => {
            // Progressive customer loading: first page renders quickly, remaining pages fill in.
            const pageSize = 200;
            const firstRes = await fetch(`/api/customers?limit=${pageSize}&page=1`, {
              headers: getAuthHeaders(),
            });
            if (!firstRes.ok) {
              if (handleAuthError(firstRes.status, "Please log in to view customers")) {
                setCustomers([]);
                return;
              }
              throw new Error(`Customers first page failed: ${firstRes.status}`);
            }

            const firstRaw: unknown = await firstRes.json();
            const firstBody = Array.isArray(firstRaw)
              ? { customers: firstRaw as Customer[], totalPages: 1, total: (firstRaw as Customer[]).length }
              : (firstRaw as { customers?: Customer[]; totalPages?: number; total?: number });
            const firstChunk = firstBody.customers || [];
            const totalPages = Math.max(1, Number(firstBody.totalPages || 1));
            const totalCount = Number(firstBody.total || 0);

            setCustomers(firstChunk);
            setCustomersLoading(false);

            if (totalPages > 1 && firstChunk.length < totalCount) {
              void (async () => {
                try {
                  const merged = [...firstChunk];
                  for (let page = 2; page <= totalPages; page++) {
                    const res = await fetch(`/api/customers?limit=${pageSize}&page=${page}`, {
                      headers: getAuthHeaders(),
                    });
                    if (!res.ok) break;
                    const raw: unknown = await res.json();
                    const body = Array.isArray(raw)
                      ? { customers: raw as Customer[] }
                      : (raw as { customers?: Customer[] });
                    const chunk = body.customers || [];
                    if (chunk.length === 0) break;
                    merged.push(...chunk);
                    const seen = new Set<string>();
                    const deduped = merged.filter((c) => {
                      const id = String(c._id);
                      if (seen.has(id)) return false;
                      seen.add(id);
                      return true;
                    });
                    setCustomers(deduped);
                    if (typeof totalCount === "number" && totalCount > 0 && deduped.length >= totalCount) {
                      break;
                    }
                  }
                } catch (error) {
                  console.warn("Background customers fetch failed:", error);
                }
              })();
            }
          })()
            .catch((error) => {
              console.error("Error loading customers:", error);
              setCustomers([]);
            })
            .finally(() => setCustomersLoading(false));

      // Progressive product loading: first page fast, remaining pages in background.
      const productsPromise = (async () => {
        const pageSize = 200;
        const firstRes = await fetch(`/api/products?limit=${pageSize}&page=1&meta=1`, {
          headers: getAuthHeaders(),
        });
        if (!firstRes.ok) {
          throw new Error(`Products first page failed: ${firstRes.status}`);
        }
        const firstRaw: unknown = await firstRes.json();
        const firstBody = Array.isArray(firstRaw)
          ? { products: firstRaw as Product[], pagination: { totalPages: 1 } }
          : (firstRaw as { products?: Product[]; pagination?: { totalPages?: number } });
        const firstChunk = firstBody.products || [];
        const totalPages = Math.max(1, Number(firstBody.pagination?.totalPages || 1));

        setProducts(firstChunk);
        setProductsLoading(false);

        if (totalPages > 1) {
          void (async () => {
            try {
              const merged = [...firstChunk];
              for (let page = 2; page <= totalPages; page++) {
                const res = await fetch(`/api/products?limit=${pageSize}&page=${page}&meta=1`, {
                  headers: getAuthHeaders(),
                });
                if (!res.ok) break;
                const raw: unknown = await res.json();
                const body = Array.isArray(raw)
                  ? { products: raw as Product[] }
                  : (raw as { products?: Product[] });
                const chunk = body.products || [];
                if (chunk.length === 0) break;
                merged.push(...chunk);
                const seen = new Set<string>();
                const deduped = merged.filter((p) => {
                  const id = String(p._id);
                  if (seen.has(id)) return false;
                  seen.add(id);
                  return true;
                });
                setProducts(deduped);
              }
            } catch (error) {
              console.warn("Background products fetch failed:", error);
            }
          })();
        }
      })()
        .catch((error) => {
          console.error("Error loading products:", error);
          setProducts([]);
        })
        .finally(() => setProductsLoading(false));

      const categoriesPromise = fetch('/api/products/categories', {
        headers: getAuthHeaders(),
      }).then(async (categoriesRes) => {
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData.categories || [];
          setCategories(categories);
        } else {
          setCategories([]);
        }
      }).catch((error) => {
        console.error("Error loading categories:", error);
        setCategories([]);
      });

      const shouldFetchManagerProfile =
        !isCustomerUser &&
        !!user?.isManager &&
        !isCompanyAdminUser &&
        !isSuperAdminUser;
      const managerPromise = shouldFetchManagerProfile
        ? fetch('/api/managers/profile', {
            headers: getAuthHeaders(),
          }).then(async (managerRes) => {
            if (managerRes.ok) {
              const managerData = await managerRes.json();
              setManagerProfile(managerData.manager || managerData);
            } else {
              setManagerProfile(null);
            }
          }).catch((error) => {
            console.error("Error loading manager profile:", error);
            setManagerProfile(null);
          })
        : Promise.resolve().then(() => setManagerProfile(null));

      await Promise.allSettled([
        customersPromise,
        productsPromise,
        categoriesPromise,
        managerPromise,
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setCustomers([]);
      setProducts([]);
      setCategories([]);
      setManagerProfile(null);
      setCustomersLoading(false);
      setProductsLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoading) {
      return;
    }
    
    if (!user) {
      router.push("/auth/sign-in");
      return;
    }
    
    fetchData();
    
  }, [user, userLoading, router]);

  // Fetch customer's assigned managers and their categories
  const fetchCustomerAssignedManagers = async (customerId: string) => {
    try {
      console.log('👥 Fetching assigned managers for customer:', customerId);
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch customer details which should include assignedManagers
      const customerRes = await fetch(`/api/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (customerRes.ok) {
        const customerData = await customerRes.json();
        console.log('👥 Customer data:', customerData);
        
        const assignedManagersFromArray = Array.isArray(customerData.assignedManagers)
          ? customerData.assignedManagers
          : [];
        const assignedManagersFromSingle =
          customerData.assignedManager?.manager_id
            ? [customerData.assignedManager]
            : [];
        const assignedManagersFromUserProfile =
          (user as any)?.customerProfile?.assignedManager?.manager_id
            ? [
                {
                  manager_id: (user as any).customerProfile.assignedManager.manager_id,
                  assignedBy: (user as any).customerProfile.assignedManager.assignedBy,
                  assignedAt: (user as any).customerProfile.assignedManager.assignedAt,
                  isActive: (user as any).customerProfile.assignedManager.isActive !== false,
                },
              ]
            : [];

        const assignedManagers =
          assignedManagersFromArray.length > 0
            ? assignedManagersFromArray
            : assignedManagersFromSingle.length > 0
            ? assignedManagersFromSingle
            : assignedManagersFromUserProfile;
        setCustomerAssignedManagers(assignedManagers);
        
        if (assignedManagers.length > 0) {
          // Fetch manager details to get their assigned categories
          const managerIds = assignedManagers
            .map((am: any) => am.manager_id)
            .filter(Boolean);
          
          console.log('👥 Manager IDs to fetch:', managerIds);
          
          if (managerIds.length > 0) {
            // Fetch all managers and filter by IDs
            const managersRes = await fetch('/api/managers/all', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (managersRes.ok) {
              const managersData = await managersRes.json();
              const allManagers = Array.isArray(managersData) ? managersData : managersData.managers || [];
              
              // Find managers that match the assigned manager IDs
              const relevantManagers = allManagers.filter((m: any) => 
                managerIds.some((id: any) => {
                  const managerId = typeof id === 'object' && id !== null ? (id._id || id) : id;
                  return String(m._id) === String(managerId) || String(m.user_id) === String(managerId);
                })
              );
              
              console.log('👥 Relevant managers found:', relevantManagers.length);
              
              // Store manager details for display
              setCustomerManagerDetails(relevantManagers);
              
              // Extract all categories from assigned managers
              const allCategories = new Set<string>();
              relevantManagers.forEach((manager: any) => {
                const categories = manager.assignedCategories || [];
                categories.forEach((cat: any) => {
                  const categoryName = typeof cat === 'string' ? cat : (cat.category || cat.name || '');
                  if (categoryName) {
                    allCategories.add(categoryName);
                  }
                });
              });
              
              const categoriesArray = Array.from(allCategories);
              setCustomerManagerCategories(categoriesArray);
              console.log('📦 Customer can order from categories:', categoriesArray);
            }
          } else {
            setCustomerManagerCategories([]);
          }
        } else {
          setCustomerAssignedManagers([]);
          setCustomerManagerCategories([]);
          setCustomerManagerDetails([]);
          console.log('👥 No managers assigned to customer');
        }
      }
    } catch (error) {
      console.error('❌ Error fetching customer assigned managers:', error);
      setCustomerAssignedManagers([]);
      setCustomerManagerCategories([]);
      setCustomerManagerDetails([]);
    }
  };

  // Fetch customer order statistics and outstanding balance
  const fetchCustomerStatistics = async (customerId?: string) => {
    try {
      setCustomerStats(prev => ({ ...prev, loading: true }));
      
      console.log('🔍 Fetching customer statistics...', { customerId, formDataCustomer: formData.customer, userEmail: user?.email });
      
      let totalOrders = 0;
      const orderStatuses: { [key: string]: number } = {};
      let customerIdToUse = customerId || formData.customer;
      
      // Try to get customer ID from dashboard first (optional, fallback to orders)
      try {
        const dashboardRes = await fetch('/api/customers/dashboard', {
          headers: getAuthHeaders(),
        });
        
        console.log('📊 Dashboard API response status:', dashboardRes.status, dashboardRes.statusText);
        
        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json();
          console.log('📊 Dashboard data:', dashboardData);
          
          // Get customer ID from dashboard response
          if (dashboardData.customer?._id) {
            customerIdToUse = dashboardData.customer._id;
            console.log('✅ Customer ID from dashboard:', customerIdToUse);
          }
          
          if (dashboardData.stats) {
            totalOrders = dashboardData.stats.totalOrders || 0;
            console.log('📈 Total orders from stats:', totalOrders);
          }
        } else {
          const errorText = await dashboardRes.text();
          console.warn('⚠️ Dashboard API failed (non-critical):', {
            status: dashboardRes.status,
            statusText: dashboardRes.statusText,
            body: errorText.substring(0, 200) // Limit length
          });
        }
      } catch (dashboardError) {
        console.warn('⚠️ Dashboard API error (non-critical):', dashboardError);
      }
      
      // Always fetch orders directly - this is the primary source of truth
      console.log('📦 Fetching orders directly...');
      try {
        const ordersRes = await fetch('/api/customers/orders?limit=10000&page=1', {
          headers: getAuthHeaders(),
        });
        
        console.log('📦 Orders API response status:', ordersRes.status, ordersRes.statusText);
        console.log('📦 Orders API response ok:', ordersRes.ok);
        console.log('📦 Orders API response headers:', Object.fromEntries(ordersRes.headers.entries()));
        
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          console.log('📦 Orders data response:', {
            isArray: Array.isArray(ordersData),
            hasOrders: !!ordersData.orders,
            ordersLength: ordersData.orders?.length || 0,
            pagination: ordersData.pagination,
            keys: Object.keys(ordersData)
          });
          
          // Handle both array response and object with orders property
          const orders = Array.isArray(ordersData) ? ordersData : (ordersData.orders || []);
          console.log('📦 Orders array length:', orders.length);
          console.log('📦 Orders data sample:', orders.length > 0 ? orders[0] : 'No orders');
          
          // Check pagination for total orders first
          if (ordersData.pagination?.totalOrders !== undefined) {
            totalOrders = ordersData.pagination.totalOrders;
            console.log('📊 Total orders from pagination.totalOrders:', totalOrders);
          } else if (ordersData.pagination?.total !== undefined) {
            totalOrders = ordersData.pagination.total;
            console.log('📊 Total orders from pagination.total:', totalOrders);
          }
          
          if (orders.length > 0) {
            // Count orders by status
            orders.forEach((order: any) => {
              const status = order.status || 'pending';
              orderStatuses[status] = (orderStatuses[status] || 0) + 1;
            });
            
            console.log('📊 Order statuses breakdown:', orderStatuses);
            console.log('📊 Order statuses count:', Object.keys(orderStatuses).length);
            
            // Use actual orders count if pagination total is not available
            if (totalOrders === 0) {
              totalOrders = orders.length;
            }
            
            // Try to get customer ID from first order if not already set
            if (!customerIdToUse) {
              if (orders[0].customer?._id) {
                customerIdToUse = orders[0].customer._id;
                console.log('✅ Customer ID from orders:', customerIdToUse);
              } else if (typeof orders[0].customer === 'string') {
                customerIdToUse = orders[0].customer;
                console.log('✅ Customer ID (string) from orders:', customerIdToUse);
              }
            }
          } else {
            // If we have pagination total but no orders in response, fetch all orders page by page
            if (totalOrders > 0 && orders.length === 0) {
              console.warn('⚠️ Pagination shows', totalOrders, 'orders but 0 returned. Fetching all orders page by page...');
              console.log('📊 Pagination info:', ordersData.pagination);
              
              // Fetch all orders by looping through pages
              try {
                const allOrders: any[] = [];
                const pageSize = 50; // Fetch in smaller chunks
                const totalPages = Math.ceil(totalOrders / pageSize);
                
                console.log(`🔄 Fetching ${totalPages} pages of orders (${pageSize} per page)...`);
                
                for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                  try {
                    const pageRes = await fetch(`/api/customers/orders?limit=${pageSize}&page=${pageNum}`, {
                      headers: getAuthHeaders(),
                    });
                    
                    if (pageRes.ok) {
                      const pageData = await pageRes.json();
                      const pageOrders = Array.isArray(pageData) ? pageData : (pageData.orders || []);
                      console.log(`📦 Page ${pageNum}/${totalPages}: ${pageOrders.length} orders`);
                      
                      if (pageOrders.length > 0) {
                        allOrders.push(...pageOrders);
                      }
                      
                      // If no more orders, break
                      if (pageOrders.length === 0) {
                        console.log(`⚠️ Page ${pageNum} returned 0 orders, stopping...`);
                        break;
                      }
                    } else {
                      console.warn(`⚠️ Page ${pageNum} failed with status ${pageRes.status}`);
                    }
                  } catch (pageError) {
                    console.error(`❌ Error fetching page ${pageNum}:`, pageError);
                  }
                }
                
                console.log(`📦 Total orders collected: ${allOrders.length}`);
                console.log('📦 All orders sample:', allOrders.length > 0 ? allOrders[0] : 'No orders');
                
                if (allOrders.length > 0) {
                  // Count orders by status
                  allOrders.forEach((order: any) => {
                    const status = order.status || 'pending';
                    orderStatuses[status] = (orderStatuses[status] || 0) + 1;
                  });
                  console.log('📊 Order statuses breakdown (all orders):', orderStatuses);
                  console.log('📊 Order statuses count (all orders):', Object.keys(orderStatuses).length);
                  
                  // Update total orders from actual count
                  totalOrders = allOrders.length;
                } else {
                  console.warn('⚠️ Collected 0 orders across all pages');
                }
              } catch (fetchAllError) {
                console.error('❌ Error fetching all orders:', fetchAllError);
              }
            } else {
              console.log('ℹ️ No orders found in response and no pagination total');
            }
          }
        } else {
          // Try to get error text
          let errorText = '';
          try {
            errorText = await ordersRes.text();
            console.log('📦 Error text length:', errorText.length);
          } catch (textError) {
            console.error('❌ Could not read error text:', textError);
            errorText = 'Could not read error response';
          }
          
          const errorDetails = {
            status: ordersRes.status,
            statusText: ordersRes.statusText,
            body: errorText ? errorText.substring(0, 500) : 'No error body',
            bodyLength: errorText.length
          };
          console.error('❌ Failed to fetch orders:', errorDetails);
          
          // Try to parse error as JSON
          let errorData;
          if (errorText) {
            try {
              errorData = JSON.parse(errorText);
              console.error('❌ Orders error details:', errorData);
            } catch (e) {
              // Not JSON, already logged as text
              errorData = { message: errorText || 'Unknown error' };
              console.error('❌ Orders error (not JSON):', errorText);
            }
          } else {
            errorData = { message: 'No error message received' };
          }
          
          // Show user-friendly error message
          if (ordersRes.status === 404) {
            console.warn('⚠️ Customer not found - orders will show as 0');
            // Continue with empty orders - this is expected if customer doesn't exist yet
          } else if (ordersRes.status === 401) {
            console.error('❌ Authentication failed - user needs to login');
          } else if (ordersRes.status === 500) {
            console.error('❌ Server error fetching orders:', errorData);
          } else {
            console.error('❌ Unexpected error fetching orders:', errorData);
          }
        }
      } catch (fetchError) {
        console.error('❌ Network error fetching orders:', fetchError);
        console.error('❌ Error details:', {
          message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
          stack: fetchError instanceof Error ? fetchError.stack : undefined
        });
      }
      
      // Fetch customer ledger for outstanding balance
      let outstandingBalance = 0;
      if (customerIdToUse) {
        try {
          console.log('💰 Fetching ledger for customer:', customerIdToUse);
          const ledgerRes = await fetch(`/api/customer-ledger/${customerIdToUse}/ledger`, {
            headers: getAuthHeaders(),
          });
          
          console.log('💰 Ledger API response status:', ledgerRes.status);
          
          if (ledgerRes.ok) {
            const ledgerData = await ledgerRes.json();
            console.log('💰 Ledger data:', ledgerData);
            
            // Check different possible response structures
            if (ledgerData.data?.ledger?.currentBalance !== undefined) {
              outstandingBalance = ledgerData.data.ledger.currentBalance;
            } else if (ledgerData.ledger?.currentBalance !== undefined) {
              outstandingBalance = ledgerData.ledger.currentBalance;
            } else if (ledgerData.data?.currentBalance !== undefined) {
              outstandingBalance = ledgerData.data.currentBalance;
            } else if (ledgerData.currentBalance !== undefined) {
              outstandingBalance = ledgerData.currentBalance;
            } else if (ledgerData.data?.data?.ledger?.currentBalance !== undefined) {
              outstandingBalance = ledgerData.data.data.ledger.currentBalance;
            }
            
            console.log('💰 Outstanding balance:', outstandingBalance);
          } else {
            const errorText = await ledgerRes.text().catch(() => '');
            let errorData = {};
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: errorText || 'Failed to fetch ledger' };
            }
            
            console.error('❌ Failed to fetch ledger:', {
              status: ledgerRes.status,
              statusText: ledgerRes.statusText,
              error: errorData
            });
            
            // If ledger doesn't exist yet (404), that's okay - balance is 0
            if (ledgerRes.status === 404) {
              console.log('ℹ️ Ledger not found yet (will be created when invoice is generated), using balance 0');
              outstandingBalance = 0;
            }
          }
        } catch (error) {
          console.error('❌ Error fetching customer ledger:', error);
        }
      } else {
        console.warn('⚠️ No customer ID available for ledger fetch');
      }
      
      console.log('✅ Final stats:', { totalOrders, orderStatuses, outstandingBalance });
      
      setCustomerStats({
        totalOrders,
        orderStatuses,
        outstandingBalance,
        loading: false
      });
    } catch (error) {
      console.error('❌ Error fetching customer statistics:', error);
      setCustomerStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Close product / customer search dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".product-search-container")) {
        setProductSearchOpen({});
      }
      if (!target.closest(".customer-search-container")) {
        setCustomerSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Keep search field label in sync when customer id is set (e.g. after data loads)
  useEffect(() => {
    if (user?.isCustomer || !formData.customer) return;
    const c = customers.find((x) => x._id === formData.customer);
    if (c) {
      setCustomerSearchTerm(`${c.companyName} - ${c.contactName}`);
    }
  }, [formData.customer, customers, user?.isCustomer]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Loading timeout - forcing loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  // Auto-select customer when customer user is logged in (run once per session).
  useEffect(() => {
    if (!isCustomerSession || formData.customer || customerBootstrapAttemptedRef.current) return;
    customerBootstrapAttemptedRef.current = true;

    if (user?.customerProfile?.customer_id) {
      const customerId = String(user.customerProfile.customer_id);
      setFormData((prev) => ({ ...prev, customer: customerId }));
      setCustomerNotFound(false);
      return;
    }

    const bootstrapCustomer = async () => {
      try {
        const response = await fetch('/api/customers/dashboard', {
          headers: getAuthHeaders(),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.customer?._id) {
            const customerId = data.customer._id;
            setFormData((prev) => ({ ...prev, customer: customerId }));
            setCustomerNotFound(false);
            return;
          }
        }
      } catch (error) {
        console.error('❌ Error bootstrapping customer profile:', error);
      }
      setCustomerNotFound(true);
    };

    void bootstrapCustomer();
  }, [isCustomerSession, formData.customer, user?.customerProfile?.customer_id]);

  // Refetch statistics and managers when customer changes
  useEffect(() => {
    if (formData.customer) {
      const t = setTimeout(() => {
        if (isCustomerSession) {
          void fetchCustomerStatistics(formData.customer);
        }
        void fetchCustomerAssignedManagers(formData.customer);
      }, 150);
      return () => clearTimeout(t);
    } else {
      // Clear managers when no customer selected
      setCustomerAssignedManagers([]);
      setCustomerManagerCategories([]);
      setCustomerManagerDetails([]);
    }
  }, [formData.customer, isCustomerSession]);

  // Add item to order
  const addItem = () => {
    const filteredProducts = getFilteredProducts();
    if (filteredProducts.length > 0) {
      const newIndex = formData.items.length;
      const firstProduct = filteredProducts[0];
      const categoryOptions = getCategoryOptionsForDropdown();
      const initialCategory = resolveCategoryOptionForProduct(firstProduct, categoryOptions);
      if (initialCategory) {
        void ensureCategoryProductsLoaded(initialCategory);
      }
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { 
          product: firstProduct, 
          quantity: 1, 
          unitPrice: firstProduct?.price || 0,
          price: firstProduct?.price || 0,
          deliveryCharges: 0,
          biltyCharges: 0,
          tdsLink: "",
          selectedCategory: initialCategory
        }]
      }));
      // Initialize search term as empty - user can type to search
      setProductSearchTerms(prev => ({ ...prev, [newIndex]: '' }));
    }
  };

  // Remove item from order
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    // Clean up search terms and open state for removed item
    setProductSearchTerms(prev => {
      const newTerms = { ...prev };
      delete newTerms[index];
      // Re-index remaining items
      const reindexed: { [key: number]: string } = {};
      Object.keys(newTerms).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = newTerms[oldIndex];
        } else if (oldIndex < index) {
          reindexed[oldIndex] = newTerms[oldIndex];
        }
      });
      return reindexed;
    });
    setProductSearchOpen(prev => {
      const newOpen = { ...prev };
      delete newOpen[index];
      // Re-index remaining items
      const reindexed: { [key: number]: boolean } = {};
      Object.keys(newOpen).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = newOpen[oldIndex];
        } else if (oldIndex < index) {
          reindexed[oldIndex] = newOpen[oldIndex];
        }
      });
      return reindexed;
    });
  };

  // Update item
  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    if (field === "product") {
      const categoryOptions = getCategoryOptionsForDropdown();
      const nextSelectedCategory = resolveCategoryOptionForProduct(value, categoryOptions);
      if (nextSelectedCategory) {
        void ensureCategoryProductsLoaded(nextSelectedCategory);
      }
      if (!isCategoryChanging[index]) {
        setProductSearchTerms((prev) => ({ ...prev, [index]: value.name }));
      }
      setProductSearchOpen((prev) => ({ ...prev, [index]: false }));
      setFormData((prev) => ({
        ...prev,
        items: prev.items.map((item, i) => {
          if (i !== index) return item;
          return {
            ...item,
            product: value,
            unitPrice: value.price,
            price: calculateItemTotal({
              quantity: item.quantity,
              unitPrice: Number(value.price || 0),
              deliveryCharges: item.deliveryCharges,
              biltyCharges: item.biltyCharges,
            }),
            tdsLink: value.tdsLink || item.tdsLink || "",
            selectedCategory: nextSelectedCategory || item.selectedCategory || "",
          };
        }),
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          if (field === 'quantity') {
            const nextQuantity = Math.max(1, Number(value || 1));
            const unitPrice = Number(item.unitPrice ?? item.product.price ?? 0);
            return {
              ...item,
              quantity: nextQuantity,
              price: calculateItemTotal({
                quantity: nextQuantity,
                unitPrice,
                deliveryCharges: item.deliveryCharges,
                biltyCharges: item.biltyCharges,
              }),
            };
          } else if (field === 'unitPrice') {
            const nextUnitPrice = Math.max(0, Number(value || 0));
            const nextQuantity = Math.max(1, Number(item.quantity || 1));
            return {
              ...item,
              unitPrice: nextUnitPrice,
              price: calculateItemTotal({
                quantity: nextQuantity,
                unitPrice: nextUnitPrice,
                deliveryCharges: item.deliveryCharges,
                biltyCharges: item.biltyCharges,
              }),
            };
          } else if (field === 'deliveryCharges') {
            const nextDeliveryCharges = Math.max(0, Number(value || 0));
            return {
              ...item,
              deliveryCharges: nextDeliveryCharges,
              price: calculateItemTotal({
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                deliveryCharges: nextDeliveryCharges,
                biltyCharges: item.biltyCharges,
              }),
            };
          } else if (field === 'biltyCharges') {
            const nextBiltyCharges = Math.max(0, Number(value || 0));
            return {
              ...item,
              biltyCharges: nextBiltyCharges,
              price: calculateItemTotal({
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                deliveryCharges: item.deliveryCharges,
                biltyCharges: nextBiltyCharges,
              }),
            };
          } else if (field === 'tdsLink') {
            // When TDS link changes, save it to the product in database in real-time (debounced)
            if (item.product._id) {
              debouncedSaveTdsLink(item.product._id, value);
            }
            return { ...item, [field]: value };
          } else if (field === 'selectedCategory') {
            void ensureCategoryProductsLoaded(String(value || ""));
            // Set flag to prevent search term from being set during category change
            setIsCategoryChanging(prev => ({ ...prev, [index]: true }));
            
            // When category changes, check if current product is still in the filtered list
            const filteredProducts = getProductsByCategory(value);
            const currentProductInFilter = filteredProducts.some(p => p._id === item.product._id);
            
            // Always clear search term when category changes - let user search fresh
            setProductSearchTerms(prev => ({ ...prev, [index]: '' }));
            
            // If current product is not in the new category filter, reset to first product or empty
            if (!currentProductInFilter && filteredProducts.length > 0) {
              const firstProduct = filteredProducts[0];
              // Don't pre-fill search term - let user search
              // Clear the flag after a short delay to allow product update
              setTimeout(() => {
                setIsCategoryChanging(prev => {
                  const newState = { ...prev };
                  delete newState[index];
                  return newState;
                });
              }, 100);
              
              return {
                ...item,
                selectedCategory: value,
                product: firstProduct,
                unitPrice: firstProduct.price,
                deliveryCharges: item.deliveryCharges || 0,
                biltyCharges: item.biltyCharges || 0,
                price: calculateItemTotal({
                  quantity: 1,
                  unitPrice: firstProduct.price,
                  deliveryCharges: item.deliveryCharges || 0,
                  biltyCharges: item.biltyCharges || 0,
                }),
                quantity: 1,
                tdsLink: firstProduct.tdsLink || ""
              };
            } else if (!currentProductInFilter && filteredProducts.length === 0) {
              // No products in this category, keep category but reset product
              setIsCategoryChanging(prev => {
                const newState = { ...prev };
                delete newState[index];
                return newState;
              });
              setProductSearchTerms(prev => ({ ...prev, [index]: '' }));
              return { ...item, selectedCategory: value };
            }
            
            // If current product is still valid, just update category and clear search
            setIsCategoryChanging(prev => {
              const newState = { ...prev };
              delete newState[index];
              return newState;
            });
            return { ...item, selectedCategory: value };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    }));
  };

  /** While typing Product Name, resolve against the full catalog and apply product + category when unambiguous. */
  const tryResolveProductFromTypedSearch = (index: number, rawQuery: string) => {
    if (isCategoryChanging[index]) return;
    const query = rawQuery.trim();
    if (!query) return;
    const pool = getFilteredProducts();
    const candidates = filterProductsBySearchQuery(query, pool);
    const picked = pickProductFromSearchMatches(candidates, query);
    if (!picked) return;
    const current = formDataRef.current.items[index];
    if (current?.product?._id && String(current.product._id) === String(picked._id)) return;
    updateItem(index, "product", picked);
  };

  const scheduleProductSearchResolve = (index: number, rawQuery: string) => {
    const prev = productSearchResolveTimersRef.current[index];
    if (prev) clearTimeout(prev);
    productSearchResolveTimersRef.current[index] = setTimeout(() => {
      tryResolveProductFromTypedSearch(index, rawQuery);
      delete productSearchResolveTimersRef.current[index];
    }, 380);
  };

  // Save TDS link to product in database (with debouncing for real-time saving)
  const saveTdsLinkToProduct = async (productId: string, tdsLink: string) => {
    if (!productId) return;
    
    setSavingTdsLinks(prev => new Set(prev).add(productId));
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          tdsLink: tdsLink || ""
        }),
      });

      if (response.ok) {
        // Update the product in local state to reflect the change
        setProducts(prev => prev.map(p => 
          p._id === productId ? { ...p, tdsLink: tdsLink || "" } : p
        ));
        console.log('✅ TDS link saved to product in database');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save TDS link to product:', errorData.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error saving TDS link to product:', error);
    } finally {
      setSavingTdsLinks(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Debounced save function for real-time saving
  const debouncedSaveTdsLink = (() => {
    let timeoutId: NodeJS.Timeout | null = null;
    return (productId: string, tdsLink: string) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveTdsLinkToProduct(productId, tdsLink);
      }, 1000); // Save 1 second after user stops typing
    };
  })();

  // Calculate totals
  const subtotal = formData.items.reduce((sum, item) => sum + item.price, 0);
  // Tax removed - no longer calculating or displaying tax
  const tax = 0;
  const deliveryCharges = formData.items.reduce((sum, item) => sum + Number(item.deliveryCharges || 0), 0);
  const biltyCharges = formData.items.reduce((sum, item) => sum + Number(item.biltyCharges || 0), 0);
  const total = subtotal;

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read selected file."));
      reader.readAsDataURL(file);
    });

  const loadImageFromFile = (file: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load image for compression."));
      };
      img.src = objectUrl;
    });

  const compressImageFile = async (file: File): Promise<File> => {
    if (!String(file.type || "").toLowerCase().startsWith("image/")) return file;

    const img = await loadImageFromFile(file);
    const maxDimension = 1920;
    const targetBytes = 1.5 * 1024 * 1024; // Prefer <= 1.5MB after compression.

    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    let quality = 0.82;
    let blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    while (blob && blob.size > targetBytes && quality > 0.45) {
      quality -= 0.08;
      blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality)
      );
    }
    if (!blob) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      // Validate customer is set
      if (!formData.customer) {
        setMessage("❌ Please select a customer or ensure your customer account is properly linked");
        setSubmitting(false);
        return;
      }

      // Validate items
      if (formData.items.length === 0) {
        setMessage("❌ Please add at least one item to the order");
        setSubmitting(false);
        return;
      }

      const orderData = {
        customer: formData.customer,
        items: formData.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice ?? item.product.price ?? 0),
          deliveryCharges: Number(item.deliveryCharges || 0),
          biltyCharges: Number(item.biltyCharges || 0),
          total: calculateItemTotal({
            quantity: Number(item.quantity || 1),
            unitPrice: Number(item.unitPrice ?? item.product.price ?? 0),
            deliveryCharges: Number(item.deliveryCharges || 0),
            biltyCharges: Number(item.biltyCharges || 0),
          }),
          tdsLink: item.tdsLink || ""
        })),
        subtotal: subtotal,
        tax: 0,
        total: total,
        deliveryCharges,
        biltyCharges,
        notes: formData.notes,
        company_id: 'RESSICHEM'
      };

      if (orderAttachmentFile) {
        const maxAttachmentSizeBytes = 10 * 1024 * 1024; // 10MB
        const originalType = String(orderAttachmentFile.type || "").toLowerCase();
        const processedAttachmentFile = originalType.startsWith("image/")
          ? await compressImageFile(orderAttachmentFile)
          : orderAttachmentFile;
        const fileType = String(processedAttachmentFile.type || "").toLowerCase();
        const isAllowedType = fileType.startsWith("image/") || fileType === "application/pdf";
        if (!isAllowedType) {
          setMessage("❌ Invalid file type. Please upload an image or PDF.");
          setSubmitting(false);
          return;
        }
        if (processedAttachmentFile.size > maxAttachmentSizeBytes) {
          setMessage("❌ Attachment too large. Maximum allowed size is 10MB.");
          setSubmitting(false);
          return;
        }
        const dataUrl = await fileToDataUrl(processedAttachmentFile);
        (orderData as any).attachment = {
          fileName: processedAttachmentFile.name,
          fileType: processedAttachmentFile.type || "application/octet-stream",
          fileSize: processedAttachmentFile.size,
          dataUrl,
          uploadedAt: new Date().toISOString(),
        };
      }

      console.log('📦 Submitting order:', { 
        customer: orderData.customer, 
        itemsCount: orderData.items.length,
        subtotal: orderData.subtotal,
        total: orderData.total
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setMessage("✅ Order created successfully!");
        setTimeout(() => {
          router.push('/orders');
        }, 2000);
      } else {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Failed to create order' };
        }
        console.error('Order creation error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          orderData: { customer: orderData.customer, itemsCount: orderData.items.length }
        });
        if (response.status === 413) {
          setMessage("❌ Attachment is too large for request payload. Please upload a smaller file.");
        } else {
          setMessage(`❌ Failed to create order: ${errorData.message || errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setMessage(`❌ Error creating order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Always render something - don't block on loading states
  return (
    <ProtectedRoute>
      {userLoading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300">Loading user...</p>
          </div>
        </div>
      )}
      
      {!userLoading && !user && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication Required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to access this page.</p>
            <button
              onClick={() => router.push('/auth/sign-in')}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-center font-medium text-white hover:bg-opacity-90"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
      
      {!userLoading && user && (
        <>
          <Breadcrumb pageName="Create Order" />
          
          {loading && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
              Loading {customersLoading ? "customers" : ""}{customersLoading && productsLoading ? " and " : ""}{productsLoading ? "products" : ""} in background...
            </div>
          )}
      
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="px-4 py-6 md:px-6 xl:px-9">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Create New Order
            </h4>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={() => router.push('/orders')}
                className="inline-flex items-center justify-center rounded-lg border border-stroke bg-transparent px-4 py-3 text-center font-medium text-dark hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-dark-3 dark:text-white dark:hover:border-primary"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Orders
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Customer Information - Hidden for customers, visible for managers/admins */}
            {!user?.isCustomer && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-dark dark:text-white">Customer Information</h4>
                </div>
                
                <div className="relative customer-search-container">
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                    Select Customer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      autoComplete="off"
                      value={customerSearchTerm}
                      disabled={customersLoading}
                      onChange={(e) => {
                        setCustomerSearchTerm(e.target.value);
                        setCustomerSearchOpen(true);
                        setFormData((prev) => ({ ...prev, customer: "" }));
                      }}
                      onFocus={() => setCustomerSearchOpen(true)}
                      onBlur={() => {
                        if (formData.customer) {
                          const c = customers.find((x) => x._id === formData.customer);
                          if (c) {
                            setCustomerSearchTerm(`${c.companyName} - ${c.contactName}`);
                          }
                        }
                      }}
                      placeholder={customersLoading ? "Loading customers..." : "Search by company, contact, email, or phone…"}
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 pl-10 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white transition-colors"
                    />
                    <svg
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {customerSearchOpen && (
                    <div className="absolute z-50 mt-1 max-h-[min(70vh,520px)] w-full overflow-y-auto rounded-lg border border-stroke bg-white shadow-lg dark:border-dark-3 dark:bg-dark-2">
                      {customersLoading ? (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          Loading customers...
                        </div>
                      ) : customerPickerMatches.length > 0 ? (
                        <>
                          {customerPickerMatches.map((customer) => (
                            <div
                              key={customer._id}
                              role="option"
                              aria-selected={formData.customer === customer._id}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, customer: customer._id }));
                                setCustomerSearchTerm(
                                  `${customer.companyName} - ${customer.contactName}`
                                );
                                setCustomerSearchOpen(false);
                              }}
                              className={`cursor-pointer border-b border-stroke px-4 py-3 last:border-b-0 dark:border-dark-3 hover:bg-gray-100 dark:hover:bg-dark-3 ${
                                formData.customer === customer._id
                                  ? "bg-blue-50 dark:bg-blue-900/20"
                                  : ""
                              }`}
                            >
                              <div className="font-medium text-dark dark:text-white">
                                {customer.companyName} — {customer.contactName}
                              </div>
                              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                {customer.email}
                                {customer.phone ? ` · ${customer.phone}` : ""}
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {customersLoading
                            ? "Loading customers..."
                            : customers.length === 0
                            ? "No customers loaded."
                            : "No customers match your search."}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer Summary - Only shown for logged-in customers */}
            {user?.isCustomer && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-dark dark:text-white">Your Order</h4>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✓ Order will be created for your account
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Order Statistics */}
                {!customerStats.loading && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-dark dark:text-white">Order Statistics</h4>
                    </div>

                    <div className="rounded-lg border border-stroke bg-white dark:border-dark-3 dark:bg-dark-2 p-6">
                      {/* Total Orders */}
                      <div className="mb-6 pb-6 border-b border-stroke dark:border-dark-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Orders</p>
                            <p className="text-3xl font-bold text-dark dark:text-white">{customerStats.totalOrders}</p>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Order Status Breakdown */}
                      <div className="mb-6">
                        <h5 className="text-sm font-semibold text-dark dark:text-white mb-4">Order Status Breakdown</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {Object.entries(customerStats.orderStatuses).map(([status, count]) => {
                            const statusColors: { [key: string]: { bg: string; text: string; border: string } } = {
                              pending: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
                              approved: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
                              rejected: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
                              confirmed: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
                              shipped: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
                              completed: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
                              cancelled: { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' }
                            };
                            const colors = statusColors[status] || { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' };
                            const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
                            
                            return (
                              <div key={status} className={`rounded-lg border ${colors.border} ${colors.bg} p-3`}>
                                <p className={`text-xs font-medium ${colors.text} mb-1`}>{statusLabel}</p>
                                <p className={`text-2xl font-bold ${colors.text}`}>{count}</p>
                              </div>
                            );
                          })}
                          {Object.keys(customerStats.orderStatuses).length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 col-span-full">No orders found</p>
                          )}
                        </div>
                      </div>

                      {/* Outstanding Balance */}
                      <div className="pt-6 border-t border-stroke dark:border-dark-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Outstanding Balance</p>
                            <p className={`text-3xl font-bold ${customerStats.outstandingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                              PKR {customerStats.outstandingBalance.toLocaleString()}
                            </p>
                          </div>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${customerStats.outstandingBalance > 0 ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
                            {customerStats.outstandingBalance > 0 ? (
                              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Assigned Managers */}
                      {user?.isCustomer && customerManagerDetails.length > 0 && (
                        <div className="pt-6 border-t border-stroke dark:border-dark-3">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <h5 className="text-sm font-semibold text-dark dark:text-white">Your Assigned Manager{customerManagerDetails.length > 1 ? 's' : ''}</h5>
                          </div>
                          <div className="space-y-2">
                            {customerManagerDetails.map((manager, index) => {
                              const managerName = `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || manager.email || 'Unknown Manager';
                              const managerCategories = manager.assignedCategories || [];
                              const categoryNames = Array.isArray(managerCategories)
                                ? managerCategories.map((cat: any) => typeof cat === 'string' ? cat : (cat.category || cat.name || '')).filter(Boolean)
                                : [];
                              
                              return (
                                <div key={index} className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="font-medium text-purple-900 dark:text-purple-100 text-sm">
                                        {managerName}
                                      </p>
                                      {manager.email && (
                                        <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                                          {manager.email}
                                        </p>
                                      )}
                                      {categoryNames.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                          {categoryNames.slice(0, 3).map((cat: string, catIndex: number) => (
                                            <span
                                              key={catIndex}
                                              className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-800 px-2 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-200"
                                            >
                                              {cat}
                                            </span>
                                          ))}
                                          {categoryNames.length > 3 && (
                                            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-800 px-2 py-0.5 text-xs font-medium text-purple-800 dark:text-purple-200">
                                              +{categoryNames.length - 3} more
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {customerManagerCategories.length > 0 && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                              💡 You can order products from {customerManagerCategories.length} categor{customerManagerCategories.length === 1 ? 'y' : 'ies'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Loading state for customer statistics */}
                {customerStats.loading && (
                  <div className="rounded-lg border border-stroke bg-white dark:border-dark-3 dark:bg-dark-2 p-6">
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent mb-2"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Loading order statistics...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Manager Categories Info */}
            {managerProfile?.assignedCategories && managerProfile.assignedCategories.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-dark dark:text-white">Your Assigned Categories</h4>
                </div>
                
                <div className="rounded-lg border border-stroke bg-blue-50 p-4 dark:border-dark-3 dark:bg-blue-900/20">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    You can only create orders for products in your assigned categories:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {managerProfile.assignedCategories.map((category: string, index: number) => (
                      <span
                        key={`category-${index}`}
                        className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                    Available products: {getFilteredProducts().length} out of {products.length} total
                  </p>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-dark dark:text-white">Order Items</h4>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  disabled={getFilteredProducts().length === 0}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </button>
              </div>

              {formData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No items added yet. Click "Add Item" to start building your order.
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={`item-${index}-${item.product?._id || 'new'}`} className="rounded-lg border border-stroke p-4 dark:border-dark-3">
                      <div className="grid grid-cols-1 lg:grid-cols-9 gap-4">
                        {/* Category Filter Dropdown */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                            Category
                          </label>
                          <select
                            value={item.selectedCategory || ''}
                            onChange={(e) => {
                              updateItem(index, 'selectedCategory', e.target.value);
                            }}
                            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white transition-colors"
                          >
                            <option value="">All Categories</option>
                            {getCategoryOptionsForDropdown().map(category => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Product Name Searchable Autocomplete */}
                        <div className="lg:col-span-2 relative product-search-container">
                          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                            Product Name
                          </label>
                          <div className="relative">
                            <div className="relative">
                              <input
                                type="text"
                                value={productSearchTerms[index] !== undefined ? productSearchTerms[index] : (item.product?.name || '')}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setProductSearchTerms(prev => ({ ...prev, [index]: v }));
                                  setProductSearchOpen(prev => ({ ...prev, [index]: true }));
                                  scheduleProductSearchResolve(index, v);
                                }}
                                onFocus={() => {
                                  // If search term is empty and product is selected, clear it to start fresh search
                                  if (!productSearchTerms[index] && item.product?.name) {
                                    setProductSearchTerms(prev => ({ ...prev, [index]: '' }));
                                  }
                                  setProductSearchOpen(prev => ({ ...prev, [index]: true }));
                                }}
                                onBlur={() => {
                                  const pending = productSearchResolveTimersRef.current[index];
                                  if (pending) {
                                    clearTimeout(pending);
                                    delete productSearchResolveTimersRef.current[index];
                                  }
                                  const term =
                                    productSearchTerms[index] !== undefined
                                      ? productSearchTerms[index]
                                      : item.product?.name || "";
                                  if (!String(term).trim() && item.product?.name) {
                                    setProductSearchTerms(prev => ({ ...prev, [index]: item.product.name }));
                                    return;
                                  }
                                  tryResolveProductFromTypedSearch(index, String(term));
                                }}
                                placeholder="Search products by name, SKU..."
                                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 pl-10 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white transition-colors"
                              />
                              <svg 
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            
                            {/* Product Dropdown */}
                            {productSearchOpen[index] && (
                              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-2 border border-stroke dark:border-dark-3 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {getFilteredProductsBySearch(index, item.selectedCategory).length > 0 ? (
                                  getFilteredProductsBySearch(index, item.selectedCategory).map(product => (
                                    <div
                                      key={product._id}
                                      onClick={() => {
                                        updateItem(index, 'product', product);
                                        setProductSearchTerms(prev => ({ ...prev, [index]: product.name }));
                                        setProductSearchOpen(prev => ({ ...prev, [index]: false }));
                                      }}
                                      className={`px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-3 border-b border-stroke dark:border-dark-3 last:border-b-0 ${
                                        item.product._id === product._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                      }`}
                                    >
                                      <div className="font-medium text-dark dark:text-white">{product.name}</div>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {product.sku && (
                                          <span>SKU: {product.sku}</span>
                                        )}
                                        {product.unit && (
                                          <span>Unit: {product.unit}</span>
                                        )}
                                        {product.price !== undefined && (
                                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                                            PKR {product.price.toLocaleString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    No products found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* SKU Display */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                            SKU
                          </label>
                          <div className="rounded-lg border border-stroke bg-gray-50 px-4 py-3 text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white">
                            {item.product?.sku || 'N/A'}
                          </div>
                        </div>

                        {/* Price Display */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                            Unit Price
                          </label>
                          {canEditUnitPrice ? (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={Number(item.unitPrice || 0)}
                              onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white transition-colors"
                            />
                          ) : (
                            <div className="rounded-lg border border-stroke bg-gray-50 px-4 py-3 text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white">
                              PKR {Number(item.unitPrice || item.product?.price || 0).toLocaleString()}
                            </div>
                          )}
                        </div>
                        
                        {/* Quantity Input */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white transition-colors"
                          />
                        </div>
                        
                        {/* Delivery Charges */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                            Delivery Charges
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={Number(item.deliveryCharges || 0)}
                            onChange={(e) => updateItem(index, 'deliveryCharges', Number(e.target.value))}
                            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white transition-colors"
                          />
                        </div>

                        {/* Bilty Charges */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                            Bilty Charges
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={Number(item.biltyCharges || 0)}
                            onChange={(e) => updateItem(index, 'biltyCharges', Number(e.target.value))}
                            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white transition-colors"
                          />
                        </div>

                        {/* Total Price & Remove Button */}
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                              Total
                            </label>
                            <div className="rounded-lg border border-stroke bg-gray-50 px-4 py-3 text-dark font-semibold dark:border-dark-3 dark:bg-dark-2 dark:text-white">
                              PKR {item.price.toLocaleString()}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                            title="Remove item"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* TDS Link Field */}
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <label className="block text-sm font-medium text-dark dark:text-white">
                            TDS Link (Technical Data Sheet)
                          </label>
                          {savingTdsLinks.has(item.product._id) && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                              <div className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
                              <span>Saving...</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={item.tdsLink || ""}
                            onChange={(e) => updateItem(index, 'tdsLink', e.target.value)}
                            onBlur={(e) => {
                              // Save immediately when user leaves the field
                              if (item.product._id) {
                                saveTdsLinkToProduct(item.product._id, e.target.value || "");
                              }
                            }}
                            placeholder="https://example.com/tds-document.pdf"
                            className="flex-1 rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white transition-colors"
                          />
                          {item.tdsLink && (
                            <a
                              href={item.tdsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 rounded-lg border border-primary bg-primary px-4 py-3 text-white hover:bg-opacity-90 transition-colors"
                              title="Open TDS Link in new tab"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Enter the URL to the Technical Data Sheet. This will be saved to the product in the database automatically when you leave the field.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Notes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-dark dark:text-white">Order Notes</h4>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Enter any special instructions or notes for this order..."
                  rows={3}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white transition-colors"
                />
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/40 dark:bg-blue-900/10">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <svg className="h-4 w-4 text-blue-700 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828a4 4 0 10-5.656-5.656L5.757 10.757a6 6 0 108.486 8.486L20 13" />
                    </svg>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-900 dark:text-blue-200">
                      Add Attachment (Screenshot / Image / PDF)
                    </label>
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      Attach proof, screenshot, or supporting document for this order.
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*,application/pdf,.pdf"
                  onChange={(e) => setOrderAttachmentFile(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-blue-300 bg-white px-4 py-3 text-dark focus:border-primary focus:outline-none dark:border-blue-700 dark:bg-dark-2 dark:text-white transition-colors"
                />
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                  Supported: JPG, PNG, WEBP, GIF, PDF (max 10MB).
                </p>
                {orderAttachmentFile ? (
                  <div className="mt-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Selected: {orderAttachmentFile.name}
                  </div>
                ) : (
                  <div className="mt-2 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    No file selected
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            {formData.items.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-dark dark:text-white">Order Summary</h4>
                </div>

                <div className="rounded-lg border border-stroke bg-gray-50 p-6 dark:border-dark-3 dark:bg-dark-2">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-dark dark:text-white">Subtotal (incl. item-wise charges):</span>
                      <span className="font-medium text-dark dark:text-white">PKR {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark dark:text-white">Delivery Charges:</span>
                      <span className="font-medium text-dark dark:text-white">PKR {deliveryCharges.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark dark:text-white">Bilty Charges:</span>
                      <span className="font-medium text-dark dark:text-white">PKR {biltyCharges.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark dark:text-white">Total:</span>
                      <span className="font-medium text-dark dark:text-white">PKR {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Charges (Item-Wise Totals) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 2v8m0 0v2m0-2h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-dark dark:text-white">Additional Charges (Product-wise)</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">Total Delivery Charges</label>
                  <div className="w-full rounded-lg border border-stroke bg-gray-50 px-4 py-3 text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white">
                    PKR {deliveryCharges.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-dark dark:text-white">Total Bilty Charges</label>
                  <div className="w-full rounded-lg border border-stroke bg-gray-50 px-4 py-3 text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white">
                    PKR {biltyCharges.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Not Found Warning */}
            {user?.isCustomer && customerNotFound && !formData.customer && (
              <div className="p-4 rounded-lg bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-medium">Customer record not found</p>
                    <p className="text-sm mt-1">
                      Unable to find your customer record with email <strong>{user.email}</strong>. 
                      Please contact support to ensure your account is properly linked to a customer record.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                {message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={submitting || formData.items.length === 0 || !formData.customer}
                className="flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary/90 px-6 py-3 font-medium text-white hover:from-primary/90 hover:to-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {submitting ? (
                  <>
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                    Creating Order...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create Order
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/orders')}
                className="flex items-center justify-center rounded-lg border border-stroke bg-transparent px-6 py-3 font-medium text-dark hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-dark-3 dark:text-white dark:hover:border-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
        </>
      )}
    </ProtectedRoute>
  );
}
