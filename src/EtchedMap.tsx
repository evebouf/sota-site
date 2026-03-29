// Etched Map — white background, black outlined streets & buildings, no shaders

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

// Inject Trade Gothic Heavy font-face + photo toggle styles
const fontStyle = document.createElement("style")
fontStyle.textContent = `
  @font-face {
    font-family: 'Trade Gothic Heavy';
    src: url('/fonts/TradeGothicNextLTPro-Hv.otf') format('opentype');
    font-weight: 800;
    font-style: normal;
    font-display: swap;
  }
  .photos-hidden .photo-marker {
    opacity: 0 !important;
    pointer-events: none !important;
  }
`
if (!document.querySelector('[data-trade-gothic]')) {
  fontStyle.setAttribute('data-trade-gothic', '')
  document.head.appendChild(fontStyle)
}

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

const landmarks: { name: string; coords: [number, number]; photo?: string }[] = [
  { name: "Transamerica Pyramid", coords: [-122.4027, 37.7952], photo: "/photos/transamerica.jpeg" },
  { name: "Fort Mason", coords: [-122.4316, 37.8035], photo: "/photos/fort-mason.jpeg" },
  { name: "Lombard Street", coords: [-122.4186, 37.8021], photo: "/photos/lombard.jpeg" },
  { name: "William Stout Architectural Books", coords: [-122.4028, 37.7962] },
  { name: "North Beach Psychic", coords: [-122.4084, 37.7999] },
  { name: "Coffee Roastery", coords: [-122.4400, 37.8005] },
  { name: "Alcatraz View", coords: [-122.4120, 37.8060], photo: "/photos/alcatraz-view.jpeg" },
  { name: "Coit Tower", coords: [-122.4058, 37.8024], photo: "/photos/coit-tower.jpeg" },
  { name: "Fort Point View Point", coords: [-122.4734, 37.8090], photo: "/photos/fort-point.jpeg" },
  { name: "Legion of Honor", coords: [-122.4997, 37.7846] },
  { name: "Golden Gate Bridge", coords: [-122.4783, 37.8199] },
]

type MapMode = "day" | "night"

const themes = {
  day: {
    bg: "#f5f2ec",
    water: "#e8e4de",
    land: "#f5f2ec",
    line: "#1a1a1a",
    lineOpacity: 0.7,
    fog: "#f5f2ec",
    hillShadow: "#c8c0b4",
    hillHighlight: "#ffffff",
    hillAccent: "#b0a898",
    building: "#1a1a1a",
    buildingOpacity: 0.12,
    ggb: "#FF2A00",
    canvasFilter: "contrast(1.1) brightness(1.05) saturate(0)",
    dotColor: "#1a1a1a",
    dotOpacity: 0.12,
    linePatternColor: "#1a1a1a",
    linePatternOpacity: 0.08,
    textColor: "#1a1a1a",
    borderColor: "rgba(0,0,0,0.08)",
    photoBorder: "rgba(0,0,0,0.1)",
    photoShadow: "rgba(0,0,0,0.1)",
    pinBorder: "rgba(0,0,0,0.15)",
  },
  night: {
    bg: "#0a0e1a",
    water: "#060a14",
    land: "#0e1428",
    line: "#5a78c0",
    lineOpacity: 0.8,
    fog: "#0a0e1a",
    hillShadow: "#060810",
    hillHighlight: "#1a2448",
    hillAccent: "#0c1020",
    building: "#1e2d5c",
    buildingOpacity: 0.25,
    ggb: "#FF2A00",
    canvasFilter: "contrast(1.2) brightness(0.9) saturate(0.4)",
    dotColor: "#3a5aa0",
    dotOpacity: 0.15,
    linePatternColor: "#2a4080",
    linePatternOpacity: 0.1,
    textColor: "#6a80b8",
    borderColor: "rgba(40,60,120,0.3)",
    photoBorder: "rgba(40,60,120,0.3)",
    photoShadow: "rgba(0,0,0,0.4)",
    pinBorder: "rgba(40,60,120,0.4)",
  },
}

export default function EtchedMap() {
  useEffect(() => { document.title = "Etched — State of the Art" }, [])
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState<MapMode>("day")
  const [showPhotos, setShowPhotos] = useState(false)
  const cursor = useRedCursor()

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return
    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-122.405609, 37.791686],
      zoom: 14,
      pitch: 45,
      bearing: -15,
      antialias: true,
      interactive: true,
      minZoom: 11,
      maxZoom: 16,
      dragRotate: true,
      maxBounds: [[-122.55, 37.70], [-122.30, 37.85]],
    })
    mapRef.current = m

    m.on("style.load", () => {
      // Strip labels
      for (const layer of m.getStyle().layers || []) {
        if (layer.type === "symbol") m.removeLayer(layer.id)
      }

      // Restyle — white land, light water, black lines
      for (const layer of m.getStyle().layers || []) {
        if (layer.type === "fill") {
          if (layer["source-layer"] === "water") {
            m.setPaintProperty(layer.id, "fill-color", "#e8e4de")
            m.setPaintProperty(layer.id, "fill-opacity", 1)
          } else {
            m.setPaintProperty(layer.id, "fill-color", "#f5f2ec")
          }
        }
        if (layer.type === "line") {
          m.setPaintProperty(layer.id, "line-color", "#1a1a1a")
          m.setPaintProperty(layer.id, "line-opacity", 0.7)
          try { m.setPaintProperty(layer.id, "line-width", 0.6) } catch (_) {}
        }
      }

      // Terrain relief — SF hills
      m.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      })
      m.setTerrain({ source: "mapbox-dem", exaggeration: 2.5 })

      // Hillshade layer for visual depth
      m.addSource("hillshade-source", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      })
      m.addLayer({
        id: "hillshade",
        type: "hillshade",
        source: "hillshade-source",
        paint: {
          "hillshade-illumination-direction": 315,
          "hillshade-exaggeration": 0.6,
          "hillshade-shadow-color": "#c8c0b4",
          "hillshade-highlight-color": "#ffffff",
          "hillshade-accent-color": "#b0a898",
        },
      }, m.getStyle().layers?.[0]?.id) // insert below everything

      // Fog — matches background
      m.setFog({
        range: [-2, 2],
        color: "#f5f2ec",
        "horizon-blend": 1,
        "high-color": "#f5f2ec",
        "space-color": "#f5f2ec",
        "star-intensity": 0,
      })

      // Golden Gate highlight
      m.addLayer({
        id: "ggb",
        source: "composite",
        "source-layer": "road",
        type: "line",
        filter: [
          "any",
          ["==", ["get", "name"], "Golden Gate Bridge"],
          ["==", ["get", "name_en"], "Golden Gate Bridge"],
        ],
        paint: { "line-color": "#FF2A00", "line-width": 2.5, "line-opacity": 1 },
      })

      // Buildings — very light outlined extrusions
      m.addLayer({
        id: "buildings-3d",
        source: "composite",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 13,
        paint: {
          "fill-extrusion-color": "#1a1a1a",
          "fill-extrusion-height": ["*", ["get", "height"], 0.8],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.12,
        },
      })

      // Apply desaturation to canvas only, not markers
      const canvas = m.getCanvas()
      if (canvas) canvas.style.filter = "contrast(1.1) brightness(1.05) saturate(0)"

      setReady(true)
    })

    // Markers
    for (const lm of landmarks) {
      const el = document.createElement("div")
      if (lm.photo) {
        el.className = "photo-marker"
        el.style.cssText = `width: 70px; height: 70px; cursor: none; transition: opacity 0.3s ease;`
        const inner = document.createElement("div")
        inner.style.cssText = `
          width: 100%; height: 100%; border: 1px solid rgba(0,0,0,0.1);
          overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1); transform-origin: center center;
        `
        inner.innerHTML = `<img src="${lm.photo}" style="width:100%;height:100%;object-fit:cover;filter:saturate(1.8) contrast(1.1);" />`
        inner.onmouseenter = () => { inner.style.transform = "scale(1.8)"; inner.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)" }
        inner.onmouseleave = () => { inner.style.transform = "scale(1)"; inner.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)" }
        el.appendChild(inner)
      } else {
        el.style.cssText = `
          width: 10px; height: 10px; border-radius: 50%;
          background: #FF2A00; box-shadow: 0 0 6px rgba(255,42,0,0.3);
          border: 1.5px solid rgba(0,0,0,0.15);
        `
      }
      new mapboxgl.Marker({ element: el })
        .setLngLat(lm.coords)
        .addTo(m)
    }

    return () => { m.remove(); mapRef.current = null }
  }, [])


  // Apply theme when mode changes
  useEffect(() => {
    const m = mapRef.current
    const t = themes[mode]
    document.body.style.setProperty("--grain-opacity", "0")
    document.body.style.backgroundColor = t.bg

    if (!m || !m.isStyleLoaded()) return

    // Restyle layers
    for (const layer of m.getStyle().layers || []) {
      if (layer.id === "ggb" || layer.id === "buildings-3d" || layer.id === "hillshade") continue
      if (layer.type === "background") {
        m.setPaintProperty(layer.id, "background-color", t.land)
      }
      if (layer.type === "fill") {
        const sl = (layer as any)["source-layer"] || ""
        if (sl === "water" || layer.id.includes("water")) {
          m.setPaintProperty(layer.id, "fill-color", t.water)
          m.setPaintProperty(layer.id, "fill-opacity", 1)
        } else {
          m.setPaintProperty(layer.id, "fill-color", t.land)
        }
      }
      if (layer.type === "line") {
        m.setPaintProperty(layer.id, "line-color", t.line)
        m.setPaintProperty(layer.id, "line-opacity", t.lineOpacity)
      }
    }

    // Update fog
    m.setFog({
      range: [-2, 2],
      color: t.fog,
      "horizon-blend": 1,
      "high-color": t.fog,
      "space-color": t.fog,
      "star-intensity": mode === "night" ? 0.3 : 0,
    })

    // Update hillshade
    m.setPaintProperty("hillshade", "hillshade-shadow-color", t.hillShadow)
    m.setPaintProperty("hillshade", "hillshade-highlight-color", t.hillHighlight)
    m.setPaintProperty("hillshade", "hillshade-accent-color", t.hillAccent)

    // Update buildings
    m.setPaintProperty("buildings-3d", "fill-extrusion-color", t.building)
    m.setPaintProperty("buildings-3d", "fill-extrusion-opacity", t.buildingOpacity)

    // Canvas filter
    const canvas = m.getCanvas()
    if (canvas) canvas.style.filter = t.canvasFilter

    return () => {
      document.body.style.removeProperty("--grain-opacity")
      document.body.style.backgroundColor = ""
    }
  }, [mode, ready])

  const t = themes[mode]

  return (
    <div
      className={`w-screen overflow-hidden relative${showPhotos ? "" : " photos-hidden"}`}
      style={{ fontFamily: "'Space Mono', monospace", height: "100dvh", background: t.bg, cursor: "none", transition: "background 0.6s ease" }}
    >
      {/* Halftone SVG pattern definition */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <pattern id="halftone-dots" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill={t.dotColor} opacity={t.dotOpacity} />
          </pattern>
          <pattern id="halftone-lines" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke={t.linePatternColor} strokeWidth="0.4" opacity={t.linePatternOpacity} />
          </pattern>
        </defs>
      </svg>

      {/* Map */}
      <div className="absolute inset-0 z-0">
        <div
          ref={mapContainer}
          className="w-full h-full"
          style={{}}
        />
        {/* Halftone texture overlay — moves with page but gives printed feel */}
        <div className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: "multiply" }}>
          <svg width="100%" height="100%">
            <rect width="100%" height="100%" fill="url(#halftone-dots)" />
            <rect width="100%" height="100%" fill="url(#halftone-lines)" />
          </svg>
        </div>
      </div>

      {/* Red cursor */}
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />

      {/* Top-left legend */}
      <div
        className="absolute top-[4vh] left-[4vw] z-10 pointer-events-none transition-all duration-600"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <div
          className="text-[14px] uppercase mb-1"
          style={{
            fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
            letterSpacing: "0.15em",
            transform: "scaleX(0.72)",
            transformOrigin: "left",
            color: t.textColor,
            opacity: 0.6,
            transition: "color 0.6s",
          }}
        >
          State of the Art
        </div>
        <div
          className="text-[9px] tracking-[0.15em]"
          style={{ fontFamily: "'Space Mono', monospace", color: t.textColor, opacity: 0.3, transition: "color 0.6s" }}
        >
          37.7749°N 122.4194°W
        </div>
      </div>

      {/* Day/Night toggle */}
      <button
        onClick={() => setMode(mode === "day" ? "night" : "day")}
        className="absolute top-[4vh] right-[4vw] z-20"
        style={{
          fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          transform: "scaleX(0.75)",
          transformOrigin: "right",
          color: t.textColor,
          opacity: 0.5,
          background: "none",
          border: `1px solid ${t.borderColor}`,
          padding: "6px 14px",
          cursor: "none",
          transition: "all 0.6s ease",
        }}
      >
        {mode === "day" ? "Night" : "Day"}
      </button>

      {/* Photo toggle — bottom right */}
      <button
        onClick={() => setShowPhotos(!showPhotos)}
        className="absolute bottom-[52px] right-[4vw] z-20"
        style={{
          fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          transform: "scaleX(0.75)",
          transformOrigin: "right",
          color: t.textColor,
          opacity: 0.5,
          background: "none",
          border: `1px solid ${t.borderColor}`,
          padding: "6px 14px",
          cursor: "none",
          transition: "all 0.6s ease",
        }}
      >
        {showPhotos ? "Hide Photos" : "Show Photos"}
      </button>

      {/* Bottom nav bar — covers Mapbox attribution */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-[4vw]"
        style={{
          height: 40,
          background: mode === "day" ? "#ffffff" : "#0c1020",
          borderTop: `1px solid ${t.borderColor}`,
          fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
          fontSize: 10,
          letterSpacing: "0.15em",
          color: t.textColor,
          opacity: 1,
          transition: "all 0.6s ease",
        }}
      >
        <span style={{ transform: "scaleX(0.75)", transformOrigin: "left", display: "inline-block" }}>EDITION 01 — 2026</span>
        <span style={{ letterSpacing: "0.25em", textTransform: "uppercase", transform: "scaleX(0.75)", display: "inline-block" }}>San Francisco, CA</span>
        <span style={{ transform: "scaleX(0.75)", transformOrigin: "right", display: "inline-block" }}>STATE OF THE ART</span>
      </div>
    </div>
  )
}
