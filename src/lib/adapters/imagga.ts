import type { ModerationRequest, ModerationResult, ModerationCategory } from "@/types/moderation";

const PROVIDER = "Imagga";
const MODEL = "adult_content";
const BASE_URL = "https://api.imagga.com/v2/categories/adult_content";

function authHeader(): string {
  return `Basic ${process.env.IMAGGA_BASIC_TOKEN ?? ""}`;
}

export async function runImaggaModeration(req: ModerationRequest): Promise<ModerationResult> {
  const start = Date.now();

  let rawRequest: unknown;
  let response: Response;

  try {
    if (req.inputType === "image_url" && req.imageUrl) {
      // GET with image_url query param
      const url = new URL(BASE_URL);
      url.searchParams.set("image_url", req.imageUrl);
      rawRequest = { method: "GET", url: url.toString() };

      response = await fetch(url.toString(), {
        method: "GET",
        headers: { Authorization: authHeader() },
      });
    } else if (
      (req.inputType === "image_base64" && req.imageBase64 && req.imageMimeType) ||
      req.inputType === "image_url"
    ) {
      // POST with binary form data
      const form = new FormData();

      if (req.inputType === "image_base64" && req.imageBase64 && req.imageMimeType) {
        const bytes = Buffer.from(req.imageBase64, "base64");
        const blob = new Blob([bytes], { type: req.imageMimeType });
        form.append("image", blob, "upload");
      }

      rawRequest = { method: "POST", url: BASE_URL, body: "FormData(image: <binary>)" };

      response = await fetch(BASE_URL, {
        method: "POST",
        headers: { Authorization: authHeader() },
        body: form,
      });
    } else {
      throw new Error("Imagga only supports image_url or image_base64 inputs");
    }

    const json = await response.json() as ImaggaResponse;

    if (json.status?.type !== "success") {
      throw new Error(json.status?.text ?? "Imagga API error");
    }

    const categories: ModerationCategory[] = json.result.categories.map((cat) => {
      const name = cat.name.en;
      const score = cat.confidence / 100;
      return {
        name,
        flagged: name !== "safe" && score > 0.4,
        score,
      };
    });

    const flagged = categories.some((c) => c.flagged);

    return {
      provider: PROVIDER,
      model: MODEL,
      flagged,
      categories,
      rawRequest,
      rawResponse: json,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      provider: PROVIDER,
      model: MODEL,
      flagged: false,
      categories: [],
      rawRequest: rawRequest ?? {},
      rawResponse: null,
      durationMs: Date.now() - start,
      error: message,
    };
  }
}

interface ImaggaResponse {
  result: {
    categories: {
      confidence: number;
      name: { en: string };
    }[];
  };
  status: {
    text: string;
    type: string;
  };
}
