// Direction 3: Dark Radial Glow + Hover Worlds + Cover
import { useState, useEffect, useRef, useCallback } from "react"
import AgainstProgress from "./worlds/AgainstProgress"
import SFIsland from "./worlds/SFIsland"
import Ferlinghetti from "./worlds/Ferlinghetti"
import Grecofuturism from "./worlds/Grecofuturism"
import Waymo from "./worlds/Waymo"
import Alcatraz from "./worlds/Alcatraz"
import EditorsNote from "./worlds/EditorsNote"
import type { WorldConfig } from "./worlds/WorldProps"

const worlds: WorldConfig[] = [
  {
    title: "Editor's Note: The City of Tomorrow",
    words: [
      { text: "Editor's Note:", large: false },
      { text: "The City", large: true },
      { text: "of", large: false },
      { text: "Tomorrow", large: true },
    ],
    author: "Sanjana Friedman",
    brief: "One must be absolutely modern. SF as the city of the future, embracing what comes next.",
    palette: { background: "#F7F7F7", text: "#1a1a1a" },
    siblingEffect: "blur",
    typeBehaviorClass: "hover:blur-[4px]",
    component: EditorsNote,
  },
  {
    title: "San Francisco Is Not An Island",
    words: [
      { text: "San Francisco", large: true },
      { text: "Is Not", large: false },
      { text: "An Island", large: true },
    ],
    author: "Jan Sramek",
    brief: "SF's problems need regional solutions. The Northern California Megaregion is the answer.",
    palette: { background: "#F5F5F5", text: "#1a1a1a" },
    siblingEffect: "fade",
    typeBehaviorClass: "hover:opacity-50 hover:scale-[0.98]",
    component: SFIsland,
  },
  {
    title: "The Ferlinghetti Method",
    words: [
      { text: "The", large: false },
      { text: "Ferlinghetti", large: true },
      { text: "Method", large: false },
    ],
    author: "Olivia Marotte",
    brief: "Lawrence Ferlinghetti built City Lights not just as a bookstore, but as infrastructure for a generation.",
    palette: { background: "#1a1a1a", text: "#ffffff" },
    siblingEffect: "fade",
    typeBehaviorClass: "hover:skew-x-[-6deg]",
    component: Ferlinghetti,
  },
  {
    title: "What is Grecofuturism?",
    slug: "grecofuturism",
    words: [
      { text: "What is", large: false },
      { text: "Grecofuturism?", large: true },
    ],
    author: "Pablo Peniche",
    brief: "Classical forms meet modern technology. A manifesto for building that honors both marble and metal.",
    palette: { background: "#ECECEC", text: "#1a1a1a" },
    siblingEffect: "fade",
    typeBehaviorClass: "hover:underline hover:decoration-[3px] hover:underline-offset-[8px]",
    component: Grecofuturism,
  },
  {
    title: "Waymo and the Future of Transit",
    words: [
      { text: "Waymo", large: true },
      { text: "and the", large: false },
      { text: "Future", large: true },
      { text: "of", large: false },
      { text: "Transit", large: true },
    ],
    author: "Evan Zimmerman",
    brief: "Self-driving cars are transforming urban space. AI is speeding up how we plan infrastructure.",
    palette: { background: "#1a1a1a", text: "#ffffff" },
    siblingEffect: "fade",
    typeBehaviorClass: "",
    component: Waymo,
  },
  {
    title: "Alcatraz 20XX?",
    words: [{ text: "Alcatraz 20XX?", large: true }],
    author: "Sanjana Friedman",
    brief: "Speculative fiction. Alcatraz transformed into an architectural wonder by a mysterious architect.",
    palette: { background: "#CC1100", text: "#ffffff" },
    siblingEffect: "fade",
    typeBehaviorClass: "alcatraz-hover-line",
    component: Alcatraz,
  },
  {
    title: "Against Progress",
    words: [{ text: "Against Progress", large: true }],
    author: "Wolf Tivy",
    brief: "Entropy is the true arrow of time. Progress requires counter-entropic will, not optimism.",
    palette: { background: "#F5F5F5", text: "#1a1a1a" },
    siblingEffect: "fade",
    typeBehaviorClass: "hover:line-through hover:decoration-[#FF2A00] hover:decoration-[4px]",
    component: AgainstProgress,
  },
]

export default function Direction3() {
  useEffect(() => { document.title = "D5 — Dark Radial Glow" }, [])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeArticle, setActiveArticle] = useState<string | null>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevMousePos = useRef({ x: -100, y: -100 })
  const cursorAngleRef = useRef(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        const dx = e.clientX - prevMousePos.current.x
        const dy = e.clientY - prevMousePos.current.y
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          const target = Math.atan2(dy, dx) * (180 / Math.PI)
          let diff = target - cursorAngleRef.current
          diff = ((diff + 180) % 360 + 360) % 360 - 180
          cursorAngleRef.current += diff
          prevMousePos.current = { x: e.clientX, y: e.clientY }
        }
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY - 12}px) rotate(${cursorAngleRef.current}deg)`
      }
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  const handleMouseEnter = useCallback((index: number) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = setTimeout(() => setHoveredIndex(index), 80)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    setHoveredIndex(null)
  }, [])

  useEffect(() => () => { if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current) }, [])

  const activeWorld = hoveredIndex !== null ? worlds[hoveredIndex] : null

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <style>{`
.alcatraz-hover-line { position: relative; }
.alcatraz-hover-line::after {
  content: ''; position: absolute; left: 0; top: 50%;
  height: 3px; background: #FF2A00; width: 0; transition: width 350ms ease;
}
.alcatraz-hover-line:hover::after { width: 100%; }
@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(255,42,0,0.4); }
  50% { opacity: 0.5; box-shadow: 0 0 20px rgba(255,42,0,0.6); }
}
      `}</style>

      {/* Radial glow — fades when a world is active */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)",
          opacity: hoveredIndex === null ? 1 : 0,
          transition: "opacity 600ms ease",
        }}
      />

      {/* World overlays */}
      <div className="absolute inset-0 z-[2]">
        {worlds.map((world, i) => {
          const WorldComponent = world.component
          return <WorldComponent key={i} isActive={hoveredIndex === i} />
        })}
      </div>

      {/* ── Top-left attribution ── */}
      <div
        className="absolute top-8 left-8 z-20 pointer-events-none"
        style={{ fontFamily: "'Inter', 'DM Sans', sans-serif", fontWeight: 300, fontSize: "12px", lineHeight: 1.6 }}
      >
        <div className="font-medium text-white">State of the Art</div>
        <div className="text-white/50">Urban Futures and Critical Culture</div>
        <div className="text-white/30 mt-1">&copy;2026 — SOTA</div>
      </div>

      {/* ── Top-right ── */}
      <div
        className="absolute top-8 right-8 z-20 pointer-events-none text-white/30"
        style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}
      >
        Edition 01
      </div>

      {/* ── Center: cover + titles ── */}
      <div className="absolute inset-0 z-10 flex items-center" style={{ paddingLeft: "32px", paddingRight: "32px" }}>
        <div className="flex items-center gap-[4vw] w-full">

          {/* Cover */}
          <div
            className="shrink-0"
            style={{
              opacity: hoveredIndex === null ? 1 : 0.12,
              transform: hoveredIndex !== null ? "scale(0.96)" : "scale(1)",
              transition: "all 500ms cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          >
            <img
              src="/cover.webp"
              alt="SOTA Edition 01 Cover"
              className="h-[65vh] object-contain"
              style={{ filter: "drop-shadow(0 0 80px rgba(255,255,255,0.06))" }}
            />
          </div>

          {/* Article titles — D8/D9 style: bold Anybody, stacked rows with rules */}
          <div className="flex flex-col" style={{ fontFamily: "'Anybody', sans-serif" }}>
            {worlds.map((world, i) => {
              let siblingStyle: React.CSSProperties = {}
              if (hoveredIndex !== null && hoveredIndex !== i) {
                const effect = worlds[hoveredIndex].siblingEffect
                if (effect === "fade") siblingStyle = { opacity: 0.3 }
                else if (effect === "blur") siblingStyle = { opacity: 0.3 }
              }

              return (
                <a
                  key={i}
                  href={world.slug ? `#${world.slug}` : "#"}
                  onClick={(e) => { e.preventDefault(); if (world.slug) setActiveArticle(world.slug) }}
                  onMouseEnter={() => handleMouseEnter(i)}
                  onMouseLeave={handleMouseLeave}
                  onFocus={() => handleMouseEnter(i)}
                  onBlur={handleMouseLeave}
                  className={`no-underline relative group block border-t border-white/[0.12] ${world.typeBehaviorClass}`}
                  style={{
                    ...siblingStyle,
                    transition: "all 350ms cubic-bezier(0.25, 0.1, 0.25, 1)",
                    cursor: "none",
                    padding: "0.5vh 0",
                  }}
                  aria-label={`${world.title} by ${world.author}`}
                >
                  <div className="flex items-baseline gap-[1vw] overflow-hidden">
                    {/* Number */}
                    <span
                      className="shrink-0 tabular-nums"
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: "clamp(10px, 0.8vw, 13px)",
                        color: activeWorld ? `${activeWorld.palette.text}40` : "rgba(255,255,255,0.2)",
                        transition: "color 500ms ease",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Title — huge bold Anybody */}
                    <span
                      className="uppercase leading-[0.95] group-hover:opacity-70 transition-opacity"
                      style={{
                        fontSize: "clamp(22px, 3.2vw, 50px)",
                        fontVariationSettings: "'wdth' 95, 'wght' 800",
                        letterSpacing: "-0.01em",
                        color: activeWorld ? activeWorld.palette.text : "rgba(255,255,255,0.9)",
                        transition: "color 500ms ease",
                      }}
                    >
                      {world.title}
                    </span>

                    {/* Author — small, trailing, hidden on tight screens */}
                    <span
                      className="shrink-0 ml-auto hidden lg:inline"
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: "clamp(8px, 0.65vw, 11px)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: activeWorld ? `${activeWorld.palette.text}50` : "rgba(255,255,255,0.25)",
                        transition: "color 500ms ease",
                      }}
                    >
                      {world.author}
                    </span>
                  </div>
                </a>
              )
            })}
            {/* Final rule */}
            <div className="border-t border-white/[0.12]" />
          </div>
        </div>
      </div>

      {/* ── Bottom info bar ── */}
      <div
        className="absolute bottom-[4vh] left-8 right-8 flex items-end justify-between pointer-events-none z-10"
        style={{
          opacity: hoveredIndex !== null && !activeArticle ? 1 : 0,
          transform: hoveredIndex !== null ? "translateY(0)" : "translateY(4px)",
          transition: "all 300ms ease",
          color: activeWorld ? activeWorld.palette.text : "#ffffff",
        }}
      >
        <div className="max-w-[35vw] font-sans text-[clamp(9px,0.75vw,12px)] leading-[1.5] tracking-[0.05em] opacity-70">
          {hoveredIndex !== null ? worlds[hoveredIndex].brief : ""}
        </div>
        <div className="font-sans text-[clamp(10px,0.85vw,13px)] tracking-[0.2em] uppercase whitespace-nowrap">
          {hoveredIndex !== null ? worlds[hoveredIndex].author : ""}
        </div>
      </div>

      {/* ── Article modal — Grecofuturism ── */}
      <div
        className={`absolute inset-0 z-30 flex items-center justify-center ${
          activeArticle === "grecofuturism" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ transition: "all 500ms ease" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveArticle(null)} />
        <div
          className="relative w-[80vw] h-[85vh] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden"
          style={{
            transform: activeArticle === "grecofuturism" ? "scale(1) translateY(0)" : "scale(0.95) translateY(40px)",
            transition: "transform 500ms cubic-bezier(0.25, 0.1, 0.25, 1)",
          }}
        >
          <button
            onClick={() => setActiveArticle(null)}
            className="absolute top-4 right-4 z-10 w-[36px] h-[36px] rounded-full bg-[#1a1a1a]/5 backdrop-blur-md border border-[#1a1a1a]/10 flex items-center justify-center font-sans text-[14px] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
            aria-label="Close article"
          >
            &times;
          </button>
          <div className="w-full h-full overflow-y-auto">
            <img src="/grecofuturism-article.png" alt="What is Grecofuturism?" className="w-full" />
          </div>
        </div>
      </div>

      {/* Red dot cursor */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-50 hidden md:block"
        style={{ transform: "translate(-100px, -100px)", color: "#FF2A00", fontSize: "24px", lineHeight: 1 }}
      >➽</div>
    </div>
  )
}
