import { motion, useScroll, useSpring } from "motion/react";
import CustomCursor from "./components/CustomCursor";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Playground from "./components/Playground";
import Features from "./components/Features";
import Stats from "./components/Stats";
import Showcase from "./components/Showcase";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import { DownloaderProvider } from "./store/downloader";

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <DownloaderProvider>
      <div className="relative min-h-screen bg-[#06060b] text-zinc-100">
        <CustomCursor />

        {/* top scroll-progress bar */}
        <motion.div
          style={{ scaleX }}
          className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-red-500 via-rose-400 to-orange-400"
        />

        <Navbar />

        <main>
          <Hero />
          <Marquee />
          <Playground />
          <Features />
          <Stats />
          <Showcase />
          <CTA />
        </main>

        <Footer />
      </div>
    </DownloaderProvider>
  );
}
