// Direction 8: Portfolio Index
// Inspired by: SierraPruitt — large bold lowercase text, superscript numbers, floating center image, green accent

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

const words: { text: string; num: string; green?: boolean }[] = [
  { text: "against progress", num: "7" },
  { text: "sf island", num: "12" },
  { text: "ferlinghetti", num: "3" },
  { text: "grecofuturism", num: "9", green: true },
  { text: "waymo", num: "5" },
  { text: "transit", num: "14" },
  { text: "alcatraz", num: "8" },
  { text: "20xx?", num: "2" },
  { text: "tomorrow", num: "11" },
  { text: "urban", num: "6" },
  { text: "futures", num: "18" },
  { text: "edition", num: "1" },
]

export default function Direction8() {
  const cursor = useRedCursor()
  return (
    <div
      className="w-screen h-screen bg-white overflow-hidden flex flex-col justify-between px-[5vw] py-[5vh] relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />
        {/* Brand top-left */}
        <div className="text-[13px] tracking-[0.02em] text-black/70">
          StateOfTheArt®
        </div>

        {/* Center text block with floating image */}
        <div className="relative flex-1 flex items-center justify-center">
          {/* Floating image */}
          <img
            src="/ferlinghetti-portrait.svg"
            alt=""
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[52%] w-auto object-contain z-10 opacity-90"
            style={{ filter: "invert(1)" }}
          />

          {/* Text wrapping around */}
          <div
            className="relative z-20 text-center leading-[1.15] px-[2vw]"
            style={{
              fontSize: "clamp(30px, 5vw, 68px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {words.map((w, i) => (
              <span key={i} className="inline">
                <span
                  className={`cursor-pointer transition-opacity hover:opacity-60 ${
                    w.green ? "text-[#FF2A00] line-through decoration-[2px]" : "text-black"
                  }`}
                >
                  {w.text}
                </span>
                <sup className="text-[0.35em] text-black/30 font-normal ml-[0.05em]">
                  ({w.num})
                </sup>
                {i < words.length - 1 && <span>{"  "}</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-end justify-between">
          <div className="flex gap-6 text-[clamp(18px,2vw,26px)] font-bold tracking-[-0.01em]">
            <span className="cursor-pointer hover:opacity-60 transition-opacity">articles</span>
            <span className="cursor-pointer hover:opacity-60 transition-opacity text-[#FF2A00]">contact</span>
          </div>
          <div className="flex gap-8 text-[12px] text-black/40 underline underline-offset-2"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            <span>sota@stateoftheart.pub</span>
          </div>
        </div>
    </div>
  )
}
