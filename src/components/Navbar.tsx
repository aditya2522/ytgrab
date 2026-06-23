import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "../utils/cn";
import Magnetic from "./Magnetic";
import Logo from "./Logo";

const links = [
  { label: "Downloader", id: "downloader" },
  { label: "Features", id: "features" },
  { label: "Samples", id: "supported" },
  { label: "Top", id: "top" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={cn(
          "flex w-full max-w-6xl items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-500 sm:px-6",
          scrolled
            ? "border-white/10 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        )}
      >
        <a href="#top" aria-label="YTGrab home">
          <Logo size="sm" animated />
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="relative rounded-lg px-3.5 py-2 text-sm text-zinc-300 transition-colors hover:text-white"
            >
              <span className="relative z-10">{l.label}</span>
              <motion.span
                className="absolute inset-0 rounded-lg bg-white/0"
                whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                transition={{ duration: 0.2 }}
              />
            </a>
          ))}
        </div>

        <Magnetic>
          <a
            href="#downloader"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            <span className="relative z-10">Download now</span>
            <svg className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-red-200 to-transparent group-hover:animate-[shimmer_1s_ease]" />
          </a>
        </Magnetic>
      </nav>
    </motion.header>
  );
}
