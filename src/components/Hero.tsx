import { useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import Aurora from "./Aurora";
import Magnetic from "./Magnetic";
import VideoResult from "./VideoResult";
import Logo from "./Logo";
import { useDownloader } from "../store/downloader";

const headline = ["Download", "Any", "YouTube", "Video."];

const formats = [
  { label: "MP4 4K", angle: 0 },
  { label: "MP3 320", angle: 60 },
  { label: "1080p", angle: 120 },
  { label: "720p", angle: 180 },
  { label: "WEBM", angle: 240 },
  { label: "AAC", angle: 300 },
];

const SAMPLE = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const {
    url,
    setUrl,
    meta,
    status,
    error,
    loadFromUrl,
    reset,
  } = useDownloader();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    loadFromUrl(url);
  };

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-28 pb-20"
    >
      <Aurora />

      <motion.div
        style={{ y, opacity }}
        className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <Logo size="lg" animated />
        </motion.div>

        {/* live badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="group mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-zinc-300 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
          </span>
          Free · No signup · Unlimited
          <span className="text-zinc-500">— paste any link below</span>
        </motion.div>

        {/* headline with per-word reveal */}
        <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-7xl md:text-8xl">
          {headline.map((word, i) => (
            <span key={i} className="mr-4 inline-block overflow-hidden align-bottom">
              <motion.span
                className={i === 3 ? "text-gradient inline-block" : "inline-block"}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-7 max-w-xl text-lg text-zinc-400"
        >
          Paste a YouTube link to fetch live video info, then fine-tune format &
          quality in the studio below. Real previews, real downloads.
        </motion.p>

        {/* URL input */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-9 w-full max-w-2xl"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0 sm:overflow-hidden sm:rounded-2xl sm:border sm:border-white/10 sm:bg-white/5 sm:backdrop-blur-xl">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z" />
              </svg>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL here..."
                spellCheck={false}
                data-cursor="hover"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-12 py-4 text-base text-white placeholder-zinc-500 backdrop-blur-md focus:border-red-500/50 focus:bg-white/8 focus:outline-none focus:ring-2 focus:ring-red-500/20 sm:rounded-none sm:border-0 sm:bg-transparent sm:pl-11 sm:focus:ring-0"
              />
            </div>
            <Magnetic strength={0.4}>
              <button
                type="submit"
                disabled={status === "loading"}
                className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-rose-500 px-8 py-4 font-semibold text-white shadow-lg shadow-red-900/40 transition-opacity disabled:opacity-60 sm:w-auto sm:rounded-none"
              >
                {status === "loading" ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                    </svg>
                    Fetching...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Get Video
                  </>
                )}
                <span className="absolute inset-0 -translate-x-full bg-white/25 group-hover:translate-x-0 group-hover:transition-transform group-hover:duration-700" />
              </button>
            </Magnetic>
          </div>

          {/* error + sample */}
          <div className="mt-3 flex min-h-[1.5rem] items-center justify-center gap-3 text-sm">
            <AnimatePresence mode="wait">
              {status === "error" ? (
                <motion.span
                  key="err"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400"
                >
                  ⚠ {error}
                </motion.span>
              ) : status === "loaded" ? (
                <motion.span
                  key="ok"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-emerald-400"
                >
                  ✓ Loaded — customize & download in the studio ↓
                </motion.span>
              ) : (
                <motion.span
                  key="sample"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-zinc-600"
                >
                  No link?{" "}
                  <button
                    type="button"
                    onClick={() => setUrl(SAMPLE)}
                    className="text-red-400 underline-offset-2 hover:underline"
                  >
                    Try a sample video
                  </button>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.form>

        {/* result card OR orbit cluster */}
        <div className="relative mt-12 flex min-h-[16rem] w-full items-center justify-center">
          <AnimatePresence mode="wait">
            {status === "loaded" && meta ? (
              <VideoResult key="result" meta={meta} onReset={reset} />
            ) : (
              <motion.div
                key="orbit"
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative h-64 w-full max-w-md sm:h-72"
              >
                {/* rotating orbit ring */}
                <motion.div
                  className="absolute inset-0 m-auto h-64 w-64 sm:h-72 sm:w-72"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
                >
                  {formats.map((o) => (
                    <span
                      key={o.label}
                      className="absolute left-1/2 top-1/2"
                      style={{ transform: `rotate(${o.angle}deg) translateY(-132px)` }}
                    >
                      <motion.span
                        className="-ml-12 inline-block w-24"
                        style={{ transform: `rotate(${-o.angle}deg)` }}
                      >
                        <motion.span
                          animate={{ rotate: -360 }}
                          transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
                          className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 backdrop-blur-md"
                        >
                          {o.label}
                        </motion.span>
                      </motion.span>
                    </span>
                  ))}
                </motion.div>

                {/* counter-rotating dashed ring */}
                <motion.div
                  className="absolute inset-0 m-auto h-48 w-48 rounded-full border border-dashed border-white/10"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                />

                {/* draggable glass card */}
                <motion.div
                  drag
                  dragSnapToOrigin
                  dragElastic={0.25}
                  whileTap={{ scale: 1.05, cursor: "grabbing" }}
                  whileHover={{ scale: 1.04 }}
                  className="absolute left-1/2 top-1/2 z-10 flex h-32 w-44 -translate-x-1/2 -translate-y-1/2 cursor-grab flex-col justify-between rounded-2xl border border-white/15 bg-white/10 p-4 text-left backdrop-blur-xl shadow-2xl shadow-black/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-300">drag me</span>
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                      className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_8px_2px_rgba(248,113,113,0.7)]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-3/4 rounded-full bg-gradient-to-r from-red-400 to-orange-400" />
                    <div className="h-1.5 w-1/2 rounded-full bg-white/20" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* scroll cue */}
      {status !== "loaded" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-7 left-1/2 -translate-x-1/2"
        >
          <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/20 p-1">
            <motion.span
              className="h-1.5 w-1 rounded-full bg-white/70"
              animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}
