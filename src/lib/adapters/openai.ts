import OpenAI from "openai";
import type { ModerationRequest, ModerationResult, ModerationCategory } from "@/types/moderation";

const PROVIDER = "OpenAI";
const MODEL = "omni-moderation-latest";

export async function runOpenAIModeration(req: ModerationRequest): Promise<ModerationResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const start = Date.now();

  let input: OpenAI.ModerationCreateParams["input"];

  if (req.inputType === "text" && req.text) {
    input = req.text;
  } else if (req.inputType === "image_url" && req.imageUrl) {
    input = [{ type: "image_url", image_url: { url: req.imageUrl } }];
  } else if (req.inputType === "image_base64" && req.imageBase64 && req.imageMimeType) {
    input = [
      {
        type: "image_url",
        image_url: { url: `data:${req.imageMimeType};base64,${req.imageBase64}` },
      },
    ];
  } else {
    throw new Error("Invalid moderation request input");
  }

  const rawRequest = { model: MODEL, input };

  try {
    const response = await client.moderations.create({ model: MODEL, input });
    const result = response.results[0];

    const categoryScores = result.category_scores as unknown as Record<string, number>;
    const categoryFlags = result.categories as unknown as Record<string, boolean>;

    const categories: ModerationCategory[] = Object.keys(categoryScores).map((name) => ({
      name,
      flagged: categoryFlags[name] ?? false,
      score: categoryScores[name] ?? 0,
    }));

    categories.sort((a, b) => b.score - a.score);

    return {
      provider: PROVIDER,
      model: MODEL,
      flagged: result.flagged,
      categories,
      rawRequest,
      rawResponse: response,
      durationMs: Date.now() - start,
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
