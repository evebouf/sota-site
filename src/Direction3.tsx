// Direction 3: Dark Radial Glow
// Inspired by: black void with centered radial light, flowing text with arrow separators, portfolio index

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

const items = [
  "Against Progress", "Essay", "Wolf Tivy",
  "San Francisco Is Not An Island", "Urban Study", "Jan Sramek",
  "The Ferlinghetti Method", "Poetry & Culture", "Olivia Marotte",
  "What is Grecofuturism?", "Speculative Design", "Pablo Peniche",
  "Waymo and the Future of Transit", "Infrastructure", "Evan Zimmerman",
  "Alcatraz 20XX?", "Provocation", "Sanjana Friedman",
  "The City of Tomorrow", "Editor's Note", "Sanjana Friedman",
  "Edition 01", "San Francisco", "2026",
  "Urban Futures", "Critical Culture", "Speculative Fiction",
  "Architecture", "Transit", "Poetry",
]

export default function Direction3() {
  const cursor = useRedCursor()
  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative flex items-center justify-center">
      {/* Red dot cursor */}
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)",
        }}
      />

      {/* Attribution — top left */}
      <div
        className="absolute top-8 left-8 text-white/80 text-[12px] leading-[1.6] z-10"
        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
      >
        <div className="font-medium text-white">State of the Art</div>
        <div className="text-white/50">Urban Futures and Critical Culture</div>
        <div className="text-white/30 mt-1">©2026 — SOTA</div>
      </div>

      {/* Center flowing text */}
      <div
        className="max-w-[70vw] text-center z-10 px-8"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 300,
          fontSize: "clamp(13px, 1.4vw, 19px)",
          lineHeight: 1.9,
          color: "rgba(255,255,255,0.75)",
          letterSpacing: "0.01em",
        }}
      >
        {items.map((item, i) => (
          <span key={i}>
            {item}
            {i < items.length - 1 && (
              <span className="text-white/25 mx-[0.6em]">→</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
