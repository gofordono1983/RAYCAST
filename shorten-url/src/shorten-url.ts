import { Clipboard, showHUD, showToast, Toast, getPreferenceValues } from "@raycast/api";
import { resolveUrlSource, shortenUrl } from "./shared";

export default async function Command() {
  const { shlinkUrl, shlinkApiKey, customSchemes } =
    getPreferenceValues<ExtensionPreferences>();

  const source = await resolveUrlSource(customSchemes ?? "");

  if (source.kind === "none") {
    await showHUD("🔍 No URL found in selection or clipboard");
    return;
  }

  const toast = await showToast({
    style: Toast.Style.Animated,
    title: "Shortening...",
  });

  try {
    const shortUrl = await shortenUrl(shlinkUrl, shlinkApiKey, source.url);
    await Clipboard.copy(shortUrl);
    toast.hide();

    if (source.kind === "selected") {
      await showHUD(`✅ Copied: ${shortUrl}`);
    } else {
      await showHUD(`📋 Clipboard shortened: ${shortUrl}`);
    }
  } catch (error) {
    toast.style = Toast.Style.Failure;
    toast.title = "Failed";
    toast.message = error instanceof Error ? error.message : "Unknown error";
  }
}
