import { generateText, Output } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { imageAnalysisSchema } from "@/lib/zod-schema";
import type { OutputField, ToneOption } from "@/lib/types";
import { OUTPUT_FIELD_DESCRIPTIONS } from "@/lib/types";

export const maxDuration = 60;

const TONE_PROMPTS: Record<ToneOption, string> = {
  neutral: "Use a balanced and objective tone.",
  professional: "Use a formal, business-appropriate tone.",
  casual: "Use a friendly, conversational tone.",
  creative: "Use an imaginative, expressive tone.",
  technical: "Use a detailed, precise, and technical tone.",
  marketing: "Use a persuasive, engaging, marketing-focused tone.",
  custom: "", // Placeholder - uses customTone value
};

export async function POST(req: Request) {
  const body = await req.json();
  const {
    imageBase64,
    mediaType,
    providerType,
    model,
    customModel,
    provider,
    apiKey,
    baseUrl,
    systemMessage,
    tone,
    customTone,
    enabledOutputs,
    outputDescriptions,
  } = body as {
    imageBase64: string;
    mediaType: string;
    providerType: "gateway" | "ollama" | "custom";
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
  };

  // Use customModel if provided, otherwise use model
  const effectiveModel = customModel || model;

  // Build field descriptions with custom overrides
  const fieldDescriptions = enabledOutputs
    .map((field) => {
      const description =
        outputDescriptions?.[field] ?? OUTPUT_FIELD_DESCRIPTIONS[field];
      return `- ${field}: ${description}`;
    })
    .join("\n");

  // Get tone prompt - use customTone if tone is "custom"
  const tonePrompt =
    tone === "custom"
      ? customTone || "Use an appropriate tone for the content."
      : TONE_PROMPTS[tone];

  const fullSystemMessage = [
    systemMessage,
    tonePrompt,
    `Generate the following fields:\n${fieldDescriptions}`,
    "Leave unused fields as empty strings or empty arrays.",
  ].join("\n\n");

  try {
    let modelRef: Parameters<typeof generateText>[0]["model"];

    if (providerType === "gateway") {
      // Vercel AI Gateway - use effectiveModel (customModel if provided, otherwise model)
      modelRef = effectiveModel as Parameters<typeof generateText>[0]["model"];
    } else if (providerType === "ollama") {
      if (!baseUrl) {
        return Response.json(
          { error: "Base URL is required for Ollama" },
          { status: 400 },
        );
      }
      const ollamaProvider = createOpenAICompatible({
        name: "ollama",
        baseURL: baseUrl,
      });
      modelRef = ollamaProvider(effectiveModel);
    } else {
      // Custom OpenAI-compatible provider
      if (!baseUrl) {
        return Response.json(
          { error: "Base URL is required for custom providers" },
          { status: 400 },
        );
      }
      const customProvider = createOpenAICompatible({
        name: "custom",
        baseURL: baseUrl,
        apiKey: apiKey || undefined,
      });
      modelRef = customProvider(effectiveModel);
    }

    const { output } = await generateText({
      model: modelRef,
      output: Output.object({
        schema: imageAnalysisSchema,
      }),
      messages: [
        {
          role: "system",
          content: fullSystemMessage,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "You are an expert image analyst and visual prompt engineer. Your role is to examine each uploaded image with extreme attention to detail and return clean, structured metadata that is accurate, concise, and directly usable in downstream workflows. Describe what is visibly present in the image only, without guessing about anything that cannot be clearly seen. Capture all important elements including subjects, objects, style, colors, composition, lighting, mood, and any clearly implied narrative or context. Adapt the tone of each field to its purpose (e.g., punchy and attention grabbing for titles, keyword style for tags, rich and vivid for long descriptions, technically precise for generated prompts). Follow any fieldspecific instructions exactly, avoid repetition between fields, and never include disclaimers, system messages, or explanations in the output.",
            },
            {
              type: "image",
              image: imageBase64,
            },
          ],
        },
      ],
    });

    // Filter output to only enabled fields, handling nullable values
    const allFields: OutputField[] = [
      "title",
      "tags",
      "shortDescription",
      "prompt",
      "dimensions",
      "imageAltText",
      "mood",
    ];
    const filtered: Record<string, unknown> = {};
    for (const field of allFields) {
      const isArray = field === "tags";
      if (output && enabledOutputs.includes(field)) {
        const val = (output as Record<string, unknown>)[field];
        filtered[field] = val ?? (isArray ? [] : "");
      } else {
        filtered[field] = isArray ? [] : "";
      }
    }

    return Response.json({ result: filtered });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Analysis failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
