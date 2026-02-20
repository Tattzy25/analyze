import { Search } from "@upstash/search";
import { type NextRequest, NextResponse } from "next/server";

type SearchContent = {
  "Image URL": string;
  Title: string;
  Tags: string;
  "Short Description": string;
  Colors: string;
  Mood: string;
  Style: string;
  Subject: string;
  Dimensions: string;
};

type SearchMetadata = {
  sku: string;
  filename: string;
  indexedAt: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      imageUrl,
      sku,
      filename,
      title,
      tags,
      shortDescription,
      colors,
      mood,
      style,
      subject,
      dimensions,
    } = body as {
      id: string;
      imageUrl: string;
      sku: string;
      filename: string;
      title: string;
      tags: string[];
      shortDescription: string;
      colors: string[];
      mood: string;
      style: string;
      subject: string;
      dimensions: string;
    };

    const searchUrl = process.env.UPSTASH_SEARCH_REST_URL;
    const searchToken = process.env.UPSTASH_SEARCH_REST_TOKEN;

    if (!searchUrl || !searchToken) {
      return NextResponse.json(
        { error: "Upstash Search credentials not configured" },
        { status: 500 },
      );
    }

    const client = new Search({
      url: searchUrl,
      token: searchToken,
    });

    const index = client.index<SearchContent, SearchMetadata>("img-base");

    await index.upsert([
      {
        id,
        content: {
          "Image URL": imageUrl || "",
          Title: title || "",
          Tags: Array.isArray(tags) ? tags.join("; ") : tags || "",
          "Short Description": shortDescription || "",
          Colors: Array.isArray(colors) ? colors.join("; ") : colors || "",
          Mood: mood || "",
          Style: style || "",
          Subject: subject || "",
          Dimensions: dimensions || "",
        },
        metadata: {
          sku: sku || "",
          filename,
          indexedAt: new Date().toISOString(),
        },
      },
    ]);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Search indexing error:", error);
    const message = error instanceof Error ? error.message : "Indexing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
