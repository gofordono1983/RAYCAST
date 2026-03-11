# Shorten URL — Raycast Extension

Select a URL anywhere on your screen, press a hotkey, and the shortened link is in your clipboard. That's it.

Uses [Shlink](https://shlink.io) as the URL shortening backend — a self-hosted, open-source link shortener you control.

## What You Need

- **macOS** with [Raycast](https://raycast.com) installed
- **Node.js 22+** — check with `node --version`
- **A running Shlink instance** — this extension talks to your Shlink server's REST API
- **A Shlink API key** — generated on your Shlink server (see below)

## Setup

### 1. Get a Shlink API Key

SSH into whatever server runs your Shlink instance and generate a key:

```bash
# If Shlink runs in Docker:
docker exec shlink shlink api-key:generate --name=raycast

# If Shlink is installed directly:
shlink api-key:generate --name=raycast
```

It will print the key once. **Save it immediately** — Shlink hashes keys and you cannot retrieve them later.

### 2. Install the Extension

```bash
git clone https://github.com/gofordono1983/RAYCAST.git
cd RAYCAST/shorten-url
npm install
npm run dev
```

The `npm run dev` command registers the extension in Raycast. You can stop it with `Ctrl+C` after it says "built extension successfully" — the extension stays installed permanently.

### 3. Configure

The first time you run the command in Raycast, it will prompt you for:

- **Shlink Server URL** — your Shlink instance (e.g. `https://link.example.com`)
- **Shlink API Key** — the key you generated in step 1

These are stored encrypted by Raycast. You can change them later in Raycast Settings > Extensions > Shorten URL.

### 4. Assign a Hotkey (Recommended)

1. Open Raycast
2. Search for "Shorten URL"
3. Press `Enter` on the command
4. Click "Record Hotkey" and press your preferred key combo (e.g. `Ctrl+Opt+S`)

Now you can shorten URLs without ever opening Raycast.

## How to Use

**Option A — Selected text:**
1. Select a URL in any app (browser address bar, a document, an email, anywhere)
2. Press your hotkey
3. Short URL is in your clipboard — paste it wherever you need it

**Option B — Clipboard:**
1. Copy a URL (`Cmd+C`)
2. Press your hotkey
3. Short URL replaces the clipboard contents

The extension tries to read your selected text first. If nothing is selected, it reads from your clipboard. Either way, the shortened link ends up in your clipboard ready to paste.

## What You'll See

- **"Shortening..."** — animated toast while the API call is in progress
- **"Copied: https://dno.sh/abc12"** — brief HUD confirmation when it works
- **"No URL selected or in clipboard"** — nothing to shorten
- **"No URL found"** — the text didn't contain a recognizable URL
- **"Cannot reach Shlink server"** — network issue or wrong server URL
- **"Failed"** — API error with details (bad key, server issue, etc.)

## Troubleshooting

**"Cannot reach Shlink server"**
- Check that your Shlink server URL is correct in extension preferences
- Make sure the server is running and reachable from your Mac
- Try opening the URL in a browser — you should see Shlink's default page

**"API error (401)"**
- Your API key is invalid, expired, or disabled
- Generate a new one: `docker exec shlink shlink api-key:generate --name=raycast`
- Update it in Raycast Settings > Extensions > Shorten URL

**"No text selected" even though you selected something**
- Raycast needs Accessibility permission to read selected text
- Go to System Settings > Privacy & Security > Accessibility
- Make sure Raycast is in the list and toggled on
- If it was denied previously, remove and re-add it

**Extension not appearing in Raycast**
- Re-run `npm run dev` from the `shorten-url/` directory
- Make sure the folder still exists on disk

## Updating

```bash
cd RAYCAST/shorten-url
git pull
npm install
npm run build
```

No need to re-run `npm run dev` for updates — just rebuild.

## How It Works

The extension calls Shlink's REST API (`POST /rest/v3/short-urls`) with the URL you selected. It uses `findIfExists: true` so shortening the same URL twice returns the same short link instead of creating duplicates. The short URL is copied to your clipboard via Raycast's Clipboard API.

The extension is a single TypeScript file (`src/shorten-url.ts`, ~100 lines). No external dependencies beyond the Raycast API.
