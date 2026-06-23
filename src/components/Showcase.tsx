import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Reveal from "./Reveal";
import { useDownloader } from "../store/downloader";

interface Sample {
  id: string;
  title: string;
  tag: string;
  art: string;
}

const samples: Sample[] = [
  { id: "Wdjh81uH6FU", title: "Baby Shark Dance",        tag: "Pinkfong",      art: "from-red-600 via-rose-600 to-pink-700" },
  { id: "kJQP7kiw5Fk", title: "Despacito",               tag: "Luis Fonsi",    art: "from-orange-500 via-amber-500 to-yellow-600" },
  { id: "9bZkp7q19f0", title: "Gangnam Style",           tag: "PSY",           art: "from-rose-500 via-red-500 to-orange-600" },
  { id: "JGwWNGJdvx8", title: "Shape of You",            tag: "Ed Sheeran",    art: "from-fuchsia-500 via-rose-500 to-red-600" },
  { id: "dQw4w9WgXcQ", title: "Never Gonna Give You Up", tag: "Rick Astley",   art: "from-amber-500 via-orange-600 to-red-700" },
  { id: "YQHsXMglC9A", title: "Hello",                   tag: "Adele",         art: "from-blue-500 via-cyan-500 to-sky-600" },
  { id: "RgKAFK5djSk", title: "See You Again",           tag: "Wiz Khalifa",   art: "from-violet-500 via-purple-500 to-fuchsia-600" },
  { id: "fRh_vgS2dFE", title: "Sorry",                   tag: "Justin Bieber", art: "from-emerald-500 via-green-500 to-lime-600" },
];

export default function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-68%"]);

  const { loadSample } = useDownloader();

  const pick = (id: string) => {
    loadSample(id);
    setTimeout(() => {
      document
        .getElementById("downloader")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 350);
  };

  return (
    <section id="supported" ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <Reveal className="mb-10 px-6">
          <span className="text-sm font-medium uppercase tracking-widest text-red-400">
            🔥 Featured Videos
          </span>
          <h2 className="mt-3 max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Featured videos ready to <span className="text-gradient">download</span>
          </h2>
          <p className="mt-3 max-w-lg text-zinc-400">
            Popular videos preloaded for testing. Click any card and instantly
            load it into the downloader.
          </p>
        </Reveal>

        <motion.div style={{ x }} className="flex gap-6 px-6">
          {samples.map((s, i) => (
            <motion.button
              key={s.id}
              onClick={() => pick(s.id)}
              data-cursor="hover"
              whileHover={{ y: -12 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="group relative h-[26rem] w-[20rem] shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] text-left sm:w-[24rem]"
            >
              <div className={`relative h-3/5 overflow-hidden bg-gradient-to-br ${s.art}`}>
                <img
                  src={`https://i.ytimg.com/vi/${s.id}/hqdefault.jpg`}
                  alt={s.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                  referrerPolicy="no-referrer"
                />
                <motion.div
                  className="absolute inset-0 opacity-40 mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), transparent 40%)",
                  }}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute bottom-3 left-4 text-7xl font-black text-white/20">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <motion.span
                  className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-colors group-hover:bg-white/30"
                  whileHover={{ scale: 1.12 }}
                >
                  <svg className="ml-1 h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.span>
              </div>
              <div className="flex h-2/5 flex-col justify-between p-6">
                <div>
                  <div className="text-xs uppercase tracking-widest text-zinc-500">
                    {s.tag}
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-2xl font-semibold text-white">
                    {s.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-red-300">
                  Load into studio
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
