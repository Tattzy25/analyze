import { generateText, Output } from "ai"
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import { imageAnalysisSchema } from "@/lib/schema"
import type { OutputField, ToneOption } from "@/lib/types"

export const maxDuration = 60

const TONE_PROMPTS: Record<ToneOption, string> = {
  neutral: "Use a balanced and objective tone.",
  professional: "Use a formal, business-appropriate tone.",
  casual: "Use a friendly, conversational tone.",
  creative: "Use an imaginative, expressive tone.",
  technical: "Use a detailed, precise, and technical tone.",
  marketing: "Use a persuasive, engaging, marketing-focused tone.",
}

export async function POST(req: Request) {
  const body = await req.json()
  const {
    imageBase64,
    mediaType,
    providerType,
    model,
    apiKey,
    baseUrl,
    systemMessage,
    tone,
    enabledOutputs,
  } = body as {
    imageBase64: string
    mediaType: string
    providerType: "gateway" | "ollama" | "custom"
    model: string
    apiKey?: string
    baseUrl?: string
    systemMessage: string
    tone: ToneOption
    enabledOutputs: OutputField[]
  }

  const outputFieldsStr = enabledOutputs.join(", ")

  const fullSystemMessage = [
    systemMessage,
    TONE_PROMPTS[tone],
    `Only generate the following fields: ${outputFieldsStr}. Leave unused fields as empty strings or empty arrays.`,
  ].join("\n\n")

  try {
    let modelRef: Parameters<typeof generateText>[0]["model"]

    if (providerType === "gateway") {
      // Vercel AI Gateway - just pass model string
      modelRef = model as Parameters<typeof generateText>[0]["model"]
    } else if (providerType === "ollama") {
      const ollamaProvider = createOpenAICompatible({
        name: "ollama",
        baseURL: baseUrl || "http://localhost:11434/v1",
      })
      const modelName = model.startsWith("ollama/") ? model.slice(7) : model
      modelRef = ollamaProvider(modelName)
    } else {
      // Custom OpenAI-compatible provider
      if (!baseUrl) {
        return Response.json({ error: "Base URL is required for custom providers" }, { status: 400 })
      }
      const customProvider = createOpenAICompatible({
        name: "custom",
        baseURL: baseUrl,
        apiKey: apiKey || undefined,
      })
      modelRef = customProvider(model)
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
              text: "Analyze this image and extract structured metadata for all requested fields.",
            },
            {
              type: "image",
              image: imageBase64,
            },
          ],
        },
      ],
    })

    // Filter output to only enabled fields, handling nullable values
    const allFields: OutputField[] = [
      "title", "tags", "shortDescription", "longDescription",
      "generatedPrompt", "colors", "mood", "style", "subject", "dimensions",
    ]
    const filtered: Record<string, unknown> = {}
    for (const field of allFields) {
      const isArray = field === "tags" || field === "colors"
      if (output && enabledOutputs.includes(field)) {
        const val = output[field]
        filtered[field] = val ?? (isArray ? [] : "")
      } else {
        filtered[field] = isArray ? [] : ""
      }
    }

    return Response.json({ result: filtered })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Analysis failed"
    return Response.json({ error: message }, { status: 500 })
  }
}
