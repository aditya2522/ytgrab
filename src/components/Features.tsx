import { motion } from "motion/react";
import Reveal from "./Reveal";

interface Feature {
  title: string;
  desc: string;
  icon: string;
  accent: string;
}

const features: Feature[] = [
  {
    title: "4K Ultra HD",
    desc: "Download videos in crystal-clear 4K, 1080p, 720p, and all standard resolutions.",
    icon: "📺",
    accent: "from-red-500/20 to-rose-500/5",
  },
  {
    title: "MP3 Audio",
    desc: "Extract high-quality audio in MP3, AAC, or OPUS format — perfect for music.",
    icon: "🎵",
    accent: "from-orange-500/20 to-amber-500/5",
  },
  {
    title: "Batch Download",
    desc: "Paste an entire playlist URL and download every video at once.",
    icon: "📦",
    accent: "from-rose-500/20 to-pink-500/5",
  },
  {
    title: "Lightning Fast",
    desc: "Multi-threaded downloads push your connection to its absolute limit.",
    icon: "⚡",
    accent: "from-amber-500/20 to-orange-500/5",
  },
  {
    title: "No Sign-up",
    desc: "Zero accounts, zero tracking, zero ads. Paste and download instantly.",
    icon: "🔓",
    accent: "from-emerald-500/20 to-teal-500/5",
  },
  {
    title: "All Platforms",
    desc: "Works on any browser — desktop, tablet, or phone. No app install needed.",
    icon: "🌐",
    accent: "from-fuchsia-500/20 to-purple-500/5",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative px-6 py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-medium uppercase tracking-widest text-red-400">
          Features
        </span>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Everything you need to <span className="text-gradient">download</span>
        </h2>
        <p className="mt-4 text-zinc-400">
          Six pillars that make YTGrab the fastest, simplest downloader on the web.
        </p>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.08}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm"
            >
              <div
                className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${f.accent} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
              />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                  <motion.span
                    className="inline-block"
                    whileHover={{ rotate: 15, scale: 1.15 }}
                  >
                    {f.icon}
                  </motion.span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {f.desc}
                </p>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-red-400 to-transparent transition-transform duration-500 group-hover:scale-x-100" />
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
