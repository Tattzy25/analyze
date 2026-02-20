import type { ImageFile, OutputField, OUTPUT_FIELD_LABELS } from "./types"

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportToJSON(images: ImageFile[], enabledOutputs: OutputField[]): string {
  const data = images
    .filter((img) => img.status === "complete" && img.result)
    .map((img) => {
      const entry: Record<string, unknown> = { filename: img.file.name }
      if (img.blobUrl) {
        entry.imageUrl = img.blobUrl
      }
      for (const field of enabledOutputs) {
        if (img.result) {
          entry[field] = img.result[field]
        }
      }
      return entry
    })
  return JSON.stringify(data, null, 2)
}

export function exportToCSV(
  images: ImageFile[],
  enabledOutputs: OutputField[],
  fieldLabels: typeof OUTPUT_FIELD_LABELS
): string {
  const completed = images.filter((img) => img.status === "complete" && img.result)
  if (completed.length === 0) return ""

  const hasBlob = completed.some((img) => img.blobUrl)
  const headers = [
    "Filename",
    ...(hasBlob ? ["Image URL"] : []),
    ...enabledOutputs.map((f) => fieldLabels[f]),
  ]
  const rows = completed.map((img) => {
    const values = [
      escapeCSV(img.file.name),
      ...(hasBlob ? [escapeCSV(img.blobUrl || "")] : []),
      ...enabledOutputs.map((field) => {
        const val = img.result?.[field]
        if (Array.isArray(val)) return escapeCSV(val.join("; "))
        return escapeCSV(String(val ?? ""))
      }),
    ]
    return values.join(",")
  })

  return [headers.join(","), ...rows].join("\n")
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
