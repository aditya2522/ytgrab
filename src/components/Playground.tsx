import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Reveal from "./Reveal";
import { useDownloader, type Format } from "../store/downloader";
import {
  downloadImage,
  downloadVideo,
  qualityToBitrate,
  qualityToResolution,
  qualityToThumb,
  thumbDimensions,
} from "../lib/youtube";

const formatOptions: {
  key: Format;
  label: string;
  desc: string;
  icon: string;
}[] = [
  { key: "thumb", label: "Thumbnail", desc: "Image file", icon: "🖼️" },
  { key: "video", label: "MP4 Video", desc: "Up to 4K", icon: "🎬" },
  { key: "audio", label: "MP3 Audio", desc: "Up to 320kbps", icon: "🎵" },
];

const samples = [
  { id: "dQw4w9WgXcQ", title: "Never Gonna Give You Up" },
  { id: "9bZkp7q19f0", title: "Gangnam Style" },
  { id: "kJQP7kiw5Fk", title: "Despacito" },
  { id: "60ItHLz5WEA", title: "Alan Walker - Faded" },
];

type DlState = "idle" | "working" | "done" | "error";

export default function Playground() {
  const {
    meta,
    status,
    format,
    setFormat,
    quality,
    setQuality,
    loadSample,
    reset,
  } = useDownloader();

  const [dl, setDl] = useState<DlState>("idle");
  const [dlMsg, setDlMsg] = useState("");

  const resolution = qualityToResolution(quality);
  const thumbQ = qualityToThumb(quality);
  const bitrate = qualityToBitrate(quality);

  const handleDownload = async () => {
    if (!meta) return;
    setDl("working");
    try {
      if (format === "thumb") {
        setDlMsg(`Fetching ${thumbDimensions(thumbQ)}...`);
        await downloadImage(meta.id, thumbQ, meta.title);
        setDlMsg(`Saved ${thumbDimensions(thumbQ)} image ✓`);
      } else {
        const result = await downloadVideo(
          meta.watchUrl,
          format as "video" | "audio",
          quality,
          meta.title,
          (msg) => setDlMsg(msg)
        );
        setDlMsg(`Saved ${result.filename} ✓`);
      }
      setDl("done");
      setTimeout(() => setDl("idle"), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Download failed";
      setDlMsg(msg.length > 60 ? "Download failed — try again" : msg);
      setDl("error");
      setTimeout(() => setDl("idle"), 3500);
    }
  };

  const ctxLabel =
    format === "thumb"
      ? thumbDimensions(thumbQ)
      : format === "video"
      ? resolution.label
      : `${bitrate} kbps`;

  return (
    <section id="downloader" className="relative px-6 py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-medium uppercase tracking-widest text-red-400">
          Download Studio
        </span>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Pick your format & <span className="text-gradient">quality</span>
        </h2>
        <p className="mt-4 text-zinc-400">
          Every control below is live. Choose a format, drag the quality slider,
          and the download reflects your exact choice.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mx-auto mt-14 max-w-6xl">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
          <div className="grid lg:grid-cols-[1.1fr_1fr]">
            {/* LEFT: preview / empty state */}
            <div className="relative flex min-h-[20rem] items-center justify-center border-b border-white/10 bg-gradient-to-br from-red-950/20 to-transparent p-8 lg:border-b-0 lg:border-r">
              <AnimatePresence mode="wait">
                {meta ? (
                  <motion.div
                    key={meta.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-sm"
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10">
                      <img
                        src={meta.thumbnail}
                        alt={meta.title}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="line-clamp-2 text-sm font-semibold text-white">
                          {meta.title}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-300">
                          {meta.author}
                        </p>
                      </div>
                      <span className="absolute right-3 top-3 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
                        READY
                      </span>
                    </div>
                    <button
                      onClick={reset}
                      className="mt-3 text-xs text-zinc-500 underline-offset-2 hover:text-red-300 hover:underline"
                    >
                      Clear & try another
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <svg className="h-7 w-7 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                    <p className="text-sm text-zinc-400">
                      {status === "loading"
                        ? "Fetching video…"
                        : "No video loaded yet."}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      Paste a link above, or try a sample:
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {samples.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => loadSample(s.id)}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-white"
                        >
                          {s.title}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT: controls */}
            <div className="flex flex-col gap-7 p-8">
              {/* format picker */}
              <div>
                <label className="mb-3 block text-xs font-medium uppercase tracking-widest text-zinc-500">
                  1 · Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {formatOptions.map((f) => {
                    const active = format === f.key;
                    return (
                      <button
                        key={f.key}
                        onClick={() => setFormat(f.key)}
                        className={`relative flex flex-col items-center gap-1 rounded-xl border p-3 transition-colors ${
                          active
                            ? "border-red-400/50 bg-red-500/15"
                            : "border-white/10 bg-white/[0.03] hover:border-white/20"
                        }`}
                      >
                        <span className="text-xl">{f.icon}</span>
                        <span className="text-xs font-semibold text-white">
                          {f.label}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {f.desc}
                        </span>
                        {active && (
                          <motion.span
                            layoutId="format-glow"
                            className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-red-400/60"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* quality slider */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                    2 · Quality
                  </label>
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={ctxLabel}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-300"
                    >
                      {ctxLabel}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <input
                  type="range"
                  min={0}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  style={{ ["--val" as string]: `${quality}%` }}
                  className="yt-range w-full"
                  aria-label="Quality"
                />
                <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
                  {format === "audio"
                    ? ["96", "128", "192", "256", "320"].map((b) => (
                        <span key={b}>{b}k</span>
                      ))
                    : ["360p", "480p", "720p", "1080p", "4K"].map((r) => (
                        <span key={r}>{r}</span>
                      ))}
                </div>
              </div>

              {/* download action */}
              <div className="mt-auto">
                <motion.button
                  onClick={handleDownload}
                  disabled={!meta || dl === "working"}
                  whileTap={{ scale: meta ? 0.97 : 1 }}
                  className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-4 font-semibold transition ${
                    meta
                      ? "bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-lg shadow-red-900/40"
                      : "cursor-not-allowed bg-white/5 text-zinc-600"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={dl}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2"
                    >
                      {!meta ? (
                        "Load a video first"
                      ) : dl === "working" ? (
                        <>
                          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                          </svg>
                          Working…
                        </>
                      ) : dl === "done" ? (
                        <>✓ {dlMsg}</>
                      ) : dl === "error" ? (
                        <>⚠ {dlMsg}</>
                      ) : (
                        <>
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download {format === "thumb" ? "image" : format === "video" ? "MP4" : "MP3"}
                        </>
                      )}
                    </motion.span>
                  </AnimatePresence>
                  {meta && dl === "idle" && (
                    <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-700 group-hover:translate-x-0" />
                  )}
                </motion.button>
                <p className="mt-2 text-center text-[11px] text-zinc-600">
                  {format === "thumb"
                    ? "Saves a real image file to your device."
                    : "Downloads through the local YouTube stream server."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
