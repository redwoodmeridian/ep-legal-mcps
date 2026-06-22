import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

export interface DvConfig {
  /** Firm API key — `Authorization: Token <key>`. Created at app.decisionvault.com/settings/integrations. */
  apiKey: string;
  /** API base. Defaults to production. */
  baseUrl: string;
}

const CONFIG_DIR = join(homedir(), ".config", "decisionvault-mcp");
export const CONFIG_PATH = join(CONFIG_DIR, "config.json");
const DEFAULT_BASE_URL = "https://api.decisionvault.com";

let cached: DvConfig | null = null;

async function readConfigFile(): Promise<Partial<DvConfig>> {
  try {
    return JSON.parse(await readFile(CONFIG_PATH, "utf-8")) as Partial<DvConfig>;
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw new Error(`Failed to read ${CONFIG_PATH}: ${err}`);
  }
}

export async function loadConfig(): Promise<DvConfig> {
  if (cached) return cached;
  const file = await readConfigFile();
  const apiKey = process.env.DECISIONVAULT_API_KEY ?? file.apiKey ?? "";
  const baseUrl = process.env.DECISIONVAULT_BASE_URL ?? file.baseUrl ?? DEFAULT_BASE_URL;
  if (!apiKey) {
    throw new Error(
      "No DecisionVault API key found. Set DECISIONVAULT_API_KEY, or run `decisionvault-mcp set-key <key>`. " +
        "A firm admin creates the key at https://app.decisionvault.com/settings/integrations (Developer API).",
    );
  }
  cached = { apiKey, baseUrl };
  return cached;
}

export async function saveKey(apiKey: string): Promise<string> {
  const existing = await readConfigFile();
  await mkdir(dirname(CONFIG_PATH), { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify({ ...existing, apiKey: apiKey.trim() }, null, 2), { mode: 0o600 });
  cached = null;
  return CONFIG_PATH;
}
