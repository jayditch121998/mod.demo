import { NextRequest, NextResponse } from "next/server";
import { getWebhookResult } from "@/lib/webhookStore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const { contentId } = await params;
  const result = getWebhookResult(contentId);

  if (!result) {
    return NextResponse.json({ status: "pending" });
  }

  return NextResponse.json({ status: "complete", payload: result });
}
