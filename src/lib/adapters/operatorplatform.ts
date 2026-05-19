import type { ModerationRequest, ModerationResult } from "@/types/moderation";

const PROVIDER = "OperatorPlatform";
const MODEL = "human_review";

interface SubmitResponse {
  // successful shape
  authentication?: { code: number; response?: string };
  transaction?: { code: number; response?: string; content_id: number };
  // flat error shape e.g. {"code":415,"response":"Invalid file type..."}
  code?: number;
  response?: string;
}

export async function runOperatorPlatformModeration(
  req: ModerationRequest
): Promise<ModerationResult> {
  const start = Date.now();

  const url = process.env.OPERATORPLATFORM_URL ?? "";
  const username = process.env.OPERATORPLATFORM_USERNAME ?? "";
  const password = process.env.OPERATORPLATFORM_PASSWORD ?? "";
  const serviceCode = process.env.OPERATORPLATFORM_SERVICE_CODE ?? "";
  const contributor = process.env.OPERATORPLATFORM_CONTRIBUTOR ?? "demo";

  let contentType: string;
  let contentUrl: string | undefined;

  if (req.inputType === "image_url" && req.imageUrl) {
    contentType = "image";
    contentUrl = req.imageUrl;
  } else if (req.inputType === "text" && req.text) {
    contentType = "text";
  } else {
    throw new Error("OperatorPlatform requires image_url or text input");
  }

  const payload = {
    username,
    password,
    service_code: serviceCode,
    contributor,
    content: {
      type: contentType,
      ...(contentUrl ? { url: contentUrl } : { text: req.text }),
      notes: req.notes ?? "",
    },
    additional: {
      model_type: "demo_submission",
      model_id: 0,
      context_id: 0,
      context_type: "demo",
      context_url: "",
    },
  };

  // Mask password in the logged request
  const rawRequest = {
    method: "POST",
    url,
    body: { ...payload, password: "***" },
  };

  try {
    const body = new URLSearchParams({ data: JSON.stringify(payload) });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const json = (await response.json()) as SubmitResponse;

    // Flat error response (e.g. {"code":415,"response":"Invalid file type..."})
    if (json.code !== undefined && !json.authentication) {
      return {
        provider: PROVIDER,
        model: MODEL,
        flagged: false,
        categories: [],
        rawRequest,
        rawResponse: json,
        durationMs: Date.now() - start,
        error: `Error ${json.code}: ${json.response ?? "Unknown error"}`,
      };
    }

    if ((json.authentication?.code ?? 1) !== 0) {
      const reason = json.authentication?.response ?? JSON.stringify(json);
      return {
        provider: PROVIDER,
        model: MODEL,
        flagged: false,
        categories: [],
        rawRequest,
        rawResponse: json,
        durationMs: Date.now() - start,
        error: `Auth failed (code ${json.authentication?.code ?? "?"}): ${reason}`,
      };
    }

    if ((json.transaction?.code ?? 1) !== 0) {
      const reason = json.transaction?.response ?? JSON.stringify(json);
      return {
        provider: PROVIDER,
        model: MODEL,
        flagged: false,
        categories: [],
        rawRequest,
        rawResponse: json,
        durationMs: Date.now() - start,
        error: `Transaction failed (code ${json.transaction?.code ?? "?"}): ${reason}`,
      };
    }

    return {
      provider: PROVIDER,
      model: MODEL,
      flagged: false,
      categories: [],
      rawRequest,
      rawResponse: json,
      durationMs: Date.now() - start,
      status: "pending",
      contentId: json.transaction?.content_id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      provider: PROVIDER,
      model: MODEL,
      flagged: false,
      categories: [],
      rawRequest,
      rawResponse: null,
      durationMs: Date.now() - start,
      error: message,
    };
  }
}
