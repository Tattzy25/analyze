export type ImageStatus = "pending" | "processing" | "complete" | "error";

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  status: ImageStatus;
  result?: ImageAnalysisResult;
  error?: string;
  blobUrl?: string;
  searchIndexId?: string;
}

export interface ImageAnalysisResult {
  title: string;
  tags: string[];
  shortDescription: string;
  prompt: string;
  dimensions: string;
  imageAltText: string;
  mood: string;
  [key: string]: string | string[];
}

export type OutputField =
  | "title"
  | "tags"
  | "shortDescription"
  | "prompt"
  | "dimensions"
  | "imageAltText"
  | "mood";

export type ToneOption =
  | "neutral"
  | "professional"
  | "casual"
  | "creative"
  | "technical"
  | "marketing"
  | "custom";

export type ExportFormat = "json" | "csv";

export type ProviderType = "gateway" | "ollama" | "custom";

export interface ProviderConfig {
  type: ProviderType;
  model: string;
  customModel?: string;
  provider?: string;
  apiKey?: string;
  baseUrl?: string;
  systemMessage: string;
  tone: ToneOption;
  customTone?: string;
  enabledOutputs: OutputField[];
  outputDescriptions?: Partial<Record<OutputField, string>>;
}

export const DEFAULT_PROVIDER_CONFIG: ProviderConfig = {
  type: "gateway",
  model: "anthropic/claude-sonnet-4.6",
  systemMessage:
    "You are an expert image analyst and visual prompt engineer. Your role is to examine each uploaded image with extreme attention to detail and return clean, structured metadata that is accurate, concise, and directly usable in downstream workflows. Describe what is visibly present in the image only, without guessing about anything that cannot be clearly seen. Capture all important elements including subjects, objects, style, colors, composition, lighting, mood, and any clearly implied narrative or context. Adapt the tone of each field to its purpose (e.g., punchy and attention grabbing for titles, keyword style for tags, rich and vivid for long descriptions, technically precise for generated prompts). Follow any fieldspecific instructions exactly, avoid repetition between fields, and never include disclaimers, system messages, or explanations in the output image analyst and visual prompt engineer. Your role is to examine each uploaded image with extreme attention to detail and return clean, structured metadata that is accurate, concise, and directly usable in downstream workflows. Describe what is visibly present in the image only, without guessing about anything that cannot be clearly seen. Capture all important elements including subjects, objects, style, colors, composition, lighting, mood, and any clearly implied narrative or context. Adapt the tone of each field to its purpose (e.g., punchy and attention grabbing for titles, keyword style for tags, rich and vivid for long descriptions, technically precise for generated prompts). Follow any fieldspecific instructions exactly, avoid repetition between fields, and never include disclaimers, system messages, or explanations in the output",
  tone: "professional",
  enabledOutputs: [
    "title",
    "tags",
    "shortDescription",
    "prompt",
    "dimensions",
    "imageAltText",
    "mood",
  ],
};

export const TONE_DESCRIPTIONS: Record<ToneOption, string> = {
  neutral: "Balanced and objective",
  professional: "Formal and business-appropriate",
  casual: "Friendly and conversational",
  creative: "Imaginative and expressive",
  technical: "Detailed and precise",
  marketing: "Persuasive and engaging",
  custom: "Define your own tone",
};

export const OUTPUT_FIELD_LABELS: Record<OutputField, string> = {
  title: "Title",
  tags: "Tags",
  shortDescription: "Short Description",
  prompt: "Prompt",
  dimensions: "Dimensions",
  imageAltText: "Image Alt Text",
  mood: "Mood",
};

export const OUTPUT_FIELD_DESCRIPTIONS: Record<OutputField, string> = {
  title:
    "A short, 2-word max title that grabs attention and names the core subject or hook of the image",
  tags: "20+ comma-separated tags, each 2-3 words max; include color scheme (black and white or full color), tattoo style, portrait/landscape orientation, tattoo-related themes, filtering keywords; Shopify/search-optimized for discoverability and sales",
  shortDescription:
    "A punchy 1-2 sentence hook that instantly captivates the viewer, spotlighting the most striking visual element and tattoo appeal in 2 seconds",
  prompt:
    "Ultra-precise, exhaustive AI generation prompt recreating every exact detail: subjects/objects with linework, angles/poses/directions (e.g., head tilted slightly left), textures, shading, composition, lighting/shadows, colors, intricate elements, precise positioning/proportions, style cues, quality enhancers; copy-paste ready for identical recreation",
  dimensions: "Single word: landscape, portrait, or square",
  imageAltText:
    "Accessible alternative text: concise, specific text that conveys the image's meaning and purpose for screen readers (focus on what matters, not exhaustive detail)",
  mood: "The overall emotional tone/atmosphere conveyed by the image (e.g., calm, tense, playful, nostalgic), based on lighting, color, and subject matter",
};

export const GATEWAY_MODELS = [
  { value: "anthropic/claude-sonnet-4.6", label: "sonnet4.6" },
  { value: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
  { value: "google/gemini-2.5-flash-preview-04-17", label: "Gemini 2.5 Flash" },
  { value: "custom", label: "Custom" },
];
