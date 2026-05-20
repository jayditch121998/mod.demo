"use client";

import Link from "next/link";
import { ShieldCheck, ImageIcon, AlignLeft, Radio } from "lucide-react";

export interface NavProvider {
  id: string;
  name: string;
  model: string;
  available: boolean;
  supportsText: boolean;
  supportsImage: boolean;
}

export const PROVIDERS: NavProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    model: "omni-moderation-latest",
    available: true,
    supportsText: true,
    supportsImage: true,
  },
  {
    id: "imagga",
    name: "Imagga",
    model: "adult_content",
    available: true,
    supportsText: false,
    supportsImage: true,
  },
  {
    id: "operatorplatform",
    name: "OperatorPlatform",
    model: "human_review",
    available: true,
    supportsText: true,
    supportsImage: true,
  },
];

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function ProviderNav({ selected, onSelect }: Props) {
  return (
    <aside className="w-56 shrink-0 bg-zinc-950 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-800 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4 text-zinc-950" strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-white font-bold text-sm tracking-tight">mod.ai</span>
          <span className="ml-1.5 text-[10px] text-zinc-500 font-medium">demo</span>
        </div>
      </div>

      {/* Provider list */}
      <div className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-2 mb-2">
          Providers
        </p>
        {PROVIDERS.map((p) => {
          const isSelected = selected === p.id;
          return (
            <button
              key={p.id}
              disabled={!p.available}
              onClick={() => p.available && onSelect(p.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm group ${
                isSelected
                  ? "bg-zinc-800 text-white"
                  : p.available
                  ? "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                  : "text-zinc-700 cursor-not-allowed"
              }`}
            >
              <span className={`block font-medium text-sm ${isSelected ? "text-white" : ""}`}>
                {p.name}
              </span>
              <span className="block text-[11px] font-mono text-zinc-500 truncate mt-0.5">
                {p.model}
              </span>
              <div className="flex gap-1 mt-1.5">
                {p.supportsText && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-400">
                    <AlignLeft className="w-2.5 h-2.5" /> text
                  </span>
                )}
                {p.supportsImage && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-400">
                    <ImageIcon className="w-2.5 h-2.5" /> image
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-zinc-800 space-y-1">
        <Link
          href="/listener"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 transition-colors text-sm"
        >
          <Radio className="w-3.5 h-3.5" />
          <span className="font-medium">Webhook Listener</span>
        </Link>
        <p className="text-[10px] text-zinc-700 px-3">Content Moderation Playground</p>
      </div>
    </aside>
  );
}
