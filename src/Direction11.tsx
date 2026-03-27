// Direction 11: Chaos Catalog
// Inspired by: Parcel Chaos Board (PCB) / Are.na — full small index as scaffold, selected entries blown up huge overlaid on top

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
  { fig: 7, text: "The City of Tomorrow, Editor's Note, Sanjana Friedman" },
  { fig: 6, text: "Alcatraz 20XX?, Speculative Fiction, Sanjana Friedman" },
  { fig: 5, text: "Waymo and the Future of Transit, Report, Evan Zimmerman" },
  { fig: 4, text: "What is Grecofuturism?, Manifesto, Pablo Peniche" },
  { fig: 3, text: "The Ferlinghetti Method, Profile, Olivia Marotte" },
  { fig: 2, text: "San Francisco Is Not An Island, Essay, Jan Sramek" },
  { fig: 1, text: "Against Progress, Essay, Wolf Tivy" },
]

export default function Direction11() {
  useEffect(() => { document.title = "D13 — Chaos Catalog" }, [])
  const cursor = useRedCursor()
  const [hovered, setHovered] = useState<number | null>(null)

  const mono = "'DM Sans', sans-serif"
  const serif = "'Anybody', sans-serif"
  const bold = "'Anybody', sans-serif"
  const smallSize = "clamp(7.5px, 0.62vw, 10px)"

  return (
    <div className="w-screen h-screen bg-[#0a0a0a] overflow-hidden relative">
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />

      {/* BASE LAYER: Full small index — single column, top to bottom */}
      <div
        className="absolute left-[6vw] top-[5vh] flex flex-col"
        style={{
          fontFamily: mono,
          fontSize: smallSize,
          letterSpacing: "0.03em",
          color: "#e8e4dc",
          lineHeight: 1.7,
          textTransform: "uppercase",
        }}
      >
        {/* Top entries */}
        {index.map((item) => (
          <div key={item.fig} className="flex gap-[1.8em]">
            <span className="shrink-0 w-[5em] text-right opacity-40">
              Fig. {item.fig}.
            </span>
            <span>{item.text}</span>
          </div>
        ))}

        {/* Spacer */}
        <div className="h-[1.5em]" />

        {/* Banner */}
        <div
          className="uppercase tracking-[0.08em] text-center py-[0.4em] self-start"
          style={{
            fontFamily: bold,
            fontVariationSettings: "'wdth' 85, 'wght' 800",
            fontSize: "clamp(9px, 0.8vw, 13px)",
            color: "#e8e4dc",
            lineHeight: 1.35,
            marginLeft: "5em",
          }}
        >
          This is a publication<br />
          which is called<br />
          "State of the Art"
        </div>

        {/* Spacer */}
        <div className="h-[1.5em]" />

        {/* Repeat index in different order — more entries to fill the page */}
        {[...index].reverse().map((item) => (
          <div key={`r-${item.fig}`} className="flex gap-[1.8em]">
            <span className="shrink-0 w-[5em] text-right opacity-40">
              Fig. {item.fig}.
            </span>
            <span>{item.text}</span>
          </div>
        ))}

        {/* Spacer */}
        <div className="h-[1.5em]" />

        {/* More scattered entries */}
        {index.slice(2, 6).map((item) => (
          <div key={`s-${item.fig}`} className="flex gap-[1.8em]">
            <span className="shrink-0 w-[5em] text-right opacity-40">
              Fig. {item.fig}.
            </span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      {/* OVERLAY LAYER: Blown-up entries */}

      {/* Fig. 4 — Grecofuturism — huge, overlapping mid-left */}
      <div
        className="absolute transition-opacity duration-150"
        style={{
          top: "24%",
          left: "5vw",
          maxWidth: "65vw",
          opacity: hovered !== null && hovered !== 4 ? 0.05 : 1,
        }}
        onMouseEnter={() => setHovered(4)}
        onMouseLeave={() => setHovered(null)}
      >
        <div className="flex items-baseline gap-[0.3em]">
          <span
            style={{
              fontFamily: serif,
              fontSize: "clamp(28px, 4.5vw, 68px)",
              color: "#e8e4dc",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              fontVariationSettings: "'wdth' 85, 'wght' 700",
            }}
          >
            Fig. 4.
          </span>
          <span
            style={{
              fontFamily: serif,
              fontSize: "clamp(28px, 4.5vw, 68px)",
              color: "#e8e4dc",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              fontVariationSettings: "'wdth' 85, 'wght' 700",
            }}
          >
            What is
          </span>
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: "clamp(28px, 4.5vw, 68px)",
            color: "#e8e4dc",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
              fontVariationSettings: "'wdth' 85, 'wght' 700",
          }}
        >
          Grecofuturism?,
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: "clamp(28px, 4.5vw, 68px)",
            color: "#e8e4dc",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
              fontVariationSettings: "'wdth' 85, 'wght' 700",
          }}
        >
          Pablo Peniche
        </div>
      </div>

      {/* Fig. 3 — Ferlinghetti — large, overlapping the index below Fig. 4 */}
      <div
        className="absolute transition-opacity duration-150"
        style={{
          top: "50%",
          left: "4vw",
          maxWidth: "55vw",
          opacity: hovered !== null && hovered !== 3 ? 0.05 : 1,
        }}
        onMouseEnter={() => setHovered(3)}
        onMouseLeave={() => setHovered(null)}
      >
        <div className="flex items-baseline gap-[0.3em] flex-wrap">
          <span
            style={{
              fontFamily: serif,
              fontSize: "clamp(20px, 3.2vw, 48px)",
              color: "#e8e4dc",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              fontVariationSettings: "'wdth' 85, 'wght' 700",
            }}
          >
            Fig. 3.
          </span>
          <span
            style={{
              fontFamily: serif,
              fontSize: "clamp(20px, 3.2vw, 48px)",
              color: "#e8e4dc",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              fontVariationSettings: "'wdth' 85, 'wght' 700",
            }}
          >
            The Ferlinghetti
          </span>
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: "clamp(20px, 3.2vw, 48px)",
            color: "#e8e4dc",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
              fontVariationSettings: "'wdth' 85, 'wght' 700",
          }}
        >
          Method, Olivia Marotte
        </div>
      </div>

      {/* Fig. 6 — Alcatraz — large, bottom right */}
      <div
        className="absolute text-right transition-opacity duration-150"
        style={{
          bottom: "12vh",
          right: "5vw",
          maxWidth: "50vw",
          opacity: hovered !== null && hovered !== 6 ? 0.05 : 1,
        }}
        onMouseEnter={() => setHovered(6)}
        onMouseLeave={() => setHovered(null)}
      >
        <div
          style={{
            fontFamily: serif,
            fontSize: "clamp(24px, 3.8vw, 56px)",
            color: "#e8e4dc",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
              fontVariationSettings: "'wdth' 85, 'wght' 700",
          }}
        >
          Fig. 6.
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: "clamp(24px, 3.8vw, 56px)",
            color: "#e8e4dc",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
              fontVariationSettings: "'wdth' 85, 'wght' 700",
          }}
        >
          Alcatraz
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: "clamp(24px, 3.8vw, 56px)",
            color: "#e8e4dc",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
              fontVariationSettings: "'wdth' 85, 'wght' 700",
          }}
        >
          20XX?,
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: "clamp(24px, 3.8vw, 56px)",
            color: "#e8e4dc",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
              fontVariationSettings: "'wdth' 85, 'wght' 700",
          }}
        >
          Sanjana Friedman
        </div>
      </div>

      {/* "7 ARTICLES" count — bottom center */}
      <div
        className="absolute bottom-[13vh] left-1/2 -translate-x-1/2 uppercase tracking-[0.15em]"
        style={{
          fontFamily: mono,
          fontSize: "clamp(8px, 0.7vw, 11px)",
          color: "#e8e4dc",
        }}
      >
        7 Articles
      </div>

      {/* Vertical text — right edge */}
      <div
        className="absolute right-[1.5vw] top-[5vh] bottom-[5vh] flex items-center"
      >
        <div
          style={{
            writingMode: "vertical-rl",
            fontFamily: mono,
            fontSize: "clamp(6.5px, 0.5vw, 8px)",
            letterSpacing: "0.12em",
            color: "#e8e4dc",
            opacity: 0.18,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          State of the Art — San Francisco — Edition 01 — 2026 — 7 Articles
        </div>
      </div>

      {/* Bottom footer line */}
      <div
        className="absolute bottom-[4vh] left-[6vw] right-[6vw] flex justify-between uppercase"
        style={{
          fontFamily: mono,
          fontSize: smallSize,
          letterSpacing: "0.04em",
          color: "#e8e4dc",
          lineHeight: 1.6,
        }}
      >
        <div>
          State of the Art<br />
          Edition 01, 2026
        </div>
        <div className="text-right">
          San Francisco, CA<br />
          The Bay Area
        </div>
      </div>
    </div>
  )
}
