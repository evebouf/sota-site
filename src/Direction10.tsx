// Direction 10: Exhibition Broadsheet
// Inspired by: Material Culture — Melbourne Design Week poster. Vertical bold title, justified uppercase mono body, minimal footer.

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

const bodyText1 =
  'A publication dedicated to the ongoing evolution of San Francisco — an attempt to expand on conversations surrounding why and how cities are built, and what social, functional, or symbolic needs they satisfy. We\'re often presented with competing ideas of old versus new, as if there is not value in both. We see it in all facets of our everyday lives. But, what if we did away with that distinction? This publication offers a space for writers, architects, and citizens alike, to imagine a city where yesterday\'s ideologies and tomorrow\'s innovations can coexist.'

const bodyText2 =
  "In a world that's increasingly online in the way that we operate in all areas of life — work, relationships, interests — tactility feels more significant now, than ever. This edition aims to explore process: it asks, how can the method of creation, inform a city's meaning? What can traditional, craft-informed methods of building teach us? And how can we reinterpret these traditional methods and ways of working to bring them into a new era?"

const articles = [
  { title: "Against Progress", author: "Wolf Tivy" },
  { title: "SF Is Not An Island", author: "Jan Sramek" },
  { title: "The Ferlinghetti Method", author: "Olivia Marotte" },
  { title: "What Is Grecofuturism", author: "Pablo Peniche" },
  { title: "Waymo & Future of Transit", author: "Evan Zimmerman" },
  { title: "Alcatraz 20XX?", author: "Sanjana Friedman" },
  { title: "The City of Tomorrow", author: "Sanjana Friedman" },
]

function VerticalWord({ word }: { word: string }) {
  return (
    <div className="flex flex-col items-center" style={{ gap: "0.15em" }}>
      {word.split("").map((char, i) => (
        <span key={i} className="block leading-none">
          {char}
        </span>
      ))}
    </div>
  )
}

export default function Direction10() {
  useEffect(() => { document.title = "D12 — Exhibition Broadsheet" }, [])
  const cursor = useRedCursor()
  const [hovered, setHovered] = useState<number | null>(null)
  const [view, setView] = useState<"cover" | "index">("cover")

  // Hide the global grain overlay and set body to black on this page
  useEffect(() => {
    document.body.style.setProperty("--grain-opacity", "0")
    document.body.style.backgroundColor = "#0a0a0a"
    return () => {
      document.body.style.removeProperty("--grain-opacity")
      document.body.style.backgroundColor = ""
    }
  }, [])
  const [time, setTime] = useState("")
  const [countdown, setCountdown] = useState("")
  const [moon, setMoon] = useState("")

  useEffect(() => {
    // April 17, 2026 at 10:00 PM PT (UTC-7 during PDT)
    const launch = new Date("2026-04-18T05:00:00Z") // 10 PM PT = 5 AM UTC next day

    const tick = () => {
      const now = new Date()
      const hms = now.toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
      const ms = String(now.getMilliseconds()).padStart(3, "0")
      setTime(`${hms}.${ms}`)

      // Moon phase calculation (synodic period)
      const knownNew = new Date("2000-01-06T18:14:00Z").getTime()
      const synodic = 29.53058867
      const daysSince = (now.getTime() - knownNew) / 86400000
      const phase = ((daysSince % synodic) + synodic) % synodic
      const pct = phase / synodic
      const glyphs = ["○", "◐", "◑", "◕", "●", "◕", "◑", "◐"]
      const names = ["New", "Wax Crescent", "First Qtr", "Wax Gibbous", "Full", "Wan Gibbous", "Last Qtr", "Wan Crescent"]
      const idx = Math.floor(pct * 8) % 8
      const illum = Math.round(pct <= 0.5 ? pct * 200 : (1 - pct) * 200)
      setMoon(`Moon: ${names[idx]} ${illum}%`)

      const diff = launch.getTime() - now.getTime()
      if (diff <= 0) {
        setCountdown("LIVE")
      } else {
        const d = Math.floor(diff / 86400000)
        const h = Math.floor((diff % 86400000) / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        const msLeft = String(Math.floor(diff % 1000)).padStart(3, "0")
        setCountdown(`${String(d).padStart(2, "0")}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}.${msLeft}s`)
      }
    }
    tick()
    const id = setInterval(tick, 37)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="w-screen bg-[#0a0a0a] overflow-x-hidden relative flex flex-col"
      style={{ fontFamily: "'Space Mono', monospace", minHeight: "100dvh", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* SVG filters for distressed text */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="distress-heavy">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="distress-light">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="erode">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="4" seed="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feMorphology in="displaced" operator="erode" radius="0.4" result="eroded" />
            <feBlend in="eroded" in2="displaced" mode="darken" />
          </filter>
        </defs>
      </svg>

      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />

      {view === "cover" ? (
        <>
          {/* Body text blocks — top */}
          <div className="px-[8vw] pt-[5vh] flex flex-col gap-[2.5vh]" style={{ filter: "url(#distress-light)" }}>
            <p
              className="uppercase leading-[1.55] text-[#e8e4dc]"
              style={{
                fontSize: "clamp(7.5px, 0.75vw, 15px)",
                letterSpacing: "0.06em",
                textAlign: "justify",
                maxWidth: "90%",
              }}
            >
              {bodyText1}
            </p>
            <p
              className="uppercase leading-[1.55] text-[#e8e4dc]"
              style={{
                fontSize: "clamp(7.5px, 0.75vw, 15px)",
                letterSpacing: "0.06em",
                textAlign: "justify",
                maxWidth: "90%",
              }}
            >
              {bodyText2}
            </p>
          </div>

          {/* Vertical title — center */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className="flex gap-[3vw] uppercase"
              style={{
                fontFamily: "'Anybody', sans-serif",
                fontVariationSettings: "'wdth' 80, 'wght' 900",
                fontSize: "clamp(36px, 5vw, 56px)",
                color: "#e8e4dc",
                letterSpacing: "0.08em",
                filter: "url(#erode)",
              }}
            >
              <VerticalWord word="STATE" />
              <VerticalWord word="OF" />
              <VerticalWord word="THE" />
              <VerticalWord word="ART" />
            </div>
          </div>

          {/* Footer */}
          <div className="px-[8vw] pb-[6vh] flex justify-between items-end" style={{ filter: "url(#distress-light)" }}>
            <div
              className="uppercase leading-[1.6] text-[#e8e4dc]"
              style={{
                fontSize: "clamp(8px, 0.7vw, 14px)",
                letterSpacing: "0.06em",
              }}
            >
              State of the Art<br />
              Edition 01, 2026<br />
              April 17, 10PM — SOMA<br />
              <span className="tabular-nums">T-{countdown}</span>
            </div>
            <button
              onClick={() => setView("index")}
              className="uppercase text-[#e8e4dc] hover:text-[#FF2A00] transition-colors underline underline-offset-2"
              style={{
                fontSize: "clamp(8px, 0.7vw, 14px)",
                letterSpacing: "0.06em",
              }}
            >
              View Index →
            </button>
            <div
              className="uppercase leading-[1.6] text-[#e8e4dc] text-right"
              style={{
                fontSize: "clamp(8px, 0.7vw, 14px)",
                letterSpacing: "0.06em",
              }}
            >
              San Francisco, CA<br />
              The Bay Area<br />
              <span className="tabular-nums">{time} PT</span><br />
              {moon}
            </div>
          </div>
        </>
      ) : (
        /* INDEX VIEW */
        <>
          <div className="px-[8vw] pt-[5vh]">
            <button
              onClick={() => setView("cover")}
              className="uppercase text-[#e8e4dc]/40 hover:text-[#FF2A00] transition-colors"
              style={{
                fontSize: "clamp(9px, 0.75vw, 14px)",
                letterSpacing: "0.15em",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              ← Cover
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="w-[60vw]">
              <div
                className="uppercase mb-[4vh] text-[#e8e4dc]"
                style={{
                  fontFamily: "'Anybody', sans-serif",
                  fontVariationSettings: "'wdth' 80, 'wght' 900",
                  fontSize: "clamp(10px, 0.9vw, 16px)",
                  letterSpacing: "0.2em",
                }}
              >
                Contents
              </div>

              {articles.map((article, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="flex items-baseline justify-between border-t border-white/10 py-[1.2vh] transition-opacity duration-150"
                  style={{
                    opacity: hovered !== null && hovered !== i ? 0.12 : 1,
                  }}
                >
                  <div className="flex items-baseline gap-[2vw]">
                    <span
                      className="text-white/20 tabular-nums"
                      style={{
                        fontSize: "clamp(9px, 0.7vw, 14px)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="uppercase text-[#e8e4dc]"
                      style={{
                        fontSize: "clamp(12px, 1.2vw, 20px)",
                        letterSpacing: "0.08em",
                        fontFamily: "'Space Mono', monospace",
                      }}
                    >
                      {article.title}
                    </span>
                  </div>
                  <span
                    className="uppercase text-white/30"
                    style={{
                      fontSize: "clamp(7px, 0.55vw, 9px)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {article.author}
                  </span>
                </div>
              ))}
              <div className="border-t border-white/10" />
            </div>
          </div>

          {/* Footer */}
          <div className="px-[8vw] pb-[6vh] flex justify-between items-end" style={{ filter: "url(#distress-light)" }}>
            <div
              className="uppercase text-[#e8e4dc]"
              style={{
                fontSize: "clamp(8px, 0.7vw, 14px)",
                letterSpacing: "0.06em",
              }}
            >
              7 Articles
            </div>
            <div
              className="uppercase text-[#e8e4dc] text-right"
              style={{
                fontSize: "clamp(8px, 0.7vw, 14px)",
                letterSpacing: "0.06em",
              }}
            >
              Edition 01
            </div>
          </div>
        </>
      )}
    </div>
  )
}
