// Direction 5: Minimal Filter / Visual Diary
// Inspired by: clean white background, category filter list with underlines, faded image, research archive feel

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

const filters = [
  "Urban Futures",
  "Speculative Design",
  "Transit",
  "Poetry & Culture",
  "Architecture",
  "Provocation",
]

export default function Direction5() {
  const cursor = useRedCursor()
  return (
    <div
      className="w-screen h-screen bg-white overflow-hidden flex flex-col relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Red dot cursor */}
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />

      {/* Title bar */}
      <div className="text-[11px] text-black/40 text-center py-2 border-b border-black/10 shrink-0 tracking-[0.03em]">
        State of the Art
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col px-[6vw] pt-[6vh] relative">
        {/* Top row: title left, link right */}
        <div className="flex justify-between items-start mb-[4vh]">
          <div>
            <div className="text-[clamp(24px,3vw,38px)] leading-[1.2] tracking-[-0.02em] text-black">
              State of the Art
            </div>
            <div className="text-[clamp(24px,3vw,38px)] leading-[1.2] tracking-[-0.02em] text-black">
              Research Edition, 2026
            </div>
          </div>
          <div className="text-[clamp(18px,2.2vw,28px)] text-black tracking-[-0.01em] cursor-pointer hover:opacity-60 transition-opacity">
            Articles and essays →
          </div>
        </div>

        {/* Filter section */}
        <div className="pl-[12vw] flex flex-col gap-[0.3em]">
          <div className="text-[clamp(18px,2.2vw,28px)] text-black/40 mb-[0.2em] tracking-[-0.01em]">
            Filter
          </div>
          {filters.map((f) => (
            <div
              key={f}
              className="text-[clamp(18px,2.2vw,28px)] text-black underline underline-offset-4 decoration-[1px] cursor-pointer hover:opacity-60 transition-opacity tracking-[-0.01em]"
            >
              {f}
            </div>
          ))}
        </div>

        {/* Close link */}
        <div className="pl-[12vw] mt-[5vh]">
          <div className="text-[clamp(18px,2.2vw,28px)] text-black underline underline-offset-4 decoration-[1px] cursor-pointer hover:opacity-60 transition-opacity tracking-[-0.01em]">
            Close
          </div>
        </div>

        {/* Faded image at bottom */}
        <img
          src="/sf-collage.png"
          alt=""
          className="absolute bottom-0 left-[12vw] w-[50vw] opacity-[0.18] pointer-events-none"
          style={{ filter: "grayscale(1)" }}
        />
      </div>
    </div>
  )
}
