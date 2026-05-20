import { NextRequest, NextResponse } from "next/server";
import { getWebhookLog, clearWebhookLog } from "@/lib/webhookStore";

export async function GET() {
  return NextResponse.json(getWebhookLog());
}

export async function DELETE(_req: NextRequest) {
  clearWebhookLog();
  return NextResponse.json({ cleared: true });
}
