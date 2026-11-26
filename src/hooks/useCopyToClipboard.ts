import { useState } from "react";

export function useCopyToClipboard(resetMs = 1800) {
  const [copied, setCopied] = useState(false);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetMs);
    } catch {}
  }

  return { copied, copy };
}
