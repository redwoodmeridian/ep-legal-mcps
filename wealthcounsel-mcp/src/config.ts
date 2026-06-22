import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

export interface WcConfig {
  /** OAuth2 bearer access token. */
  accessToken: string;
  /** API base. */
  baseUrl: string;
  /** Password-grant credentials — only needed to run `wealthcounsel-mcp auth`. */
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
}

const CONFIG_DIR = join(homedir(), ".config", "wealthcounsel-mcp");
export const CONFIG_PATH = join(CONFIG_DIR, "config.json");
const DEFAULT_BASE_URL = "https://api.wealthcounsel.com";

let cached: WcConfig | null = null;

async function readConfigFile(): Promise<Partial<WcConfig>> {
  try {
    return JSON.parse(await readFile(CONFIG_PATH, "utf-8")) as Partial<WcConfig>;
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw new Error(`Failed to read ${CONFIG_PATH}: ${err}`);
  }
}

export async function loadConfig(): Promise<WcConfig> {
  if (cached) return cached;
  const file = await readConfigFile();
  const accessToken = process.env.WEALTHCOUNSEL_ACCESS_TOKEN ?? file.accessToken ?? "";
  const baseUrl = process.env.WEALTHCOUNSEL_BASE_URL ?? file.baseUrl ?? DEFAULT_BASE_URL;
  if (!accessToken) {
    throw new Error(
      "No WealthCounsel access token found. Set WEALTHCOUNSEL_ACCESS_TOKEN, or run `wealthcounsel-mcp auth` " +
        "with password-grant credentials. API access requires an app registered in the WealthCounsel member " +
        "portal (My Practice → Practice Admin → Integrations) — the website login alone is NOT enough.",
    );
  }
  cached = { accessToken, baseUrl };
  return cached;
}

export async function loadAuthConfig(): Promise<Required<Omit<WcConfig, "accessToken">> | null> {
  const file = await readConfigFile();
  const clientId = process.env.WEALTHCOUNSEL_CLIENT_ID ?? file.clientId;
  const clientSecret = process.env.WEALTHCOUNSEL_CLIENT_SECRET ?? file.clientSecret;
  const username = process.env.WEALTHCOUNSEL_USERNAME ?? file.username;
  const password = process.env.WEALTHCOUNSEL_PASSWORD ?? file.password;
  const baseUrl = process.env.WEALTHCOUNSEL_BASE_URL ?? file.baseUrl ?? DEFAULT_BASE_URL;
  if (!clientId || !clientSecret || !username || !password) return null;
  return { clientId, clientSecret, username, password, baseUrl };
}

export async function saveToken(accessToken: string): Promise<string> {
  const existing = await readConfigFile();
  await mkdir(dirname(CONFIG_PATH), { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify({ ...existing, accessToken }, null, 2), { mode: 0o600 });
  cached = null;
  return CONFIG_PATH;
}
