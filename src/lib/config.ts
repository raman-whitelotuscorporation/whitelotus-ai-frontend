/**
 * Centralised runtime configuration derived from environment variables.
 * All NEXT_PUBLIC_* values are inlined at build time by Next.js.
 */

/** Base URL of the documentation site. Falls back to "/docs" for local dev
 *  when NEXT_PUBLIC_DOCS_URL is not set. */
export const DOCS_URL: string =
  process.env.NEXT_PUBLIC_DOCS_URL ?? "/docs";

/**
 * File extensions accepted by the knowledge-base ingest endpoint.
 * Used by both KnowledgeBase and ChatInput so both pickers advertise
 * the same supported formats.
 */
export const ACCEPTED_FILE_TYPES =
  ".pdf,.docx,.xlsx,.pptx,.odt,.ods,.odp,.csv,.tsv,.json,.xml,.html,.htm,.rtf,.eml,.txt,.md,.png,.jpg,.jpeg,.webp,.bmp,.tiff,.tif";
