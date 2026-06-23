const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clipAPI', {
  getHistory: () => ipcRenderer.invoke('get-history'),
  togglePin: (id) => ipcRenderer.invoke('toggle-pin', id),
  deleteItem: (id) => ipcRenderer.invoke('delete-item', id),
  clearUnpinned: () => ipcRenderer.invoke('clear-unpinned'),
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  onHistoryUpdated: (callback) => {
    ipcRenderer.on('history-updated', (_event, items) => callback(items));
  }
});
