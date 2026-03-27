// Direction 4: Industrial Index
// Inspired by: Dense technical text as texture, article titles punching through at scale

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

const denseText = "STATE OF THE ART · EDITION 01 · SAN FRANCISCO 2026 · URBAN FUTURES · SPECULATIVE DESIGN · CRITICAL CULTURE · TRANSIT · ARCHITECTURE · POETRY · COUNTER-ENTROPIC · THE CITY OF TOMORROW · AGAINST PROGRESS · SAN FRANCISCO IS NOT AN ISLAND · THE FERLINGHETTI METHOD · WHAT IS GRECOFUTURISM · WAYMO AND THE FUTURE OF TRANSIT · ALCATRAZ 20XX · WOLF TIVY · JAN SRAMEK · OLIVIA MAROTTE · PABLO PENICHE · EVAN ZIMMERMAN · SANJANA FRIEDMAN · "

export default function Direction4() {
  useEffect(() => { document.title = "D6 — Industrial Index" }, [])
  const cursor = useRedCursor()
  return (
    <div
      className="w-screen h-screen bg-[#0a0a0a] overflow-hidden relative"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />

      {/* Dense repeating text — fills entire background */}
      <div
        className="absolute inset-0 p-[4vw] overflow-hidden"
        style={{
          fontSize: "clamp(6px, 0.55vw, 9px)",
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.6,
          letterSpacing: "0.02em",
          wordBreak: "break-all",
        }}
      >
        {Array(20).fill(denseText).join("")}
      </div>

      {/* Article titles punching through */}
      <div className="absolute top-[8vh] left-[5vw] right-[5vw]">
        <div
          style={{
            fontFamily: "'Anybody', sans-serif",
            fontVariationSettings: "'wdth' 85, 'wght' 800",
            fontSize: "clamp(18px, 2.2vw, 32px)",
            color: "#ffffff",
            lineHeight: 1.15,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
          }}
        >
          Against Progress
        </div>
        <div
          style={{
            fontSize: "clamp(6px, 0.5vw, 8px)",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: "4px",
          }}
        >
          Wolf Tivy
        </div>
      </div>

      <div className="absolute top-[20vh] left-[5vw] right-[5vw]">
        <div
          style={{
            fontFamily: "'Anybody', sans-serif",
            fontVariationSettings: "'wdth' 85, 'wght' 800",
            fontSize: "clamp(16px, 1.8vw, 26px)",
            color: "#ffffff",
            lineHeight: 1.15,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
          }}
        >
          The Ferlinghetti Method
        </div>
        <div
          style={{
            fontSize: "clamp(6px, 0.5vw, 8px)",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: "4px",
          }}
        >
          Olivia Marotte
        </div>
      </div>

      <div className="absolute top-[32vh] left-[5vw] right-[5vw]">
        <div
          style={{
            fontFamily: "'Anybody', sans-serif",
            fontVariationSettings: "'wdth' 85, 'wght' 800",
            fontSize: "clamp(22px, 2.8vw, 40px)",
            color: "#FF2A00",
            lineHeight: 1.15,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
          }}
        >
          Grecofuturism
        </div>
        <div
          style={{
            fontSize: "clamp(6px, 0.5vw, 8px)",
            color: "rgba(255,42,0,0.4)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: "4px",
          }}
        >
          Pablo Peniche
        </div>
      </div>

      <div className="absolute top-[46vh] left-[5vw] right-[5vw]">
        <div
          style={{
            fontFamily: "'Anybody', sans-serif",
            fontVariationSettings: "'wdth' 85, 'wght' 800",
            fontSize: "clamp(14px, 1.6vw, 24px)",
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.15,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
          }}
        >
          Alcatraz 20XX?
        </div>
        <div
          style={{
            fontSize: "clamp(6px, 0.5vw, 8px)",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: "4px",
          }}
        >
          Sanjana Friedman
        </div>
      </div>

      <div className="absolute top-[57vh] left-[5vw] right-[5vw]">
        <div
          style={{
            fontFamily: "'Anybody', sans-serif",
            fontVariationSettings: "'wdth' 85, 'wght' 800",
            fontSize: "clamp(13px, 1.4vw, 20px)",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.15,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
          }}
        >
          Waymo and the Future of Transit
        </div>
        <div
          style={{
            fontSize: "clamp(6px, 0.5vw, 8px)",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: "4px",
          }}
        >
          Evan Zimmerman
        </div>
      </div>

      <div className="absolute top-[67vh] left-[5vw] right-[5vw]">
        <div
          style={{
            fontFamily: "'Anybody', sans-serif",
            fontVariationSettings: "'wdth' 85, 'wght' 800",
            fontSize: "clamp(12px, 1.2vw, 18px)",
            color: "rgba(255,255,255,0.35)",
            lineHeight: 1.15,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
          }}
        >
          SF Is Not An Island
        </div>
        <div
          style={{
            fontSize: "clamp(6px, 0.5vw, 8px)",
            color: "rgba(255,255,255,0.15)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: "4px",
          }}
        >
          Jan Sramek
        </div>
      </div>

      <div className="absolute top-[77vh] left-[5vw] right-[5vw]">
        <div
          style={{
            fontFamily: "'Anybody', sans-serif",
            fontVariationSettings: "'wdth' 85, 'wght' 800",
            fontSize: "clamp(11px, 1vw, 16px)",
            color: "rgba(255,255,255,0.25)",
            lineHeight: 1.15,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
          }}
        >
          The City of Tomorrow
        </div>
        <div
          style={{
            fontSize: "clamp(6px, 0.5vw, 8px)",
            color: "rgba(255,255,255,0.12)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: "4px",
          }}
        >
          Sanjana Friedman
        </div>
      </div>

      {/* Bottom — edition mark */}
      <div
        className="absolute bottom-[4vh] right-[5vw]"
        style={{
          fontSize: "clamp(7px, 0.55vw, 9px)",
          color: "rgba(255,255,255,0.15)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          textAlign: "right",
        }}
      >
        SOTA ED.01<br />
        SF 2026
      </div>

      <div
        className="absolute bottom-[4vh] left-[5vw]"
        style={{
          fontSize: "clamp(7px, 0.55vw, 9px)",
          color: "rgba(255,255,255,0.15)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        7 Articles
      </div>
    </div>
  )
}
