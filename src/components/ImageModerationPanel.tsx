"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/ResultCard";
import { UploadCloud, Link2, Sparkles, Loader2 } from "lucide-react";
import { ResultSkeleton } from "@/components/ResultSkeleton";
import type { ModerationResult } from "@/types/moderation";

const EXAMPLE_URLS = [
  {
    label: "Safe landscape",
    value: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
  },
  {
    label: "Safe food",
    value: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg",
  },
];

interface Props {
  provider: string;
}

export function ImageModerationPanel({ provider }: Props) {
  const [imageUrl, setImageUrl] = useState("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedMime, setUploadedMime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [results, setResults] = useState<ModerationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
  const fileRef = useRef<HTMLInputElement>(null);

  const supportsUpload = provider !== "operatorplatform";

  useEffect(() => {
    setResults([]);
    setPreviewSrc(null);
    if (provider === "operatorplatform") setActiveTab("url");
  }, [provider]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const [header, b64] = result.split(",");
      const mime = header.replace("data:", "").replace(";base64", "");
      setUploadedBase64(b64);
      setUploadedMime(mime);
      setPreviewSrc(result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    setLoading(true);
    setResults([]);

    let body: Record<string, unknown>;
    if (activeTab === "url") {
      setPreviewSrc(imageUrl);
      body = { provider, inputType: "image_url", imageUrl, notes };
    } else {
      body = { provider, inputType: "image_base64", imageBase64: uploadedBase64, imageMimeType: uploadedMime, notes };
    }

    const res = await fetch("/api/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setResults([data]);
    setLoading(false);
  }

  const canSubmit =
    !loading &&
    ((activeTab === "url" && imageUrl.trim()) ||
      (activeTab === "upload" && uploadedBase64));

  return (
    <div className="grid grid-cols-2 gap-8 items-start">
      {/* Left — input */}
      <div className="space-y-4">
        {/* URL / Upload switcher */}
        <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg w-fit">
          {([
            { id: "url", label: "Image URL", icon: Link2, enabled: true },
            { id: "upload", label: "Upload File", icon: UploadCloud, enabled: supportsUpload },
          ] as const).map((t) => (
            <button
              key={t.id}
              disabled={!t.enabled}
              onClick={() => t.enabled && setActiveTab(t.id)}
              title={!t.enabled ? "OperatorPlatform requires a public URL — file upload is not supported" : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === t.id && t.enabled
                  ? "bg-white text-zinc-900 shadow-sm"
                  : t.enabled
                  ? "text-zinc-500 hover:text-zinc-700"
                  : "text-zinc-300 cursor-not-allowed"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {!supportsUpload && (
          <p className="text-xs text-zinc-400 bg-zinc-100 px-3 py-2 rounded-lg">
            OperatorPlatform requires a publicly accessible URL — file upload is not supported.
          </p>
        )}

        {activeTab === "url" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide w-full">Quick examples</p>
              {EXAMPLE_URLS.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => { setImageUrl(ex.value); setPreviewSrc(ex.value); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 transition-all"
                >
                  {ex.label}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3">
                <Link2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="flex-1 text-sm font-mono text-zinc-800 placeholder:text-zinc-300 focus:outline-none bg-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <div
            onClick={() => fileRef.current?.click()}
            className="bg-white rounded-xl border-2 border-dashed border-zinc-200 hover:border-zinc-400 transition-colors cursor-pointer p-8 text-center"
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <UploadCloud className="w-7 h-7 text-zinc-300 mx-auto mb-2" />
            {uploadedBase64 ? (
              <p className="text-sm text-zinc-500 font-medium">Image loaded — click to change</p>
            ) : (
              <>
                <p className="text-sm font-medium text-zinc-500">Drop an image or click to browse</p>
                <p className="text-xs text-zinc-300 mt-1">PNG, JPG, WEBP, GIF</p>
              </>
            )}
          </div>
        )}

        {/* Notes — OperatorPlatform only */}
        {provider === "operatorplatform" && (
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-100 bg-zinc-50">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Notes (optional)</span>
            </div>
            <textarea
              placeholder="Add context or notes for the moderator..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 text-sm text-zinc-700 placeholder:text-zinc-300 resize-none focus:outline-none bg-transparent"
            />
          </div>
        )}

        {/* Preview */}
        {previewSrc && (
          <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center max-h-48">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc} alt="Preview" className="max-h-48 object-contain" />
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full gap-1.5 bg-zinc-900 hover:bg-zinc-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
            : <><Sparkles className="w-3.5 h-3.5" /> Run Moderation</>
          }
        </Button>
      </div>

      {/* Right — results */}
      <div className="space-y-4">
        {loading ? (
          <ResultSkeleton />
        ) : results.length === 0 ? (
          <div className="flex items-center justify-center h-48 rounded-xl border border-dashed border-zinc-200 text-zinc-300 text-sm">
            Results will appear here
          </div>
        ) : (
          results.map((r, i) => <ResultCard key={i} result={r} />)
        )}
      </div>
    </div>
  );
}
