import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * A glowing cursor that follows the pointer with spring physics.
 * Hidden on touch devices.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [clicked, setClicked] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const ringX = useSpring(x, { stiffness: 220, damping: 26, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 220, damping: 26, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement;
      setActive(!!el.closest("a, button, input, [data-cursor='hover']"));
    };
    const down = () => setClicked(true);
    const up = () => setClicked(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* crisp dot */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[100] h-2 w-2 rounded-full bg-white mix-blend-difference"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{ scale: clicked ? 0.6 : 1 }}
      />
      {/* lagging glow ring */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border border-red-300/70"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
          boxShadow: "0 0 24px 4px rgba(239,68,68,0.45)",
        }}
        animate={{
          width: active ? 56 : 34,
          height: active ? 56 : 34,
          opacity: active ? 1 : 0.7,
          scale: clicked ? 0.8 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      />
    </>
  );
}
