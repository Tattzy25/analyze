import { z } from "zod";

// Zod schema for AI image analysis output validation
export const imageAnalysisSchema = z.object({
  title: z
    .string()
    .nullable()
    .describe(
      "A short, 2-word max title that grabs attention and names the core subject or hook of the image",
    ),
  tags: z
    .array(z.string())
    .nullable()
    .describe(
      "20+ comma-separated tags, each 2-3 words max; include color scheme (black and white or full color), tattoo style, portrait/landscape orientation, tattoo-related themes, filtering keywords; Shopify/search-optimized for discoverability and sales",
    ),
  shortDescription: z
    .string()
    .nullable()
    .describe(
      "A punchy 1-2 sentence hook that instantly captivates the viewer, spotlighting the most striking visual element and tattoo appeal in 2 seconds",
    ),
  prompt: z
    .string()
    .nullable()
    .describe(
      "Ultra-precise, exhaustive AI generation prompt recreating every exact detail: subjects/objects with linework, angles/poses/directions (e.g., head tilted slightly left), textures, shading, composition, lighting/shadows, colors, intricate elements, precise positioning/proportions, style cues, quality enhancers; copy-paste ready for identical recreation",
    ),
  dimensions: z
    .string()
    .nullable()
    .describe("Single word: landscape, portrait, or square"),
  imageAltText: z
    .string()
    .nullable()
    .describe(
      "Accessible alternative text: concise, specific text that conveys the image's meaning and purpose for screen readers (focus on what matters, not exhaustive detail)",
    ),
  mood: z
    .string()
    .nullable()
    .describe(
      "The overall emotional tone/atmosphere conveyed by the image (e.g., calm, tense, playful, nostalgic), based on lighting, color, and subject matter",
    ),
});

export type ImageAnalysisSchema = z.infer<typeof imageAnalysisSchema>;
