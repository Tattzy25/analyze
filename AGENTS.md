# AI Agent Guidelines

This document contains critical rules and guidelines for AI agents working on this codebase.

## Project Overview

This is an **Image Analysis Widget** - a Next.js application that allows users to upload images and extract AI-generated metadata using various AI providers (Vercel AI Gateway, Ollama, or custom OpenAI-compatible endpoints).

### Key Features

- Image upload with drag-and-drop support
- AI-powered metadata extraction (title, tags, descriptions, colors, mood, style, subject, dimensions)
- Multiple AI provider support (Vercel AI Gateway, Ollama, custom endpoints)
- Image storage via Vercel Blob
- Search indexing via Upstash Search
- Export results to JSON/CSV

## Security Rules

### CRITICAL: No Dynamic Values in Logs

**All log statements MUST use static strings only. NEVER include dynamic values, regardless of severity.**

#### Bad Examples (DO NOT DO THIS):

```typescript
// BAD - Contains dynamic values
await logger.info(`Task created: ${taskId}`);
await logger.error(`Failed to process ${filename}`);
console.log(`User ${userId} logged in`);
console.error(`Error for ${provider}:`, error);
```

#### Good Examples (DO THIS):

```typescript
// GOOD - Static strings only
await logger.info("Task created");
await logger.error("Failed to process file");
console.log("User logged in");
console.error("Error occurred:", error);
```

#### Rationale:

- **Prevents data leakage**: Dynamic values in logs can expose sensitive information (user IDs, file paths, credentials, etc.) to end users
- **Security by default**: Logs are displayed directly in the UI and returned in API responses
- **No exceptions**: This applies to ALL log levels (info, error, success, command, console.log, console.error, console.warn, etc.)

#### Sensitive Data That Must NEVER Appear in Logs:

- Upstash credentials (UPSTASH_SEARCH_REST_URL, UPSTASH_SEARCH_REST_TOKEN)
- Vercel Blob credentials (BLOB_READ_WRITE_TOKEN)
- User-provided API keys for AI providers
- Image filenames and blob URLs
- Analysis results containing user content
- Error details that may contain sensitive context
- Any dynamic values that could reveal system internals

### Credential Redaction

If a `redactSensitiveInfo()` function exists, it automatically redacts known sensitive patterns, but this is a **backup measure only**. The primary defense is to never log dynamic values in the first place.

#### Current Redaction Patterns:

- API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY, etc.)
- Upstash credentials (UPSTASH_SEARCH_REST_URL, UPSTASH_SEARCH_REST_TOKEN)
- Vercel Blob token (BLOB_READ_WRITE_TOKEN)
- Bearer tokens
- Environment variables containing KEY, TOKEN, SECRET, PASSWORD, URL

## Code Quality Guidelines

### Code Formatting and Quality Checks

**Always run `pnpm format`, `pnpm lint`, and `pnpm build` after making changes to TypeScript/TSX files.**

The project uses Prettier for code formatting, TypeScript for type checking, and ESLint for linting. After editing any `.ts` or `.tsx` files, run:

```bash
pnpm format
pnpm lint
pnpm build
```

**If any errors are found:**

1. **Type errors**: Fix TypeScript type errors by correcting type annotations, adding missing imports, or fixing type mismatches
2. **Lint errors**: Fix ESLint errors by following the suggested fixes or adjusting the code to meet the linting rules
3. **Do not skip or ignore errors** - all errors must be resolved before considering the task complete

This ensures all code follows the project's formatting standards, type safety requirements, and linting rules, preventing issues in pull requests.

### Use shadcn CLI for UI Components

**When adding UI components, check if a shadcn/ui component exists and install it via CLI instead of writing it manually.**

```bash
pnpm dlx shadcn@latest add <component-name>
```

Existing components are in `components/ui/`. See [shadcn/ui docs](https://ui.shadcn.com/) for available components.

### CRITICAL: Never Run Dev Servers

**DO NOT run development servers (e.g., `npm run dev`, `pnpm dev`, `next dev`) as they will conflict with other running instances.**

#### Why This Rule Exists:

- Dev servers run indefinitely and block the terminal session
- Multiple instances on the same port cause conflicts
- The application may already be running in the user's environment
- Long-running processes make the conversation hang for the user

#### Commands to AVOID:

```bash
# DO NOT RUN THESE:
npm run dev
pnpm dev
next dev
npm start
pnpm start
yarn dev
node --watch
nodemon
```

#### What to Do Instead:

1. **Testing changes**: Use `pnpm build` to verify the production build works
2. **Linting**: Use `pnpm lint` to check code quality
3. **If the user needs to test**: Let the user run the dev server themselves

#### Exception:

If the user explicitly asks you to start a dev server, politely explain why you cannot do this and suggest they run it themselves instead.

### Logging Best Practices

1. **Use descriptive static messages**

   ```typescript
   // Instead of logging the value, log the action
   console.log("Image uploaded successfully");
   console.log("Analysis started");
   console.error("Analysis failed");
   ```

2. **Server-side logging for debugging**

   ```typescript
   // Use console.error for server-side debugging (not shown to users)
   // But still avoid sensitive data
   console.error("Blob upload error:", error);
   ```

### Error Handling

1. **Generic error messages to users**

   ```typescript
   return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
   // NOT: return NextResponse.json({ error: `Analysis failed: ${error.message}` }, { status: 500 });
   ```

2. **Detailed server-side logging**
   ```typescript
   console.error("Detailed error for debugging:", error);
   // This appears in server logs, not user-facing logs
   ```

## Configuration Security

### Environment Variables

Never expose these in logs or to the client:

- `UPSTASH_SEARCH_REST_URL` - Upstash Search REST URL
- `UPSTASH_SEARCH_REST_TOKEN` - Upstash Search REST token
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob read/write token (auto-configured on Vercel)
- User-provided API keys passed in request body (for custom AI providers)

### Client-Safe Variables

Currently, no `NEXT_PUBLIC_` variables are used in this project. All configuration is handled server-side or passed dynamically by users.

## Architecture Guidelines

### Application Structure

This is a single-page application with the following structure:

```
app/
├── layout.tsx           # Root layout with theme provider
├── page.tsx             # Main page with all functionality
├── globals.css          # Global styles
└── api/
    ├── analyze/
    │   └── route.ts     # POST - Analyze image with AI
    ├── upload-blob/
    │   └── route.ts     # POST - Upload image to Vercel Blob
    └── index-search/
        └── route.ts     # POST - Index metadata to Upstash Search

components/
├── upload-zone.tsx      # Image upload with drag-and-drop
├── settings-panel.tsx   # AI provider configuration
├── result-card.tsx      # Display analysis results
├── export-bar.tsx       # Export results to JSON/CSV
├── processing-progress.tsx  # Processing progress indicator
├── theme-provider.tsx   # Dark/light theme provider
└── ui/                  # shadcn/ui components

lib/
├── types.ts             # TypeScript types and constants
├── schema.ts            # Zod schema for image analysis
├── image-utils.ts       # Image utility functions
├── export.ts            # Export utilities
└── utils.ts             # General utilities
```

### API Routes

#### `/api/analyze` (POST)

Analyzes an image using AI and returns structured metadata.

**Request body:**

```typescript
{
  imageBase64: string      // Base64-encoded image
  mediaType: string        // MIME type (e.g., "image/jpeg")
  providerType: "gateway" | "ollama" | "custom"
  model: string            // Model identifier (e.g., "openai/gpt-4o")
  apiKey?: string          // API key for custom providers
  baseUrl?: string         // Base URL for Ollama/custom providers
  systemMessage: string    // Custom system prompt
  tone: ToneOption         // Output tone
  enabledOutputs: OutputField[]  // Which fields to generate
}
```

**Response:**

```typescript
{
  result: {
    title: string
    tags: string[]
    shortDescription: string
    longDescription: string
    generatedPrompt: string
    colors: string[]
    mood: string
    style: string
    subject: string
    dimensions: string
  }
}
```

#### `/api/upload-blob` (POST)

Uploads an image to Vercel Blob storage.

**Request:** FormData with `file` and optional `title`

**Response:**

```typescript
{
  url: string; // Public blob URL
  pathname: string; // Blob pathname
}
```

#### `/api/index-search` (POST)

Indexes image metadata to Upstash Search.

**Request body:**

```typescript
{
  id: string
  imageUrl: string
  filename: string
  title: string
  tags: string[]
  shortDescription: string
  colors: string[]
  mood: string
  style: string
  subject: string
  dimensions: string
}
```

**Response:**

```typescript
{
  success: boolean;
  id: string;
}
```

### AI Provider Configuration

The application supports three provider types:

1. **gateway** - Vercel AI Gateway (default)
   - Models: `openai/gpt-4o`, `openai/gpt-4o-mini`, `anthropic/claude-sonnet-4`, `google/gemini-2.5-flash-preview-04-17`
   - No additional configuration needed

2. **ollama** - Local Ollama instance
   - Default base URL: `http://localhost:11434/v1`
   - Uses OpenAI-compatible API

3. **custom** - Any OpenAI-compatible endpoint
   - Requires `baseUrl` and optionally `apiKey`

### Key Types

See `lib/types.ts` for complete type definitions:

- `ImageFile` - Image with upload state and results
- `ImageAnalysisResult` - AI-generated metadata
- `ProviderConfig` - AI provider configuration
- `OutputField` - Available metadata fields
- `ToneOption` - Output tone options

## Compliance Checklist

Before submitting changes, verify:

- [ ] No template literals with `${}` in any log statements
- [ ] All console calls use static strings (for user-facing logs)
- [ ] No sensitive data in error messages
- [ ] Server-side debugging logs don't expose credentials
- [ ] Ran `pnpm format` and code is properly formatted
- [ ] Ran `pnpm lint` and all linting errors are fixed
- [ ] Ran `pnpm build` to verify production build succeeds

## Questions?

If you need to log information for debugging purposes:

1. Use server-side console logs (not shown to users)
2. Still avoid logging sensitive credentials
3. Consider adding better error handling instead of logging details
4. Use generic user-facing messages

---
