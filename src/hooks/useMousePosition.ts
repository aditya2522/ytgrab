import { useEffect, useState } from "react";

/**
 * Tracks the live pointer position relative to the viewport.
 * Returns null until the user moves the mouse (SSR / no pointer safe).
 */
export function useMousePosition() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return pos;
}
