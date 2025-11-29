/**
 * Hook to detect the base path when the site is served from a subdirectory.
 * This works for static exports served from subdirectories (e.g., /my-app/en).
 * 
 * @returns The base path (e.g., '/my-app') or empty string if served from root
 */
export function useBasePath(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_BASE_PATH || '';
  }

  const fullPath = window.location.pathname;
  // Find where /en or /uk appears in the path
  const langMatch = fullPath.match(/^\/(.+?)\/(en|uk)(\/|$)/);
  if (langMatch && langMatch[1] && langMatch[1] !== 'en' && langMatch[1] !== 'uk') {
    // We have a base path like "/my-app"
    return `/${langMatch[1]}`;
  }
  // Check environment variable as fallback
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
}

