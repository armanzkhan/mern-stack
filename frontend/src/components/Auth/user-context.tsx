"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { getBackendUrl } from "@/lib/getBackendUrl";

type User = {
  user_id: string;
  company_id: string;
  email: string;
  department?: string;
  isSuperAdmin: boolean;
  isCompanyAdmin?: boolean;
  isCustomer?: boolean;
  isManager?: boolean;
  managerProfile?: {
    manager_id?: string;
    assignedCategories?: string[];
    managerLevel?: string;
    canAssignCategories?: boolean;
    notificationPreferences?: any;
  };
  customerProfile?: {
    customer_id?: string;
    companyName?: string;
    customerType?: string;
    assignedManager?: any;
    preferences?: any;
  };
  roles: string[];
  permissions: string[];
  permissionGroups: string[];
  notifications?: any[];
  [key: string]: any;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isSuperAdmin: () => boolean;
  isCompanyAdmin: () => boolean;
  isCustomer: () => boolean;
  isManager: () => boolean;
  loading: boolean;
  hasToken: boolean | null;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);

  const refreshUser = async (retriedAfterRefresh = false) => {
    if (!isClient) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const apiUrl = getBackendUrl();
      const response = await axios.get(`${apiUrl}/api/auth/current-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Update user with fresh data, replacing previous state
      const responseData = response.data as any;
      const freshUser = responseData.data || responseData as User;
      
      // Extract permissions - handle both string arrays and object arrays
      let permissions: string[] = [];
      if (freshUser.permissions) {
        if (Array.isArray(freshUser.permissions)) {
          permissions = freshUser.permissions.map((p: any) => 
            typeof p === 'string' ? p : (p.key || p._id || String(p))
          ).filter(Boolean);
        }
      }
      
      // Extract roles - handle both string arrays and object arrays
      let roles: string[] = [];
      if (freshUser.roles) {
        if (Array.isArray(freshUser.roles)) {
          roles = freshUser.roles.map((r: any) => 
            typeof r === 'string' ? r : (r.name || r._id || String(r))
          ).filter(Boolean);
        }
      }
      
      console.log('✅ User context - Refreshed user data:', {
        email: freshUser.email,
        permissionsCount: permissions.length,
        rolesCount: roles.length,
        isSuperAdmin: freshUser.isSuperAdmin,
        isManager: freshUser.isManager,
        isCustomer: freshUser.isCustomer
      });
      
      setUser((prevUser) => {
        const updatedUser: User = {
          ...prevUser,
          ...freshUser,
          // Ensure isSuperAdmin is properly set
          isSuperAdmin: freshUser.isSuperAdmin || false,
          // Ensure roles are unique and always an array
          roles: [...new Set(roles)],
          // Ensure permissions are unique and always an array (never undefined)
          permissions: [...new Set(permissions)],
          // Ensure permissionGroups are unique and always an array
          permissionGroups: [...new Set((freshUser.permissionGroups || []).map((pg: any) => 
            typeof pg === 'string' ? pg : (pg.name || pg._id || String(pg))
          ).filter(Boolean))]
        };
        
        // Ensure permissions is never undefined
        if (!updatedUser.permissions) {
          updatedUser.permissions = [];
        }
        
        return updatedUser;
      });
    } catch (error: any) {
      console.error("Failed to refresh user:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (!retriedAfterRefresh) {
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            try {
              const apiUrl = getBackendUrl();
              const refreshRes = await axios.post<{ success: boolean; token: string }>(
                `${apiUrl}/api/auth/refresh`,
                { refreshToken },
                { headers: { "Content-Type": "application/json" }, timeout: 10000 }
              );
              if (refreshRes.data?.success && refreshRes.data?.token) {
                localStorage.setItem("token", refreshRes.data.token);
                setLoading(true);
                await refreshUser(true);
                return;
              }
            } catch (refreshErr) {
              console.warn("Refresh token failed:", refreshErr);
            }
          }
        }
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userType");
        localStorage.removeItem("userRole");
        setUser(null);
        setHasToken(false);
        if (typeof window !== "undefined") {
          window.location.href = "/auth/sign-in";
        }
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isInitialized) return;
    
    const token = localStorage.getItem("token");
    setHasToken(!!token);
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          const refToken = localStorage.getItem("refreshToken");
          if (refToken && typeof window !== "undefined") {
            (async () => {
              try {
                const apiUrl = getBackendUrl();
                const r = await axios.post<{ success: boolean; token: string }>(
                  `${apiUrl}/api/auth/refresh`,
                  { refreshToken: refToken },
                  { headers: { "Content-Type": "application/json" }, timeout: 10000 }
                );
                if (r.data?.success && r.data?.token) {
                  localStorage.setItem("token", r.data.token);
                  await refreshUser(true);
                  return;
                }
              } catch {
                // fall through to clear and redirect
              }
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("userType");
              localStorage.removeItem("userRole");
              setUser(null);
              setLoading(false);
              setIsInitialized(true);
              setHasToken(false);
              window.location.href = "/auth/sign-in";
            })();
            return;
          }
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userType");
          localStorage.removeItem("userRole");
          setUser(null);
          setLoading(false);
          setIsInitialized(true);
          setHasToken(false);
          if (typeof window !== "undefined") {
            window.location.href = "/auth/sign-in";
          }
          return;
        }
        // Set basic user info from token immediately for faster redirects
        const initialUser: User = {
          user_id: decoded.user_id,
          company_id: decoded.company_id,
          roles: [...new Set((decoded.roles || []) as string[])], // Ensure roles are unique
          permissions: [], // Always initialize as empty array, never undefined
          permissionGroups: [],
          isSuperAdmin: decoded.isSuperAdmin || false, // Use actual value from token
          email: decoded.email || "",
        };
        setUser(initialUser);
        // Mark as initialized immediately to allow redirects
        setIsInitialized(true);
        setLoading(false);
        // Fetch full user details in background
        refreshUser();
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userType");
        localStorage.removeItem("userRole");
        setUser(null);
        setLoading(false);
        setIsInitialized(true);
        setHasToken(false);
        // Redirect to /auth/sign-in on token decode error
        if (typeof window !== "undefined") {
          window.location.href = "/auth/sign-in";
        }
      }
    } else {
      setLoading(false);
      setIsInitialized(true);
      setHasToken(false);
    }
    
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!isInitialized) {
        console.warn("User initialization timeout - forcing completion");
        setLoading(false);
        setIsInitialized(true);
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, [isClient, isInitialized]);

  const logout = () => {
    if (isClient) {
      localStorage.removeItem("token");
    }
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    
    // Company Admins should have access to most admin functions
    if (user.isCompanyAdmin) {
      // Allow access to all user management permissions
      if (permission.startsWith('users.')) return true;
      // Allow access to other common admin permissions
      const adminPermissions = [
        'customers.read', 'customers.create', 'customers.update', 'customers.delete',
        'orders.read', 'orders.create', 'orders.update', 'orders.delete',
        'products.read', 'products.create', 'products.update', 'products.delete',
        'managers.read', 'managers.create', 'managers.update', 'managers.delete',
        'categories.read', 'categories.create', 'categories.update', 'categories.delete',
        'invoices.read', 'invoices.create', 'invoices.update', 'invoices.delete',
        'notifications.read', 'notifications.create', 'notifications.update', 'notifications.delete',
        'dashboard.view', 'admin.dashboard', 'admin.settings'
      ];
      if (adminPermissions.includes(permission)) return true;
    }
    
    // For customer users, allow basic permissions even if not loaded yet
    if (user.isCustomer) {
      const customerPermissions = ['orders.read', 'orders.create', 'products.read', 'invoices.read', 'notifications.read'];
      if (customerPermissions.includes(permission)) return true;
    }
    
    return user.permissions?.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles?.includes(role) || false;
  };

  const isSuperAdmin = (): boolean => {
    return user?.isSuperAdmin || false;
  };

  const isCompanyAdmin = (): boolean => {
    return user?.isCompanyAdmin || false;
  };

  const isCustomer = (): boolean => {
    return user?.isCustomer || false;
  };

  const isManager = (): boolean => {
    return user?.isManager || false;
  };

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        setUser, 
        logout, 
        refreshUser, 
        hasPermission, 
        hasRole, 
        isSuperAdmin, 
        isCompanyAdmin,
        isCustomer,
        isManager,
        loading,
        hasToken
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}