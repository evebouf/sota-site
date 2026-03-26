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
  { path: "/d1", label: "D1 — Map & Audio", desc: "Mapbox map + generative ambient audio engine" },
  { path: "/d2", label: "D2 — Editorial", desc: "Second editorial layout" },
  { path: "/d3", label: "D3 — Brutalist Grid", desc: "Black borders, halftone image, category sidebar" },
  { path: "/d4", label: "D4 — Dark Cinematic", desc: "Numbered monospace list, floating timecode image" },
  { path: "/d5", label: "D5 — Dark Radial Glow", desc: "Radial light, flowing text with → arrows" },
  { path: "/d6", label: "D6 — Clean Academic", desc: "Large serif, red accent links" },
  { path: "/d7", label: "D7 — Minimal Filter", desc: "Underlined category filters, faded collage" },
  { path: "/d8", label: "D8 — Dark Stacked Nav", desc: "Huge bold zigzag text, horizontal rules" },
  { path: "/d9", label: "D9 — Playlist Index", desc: "Red bold type, numbered rows, repeating overflow" },
  { path: "/d10", label: "D10 — Portfolio Index", desc: "Bold lowercase, superscript numbers, floating image, red accent" },
  { path: "/d11", label: "D11 — Conversational", desc: "Large red italic serif paragraph, inline links, circled markers" },
]

export default function Glossary() {
  const cursor = useRedCursor()
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
        {pages.length} directions
      </div>
    </div>
  )
}
