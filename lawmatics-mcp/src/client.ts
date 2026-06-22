import { loadConfig } from "./config.js";

export type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  method?: string;
  query?: Record<string, QueryValue>;
  body?: unknown;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Thin client for the Lawmatics REST API (https://api.lawmatics.com/v1).
 *
 * Auth is a single non-expiring OAuth bearer token per firm. The API enforces
 * 50 req/min and returns 429 + `Retry-After` when exceeded — we honor it.
 * Reads come back as JSON:API; `flatten()` collapses them to plain objects.
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

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 429 && attempt < maxAttempts) {
      const retryAfter = Number(res.headers.get("retry-after") ?? "60");
      await sleep((Number.isFinite(retryAfter) ? retryAfter : 60) * 1000);
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
      throw new Error(`Lawmatics ${method} ${url.pathname} → ${res.status} ${res.statusText}: ${detail}`);
    }

    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  // Unreachable, but satisfies the type checker.
  throw new Error("Lawmatics request exhausted retries");
}

interface JsonApiRecord {
  id?: string | number;
  type?: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, { data?: { id: string; type: string } | { id: string; type: string }[] | null }>;
}

/** Collapse one JSON:API record into a flat object with relationships summarized. */
export function flattenRecord(rec: JsonApiRecord | null | undefined): any {
  if (!rec || typeof rec !== "object") return rec;
  const out: Record<string, unknown> = {};
  if (rec.id !== undefined) out.id = rec.id;
  if (rec.type !== undefined) out.type = rec.type;
  if (rec.attributes) Object.assign(out, rec.attributes);
  if (rec.relationships) {
    const rels: Record<string, unknown> = {};
    for (const [name, rel] of Object.entries(rec.relationships)) {
      const data = rel?.data;
      if (Array.isArray(data)) rels[name] = data.map((d) => ({ id: d.id, type: d.type }));
      else if (data) rels[name] = { id: data.id, type: data.type };
      else rels[name] = null;
    }
    if (Object.keys(rels).length) out.relationships = rels;
  }
  return out;
}

/** Collapse a full JSON:API payload (single or list) into a friendly shape. */
export function flatten(payload: any): any {
  if (!payload || typeof payload !== "object") return payload;
  const data = payload.data;
  if (Array.isArray(data)) {
    return {
      items: data.map(flattenRecord),
      meta: payload.meta ?? undefined,
      links: payload.links ?? undefined,
    };
  }
  if (data && typeof data === "object") return flattenRecord(data);
  return payload;
}

/** Pretty-print a flattened result for an MCP text response. */
export function render(payload: any): string {
  return JSON.stringify(flatten(payload), null, 2);
}
