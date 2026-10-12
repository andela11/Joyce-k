/**
 * Joyce-K API Client Configuration
 * Supports decoupled deployment:
 * - Frontend on Vercel
 * - Backend on Render (via VITE_API_URL or Vercel /api rewrites)
 */

// Base URL for API requests.
// When VITE_API_URL is configured (e.g. "https://joyce-k-backend.onrender.com"), requests go directly to Render.
// When empty, requests are relative ("/api/...") and proxy through Vercel rewrites or local Vite dev server.
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/**
 * Returns the fully qualified URL for an API endpoint.
 * Example: getApiUrl('/api/ai/compatibility') -> "https://joyce-k-backend.onrender.com/api/ai/compatibility"
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return cleanPath;
  }
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Enhanced fetch helper with automatic base URL, standard JSON headers, and timeout support.
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = getApiUrl(path);
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const headers = {
    ...defaultHeaders,
    ...(options.headers as Record<string, string> || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
}
