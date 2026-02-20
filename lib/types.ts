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
  longDescription: string;
  generatedPrompt: string;
  colors: string[];
  mood: string;
  style: string;
  subject: string;
  dimensions: string;
  [key: string]: string | string[];
}

export type OutputField =
  | "title"
  | "tags"
  | "shortDescription"
  | "longDescription"
  | "generatedPrompt"
  | "colors"
  | "mood"
  | "style"
  | "subject"
  | "dimensions";

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
  model: "openai/gpt-4o",
  systemMessage:
    "You are an expert image analyst. Analyze the provided image carefully and extract structured metadata. Be precise, descriptive, and helpful.",
  tone: "professional",
  enabledOutputs: [
    "title",
    "tags",
    "shortDescription",
    "longDescription",
    "generatedPrompt",
    "colors",
    "mood",
    "style",
    "subject",
    "dimensions",
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
  longDescription: "Long Description",
  generatedPrompt: "Generated Prompt",
  colors: "Colors",
  mood: "Mood",
  style: "Style",
  subject: "Subject",
  dimensions: "Dimensions",
};

export const OUTPUT_FIELD_DESCRIPTIONS: Record<OutputField, string> = {
  title: "A concise, descriptive title for the image",
  tags: "Relevant tags/keywords for the image, 5-10 items",
  shortDescription: "A brief 1-2 sentence description of the image",
  longDescription: "A detailed 3-5 sentence description of the image",
  generatedPrompt:
    "A reverse-engineered AI image generation prompt that could recreate this image",
  colors: "Dominant colors in the image as descriptive names",
  mood: "The overall mood or atmosphere of the image",
  style: "The artistic style or genre of the image",
  subject: "The main subject or focus of the image",
  dimensions: "Description of image composition and framing",
};

export const GATEWAY_MODELS = [
  { value: "openai/gpt-4o", label: "GPT-4o" },
  { value: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { value: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
  { value: "google/gemini-2.5-flash-preview-04-17", label: "Gemini 2.5 Flash" },
  { value: "custom", label: "Custom" },
];
