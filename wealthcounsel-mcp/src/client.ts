import { loadConfig } from "./config.js";

export type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  method?: string;
  query?: Record<string, QueryValue>;
  body?: unknown;
}

/**
 * Client for the WealthCounsel API (https://api.wealthcounsel.com/v1).
 * Scope is contacts + matters only — there is NO document-drafting endpoint.
 */
export async function request(path: string, options: RequestOptions = {}): Promise<any> {
  const config = await loadConfig();
  const { method = "GET", query, body } = options;

  const url = new URL(path.startsWith("/") ? path : `/${path}`, config.baseUrl);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.accessToken}`,
    Accept: "application/json",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  if (!res.ok) {
    let detail = text.slice(0, 1000);
    try {
      detail = JSON.stringify(JSON.parse(text));
    } catch {
      /* keep raw */
    }
    throw new Error(`WealthCounsel ${method} ${url.pathname} → ${res.status} ${res.statusText}: ${detail}`);
  }
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function render(payload: any): string {
  return JSON.stringify(payload, null, 2);
}
