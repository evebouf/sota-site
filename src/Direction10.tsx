// Direction 10: Exhibition Broadsheet
// Inspired by: Material Culture — Melbourne Design Week poster. Vertical bold title, justified uppercase mono body, minimal footer.

import { useState, useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

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
  const [peelHovered, setPeelHovered] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  // Initialize map
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-122.405609, 37.791686],
      zoom: 13.5, pitch: 0, bearing: 0,
      antialias: true, interactive: true, minZoom: 12, maxZoom: 15,
      dragRotate: false, pitchWithRotate: false,
      maxBounds: [[-122.55, 37.70], [-122.30, 37.85]],
    })
    mapRef.current.on("style.load", () => {
      const m = mapRef.current!
      for (const layer of m.getStyle().layers || []) { if (layer.type === "symbol") m.removeLayer(layer.id) }
      m.addSource("mapbox-dem", { type: "raster-dem", url: "mapbox://mapbox.mapbox-terrain-dem-v1", tileSize: 512, maxzoom: 14 })
      m.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 })
      m.setFog({ range: [-0.5, 2.5], color: "#0a0a0a", "horizon-blend": 0.03, "high-color": "#0a0a0a", "space-color": "#0a0a0a", "star-intensity": 0 })
      for (const layer of m.getStyle().layers || []) {
        if (layer.type === "fill") {
          if (layer["source-layer"] === "water") { m.setPaintProperty(layer.id, "fill-color", "#000000"); m.setPaintProperty(layer.id, "fill-opacity", 0.95) }
          else m.setPaintProperty(layer.id, "fill-color", "#111111")
        }
        if (layer.type === "line") { m.setPaintProperty(layer.id, "line-color", "#ffffff"); m.setPaintProperty(layer.id, "line-opacity", 0.06) }
      }
      m.addLayer({ id: "ggb", source: "composite", "source-layer": "road", type: "line",
        filter: ["any", ["==", ["get", "name"], "Golden Gate Bridge"], ["==", ["get", "name_en"], "Golden Gate Bridge"]],
        paint: { "line-color": "#FF2A00", "line-width": 4, "line-opacity": 1 },
      })
      m.addLayer({ id: "buildings-3d", source: "composite", "source-layer": "building", type: "fill-extrusion", minzoom: 1,
        paint: { "fill-extrusion-color": "#1a1a1a", "fill-extrusion-height": ["get", "height"], "fill-extrusion-base": ["get", "min_height"], "fill-extrusion-opacity": 0.7 },
      })
      // Slow ambient drift
      let bearing = 0
      const drift = () => {
        bearing += 0.02
        m.easeTo({ bearing: bearing % 360, duration: 0, easing: (t: number) => t })
        requestAnimationFrame(drift)
      }
      drift()
    })
    return () => { mapRef.current?.remove(); mapRef.current = null }
  }, [])

  // Resize map when peel opens
  useEffect(() => {
    if (mapOpen && mapRef.current) {
      setTimeout(() => mapRef.current?.resize(), 100)
      setTimeout(() => mapRef.current?.resize(), 500)
    }
  }, [mapOpen])

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  const peelSize = mapOpen ? 5000 : peelHovered ? (isMobile ? 120 : 220) : (isMobile ? 60 : 120)

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
      className="w-screen overflow-hidden relative"
      style={{ fontFamily: "'Space Mono', monospace", height: "100dvh" }}
    >
      {/* Map — behind everything */}
      <div className="absolute inset-0 z-0">
        <div ref={mapContainer} className="w-full h-full" style={{ pointerEvents: mapOpen ? "auto" : "none", filter: "contrast(1.3) brightness(0.75)" }} />
        {/* Grain overlay */}
        <div className="absolute inset-0 pointer-events-none z-[5]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          mixBlendMode: "overlay",
          opacity: 0.6,
        }} />
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none z-[6]" style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(10,10,10,0.5) 70%, rgba(10,10,10,0.9) 100%)",
        }} />
        {/* Bottom banner — hides Mapbox attribution */}
        <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-[#0a0a0a] z-10 flex items-center justify-between px-[4vw] border-t-[1px] border-white/10">
          <div
            className="text-white/30 hover:text-[#FF2A00] transition-colors cursor-pointer"
            style={{ fontSize: "9px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.12em", textTransform: "uppercase", cursor: "none" }}
            onClick={() => { setMapOpen(false); setPeelHovered(false) }}
          >
            &larr; Back to page
          </div>
          <div
            className="text-white/15 tabular-nums"
            style={{ fontSize: "9px", fontFamily: "'Space Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            San Francisco, CA
          </div>
        </div>
      </div>

      {/* Content layer — peels away from top-right */}
      <div
        className="absolute inset-0 z-10 bg-[#0a0a0a] flex flex-col transition-[clip-path] duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          clipPath: `polygon(0 0, calc(100% - ${peelSize}px) 0, 100% ${peelSize}px, 100% 100%, 0 100%)`,
          pointerEvents: mapOpen ? "none" : "auto",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
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

      {/* Barcode — right edge, rotated, hidden on mobile */}
      <div className="absolute right-[2vw] top-1/2 pointer-events-none hidden lg:block" style={{ transform: "translateY(-50%) rotate(90deg)", opacity: 0.3 }}>
        {(() => {
          // EAN-13 encoding for 7500893407236
          // Each module is 1px wide. Total = 95 modules + quiet zones
          // Pattern: 3 (start) + 42 (left) + 5 (center) + 42 (right) + 3 (end) = 95
          const modules = [
            // Start guard
            1,0,1,
            // L-codes for 500893 (with parity from leading 7)
            0,1,1,0,0,0,1, // 5 (L)
            0,0,0,1,1,0,1, // 0 (G)
            0,0,0,1,1,0,1, // 0 (G)
            0,1,0,0,0,1,1, // 8 (L)
            0,0,1,0,0,1,1, // 9 (G)
            0,1,0,0,1,1,1, // 3 (L)
            // Center guard
            0,1,0,1,0,
            // R-codes for 407236
            1,0,1,1,1,0,0, // 4
            1,1,0,1,1,1,0, // 0
            1,1,1,0,1,1,0, // 7
            1,1,0,0,1,1,0, // 2
            1,0,0,0,0,1,0, // 3
            1,0,1,0,0,0,0, // 6
            // End guard
            1,0,1,
          ]
          const h = 65
          const guardH = 75
          return (
            <svg width={95 * 1.5 + 20} height={guardH + 18} viewBox={`0 0 ${95 * 1.5 + 20} ${guardH + 18}`}>
              {modules.map((m, i) => {
                if (!m) return null
                const isGuard = i < 3 || i >= 92 || (i >= 45 && i <= 49)
                return (
                  <rect
                    key={i}
                    x={10 + i * 1.5}
                    y={0}
                    width={1.5}
                    height={isGuard ? guardH : h}
                    fill="#ffffff"
                  />
                )
              })}
              <text x="0" y={h + 5} fontSize="9" fontFamily="'Space Mono', monospace" fill="#ffffff" filter="url(#distress-light)">7</text>
              <text x="16" y={h + 5} fontSize="9" fontFamily="'Space Mono', monospace" fill="#ffffff" letterSpacing="4" filter="url(#distress-light)">500893</text>
              <text x="82" y={h + 5} fontSize="9" fontFamily="'Space Mono', monospace" fill="#ffffff" letterSpacing="4" filter="url(#distress-light)">407236</text>
            </svg>
          )
        })()}
      </div>

      {/* Price tag — next to barcode, rotated same direction, hidden on mobile */}
      <div
        className="absolute right-[5vw] top-[34%] pointer-events-none hidden lg:block"
        style={{ transform: "rotate(90deg)", opacity: 0.3, filter: "url(#distress-light)" }}
      >
        <div style={{ fontSize: "12px", color: "#ffffff", fontFamily: "'Space Mono', monospace", lineHeight: 1.4, whiteSpace: "nowrap" }}>
          $2.99 USD<br />
          $3.99 CAD<br />
          £2.49 GBP<br />
          €2.79 EUR<br />
          HK$23 HKD
        </div>
      </div>

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
      </div>{/* end content layer */}

      {/* Red fold triangle — top right corner */}
      <div
        className="absolute z-20 pointer-events-none transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ top: 0, right: 0, width: `${peelSize}px`, height: `${peelSize}px`, opacity: mapOpen ? 0 : 1 }}
      >
        <div className="absolute inset-0" style={{
          backgroundColor: "#FF2A00",
          clipPath: "polygon(100% 0, 0 0, 100% 100%)",
          boxShadow: "-3px 3px 15px rgba(0,0,0,0.6)",
        }} />
      </div>

      {/* Peel click target */}
      {!mapOpen && (
        <div
          className="absolute z-30"
          style={{ top: 0, right: 0, width: "200px", height: "200px", cursor: "none" }}
          onMouseEnter={() => setPeelHovered(true)}
          onMouseLeave={() => setPeelHovered(false)}
          onClick={() => setMapOpen(true)}
        />
      )}

      {/* Cursor */}
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />
    </div>
  )
}
