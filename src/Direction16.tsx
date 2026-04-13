// Direction 16: The Redline
// Inspired by: Swiss editorial broadsheets, Neue Grafik — one bold red rule divides the page, everything else is restrained black on warm white

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
  { num: "01", title: "Editor's Note", subtitle: "The City of Tomorrow", author: "Sanjana Friedman", type: "Manifesto" },
  { num: "02", title: "San Francisco Is Not An Island", subtitle: "Building the Megaregion", author: "Jan Sramek", type: "Essay" },
  { num: "03", title: "The Ferlinghetti Method", subtitle: "Infrastructure for Culture", author: "Olivia Marotte", type: "Profile" },
  { num: "04", title: "What Is Grecofuturism?", subtitle: "Classical Forms, Modern Tech", author: "Pablo Peniche", type: "Manifesto" },
  { num: "05", title: "Waymo and the Future of Transit", subtitle: "Self-Driving Urbanism", author: "Evan Zimmerman", type: "Report" },
  { num: "06", title: "Alcatraz 20XX?", subtitle: "A Speculative Fiction", author: "Sanjana Friedman", type: "Fiction" },
  { num: "07", title: "Against Progress", subtitle: "Entropy and the Will to Build", author: "Wolf Tivy", type: "Essay" },
]

function useLiveClock() {
  const [time, setTime] = useState("")
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "America/Los_Angeles",
        })
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

export default function Direction16() {
  useEffect(() => { document.title = "D18 — The Redline" }, [])
  const cursor = useRedCursor()
  const time = useLiveClock()
  const [hovered, setHovered] = useState<number | null>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  const display = "'Anybody', sans-serif"
  const mono = "'Space Mono', monospace"
  const serif = "'Instrument Serif', serif"

  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ backgroundColor: "#f5f2ec" }}
    >
      {/* Custom cursor */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-50 hidden md:block"
        style={{ transform: `translate(${cursor.x}px, ${cursor.y - 12}px) rotate(${cursor.angle}deg)`, color: "#FF2A00", fontSize: "24px", lineHeight: 1 }}
        >➽</div>

      {/* ─── ABOVE THE LINE ─── */}

      {/* Top bar — edition + clock */}
      <div
        className="absolute top-[3vh] left-[5vw] right-[5vw] flex justify-between items-baseline"
      >
        <span
          className="uppercase"
          style={{
            fontFamily: mono,
            fontSize: "clamp(9px, 0.7vw, 11px)",
            letterSpacing: "0.12em",
            color: "#1a1a1a",
            opacity: 0.4,
          }}
        >
          Edition 01 — 2026
        </span>
        <span
          className="tabular-nums"
          style={{
            fontFamily: mono,
            fontSize: "clamp(9px, 0.7vw, 11px)",
            letterSpacing: "0.06em",
            color: "#1a1a1a",
            opacity: 0.3,
          }}
        >
          {time} PT
        </span>
      </div>

      {/* Main title */}
      <div
        className="absolute left-[5vw] right-[5vw] flex flex-col"
        style={{ top: "8vh" }}
      >
        <div
          className="uppercase"
          style={{
            fontFamily: display,
            fontVariationSettings: "'wdth' 85, 'wght' 900",
            fontSize: "clamp(48px, 9vw, 140px)",
            lineHeight: 0.88,
            letterSpacing: "-0.03em",
            color: "#1a1a1a",
          }}
        >
          State of
        </div>
        <div className="flex items-baseline gap-[0.3em]">
          <span
            className="uppercase"
            style={{
              fontFamily: display,
              fontVariationSettings: "'wdth' 85, 'wght' 900",
              fontSize: "clamp(48px, 9vw, 140px)",
              lineHeight: 0.88,
              letterSpacing: "-0.03em",
              color: "#1a1a1a",
            }}
          >
            the Art
          </span>
        </div>
        {/* Tagline — tucked under title */}
        <div
          className="mt-[1.5vh]"
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: "clamp(14px, 1.6vw, 24px)",
            color: "#1a1a1a",
            opacity: 0.5,
            lineHeight: 1.3,
          }}
        >
          A zine about progress, technology, and San Francisco
        </div>
      </div>

      {/* ─── THE RED LINE ─── */}
      <div
        ref={lineRef}
        className="absolute left-0 right-0"
        style={{
          top: "38vh",
          height: "4px",
          backgroundColor: "#FF2A00",
        }}
      />

      {/* ─── BELOW THE LINE ─── */}

      {/* Article list */}
      <div
        className="absolute left-[5vw] right-[5vw] flex flex-col"
        style={{ top: "42vh" }}
      >
        {articles.map((article, i) => (
          <div
            key={i}
            className="flex items-baseline transition-all duration-150"
            style={{
              borderBottom: "1px solid rgba(26,26,26,0.08)",
              padding: "clamp(8px, 1.2vh, 14px) 0",
              opacity: hovered !== null && hovered !== i ? 0.15 : 1,
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Number */}
            <span
              className="tabular-nums"
              style={{
                fontFamily: mono,
                fontSize: "clamp(9px, 0.7vw, 11px)",
                color: "#FF2A00",
                letterSpacing: "0.04em",
                width: "clamp(28px, 3vw, 44px)",
                flexShrink: 0,
              }}
            >
              {article.num}
            </span>

            {/* Title */}
            <span
              className="uppercase"
              style={{
                fontFamily: display,
                fontVariationSettings: "'wdth' 85, 'wght' 700",
                fontSize: "clamp(14px, 1.8vw, 26px)",
                letterSpacing: "-0.01em",
                color: "#1a1a1a",
                lineHeight: 1.1,
                flex: 1,
              }}
            >
              {article.title}
            </span>

            {/* Author */}
            <span
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(11px, 1vw, 15px)",
                color: "#1a1a1a",
                opacity: 0.45,
                marginLeft: "clamp(12px, 2vw, 32px)",
                flexShrink: 0,
                textAlign: "right",
              }}
            >
              {article.author}
            </span>

            {/* Type badge */}
            <span
              className="uppercase"
              style={{
                fontFamily: mono,
                fontSize: "clamp(7px, 0.55vw, 9px)",
                letterSpacing: "0.08em",
                color: "#1a1a1a",
                opacity: 0.3,
                marginLeft: "clamp(12px, 2vw, 32px)",
                flexShrink: 0,
                width: "clamp(50px, 6vw, 80px)",
                textAlign: "right",
              }}
            >
              {article.type}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom — location & colophon */}
      <div
        className="absolute bottom-[3vh] left-[5vw] right-[5vw] flex justify-between items-end"
      >
        <div className="flex flex-col">
          <span
            className="uppercase"
            style={{
              fontFamily: display,
              fontVariationSettings: "'wdth' 80, 'wght' 800",
              fontSize: "clamp(10px, 0.8vw, 13px)",
              letterSpacing: "0.06em",
              color: "#1a1a1a",
              opacity: 0.35,
            }}
          >
            San Francisco
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: "clamp(8px, 0.6vw, 10px)",
              letterSpacing: "0.04em",
              color: "#1a1a1a",
              opacity: 0.25,
              marginTop: "2px",
            }}
          >
            37.7749°N, 122.4194°W
          </span>
        </div>

        <span
          className="uppercase"
          style={{
            fontFamily: mono,
            fontSize: "clamp(8px, 0.6vw, 10px)",
            letterSpacing: "0.06em",
            color: "#1a1a1a",
            opacity: 0.25,
          }}
        >
          stateoftheart.pub
        </span>
      </div>
    </div>
  )
}
