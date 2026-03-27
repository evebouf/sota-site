// Direction 13: Scattered Program
// Inspired by: Institute of Sport / Grocery Run — scattered info fields, random black dots, airy open layout

import { useState, useEffect, useMemo } from "react"

function useRedCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])
  return pos
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

function Dots() {
  const dots = useMemo(() => {
    const rand = seededRandom(77)
    return Array.from({ length: 22 }, () => ({
      top: `${4 + rand() * 90}%`,
      left: `${4 + rand() * 90}%`,
    }))
  }, [])

  return (
    <>
      {dots.map((d, i) => (
        <div
          key={i}
          className="absolute w-[7px] h-[7px] rounded-full bg-[#e8e4dc] pointer-events-none"
          style={{ top: d.top, left: d.left }}
        />
      ))}
    </>
  )
}

export default function Direction13() {
  useEffect(() => { document.title = "D15 — Scattered Program" }, [])
  const cursor = useRedCursor()
  const [hovered, setHovered] = useState<string | null>(null)

  const special = "'Special Elite', monospace"
  const mono = "'Space Mono', monospace"
  const bold = "'Anybody', sans-serif"

  const fieldStyle = (id: string) => ({
    opacity: hovered !== null && hovered !== id ? 0.12 : 1,
    transition: "opacity 150ms ease",
  })

  return (
    <div className="w-screen h-screen bg-[#0a0a0a] overflow-hidden relative">
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />

      <Dots />

      {/* Title — top center */}
      <div
        className="absolute top-[5vh] left-1/2 -translate-x-1/2 text-center"
        style={fieldStyle("title")}
        onMouseEnter={() => setHovered("title")}
        onMouseLeave={() => setHovered(null)}
      >
        <div
          className="uppercase tracking-[0.2em]"
          style={{
            fontFamily: special,
            fontSize: "clamp(20px, 2.8vw, 40px)",
            color: "#e8e4dc",
            letterSpacing: "0.15em",
          }}
        >
          State of the Art
        </div>
        <div
          className="mt-1"
          style={{
            fontFamily: mono,
            fontSize: "clamp(10px, 0.9vw, 14px)",
            color: "#e8e4dc",
            letterSpacing: "0.02em",
          }}
        >
          Edition 01&trade; (001)
        </div>
      </div>

      {/* Date & location — upper left */}
      <div
        className="absolute top-[18vh] left-[6vw]"
        style={fieldStyle("date")}
        onMouseEnter={() => setHovered("date")}
        onMouseLeave={() => setHovered(null)}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: "clamp(10px, 0.9vw, 14px)",
            color: "#e8e4dc",
            lineHeight: 1.6,
          }}
        >
          2026 / San Francisco<br />
          The Bay Area,<br />
          California
        </div>
      </div>

      {/* BRING / TAKE HOME — upper right */}
      <div
        className="absolute top-[17vh] right-[6vw]"
        style={fieldStyle("bring")}
        onMouseEnter={() => setHovered("bring")}
        onMouseLeave={() => setHovered(null)}
      >
        <div className="flex gap-[1em] items-baseline mb-1">
          <span
            className="uppercase"
            style={{
              fontFamily: bold,
              fontVariationSettings: "'wdth' 80, 'wght' 800",
              fontSize: "clamp(10px, 0.85vw, 13px)",
              letterSpacing: "0.06em",
              color: "#e8e4dc",
            }}
          >
            Read:
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: "clamp(10px, 0.9vw, 14px)",
              color: "#e8e4dc",
            }}
          >
            7 Articles
          </span>
        </div>
        <div className="flex gap-[1em] items-baseline">
          <span
            className="uppercase"
            style={{
              fontFamily: bold,
              fontVariationSettings: "'wdth' 80, 'wght' 800",
              fontSize: "clamp(10px, 0.85vw, 13px)",
              letterSpacing: "0.06em",
              color: "#e8e4dc",
            }}
          >
            Take Home:
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: "clamp(10px, 0.9vw, 14px)",
              color: "#e8e4dc",
            }}
          >
            New ideas
          </span>
        </div>
      </div>

      {/* TRY — center-ish */}
      <div
        className="absolute top-[33vh] left-[28vw]"
        style={fieldStyle("try")}
        onMouseEnter={() => setHovered("try")}
        onMouseLeave={() => setHovered(null)}
      >
        <div className="flex gap-[0.8em] items-baseline">
          <span
            className="uppercase"
            style={{
              fontFamily: bold,
              fontVariationSettings: "'wdth' 80, 'wght' 800",
              fontSize: "clamp(10px, 0.85vw, 13px)",
              letterSpacing: "0.06em",
              color: "#e8e4dc",
            }}
          >
            Try:
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: "clamp(10px, 0.9vw, 14px)",
              color: "#e8e4dc",
            }}
          >
            The Ferlinghetti Method
          </span>
        </div>
      </div>

      {/* Article — right of center */}
      <div
        className="absolute top-[42vh] right-[14vw]"
        style={fieldStyle("article")}
        onMouseEnter={() => setHovered("article")}
        onMouseLeave={() => setHovered(null)}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: "clamp(12px, 1.1vw, 16px)",
            color: "#e8e4dc",
          }}
        >
          What is Grecofuturism?
        </span>
      </div>

      {/* DRINK / EAT — lower left */}
      <div
        className="absolute top-[56vh] left-[6vw]"
        style={fieldStyle("drink")}
        onMouseEnter={() => setHovered("drink")}
        onMouseLeave={() => setHovered(null)}
      >
        <div className="flex gap-[0.8em] items-baseline mb-1">
          <span
            className="uppercase"
            style={{
              fontFamily: bold,
              fontVariationSettings: "'wdth' 80, 'wght' 800",
              fontSize: "clamp(10px, 0.85vw, 13px)",
              letterSpacing: "0.06em",
              color: "#e8e4dc",
            }}
          >
            Essay:
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: "clamp(10px, 0.9vw, 14px)",
              color: "#e8e4dc",
            }}
          >
            Against Progress (Wolf Tivy)
          </span>
        </div>
        <div className="flex gap-[0.8em] items-baseline">
          <span
            className="uppercase"
            style={{
              fontFamily: bold,
              fontVariationSettings: "'wdth' 80, 'wght' 800",
              fontSize: "clamp(10px, 0.85vw, 13px)",
              letterSpacing: "0.06em",
              color: "#e8e4dc",
            }}
          >
            Fiction:
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: "clamp(10px, 0.9vw, 14px)",
              color: "#e8e4dc",
            }}
          >
            Alcatraz 20XX? (Sanjana Friedman)
          </span>
        </div>
      </div>

      {/* About block — lower right */}
      <div
        className="absolute top-[62vh] right-[6vw] max-w-[30vw]"
        style={fieldStyle("about")}
        onMouseEnter={() => setHovered("about")}
        onMouseLeave={() => setHovered(null)}
      >
        <div
          className="uppercase mb-[0.8em]"
          style={{
            fontFamily: bold,
            fontVariationSettings: "'wdth' 80, 'wght' 800",
            fontSize: "clamp(8px, 0.65vw, 10px)",
            letterSpacing: "0.1em",
            color: "#e8e4dc",
          }}
        >
          What is State of the Art
        </div>
        <div
          style={{
            fontFamily: mono,
            fontSize: "clamp(7px, 0.55vw, 9px)",
            color: "#e8e4dc",
            lineHeight: 1.6,
            letterSpacing: "0.01em",
          }}
        >
          State of the Art seeks to research San Francisco
          as a cultural phenomenon, deeply embedded in technology
          and society. We want to show that the city provides a platform
          for innovation, conversation, and community building.
          We believe cities, like all social institutions, arise from
          social needs.
        </div>
      </div>

      {/* More scattered articles */}
      <div
        className="absolute top-[48vh] left-[12vw]"
        style={fieldStyle("sf")}
        onMouseEnter={() => setHovered("sf")}
        onMouseLeave={() => setHovered(null)}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: "clamp(10px, 0.9vw, 14px)",
            color: "#e8e4dc",
          }}
        >
          SF Is Not An Island
        </span>
      </div>

      <div
        className="absolute top-[38vh] left-[8vw]"
        style={fieldStyle("waymo")}
        onMouseEnter={() => setHovered("waymo")}
        onMouseLeave={() => setHovered(null)}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: "clamp(10px, 0.9vw, 14px)",
            color: "#e8e4dc",
          }}
        >
          Waymo & The Future of Transit
        </span>
      </div>

      {/* Bottom sponsors row */}
      <div
        className="absolute bottom-[4vh] left-[6vw] right-[6vw] flex items-end justify-between"
      >
        <div className="flex items-baseline gap-[2em]">
          <span
            className="uppercase"
            style={{
              fontFamily: bold,
              fontVariationSettings: "'wdth' 80, 'wght' 800",
              fontSize: "clamp(7px, 0.55vw, 9px)",
              letterSpacing: "0.08em",
              color: "#e8e4dc",
              opacity: 0.4,
            }}
          >
            Presented by
          </span>
          <span
            className="italic"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(12px, 1vw, 16px)",
              color: "#e8e4dc",
              opacity: 0.5,
            }}
          >
            State of the Art
          </span>
        </div>
        <span
          className="italic"
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(12px, 1vw, 16px)",
            color: "#e8e4dc",
            opacity: 0.5,
          }}
        >
          San Francisco
        </span>
      </div>
    </div>
  )
}
