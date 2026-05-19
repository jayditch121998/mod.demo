"use client";

import type { ModerationCategory } from "@/types/moderation";

interface Props {
  categories: ModerationCategory[];
}

function barColor(score: number, flagged: boolean): string {
  if (flagged || score >= 0.7) return "bg-red-500";
  if (score >= 0.3) return "bg-amber-400";
  return "bg-emerald-400";
}

function scoreTextColor(score: number, flagged: boolean): string {
  if (flagged || score >= 0.7) return "text-red-500";
  if (score >= 0.3) return "text-amber-500";
  return "text-emerald-600";
}

export function CategoryBar({ categories }: Props) {
  if (categories.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {categories.map((cat) => (
        <div key={cat.name} className="flex items-center gap-3">
          <div className="w-44 shrink-0 flex items-center gap-1.5">
            {cat.flagged && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            )}
            <span className={`text-xs font-mono truncate ${cat.flagged ? "text-zinc-700 font-semibold" : "text-zinc-400"}`}>
              {cat.name}
            </span>
          </div>
          <div className="flex-1 bg-zinc-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor(cat.score, cat.flagged)}`}
              style={{ width: `${Math.max(cat.score * 100, 0.5)}%` }}
            />
          </div>
          <span className={`w-12 text-right text-xs font-mono font-medium ${scoreTextColor(cat.score, cat.flagged)}`}>
            {(cat.score * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}
