// Direction 2: Dark Cinematic
// Inspired by: film festival archive, black background, numbered monospace list, floating image with timecode

import { useState, useEffect } from "react"

function useRedCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])
  return pos
}

const articles = [
  { num: "01", title: "Against Progress" },
  { num: "02", title: "San Francisco Is Not An Island" },
  { num: "03", title: "The Ferlinghetti Method" },
  { num: "04", title: "What Is Grecofuturism?" },
  { num: "05", title: "Waymo And The Future Of Transit" },
  { num: "06", title: "Alcatraz 20XX?" },
  { num: "07", title: "The City Of Tomorrow" },
]

export default function Direction2() {
  const cursor = useRedCursor()
  return (
    <div
      className="w-screen h-screen bg-black overflow-hidden flex flex-col relative"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {/* Red dot cursor */}
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />
      {/* Top nav */}
      <nav className="flex items-center px-8 py-5 shrink-0 relative z-10">
        <div className="text-white text-[14px] font-bold tracking-[0.15em] uppercase">
          S:O:T:A
        </div>
        <div className="flex-1 flex justify-center gap-10 text-white/70 text-[12px] tracking-[0.12em] uppercase">
          <span className="hover:text-white cursor-pointer transition-colors">Articles</span>
          <span className="hover:text-white cursor-pointer transition-colors">Contributors</span>
          <span className="hover:text-white cursor-pointer transition-colors">Index</span>
          <span className="hover:text-white cursor-pointer transition-colors">About</span>
        </div>
        {/* Crosshair icon */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-white/70">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10" y1="0" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10" y1="14" x2="10" y2="20" stroke="currentColor" strokeWidth="1.5" />
          <line x1="0" y1="10" x2="6" y2="10" stroke="currentColor" strokeWidth="1.5" />
          <line x1="14" y1="10" x2="20" y2="10" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </nav>

      {/* Thin separator line */}
      <div className="w-full h-px bg-white/20 shrink-0" />

      {/* Article list */}
      <div className="flex-1 flex flex-col justify-center px-8 py-6 overflow-hidden relative">
        {articles.map((a) => (
          <div
            key={a.num}
            className="text-white uppercase leading-[1.15] cursor-pointer hover:text-white/60 transition-colors"
            style={{
              fontSize: "clamp(32px, 5.5vw, 78px)",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            <span className="text-white/40">NO.{a.num}</span>
            {"  "}
            {a.title}
          </div>
        ))}
      </div>

      {/* Floating image with timecode */}
      <div
        className="absolute z-20 shadow-2xl"
        style={{
          top: "28%",
          right: "18%",
          width: "clamp(160px, 18vw, 260px)",
        }}
      >
        {/* Timecode */}
        <div
          className="absolute top-3 left-3 bg-black/60 text-white text-[11px] tracking-[0.1em] px-2 py-1 z-10"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          00:35:00
        </div>
        {/* Dashed border frame */}
        <div className="absolute inset-[-6px] border border-dashed border-white/40 pointer-events-none" />
        <img
          src="/alcatraz-sketch.png"
          alt=""
          className="w-full aspect-[4/5] object-cover"
          style={{ filter: "grayscale(0.8) brightness(0.7) contrast(1.3)" }}
        />
      </div>
    </div>
  )
}
