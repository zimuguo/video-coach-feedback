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

# Build Windows portable exe only (cross-compile from macOS)
cd coach-app && npm run build && npx electron-builder --win
cd teacher-app && npm run build && npx electron-builder --win
```

There is no shared root `package.json`, no test runner, and no lint config. Each app has its own `node_modules`.

### Distribution artifact naming

`npm run package` produces the following in `dist-installers/`:

| File | Platform |
|---|---|
| `Video Coaching Feedback - {App}-{version}.dmg` | Mac Intel (DMG installer) |
| `Video Coaching Feedback - {App}-{version}-arm64.dmg` | Mac Apple Silicon (DMG installer) |
| `Video Coaching Feedback - {App}-{version}.exe` | Windows (portable, no install) |
| `mac/Video Coaching Feedback - {App}-{version}.app` | Mac Intel (unpacked app bundle) |
| `mac-arm64/Video Coaching Feedback - {App}-{version}-arm64.app` | Mac Apple Silicon (unpacked app bundle) |

The `.app` renaming is handled by `scripts/rename-apps.js`, which runs automatically at the end of `npm run package`. The version is read from `package.json`, so it stays in sync when bumping versions.

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

Local video files cannot be loaded directly via `file://` in the sandboxed renderer. Both apps register a `localfile://` scheme (in `main/index.ts`, before `app.whenReady`) that serves video files with proper **HTTP range request support** so the `<video>` element can seek. The renderer receives a `localfile:///absolute/path/to/video.mp4` URL as the `<video src>`.

The handler manually reads the `Range` request header, slices the file with `createReadStream({ start, end })`, and returns a `206 Partial Content` response with correct `Content-Range` and `Accept-Ranges: bytes` headers. Without this, seeking resets the video to 0:00.

The scheme registration (`protocol.registerSchemesAsPrivileged`) **must happen synchronously before `app.whenReady()`**, not inside the callback.

### Zustand store as single source of truth

Each app has one store at `src/renderer/src/store/useAppStore.ts`. Video playback state (`currentTime`, `videoDuration`) is written there from `<video>` event handlers, then read by other components. This is how `CommentPanel` knows the current timestamp without being a child of `VideoPlayer`.

The coach store also has `getCommentsFile()` / `getSummaryFile()` methods that serialize current state into the on-disk JSON shape. These are called before every `saveComments`/`saveSummary` IPC call. Comments are auto-saved on every add/edit/delete; the summary is auto-saved on each field blur.

### Data files and naming convention

JSON files are derived from the video filename and stored as siblings:
- `lesson.mp4` → `lesson.comments.json` + `lesson.summary.json`

This derivation happens in the main process (`file:getJsonPaths` IPC handler). The teacher app uses the same handler to locate the files automatically after the teacher selects the video.

### Statistics / bar chart data

`SummaryData` holds two bar chart datasets and two comment strings:
- `barChart1: BarItem[]` — 5 bars, fixed labels: **C, R, O, W, D**
- `barChart2: BarItem[]` — 5 bars, fixed labels: **EVA, EXP, ALT, RP, NF**
- `barChart1Comment: string` — free-text comment displayed below Chart 1
- `barChart2Comment: string` — free-text comment displayed below Chart 2

Each bar is a `BarItem { label: string; count: number }`. Both apps have their own copy of `src/renderer/src/types/index.ts` with identical content — changes must be applied to both. `EMPTY_SUMMARY` initialises both bar arrays with blank labels and zero counts, and both comment strings as `''`.

Bar labels are fixed constants defined in `SummaryTable.tsx` (`CHART1_LABELS`, `CHART2_LABELS`) — they are **not** editable and not meaningful in saved JSON. Labels are rendered inline below each bar (single row, no numbered legend). The layout sequence in the Statistics tab is: bar chart → comment box → bar chart → comment box.

In the coach app, `updateBarItem(chart, index, field, value)` updates individual bar counts, and `updateChartComment(chart, value)` updates the comment strings; the summary is auto-saved on each input blur.

### Version and commit hash embedding

Both `electron.vite.config.ts` files inject two constants at build time via Vite `define`:
- `__APP_VERSION__` — from `package.json` version field
- `__GIT_COMMIT__` — short SHA from `git rev-parse --short HEAD`

Both constants must be declared at the top of any renderer file that uses them:
```typescript
declare const __APP_VERSION__: string
declare const __GIT_COMMIT__: string
```

The coach store embeds both in `getCommentsFile()` and `getSummaryFile()` so every exported package carries the version it was created with. The teacher app reads these fields on load and shows a warning banner if either value doesn't match its own build — but still loads the package. The version badge `v{__APP_VERSION__} ({__GIT_COMMIT__})` is rendered at the bottom-right of both apps.

### Coach vs. Teacher differences

The apps share the same overall structure but differ in:
- **Coach** has `ipc-handlers.ts` (write operations, ZIP export via `archiver`), `CommentPanel` with edit/delete/add form, `ExportButton`, and editable bar chart inputs in the Statistics tab
- **Teacher** has all IPC inline in `main/index.ts` (read-only), `CommentPanel` that seeks on click, and read-only bar chart display in the Statistics tab
- Both apps have amber timestamp marker pips on the seek bar and **step back / step forward** buttons flanking the play button to jump between comment markers
- Teacher's `VideoPlayer` manages a `seekToTime` value in the store — when set, the video element seeks then clears it; this decouples the comment list's seek trigger from the video element ref
- Color scheme: coach = blue, teacher = emerald/green
