export const BASE_URL = process.env.NEXT_PUBLIC_OWSEC_URL || "";

export const SERVICES = {
  security: 16001,      // OWSEC
  provisioning: 16005,  // OWPROV
  mdu: 16010,           // MDU Service
} as const;

export type ServiceName = keyof typeof SERVICES;

// Internal cache for dynamically resolved service URIs
const resolvedUrls: Record<string, string> = {
  security: BASE_URL,
};

/**
 * Extracts the base protocol and host/IP from BASE_URL (stripping the port).
 * E.g., "http://localhost:16001" -> "http://localhost"
 */
export function getBaseHost(): string {
  if (!BASE_URL) return "";
  try {
    const url = new URL(BASE_URL);
    return `${url.protocol}//${url.hostname}`;
  } catch {
    return BASE_URL.replace(/:\d+$/, "");
  }
}

/**
 * Resolves the URL for a specific service based on dynamic discovery or static fallback ports.
 */
export function getServiceUrl(service: string | number): string {
  // 1. Check if we have a dynamically discovered endpoint URI mapped
  if (typeof service === "string") {
    // Standardize naming (e.g. "provisioning" -> "owprov", "security" -> "owsec", "mdu" -> "owmdu")
    const apiType = service === "provisioning" ? "owprov" : (service === "security" ? "owsec" : (service === "mdu" ? "owmdu" : service));
    if (resolvedUrls[apiType]) {
      return resolvedUrls[apiType];
    }
  }

  // 2. Fallback to static resolution using BASE_URL and default ports
  if (service === "security" && BASE_URL) {
    return BASE_URL;
  }
  
  const host = getBaseHost();
  if (!host) return "";
  
  const port = typeof service === "number" 
    ? service 
    : (SERVICES[service as ServiceName] ?? 16000);
    
  return `${host}:${port}`;
}

/**
 * Dynamically updates the service URLs registry (e.g., from /api/v1/systemEndpoints response).
 */
export function updateServiceUrls(endpoints: { type: string; uri: string }[]): void {
  for (const endpoint of endpoints) {
    if (endpoint.type && endpoint.uri) {
      // Strip any trailing slash
      resolvedUrls[endpoint.type] = endpoint.uri.replace(/\/$/, "");
    }
  }
}

/**
 * Utility to verify a service URL configuration.
 */
export function checkServiceUrl(service: string): string {
  const url = getServiceUrl(service);
  if (!url) {
    throw new Error(
      `Service URL for ${service} is unreachable. NEXT_PUBLIC_OWSEC_URL is not configured in your environment (.env).`
    );
  }
  return url;
}

/**
 * Generates unified headers including token authorization.
 */
export function getHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token =
    localStorage.getItem("mdu_access_token") ||
    sessionStorage.getItem("mdu_access_token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}
