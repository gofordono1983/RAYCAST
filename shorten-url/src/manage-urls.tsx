import {
  List,
  ActionPanel,
  Action,
  Icon,
  confirmAlert,
  Alert,
  showToast,
  Toast,
} from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { listShortUrls, deleteShortUrl, ShlinkShortUrl } from "./shlink-api";
import CreateForm from "./create-form";
import EditForm from "./edit-form";

export default function ManageUrls() {
  const { data, isLoading, mutate } = useCachedPromise(listShortUrls);

  async function handleDelete(item: ShlinkShortUrl) {
    const confirmed = await confirmAlert({
      title: "Delete Short URL",
      message: `This will permanently delete ${item.shortUrl} and cannot be undone.`,
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (!confirmed) return;

    await mutate(
      (async () => {
        await deleteShortUrl(item.shortCode);
        await showToast({ style: Toast.Style.Success, title: "Deleted", message: item.shortUrl });
      })(),
      {
        optimisticUpdate(currentData) {
          return currentData?.filter((u) => u.shortCode !== item.shortCode);
        },
      }
    );
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Filter short URLs...">
      {data?.map((item) => (
        <List.Item
          key={item.shortCode}
          title={item.shortCode}
          subtitle={item.longUrl.length > 60 ? item.longUrl.slice(0, 60) + "\u2026" : item.longUrl}
          keywords={[item.longUrl, item.shortCode]}
          accessories={[
            { text: `${item.visitsSummary.total} visits`, icon: Icon.Eye },
            { date: new Date(item.dateCreated), tooltip: "Created" },
          ]}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <Action.CopyToClipboard title="Copy Short URL" content={item.shortUrl} />
                <Action.OpenInBrowser url={item.shortUrl} />
                <Action.CopyToClipboard
                  title="Copy Destination URL"
                  content={item.longUrl}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                />
              </ActionPanel.Section>
              <ActionPanel.Section title="Manage">
                <Action.Push
                  title="Edit Destination"
                  icon={Icon.Pencil}
                  shortcut={{ modifiers: ["cmd"], key: "e" }}
                  target={<EditForm item={item} onEdit={() => mutate()} />}
                />
                <Action.Push
                  title="Create New Short URL"
                  icon={Icon.Plus}
                  shortcut={{ modifiers: ["cmd"], key: "n" }}
                  target={<CreateForm onCreate={() => mutate()} />}
                />
              </ActionPanel.Section>
              <ActionPanel.Section title="Danger Zone">
                <Action
                  title="Delete Short URL"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  shortcut={{ modifiers: ["ctrl"], key: "x" }}
                  onAction={() => handleDelete(item)}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
