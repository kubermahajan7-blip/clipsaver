# Contributing to ClipSaver

Thanks for considering a contribution! This is a small, simple project, so the process is lightweight.

## Getting started

1. Fork the repo and clone your fork
2. `npm install`
3. `npm start` to run the app locally
4. Make your changes
5. Test on your OS (Mac and/or Windows) before submitting
6. Open a pull request with a clear description of what changed and why

## Project structure

```
clipsaver/
├── src/
│   ├── main.js       # Electron main process: clipboard polling, tray, storage, IPC
│   ├── preload.js    # Secure bridge between main process and the UI
│   ├── index.html    # UI markup + styles
│   └── renderer.js   # UI logic: rendering the list, search, pin/delete/copy actions
├── assets/           # App and tray icons
└── package.json
```

## Code style

- Keep it dependency-light — this project intentionally avoids extra npm packages where plain Node/Electron APIs suffice
- Comment non-obvious logic, especially around IPC and storage
- Match the existing formatting (2-space indents, semicolons)

## Reporting bugs

Please include:
- Your OS and version
- Node.js version (`node -v`)
- Steps to reproduce
- What you expected vs. what happened

## Feature requests

Open an issue describing the use case — happy to discuss before any code is written.
