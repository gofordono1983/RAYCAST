import { Form, ActionPanel, Action, showToast, Toast, useNavigation } from "@raycast/api";
import { editShortUrl, ShlinkShortUrl } from "./shlink-api";

interface EditFormProps {
  item: ShlinkShortUrl;
  onEdit: () => void;
}

export default function EditForm({ item, onEdit }: EditFormProps) {
  const { pop } = useNavigation();

  async function handleSubmit(values: { longUrl: string }) {
    if (!values.longUrl.trim()) {
      await showToast({ style: Toast.Style.Failure, title: "URL is required" });
      return;
    }

    const toast = await showToast({ style: Toast.Style.Animated, title: "Updating..." });

    try {
      await editShortUrl(item.shortCode, values.longUrl.trim());
      toast.style = Toast.Style.Success;
      toast.title = "Updated";
      toast.message = item.shortUrl;
      onEdit();
      pop();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed";
      toast.message = error instanceof Error ? error.message : "Unknown error";
    }
  }

  return (
    <Form
      navigationTitle="Edit Short URL"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Update Destination" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description title="Short URL" text={item.shortUrl} />
      <Form.Description title="Current Destination" text={item.longUrl} />
      <Form.TextField id="longUrl" title="New Destination URL" defaultValue={item.longUrl} />
    </Form>
  );
}
