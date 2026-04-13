import { useState, useEffect, useRef, useCallback } from "react"
import type { WorldConfig } from "./worlds/WorldProps"
import AgainstProgress from "./worlds/AgainstProgress"
import SFIsland from "./worlds/SFIsland"
import Ferlinghetti from "./worlds/Ferlinghetti"
import Grecofuturism from "./worlds/Grecofuturism"
import Waymo from "./worlds/Waymo"
import Alcatraz from "./worlds/Alcatraz"
import EditorsNote from "./worlds/EditorsNote"

const worlds: WorldConfig[] = [
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
]

const alcatrazLineStyle = `
.alcatraz-hover-line { position: relative; }
.alcatraz-hover-line::after {
  content: ''; position: absolute; left: 0; top: 50%;
  height: 3px; background: #FF2A00; width: 0;
  transition: width 350ms ease;
}
.alcatraz-hover-line:hover::after { width: 100%; }
@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(255,42,0,0.4); }
  50% { opacity: 0.5; box-shadow: 0 0 20px rgba(255,42,0,0.6); }
}
`

export default function Homepage() {
  useEffect(() => { document.title = "SOTA — State of the Art" }, [])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeArticle, setActiveArticle] = useState<string | null>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingHoverRef = useRef<number | null>(null)
  const prevMousePos = useRef({ x: -100, y: -100 })
  const cursorAngleRef = useRef(0)

  // Ref-based cursor
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

  // prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Hover intent delay
  const handleMouseEnter = useCallback((index: number) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    pendingHoverRef.current = index
    if (reducedMotion) { setHoveredIndex(index); return }
    hoverTimerRef.current = setTimeout(() => setHoveredIndex(index), 80)
  }, [reducedMotion])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    pendingHoverRef.current = null
    setHoveredIndex(null)
  }, [])

  useEffect(() => () => { if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current) }, [])

  const activeWorld = hoveredIndex !== null ? worlds[hoveredIndex] : null
  const t = reducedMotion ? "none" : undefined

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden antialiased">
      <style>{alcatrazLineStyle}</style>

      {/* Radial glow — subtle center light like D5 */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 40%, transparent 70%)",
          opacity: hoveredIndex === null ? 1 : 0,
          transition: t ?? "opacity 600ms ease",
        }}
      />

      {/* World overlays */}
      <div className="absolute inset-0 z-[2]">
        {worlds.map((world, i) => {
          const WorldComponent = world.component
          return (
            <WorldComponent
              key={i}
              isActive={hoveredIndex === i}
              enterDuration={reducedMotion ? 0 : 500}
              exitDuration={reducedMotion ? 0 : 350}
            />
          )
        })}
      </div>

      {/* ───── Top-left attribution (D5 style) ───── */}
      <div
        className="absolute top-8 left-8 z-20 pointer-events-none"
        style={{
          fontFamily: "'Inter', 'DM Sans', sans-serif",
          fontWeight: 300,
          fontSize: "12px",
          lineHeight: 1.6,
          transition: t ?? "opacity 500ms ease",
        }}
      >
        <div className="font-medium text-white">State of the Art</div>
        <div className="text-white/50">Urban Futures and Critical Culture</div>
        <div className="text-white/30 mt-1">&copy;2026 — SOTA</div>
      </div>

      {/* ───── Top-right edition ───── */}
      <div
        className="absolute top-8 right-8 z-20 pointer-events-none text-white/30"
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "10px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        Edition 01
      </div>

      {/* ───── Center: cover + article titles ───── */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="flex items-center gap-[5vw]">

          {/* Magazine cover — left side */}
          <div
            className="shrink-0"
            style={{
              opacity: hoveredIndex === null ? 1 : 0.15,
              transform: hoveredIndex !== null ? "scale(0.97) translateX(-10px)" : "scale(1)",
              transition: t ?? "all 500ms cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          >
            <img
              src="/cover.webp"
              alt="SOTA Edition 01 Cover"
              className="h-[65vh] object-contain"
              style={{
                filter: "drop-shadow(0 0 60px rgba(255,255,255,0.06))",
              }}
            />
          </div>

          {/* Article titles — right side */}
          <div className="flex flex-col gap-[0.3vh]">
            {worlds.map((world, i) => {
              let siblingStyle: React.CSSProperties = {}
              if (hoveredIndex !== null && hoveredIndex !== i) {
                const effect = worlds[hoveredIndex].siblingEffect
                if (effect === "fade") siblingStyle = { opacity: 0.06 }
                else if (effect === "blur") siblingStyle = { filter: "blur(4px)", opacity: 0.5 }
              }

              return (
                <a
                  key={i}
                  href={world.slug ? `#${world.slug}` : "#"}
                  onClick={(e) => {
                    e.preventDefault()
                    if (world.slug) setActiveArticle(world.slug)
                  }}
                  onMouseEnter={() => handleMouseEnter(i)}
                  onMouseLeave={handleMouseLeave}
                  onFocus={() => handleMouseEnter(i)}
                  onBlur={handleMouseLeave}
                  className={`flex items-baseline gap-[0.6vw] no-underline relative group ${world.typeBehaviorClass}`}
                  style={{
                    ...siblingStyle,
                    transition: t ?? "all 350ms cubic-bezier(0.25, 0.1, 0.25, 1)",
                    cursor: "none",
                  }}
                  aria-label={`${world.title} by ${world.author}`}
                >
                  {world.words.map((word, j) =>
                    word.large ? (
                      <span
                        key={j}
                        className="font-bodoni text-[clamp(24px,4vw,64px)] leading-[0.9] tracking-[0.02em] uppercase"
                        style={{
                          color: activeWorld
                            ? activeWorld.palette.text
                            : "rgba(255,255,255,0.9)",
                          transition: t ?? "color 500ms ease",
                        }}
                      >
                        {word.text}
                      </span>
                    ) : (
                      <span
                        key={j}
                        className="font-bodoni italic text-[clamp(12px,1.8vw,26px)] leading-none"
                        style={{
                          color: activeWorld
                            ? activeWorld.palette.text
                            : "rgba(255,255,255,0.6)",
                          transition: t ?? "color 500ms ease",
                        }}
                      >
                        {word.text}
                      </span>
                    )
                  )}
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* ───── Bottom info bar ───── */}
      <div
        className="absolute bottom-[4vh] left-8 right-8 flex items-end justify-between pointer-events-none z-10"
        style={{
          opacity: hoveredIndex !== null && !activeArticle ? 1 : 0,
          transform: hoveredIndex !== null ? "translateY(0)" : "translateY(4px)",
          transition: t ?? "all 300ms ease",
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

      {/* ───── Article modal — Grecofuturism ───── */}
      <div
        className={`absolute inset-0 z-30 flex items-center justify-center ${
          activeArticle === "grecofuturism"
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ transition: t ?? "all 500ms ease" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setActiveArticle(null)} />
        <div
          className="relative w-[80vw] h-[85vh] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden"
          style={{
            transform: activeArticle === "grecofuturism" ? "scale(1) translateY(0)" : "scale(0.95) translateY(40px)",
            transition: t ?? "transform 500ms cubic-bezier(0.25, 0.1, 0.25, 1)",
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

      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 pointer-events-none z-50 hidden md:block"
        style={{ transform: "translate(-100px, -100px)", color: "#FF2A00", fontSize: "24px", lineHeight: 1 }}
      >➽</div>
    </div>
  )
}
