import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { URL } from "node:url";
import { loadOAuthAppConfig, saveToken, CONFIG_PATH } from "./config.js";

const AUTHORIZE_URL = "https://app.lawmatics.com/oauth/authorize";

function tokenUrl(baseUrl: string): string {
  return new URL("/oauth/token", baseUrl).toString();
}

/** Best-effort: open a URL in the user's browser (macOS/Linux/Windows). */
function openBrowser(url: string): void {
  const cmd =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  try {
    spawn(cmd, args, { stdio: "ignore", detached: true }).unref();
  } catch {
    /* fall through — the URL is printed regardless */
  }
}

/**
 * Run the OAuth2 authorization-code flow over a localhost callback and persist
 * the resulting non-expiring access token. Requires a registered Lawmatics
 * developer app (client id/secret) whose callback URL matches the redirect URI.
 */
export async function runAuth(): Promise<void> {
  const app = await loadOAuthAppConfig();
  const clientId = app.clientId;
  const clientSecret = app.clientSecret;
  // The redirect URI MUST exactly match the one registered on the developer app.
  const redirectUri = app.redirectUri ?? "http://localhost:53682/callback";

  if (!clientId || !clientSecret) {
    console.error(
      "Missing OAuth app credentials. Set LAWMATICS_CLIENT_ID and LAWMATICS_CLIENT_SECRET " +
        `(env or ${CONFIG_PATH}). Create a developer app at https://app.lawmatics.com/settings/developers ` +
        `with callback URL ${redirectUri}.`,
    );
    process.exit(1);
  }

  const redirect = new URL(redirectUri);
  const port = Number(redirect.port || "80");

  const authorize = new URL(AUTHORIZE_URL);
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("response_type", "code");
  const state = Math.random().toString(36).slice(2);
  authorize.searchParams.set("state", state);

  const code: string = await new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      if (!req.url) return;
      const reqUrl = new URL(req.url, redirectUri);
      if (reqUrl.pathname !== redirect.pathname) {
        res.writeHead(404).end("Not found");
        return;
      }
      const returnedCode = reqUrl.searchParams.get("code");
      const returnedState = reqUrl.searchParams.get("state");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        "<html><body style='font-family:sans-serif;padding:3rem'>" +
          (returnedCode
            ? "<h2>Lawmatics connected ✓</h2><p>You can close this tab and return to the terminal.</p>"
            : "<h2>Authorization failed</h2><p>No code returned.</p>") +
          "</body></html>",
      );
      server.close();
      if (!returnedCode) return reject(new Error("No authorization code returned"));
      if (returnedState !== state) return reject(new Error("State mismatch — possible CSRF, aborting"));
      resolve(returnedCode);
    });
    server.on("error", reject);
    server.listen(port, () => {
      console.error(`\nWaiting for Lawmatics authorization on ${redirectUri} …`);
      console.error(`If your browser didn't open, visit:\n${authorize.toString()}\n`);
      openBrowser(authorize.toString());
    });
  });

  // Exchange the grant code for a non-expiring access token.
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch(tokenUrl(app.baseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: body.toString(),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${res.statusText} — ${text.slice(0, 500)}`);
  }
  const json = JSON.parse(text) as { access_token?: string };
  if (!json.access_token) throw new Error(`No access_token in response: ${text.slice(0, 300)}`);

  const path = await saveToken(json.access_token, { clientId, clientSecret, redirectUri });
  console.error(`\n✓ Access token saved to ${path}`);
  console.error("The MCP server will now use it automatically. Keep this file private.");
}
