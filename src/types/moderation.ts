export type ModerationInputType = "text" | "image_url" | "image_base64";

export interface ModerationCategory {
  name: string;
  flagged: boolean;
  score: number; // 0–1
}

export interface ModerationResult {
  provider: string;
  model: string;
  flagged: boolean;
  categories: ModerationCategory[];
  rawRequest: unknown;
  rawResponse: unknown;
  durationMs: number;
  error?: string;
  // async moderation fields
  status?: "complete" | "pending";
  contentId?: number | string;
  webhookPayload?: unknown;
}

export interface ModerationRequest {
  inputType: ModerationInputType;
  text?: string;
  imageUrl?: string;
  imageBase64?: string;
  imageMimeType?: string;
  notes?: string;
}
