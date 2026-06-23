# ClipSaver

A lightweight, cross-platform clipboard history manager for **Mac and Windows**. Runs quietly in the system tray, automatically saves everything you copy, lets you pin favorites, and stores everything locally on your machine — no cloud, no account, no tracking.

## Features

- 📋 **Auto-save** — every text item you copy is captured automatically, no button to click
- ⭐ **Pin favorites** — star any item to keep it permanently, separate from auto-cleared history
- 🔍 **Search** — quickly filter your clipboard history
- 🖱️ **Click to re-copy** — click any item to put it back on your clipboard
- 💾 **Persistent local storage** — history is saved to a plain JSON file in your OS's standard app-data folder
- 🎯 **Background tray app** — closing the window doesn't quit the app; it keeps tracking your clipboard
- ⌨️ **Global shortcut** — `Ctrl+Shift+V` opens the window from anywhere
- 🔒 **100% local** — no network requests, no telemetry, no external services. Your clipboard data never leaves your machine.

## Screenshots

*(Add your own screenshots here — drag images into this section on GitHub, or reference files in an `/screenshots` folder)*

## Installation

### Option A: Download a prebuilt release

Check the [Releases](../../releases) page for prebuilt installers (`.exe` for Windows, `.dmg` for Mac), if available.

### Option B: Build from source

**Requirements:** [Node.js](https://nodejs.org) v18 or newer.

```bash
git clone https://github.com/YOUR_USERNAME/clipsaver.git
cd clipsaver
npm install
```

**Run it directly (development mode):**

```bash
npm start
```

**Build a standalone installer:**

```bash
# On Windows:
npm run dist:win

# On a Mac:
npm run dist:mac
```

The installer will be in the `dist/` folder. You must build on the OS you're targeting (can't build the Windows installer from a Mac, or vice versa).

## Auto-start on boot (optional)

**Windows:**
1. Install ClipSaver via the built installer.
2. Press `Win + R`, type `shell:startup`, press Enter.
3. Find the ClipSaver shortcut in your Start Menu, right-click → "Open file location".
4. Copy that shortcut into the Startup folder you opened in step 2.

**Mac:**
1. Open **System Settings → General → Login Items**.
2. Click **+** and add ClipSaver.app from your Applications folder.

## Where data is stored

| OS | Path |
|---|---|
| Windows | `%APPDATA%\ClipSaver\clipsaver-history.json` |
| Mac | `~/Library/Application Support/ClipSaver/clipsaver-history.json` |

It's a plain JSON file — open it in any text editor, back it up, or sync it between machines manually if you'd like.

## How it works

ClipSaver is built with [Electron](https://www.electronjs.org/), using:
- Node's `clipboard` module, polled every 800ms, to detect new clipboard content
- A simple built-in JSON file store (no external database) for persistence
- A native system tray icon and a hidden-not-quit window pattern so it runs continuously in the background

No external dependencies beyond Electron itself — intentionally kept minimal so it's easy to audit and modify.

## Limitations

- Captures **text only** — does not currently support images or files copied to the clipboard
- Unpinned history is capped at 500 items (configurable in `src/main.js` via `MAX_HISTORY`) to keep the storage file from growing unbounded
- No cross-device sync (by design — this is a local-only tool)

## Contributing

Contributions are welcome! Some ideas for extensions:
- Image/file clipboard support
- Cross-device sync (optional, opt-in)
- Customizable keyboard shortcuts
- Dark/light theme toggle
- Export history to CSV/Markdown

Feel free to open an issue or submit a pull request.

## License

[MIT](LICENSE) — free to use, modify, and distribute.

---

Created by **Kuber Mahajan**.
