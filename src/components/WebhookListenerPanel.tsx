"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check, Radio, Trash2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogEntry {
  id: string;
  receivedAt: string;
  payload: unknown;
}

const TEST_PAYLOAD = {
  username: "demo",
  service_code: "modtest",
  content: {
    type: "image",
    url: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
    mod_content_id: 0,
    notes: "test payload",
    result: JSON.stringify({
      approved: 0, erotica: 0, harmful: 0, hate: 0,
      minors: 0, nudity: 0, porn: 0, safe: 1, sexual: 0,
    }),
  },
  additional: { model_type: "demo_submission", context_type: "demo" },
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function WebhookListenerPanel() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [, setTick] = useState(0); // for relative time refresh

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhook/operatorplatform`
      : "/api/webhook/operatorplatform";

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/webhook/list");
      const data: LogEntry[] = await res.json();
      setEntries(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    if (!isLive) return;
    const interval = setInterval(fetchEntries, 3000);
    return () => clearInterval(interval);
  }, [fetchEntries, isLive]);

  // Refresh relative timestamps every 10s
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 10000);
    return () => clearInterval(t);
  }, []);

  function copyUrl() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function sendTestPayload() {
    setSending(true);
    const payload = {
      ...TEST_PAYLOAD,
      content: {
        ...TEST_PAYLOAD.content,
        mod_content_id: Math.floor(Math.random() * 99999),
      },
    };
    await fetch("/api/webhook/operatorplatform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await fetchEntries();
    setSending(false);
  }

  async function clearAll() {
    await fetch("/api/webhook/list", { method: "DELETE" });
    setEntries([]);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* URL card */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50 flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Webhook URL</span>
          <span className="ml-auto text-xs text-zinc-400">Configure this in your OperatorPlatform dashboard</span>
        </div>
        <div className="flex items-center gap-3 px-5 py-3">
          <code className="flex-1 text-sm font-mono text-zinc-700 truncate">{webhookUrl}</code>
          <button
            onClick={copyUrl}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          onClick={sendTestPayload}
          disabled={sending}
          size="sm"
          variant="outline"
          className="gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${sending ? "animate-spin" : ""}`} />
          {sending ? "Sending..." : "Send test payload"}
        </Button>

        <button
          onClick={() => setIsLive((v) => !v)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            isLive
              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
              : "border-zinc-200 text-zinc-400 hover:bg-zinc-50"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-zinc-300"}`} />
          {isLive ? "Live" : "Paused"}
        </button>

        {entries.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-200 transition-colors ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}

        {entries.length > 0 && (
          <span className="text-xs text-zinc-400">{entries.length} received</span>
        )}
      </div>

      {/* Feed */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-dashed border-zinc-200 text-zinc-300 gap-2">
          <Radio className="w-6 h-6" />
          <span className="text-sm">Waiting for incoming webhooks...</span>
          <span className="text-xs">Use &quot;Send test payload&quot; to trigger one</span>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const isOpen = expanded === entry.id + i;
            const payload = entry.payload as Record<string, unknown>;
            const parsed = (payload?._parsedResult as Record<string, number>) ?? null;
            const isSafe = parsed ? parsed.safe === 1 : null;

            return (
              <div
                key={entry.id + i}
                className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm"
              >
                <button
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50 transition-colors text-left"
                  onClick={() => setExpanded(isOpen ? null : entry.id + i)}
                >
                  {isSafe !== null ? (
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isSafe ? "bg-emerald-400" : "bg-red-400"}`} />
                  ) : (
                    <span className="w-2 h-2 rounded-full shrink-0 bg-blue-400" />
                  )}
                  <span className="text-sm font-mono text-zinc-700 font-medium">id: {entry.id}</span>
                  {isSafe !== null && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isSafe ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    }`}>
                      {isSafe ? "Safe" : "Flagged"}
                    </span>
                  )}
                  <span className="text-xs text-zinc-300 ml-auto mr-2">{timeAgo(entry.receivedAt)}</span>
                  {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-zinc-300 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-300 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-zinc-100">
                    <pre className="text-xs bg-zinc-900 text-emerald-400 p-5 overflow-auto max-h-96 font-mono whitespace-pre-wrap break-all">
                      {JSON.stringify(entry.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
