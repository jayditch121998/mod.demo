import { NextRequest, NextResponse } from "next/server";
import { setWebhookResult } from "@/lib/webhookStore";

// OperatorPlatform calls this URL when a moderator completes their review.
// Configure this URL in your OperatorPlatform dashboard:
//   https://<your-domain>/api/webhook/operatorplatform
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const contentId = payload?.content_id ?? payload?.transaction?.content_id;

    if (!contentId) {
      return NextResponse.json({ error: "Missing content_id in payload" }, { status: 400 });
    }

    setWebhookResult(contentId, payload);
    return NextResponse.json({ received: true, content_id: contentId });
  } catch {
    // Some platforms send form-encoded webhooks
    try {
      const text = await req.text();
      const params = new URLSearchParams(text);
      const dataStr = params.get("data");
      if (dataStr) {
        const payload = JSON.parse(dataStr);
        const contentId = payload?.content_id ?? payload?.transaction?.content_id;
        if (contentId) {
          setWebhookResult(contentId, payload);
          return NextResponse.json({ received: true, content_id: contentId });
        }
      }
    } catch {
      // ignore
    }
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}

// Allow GET for easy webhook URL verification (some platforms ping it)
export async function GET() {
  return NextResponse.json({ status: "ok", endpoint: "operatorplatform-webhook" });
}
