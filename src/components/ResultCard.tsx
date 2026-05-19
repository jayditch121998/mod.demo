"use client";

import { useState, useEffect } from "react";
import { CategoryBar } from "@/components/CategoryBar";
import {
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Webhook,
} from "lucide-react";
import type { ModerationResult } from "@/types/moderation";

interface Props {
  result: ModerationResult;
}

export function ResultCard({ result: initial }: Props) {
  const [showRaw, setShowRaw] = useState<"request" | "response" | null>(null);
  const [webhookPayload, setWebhookPayload] = useState<unknown>(initial.webhookPayload ?? null);
  const [isPending, setIsPending] = useState(initial.status === "pending");

  // Poll for webhook result when status is pending
  useEffect(() => {
    if (!isPending || !initial.contentId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/webhook/status/${initial.contentId}`);
        const data = await res.json();
        if (data.status === "complete") {
          setWebhookPayload(data.payload);
          setIsPending(false);
          clearInterval(interval);
        }
      } catch {
        // ignore transient fetch errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPending, initial.contentId]);

  const verdict = initial.error ? "error" : isPending ? "pending" : initial.flagged ? "flagged" : "clean";

  const verdictStyles = {
    clean: {
      bg: "bg-emerald-50", border: "border-emerald-200",
      badge: "bg-emerald-100 text-emerald-700",
      icon: ShieldCheck, iconColor: "text-emerald-500", label: "Clean",
    },
    flagged: {
      bg: "bg-red-50", border: "border-red-200",
      badge: "bg-red-100 text-red-700",
      icon: ShieldAlert, iconColor: "text-red-500", label: "Flagged",
    },
    pending: {
      bg: "bg-blue-50", border: "border-blue-200",
      badge: "bg-blue-100 text-blue-600",
      icon: Loader2, iconColor: "text-blue-400", label: "Awaiting review",
    },
    error: {
      bg: "bg-zinc-50", border: "border-zinc-200",
      badge: "bg-zinc-100 text-zinc-500",
      icon: ShieldAlert, iconColor: "text-zinc-400", label: "Error",
    },
  }[verdict];

  const Icon = verdictStyles.icon;

  return (
    <div className={`rounded-xl border ${verdictStyles.border} ${verdictStyles.bg} overflow-hidden`}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon
            className={`w-5 h-5 ${verdictStyles.iconColor} ${isPending ? "animate-spin" : ""}`}
          />
          <div>
            <span className="font-semibold text-zinc-900 text-sm">{initial.provider}</span>
            <span className="ml-2 text-xs font-mono text-zinc-400">{initial.model}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-zinc-400">
            <Clock className="w-3 h-3" />
            {initial.durationMs}ms
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${verdictStyles.badge}`}>
            {verdictStyles.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-4 space-y-4">
        {initial.error ? (
          <p className="text-sm text-red-600 font-mono bg-red-100 px-3 py-2.5 rounded-lg">
            {initial.error}
          </p>
        ) : isPending ? (
          <PendingState contentId={initial.contentId} />
        ) : (
          <>
            {initial.categories.length > 0 && (
              <CategoryBar categories={initial.categories} />
            )}
            {webhookPayload && (
              <WebhookResult payload={webhookPayload} />
            )}
          </>
        )}

        {/* Raw toggles */}
        {!isPending && (
          <div className="flex gap-3 pt-1 border-t border-black/5">
            {(["request", "response"] as const).map((type) => {
              const isOpen = showRaw === type;
              return (
                <button
                  key={type}
                  onClick={() => setShowRaw(isOpen ? null : type)}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  raw {type}
                </button>
              );
            })}
          </div>
        )}

        {showRaw && (
          <pre className="text-xs bg-zinc-900 text-emerald-400 p-4 rounded-lg overflow-auto max-h-72 font-mono whitespace-pre-wrap break-all">
            {JSON.stringify(
              showRaw === "request" ? initial.rawRequest : initial.rawResponse,
              null,
              2
            )}
          </pre>
        )}
      </div>
    </div>
  );
}

function PendingState({ contentId }: { contentId?: number | string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <Webhook className="w-4 h-4" />
        <span className="font-medium">Waiting for moderator review</span>
      </div>
      {contentId && (
        <div className="text-xs font-mono text-zinc-400 bg-zinc-100 px-3 py-1.5 rounded-full">
          content_id: {contentId}
        </div>
      )}
      <p className="text-xs text-zinc-400 text-center max-w-xs">
        The result will appear here automatically once the moderator submits their decision via webhook.
      </p>
      <div className="text-xs text-zinc-300 font-mono">
        POST /api/webhook/operatorplatform
      </div>
    </div>
  );
}

function WebhookResult({ payload }: { payload: unknown }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
        <Webhook className="w-3.5 h-3.5" />
        Webhook received
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        view payload
      </button>
      {expanded && (
        <pre className="text-xs bg-zinc-900 text-emerald-400 p-4 rounded-lg overflow-auto max-h-72 font-mono whitespace-pre-wrap break-all">
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}
    </div>
  );
}
