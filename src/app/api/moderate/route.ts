import { NextRequest, NextResponse } from "next/server";
import { runOpenAIModeration } from "@/lib/adapters/openai";
import { runImaggaModeration } from "@/lib/adapters/imagga";
import { runOperatorPlatformModeration } from "@/lib/adapters/operatorplatform";
import type { ModerationRequest } from "@/types/moderation";

export async function POST(req: NextRequest) {
  try {
    const body: ModerationRequest & { provider: string } = await req.json();
    const { provider, ...moderationReq } = body;

    if (!provider) {
      return NextResponse.json({ error: "Missing provider" }, { status: 400 });
    }

    if (provider === "openai") {
      const result = await runOpenAIModeration(moderationReq);
      return NextResponse.json(result);
    }

    if (provider === "imagga") {
      const result = await runImaggaModeration(moderationReq);
      return NextResponse.json(result);
    }

    if (provider === "operatorplatform") {
      const result = await runOperatorPlatformModeration(moderationReq);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
