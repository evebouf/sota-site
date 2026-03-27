// Direction 5: Minimal Filter / Visual Diary
// Inspired by: clean background, category filter list with underlines, faded image, research archive feel

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
  "Editor's Note: The City of Tomorrow",
  "San Francisco Is Not An Island",
  "The Ferlinghetti Method",
  "What Is Grecofuturism?",
  "Waymo and the Future of Transit",
  "Alcatraz 20XX?",
  "Against Progress",
]

export default function Direction5() {
  useEffect(() => { document.title = "D7 — Minimal Filter" }, [])
  const cursor = useRedCursor()
  return (
    <div
      className="w-screen h-screen bg-[#0a0a0a] overflow-hidden flex flex-col relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Red dot cursor */}
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />

      {/* Title bar */}
      <div className="text-[11px] text-white/30 text-center py-2 border-b border-white/10 shrink-0 tracking-[0.03em]">
        State of the Art
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col px-[6vw] pt-[6vh] relative">
        {/* Top row: title left, link right */}
        <div className="flex justify-between items-start mb-[4vh]">
          <div>
            <div className="text-[clamp(24px,3vw,38px)] leading-[1.2] tracking-[-0.02em] text-white">
              State of the Art
            </div>
            <div className="text-[clamp(24px,3vw,38px)] leading-[1.2] tracking-[-0.02em] text-white">
              Edition 01, 2026
            </div>
          </div>
          <div className="text-[clamp(18px,2.2vw,28px)] text-white/50 tracking-[-0.01em] cursor-pointer hover:text-white transition-colors">
            7 Articles →
          </div>
        </div>

        {/* Article titles as links */}
        <div className="pl-[12vw] flex flex-col gap-[0.3em]">
          <div className="text-[clamp(18px,2.2vw,28px)] text-white/30 mb-[0.2em] tracking-[-0.01em]">
            Contents
          </div>
          {articles.map((title) => (
            <div
              key={title}
              className="text-[clamp(18px,2.2vw,28px)] text-white underline underline-offset-4 decoration-[1px] decoration-white/20 cursor-pointer hover:text-[#FF2A00] hover:decoration-[#FF2A00]/40 transition-colors tracking-[-0.01em]"
            >
              {title}
            </div>
          ))}
        </div>

        {/* Close link */}
        <div className="pl-[12vw] mt-[5vh]">
          <div className="text-[clamp(18px,2.2vw,28px)] text-white/40 underline underline-offset-4 decoration-[1px] decoration-white/15 cursor-pointer hover:text-white transition-colors tracking-[-0.01em]">
            Close
          </div>
        </div>

        {/* Faded image at bottom */}
        <img
          src="/cover.webp"
          alt=""
          className="absolute bottom-0 left-[12vw] w-[40vw] opacity-[0.08] pointer-events-none"
        />
      </div>
    </div>
  )
}
