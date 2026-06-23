/**
 * YTGrab Backend — Fixed Version
 *
 * Uses yt-dlp (via child_process) instead of @distube/ytdl-core.
 * yt-dlp is actively maintained, bypasses YouTube bot-detection, and
 * handles audio-only MP3 conversion + video+audio muxing automatically
 * (requires FFmpeg installed on the system).
 *
 * Prerequisites:
 *   brew install yt-dlp ffmpeg        # macOS
 *   sudo apt install yt-dlp ffmpeg    # Ubuntu/Debian
 *   choco install yt-dlp ffmpeg       # Windows (Chocolatey)
 *
 *   GET /api/info?url=...
 *       → metadata + available formats
 *
 *   GET /api/yt-download?url=...&format=mp3|360|480|720|1080|1440|2160
 *       → streams the requested file as an attachment
 *
 *   GET /api/health
 *
 *   Run with:  npm run dev   (starts vite + this server together)
 *   Or alone:  npm run server
 */

import express from "express";
import cors from "cors";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

const execFileAsync = promisify(execFile);
const TMP_DIR = path.join(os.tmpdir(), "ytgrab");
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/* -------------------------------------------------------------------------- */
/*  Health                                                                    */
/* -------------------------------------------------------------------------- */

app.get("/api/health", async (_req, res) => {
  // Also verify yt-dlp is available
  try {
    const { stdout } = await execFileAsync("yt-dlp", ["--version"]);
    res.json({ ok: true, service: "ytgrab", ytdlp: stdout.trim(), timestamp: Date.now() });
  } catch {
    res.status(500).json({ ok: false, error: "yt-dlp not found. Install it: https://github.com/yt-dlp/yt-dlp#installation" });
  }
});

/* -------------------------------------------------------------------------- */
/*  Metadata                                                                  */
/* -------------------------------------------------------------------------- */

app.get("/api/info", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "url param required" });

    const id = extractId(url);
    if (!id) return res.status(400).json({ error: "Invalid YouTube URL" });

    const watchUrl = `https://www.youtube.com/watch?v=${id}`;

    // Use yt-dlp --dump-json for metadata (no download)
    const { stdout } = await execFileAsync("yt-dlp", [
      "--dump-json",
      "--no-playlist",
      "--no-warnings",
      watchUrl,
    ], { maxBuffer: 10 * 1024 * 1024 });

    const info = JSON.parse(stdout);

    // Pick best thumbnail
    const thumbs = (info.thumbnails || []).sort((a, b) => (b.width || 0) - (a.width || 0));
    const thumbnail = thumbs[0]?.url || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

    res.json({
      id,
      title: info.title,
      author: info.uploader || info.channel || "Unknown",
      authorUrl: info.channel_url || info.uploader_url || "",
      thumbnail,
      duration: info.duration || 0,
      viewCount: String(info.view_count || 0),
      watchUrl,
    });
  } catch (err) {
    console.error("[/api/info]", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  Trending Videos                                                           */
/* -------------------------------------------------------------------------- */

let trendingCache = {
  data: null,
  expires: 0,
};

app.get("/api/trending", async (_req, res) => {
  try {
    if (
      trendingCache.data &&
      Date.now() < trendingCache.expires
    ) {
      return res.json(trendingCache.data);
    }

    const { stdout } = await execFileAsync(
      "yt-dlp",
      [
        "--flat-playlist",
        "--dump-single-json",
        "https://www.youtube.com/feed/trending?bp=4gINGgt5dGQtdHJlbmRpbmc%3D",
      ],
      { maxBuffer: 20 * 1024 * 1024 }
    );

    const playlist = JSON.parse(stdout);

    const videos = (playlist.entries || [])
      .filter(v => v.id && v.title)
      .slice(0, 8)
      .map((v, i) => ({
        id: v.id,
        title: v.title,
        author: v.channel || v.uploader || "Unknown",
        rank: i + 1,
      }));

    trendingCache = {
      data: videos,
      expires: Date.now() + 30 * 60 * 1000,
    };

    res.json(videos);
  } catch (err) {
    console.error("[/api/trending]", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------------------------------------------------- */
/*  Download — uses yt-dlp to stream the file                                 */
/* -------------------------------------------------------------------------- */

app.get("/api/yt-download", async (req, res) => {
  // Unique temp file base (no extension yet — yt-dlp/ffmpeg decides the final one)
  const jobId = crypto.randomUUID();
  const outputTemplate = path.join(TMP_DIR, `${jobId}.%(ext)s`);
  let resolvedFilePath = null; // filled in once yt-dlp tells us what it actually wrote

  // Always try to clean up the temp file, however the request ends
  const cleanup = () => {
    if (resolvedFilePath && fs.existsSync(resolvedFilePath)) {
      fs.unlink(resolvedFilePath, (err) => {
        if (err) console.error("[cleanup] failed to remove temp file:", err.message);
      });
    }
  };

  try {
    const { url, format = "720" } = req.query;
    if (!url) return res.status(400).json({ error: "url param required" });

    const id = extractId(url);
    if (!id) return res.status(400).json({ error: "Invalid YouTube URL" });

    const watchUrl = `https://www.youtube.com/watch?v=${id}`;
    const isAudio = String(format).toLowerCase() === "mp3";

    // ---- Build yt-dlp args (download to a real file on disk, not stdout) ----
    let ytdlpArgs;
    let ext;

    if (isAudio) {
      ytdlpArgs = [
        "--no-playlist",
        "--no-warnings",
        "-x",                          // extract audio
        "--audio-format", "mp3",       // convert to mp3
        "--audio-quality", "0",        // best quality
        "-o", outputTemplate,
        watchUrl,
      ];
      ext = "mp3";
    } else {
      const height = parseInt(format, 10) || 720;
      ytdlpArgs = [
        "--no-playlist",
        "--no-warnings",
        "-f", `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${height}]/best`,
        "--merge-output-format", "mp4",
        "-o", outputTemplate,
        watchUrl,
      ];
      ext = "mp4";
    }

    resolvedFilePath = path.join(TMP_DIR, `${jobId}.${ext}`);

    // Get title for the download filename shown to the user (quick separate call)
    let title = "youtube";
    try {
      const { stdout } = await execFileAsync("yt-dlp", [
        "--no-playlist", "--no-warnings",
        "--get-title", watchUrl,
      ]);
      title = sanitize(stdout.trim());
    } catch { /* use default */ }

    const downloadName = `${title}.${ext}`;

    console.log(`[yt-download] Downloading to temp file: ${resolvedFilePath}`);

    // ---- Step 1: let yt-dlp/ffmpeg fully download + merge to disk ----
    await new Promise((resolve, reject) => {
      execFile(
        "yt-dlp",
        ytdlpArgs,
        { maxBuffer: 50 * 1024 * 1024 },
        (error, _stdout, stderr) => {
          if (stderr) process.stderr.write(stderr);
          if (error) return reject(error);
          resolve();
        }
      );
    });

    if (!fs.existsSync(resolvedFilePath)) {
      throw new Error("yt-dlp finished but the output file was not found.");
    }

    // ---- Step 2: stream the finished file to the client ----
    console.log(`[yt-download] Sending file: ${downloadName}`);

    res.download(resolvedFilePath, downloadName, (err) => {
      if (err) console.error("[yt-download] res.download error:", err.message);
      cleanup();
    });

    // Safety net: if the client disconnects before res.download's callback fires
    req.on("close", () => {
      if (!res.writableEnded) cleanup();
    });

  } catch (err) {
    console.error("[/api/yt-download]", err.message);
    cleanup();
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function extractId(input) {
  const m = input.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(input.trim())) return input.trim();
  return null;
}

function sanitize(title) {
  return (
    title
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 60) || "youtube"
  );
}

/* -------------------------------------------------------------------------- */
/*  Start                                                                     */
/* -------------------------------------------------------------------------- */

app.listen(PORT, () => {
  console.log(`🚀 YTGrab backend running at http://localhost:${PORT}`);
  console.log(`   GET /api/health`);
  console.log(`   GET /api/info?url=...`);
  console.log(`   GET /api/yt-download?url=...&format=720|mp3|...`);
  console.log(``);
  console.log(`⚠️  Requires: yt-dlp + ffmpeg installed on your system`);
  console.log(`   macOS:   brew install yt-dlp ffmpeg`);
  console.log(`   Ubuntu:  sudo apt install yt-dlp ffmpeg`);
  console.log(`   Windows: choco install yt-dlp ffmpeg`);
});