// In-memory store for async webhook results keyed by content_id.
// This lives in the Node.js process — fine for a demo. Use Redis for production.
declare global {
  // eslint-disable-next-line no-var
  var __webhookStore: Map<string, unknown> | undefined;
}

// Use a global so hot-reload in dev doesn't wipe the map
const store: Map<string, unknown> =
  globalThis.__webhookStore ?? (globalThis.__webhookStore = new Map());

export function setWebhookResult(contentId: string | number, payload: unknown) {
  store.set(String(contentId), payload);
}

export function getWebhookResult(contentId: string | number): unknown | null {
  return store.get(String(contentId)) ?? null;
}
