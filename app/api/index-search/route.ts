import { Search } from "@upstash/search";
import { type NextRequest, NextResponse } from "next/server";

type SearchContent = {
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
  imageUrl: string;
  filename: string;
  indexedAt: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      imageUrl,
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
          imageUrl,
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
