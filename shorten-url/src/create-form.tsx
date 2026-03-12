import { Form, ActionPanel, Action, showToast, Toast, Clipboard, useNavigation } from "@raycast/api";
import { createShortUrl } from "./shlink-api";

interface CreateFormProps {
  onCreate: () => void;
}

export default function CreateForm({ onCreate }: CreateFormProps) {
  const { pop } = useNavigation();

  async function handleSubmit(values: { longUrl: string; customSlug: string }) {
    if (!values.longUrl.trim()) {
      await showToast({ style: Toast.Style.Failure, title: "URL is required" });
      return;
    }

    const toast = await showToast({ style: Toast.Style.Animated, title: "Creating..." });

    try {
      const result = await createShortUrl(values.longUrl.trim(), values.customSlug?.trim() || undefined);
      await Clipboard.copy(result.shortUrl);
      toast.style = Toast.Style.Success;
      toast.title = "Created";
      toast.message = `${result.shortUrl} copied to clipboard`;
      onCreate();
      pop();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed";
      toast.message = error instanceof Error ? error.message : "Unknown error";
    }
  }

  return (
    <Form
      navigationTitle="Create Short URL"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Short URL" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="longUrl" title="Destination URL" placeholder="https://example.com/long-path" />
      <Form.TextField id="customSlug" title="Custom Slug" placeholder="my-link (optional)" />
    </Form>
  );
}
