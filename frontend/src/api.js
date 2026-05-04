// Central API base URL — set VITE_API_BASE_URL in your .env to point to the backend.
// In production this points to the Vultr VPS (http://65.20.85.75).
// In local dev it defaults to empty string so Vite's proxy still works.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
