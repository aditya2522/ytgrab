const items = [
  "MP4 Video",
  "MP3 Audio",
  "4K Ultra HD",
  "1080p Full HD",
  "WEBM Format",
  "AAC Audio",
  "No Watermark",
  "No Sign-up",
  "Unlimited Downloads",
];

export default function Marquee() {
  const row = [...items, ...items];
  return (
    <section className="relative border-y border-white/10 bg-white/[0.02] py-6">
      <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
          {row.map((item, i) => (
            <div key={i} className="flex items-center gap-10">
              <span className="text-2xl font-semibold tracking-tight text-zinc-500 sm:text-3xl">
                {item}
              </span>
              <span className="text-2xl text-red-500/70">▶</span>
            </div>
          ))}
        </div>
        <div
          className="animate-marquee flex shrink-0 items-center gap-10 pr-10"
          aria-hidden
        >
          {row.map((item, i) => (
            <div key={i} className="flex items-center gap-10">
              <span className="text-2xl font-semibold tracking-tight text-zinc-500 sm:text-3xl">
                {item}
              </span>
              <span className="text-2xl text-orange-500/70">▶</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
