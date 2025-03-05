# MTH Video Manifest Capture

A Chrome extension that captures video manifest URLs (e.g., HLS `.m3u8`, MPEG-DASH `.mpd`, and SharePoint DASH manifests) from web pages, processes them, and generates FFmpeg and yt-dlp commands for downloading. It also includes a simple UI for customization and a button to download or open the manifest URL directly.

## Overview

**MTH Video Manifest Capture** is designed to assist users in capturing and processing video streaming manifests, particularly for SharePoint, HLS, and DASH formats. The extension provides a user-friendly popup interface to view cleaned manifest URLs, select quality and format options, set custom filenames, and copy commands for FFmpeg and yt-dlp to download the video content. It also includes a **"Download Manifest"** button to open the cleaned manifest URL in a new tab or initiate a basic download.

This extension is built using Chrome's **Manifest V3**, ensuring modern security and performance standards.

## Features

- **Captures video manifest URLs** (`.m3u8`, `.mpd`, and SharePoint `/transform/videomanifest` with `format=dash`).
- **Cleans URLs** by removing unnecessary parameters (e.g., after `format=dash`).
- **Generates customizable FFmpeg and yt-dlp commands** with options for quality (Best, 1080p, 720p, 480p) and format (MP4, MKV, TS).
- **Allows custom output filenames** or uses a timestamp-based default (e.g., `video_YYYYMMDD_HHMMSS`).
- **"Download Manifest" button** to open the cleaned manifest URL in a new tab or initiate a basic download of the manifest file.
- **Toggle buttons** to expand/collapse long URLs and commands for better readability.
- **Copy buttons** for FFmpeg and yt-dlp commands to easily paste into a terminal.

## Installation

### Prerequisites

- Google Chrome or Chromium browser (**Manifest V3 compatible, version 88 or later**).
- FFmpeg and yt-dlp installed on your system (**optional, for running the generated commands**).

### Steps

1. **Clone or Download the Repository**
   ```bash
   git clone https://github.com/MiniduTH/Sharepoint-Downloader.git
   ```
   Or download the ZIP file and extract it.

2. **Load the Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **"Developer mode"** in the top-right corner.
   - Click **"Load unpacked"** and select the `Sharepoint-Downloader` folder.

3. **Install Dependencies** *(optional, for using generated commands)*
   - **FFmpeg:** Install via your package manager (e.g., `sudo apt install ffmpeg` on Ubuntu) or download from [ffmpeg.org](https://ffmpeg.org/).
   - **yt-dlp:** Install via `pip install yt-dlp` or download from [yt-dlp.org](https://yt-dlp.org/).

## Usage

1. **Open a Web Page with Video Manifests**
   - Visit a website streaming video content (e.g., SharePoint, HLS, or DASH streams).

2. **Activate the Extension**
   - Click the **"MTH Video Manifest Capture"** icon in the Chrome toolbar.

3. **Capture Manifests**
   - The extension automatically detects and captures video manifest URLs (`.m3u8`, `.mpd`, or SharePoint DASH manifests).
   - The cleaned URL, FFmpeg command, and yt-dlp command will appear in the popup.

4. **Customize Options**
   - Use the dropdowns to select video quality (**Best, 1080p, 720p, 480p**) and format (**MP4, MKV, TS**).
   - Enter a custom output filename, or leave it blank to use the timestamp-based default (e.g., `video_20250305_143022.mp4`).

5. **Copy Commands**
   - Click **"Copy FFmpeg"** or **"Copy yt-dlp"** to copy the respective commands to your clipboard.
   - Paste the commands into a terminal to download the video using FFmpeg or yt-dlp.

6. **Download Manifest** *(optional)*
   - Click **"Download Manifest"** to open the cleaned manifest URL in a new tab or download the manifest file (**note:** this downloads the manifest, not the full video; further processing is required using FFmpeg or yt-dlp).

## Screenshots

_Screenshot of the popup interface showing captured manifest, commands, and options._

![Screenshot](https://i.ibb.co/wZmMQ04P/Screenshot-2025-03-05-151334.png)

## Known Limitations

- **"Download Manifest" only saves the manifest file** (e.g., `.m3u8` or `.mpd`), not the full video. You need tools like **FFmpeg or yt-dlp** to process it.
- **Authenticated manifest URLs** (e.g., SharePoint temp auth tokens) may require user login or additional configuration.
- **Direct video downloads** without external tools are **not supported** due to browser security restrictions.

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
