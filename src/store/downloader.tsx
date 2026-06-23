import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  extractVideoId,
  fetchVideoMeta,
  type VideoMeta,
} from "../lib/youtube";

export type Format = "thumb" | "video" | "audio";
export type Status = "idle" | "loading" | "loaded" | "error";

interface DownloaderState {
  url: string;
  setUrl: (u: string) => void;
  meta: VideoMeta | null;
  status: Status;
  error: string;
  format: Format;
  setFormat: (f: Format) => void;
  quality: number;
  setQuality: (q: number) => void;
  loadFromUrl: (u: string) => Promise<void>;
  loadSample: (id: string) => Promise<void>;
  reset: () => void;
}

const Ctx = createContext<DownloaderState | null>(null);

export function DownloaderProvider({ children }: { children: ReactNode }) {
  const [url, setUrl] = useState("");
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [format, setFormat] = useState<Format>("thumb");
  const [quality, setQuality] = useState(80);

  const loadFromUrl = useCallback(async (u: string) => {
    const id = extractVideoId(u);
    if (!id) {
      setStatus("error");
      setError("That doesn't look like a valid YouTube link.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const m = await fetchVideoMeta(id);
      setMeta(m);
      setStatus("loaded");
    } catch {
      setStatus("error");
      setError("Couldn't reach YouTube. Try again.");
    }
  }, []);

  const loadSample = useCallback(
    (id: string) => loadFromUrl(`https://youtu.be/${id}`),
    [loadFromUrl]
  );

  const reset = useCallback(() => {
    setMeta(null);
    setStatus("idle");
    setUrl("");
    setError("");
  }, []);

  return (
    <Ctx.Provider
      value={{
        url,
        setUrl,
        meta,
        status,
        error,
        format,
        setFormat,
        quality,
        setQuality,
        loadFromUrl,
        loadSample,
        reset,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useDownloader() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDownloader must be used within DownloaderProvider");
  return ctx;
}
