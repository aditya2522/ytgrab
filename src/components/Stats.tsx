import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>
      {Math.round(val).toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  { to: 12, suffix: "M+", label: "Videos downloaded" },
  { to: 8, suffix: "+", label: "Formats supported" },
  { to: 4, suffix: "K", label: "Max resolution" },
  { to: 99, suffix: "%", label: "Uptime SLA" },
];

export default function Stats() {
  return (
    <section id="stats" className="relative px-6 py-20">
      <Reveal className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-10 backdrop-blur-md sm:p-14">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                <span className="text-gradient">
                  <Counter to={s.to} suffix={s.suffix} />
                </span>
              </div>
              <div className="mt-2 text-sm text-zinc-400">{s.label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
