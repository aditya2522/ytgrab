import { useState } from "react";
import { motion } from "motion/react";
import type { VideoMeta } from "../lib/youtube";
import { downloadVideo, downloadImage } from "../lib/youtube";

type BtnState = "idle" | "loading" | "done" | "error";

interface Option {
  key: string;
  label: string;
  sub: string;
  icon: string;
  kind: "image" | "video" | "audio";
}

const options: Option[] = [
  { key: "thumb-hd", label: "Thumbnail HD", sub: "1280×720", icon: "🖼️", kind: "image" },
  { key: "thumb-sd", label: "Thumbnail SD", sub: "640×480", icon: "🌗", kind: "image" },
  { key: "mp4", label: "Download MP4", sub: "Video file", icon: "🎬", kind: "video" },
  { key: "mp3", label: "Download MP3", sub: "Audio file", icon: "🎵", kind: "audio" },
];

export default function VideoResult({
  meta,
  onReset,
}: {
  meta: VideoMeta;
  onReset: () => void;
}) {
  const [states, setStates] = useState<Record<string, BtnState>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});

  const set = (key: string, s: BtnState, msg = "") => {
    setStates((p) => ({ ...p, [key]: s }));
    if (msg) setMessages((p) => ({ ...p, [key]: msg }));
  };

  const run = async (opt: Option) => {
    set(opt.key, "loading");

    try {
      if (opt.kind === "image") {
        const q = opt.key === "thumb-hd" ? "maxresdefault" : "sddefault";
        const dim = opt.key === "thumb-hd" ? "1280×720" : "640×480";
        set(opt.key, "loading", `Fetching ${dim}...`);
        await downloadImage(meta.id, q, meta.title);
        set(opt.key, "done", `Saved ${dim} ✓`);
      } else {
        set(opt.key, "loading", "Submitting...");
        const result = await downloadVideo(
          meta.watchUrl,
          opt.kind as "video" | "audio",
          80,
          meta.title,
          (msg) => set(opt.key, "loading", msg)
        );
        set(opt.key, "done", `Saved ${result.filename} ✓`);
      }
      setTimeout(() => set(opt.key, "idle"), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed";
      set(opt.key, "error", msg.length > 28 ? "Try again" : msg);
      setTimeout(() => set(opt.key, "idle"), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl"
    >
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
        {/* thumbnail */}
        <a
          href={meta.watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="hover"
          className="group relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl sm:w-56"
        >
          <img
            src={meta.thumbnail}
            alt={meta.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <motion.span
            whileHover={{ scale: 1.12 }}
            className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-600/90 shadow-lg shadow-red-900/50"
          >
            <svg className="ml-1 h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.span>
        </a>

        {/* info + buttons */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-white">
            {meta.title}
          </h3>
          {meta.authorUrl ? (
            <a
              href={meta.authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm text-zinc-400 hover:text-red-300"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-[10px]">
                ▶
              </span>
              {meta.author}
            </a>
          ) : (
            <p className="mt-1 text-sm text-zinc-400">{meta.author}</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            {options.map((opt) => {
              const st = states[opt.key] ?? "idle";
              const msg = messages[opt.key] ?? "";
              return (
                <button
                  key={opt.key}
                  onClick={() => run(opt)}
                  disabled={st === "loading"}
                  data-cursor="hover"
                  className="group relative flex items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left transition-colors hover:border-red-400/40 hover:bg-red-500/10 disabled:opacity-60"
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-white">
                      {opt.label}
                    </span>
                    <span
                      className={`block truncate text-[10px] ${
                        st === "done" ? "text-emerald-400" : st === "error" ? "text-red-400" : "text-zinc-500"
                      }`}
                    >
                      {st === "loading"
                        ? msg || "Working..."
                        : st === "done"
                        ? msg || "Done ✓"
                        : st === "error"
                        ? msg
                        : opt.sub}
                    </span>
                  </span>
                  {st === "loading" && (
                    <motion.span
                      className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-red-400"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 3, ease: "linear" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-2 text-center text-[11px] text-zinc-600">
            Thumbnails save directly · Video/audio downloads through local server
          </p>
        </div>
      </div>

      <button
        onClick={onReset}
        data-cursor="hover"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-zinc-400 backdrop-blur transition-colors hover:bg-black/70 hover:text-white"
        aria-label="Clear"
      >
        ✕
      </button>
    </motion.div>
  );
}
