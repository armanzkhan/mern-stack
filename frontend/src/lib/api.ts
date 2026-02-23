import { getBackendUrl } from "./getBackendUrl";
import { getBackendUrlServer } from "./getBackendUrlServer";

// Get backend URL dynamically (supports localhost for dev, Vercel URL for production)
const getApiBase = () => {
  const backendUrl = getBackendUrl();
  // Ensure we have /api at the end
  return backendUrl.endsWith('/api') ? backendUrl : `${backendUrl}/api`;
};

// Server-side API base
const getApiBaseServer = () => {
  const backendUrl = getBackendUrlServer();
  return backendUrl.endsWith('/api') ? backendUrl : `${backendUrl}/api`;
};

export const API_BASE = typeof window !== 'undefined' 
  ? getApiBase() 
  : getApiBaseServer();

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(typeof window !== "undefined" && localStorage.getItem("selected_company_id")
        ? { "x-company-id": localStorage.getItem("selected_company_id") as string }
        : {})
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(typeof window !== "undefined" && localStorage.getItem("selected_company_id")
        ? { "x-company-id": localStorage.getItem("selected_company_id") as string }
        : {})
    },
    cache: "no-store"
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}
