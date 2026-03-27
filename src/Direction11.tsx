// Direction 11: Swiss Editorial
// Inspired by: "Zine about Hedonism" by Anna D — large sans + italic serif accent, asymmetric photo, black footer bar, minimal

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
  {
    title: ["State of", "the art"],
    italicIndex: 1,
    author: "Wolf Tivy",
    image: "/greco-sketch.png",
    subtitle: "Against Progress",
    issue: "01",
  },
  {
    title: ["San Francisco", "is not an island"],
    italicIndex: 1,
    author: "Jan Sramek",
    image: "/peninsula-bg.png",
    subtitle: "Urban Futures",
    issue: "02",
  },
  {
    title: ["The", "Ferlinghetti", "method"],
    italicIndex: 1,
    author: "Olivia Marotte",
    image: "/ferlinghetti-portrait.svg",
    subtitle: "Literary Heritage",
    issue: "03",
  },
  {
    title: ["What is", "Grecofuturism?"],
    italicIndex: 1,
    author: "Pablo Peniche",
    image: "/greco-sketch.png",
    subtitle: "Architecture",
    issue: "04",
  },
  {
    title: ["Waymo", "and the future of transit"],
    italicIndex: 1,
    author: "Evan Zimmerman",
    image: "/light-1.png",
    subtitle: "Technology",
    issue: "05",
  },
  {
    title: ["Alcatraz", "20XX?"],
    italicIndex: 1,
    author: "Sanjana Friedman",
    image: "/alcatraz-sketch.png",
    subtitle: "Speculative Fiction",
    issue: "06",
  },
  {
    title: ["The city of", "tomorrow"],
    italicIndex: 1,
    author: "Sanjana Friedman",
    image: "/sf-collage.png",
    subtitle: "Editor's Note",
    issue: "07",
  },
]

export default function Direction11() {
  const cursor = useRedCursor()
  const [activeIndex, setActiveIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  const article = articles[activeIndex]
  const invertImage = article.image.endsWith(".svg")

  function goTo(index: number) {
    if (index === activeIndex || transitioning) return
    setTransitioning(true)
    setTimeout(() => {
      setActiveIndex(index)
      setTimeout(() => setTransitioning(false), 50)
    }, 300)
  }

  return (
    <div className="w-screen h-screen bg-[#f5f2ed] overflow-hidden relative flex flex-col">
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />

      {/* Main content area */}
      <div className="flex-1 flex relative">
        {/* Left: Title area */}
        <div className="flex-1 flex flex-col justify-between px-[5vw] py-[5vh]">
          {/* Title block */}
          <div
            className="mt-[8vh]"
            style={{
              opacity: transitioning ? 0 : 1,
              transform: transitioning ? "translateY(12px)" : "translateY(0)",
              transition: "all 300ms ease",
            }}
          >
            {article.title.map((line, i) => (
              <div
                key={i}
                className="leading-[1.05]"
                style={{
                  fontFamily:
                    i === article.italicIndex
                      ? "'Instrument Serif', serif"
                      : "'DM Sans', sans-serif",
                  fontStyle: i === article.italicIndex ? "italic" : "normal",
                  fontWeight: i === article.italicIndex ? 400 : 500,
                  fontSize: "clamp(40px, 7vw, 96px)",
                  color: "#0a0a0a",
                  letterSpacing: i === article.italicIndex ? "0.01em" : "-0.02em",
                }}
              >
                {line}
              </div>
            ))}
          </div>

          {/* Issue number — top right */}
          <div
            className="absolute top-[5vh] right-[5vw] text-[clamp(16px,2vw,28px)] text-[#0a0a0a]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
            }}
          >
            ({article.issue})
          </div>

          {/* Navigation dots */}
          <div className="flex gap-3 mt-auto">
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="w-[8px] h-[8px] rounded-full transition-all duration-200"
                style={{
                  backgroundColor: i === activeIndex ? "#0a0a0a" : "transparent",
                  border: "1px solid #0a0a0a",
                  opacity: i === activeIndex ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>

        {/* Right: Image area — asymmetric placement */}
        <div
          className="w-[45%] flex items-center justify-center pr-[5vw]"
          style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? "translateY(16px)" : "translateY(0)",
            transition: "all 350ms ease 50ms",
          }}
        >
          <div className="w-[80%] mt-[10vh]">
            <img
              src={article.image}
              alt={article.subtitle}
              className="w-full h-auto object-contain max-h-[55vh]"
              style={{
                filter: invertImage ? "none" : "grayscale(100%) contrast(1.1)",
                mixBlendMode: "multiply",
              }}
            />
          </div>
        </div>
      </div>

      {/* Black footer bar */}
      <div
        className="flex items-center justify-between px-[5vw] py-[2.2vh] shrink-0"
        style={{ backgroundColor: "#0a0a0a" }}
      >
        <span
          className="text-[clamp(9px,0.7vw,11px)] tracking-[0.15em] uppercase text-white/50"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          State of the Art
        </span>
        <span
          className="text-[clamp(9px,0.7vw,11px)] tracking-[0.15em] uppercase text-white/50"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          Edition #{article.issue}
        </span>
        <span
          className="text-[clamp(9px,0.7vw,11px)] tracking-[0.15em] uppercase text-white/50"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {article.subtitle}
        </span>
        <span
          className="text-[clamp(9px,0.7vw,11px)] tracking-[0.15em] uppercase text-white/50"
          style={{ fontFamily: "'Space Mono', monospace" }}
        >
          {article.author}
        </span>
      </div>
    </div>
  )
}
