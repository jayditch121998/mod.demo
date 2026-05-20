import { WebhookListenerPanel } from "@/components/WebhookListenerPanel";
import Link from "next/link";
import { ArrowLeft, Radio } from "lucide-react";

export default function ListenerPage() {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-zinc-950 min-h-screen flex flex-col">
        <div className="px-5 py-5 border-b border-zinc-800 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 text-zinc-950" strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-tight">Listener</span>
            <span className="ml-1.5 text-[10px] text-zinc-500 font-medium">webhook</span>
          </div>
        </div>

        <div className="flex-1 px-3 py-4">
          <p className="text-xs text-zinc-600 px-2 mb-3 leading-relaxed">
            Receives and displays all incoming webhook payloads in real-time.
          </p>
        </div>

        <div className="px-3 py-4 border-t border-zinc-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-200 transition-colors px-2 py-1.5 rounded-md hover:bg-zinc-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to playground
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              Webhook Listener
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live feed of all incoming webhook payloads
            </p>
          </div>
          <div className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-600">
            ● Live
          </div>
        </header>

        <main className="flex-1 px-8 py-8">
          <WebhookListenerPanel />
        </main>
      </div>
    </div>
  );
}
