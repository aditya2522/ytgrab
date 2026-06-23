import { motion } from "motion/react";
import { cn } from "../utils/cn";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const markSizes = {
  sm: "h-9 w-9 rounded-xl",
  md: "h-11 w-11 rounded-2xl",
  lg: "h-16 w-16 rounded-[1.35rem]",
};

const iconSizes = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-9 w-9",
};

const textSizes = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-3xl",
};

export default function Logo({
  className,
  showText = true,
  size = "md",
  animated = false,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <motion.span
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 shadow-lg shadow-red-950/30",
          markSizes[size]
        )}
        animate={animated ? { rotate: [0, 7, -7, 0], scale: [1, 1.03, 1] } : undefined}
        transition={animated ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.38),transparent_36%)]" />
        <svg
          className={cn("relative text-white", iconSizes[size])}
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
        >
          <path d="M10 8.5v15l11-7.5-11-7.5Z" fill="currentColor" />
          <path
            d="M22.5 7.5v7.2m-3.4-3.4 3.4 3.4 3.4-3.4"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 25.5h16"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </motion.span>
      {showText && (
        <span className={cn("font-semibold tracking-tight text-white", textSizes[size])}>
          YT<span className="text-red-400">Grab</span>
        </span>
      )}
    </span>
  );
}