// Direction 4: Clean Academic
// Inspired by: RCA design school sites, large serif text, green accent links, white background, minimal

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

export default function Direction4() {
  useEffect(() => { document.title = "D6 — Clean Academic" }, [])
  const cursor = useRedCursor()
  return (
    <div
      className="w-screen h-screen bg-[#f9f9f9] overflow-hidden flex flex-col relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Red dot cursor */}
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />
      {/* Close button — top right */}
      <button className="absolute top-6 right-7 text-[22px] text-black/40 hover:text-black transition-colors z-10 leading-none">
        ×
      </button>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center px-[8vw] max-w-[900px]">
        {/* Title line */}
        <div
          className="text-[clamp(22px, 2.8vw, 34px)] leading-[1.3] mb-8"
          style={{
            fontFamily: "'Instrument Serif', serif",
          }}
        >
          <span className="text-black">State of the Art,</span>{" "}
          <span className="text-[#FF2A00] italic">Edition 01, 2026</span>
        </div>

        {/* Large body text */}
        <div
          className="text-[clamp(22px,3.2vw,38px)] leading-[1.35] text-black/90 tracking-[-0.01em]"
          style={{
            fontFamily: "'Instrument Serif', serif",
          }}
        >
          State of the Art is a publication for a pair of
          networked ideas, which contrast with the products
          of contemporary urban culture by aiming to highlight
          our dependency on the city and its systems.
          The seven essays in this edition; from speculative
          transit to Grecofuturism, from Alcatraz provocations
          to Ferlinghetti's method, aim to prompt consideration
          of our relationship to San Francisco and remind us
          of its reality as a physical infrastructure we
          depend on everyday.
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-end justify-between px-[8vw] pb-8 text-[12px] text-black/40 shrink-0">
        <div className="flex items-center gap-4">
          <span>7 Articles</span>
          <span className="text-black/15">·</span>
          <span className="hover:text-black cursor-pointer transition-colors">View Index</span>
          <span className="text-black/15">·</span>
          <span className="text-[#FF2A00]">#Urban Futures</span>
        </div>
        <div className="hover:text-black cursor-pointer transition-colors">
          Previous Edition
        </div>
      </div>
    </div>
  )
}
