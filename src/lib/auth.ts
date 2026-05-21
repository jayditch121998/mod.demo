// Uses Web Crypto API — works in both Edge runtime (middleware) and Node.js (API routes)

const COOKIE_NAME = "modai_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  return process.env.AUTH_SECRET ?? "changeme-set-AUTH_SECRET-in-env";
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function base64urlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): string {
  return atob(str.replace(/-/g, "+").replace(/_/g, "/"));
}

async function sign(payload: string): Promise<string> {
  const key = await getKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return bufToHex(sig);
}

export async function createSessionToken(username: string): Promise<string> {
  const payload = `${username}:${Date.now()}`;
  const sig = await sign(payload);
  return base64urlEncode(`${payload}.${sig}`);
}

export async function verifySessionToken(
  token: string
): Promise<{ username: string } | null> {
  try {
    const decoded = base64urlDecode(token);
    const lastDot = decoded.lastIndexOf(".");
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);

    const expected = await sign(payload);

    // Constant-time comparison
    if (sig.length !== expected.length) return null;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) {
      diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (diff !== 0) return null;

    const [username, ts] = payload.split(":");
    if (Date.now() - Number(ts) > MAX_AGE * 1000) return null;

    return { username };
  } catch {
    return null;
  }
}

export function cookieName() {
  return COOKIE_NAME;
}

export function cookieMaxAge() {
  return MAX_AGE;
}
