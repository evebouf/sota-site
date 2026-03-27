// Direction 1: Brutalist Grid
// Inspired by: harsh borders, halftone imagery, blocky uppercase type, bookstore/zine aesthetic

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

const articles = [
  { title: "Against Progress", author: "Wolf Tivy", image: "/alcatraz-sketch.png" },
  { title: "SF Is Not An Island", author: "Jan Sramek", image: "/peninsula-bg.png" },
  { title: "The Ferlinghetti Method", author: "Olivia Marotte", image: "/ferlinghetti-portrait.svg" },
  { title: "Grecofuturism", author: "Pablo Peniche", image: "/greco-sketch.png" },
  { title: "Waymo & Transit", author: "Evan Zimmerman", image: "/light-1.png" },
  { title: "Alcatraz 20XX?", author: "Sanjana Friedman", image: "/alcatraz-sketch.png" },
  { title: "City of Tomorrow", author: "Sanjana Friedman", image: "/sf-collage.png" },
]

function JustifiedTitle({ text, hovered, redMode }: { text: string; hovered: boolean; redMode: boolean }) {
  return (
    <div
      className="uppercase leading-[0.95] transition-colors duration-150 w-full"
      style={{
        fontFamily: "'Anybody', sans-serif",
        fontVariationSettings: "'wdth' 68, 'wght' 800",
        fontSize: "clamp(14px, 1.6vw, 22px)",
        color: hovered ? "#FF2A00" : redMode ? "#FF2A00" : "#e8e4dc",
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
  useEffect(() => { document.title = "D3 — Brutalist Grid" }, [])
  const cursor = useRedCursor()
  const [hovered, setHovered] = useState<number | null>(null)
  const [redMode, setRedMode] = useState(false)
  const [mapCoords, setMapCoords] = useState({ lat: 37.791686, lng: -122.405609, zoom: 15.49, bearing: -30 })
  const [time, setTime] = useState("")

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const hms = now.toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
      const ms = String(now.getMilliseconds()).padStart(3, "0")
      setTime(`${hms}.${ms}`)
    }
    tick()
    const id = setInterval(tick, 37)
    return () => clearInterval(id)
  }, [])
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-122.405609, 37.791686],
      zoom: 15.49,
      pitch: 60,
      bearing: -30,
      antialias: true,
      minZoom: 11,
      interactive: true,
    })

    map.current.on("style.load", () => {
      const m = map.current!

      for (const layer of m.getStyle().layers || []) {
        if (layer.type === "symbol") m.removeLayer(layer.id)
      }

      m.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      })
      m.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 })

      m.setFog({
        range: [-0.5, 2.5],
        color: "#0a0a0a",
        "horizon-blend": 0.03,
        "high-color": "#0a0a0a",
        "space-color": "#0a0a0a",
        "star-intensity": 0,
      })

      for (const layer of m.getStyle().layers || []) {
        if (layer.type === "fill") {
          if (layer["source-layer"] === "water") {
            m.setPaintProperty(layer.id, "fill-color", "#000000")
            m.setPaintProperty(layer.id, "fill-opacity", 0.95)
          } else {
            m.setPaintProperty(layer.id, "fill-color", "#111111")
          }
        }
        if (layer.type === "line") {
          m.setPaintProperty(layer.id, "line-color", "#ffffff")
          m.setPaintProperty(layer.id, "line-opacity", 0.06)
        }
      }

      m.addLayer({
        id: "golden-gate-bridge",
        source: "composite",
        "source-layer": "road",
        type: "line",
        filter: ["any",
          ["==", ["get", "name"], "Golden Gate Bridge"],
          ["==", ["get", "name_en"], "Golden Gate Bridge"],
        ],
        paint: {
          "line-color": "#FF2A00",
          "line-width": 4,
          "line-opacity": 1,
        },
      })

      m.addLayer({
        id: "buildings-3d",
        source: "composite",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 1,
        paint: {
          "fill-extrusion-color": "#1a1a1a",
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.7,
        },
      })
    })

    const onMove = () => {
      const m = map.current!
      const c = m.getCenter()
      setMapCoords({
        lat: c.lat,
        lng: c.lng,
        zoom: m.getZoom(),
        bearing: m.getBearing(),
      })
    }
    map.current.on("move", onMove)

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  return (
    <div
      className="w-screen h-screen bg-[#0a0a0a] overflow-hidden flex flex-col"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {/* Red dot cursor */}
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />

      {/* Nav bar */}
      <nav className="flex border-b-[2px] border-white/20 text-[11px] uppercase tracking-[0.06em] shrink-0">
        <div className={`w-[180px] shrink-0 px-5 py-3 border-r-[2px] border-white/20 font-bold box-border transition-colors duration-300 ${redMode ? "text-[#FF2A00]" : "text-white"}`}>
          State of the Art
        </div>
        <div className="px-5 py-3 border-r-[2px] border-white/20 underline underline-offset-2 text-white/70">
          Articles
        </div>
        <div className="px-5 py-3 border-r-[2px] border-white/20 text-white/70">
          Events
        </div>
        <div className="flex-1" />
        {/* Red mode toggle */}
        <div
          className="px-4 py-3 border-l-[2px] border-white/20 flex items-center gap-3 cursor-pointer select-none"
          onClick={() => setRedMode(!redMode)}
          style={{ cursor: "none" }}
        >
          <span className="text-white/40 text-[9px] uppercase tracking-[0.1em]">Red</span>
          <div
            className="relative w-[32px] h-[16px] rounded-full transition-colors duration-200"
            style={{
              backgroundColor: redMode ? "#FF2A00" : "rgba(255,255,255,0.1)",
              border: redMode ? "1px solid #FF2A00" : "1px solid rgba(255,255,255,0.2)",
              boxShadow: redMode ? "0 0 8px rgba(255,42,0,0.4), inset 0 0 4px rgba(0,0,0,0.3)" : "inset 0 0 4px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="absolute top-[2px] w-[10px] h-[10px] rounded-full transition-all duration-200"
              style={{
                left: redMode ? "18px" : "3px",
                backgroundColor: redMode ? "#0a0a0a" : "rgba(255,255,255,0.3)",
                boxShadow: redMode ? "0 0 3px rgba(0,0,0,0.5)" : "none",
              }}
            />
          </div>
        </div>
        <div className="px-5 py-3 border-l-[2px] border-white/20 text-white/70">
          Edition 01
        </div>
      </nav>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar — categories */}
        <div className={`w-[180px] shrink-0 border-r-[2px] border-white/20 p-4 text-[10px] uppercase leading-[2.4] tracking-[0.02em] overflow-y-auto transition-colors duration-300 ${redMode ? "text-[#FF2A00]/40" : "text-white/50"}`}>
          {categories.map((c) => (
            <div key={c} className="cursor-pointer hover:font-bold transition-all">
              {c}
            </div>
          ))}
        </div>

        {/* Center — 3D map */}
        <div className="flex-1 border-r-[2px] border-white/20 relative bg-[#0a0a0a] overflow-hidden">
          <div ref={mapContainer} className="w-full h-full" />
          {/* Banner to cover Mapbox attribution */}
          <div className="absolute bottom-0 left-0 right-0 h-[36px] bg-[#0a0a0a] z-10 flex items-center px-4 border-t-[2px] border-white/20">
            <span className="text-white/25 text-[9px] tracking-[0.1em] tabular-nums" style={{ fontFamily: "'Space Mono', monospace" }}>
              {Math.abs(mapCoords.lat).toFixed(4)}°{mapCoords.lat >= 0 ? "N" : "S"}{" "}
              {Math.abs(mapCoords.lng).toFixed(4)}°{mapCoords.lng >= 0 ? "E" : "W"}{" "}
              Z{mapCoords.zoom.toFixed(1)}{" "}
              {mapCoords.bearing >= 0 ? "+" : ""}{mapCoords.bearing.toFixed(0)}°
            </span>
            <span className="ml-auto text-white/25 text-[9px] tracking-[0.1em] tabular-nums" style={{ fontFamily: "'Space Mono', monospace" }}>
              {time} PT
            </span>
          </div>
        </div>

        {/* Right — article titles list */}
        <div className="w-[340px] shrink-0 flex flex-col">
          {articles.map((a, i) => (
            <div
              key={i}
              className="flex-1 border-b-[2px] border-white/20 last:border-b-0 px-4 flex flex-col justify-center cursor-pointer transition-all duration-150"
              style={{
                backgroundColor: hovered === i ? "rgba(255,255,255,0.05)" : "transparent",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <JustifiedTitle text={a.title} hovered={hovered === i} redMode={redMode} />
              <div
                className="text-[9px] uppercase tracking-[0.04em] mt-1 transition-colors duration-150"
                style={{
                  color: hovered === i ? "rgba(255,42,0,0.5)" : redMode ? "rgba(255,42,0,0.35)" : "rgba(255,255,255,0.3)",
                }}
              >
                {a.author}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex border-t-[2px] border-white/20 h-[48px] shrink-0">
        <div className={`flex-1 px-5 flex items-center text-[10px] uppercase tracking-[0.06em] transition-colors duration-300 ${redMode ? "text-[#FF2A00]/40" : "text-white/40"}`}>
          {hovered !== null
            ? `${String(hovered + 1).padStart(2, "0")} / 07 — ${articles[hovered].title}`
            : "Edition 01 — San Francisco, 2026"
          }
        </div>
        <div className="px-5 flex items-center border-l-[2px] border-white/20 text-[10px] uppercase tracking-[0.06em] text-white/40">
          Free
        </div>
      </div>
    </div>
  )
}
