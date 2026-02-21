import { z } from "zod";

// Zod schema for AI image analysis output validation
export const imageAnalysisSchema = z.object({
  title: z
    .string()
    .nullable()
    .describe("A concise, descriptive title for the image"),
  tags: z
    .array(z.string())
    .nullable()
    .describe("Relevant tags/keywords for the image, 5-10 items"),
  shortDescription: z
    .string()
    .nullable()
    .describe("A brief 1-2 sentence description of the image"),
  longDescription: z
    .string()
    .nullable()
    .describe("A detailed 3-5 sentence description of the image"),
  generatedPrompt: z
    .string()
    .nullable()
    .describe(
      "A reverse-engineered AI image generation prompt that could recreate this image",
    ),
  colors: z
    .array(z.string())
    .nullable()
    .describe("Dominant colors in the image as descriptive names"),
  mood: z
    .string()
    .nullable()
    .describe("The overall mood or atmosphere of the image"),
  style: z
    .string()
    .nullable()
    .describe("The artistic style or genre of the image"),
  subject: z
    .string()
    .nullable()
    .describe("The main subject or focus of the image"),
  dimensions: z
    .string()
    .nullable()
    .describe("Description of image composition and framing"),
});

export type ImageAnalysisSchema = z.infer<typeof imageAnalysisSchema>;
