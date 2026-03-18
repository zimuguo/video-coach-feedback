# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Both apps are independent npm workspaces. All commands must be run from inside the app directory.

```bash
# Development (hot reload)
cd coach-app && npm run dev
cd teacher-app && npm run dev

# Type-check + compile only (no packaging)
cd coach-app && npm run build
cd teacher-app && npm run build

# Build distributable installers → dist-installers/
cd coach-app && npm run package
cd teacher-app && npm run package
```

There is no shared root `package.json`, no test runner, and no lint config. Each app has its own `node_modules`.

## Architecture

### Three-process Electron model

Each app has three execution contexts that cannot share code at runtime:

| Context | Entry point | Can access |
|---|---|---|
| **Main process** | `src/main/index.ts` | Node.js, Electron APIs, filesystem |
| **Preload** | `src/preload/index.ts` | Bridges main ↔ renderer via `contextBridge` |
| **Renderer** | `src/renderer/src/` | React, DOM, `window.electronAPI` only |

The renderer has **no direct filesystem access**. Every file operation goes through `window.electronAPI` (defined in preload), which maps to `ipcMain.handle(...)` calls in the main process.

### IPC API surface

The preload exposes `window.electronAPI`. Any new file or dialog operation requires adding:
1. A handler key in `src/preload/index.ts` (the `contextBridge.exposeInMainWorld` call)
2. The implementation in the main process IPC handler(s)
3. The TypeScript signature in `src/renderer/src/types/index.ts` (the `Window` interface declaration)

In the coach app, IPC handlers are extracted to `src/main/ipc-handlers.ts`. In the teacher app, they are inline in `src/main/index.ts`.

### `localfile://` custom protocol

Local video files cannot be loaded directly via `file://` in the sandboxed renderer. Both apps register a `localfile://` scheme (in `main/index.ts`, before `app.whenReady`) that proxies requests through `net.fetch` + `pathToFileURL`. The renderer receives a `localfile:///absolute/path/to/video.mp4` URL as the `<video src>`.

The scheme registration (`protocol.registerSchemesAsPrivileged`) **must happen synchronously before `app.whenReady()`**, not inside the callback.

### Zustand store as single source of truth

Each app has one store at `src/renderer/src/store/useAppStore.ts`. Video playback state (`currentTime`, `videoDuration`) is written there from `<video>` event handlers, then read by other components. This is how `CommentPanel` knows the current timestamp without being a child of `VideoPlayer`.

The coach store also has `getCommentsFile()` / `getSummaryFile()` methods that serialize current state into the on-disk JSON shape. These are called before every `saveComments`/`saveSummary` IPC call. Comments are auto-saved on every add/edit/delete; the summary is auto-saved on each field blur.

### Data files and naming convention

JSON files are derived from the video filename and stored as siblings:
- `lesson.mp4` → `lesson.comments.json` + `lesson.summary.json`

This derivation happens in the main process (`file:getJsonPaths` IPC handler). The teacher app uses the same handler to locate the files automatically after the teacher selects the video.

### Adding or renaming summary categories

The five structured feedback fields are defined in one place: `src/renderer/src/types/index.ts` — the `SummaryData` interface and the `SUMMARY_LABELS` constant. Both apps have their own copy of this file with identical content. Changing categories requires updating both copies, and the `EMPTY_SUMMARY` constant in the same file.

### Coach vs. Teacher differences

The apps share the same overall structure but differ in:
- **Coach** has `ipc-handlers.ts` (write operations, ZIP export via `archiver`), `CommentPanel` with edit/delete/add form, and `ExportButton`
- **Teacher** has all IPC inline in `main/index.ts` (read-only), `VideoPlayer` with amber timestamp marker pips rendered over the custom seek bar, and `CommentPanel` that seeks on click
- Teacher's `VideoPlayer` manages a `seekToTime` value in the store — when set, the video element seeks then clears it; this decouples the comment list's seek trigger from the video element ref
- Color scheme: coach = blue, teacher = emerald/green
