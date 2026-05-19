"use client";

export function ResultSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden animate-pulse">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-zinc-200" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-zinc-200 rounded" />
            <div className="h-2.5 w-36 bg-zinc-100 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-10 bg-zinc-100 rounded" />
          <div className="h-6 w-14 bg-zinc-200 rounded-full" />
        </div>
      </div>

      {/* Category bars */}
      <div className="px-5 pb-5 space-y-2.5">
        {[90, 30, 20, 15, 10, 8, 5, 4].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-44 shrink-0">
              <div className="h-2.5 bg-zinc-100 rounded" style={{ width: `${40 + (i % 3) * 20}%` }} />
            </div>
            <div className="flex-1 bg-zinc-100 rounded-full h-1.5">
              <div
                className="h-full bg-zinc-200 rounded-full"
                style={{ width: `${w}%` }}
              />
            </div>
            <div className="w-12 h-2.5 bg-zinc-100 rounded" />
          </div>
        ))}

        {/* Footer toggles */}
        <div className="flex gap-3 pt-2 border-t border-zinc-100 mt-3">
          <div className="h-2.5 w-20 bg-zinc-100 rounded" />
          <div className="h-2.5 w-24 bg-zinc-100 rounded" />
        </div>
      </div>
    </div>
  );
}
