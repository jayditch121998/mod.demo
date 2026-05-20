// In-memory store for async webhook results keyed by content_id.
// This lives in the Node.js process — fine for a demo. Use Redis for production.
declare global {
  // eslint-disable-next-line no-var
  var __webhookStore: Map<string, unknown> | undefined;
  // eslint-disable-next-line no-var
  var __webhookLog: Array<{ id: string; receivedAt: string; payload: unknown }> | undefined;
}

// Use globals so hot-reload in dev doesn't wipe them
const store: Map<string, unknown> =
  globalThis.__webhookStore ?? (globalThis.__webhookStore = new Map());

// Ordered log of every incoming webhook (all providers)
const log: Array<{ id: string; receivedAt: string; payload: unknown }> =
  globalThis.__webhookLog ?? (globalThis.__webhookLog = []);

export function setWebhookResult(contentId: string | number, payload: unknown) {
  store.set(String(contentId), payload);
  // Also append to the global ordered log
  log.unshift({ id: String(contentId), receivedAt: new Date().toISOString(), payload });
}

export function getWebhookResult(contentId: string | number): unknown | null {
  return store.get(String(contentId)) ?? null;
}

export function getAllWebhookResults(): { contentId: string; payload: unknown }[] {
  return Array.from(store.entries())
    .map(([contentId, payload]) => ({ contentId, payload }))
    .reverse();
}

export function getWebhookLog(): Array<{ id: string; receivedAt: string; payload: unknown }> {
  return log;
}

export function clearWebhookLog() {
  log.splice(0, log.length);
}
