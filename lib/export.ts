import type { ImageFile, OutputField, OUTPUT_FIELD_LABELS } from "./types";

function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportToJSON(
  images: ImageFile[],
  enabledOutputs: OutputField[],
): string {
  const data = images
    .filter((img) => img.status === "complete" && img.result)
    .map((img) => {
      const entry: Record<string, unknown> = { filename: img.file.name };
      if (img.blobUrl) {
        entry.imageUrl = img.blobUrl;
      }
      for (const field of enabledOutputs) {
        if (img.result) {
          entry[field] = img.result[field];
        }
      }
      return entry;
    });
  return JSON.stringify(data, null, 2);
}

export function exportToCSV(
  images: ImageFile[],
  enabledOutputs: OutputField[],
  fieldLabels: typeof OUTPUT_FIELD_LABELS,
): string {
  const completed = images.filter(
    (img) => img.status === "complete" && img.result,
  );
  if (completed.length === 0) return "";

  // Shopify-compatible headers for export
  const headers = [
    "Handle",
    "Title",
    "Body",
    "Vendor",
    "Product Category",
    "Type",
    "Tags",
    "Published",
    "Option1 Name",
    "Option1 Value",
    "Variant SKU",
    "Variant Grams",
    "Variant Inventory Tracker",
    "Variant Price",
    "Image Src",
    "Image Position",
    "SEO Title",
    "SEO Description",
    "Variant Weight Unit",
    "Status",
  ];

  const rows = completed.map((img) => {
    const result = img.result;
    const title = result?.title || "";
    const handle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Tags - comma-separated
    const tags = Array.isArray(result?.tags) ? result.tags.join(",") : "";

    const imageSrc = img.blobUrl || "";

    const values = [
      escapeCSV(handle), // Handle - generated from title
      escapeCSV(title), // Title - from AI result
      escapeCSV(""), // Body - empty
      escapeCSV("TaTTTy"), // Vendor - static default
      escapeCSV(
        "Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Materials > Artwork",
      ), // Product Category - static default
      escapeCSV("Digital Tattoo Art"), // Type - static default
      escapeCSV(tags), // Tags - comma-separated from AI result
      escapeCSV("TRUE"), // Published - static default
      escapeCSV("Title"), // Option1 Name - static default
      escapeCSV("Default Title"), // Option1 Value - static default
      escapeCSV(""), // Variant SKU - empty for digital
      escapeCSV("0"), // Variant Grams - static default
      escapeCSV(""), // Variant Inventory Tracker - empty for digital
      escapeCSV("$5"), // Variant Price - static default
      escapeCSV(imageSrc), // Image Src - from blob URL
      escapeCSV("1"), // Image Position - static default
      escapeCSV(""), // SEO Title - empty
      escapeCSV(""), // SEO Description - empty
      escapeCSV("0"), // Variant Weight Unit - static default
      escapeCSV("active"), // Status - static default
    ];
    return values.join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
