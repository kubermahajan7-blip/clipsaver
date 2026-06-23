const { app, BrowserWindow, Tray, Menu, clipboard, ipcMain, nativeImage, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

// Simple built-in JSON file store — no third-party dependency required.
// File lives in the OS-standard per-app data folder (Application Support on
// Mac, AppData/Roaming on Windows), so history survives app restarts.
const STORE_PATH = path.join(app.getPath('userData'), 'clipsaver-history.json');

function readStoreFile() {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch (err) {
    return []; // file doesn't exist yet, or is corrupted/empty — start fresh
  }
}

function writeStoreFile(items) {
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify({ items }, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write clipboard history to disk:', err);
  }
}

const store = {
  get: (_key, fallback) => readStoreFile() ?? fallback,
  set: (_key, items) => writeStoreFile(items)
};

let mainWindow = null;
let tray = null;
let lastClipboardText = '';
let pollInterval = null;

const MAX_HISTORY = 500; // cap unpinned history so the file doesn't grow forever

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 600,
    minWidth: 320,
    minHeight: 400,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Hide instead of close, so the app keeps running in the background/tray
  mainWindow.on('close', (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function toggleWindow() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

function createTray() {
  const iconPath = path.join(__dirname, '..', 'assets', 'tray.ico');
  let icon = nativeImage.createFromPath(iconPath);
  // On Windows the taskbar/tray prefers a small, crisp image; resize defensively
  // in case the source ever changes size, so the tray never looks blank.
  if (!icon.isEmpty()) {
    icon = icon.resize({ width: 16, height: 16 });
  }
  tray = new Tray(icon);
  tray.setToolTip('ClipSaver');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open ClipSaver', click: toggleWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuiting = true; app.quit(); } }
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('click', toggleWindow);
}

function getItems() {
  return store.get('items', []);
}

function saveItems(items) {
  store.set('items', items);
}

function addClipboardItem(text) {
  if (!text || !text.trim()) return;
  const items = getItems();

  // Avoid duplicate back-to-back entries
  if (items.length && items[0].text === text) return;

  const newItem = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
    text,
    pinned: false,
    createdAt: new Date().toISOString()
  };

  items.unshift(newItem);

  // Trim unpinned items beyond the cap, keep all pinned ones
  const pinned = items.filter(i => i.pinned);
  const unpinned = items.filter(i => !i.pinned).slice(0, MAX_HISTORY);
  const trimmed = [...unpinned, ...pinned].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  saveItems(trimmed);

  if (mainWindow) {
    mainWindow.webContents.send('history-updated', trimmed);
  }
}

function startClipboardWatcher() {
  lastClipboardText = clipboard.readText() || '';
  pollInterval = setInterval(() => {
    const current = clipboard.readText();
    if (current && current !== lastClipboardText) {
      lastClipboardText = current;
      addClipboardItem(current);
    }
  }, 800); // poll every 0.8s - light on CPU, feels instant to the user
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  startClipboardWatcher();

  // Global shortcut to quickly open the app from anywhere
  globalShortcut.register('Control+Shift+V', toggleWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Keep running in background (tray) on all platforms, including mac
});

app.on('before-quit', () => {
  app.isQuiting = true;
  if (pollInterval) clearInterval(pollInterval);
  globalShortcut.unregisterAll();
});

// ---- IPC handlers ----

ipcMain.handle('get-history', () => {
  return getItems();
});

ipcMain.handle('toggle-pin', (_event, id) => {
  const items = getItems();
  const updated = items.map(i => i.id === id ? { ...i, pinned: !i.pinned } : i);
  saveItems(updated);
  return updated;
});

ipcMain.handle('delete-item', (_event, id) => {
  const items = getItems().filter(i => i.id !== id);
  saveItems(items);
  return items;
});

ipcMain.handle('clear-unpinned', () => {
  const items = getItems().filter(i => i.pinned);
  saveItems(items);
  return items;
});

ipcMain.handle('copy-to-clipboard', (_event, text) => {
  clipboard.writeText(text);
  lastClipboardText = text; // prevent re-capturing our own copy as a "new" item
  return true;
});
