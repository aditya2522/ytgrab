import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

/**
 * Layered gradient orbs that slowly drift and parallax toward the pointer.
 * Uses red/rose/orange to match the YouTube brand palette.
 */
export default function Aurora() {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth);
      my.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mx, my]);

  const x1 = useTransform(sx, [0, 1], [-40, 60]);
  const y1 = useTransform(sy, [0, 1], [-30, 50]);
  const x2 = useTransform(sx, [0, 1], [50, -50]);
  const y2 = useTransform(sy, [0, 1], [40, -40]);
  const x3 = useTransform(sx, [0, 1], [30, -30]);
  const y3 = useTransform(sy, [0, 1], [-40, 30]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* dotted grid */}
      <div className="grid-bg absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <motion.div
        style={{ x: x1, y: y1 }}
        className="absolute -left-32 top-[-10%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.55),transparent_60%)] blur-3xl"
        animate={{ scale: [1, 1.12, 0.95, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{ x: x2, y: y2 }}
        className="absolute right-[-15%] top-[10%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.45),transparent_60%)] blur-3xl"
        animate={{ scale: [0.95, 1.1, 1, 0.95] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{ x: x3, y: y3 }}
        className="absolute bottom-[-20%] left-[30%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.4),transparent_60%)] blur-3xl"
        animate={{ scale: [1, 0.9, 1.15, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* top + bottom vignette */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#06060b] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#06060b] to-transparent" />
    </div>
  );
}
