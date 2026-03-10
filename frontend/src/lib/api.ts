const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
const normalizedConfiguredBaseUrl = configuredBaseUrl.replace(/\/+$/, "");

const localhostUrlPattern = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/i;
const isBrowserLocalhost =
  typeof window !== "undefined" && ["localhost", "127.0.0.1", "0.0.0.0"].includes(window.location.hostname);

const shouldUseConfiguredBase =
  Boolean(normalizedConfiguredBaseUrl) &&
  !(localhostUrlPattern.test(normalizedConfiguredBaseUrl) && !isBrowserLocalhost);

export const API_BASE_URL = shouldUseConfiguredBase ? normalizedConfiguredBaseUrl : "";

export const apiUrl = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const assetUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return apiUrl(path);
};
