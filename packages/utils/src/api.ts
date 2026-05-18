/**
 * Build a full API URL by joining a base URL and a path.
 * Handles trailing/leading slashes gracefully.
 * @param baseUrl - Base API URL (e.g. "http://localhost:3001")
 * @param path - Endpoint path (e.g. "/users" or "users")
 */
export function buildApiUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, '');
  const endpoint = path.replace(/^\/+/, '');
  return `${base}/${endpoint}`;
}

/**
 * Serialize a plain object into a URL query string.
 * Skips undefined and null values. Arrays are serialized as repeated keys.
 * @param params - Key-value pairs to encode
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) {
          searchParams.append(key, String(item));
        }
      }
    } else {
      searchParams.append(key, String(value));
    }
  }

  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Parse a query string (with or without leading '?') into a plain object.
 * @param queryString - URL query string
 */
export function parseQueryString(queryString: string): Record<string, string | string[]> {
  const normalized = queryString.startsWith('?') ? queryString.slice(1) : queryString;
  const params = new URLSearchParams(normalized);
  const result: Record<string, string | string[]> = {};

  for (const key of params.keys()) {
    const values = params.getAll(key);
    result[key] = values.length === 1 ? values[0]! : values;
  }

  return result;
}

/**
 * Append query parameters to an existing URL string.
 * @param url - Base URL (may already include query params)
 * @param params - Additional key-value pairs to append
 */
export function appendQueryParams(url: string, params: Record<string, unknown>): string {
  const qs = buildQueryString(params);
  if (!qs) return url;
  return url.includes('?') ? `${url}&${qs.slice(1)}` : `${url}${qs}`;
}
