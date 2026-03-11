import {
  getSelectedText,
  Clipboard,
  showHUD,
  showToast,
  Toast,
  getPreferenceValues,
} from "@raycast/api";

interface ShlinkResponse {
  shortUrl: string;
  shortCode: string;
  longUrl: string;
}

interface ShlinkError {
  detail?: string;
  title?: string;
  status?: number;
}

async function shortenUrl(
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

function extractUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s<>"']+/);
  if (match) return match[0];

  if (/^[\w][\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(text.trim())) {
    return `https://${text.trim()}`;
  }

  return null;
}

export default async function Command() {
  const { shlinkUrl, shlinkApiKey } =
    getPreferenceValues<ExtensionPreferences>();

  // Try selected text first, fall back to clipboard
  let rawText: string | undefined;
  try {
    rawText = await getSelectedText();
  } catch {
    rawText = await Clipboard.readText();
  }

  if (!rawText?.trim()) {
    await showHUD("No URL selected or in clipboard");
    return;
  }

  const longUrl = extractUrl(rawText.trim());
  if (!longUrl) {
    await showHUD("No URL found");
    return;
  }

  const toast = await showToast({
    style: Toast.Style.Animated,
    title: "Shortening...",
  });

  try {
    const shortUrl = await shortenUrl(shlinkUrl, shlinkApiKey, longUrl);
    await Clipboard.copy(shortUrl);
    toast.hide();
    await showHUD(`Copied: ${shortUrl}`);
  } catch (error) {
    toast.style = Toast.Style.Failure;
    toast.title = "Failed";
    toast.message = error instanceof Error ? error.message : "Unknown error";
  }
}
