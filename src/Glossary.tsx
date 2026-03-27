import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

function useRedCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])
  return pos
}

const pages = [
  { path: "/d0", label: "D0 — Original", desc: "Stacked serif titles, hover effects, dark mode toggle" },
  { path: "/d1", label: "D1 — Map & Audio", desc: "3D Mapbox city, sidebar nav, generative ambient audio engine" },
  { path: "/d2", label: "D2 — Editorial", desc: "Second editorial layout" },
  { path: "/d3", label: "D3 — Brutalist Map", desc: "Dark brutalist grid, 3D map with live coordinates + clock, red mode toggle" },
  { path: "/d4", label: "D4 — Dark Cinematic", desc: "Numbered monospace list, floating magazine cover, timecode overlay" },
  { path: "/d5", label: "D5 — Cover + Hover Worlds", desc: "Magazine cover, bold Anybody titles, per-article hover environments" },
  { path: "/d6", label: "D6 — Clean Academic", desc: "Large serif, red accent links" },
  { path: "/d7", label: "D7 — Dark Minimal", desc: "Dark background, article titles as underlined links, faded cover" },
  { path: "/d8", label: "D8 — Dark Stacked Nav", desc: "Huge bold zigzag text, horizontal rules" },
  { path: "/d9", label: "D9 — Playlist Index", desc: "Red bold type, numbered rows, repeating overflow" },
  { path: "/d10", label: "D10 — Portfolio Index", desc: "Bold lowercase, superscript numbers, floating image, red accent" },
  { path: "/d11", label: "D11 — Conversational", desc: "Dark background, red italic Anybody paragraph, DM Sans chrome" },
  { path: "/d12", label: "D12 — Exhibition Broadsheet", desc: "Dark distressed typography, vertical title, live clock + countdown + moon phase" },
  { path: "/d13", label: "D13 — Chaos Catalog", desc: "Dark scattered Fig. entries, Anybody bold overlays, research board aesthetic" },
  { path: "/d14", label: "D14 — Festival Poster", desc: "Bold stacked lineup, scattered SF motif, Rewire-inspired typographic confetti" },
  { path: "/d15", label: "D15 — Scattered Program", desc: "Random black dots, scattered info fields, airy open layout, event flyer" },
  { path: "/d16", label: "D16 — Text Wallpaper", desc: "Repeating text background, bold words popping through at scale, Swiss Design Awards" },
]

export default function Glossary() {
  useEffect(() => { document.title = "SOTA — Page Index" }, [])
  const cursor = useRedCursor()

  const [starred, setStarred] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("sota-starred")
      return saved ? new Set(JSON.parse(saved)) : new Set()
    } catch { return new Set() }
  })

  const toggleStar = (path: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setStarred(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      localStorage.setItem("sota-starred", JSON.stringify([...next]))
      return next
    })
  }

  return (
    <div
      className="w-screen min-h-screen bg-white flex flex-col px-[6vw] py-[4vh]"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />

      <div className="text-[10px] uppercase tracking-[0.15em] text-black/40 mb-[3vh]">
        State of the Art — Page Index
      </div>

      <div className="flex flex-col">
        {pages.map((p, i) => (
          <Link
            key={p.path}
            to={p.path}
            target="_blank"
            className="group flex items-baseline gap-4 py-[6px] border-t border-black/8 no-underline hover:bg-black/[0.02] transition-colors px-1 -mx-1"
          >
            <span
              className="text-[16px] w-[28px] shrink-0 cursor-pointer transition-colors duration-150 select-none flex items-center justify-center"
              style={{ color: starred.has(p.path) ? "#FF2A00" : "rgba(0,0,0,0.15)", cursor: "none" }}
              onClick={(e) => toggleStar(p.path, e)}
              title="Star this direction"
            >
              {starred.has(p.path) ? "●" : "○"}
            </span>
            <span className="text-[10px] text-black/20 tabular-nums w-[20px] shrink-0">
              {String(i).padStart(2, "0")}
            </span>
            <span className="text-[15px] text-black tracking-[-0.01em] group-hover:underline underline-offset-3 decoration-[1px]">
              {p.label}
            </span>
            <span className="text-[10px] text-black/30 tracking-[0.01em] hidden sm:inline">
              {p.desc}
            </span>
            <span className="ml-auto text-[12px] text-black/15 group-hover:text-black/50 transition-colors">
              →
            </span>
          </Link>
        ))}
        <div className="border-t border-black/8" />
      </div>

      <div className="mt-[2vh] text-[9px] text-black/20 uppercase tracking-[0.1em]">
        {pages.length} directions{starred.size > 0 ? ` — ${starred.size} starred` : ""}
      </div>
    </div>
  )
}
