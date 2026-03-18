# How to Install Video Coaching Feedback Tool

## For Mac Users

1. Download the `.dmg` file.
2. Double-click it to open.
3. Drag the app icon into your Applications folder.
4. When you first open the app, you may see a message saying **"cannot be opened because the developer cannot be verified."**
   - **Fix:** Go to **System Settings** → **Privacy & Security** → scroll down → click **"Open Anyway"**
   - You only need to do this once.

## For Windows Users

1. Download the `Setup.exe` file.
2. Double-click it to install.
3. Windows may show a blue warning: **"Windows protected your PC"**
   - **Fix:** Click **"More info"** → then click **"Run anyway"**
   - You only need to do this once.

---

## What You'll Receive (Teachers)

Your coach will send you a `.zip` file containing:
- The video file (`.mp4` or similar)
- A comments file (`.comments.json`)
- A summary file (`.summary.json`)

**Steps for teachers:**
1. Extract (unzip) the file to a folder on your computer
2. Open the **"Video Coaching Feedback - Teacher"** app
3. Click **"Load Video"** and select the video file from that folder
4. Comments and summary will load automatically

---

## What Coaches Do

1. Open the **"Video Coaching Feedback - Coach"** app
2. Enter your name and the teacher's name in the header fields
3. Click **"Load Video"** to select your recording
4. Watch the video — press **"Add Comment"** at any moment to pause and leave timestamped feedback
5. Switch to the **Summary Table** tab to fill in the five structured feedback categories
6. Click **"Export Package"** to create a ZIP file to send to the teacher

---

## Troubleshooting

**Mac — "App is damaged and can't be opened"**
Open Terminal and run:
```
xattr -cr /Applications/Video\ Coaching\ Feedback\ -\ Teacher.app
```
Then try opening the app again.

**The comments or summary didn't load (Teacher app)**
Make sure all three files (video, `.comments.json`, `.summary.json`) are in the **same folder** before loading the video. Do not move the video to a different location after extracting the ZIP.

**The video won't play**
Supported formats: MP4, MOV, AVI, MKV, WebM, M4V. For best compatibility, use MP4 (H.264).
