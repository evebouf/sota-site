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
  @font-face {
    font-family: 'Neue Haas Grotesk';
    src: url('/fonts/NHaasGroteskDSPro-65Md.otf') format('opentype');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Neue Haas Grotesk';
    src: url('/fonts/NHaasGroteskDSPro-75Bd.otf') format('opentype');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
  }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes fadeOut { from { opacity: 1 } to { opacity: 0 } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(40px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes slideDown { from { opacity: 1; transform: translateY(0) } to { opacity: 0; transform: translateY(40px) } }
  @media (min-width: 768px) {
    * { cursor: none !important; }
  }
  .sota-btn {
    transition: all 0.2s ease;
  }
  .sota-btn:hover {
    background: #000 !important;
    color: #fff !important;
    border-color: #000 !important;
  }
  .sota-btn:active {
    transform: scaleX(0.72) scale(0.95) !important;
  }
  .photos-hidden .photo-marker {
    opacity: 0 !important;
    pointer-events: none !important;
  }
  ::selection {
    background: #FF2A00;
    color: #ffffff;
  }
  ::-moz-selection {
    background: #FF2A00;
    color: #ffffff;
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

type Landmark = { name: string; coords: [number, number]; photo?: string; description?: string }

const landmarks: Landmark[] = [
  { name: "Transamerica Pyramid", coords: [-122.4027, 37.7952], photo: "/photos/transamerica.jpeg", description: "The way it catches light at 5pm — not the postcard angle, but from the alley on Merchant Street where it appears suddenly between fire escapes." },
  { name: "Fort Mason", coords: [-122.4316, 37.8035], photo: "/photos/fort-mason.jpeg", description: "The bench on the hill facing east. You can see the entire bay and nobody ever sits there." },
  { name: "Lombard Street", coords: [-122.4186, 37.8021], photo: "/photos/lombard.jpeg", description: "Not the switchbacks — the view from the top, looking down at blue hour when every window is lit and the city drops away beneath you." },
  { name: "William Stout Architectural Books", coords: [-122.40334, 37.796582], description: "A copy of Superstudio's 'Life Without Objects' was face-out on the second shelf. The man behind the counter knew every book by spine." },
  { name: "Holly the psychic", coords: [-122.409657, 37.799829], photo: "/photos/holly-psychic.png", description: "She told me I was carrying something I didn't need anymore. The neon sign buzzes even during the day." },
  { name: "Alex's cap at Coffee Roastery", coords: [-122.441759, 37.800003], photo: "/photos/coffee-roastery.png", description: "I've been coming here every week for a year and I have never once seen Alex, the Cambodian owner who runs it with his family, without a cap on." },
  { name: "Alcatraz View", coords: [-122.4120, 37.8060], photo: "/photos/alcatraz-view.jpeg", description: "A residential street in North Beach, perfectly aligned with the island. You'd walk past it a hundred times and never look up." },
  { name: "Coit Tower", coords: [-122.4058, 37.8024], photo: "/photos/coit-tower.jpeg", description: "The murals inside, painted during the Depression. Workers and fields and docks. The city remembering what it was built on." },
  { name: "Fort Point View Point", coords: [-122.4734, 37.8090], photo: "/photos/fort-point.jpeg", description: "The bridge from below, impossibly red against the gradient of the sky. The wind is always louder than you expect." },
  { name: "Legion of Honor", coords: [-122.4997, 37.7846], description: "The courtyard on a foggy Tuesday morning. Rodin's Thinker, alone, thinking. The Pacific invisible behind the trees." },
  { name: "The tucked-away café at Fort Mason", coords: [-122.428603, 37.807092], description: "Inside the HI hostel at Fort Mason. A small café with bay views that most San Franciscans have never heard of. Cozy and hidden in plain sight." },
  { name: "Betsy at the Bison Paddock", coords: [-122.473904, 37.771229], photo: "/photos/bison.png", description: "There are bison in Golden Gate Park. This is not a metaphor. Betsy stands at the fence most afternoons, unbothered by joggers, indifferent to tourists, chewing." },
]

// Preload all pin images so they appear instantly on click
landmarks.forEach(lm => {
  if (lm.photo) {
    const img = new Image()
    img.src = lm.photo
  }
})

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
  const [showManifesto, setShowManifesto] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null)
  const [closingLandmark, setClosingLandmark] = useState(false)
  const closeLandmark = () => {
    setClosingLandmark(true)
    setTimeout(() => { setSelectedLandmark(null); setClosingLandmark(false) }, 400)
  }
  const [closingManifesto, setClosingManifesto] = useState(false)
  const closeManifesto = () => {
    setClosingManifesto(true)
    setTimeout(() => { setShowManifesto(false); setClosingManifesto(false) }, 400)
  }
  const [coords, setCoords] = useState({ lat: 37.7749, lng: -122.4194 })
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

    m.on("move", () => {
      const c = m.getCenter()
      setCoords({ lat: c.lat, lng: c.lng })
    })

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

    // Markers — image only on map, click to reveal details
    for (const lm of landmarks) {
      const el = document.createElement("div")
      el.addEventListener("click", (e) => {
        e.stopPropagation()
        setSelectedLandmark(lm)
      })

      {
        el.style.cssText = `cursor: none; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;`
        const dot = document.createElement("div")
        dot.style.cssText = `
          width: 10px; height: 10px; border-radius: 50%;
          background: #FF2A00; box-shadow: 0 0 6px rgba(255,42,0,0.3);
          border: 1.5px solid rgba(0,0,0,0.15);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        `
        el.onmouseenter = () => { dot.style.transform = "scale(1.6)"; dot.style.boxShadow = "0 0 14px rgba(255,42,0,0.5)" }
        el.onmouseleave = () => { dot.style.transform = "scale(1)"; dot.style.boxShadow = "0 0 6px rgba(255,42,0,0.3)" }
        el.appendChild(dot)
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
      style={{ fontFamily: "'Space Mono', monospace", height: "100dvh", background: t.bg, transition: "background 0.6s ease" }}
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
      <div className="absolute inset-0 z-0" onClick={() => setSelectedLandmark(null)}>
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

      {/* Welcome modal */}
      {showWelcome && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)", cursor: "none" }}
          onClick={() => setShowWelcome(false)}
        >
          <div
            style={{
              background: "#ffffff",
              padding: "60px 32px",
              maxWidth: 440,
              width: "85vw",
              textAlign: "center",
              cursor: "none",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/sota-emblem.png"
              alt="SOTA"
              style={{ width: 260, margin: "0 auto 32px", display: "block" }}
            />
            <div style={{
              fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
              fontSize: 14,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              transform: "scaleX(0.72)",
              marginBottom: 4,
              color: "#000",
            }}>
              State of the Art
            </div>
            <div style={{
              fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
              fontSize: 13,
              lineHeight: 1.5,
              color: "#000",
              marginBottom: 24,
              fontStyle: "normal",
            }}>
              Enter the superstition machine
            </div>
            <div style={{
              fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
              fontSize: 12,
              lineHeight: 1.7,
              color: "#000",
              marginBottom: 32,
              maxWidth: 320,
              margin: "0 auto 32px",
            }}>
              The pins are not places. They are moments, details, fragments of attention. San Francisco rewards the attentive observer.
            </div>
            <button
              className="sota-btn"
              onClick={() => setShowWelcome(false)}
              style={{
                fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
                fontSize: 10,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                transform: "scaleX(0.75)",
                color: "#000",
                background: "none",
                border: "1px solid #000",
                padding: "10px 28px",
                cursor: "none",
              }}
            >
              Enter
            </button>
          </div>
        </div>
      )}

      {/* Red cursor — desktop only */}
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50 hidden md:block"
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
            color: mode === "day" ? "#000000" : t.textColor,
            opacity: 1,
            transition: "color 0.6s",
          }}
        >
          State of the Art
        </div>
        <div
          className="text-[9px] tracking-[0.15em]"
          style={{ fontFamily: "'Space Mono', monospace", color: mode === "day" ? "#000000" : t.textColor, opacity: mode === "day" ? 1 : 0.3, transition: "color 0.6s" }}
        >
          {coords.lat.toFixed(4)}°N {Math.abs(coords.lng).toFixed(4)}°W
        </div>
      </div>

      {/* Day/Night toggle */}
      <button
        onClick={() => setMode(mode === "day" ? "night" : "day")}
        className="absolute top-[4vh] right-[4vw] z-20 sota-btn"
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

      {/* Manifesto — full screen takeover */}
      {showManifesto && (
      <div
        className="fixed inset-0 z-40"
        style={{
          background: mode === "day" ? "#ffffff" : "#0a0e1a",
          overflowY: "auto",
          cursor: "none",
          animation: closingManifesto ? "fadeOut 0.4s ease forwards" : "fadeIn 0.4s ease",
        }}
      >
        <button
          className="sota-btn"
          onClick={closeManifesto}
          style={{
            position: "fixed", top: "4vh", right: "4vw",
            fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
            fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
            transform: "scaleX(0.75)", transformOrigin: "right",
            color: t.textColor, background: mode === "day" ? "#ffffff" : "#0a0e1a",
            border: `1px solid ${t.borderColor}`,
            padding: "6px 14px", cursor: "none", zIndex: 50,
          }}
        >
          Close
        </button>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "80px 40px 120px", animation: closingManifesto ? "slideDown 0.4s ease forwards" : "slideUp 0.5s ease" }}>

          <div style={{
            fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
            fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase",
            transform: "scaleX(0.72)", transformOrigin: "left",
            color: t.textColor, opacity: 1, marginBottom: 8,
          }}>
            What is SOTA ZINE?
          </div>
          <div style={{
            fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
            fontSize: 11, letterSpacing: "0.1em",
            color: t.textColor, opacity: 1, marginBottom: 32,
          }}>
            Sanjana Friedman — Editor and Publisher
          </div>

          <div style={{
            fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
            fontSize: 15, lineHeight: 1.7,
            color: t.textColor,
          }}>
            <p style={{ marginBottom: 20 }}>
              <strong style={{ fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif", fontSize: 11, letterSpacing: "0.05em", transform: "scaleX(0.85)", display: "inline-block" }}>STATE OF THE ART</strong>, or <strong>SOTA ZINE</strong> is an indefensible project born out of the convictions of a megalomaniac. These convictions run as follows:
            </p>
            <div style={{ paddingLeft: 20, marginBottom: 20 }}>
              1) No one reads anymore<br />
              2) No one values good design<br />
              3) No one cares<br />
              4) We will die if we don't do the work
            </div>
            <p style={{ marginBottom: 20 }}>
              Actually, <strong>SOTA ZINE</strong> was born out of a directive from a donor (hereafter referred to collectively as "THE DONORS") to "make a cool techno-optimist zine." Techno-optimism is, as far as we can tell, a recent coinage; it emerged near-simultaneously with the affirmation that "we are the media now." It is also a nonsense phrase. Techno-optimism? We are optimistic about technology? Technology doesn't accept predicates like "optimism" — technology is just the inevitable consequence of human organization and ingenuity. Technology exists. What does it mean for our lives?
            </p>
            <p style={{ marginBottom: 20 }}>
              Ok, we are being obtuse. What the "techno-optimists" really mean to say is that they are sick of the mediocre schoolmarm critic class that regards every attempt to MAKE IT NEW as an attack. Right. This is our common enemy: the hand-wringers, the self-satisfied, and above all the mediocrities.
            </p>
            <p style={{ marginBottom: 20 }}>
              <strong>SOTA ZINE</strong> believes in velocity and heat; <strong>SOTA ZINE</strong> believes in singular genius; <strong>SOTA ZINE</strong> believes that some things are better than others; <strong>SOTA ZINE</strong> believes in doing the work; <strong>SOTA ZINE</strong> believes in making new things; <strong>SOTA ZINE</strong> believes in tomorrow.
            </p>

            <div style={{
              fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
              fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
              transform: "scaleX(0.75)", transformOrigin: "left",
              color: t.textColor, opacity: 1, marginBottom: 8, marginTop: 32,
            }}>
              Red Meat
            </div>
            <p style={{ marginBottom: 20 }}>
              We should do things that look GOOD. Even an inside joke which operates on multiple levels (some of which will be inscrutable to all but us) should be legible to the drooling median social media user as, simply, "cool." This doesn't mean we dumb things down; it just means that everything should also work at some obvious level.
            </p>

            <div style={{
              fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
              fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
              transform: "scaleX(0.75)", transformOrigin: "left",
              color: t.textColor, opacity: 1, marginBottom: 8, marginTop: 32,
            }}>
              All Killer No Filler
            </div>
            <p style={{ marginBottom: 20 }}>
              We should strive to make everything we touch excellent — according to our very high standards. The goal should always be excellence in prose, visuals, ideas, execution. We obsess over details. We do not accept anything — a phrase, a design choice, a title — that doesn't make sense. In this we will never be satisfied, of course. That is our curse.
            </p>

            <div style={{
              fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
              fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
              transform: "scaleX(0.75)", transformOrigin: "left",
              color: t.textColor, opacity: 1, marginBottom: 8, marginTop: 32,
            }}>
              Faber Ludens
            </div>
            <p style={{ marginBottom: 20 }}>
              <span>Maker at play.</span> We are doing our life's work; how could we not have fun. Harry Mathews (member of our closest forebear, Oulipo) gives us this: "Literature and game playing, literature as game playing… The words evoke a weedy figure: the playful writer… sauntering down sunny boulevards... <span>Faber ludens</span> — a little ludicrous, too."
            </p>

            <div style={{
              fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
              fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
              transform: "scaleX(0.75)", transformOrigin: "left",
              color: t.textColor, opacity: 1, marginBottom: 8, marginTop: 32,
            }}>
              Sharp Lines, No Approximation
            </div>
            <p style={{ marginBottom: 20 }}>
              I keep coming back to this line from Bernhard's hallucination of Glenn Gould: "He loved things with sharp contours, detested approximation. One of his favorite words was self-discipline… He was the most ruthless person toward himself. He never allowed himself to be imprecise."
            </p>
            <p style={{ marginBottom: 20 }}>
              Perhaps this is just my sensibility but I feel strongly that everything I touch should be sharp. It should be in focus. If I am ruthless toward myself, it is because I hold myself to high standards that I believe I will one day be capable of meeting.
            </p>
            <p style={{ marginBottom: 40 }}>
              <strong>SOTA ZINE</strong> is not like the other girls; everything we do should be something that only we could do. We are in the business of remembering that we exist as human beings — as unique embodied subjectivities that exist in "the brief crack of light between two eternities of darkness." ➽
            </p>
          </div>
        </div>
      </div>
      )}

      {/* Detail overlay — immersive, like opening a letter */}
      {selectedLandmark && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{
            background: mode === "day" ? "#ffffff" : "#0a0e1a",
            cursor: "none",
            animation: closingLandmark ? "fadeOut 0.4s ease forwards" : "fadeIn 0.4s ease",
          }}
          onClick={closeLandmark}
        >
          <button
            className="sota-btn"
            onClick={closeLandmark}
            style={{
              position: "absolute", top: "4vh", right: "4vw",
              fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
              fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
              transform: "scaleX(0.75)", transformOrigin: "right",
              color: t.textColor, background: "none",
              border: `1px solid ${t.borderColor}`,
              padding: "6px 14px", cursor: "none",
            }}
          >
            Close
          </button>
          <div
            style={{
              maxWidth: 480,
              width: "90vw",
              cursor: "none",
              animation: closingLandmark ? "slideDown 0.4s ease forwards" : "slideUp 0.5s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedLandmark.photo && (
                <img
                  src={selectedLandmark.photo}
                  alt={selectedLandmark.name}
                  style={{
                    maxWidth: selectedLandmark.photo.endsWith('.png') ? 120 : "100%",
                    maxHeight: "50vh",
                    display: "block",
                    marginBottom: 20,
                  }}
                />
            )}
            <div style={{
              fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
              fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase",
              transform: "scaleX(0.72)", transformOrigin: "left",
              color: t.textColor, marginBottom: 14,
            }}>
              {selectedLandmark.name}
            </div>
            {selectedLandmark.description && (
              <div style={{
                fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
                fontSize: 15, lineHeight: 1.8,
                color: t.textColor,
                maxWidth: 400,
              }}>
                {selectedLandmark.description}
              </div>
            )}
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9, letterSpacing: "0.1em",
              color: t.textColor, opacity: 1,
              marginTop: 24,
            }}>
              {selectedLandmark.coords[1].toFixed(4)}°N {Math.abs(selectedLandmark.coords[0]).toFixed(4)}°W
            </div>
          </div>
        </div>
      )}

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
        <span style={{ transform: "scaleX(0.75)", transformOrigin: "left", display: "inline-block", pointerEvents: "none", textDecoration: "none", WebkitTapHighlightColor: "transparent", userSelect: "none" }}>EDITION 01 — 2026</span>
        <button
          onClick={() => showManifesto ? closeManifesto() : setShowManifesto(true)}
          style={{ position: "absolute", left: "50%", top: "50%", transform: "translateX(-50%) translateY(-50%) scaleX(0.75)", letterSpacing: "0.25em", textTransform: "uppercase", display: "inline-block", color: t.textColor, background: "none", border: "none", cursor: "none", borderBottom: `1px solid ${t.borderColor}`, paddingBottom: 2, fontFamily: "inherit", fontSize: "inherit" }}
        >
          Manifesto
        </button>
        <span style={{ letterSpacing: "0.25em", textTransform: "uppercase", transform: "scaleX(0.75)", transformOrigin: "right", display: "inline-block", pointerEvents: "none", textDecoration: "none", WebkitTapHighlightColor: "transparent", userSelect: "none" }}>San Francisco</span>
      </div>
    </div>
  )
}
