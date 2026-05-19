"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/ResultCard";
import { Sparkles } from "lucide-react";
import type { ModerationResult } from "@/types/moderation";

const EXAMPLES = [
  { label: "Safe text", value: "The quick brown fox jumps over the lazy dog." },
  { label: "Mild profanity", value: "This is freaking terrible, what the hell were you thinking?" },
  { label: "Violence", value: "I want to punch that guy in the face until he bleeds." },
  { label: "Hate speech", value: "All people from [group] should be eliminated from society." },
];

interface Props {
  provider: string;
}

export function TextModerationPanel({ provider }: Props) {
  const [text, setText] = useState("");
  const [results, setResults] = useState<ModerationResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setResults([]); }, [provider]);

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    setResults([]);

    const res = await fetch("/api/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, inputType: "text", text }),
    });
    const data = await res.json();
    setResults([data]);
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      {/* Example chips */}
      <div>
        <p className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">Quick examples</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => setText(ex.value)}
              className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 transition-all"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <textarea
          placeholder="Paste or type content to moderate..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          className="w-full px-4 py-4 text-sm font-mono text-zinc-800 placeholder:text-zinc-300 resize-none focus:outline-none bg-transparent"
        />
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 bg-zinc-50">
          <span className="text-xs text-zinc-400">{text.length} chars</span>
          <Button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            size="sm"
            className="gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {loading ? "Analyzing..." : "Run Moderation"}
          </Button>
        </div>
      </div>

      {results.map((r, i) => (
        <ResultCard key={i} result={r} />
      ))}
    </div>
  );
}
