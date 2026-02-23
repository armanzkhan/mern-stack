"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useUser } from "@/components/Auth/user-context";
import { getBackendUrl } from "@/lib/getBackendUrl";
// Using existing icons from the project

export default function Signin() {
  const { setUser, refreshUser, user, loading: userLoading } = useUser();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if already logged in - let RedirectGuard handle this
  // useEffect(() => {
  //   if (user && !loading && !userLoading && !isRedirecting) {
  //     setIsRedirecting(true);
  //     if (user.isSuperAdmin) {
  //       router.replace("/admin/dashboard");
  //     } else if (user.roles && user.roles.length > 0) {
  //       router.replace("/dashboard");
  //     } else {
  //       router.replace("/profile");
  //     }
  //   }
  // }, [user, router, loading, userLoading, isRedirecting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setError("Account temporarily locked due to multiple failed attempts. Please try again later.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const apiUrl = getBackendUrl();
      console.log('API URL:', apiUrl);
      console.log('Login attempt with:', { identifier: form.identifier });
      
      const res = await axios.post<{ 
        token: string; 
        refreshToken: string;
        message: string;
        user: {
          _id: string;
          email: string;
          firstName: string;
          lastName: string;
          role: string;
          department: string;
          isSuperAdmin: boolean;
          isCompanyAdmin: boolean;
          isCustomer: boolean;
          isManager: boolean;
          userType: string;
          company_id: string;
        };
      }>(
        `${apiUrl}/api/auth/login`, 
        {
          identifier: form.identifier,
          password: form.password
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout (increased for slow database connections)
        }
      );
      
      const { token, message, user: userData } = res.data;
      
      // Store token securely
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      
      // Store user type information for routing
      localStorage.setItem("userType", userData.userType);
      localStorage.setItem("userRole", userData.role);
      localStorage.setItem("userId", userData._id);

      // Decode JWT for basic info
      const decoded: any = jwtDecode(token);
      
      // Validate token structure
      if (!decoded.user_id || !decoded.company_id) {
        throw new Error("Invalid token structure");
      }
      
      // Set basic user info immediately for instant redirect
      setUser({
        user_id: decoded.user_id,
        company_id: decoded.company_id,
        roles: [...new Set((decoded.roles || []) as string[])], // Ensure roles are unique
        permissions: [],
        permissionGroups: [],
        isSuperAdmin: userData.isSuperAdmin || false,
        isCompanyAdmin: userData.isCompanyAdmin || false,
        isCustomer: userData.isCustomer || false,
        isManager: userData.isManager || false,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        department: userData.department,
      });

      // Reset login attempts on successful login
      setLoginAttempts(0);
      setIsLocked(false);

      // Immediate role-based redirection
      setIsRedirecting(true);
      
      // Force redirect using window.location for immediate navigation
      console.log('🔍 Login Debug:', {
        isSuperAdmin: userData.isSuperAdmin,
        isCompanyAdmin: userData.isCompanyAdmin,
        isCustomer: userData.isCustomer,
        isManager: userData.isManager,
        userType: userData.userType,
        roles: decoded.roles
      });

      if (userData.isSuperAdmin || userData.userType === 'admin') {
        console.log('🎯 Redirecting to admin dashboard');
        window.location.href = "/admin-dashboard";
      } else if (userData.isCompanyAdmin || userData.userType === 'company_admin') {
        console.log('🎯 Redirecting to company dashboard');
        window.location.href = "/company-dashboard";
        } else if (userData.isCustomer || userData.userType === 'customer') {
          console.log('🎯 Redirecting to orders/create page');
          window.location.href = "/orders/create";
      } else if (userData.isManager || userData.userType === 'manager') {
        console.log('🎯 Redirecting to manager approvals');
        window.location.href = "/manager-approvals";
      } else if (decoded.roles && decoded.roles.length > 0) {
        console.log('🎯 Redirecting to dashboard (has roles)');
        window.location.href = "/dashboard";
      } else {
        console.log('🎯 Redirecting to profile (fallback)');
        window.location.href = "/profile";
      }

      // Refresh user details in background after redirect
      refreshUser();
      
    } catch (err: any) {
      console.error("Login error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response);
      console.error("Error response data:", err.response?.data);
      console.error("Error response status:", err.response?.status);
      console.error("Error response headers:", err.response?.headers);
      console.error("Full error object:", JSON.stringify(err, null, 2));
      
      const backendUrl = getBackendUrl();
      console.error("Backend URL being used:", backendUrl);
      
      // Log the full error response data for debugging
      if (err.response?.data) {
        console.error("=== FULL ERROR RESPONSE DATA ===");
        console.error(JSON.stringify(err.response.data, null, 2));
        console.error("================================");
      }
      
      // Handle different error types
      if (err.code === 'ECONNABORTED') {
        setError("Connection timeout. Please check your internet connection and try again.");
      } else if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || err.message?.includes('Failed to fetch')) {
        console.error("Network error detected. Backend URL should be:", backendUrl);
        const isHttpsPage = typeof window !== 'undefined' && window.location?.protocol === 'https:';
        const isHttpBackend = backendUrl.toLowerCase().startsWith('http://');
        if (isHttpsPage && isHttpBackend) {
          setError("This site uses HTTPS but the API is on HTTP. Browsers block that for security. The backend must be served over HTTPS (e.g. use a tunnel like Cloudflare Tunnel or ngrok, or deploy the backend on a host that provides HTTPS).");
        } else {
          setError(`Cannot connect to server at ${backendUrl}. Please ensure the backend is running and accessible.`);
        }
      } else if (err.response?.status === 401) {
        const errorMsg = err.response?.data?.message || "Invalid credentials";
        console.error("401 Unauthorized - Error response:", err.response?.data);
        setError(`${errorMsg}. Please check your email or phone and password.`);
        setLoginAttempts(prev => prev + 1);
      } else if (err.response?.status === 404) {
        const errorMsg = err.response?.data?.message || "User not found";
        console.error("404 Not Found - Error response:", err.response?.data);
        setError(`${errorMsg}. Please check your email address or phone number.`);
        setLoginAttempts(prev => prev + 1);
      } else if (err.response?.status === 403) {
        setError("Account is disabled. Please contact your administrator.");
      } else if (err.response?.status === 429) {
        setError("Too many login attempts. Please try again later.");
        setIsLocked(true);
      } else if (err.response?.status === 500) {
        const errorData = err.response?.data || {};
        const errorMsg = errorData.message || errorData.error || "Server error";
        const errorDetails = errorData.details || errorData.stack || "";
        console.error("Server error details:", errorData);
        console.error("Full error response:", JSON.stringify(errorData, null, 2));
        
        let displayError = `${errorMsg}. Backend URL: ${backendUrl}`;
        if (errorDetails && typeof errorDetails === 'string' && errorDetails.length < 200) {
          displayError += `. Details: ${errorDetails}`;
        }
        displayError += ". Please check backend logs.";
        setError(displayError);
        setLoginAttempts(prev => prev + 1);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
        setLoginAttempts(prev => prev + 1);
      } else {
        const errorDetails = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        console.error("Unknown error:", errorDetails);
        setError(`Login failed: ${err.message || 'Unknown error'}. Backend: ${backendUrl}`);
        setLoginAttempts(prev => prev + 1);
      }

      // Lock account after 5 failed attempts
      if (loginAttempts >= 4) {
        setIsLocked(true);
        setError("Account locked due to multiple failed attempts. Please contact support.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  // Show loading state while user context is loading
  if (userLoading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form
        className="flex flex-col gap-3 sm:gap-4 lg:gap-6"
        onSubmit={handleSubmit}
      >
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="relative flex items-center justify-center">
              <Image src="/images/logo/logo.png" alt="Ressichem logo" width={220} height={60} className="h-12 sm:h-16 w-auto" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 sm:mb-3">
            Welcome Back
          </h2>
          <p className="text-sm sm:text-base text-blue-900 dark:text-gray-400 leading-relaxed">
            Sign in to access your role-based dashboard and unlock powerful features
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 sm:space-y-6">
          <div className="group">
            <label className="mb-2 sm:mb-3 block text-xs sm:text-sm font-semibold text-blue-900 dark:text-gray-300">
              Email Address or Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-blue-900 dark:group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Enter your email or phone number"
                className="w-full rounded-lg sm:rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm py-3 sm:py-4 pl-10 sm:pl-12 pr-4 text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-500 outline-none transition-all duration-200 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 focus:bg-white focus:shadow-lg focus:shadow-blue-900/10 disabled:cursor-not-allowed disabled:bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:bg-gray-700"
                value={form.identifier}
                onChange={(e) => handleInputChange("identifier", e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="group">
            <label className="mb-2 sm:mb-3 block text-xs sm:text-sm font-semibold text-blue-900 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full rounded-lg sm:rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm py-3 sm:py-4 pl-4 pr-10 sm:pr-12 text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-500 outline-none transition-all duration-200 focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 focus:bg-white focus:shadow-lg focus:shadow-blue-900/10 disabled:cursor-not-allowed disabled:bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:bg-gray-700"
                value={form.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg sm:rounded-xl bg-red-50 border-2 border-red-200 p-3 sm:p-4 dark:bg-red-900/20 dark:border-red-800 shadow-sm">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-red-800 dark:text-red-200">
                  {error}
                </p>
                {loginAttempts > 0 && loginAttempts < 5 && (
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    {5 - loginAttempts} attempts remaining
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Login Attempts Warning */}
        {loginAttempts > 0 && loginAttempts < 5 && !isLocked && (
          <div className="rounded-lg sm:rounded-xl bg-yellow-50 border-2 border-yellow-200 p-3 sm:p-4 dark:bg-yellow-900/20 dark:border-yellow-800 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-xs sm:text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                {5 - loginAttempts} login attempts remaining
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="group relative w-full cursor-pointer rounded-lg sm:rounded-xl bg-blue-900 p-3 sm:p-4 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-blue-900/25 transition-all duration-200 hover:bg-blue-800 hover:shadow-xl hover:shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg disabled:hover:shadow-blue-900/25"
          disabled={loading || isLocked}
        >
          <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-blue-900 opacity-0 transition-opacity duration-200 group-hover:opacity-10"></div>
          {loading ? (
            <div className="relative flex items-center justify-center gap-2 sm:gap-3">
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
              <span className="text-xs sm:text-sm font-semibold">Signing in...</span>
            </div>
          ) : (
            <span className="relative flex items-center justify-center gap-1 sm:gap-2">
              <span>Sign In</span>
              <svg className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          )}
        </button>

        {/* Additional Info */}
        <div className="text-center space-y-1 sm:space-y-2">
          <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Secure & Encrypted
            </span>
          </div>
          {/* <p className="text-xs text-gray-500 dark:text-gray-400">
            Your access level will be determined by your assigned roles and permissions
          </p> */}
        </div>

        {/* Role Information - Hidden on mobile, shown on sm+ */}
        {/* <div className="hidden sm:block rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-3 sm:p-4 border border-gray-200 dark:border-gray-600"> */}
          {/* <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Access Levels
          </h4> */}
          {/* <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Super Admin</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Admin</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"></div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Manager</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-600"></div>
              <span className="font-medium text-gray-700 dark:text-gray-300">User</span>
            </div>
          </div>
        </div> */}
      </form>
    </div>
  );
}