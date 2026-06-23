/**
 * YTGrab client library — Fixed Version
 *
 * Talks to the local backend (server.js) which uses yt-dlp to extract
 * real YouTube streams and pipes them to the browser.
 *
 *  - Metadata via /api/info (yt-dlp --dump-json, server-side)
 *  - Thumbnails via CORS proxy → real .jpg saved to disk
 *  - Video / audio via the backend stream endpoint (yt-dlp piped)
 */

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface VideoMeta {
  id: string;
  title: string;
  author: string;
  authorUrl: string;
  thumbnail: string;
  watchUrl: string;
}

export type ThumbQuality = "maxresdefault" | "sddefault" | "hqdefault" | "mqdefault";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PROXIES = [
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
];

/* -------------------------------------------------------------------------- */
/*  Video ID                                                                  */
/* -------------------------------------------------------------------------- */

const ID_RE =
  /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

export function extractVideoId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const m = raw.match(ID_RE);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  return null;
}

export function watchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/* -------------------------------------------------------------------------- */
/*  CORS proxy fetch (thumbnails only)                                         */
/* -------------------------------------------------------------------------- */

async function proxyFetch(url: string): Promise<Response> {
  for (const makeProxy of PROXIES) {
    try {
      const r = await fetch(makeProxy(url), { signal: AbortSignal.timeout(15000) });
      if (r.ok) return r;
    } catch { continue; }
  }
  throw new Error("All CORS proxies failed");
}

/* -------------------------------------------------------------------------- */
/*  Metadata — now fetched from backend (yt-dlp) for accuracy                 */
/* -------------------------------------------------------------------------- */

export async function fetchVideoMeta(id: string): Promise<VideoMeta> {
  const url = watchUrl(id);

  // Try backend first (uses yt-dlp, most accurate)
  try {
    const r = await fetch(
      `/api/info?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(20000) }
    );
    if (r.ok) {
      const d = await r.json();
      if (d.title) {
        return {
          id: d.id || id,
          title: d.title,
          author: d.author || "Unknown channel",
          authorUrl: d.authorUrl || "",
          thumbnail: d.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          watchUrl: url,
        };
      }
    }
  } catch { /* fall through to noembed */ }

  // Fallback: noembed (CORS-safe, no key needed)
  try {
    const r = await fetch(
      `https://noembed.com/embed?dataType=json&url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (r.ok) {
      const d = await r.json();
      if (d.title) {
        return {
          id,
          title: d.title,
          author: d.author_name || "Unknown channel",
          authorUrl: d.author_url || "",
          thumbnail: d.thumbnail_url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          watchUrl: url,
        };
      }
    }
  } catch { /* use base */ }

  // Last resort defaults
  return {
    id,
    title: "YouTube Video",
    author: "Unknown channel",
    authorUrl: "",
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    watchUrl: url,
  };
}

/* -------------------------------------------------------------------------- */
/*  Quality helpers                                                            */
/* -------------------------------------------------------------------------- */

export interface Resolution { label: string; height: number; }

export function qualityToResolution(q: number): Resolution {
  if (q < 20) return { label: "360p", height: 360 };
  if (q < 40) return { label: "480p", height: 480 };
  if (q < 65) return { label: "720p HD", height: 720 };
  if (q < 85) return { label: "1080p Full HD", height: 1080 };
  return { label: "2160p 4K", height: 2160 };
}

export function qualityToThumb(q: number): ThumbQuality {
  if (q < 25) return "mqdefault";
  if (q < 55) return "hqdefault";
  if (q < 80) return "sddefault";
  return "maxresdefault";
}

export function qualityToBitrate(q: number): number {
  return Math.round(96 + (q / 100) * 224);
}

export function thumbDimensions(q: ThumbQuality): string {
  switch (q) {
    case "maxresdefault": return "1280×720";
    case "sddefault": return "640×480";
    case "hqdefault": return "480×360";
    case "mqdefault": return "320×180";
  }
}

export function thumbnailUrl(id: string, q: ThumbQuality): string {
  return `https://i.ytimg.com/vi/${id}/${q}.jpg`;
}

function qualityToFormat(quality: number): string {
  if (quality >= 85) return "2160";
  if (quality >= 65) return "1080";
  if (quality >= 40) return "720";
  if (quality >= 20) return "480";
  return "360";
}

/* -------------------------------------------------------------------------- */
/*  File helpers                                                              */
/* -------------------------------------------------------------------------- */

function safeName(title: string): string {
  return (title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_").slice(0, 60) || "youtube");
}

function triggerBlob(blob: Blob, filename: string) {
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 60000);
}

/* -------------------------------------------------------------------------- */
/*  Thumbnail download                                                         */
/* -------------------------------------------------------------------------- */

export async function downloadImage(id: string, quality: ThumbQuality, title: string): Promise<void> {
  const r = await proxyFetch(thumbnailUrl(id, quality));
  if (!r.ok) throw new Error("Image fetch failed");
  const blob = await r.blob();
  triggerBlob(blob, `${safeName(title)}_${quality}.jpg`);
}

/* -------------------------------------------------------------------------- */
/*  Video / audio download — streams from backend (yt-dlp)                    */
/* -------------------------------------------------------------------------- */

/**
 * Downloads a YouTube video/audio file through the local backend.
 *
 * The backend runs yt-dlp and pipes the file as an attachment.
 * Requires: yt-dlp + ffmpeg installed on the server machine.
 *
 *   macOS:   brew install yt-dlp ffmpeg
 *   Ubuntu:  sudo apt install yt-dlp ffmpeg
 *   Windows: choco install yt-dlp ffmpeg
 */
export async function downloadVideo(
  videoUrl: string,
  mode: "video" | "audio",
  quality: number,
  title: string,
  onProgress?: (msg: string) => void
): Promise<{ method: "direct"; filename: string }> {
  const format = mode === "audio" ? "mp3" : qualityToFormat(quality);
  const ext = mode === "audio" ? "mp3" : "mp4";
  const filename = `${safeName(title)}.${ext}`;

  onProgress?.("Checking backend...");

  // Health check — verifies yt-dlp is installed too
  try {
    const ping = await fetch("/api/health", { signal: AbortSignal.timeout(5000) });
    if (!ping.ok) {
      const body = await ping.json().catch(() => ({}));
      throw new Error(body.error || "Backend not healthy");
    }
    const health = await ping.json();
    if (!health.ok) {
      throw new Error(health.error || "yt-dlp not found on server");
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Backend offline";
    throw new Error(
      msg.includes("yt-dlp")
        ? msg
        : "Backend offline. Run: npm run dev"
    );
  }

  onProgress?.("Starting download (this may take a moment)...");

  // Trigger browser file download via anchor click.
  // The server streams the yt-dlp output directly to the browser.
  const downloadHref = `/api/yt-download?url=${encodeURIComponent(videoUrl)}&format=${encodeURIComponent(format)}`;

  const a = document.createElement("a");
  a.href = downloadHref;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  onProgress?.("Download started — check your browser's download bar");

  return { method: "direct", filename };
}
