import { motion } from "motion/react";
import Reveal from "./Reveal";
import Magnetic from "./Magnetic";
import Logo from "./Logo";

export default function CTA() {
  return (
    <section id="cta" className="relative px-6 py-28">
      <Reveal className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 px-8 py-16 text-center sm:px-16 sm:py-24">
          {/* animated background */}
          <motion.div
            className="absolute inset-0 -z-10 bg-gradient-to-br from-red-700 via-rose-700 to-orange-700"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 200%" }}
          />
          <div className="absolute inset-0 -z-10 bg-black/30" />

          <div className="mb-8 flex justify-center">
            <Logo size="md" animated />
          </div>

          <h2 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Start downloading <br className="hidden sm:block" /> in seconds.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-white/80">
            No signup. No limits. Paste any YouTube link and get your file
            instantly — in any format, any quality.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Magnetic strength={0.5}>
              <a
                href="#downloader"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-black transition-transform"
              >
                Download now
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
            </Magnetic>
            <Magnetic strength={0.5}>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                View features
              </a>
            </Magnetic>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
