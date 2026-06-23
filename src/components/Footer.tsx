import Logo from "./Logo";

const groups = [
  {
    title: "Product",
    links: [
      { label: "Downloader", id: "downloader" },
      { label: "Features", id: "features" },
      { label: "Samples", id: "supported" },
      { label: "Back to top", id: "top" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "How it works", id: "downloader" },
      { label: "Supported formats", id: "features" },
      { label: "Try a sample", id: "supported" },
      { label: "Stats", id: "stats" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href="#top" aria-label="YTGrab home">
              <Logo size="sm" animated />
            </a>
            <p className="mt-4 max-w-xs text-sm text-zinc-500">
              The fastest, simplest YouTube video downloader on the web. Free,
              unlimited, no sign-up required.
            </p>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="text-sm font-semibold text-white">{g.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={`#${l.id}`}
                      className="group relative text-sm text-zinc-500 transition-colors hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} YTGrab — Download responsibly.</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
            </span>
            All systems online
          </div>
        </div>
      </div>
    </footer>
  );
}
