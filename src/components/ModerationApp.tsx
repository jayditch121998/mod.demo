"use client";

import { useState, useEffect } from "react";
import { ProviderNav, PROVIDERS } from "@/components/ProviderNav";
import { TextModerationPanel } from "@/components/TextModerationPanel";
import { ImageModerationPanel } from "@/components/ImageModerationPanel";
import { AlignLeft, ImageIcon } from "lucide-react";

export function ModerationApp() {
  const [provider, setProvider] = useState("openai");
  const [tab, setTab] = useState<"text" | "image">("text");

  const activeProvider = PROVIDERS.find((p) => p.id === provider);

  useEffect(() => {
    if (activeProvider && !activeProvider.supportsText && tab === "text") {
      setTab("image");
    }
  }, [activeProvider, tab]);

  const tabs = [
    { id: "text", label: "Text", icon: AlignLeft, enabled: !!activeProvider?.supportsText },
    { id: "image", label: "Image", icon: ImageIcon, enabled: !!activeProvider?.supportsImage },
  ] as const;

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <ProviderNav selected={provider} onSelect={setProvider} />

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">
              {activeProvider?.name ?? "—"}
              <span className="ml-2 text-sm font-mono text-zinc-400 font-normal">
                {activeProvider?.model}
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Test content moderation on text and images
            </p>
          </div>
          <div className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            activeProvider?.available
              ? "bg-emerald-50 text-emerald-600"
              : "bg-zinc-100 text-zinc-400"
          }`}>
            {activeProvider?.available ? "● Active" : "○ Unavailable"}
          </div>
        </header>

        {/* Tab bar */}
        <div className="bg-white border-b border-zinc-200 px-8 flex gap-0">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                disabled={!t.enabled}
                onClick={() => t.enabled && setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-zinc-900 text-zinc-900"
                    : t.enabled
                    ? "border-transparent text-zinc-400 hover:text-zinc-600"
                    : "border-transparent text-zinc-200 cursor-not-allowed"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <main className="flex-1 px-8 py-8">
          {tab === "text" && <TextModerationPanel provider={provider} />}
          {tab === "image" && <ImageModerationPanel provider={provider} />}
        </main>
      </div>
    </div>
  );
}
