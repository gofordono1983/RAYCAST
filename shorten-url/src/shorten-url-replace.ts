import {
  getSelectedText,
  Clipboard,
  showHUD,
  showToast,
  Toast,
  getPreferenceValues,
} from "@raycast/api";
import { extractUrl, shortenUrl } from "./shared";

export default async function Command() {
  const { shlinkUrl, shlinkApiKey, customSchemes } =
    getPreferenceValues<ExtensionPreferences>();

  let selectedText: string | undefined;
  try {
    selectedText = await getSelectedText();
  } catch {
    // No selection
  }

  if (!selectedText?.trim()) {
    await showHUD("⚠️ Select a URL first");
    return;
  }

  const longUrl = extractUrl(selectedText.trim(), customSchemes ?? "");
  if (!longUrl) {
    await showHUD("⚠️ Select a URL first");
    return;
  }

  const toast = await showToast({
    style: Toast.Style.Animated,
    title: "Shortening...",
  });

  try {
    const shortUrl = await shortenUrl(shlinkUrl, shlinkApiKey, longUrl);
    await Clipboard.paste(shortUrl);
    await Clipboard.copy(shortUrl);
    toast.hide();
    await showHUD(`✅ Replaced: ${shortUrl}`);
  } catch (error) {
    toast.style = Toast.Style.Failure;
    toast.title = "Failed";
    toast.message = error instanceof Error ? error.message : "Unknown error";
  }
}
