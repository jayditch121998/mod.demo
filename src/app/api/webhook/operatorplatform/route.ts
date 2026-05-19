import { NextRequest, NextResponse } from "next/server";
import { setWebhookResult } from "@/lib/webhookStore";

export interface OperatorPlatformWebhookPayload {
  username?: string;
  service_code?: string;
  content?: {
    type?: string;
    url?: string;
    mod_content_id?: number;
    notes?: string;
    result?: string; // stringified JSON
  };
  additional?: Record<string, unknown>;
}

// OperatorPlatform calls this URL when a moderator completes their review.
// Set this in your OperatorPlatform dashboard:
//   https://<your-domain>/api/webhook/operatorplatform
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json() as OperatorPlatformWebhookPayload;

    const contentId = payload?.content?.mod_content_id;
    if (!contentId) {
      return NextResponse.json({ error: "Missing content.mod_content_id in payload" }, { status: 400 });
    }

    // Parse the stringified result object
    let parsedResult: Record<string, number> | null = null;
    if (typeof payload.content?.result === "string") {
      try {
        parsedResult = JSON.parse(payload.content.result);
      } catch {
        // leave null if unparseable
      }
    }

    setWebhookResult(contentId, { ...payload, _parsedResult: parsedResult });
    return NextResponse.json({ received: true, content_id: contentId });
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}

// Allow GET for webhook URL verification
export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "operatorplatform-webhook" });
}
