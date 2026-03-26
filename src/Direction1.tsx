// Direction 1: Brutalist Grid
// Inspired by: harsh borders, halftone imagery, blocky uppercase type, bookstore/zine aesthetic

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

const articles = [
  { title: "Against Progress", author: "Wolf Tivy", image: "/alcatraz-sketch.png" },
  { title: "SF Is Not An Island", author: "Jan Sramek", image: "/peninsula-bg.png" },
  { title: "The Ferlinghetti Method", author: "Olivia Marotte", image: "/ferlinghetti-portrait.svg" },
  { title: "Grecofuturism", author: "Pablo Peniche", image: "/greco-sketch.png" },
  { title: "Waymo & Transit", author: "Evan Zimmerman", image: "/light-1.png" },
  { title: "Alcatraz 20XX?", author: "Sanjana Friedman", image: "/alcatraz-sketch.png" },
  { title: "City of Tomorrow", author: "Sanjana Friedman", image: "/sf-collage.png" },
]

function JustifiedTitle({ text, hovered }: { text: string; hovered: boolean }) {
  return (
    <div
      className="uppercase leading-[0.95] transition-colors duration-150 w-full"
      style={{
        fontFamily: "'Anybody', sans-serif",
        fontVariationSettings: "'wdth' 68, 'wght' 800",
        fontSize: "clamp(14px, 1.6vw, 22px)",
        color: hovered ? "#fff" : "#000",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {text.split("").map((char, i) => (
        <span key={i} style={{ display: char === " " ? "inline-block" : undefined, width: char === " " ? "0.3em" : undefined }}>
          {char === " " ? "" : char}
        </span>
      ))}
    </div>
  )
}

const categories = [
  "Urban Futures", "Speculative Design", "Architecture", "Transit",
  "Culture", "Poetry", "Film", "Graphic Design", "Typography",
  "Art Theory", "History", "Technology",
]

export default function Direction1() {
  const cursor = useRedCursor()
  const [hovered, setHovered] = useState<number | null>(null)

  const activeImage = hovered !== null ? articles[hovered].image : "/greco-sketch.png"
  const invertImage = hovered !== null && articles[hovered].image.endsWith(".svg")

  return (
    <div
      className="w-screen h-screen bg-white overflow-hidden flex flex-col"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {/* Red dot cursor */}
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />

      {/* Nav bar */}
      <nav className="flex border-b-[2px] border-black text-[11px] uppercase tracking-[0.06em] shrink-0">
        <div className="px-5 py-3 border-r-[2px] border-black font-bold">
          State of the Art
        </div>
        <div className="px-5 py-3 border-r-[2px] border-black underline underline-offset-2">
          Articles
        </div>
        <div className="px-5 py-3 border-r-[2px] border-black">
          Events
        </div>
        <div className="flex-1" />
        <div className="px-5 py-3 border-l-[2px] border-black">
          Edition 01
        </div>
      </nav>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar — categories */}
        <div className="w-[180px] shrink-0 border-r-[2px] border-black p-4 text-[10px] uppercase leading-[2.4] tracking-[0.02em] overflow-y-auto">
          {categories.map((c) => (
            <div key={c} className="cursor-pointer hover:font-bold transition-all">
              {c}
            </div>
          ))}
        </div>

        {/* Center — image that changes on hover */}
        <div className="flex-1 border-r-[2px] border-black relative bg-white overflow-hidden">
          <img
            src={activeImage}
            alt=""
            className="w-full h-full object-cover transition-all duration-300"
            style={{
              filter: invertImage
                ? "invert(1) grayscale(1) contrast(1.5)"
                : "grayscale(1) contrast(2.5) brightness(1.2)",
            }}
          />
          {/* Halftone dot overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, white 1.2px, transparent 1.2px)",
              backgroundSize: "5px 5px",
              mixBlendMode: "lighten",
            }}
          />
        </div>

        {/* Right — article titles list */}
        <div className="w-[340px] shrink-0 flex flex-col">
          {articles.map((a, i) => (
            <div
              key={i}
              className="flex-1 border-b-[2px] border-black last:border-b-0 px-4 flex flex-col justify-center cursor-pointer transition-all duration-150"
              style={{
                backgroundColor: hovered === i ? "#000" : "transparent",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <JustifiedTitle text={a.title} hovered={hovered === i} />
              <div
                className="text-[9px] uppercase tracking-[0.04em] mt-1 transition-colors duration-150"
                style={{
                  color: hovered === i ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
                }}
              >
                {a.author}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex border-t-[2px] border-black h-[48px] shrink-0">
        <div className="flex-1 px-5 flex items-center text-[10px] uppercase tracking-[0.06em] text-black/50">
          {hovered !== null
            ? `${String(hovered + 1).padStart(2, "0")} / 07 — ${articles[hovered].title}`
            : "Edition 01 — San Francisco, 2026"
          }
        </div>
        <div className="px-5 flex items-center border-l-[2px] border-black text-[10px] uppercase tracking-[0.06em] text-black/50">
          Free
        </div>
      </div>
    </div>
  )
}
