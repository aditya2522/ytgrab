# YTGrab — Fixed Download Setup

## What was broken & what was fixed

| # | Problem | Fix |
|---|---------|-----|
| 1 | `@distube/ytdl-core` blocked by YouTube bot-detection | Replaced with `yt-dlp` (runs as a child process server-side) |
| 2 | MP3 downloads were WebM/Opus streams named `.mp3` (unplayable) | `yt-dlp --extract-audio --audio-format mp3` does real conversion |
| 3 | 1080p+ videos had no audio (separate streams, not merged) | `yt-dlp --merge-output-format mp4` handles muxing automatically |

## Prerequisites (REQUIRED before running)

You need **yt-dlp** and **ffmpeg** installed on your machine:

### macOS
```bash
brew install yt-dlp ffmpeg
```

### Ubuntu / Debian
```bash
sudo apt update && sudo apt install yt-dlp ffmpeg
```

### Windows (Chocolatey)
```bash
choco install yt-dlp ffmpeg
```

### Windows (manual)
- yt-dlp: https://github.com/yt-dlp/yt-dlp/releases → download `yt-dlp.exe`, add to PATH
- ffmpeg: https://ffmpeg.org/download.html → download, add `bin/` folder to PATH

## Running the app

```bash
npm install
npm run dev
```

This starts both the Express backend (port 3001) and Vite frontend together.

## Verify yt-dlp is working

```bash
curl http://localhost:3001/api/health
# Should return: {"ok":true,"ytdlp":"2025.x.x",...}
```
