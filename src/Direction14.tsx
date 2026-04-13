// Direction 14: Text Wallpaper
// Inspired by: Swiss Design Awards / Schweizer Designpreise — repeating text filling the background, bold words popping through at scale

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

const repeatingPhrases = [
  "state of the art",
  "edition 01",
  "san francisco",
  "2026",
  "against progress",
  "the ferlinghetti method",
  "grecofuturism",
  "waymo",
  "alcatraz 20xx",
  "city of tomorrow",
  "sf is not an island",
  "edition 01",
  "state of the art",
  "san francisco",
  "2026",
  "urban futures",
]

const popWords: {
  text: string
  top: string
  left: string
  fontSize: string
  right?: string
}[] = [
  { text: "state", top: "3%", left: "6%", fontSize: "clamp(24px, 3.5vw, 48px)" },
  { text: "of the art", top: "3%", left: "28%", fontSize: "clamp(24px, 3.5vw, 48px)" },
  { text: "san francisco", top: "18%", left: "4%", fontSize: "clamp(18px, 2.4vw, 34px)" },
  { text: "2026", top: "24%", left: "8%", fontSize: "clamp(20px, 2.8vw, 40px)" },
  { text: "edition", top: "15%", right: "5%", left: "auto", fontSize: "clamp(16px, 2vw, 28px)" },
  { text: "01", top: "21%", right: "5%", left: "auto", fontSize: "clamp(20px, 2.8vw, 40px)" },
  { text: "grecofuturism", top: "42%", left: "5%", fontSize: "clamp(16px, 2vw, 28px)" },
  { text: "ferlinghetti", top: "50%", left: "30%", fontSize: "clamp(18px, 2.4vw, 34px)" },
  { text: "progress", top: "60%", left: "6%", fontSize: "clamp(20px, 2.8vw, 40px)" },
  { text: "alcatraz", top: "68%", right: "8%", left: "auto", fontSize: "clamp(18px, 2.4vw, 34px)" },
  { text: "waymo", top: "76%", left: "15%", fontSize: "clamp(16px, 2vw, 28px)" },
  { text: "transit", top: "76%", right: "12%", left: "auto", fontSize: "clamp(16px, 2vw, 28px)" },
  { text: "tomorrow", top: "85%", left: "8%", fontSize: "clamp(20px, 2.8vw, 40px)" },
]

function TextWallpaper() {
  const lines: string[] = []
  for (let i = 0; i < 40; i++) {
    const phrase = repeatingPhrases[i % repeatingPhrases.length]
    const nextPhrase = repeatingPhrases[(i + 1) % repeatingPhrases.length]
    const thirdPhrase = repeatingPhrases[(i + 2) % repeatingPhrases.length]
    const fourthPhrase = repeatingPhrases[(i + 3) % repeatingPhrases.length]
    lines.push(`${phrase}  ${nextPhrase}  ${thirdPhrase}  ${fourthPhrase}  ${phrase}  ${nextPhrase}  ${thirdPhrase}`)
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 400,
        fontSize: "clamp(11px, 1.1vw, 16px)",
        lineHeight: 1.85,
        color: "#e8e4dc",
        opacity: 0.12,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {lines.map((line, i) => (
        <div key={i} style={{ marginLeft: `${-(i * 13) % 80}px` }}>
          {line}
        </div>
      ))}
    </div>
  )
}

export default function Direction14() {
  useEffect(() => { document.title = "D16 — Text Wallpaper" }, [])
  const cursor = useRedCursor()
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="w-screen h-screen bg-[#0a0a0a] overflow-hidden relative">
      <div
        className="fixed top-0 left-0 pointer-events-none z-50 hidden md:block"
        style={{ transform: `translate(${cursor.x}px, ${cursor.y - 12}px) rotate(${cursor.angle}deg)`, color: "#FF2A00", fontSize: "24px", lineHeight: 1 }}
        >➽</div>

      {/* Repeating text wallpaper — base layer */}
      <TextWallpaper />

      {/* Horizontal divider — mid page */}
      <div
        className="absolute left-0 right-0 h-[1px] bg-[#e8e4dc] opacity-10 pointer-events-none"
        style={{ top: "38%" }}
      />

      {/* Pop-out bold words — overlay layer */}
      {popWords.map((word, i) => (
        <div
          key={i}
          className="absolute transition-opacity duration-100 z-10"
          style={{
            top: word.top,
            left: word.left,
            right: word.right,
            opacity: hovered !== null && hovered !== i ? 0.06 : 1,
          }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          <span
            className="uppercase"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: word.fontSize,
              color: "#e8e4dc",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {word.text}
          </span>
        </div>
      ))}

      {/* Bottom nav */}
      <div className="absolute bottom-[4vh] left-[5vw] right-[5vw] flex justify-between z-10">
        <span
          className="uppercase"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(16px, 2vw, 28px)",
            color: "#e8e4dc",
            letterSpacing: "-0.01em",
          }}
        >
          Articles
        </span>
        <span
          className="uppercase"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(16px, 2vw, 28px)",
            color: "#e8e4dc",
            letterSpacing: "-0.01em",
          }}
        >
          About
        </span>
      </div>
    </div>
  )
}
