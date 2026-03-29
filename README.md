# SharePoint Video Downloader

A Chrome/Edge extension that captures SharePoint/OneDrive Stream video URLs and generates ready-to-run yt-dlp and FFmpeg download commands.

## Overview

**SharePoint Video Downloader** detects video manifests and stream URLs on SharePoint/OneDrive pages and generates download commands with the correct authentication flags. It supports both `--cookies-from-browser` (browser must be closed) and `--cookies cookies.txt` (browser can stay open) workflows.

Built using Chrome **Manifest V3**.

## Features

- **Detects SharePoint stream URLs** — `/transform/videomanifest` (DASH/HLS), `mediap.svc.ms` proxy manifests, `oneDrive.transcode` segment endpoints, and direct `download.aspx` links.
- **Per-tab URL capture** — stores up to 20 URLs per tab, deduplicated.
- **Current Page shortcut** — one-click copy of a yt-dlp command using the active SharePoint tab URL (uses the built-in SharePoint extractor).
- **Two cookie modes** — `--cookies-from-browser <browser>` and `--cookies cookies.txt`.
- **Cookie lock warning** — shows a warning when Edge/Chrome/Brave is selected, since Chromium locks the cookie database while the browser is open.
- **Customizable output** — quality (Best, 1080p, 720p, 480p), format (MP4, MKV, TS), and custom filename.
- **Copy buttons** for all commands.

## Installation

### Prerequisites

- **Edge or Chrome** (Manifest V3, version 88+).
- **yt-dlp** — `pip install yt-dlp` or download from [github.com/yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp).
- **FFmpeg** *(optional)* — [ffmpeg.org](https://ffmpeg.org/).

### Steps

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/MiniduTH/Sharepoint-Downloader.git
   ```

2. **Load the extension**
   - Edge: `edge://extensions/` → Enable **Developer mode** → **Load unpacked** → select the folder.
   - Chrome: `chrome://extensions/` → same steps.

## Usage

### Recommended: Current Page method

1. Open the SharePoint video page in your browser.
2. Click the extension icon.
3. In the **Current Page** card, click **Copy yt-dlp (cookies.txt)** (if Edge is open) or **Copy yt-dlp Command** (if you'll close the browser first).
4. Paste into a terminal and run.

### Cookie authentication — two options

#### Option A: `--cookies-from-browser` (no extra setup, but browser must be closed)

Chromium-based browsers (Edge, Chrome, Brave) **lock the cookie database while running**. You must close the browser before running the command.

```bash
# 1. Close Edge/Chrome completely
# 2. Run:
yt-dlp --cookies-from-browser edge -f "bestvideo+bestaudio/best" --merge-output-format mp4 -o "lecture.mp4" "https://mysliit-my.sharepoint.com/..."
# 3. Reopen the browser
```

Firefox does **not** lock its cookie database, so `--cookies-from-browser firefox` works while the browser is open.

#### Option B: `--cookies cookies.txt` ✅ Confirmed working

Export cookies while the browser is open using the **[Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)** extension, then run:

```bash
yt-dlp --cookies cookies.txt -f "bestvideo+bestaudio/best" --merge-output-format mp4 -o "lecture.mp4" "https://mysliit-my.sharepoint.com/..."
```

**Steps to export cookies.txt:**
1. Install **Get cookies.txt LOCALLY** in Edge/Chrome.
2. Navigate to `mysliit-my.sharepoint.com` (or your SharePoint domain).
3. Click the extension icon → **Export** → save as `cookies.txt` in the same folder where you'll run yt-dlp.
4. Use the **Copy yt-dlp (cookies.txt)** button in this extension to get the command.

### Captured Stream URLs

The extension also intercepts manifest URLs as you play the video:

1. Play the video on SharePoint.
2. Open the extension popup — captured URLs appear in the **Captured Stream URLs** list.
3. Click a URL to generate FFmpeg and yt-dlp commands for it in the **Download Commands** card.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**.
2. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes and commit them**:
   ```bash
   git commit -m "Add your commit message here"
   ```
4. **Push to the branch**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Submit a pull request** to the main branch.

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

## Contact

- **Author:** Minidu Weerasinghe  
- **GitHub:** [MiniduTH](https://github.com/MiniduTH)  
- **LinkedIn:** [linkedin.com/in/minidu0th](https://linkedin.com/in/minidu0th)  
