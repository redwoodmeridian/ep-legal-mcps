import { loadAuthConfig, saveToken, CONFIG_PATH } from "./config.js";

/**
 * Obtain a WealthCounsel access token via the OAuth2 *password* grant
 * (the "Custom Integrations" flow for a firm's own internal use).
 * Requires a client id/secret from an app registered in the WC member portal
 * (My Practice → Practice Admin → Integrations) plus a WC username/password.
 */
export async function runAuth(): Promise<void> {
  const cfg = await loadAuthConfig();
  if (!cfg) {
    console.error(
      "Missing credentials. Set WEALTHCOUNSEL_CLIENT_ID, WEALTHCOUNSEL_CLIENT_SECRET, " +
        `WEALTHCOUNSEL_USERNAME, WEALTHCOUNSEL_PASSWORD (env or ${CONFIG_PATH}).\n` +
        "Get the client id/secret from My Practice → Practice Admin → Integrations on member.wealthcounsel.com.",
    );
    process.exit(1);
  }

  const body = new URLSearchParams({
    grant_type: "password",
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    username: cfg.username,
    password: cfg.password,
    scope: "contacts:read contacts:write matters:read matters:write",
  });

  const res = await fetch(new URL("/oauth2/token", cfg.baseUrl).toString(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Token request failed: ${res.status} ${res.statusText} — ${text.slice(0, 500)}`);

  const json = JSON.parse(text) as { access_token?: string; expires_in?: number };
  if (!json.access_token) throw new Error(`No access_token in response: ${text.slice(0, 300)}`);

  const path = await saveToken(json.access_token);
  console.error(`✓ Access token saved to ${path}`);
  if (json.expires_in) {
    console.error(`Note: this token expires in ~${Math.round(json.expires_in / 3600)}h — re-run \`auth\` to refresh.`);
  }
}
