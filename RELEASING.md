# Release Guide

## Prerequisites

- Push access to the GitHub repo
- GitHub Actions enabled on the repo

---

## Steps

### 1. Push your latest code

Make sure everything is committed and pushed to `main`:

```bash
git push origin main
```

### 2. Create and push a version tag

```bash
git tag v1.0.2
git push origin v1.0.2
```

This is the only step that triggers the build. No need to manually bump versions in code — the workflow reads the tag and updates both apps' `package.json` before building.

### 3. Watch the build

1. Go to your repo on GitHub → **Actions** tab
2. You'll see a workflow run called **"Build & Release"**
3. Two **Build** jobs run in parallel (Coach and Teacher), each taking ~5–10 minutes
4. Once both finish, the **Create GitHub Release** job runs automatically

### 4. Check the release

1. Go to **Releases** in your repo (right sidebar on the main page)
2. You'll see a new release titled `v1.0.2`
3. The page shows the full distribution guide as the description
4. Below it, 10 files are attached as assets:

| File | App | Platform |
|---|---|---|
| `Video Coaching Feedback - Coach-{version}.dmg` | Coach | Mac Intel |
| `Video Coaching Feedback - Coach-{version}-arm64.dmg` | Coach | Mac Apple Silicon |
| `Video Coaching Feedback - Coach-{version}.exe` | Coach | Windows |
| `Video Coaching Feedback - Coach-{version}.app.zip` | Coach | Mac Intel app bundle |
| `Video Coaching Feedback - Coach-{version}-arm64.app.zip` | Coach | Mac Apple Silicon app bundle |
| `Video Coaching Feedback - Teacher-{version}.dmg` | Teacher | Mac Intel |
| `Video Coaching Feedback - Teacher-{version}-arm64.dmg` | Teacher | Mac Apple Silicon |
| `Video Coaching Feedback - Teacher-{version}.exe` | Teacher | Windows |
| `Video Coaching Feedback - Teacher-{version}.app.zip` | Teacher | Mac Intel app bundle |
| `Video Coaching Feedback - Teacher-{version}-arm64.app.zip` | Teacher | Mac Apple Silicon app bundle |

### 5. Share with users

Copy the release page URL and send it to users:

```
https://github.com/{owner}/{repo}/releases/tag/v1.0.2
```

Users read the distribution guide on the page and download the right file for their platform. No GitHub account required for public repos.

---

## Updating the release description without rebuilding

To update only the `DISTRIBUTION.md` content on an existing release page (no new build or tag needed):

1. Edit `DISTRIBUTION.md` locally
2. Commit and push the change to `main`
3. Run:

```bash
gh release edit v1.0.2 --repo zimuguo/video-coach-feedback --notes-file DISTRIBUTION.md
```

Replace `v1.0.2` with the tag of the release you want to update.
