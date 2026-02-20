import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

function getExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase()
  if (ext && ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff"].includes(ext)) {
    return `.${ext}`
  }
  return ".png"
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const ext = getExtension(file.name)
    const slug = title ? slugify(title) : slugify(file.name.replace(/\.[^/.]+$/, ""))
    const timestamp = Date.now()
    const pathname = `img-base/${slug}-${timestamp}${ext}`

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    })
  } catch (error) {
    console.error("Blob upload error:", error)
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
