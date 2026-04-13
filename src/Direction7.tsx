// Direction 7: Playlist / Radio Index
// Inspired by: ofhundred.com — numbered rows, huge bold red type, play/pause circles, repeating overflow text

import { useState, useEffect, useRef } from "react"

function useRedCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [angle, setAngle] = useState(0)
  const prevPos = useRef({ x: -100, y: -100 })
  const angleRef = useRef(0)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - prevPos.current.x
      const dy = e.clientY - prevPos.current.y
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        const target = Math.atan2(dy, dx) * (180 / Math.PI)
        let diff = target - angleRef.current
        diff = ((diff + 180) % 360 + 360) % 360 - 180
        angleRef.current += diff
        setAngle(angleRef.current)
        prevPos.current = { x: e.clientX, y: e.clientY }
      }
      setPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])
  return { ...pos, angle }
}

const articles = [
  { num: "001", title: "Against Progress", author: "Wolf Tivy" },
  { num: "002", title: "SF Is Not An Island", author: "Jan Sramek" },
  { num: "003", title: "The Ferlinghetti Method", author: "Olivia Marotte" },
  { num: "004", title: "Grecofuturism", author: "Pablo Peniche" },
  { num: "005", title: "Waymo & Transit", author: "Evan Zimmerman" },
  { num: "006", title: "Alcatraz 20XX?", author: "Sanjana Friedman" },
  { num: "007", title: "City of Tomorrow", author: "Sanjana Friedman" },
]

export default function Direction7() {
  useEffect(() => { document.title = "D9 — Playlist Index" }, [])
  const cursor = useRedCursor()
  const [activeIndex, setActiveIndex] = useState(0)
  const red = "#E23525"

  return (
    <div
      className="w-screen h-screen bg-[#F5F2EE] overflow-hidden flex flex-col relative"
      style={{ fontFamily: "'Anybody', sans-serif" }}
    >
      <div
        className="fixed top-0 left-0 pointer-events-none z-50 hidden md:block"
        style={{ transform: `translate(${cursor.x}px, ${cursor.y - 12}px) rotate(${cursor.angle}deg)`, color: "#FF2A00", fontSize: "24px", lineHeight: 1 }}
        >➽</div>

      {/* Top bar */}
      <div className="text-[11px] text-black/30 text-center py-2 shrink-0 tracking-[0.04em]"
        style={{ fontFamily: "'Space Mono', monospace" }}
      >
        stateoftheart.pub
      </div>

      {/* Article rows */}
      <div className="flex-1 flex flex-col justify-center overflow-hidden">
        {articles.map((a, i) => (
          <div
            key={a.num}
            className="border-t cursor-pointer group"
            style={{ borderColor: `${red}30` }}
            onClick={() => setActiveIndex(i)}
          >
            <div className="flex items-center overflow-hidden px-[2.5vw] py-[0.8vh]">
              {/* Number */}
              <span
                className="shrink-0 tabular-nums leading-none mr-[1.5vw]"
                style={{
                  color: red,
                  fontSize: "clamp(28px, 4vw, 56px)",
                  fontVariationSettings: "'wdth' 90, 'wght' 400",
                }}
              >
                {a.num}
              </span>

              {/* Play/Pause circle */}
              <div
                className="shrink-0 rounded-full flex items-center justify-center mr-[1.5vw]"
                style={{
                  width: "clamp(28px, 3.5vw, 48px)",
                  height: "clamp(28px, 3.5vw, 48px)",
                  backgroundColor: i === activeIndex ? red : "transparent",
                  border: `2px solid ${red}`,
                }}
              >
                <span
                  className="text-[8px] uppercase tracking-[0.08em] font-bold"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    color: i === activeIndex ? "#F5F2EE" : red,
                    fontSize: "clamp(6px, 0.7vw, 9px)",
                  }}
                >
                  {i === activeIndex ? "Read" : "Read"}
                </span>
              </div>

              {/* Title — large, repeating, overflowing */}
              <div className="flex-1 overflow-hidden whitespace-nowrap">
                <span
                  className="leading-none uppercase group-hover:opacity-70 transition-opacity"
                  style={{
                    color: red,
                    fontSize: "clamp(32px, 5.5vw, 76px)",
                    fontVariationSettings: "'wdth' 100, 'wght' 800",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {a.title}
                  <span className="ml-[3vw] opacity-40">{a.title}</span>
                  <span className="ml-[3vw] opacity-20">{a.author}</span>
                  <span className="ml-[3vw] opacity-10">/{a.num}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
        {/* Final border */}
        <div style={{ borderTop: `1px solid ${red}30` }} />
      </div>

      {/* Bottom bar */}
      <div
        className="shrink-0 flex items-center justify-between px-[2.5vw] py-3 border-t"
        style={{
          borderColor: `${red}30`,
          fontFamily: "'Space Mono', monospace",
          fontSize: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "rgba(0,0,0,0.35)",
        }}
      >
        <div className="flex gap-5">
          <span className="hover:text-black cursor-pointer transition-colors">Prev</span>
          <span className="hover:text-black cursor-pointer transition-colors">Mute</span>
          <span className="hover:text-black cursor-pointer transition-colors">Next</span>
        </div>
        <div className="max-w-[50vw] text-center text-[8px] leading-[1.5] hidden md:block" style={{ letterSpacing: "0.04em" }}>
          State of the Art explores urban futures, speculative design, and the cultural forces shaping San Francisco. Edition 01, 2026.
        </div>
        <div className="flex gap-5">
          <span className="hover:text-black cursor-pointer transition-colors">Grid</span>
          <span className="hover:text-black cursor-pointer transition-colors">List</span>
          <span className="hover:text-black cursor-pointer transition-colors">About</span>
        </div>
      </div>
    </div>
  )
}
