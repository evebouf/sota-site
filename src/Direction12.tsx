// Direction 12: Festival Poster
// Inspired by: Other People @ Rewire — bold stacked lineup, scattered "RE" motif, black on white, typographic confetti

import { useState, useEffect, useMemo, useRef } from "react"

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
  { title: "Against Progress", type: "Essay" },
  { title: "San Francisco Is Not An Island", type: "Essay" },
  { title: "The Ferlinghetti Method", type: "Profile" },
  { title: "What Is Grecofuturism?", type: "Manifesto" },
  { title: "Waymo & The Future of Transit", type: "Report" },
  { title: "Alcatraz 20XX?", type: "Fiction" },
  { title: "The City of Tomorrow", type: "Editor's Note" },
]

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

function ScatteredMotifs() {
  const motifs = useMemo(() => {
    const rand = seededRandom(42)
    const positions: { top: string; left: string; opacity: number }[] = []
    for (let i = 0; i < 18; i++) {
      positions.push({
        top: `${8 + rand() * 82}%`,
        left: `${5 + rand() * 88}%`,
        opacity: 0.12 + rand() * 0.18,
      })
    }
    return positions
  }, [])

  return (
    <>
      {motifs.map((m, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none uppercase"
          style={{
            top: m.top,
            left: m.left,
            fontFamily: "'Anybody', sans-serif",
            fontVariationSettings: "'wdth' 75, 'wght' 700",
            fontSize: "clamp(9px, 0.85vw, 13px)",
            letterSpacing: "0.05em",
            color: "#e8e4dc",
            opacity: m.opacity,
          }}
        >
          SF
        </div>
      ))}
    </>
  )
}

export default function Direction12() {
  useEffect(() => { document.title = "D14 — Festival Poster" }, [])
  const cursor = useRedCursor()
  const [hovered, setHovered] = useState<number | null>(null)

  const bold = "'Anybody', sans-serif"
  const mono = "'Space Mono', monospace"

  return (
    <div className="w-screen h-screen bg-[#0a0a0a] overflow-hidden relative flex flex-col">
      <div
        className="fixed top-0 left-0 pointer-events-none z-50 hidden md:block"
        style={{ transform: `translate(${cursor.x}px, ${cursor.y - 12}px) rotate(${cursor.angle}deg)`, color: "#FF2A00", fontSize: "24px", lineHeight: 1 }}
        >➽</div>


      {/* Corner logos */}
      {[
        { top: "3vh", right: "4vw" },
        { bottom: "3vh", right: "4vw" },
        { bottom: "28vh", left: "4vw" },
        { bottom: "28vh", right: "4vw" },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute uppercase pointer-events-none"
          style={{
            ...Object.fromEntries(Object.entries(pos)),
            fontFamily: bold,
            fontVariationSettings: "'wdth' 65, 'wght' 800",
            fontSize: "clamp(6px, 0.5vw, 8px)",
            letterSpacing: "0.08em",
            color: "#e8e4dc",
            opacity: 0.4,
            lineHeight: 1.2,
          }}
        >
          State<br />of the<br />Art
        </div>
      ))}

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center px-[5vw] py-[5vh] relative z-10">
        {/* Header */}
        <div
          className="uppercase leading-[0.92] mb-[1.5vh]"
          style={{
            fontFamily: bold,
            fontVariationSettings: "'wdth' 80, 'wght' 900",
            fontSize: "clamp(28px, 4.2vw, 62px)",
            color: "#e8e4dc",
            letterSpacing: "-0.01em",
          }}
        >
          State of the Art
        </div>

        {/* Date & location */}
        <div
          className="uppercase leading-[0.95] mb-[4vh]"
          style={{
            fontFamily: bold,
            fontVariationSettings: "'wdth' 80, 'wght' 900",
            fontSize: "clamp(20px, 3vw, 44px)",
            color: "#e8e4dc",
            letterSpacing: "-0.01em",
          }}
        >
          Edition 01 — 2026<br />
          San Francisco, California
        </div>

        {/* Article lineup */}
        <div className="flex flex-col">
          {articles.map((article, i) => (
            <div
              key={i}
              className="transition-opacity duration-100"
              style={{
                opacity: hovered !== null && hovered !== i ? 0.08 : 1,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className="uppercase leading-[1.15] inline"
                style={{
                  fontFamily: bold,
                  fontVariationSettings: "'wdth' 80, 'wght' 800",
                  fontSize: "clamp(18px, 2.6vw, 38px)",
                  color: "#e8e4dc",
                  letterSpacing: "-0.005em",
                }}
              >
                {article.title}
              </span>
              <span
                className="uppercase inline ml-[0.3em]"
                style={{
                  fontFamily: bold,
                  fontVariationSettings: "'wdth' 80, 'wght' 400",
                  fontSize: "clamp(18px, 2.6vw, 38px)",
                  color: "#e8e4dc",
                  letterSpacing: "-0.005em",
                }}
              >
                ({article.type})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-[5vw] pb-[4vh] flex items-end justify-between relative z-10">
        <div
          className="uppercase tracking-[0.04em]"
          style={{
            fontFamily: mono,
            fontSize: "clamp(8px, 0.65vw, 10px)",
            color: "#e8e4dc",
            opacity: 0.4,
          }}
        >
          stateoftheart.pub
        </div>
        <div
          className="uppercase tracking-[0.04em]"
          style={{
            fontFamily: mono,
            fontSize: "clamp(8px, 0.65vw, 10px)",
            color: "#e8e4dc",
            opacity: 0.4,
          }}
        >
          7 Articles
        </div>
      </div>
    </div>
  )
}
