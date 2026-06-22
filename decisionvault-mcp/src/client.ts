import { loadConfig } from "./config.js";

export type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  method?: string;
  query?: Record<string, QueryValue>;
  body?: unknown;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Client for the DecisionVault REST API (https://api.decisionvault.com/v1).
 * Auth is a firm API key sent as `Authorization: Token <key>`. List endpoints
 * return Django-REST style { count, next, previous, results } — already clean,
 * no flattening needed.
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
    Authorization: `Token ${config.apiKey}`,
    Accept: "application/json",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 429 && attempt < maxAttempts) {
      const retryAfter = Number(res.headers.get("retry-after") ?? "30");
      await sleep((Number.isFinite(retryAfter) ? retryAfter : 30) * 1000);
      continue;
    }

    const text = await res.text();
    if (!res.ok) {
      let detail = text.slice(0, 1000);
      try {
        detail = JSON.stringify(JSON.parse(text));
      } catch {
        /* keep raw */
      }
      throw new Error(`DecisionVault ${method} ${url.pathname} → ${res.status} ${res.statusText}: ${detail}`);
    }
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  throw new Error("DecisionVault request exhausted retries");
}

/** Pretty-print a result for an MCP text response. */
export function render(payload: any): string {
  return JSON.stringify(payload, null, 2);
}
