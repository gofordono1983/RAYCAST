import { getSelectedText, Clipboard } from "@raycast/api";

export interface ShlinkResponse {
  shortUrl: string;
  shortCode: string;
  longUrl: string;
}

export interface ShlinkError {
  detail?: string;
  title?: string;
  status?: number;
}

export async function shortenUrl(
  serverUrl: string,
  apiKey: string,
  longUrl: string,
): Promise<string> {
  const endpoint = `${serverUrl.replace(/\/+$/, "")}/rest/v3/short-urls`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ longUrl, findIfExists: true }),
    });
  } catch {
    throw new Error("Cannot reach Shlink server");
  }

  if (!response.ok) {
    let detail = `API error (${response.status})`;
    try {
      const err = (await response.json()) as ShlinkError;
      detail = err.detail || err.title || detail;
    } catch {
      // Response body was not JSON
    }
    throw new Error(detail);
  }

  const data = (await response.json()) as ShlinkResponse;
  return data.shortUrl;
}

export function extractUrl(text: string, customSchemes: string): string | null {
  // Match http/https URLs
  const httpMatch = text.match(/https?:\/\/[^\s<>"']+/);
  if (httpMatch) return httpMatch[0];

  // Match custom app URL schemes (obsidian://, slack://, etc.)
  const schemes = customSchemes
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (schemes.length > 0) {
    const escaped = schemes.map((s) =>
      s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    );
    const schemePattern = new RegExp(`(${escaped.join("|")})://[^\\s<>"']+`);
    const schemeMatch = text.match(schemePattern);
    if (schemeMatch) return schemeMatch[0];
  }

  // Bare domain (e.g. "google.com/path")
  if (/^[\w][\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(text.trim())) {
    return `https://${text.trim()}`;
  }

  return null;
}

export type UrlSource =
  | { kind: "selected"; url: string }
  | { kind: "clipboard"; url: string }
  | { kind: "none" };

export async function resolveUrlSource(customSchemes: string): Promise<UrlSource> {
  // CRITICAL: Read clipboard FIRST, before getSelectedText()
  // Raycast's getSelectedText() can simulate Cmd+C internally, clobbering clipboard
  const clipboardText = await Clipboard.readText();

  let selectedText: string | undefined;
  try {
    selectedText = await getSelectedText();
  } catch {
    // No selection available
  }

  // If selected text contains a URL, use it
  if (selectedText?.trim()) {
    const url = extractUrl(selectedText.trim(), customSchemes);
    if (url) return { kind: "selected", url };
  }

  // Fall back to clipboard
  if (clipboardText?.trim()) {
    const url = extractUrl(clipboardText.trim(), customSchemes);
    if (url) return { kind: "clipboard", url };
  }

  return { kind: "none" };
}
