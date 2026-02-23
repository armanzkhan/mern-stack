/**
 * Normalizes a backend URL: single protocol, no trailing slash, trimmed.
 */
function normalizeBackendUrl(url: string): string {
  let u = (url || '').trim();
  if (!u) return u;
  const firstProtocol = u.match(/^(https?:\/\/)/i);
  if (firstProtocol) {
    const rest = u.slice(firstProtocol[0].length).replace(/^(?:https?:\/\/)+/gi, '');
    u = firstProtocol[0] + rest;
  }
  u = u.replace(/\/+$/, '');
  return u;
}

/**
 * Server-side function to get the backend URL.
 * This is used in Next.js API routes (server-side only).
 * For client-side, use getBackendUrl() instead.
 */
export function getBackendUrlServer(): string {
  // If environment variable is explicitly set, use it (highest priority)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return normalizeBackendUrl(process.env.NEXT_PUBLIC_API_URL);
  }

  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return normalizeBackendUrl(process.env.NEXT_PUBLIC_BACKEND_URL);
  }

  // Check if deployed on Vercel (but still prefer env vars if set)
  // Only use hardcoded URL if no env vars are set AND we're on Vercel
  if ((process.env.VERCEL || process.env.VERCEL_URL) && !process.env.NEXT_PUBLIC_BACKEND_URL && !process.env.NEXT_PUBLIC_API_URL) {
    return 'http://167.172.196.0:5000';
  }

  // Fallback to localhost for local development
  return 'http://localhost:5000';
}

