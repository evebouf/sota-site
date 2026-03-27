// Direction 4: Index Book Cover
// Inspired by: OMA NY Search Term — index list with huge overlaid title, Rizzoli book aesthetic

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

const index = [
  { title: "Editor's Note: The City of Tomorrow", num: "001" },
  { title: "San Francisco Is Not An Island", num: "002" },
  { title: "The Ferlinghetti Method", num: "003" },
  { title: "What Is Grecofuturism?", num: "004" },
  { title: "Waymo and the Future of Transit", num: "005" },
  { title: "Alcatraz 20XX?", num: "006" },
  { title: "Against Progress", num: "007" },
  { title: "The Northern California Megaregion", num: "008" },
  { title: "City Lights Bookstore", num: "009" },
  { title: "Counter-Entropic Politics", num: "010" },
  { title: "Marble, Sandstone, Metal", num: "011" },
  { title: "Fully Autonomous Transit", num: "012" },
  { title: "Dispatch from the Future", num: "013" },
  { title: "One Must Be Absolutely Modern", num: "014" },
  { title: "Urban Futures and Critical Culture", num: "015" },
  { title: "The Old SF Is Dead", num: "016" },
  { title: "Infrastructure for a Generation", num: "017" },
  { title: "A Testing Ground for Writers", num: "018" },
]

export default function Direction4() {
  useEffect(() => { document.title = "D6 — Index Book Cover" }, [])
  const cursor = useRedCursor()
  return (
    <div
      className="w-screen h-screen bg-[#0a0a0a] overflow-hidden relative flex items-center justify-center"
    >
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />

      {/* Page — white book cover */}
      <div
        className="relative bg-[#f5f2ed] overflow-hidden"
        style={{
          width: "min(75vh, 85vw)",
          height: "min(95vh, 110vw)",
          padding: "clamp(20px, 4vh, 40px) clamp(24px, 4vw, 48px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 4px 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* Index list */}
        <div style={{ fontFamily: "'Inter', 'DM Sans', sans-serif", position: "relative", zIndex: 1 }}>
          {index.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-baseline"
              style={{
                fontSize: "clamp(11px, 1.4vh, 17px)",
                lineHeight: 1.65,
                color: "#0a0a0a",
                fontWeight: 400,
              }}
            >
              <span>{item.title}</span>
              <span className="tabular-nums" style={{ fontWeight: 400 }}>{item.num}</span>
            </div>
          ))}
        </div>

        {/* Huge overlaid title — SOTA */}
        <div
          className="absolute inset-0 flex flex-col justify-center pointer-events-none"
          style={{
            padding: "0 clamp(24px, 4vw, 48px)",
            zIndex: 2,
            mixBlendMode: "darken",
          }}
        >
          <div
            style={{
              fontFamily: "'Anybody', sans-serif",
              fontVariationSettings: "'wdth' 90, 'wght' 900",
              fontSize: "clamp(60px, 14vh, 180px)",
              lineHeight: 0.88,
              color: "#0a0a0a",
              textTransform: "uppercase",
              letterSpacing: "-0.03em",
            }}
          >
            State<br />
            of the<br />
            Art
          </div>
          <div
            style={{
              fontFamily: "'Anybody', sans-serif",
              fontVariationSettings: "'wdth' 90, 'wght' 900",
              fontSize: "clamp(40px, 9vh, 120px)",
              lineHeight: 0.88,
              color: "#0a0a0a",
              textTransform: "lowercase",
              letterSpacing: "-0.02em",
              marginTop: "clamp(8px, 1.5vh, 16px)",
            }}
          >
            edition<br />
            one
          </div>
        </div>

        {/* Bottom — publisher style */}
        <div className="flex justify-between items-end relative z-[3]">
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(7px, 0.8vh, 10px)",
            color: "#0a0a0a",
            opacity: 0.4,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            S
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(7px, 0.8vh, 10px)",
            color: "#0a0a0a",
            opacity: 0.4,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
          }}>
            SOTA Press
          </div>
        </div>
      </div>
    </div>
  )
}
