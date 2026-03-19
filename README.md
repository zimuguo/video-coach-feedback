# Video Coaching Feedback Tool

A pair of Electron desktop apps enabling coaches to annotate teaching videos with timestamped comments and deliver structured feedback to teachers.

## Project Structure

```
video-commenter/
├── coach-app/      # Coach application — load video, add comments, export ZIP
└── teacher-app/    # Teacher application — watch video with clickable comment markers
```

## Apps

### Coach App (`coach-app/`)

The coach loads a video, watches it, and:
- Pauses at any moment and clicks **Add Comment** to leave timestamped feedback
- Uses the **step back / step forward** buttons to navigate between comment markers
- Fills in the **Statistics** tab with two bar charts (5-category and 4-category) to record observation counts
- Clicks **Export Package** to create a ZIP file containing the video + JSON files

### Teacher App (`teacher-app/`)

The teacher extracts the ZIP, then:
- Loads the video file — comments and statistics load automatically from sibling JSON files
- Sees amber marker pips on the seek bar at every comment timestamp
- Clicks a pip (or a comment in the list) to jump directly to that moment in the video
- Uses the **step back / step forward** buttons to navigate between comment markers
- Views the bar charts on the **Statistics** tab

## Shared Data Format

Both apps share the same JSON schemas (stored as sibling files next to the video):

- `[videoname].comments.json` — array of timestamped comments
- `[videoname].summary.json` — two bar chart datasets (5-bar and 4-bar)

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup and run (coach app)

```bash
cd coach-app
npm install
npm run dev
```

### Setup and run (teacher app)

```bash
cd teacher-app
npm install
npm run dev
```

### Build installers locally

```bash
# Coach app
cd coach-app
npm run package

# Teacher app
cd teacher-app
npm run package
```

Installers are written to `dist-installers/`.

On **Mac**, this produces a `.dmg`. On **Windows**, this produces a portable `.exe` (no installation wizard — users double-click to run).

### Build installers via GitHub Actions (recommended for releases)

The workflow at `.github/workflows/build.yml` builds proper Mac DMG and Windows NSIS installer for both apps on real OS runners — no wine or cross-compilation needed.

**Trigger a build:**

Option 1 — push a version tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

Option 2 — run manually from GitHub:
> Repository → **Actions** tab → **Build Installers** → **Run workflow**

**Download the results:**

After the workflow completes, go to the Actions run page and download the `mac-installers` or `windows-installers` artifact ZIP. Each contains the `.dmg` / `.exe` files for both apps.

## Tech Stack

- [Electron](https://www.electronjs.org/) — desktop shell
- [electron-vite](https://electron-vite.org/) — build tooling
- [React 18](https://react.dev/) — UI framework
- [Zustand](https://zustand-demo.pmnd.rs/) — state management
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [archiver](https://github.com/archiverjs/node-archiver) — ZIP creation (coach app only)
