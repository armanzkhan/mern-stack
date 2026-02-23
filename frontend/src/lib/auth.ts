// Authentication utilities
export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const handleAuthError = (status: number, message: string = "Authentication required"): boolean => {
  if (status === 401 || status === 403) {
    // Token expired or invalid - redirect to /auth/sign-in
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userType");
      localStorage.removeItem("userRole");
      window.location.href = "/auth/sign-in";
    }
    return true;
  }
  return false;
};
