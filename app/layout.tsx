import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://analyzer-alpha.vercel.app"),
  title: {
    default: "Image Analyzer - AI-Powered Image Metadata Extraction",
    template: "%s | Image Analyzer",
  },
  description:
    "Upload images and generate AI-powered titles, descriptions, tags, colors, mood, style, and metadata using advanced vision models like GPT-4o, Claude, and Gemini.",
  keywords: [
    "image analysis",
    "AI metadata",
    "image tagging",
    "vision AI",
    "anthropic/claude-sonnet-4.6",
    "image description",
    "automated tagging",
    "image metadata extraction",
  ],
  authors: [{ name: "Image Analyzer" }],
  creator: "Image Analyzer",
  publisher: "Image Analyzer",
  generator: "Next.js",
  applicationName: "Image Analyzer",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://analyzer-alpha.vercel.app/",
    siteName: "Image Analyzer",
    title: "Image Analyzer - AI-Powered Image Metadata Extraction",
    description:
      "Upload images and generate AI-powered titles, descriptions, tags, colors, mood, style, and metadata using advanced vision models.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Image Analyzer - AI-Powered Metadata Extraction",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Analyzer - AI-Powered Image Metadata Extraction",
    description:
      "Upload images and generate AI-powered titles, descriptions, tags, and metadata using advanced vision models.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://analyzer-alpha.vercel.app/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster theme="dark" richColors position="bottom-right" />
        <Analytics />
      </body>
    </html>
  );
}
