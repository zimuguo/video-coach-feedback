# Video Coaching Feedback — Distribution Guide

## Coach App

### Distribution Files

| File | Platform |
|---|---|
| `Video Coaching Feedback - Coach-{version}.dmg` | Mac Intel (DMG installer) |
| `Video Coaching Feedback - Coach-{version}-arm64.dmg` | Mac Apple Silicon (DMG installer) |
| `Video Coaching Feedback - Coach-{version}.exe` | Windows (portable, no install) |
| `Video Coaching Feedback - Coach-{version}.app.zip` | Mac Intel (unpacked app bundle) |
| `Video Coaching Feedback - Coach-{version}-arm64.app.zip` | Mac Apple Silicon (unpacked app bundle) |

### Installation Instructions

#### Mac — DMG (Recommended)

1. Double-click the `.dmg` file to mount it.
2. Drag "Video Coaching Feedback - Coach" to the Applications folder.
3. On first launch, macOS may block the app. Go to **System Settings → Privacy & Security**, scroll down, and click **"Open Anyway"**.
4. Click **"Open"** in the confirmation dialog.

If you see *"[App Name] is damaged and can't be opened"* after the above steps, this is a macOS Gatekeeper quarantine issue. To fix it:

1. Open **Terminal** (search "Terminal" in Spotlight).
2. Type the following command, then **drag the `.app` from Finder into the Terminal window** to auto-fill its path:
   ```
   xattr -cr
   ```
   The full command should look like:
   ```
   xattr -cr "/Applications/Video Coaching Feedback - Coach-1.0.1.app"
   ```
3. Press **Enter**, then open the app normally.

If the error persists, try prefixing with `sudo` (you will be prompted for your Mac login password):

```
sudo xattr -cr "/Applications/Video Coaching Feedback - Coach-1.0.1.app"
```

#### Mac — .app (Direct Use)

1. Unzip the `.app.zip` file. The `.app` requires no installation — copy it anywhere on your Mac (e.g. Applications), then double-click to open it.
2. If macOS blocks the app with a warning dialog, click **"Done"** (not "Move to Trash").
3. Go to **System Settings → Privacy & Security**, scroll down, and click **"Open Anyway"**. This option only appears after the first blocked attempt.
4. Click **"Open"** in the confirmation dialog.

If you instead see *"damaged and can't be opened"*, open **Terminal** and run:

```
xattr -cr "/path/to/Video Coaching Feedback - Coach.app"
```

(Drag the `.app` into Terminal to auto-fill the path.) If the error persists, prefix with `sudo`.

#### Windows

1. Save the `.exe` file anywhere on your computer (portable app — no installation needed).
2. Double-click the `.exe` to run it.
3. If Windows SmartScreen shows a warning, click **"More info"** then **"Run anyway"**.

---

## Teacher App

### Distribution Files

| File | Platform |
|---|---|
| `Video Coaching Feedback - Teacher-{version}.dmg` | Mac Intel (DMG installer) |
| `Video Coaching Feedback - Teacher-{version}-arm64.dmg` | Mac Apple Silicon (DMG installer) |
| `Video Coaching Feedback - Teacher-{version}.exe` | Windows (portable, no install) |
| `Video Coaching Feedback - Teacher-{version}.app.zip` | Mac Intel (unpacked app bundle) |
| `Video Coaching Feedback - Teacher-{version}-arm64.app.zip` | Mac Apple Silicon (unpacked app bundle) |

### Installation Instructions

#### Mac — DMG (Recommended)

1. Double-click the `.dmg` file to mount it.
2. Drag "Video Coaching Feedback - Teacher" to the Applications folder.
3. On first launch, macOS may block the app. Go to **System Settings → Privacy & Security**, scroll down, and click **"Open Anyway"**.
4. Click **"Open"** in the confirmation dialog.

If you see *"[App Name] is damaged and can't be opened"* after the above steps, this is a macOS Gatekeeper quarantine issue. To fix it:

1. Open **Terminal** (search "Terminal" in Spotlight).
2. Type the following command, then **drag the `.app` from Finder into the Terminal window** to auto-fill its path:
   ```
   xattr -cr
   ```
   The full command should look like:
   ```
   xattr -cr "/Applications/Video Coaching Feedback - Teacher-1.0.1.app"
   ```
3. Press **Enter**, then open the app normally.

If the error persists, try prefixing with `sudo` (you will be prompted for your Mac login password):

```
sudo xattr -cr "/Applications/Video Coaching Feedback - Teacher-1.0.1.app"
```

#### Mac — .app (Direct Use)

1. Unzip the `.app.zip` file. The `.app` requires no installation — copy it anywhere on your Mac (e.g. Applications), then double-click to open it.
2. If macOS blocks the app with a warning dialog, click **"Done"** (not "Move to Trash").
3. Go to **System Settings → Privacy & Security**, scroll down, and click **"Open Anyway"**. This option only appears after the first blocked attempt.
4. Click **"Open"** in the confirmation dialog.

If you instead see *"damaged and can't be opened"*, open **Terminal** and run:

```
xattr -cr "/path/to/Video Coaching Feedback - Teacher.app"
```

(Drag the `.app` into Terminal to auto-fill the path.) If the error persists, prefix with `sudo`.

#### Windows

1. Save the `.exe` file anywhere (portable — no installation needed).
2. Double-click the `.exe` to run it.
3. If Windows SmartScreen appears, click **"More info"** then **"Run anyway"**.

---

## Usage Notes

- **Coach and Teacher apps must be the same version.** The coach app embeds a version and commit hash in every exported package. The teacher app will show a warning banner if the versions don't match.
- The coach app auto-saves comments to a `.comments.json` file next to the video. If the app crashes, reopen it and load the same video — comments will be restored.
- When feedback is complete, use the **Export** button in the coach app to generate a ZIP package. Send this ZIP to the teacher.
- The teacher unzips the file, keeps all files in the same folder, then opens the Teacher App, clicks **"Open Feedback Package"**, and selects the recording video file.
