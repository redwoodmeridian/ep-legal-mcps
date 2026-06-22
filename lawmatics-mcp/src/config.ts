import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

export interface LawmaticsConfig {
  /** Non-expiring OAuth bearer access token for a single firm's Lawmatics account. */
  accessToken: string;
  /** API base. Defaults to the production host. */
  baseUrl: string;
  /** Optional OAuth app credentials — only needed to run `lawmatics-mcp auth`. */
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

const CONFIG_DIR = join(homedir(), ".config", "lawmatics-mcp");
export const CONFIG_PATH = join(CONFIG_DIR, "config.json");

const DEFAULT_BASE_URL = "https://api.lawmatics.com";

let cached: LawmaticsConfig | null = null;

/** Read the on-disk config file if present. Returns {} when absent. */
async function readConfigFile(): Promise<Partial<LawmaticsConfig>> {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(raw) as Partial<LawmaticsConfig>;
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw new Error(`Failed to read ${CONFIG_PATH}: ${err}`);
  }
}

/**
 * Resolve config from env first (the standard way to configure an MCP server
 * via its `env` block), falling back to ~/.config/lawmatics-mcp/config.json.
 * A token is required for the server; the auth helper can write one for you.
 */
export async function loadConfig(): Promise<LawmaticsConfig> {
  if (cached) return cached;

  const file = await readConfigFile();

  const accessToken = process.env.LAWMATICS_ACCESS_TOKEN ?? file.accessToken ?? "";
  const baseUrl = process.env.LAWMATICS_BASE_URL ?? file.baseUrl ?? DEFAULT_BASE_URL;

  if (!accessToken) {
    throw new Error(
      "No Lawmatics access token found. Set LAWMATICS_ACCESS_TOKEN in the MCP server env, " +
        `or run \`lawmatics-mcp auth\` to obtain and save one to ${CONFIG_PATH}.`,
    );
  }

  cached = {
    accessToken,
    baseUrl,
    clientId: process.env.LAWMATICS_CLIENT_ID ?? file.clientId,
    clientSecret: process.env.LAWMATICS_CLIENT_SECRET ?? file.clientSecret,
    redirectUri: process.env.LAWMATICS_REDIRECT_URI ?? file.redirectUri,
  };
  return cached;
}

/** Load only the OAuth-app fields (no token required) — used by the auth helper. */
export async function loadOAuthAppConfig(): Promise<{
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  baseUrl: string;
}> {
  const file = await readConfigFile();
  return {
    clientId: process.env.LAWMATICS_CLIENT_ID ?? file.clientId,
    clientSecret: process.env.LAWMATICS_CLIENT_SECRET ?? file.clientSecret,
    redirectUri: process.env.LAWMATICS_REDIRECT_URI ?? file.redirectUri,
    baseUrl: process.env.LAWMATICS_BASE_URL ?? file.baseUrl ?? DEFAULT_BASE_URL,
  };
}

/** Persist a captured token (and any provided app fields) to the config file. */
export async function saveToken(accessToken: string, extra: Partial<LawmaticsConfig> = {}): Promise<string> {
  const existing = await readConfigFile();
  const merged: Partial<LawmaticsConfig> = { ...existing, ...extra, accessToken };
  await mkdir(dirname(CONFIG_PATH), { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(merged, null, 2), { mode: 0o600 });
  cached = null;
  return CONFIG_PATH;
}
