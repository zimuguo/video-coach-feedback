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
- Fills in the **Summary Table** with structured written feedback across 5 categories
- Clicks **Export Package** to create a ZIP file containing the video + JSON files

### Teacher App (`teacher-app/`)

The teacher extracts the ZIP, then:
- Loads the video file — comments and summary load automatically from sibling JSON files
- Sees amber marker pips on the seek bar at every comment timestamp
- Clicks a pip (or a comment in the list) to jump directly to that moment in the video
- Reads the full summary table on the Summary tab

## Shared Data Format

Both apps share the same JSON schemas (stored as sibling files next to the video):

- `[videoname].comments.json` — array of timestamped comments
- `[videoname].summary.json` — five structured feedback fields

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

### Build installers

```bash
# Coach app
cd coach-app
npm run package

# Teacher app
cd teacher-app
npm run package
```

Installers are written to `dist-installers/`.

## Tech Stack

- [Electron](https://www.electronjs.org/) — desktop shell
- [electron-vite](https://electron-vite.org/) — build tooling
- [React 18](https://react.dev/) — UI framework
- [Zustand](https://zustand-demo.pmnd.rs/) — state management
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [archiver](https://github.com/archiverjs/node-archiver) — ZIP creation (coach app only)
