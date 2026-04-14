// Etched Map — Acts of Attention

import { useEffect, useRef, useState, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { createClient } from "@supabase/supabase-js"

// Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

type Observation = {
  id: string
  text: string
  lat: number
  lng: number
  created_at: string
  observer_id: number
}

function getObserverId(): number {
  const key = "sota-observer-id"
  const stored = localStorage.getItem(key)
  if (stored) return parseInt(stored, 10)
  const id = Math.floor(Math.random() * 9000) + 1000
  localStorage.setItem(key, String(id))
  return id
}

// Inject Trade Gothic Heavy font-face + styles
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
  a[href^="tel"], a[href^="mailto"], a[x-apple-data-detectors], a[href^="x-apple-mapitem"], a[href^="maps:"] {
    color: inherit !important;
    text-decoration: none !important;
    pointer-events: none !important;
  }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes fadeOut { from { opacity: 1 } to { opacity: 0 } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(40px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes slideDown { from { opacity: 1; transform: translateY(0) } to { opacity: 0; transform: translateY(40px) } }
  @keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px) } to { opacity: 1; transform: translateX(0) } }
  @keyframes slideOutLeft { from { opacity: 1; transform: translateX(0) } to { opacity: 0; transform: translateX(-40px) } }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(40px) } to { opacity: 1; transform: translateX(0) } }
  @keyframes slideOutRight { from { opacity: 1; transform: translateX(0) } to { opacity: 0; transform: translateX(40px) } }
  .etched-map-root, .etched-map-root *, .etched-map-root button {
    cursor: default !important;
  }
  .etched-map-root a, .etched-map-root a * {
    cursor: pointer !important;
  }
  .sota-badge { transition: filter 0.4s ease; }
  .sota-badge:hover { filter: invert(22%) sepia(98%) saturate(7471%) hue-rotate(11deg) brightness(101%) contrast(108%); }
  textarea::placeholder {
    color: rgba(0,0,0,0.15);
  }
  @keyframes pulse-ring { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.5; } }
  @keyframes ripple-out { 0% { width: 8px; height: 8px; opacity: 1; } 100% { width: 36px; height: 36px; opacity: 0; } }
  @keyframes blink-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
  @keyframes breathe { 0%, 100% { transform: scale(0.8); opacity: 0.3; } 50% { transform: scale(1.1); opacity: 0.7; } }
  @keyframes dash-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes fade-pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.6; } }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
  .mapboxgl-ctrl-bottom-left,
  .mapboxgl-ctrl-bottom-right,
  .mapboxgl-ctrl-logo,
  .mapboxgl-ctrl-attrib { display: none !important; }
  .sota-btn {
    transition: all 0.2s ease;
  }
  .sota-btn:hover {
    background: #000 !important;
    color: #fff !important;
    border-color: #000 !important;
  }
  .sota-btn:active {
    /* removed */
  }
  .icon-btn:hover {
    background: #000 !important;
    color: #fff !important;
  }
  @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
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


type MapMode = "day" | "night"

const themes = {
  day: {
    bg: "#ffffff",
    water: "#f0eeea",
    land: "#ffffff",
    line: "#1a1a1a",
    lineOpacity: 0.7,
    fog: "#ffffff",
    hillShadow: "#c8c0b4",
    hillHighlight: "#ffffff",
    hillAccent: "#b0a898",
    building: "#bfbfbf",
    buildingOpacity: 0.4,
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
    buildingOpacity: 0.45,
    ggb: "#FF2A00",
    canvasFilter: "contrast(1.2) brightness(0.9) saturate(0.4)",
    dotColor: "#3a5aa0",
    dotOpacity: 0.15,
    linePatternColor: "#2a4080",
    linePatternOpacity: 0.1,
    textColor: "#ffffff",
    borderColor: "rgba(40,60,120,0.3)",
    photoBorder: "rgba(40,60,120,0.3)",
    photoShadow: "rgba(0,0,0,0.4)",
    pinBorder: "rgba(40,60,120,0.4)",
  },
}

function renderTextWithMentions(text: string, textColor: string) {
  const parts: { text: string; isMention: boolean }[] = []
  const mentionRegex = /@\[([^\]]+)\]/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = mentionRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ text: text.slice(lastIndex, match.index), isMention: false })
    parts.push({ text: `@${match[1]}`, isMention: true })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), isMention: false })
  if (parts.every(p => !p.isMention)) return text
  return parts.map((p, i) =>
    p.isMention ? (
      <span key={i} style={{ color: "#FF2A00", textDecoration: "underline", textDecorationColor: "#FF2A00", textDecorationThickness: "1.5px", textUnderlineOffset: "1px" }}>{p.text}</span>
    ) : <span key={i} style={{ color: textColor }}>{p.text}</span>
  )
}

export default function EtchedMap() {
  useEffect(() => { document.title = "Acts of Attention — State of the Art" }, [])
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState<MapMode>("day")
  const [coords, setCoords] = useState({ lat: 37.8008, lng: -122.4058 })
  const [altitude, setAltitude] = useState({ zoom: 15.8, pitch: 45, bearing: -15 })


  // Observations state
  const [observations, setObservations] = useState<Observation[]>([])
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null)
  const [editingObservation, setEditingObservation] = useState(false)
  const [editText, setEditText] = useState("")

  // Compose state — open by default
  const [showCompose, setShowCompose] = useState(true)
  const [closingCompose, setClosingCompose] = useState(false)

  const [composeText, setComposeText] = useState("")
  const composeMaxChars = 200

  // @ mention autocomplete state
  type MentionResult = { name: string; address: string; mapbox_id: string }
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionResults, setMentionResults] = useState<MentionResult[]>([])
  const [mentionActive, setMentionActive] = useState(false)
  const [mentionStartIdx, setMentionStartIdx] = useState(-1)
  const [mentionSelectedIdx, setMentionSelectedIdx] = useState(0)
  const [confirmedMentions, setConfirmedMentions] = useState<string[]>([])
  const [locationSearch, setLocationSearch] = useState("")
  const [locationResults, setLocationResults] = useState<MentionResult[]>([])
  const [locationSelectedIdx, setLocationSelectedIdx] = useState(0)
  const locationDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mentionDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mentionSessionToken = useRef(crypto.randomUUID())

  // Fetch place suggestions from Mapbox Searchbox API
  const fetchMentions = useCallback((query: string) => {
    if (mentionDebounce.current) clearTimeout(mentionDebounce.current)
    if (query.length < 2) { setMentionResults([]); return }
    mentionDebounce.current = setTimeout(async () => {
      const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&access_token=${mapboxgl.accessToken}&proximity=-122.4194,37.7749&bbox=-122.52,37.70,-122.35,37.85&limit=5&session_token=${mentionSessionToken.current}`
      try {
        const res = await fetch(url)
        const data = await res.json()
        if (data.suggestions) {
          setMentionResults(data.suggestions.map((s: any) => ({ name: s.name, address: s.full_address || "", mapbox_id: s.mapbox_id })))
          setMentionSelectedIdx(0)
        }
      } catch { setMentionResults([]) }
    }, 200)
  }, [])

  // Retrieve place coordinates and fly map to it
  const retrieveAndLocate = useCallback(async (mapboxId: string) => {
    try {
      const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?access_token=${mapboxgl.accessToken}&session_token=${mentionSessionToken.current}`
      const res = await fetch(url)
      const data = await res.json()
      const coords = data.features?.[0]?.geometry?.coordinates
      if (coords) {
        setDropCoords([coords[0], coords[1]])
        const m = mapRef.current
        if (m) {
          m.flyTo({ center: [coords[0], coords[1]], zoom: 16, duration: 1200, padding: { right: 360 } })
        }
      }
    } catch { /* silently fail — user can still click map */ }
  }, [])

  // Fetch location search results
  const fetchLocationResults = useCallback((query: string) => {
    if (locationDebounce.current) clearTimeout(locationDebounce.current)
    if (query.length < 2) { setLocationResults([]); return }
    locationDebounce.current = setTimeout(async () => {
      const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&access_token=${mapboxgl.accessToken}&proximity=-122.4194,37.7749&bbox=-122.52,37.70,-122.35,37.85&limit=5&session_token=${mentionSessionToken.current}`
      try {
        const res = await fetch(url)
        const data = await res.json()
        if (data.suggestions) {
          setLocationResults(data.suggestions.map((s: any) => ({ name: s.name, address: s.full_address || "", mapbox_id: s.mapbox_id })))
          setLocationSelectedIdx(0)
        }
      } catch { setLocationResults([]) }
    }, 200)
  }, [])

  // Confirmation state
  const [showConfirmation, setShowConfirmation] = useState(false)

  // About state
  const [showAbout, setShowAbout] = useState(false)
  const [closingAbout, setClosingAbout] = useState(false)

  // Manifesto state
  const [showManifesto, setShowManifesto] = useState(false)
  const [aboutPage, setAboutPage] = useState<"about" | "manifesto">("about")
  const [closingManifesto, setClosingManifesto] = useState(false)

  // Long press state
  const [longPress, setLongPress] = useState<{ x: number; y: number; progress: number } | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressAnim = useRef<number | null>(null)

  // Drop coords + preview marker
  const [dropCoords, setDropCoords] = useState<[number, number] | null>(null)
  const previewMarkerRef = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    const m = mapRef.current
    if (!m) return
    // Remove old preview marker
    if (previewMarkerRef.current) {
      previewMarkerRef.current.remove()
      previewMarkerRef.current = null
    }
    // Add new preview marker if we have coords
    if (dropCoords) {
      const el = document.createElement("div")
      el.style.cssText = `width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;`
      const ring = document.createElement("div")
      ring.style.cssText = `
        width: 14px; height: 14px; border-radius: 50%;
        border: 1.5px solid #FF2A00;
        background: none;
        animation: blink-dot 1.5s ease infinite;
      `
      el.appendChild(ring)
      previewMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat(dropCoords)
        .addTo(m)
    }
  }, [dropCoords])

  // Textarea ref
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Observation markers ref
  const observationMarkersRef = useRef<mapboxgl.Marker[]>([])

  const closeCompose = useCallback(() => {
    setShowCompose(false); setClosingCompose(false); setComposeText(""); setDropCoords(null)
    setMentionActive(false); setMentionResults([]); setConfirmedMentions([]); mentionSessionToken.current = crypto.randomUUID()
    setLocationSearch(""); setLocationResults([])

    if (previewMarkerRef.current) { previewMarkerRef.current.remove(); previewMarkerRef.current = null }
  }, [])

  const closeAbout = useCallback(() => {
    setShowAbout(false); setClosingAbout(false)
  }, [])

  const closeManifesto = useCallback(() => {
    setShowManifesto(false); setClosingManifesto(false)
  }, [])

  const addObservationMarker = useCallback((obs: Observation, map: mapboxgl.Map) => {
    const el = document.createElement("div")
    el.className = "mapboxgl-marker"
    el.style.cssText = `cursor: none; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;`
    const dot = document.createElement("div")
    dot.style.cssText = `
      width: 10px; height: 10px; border-radius: 50%;
      background: #FF2A00;
      transition: transform 0.2s ease;
    `
    el.onmouseenter = () => { dot.style.transform = "scale(1.6)" }
    el.onmouseleave = () => { dot.style.transform = "scale(1)" }
    el.addEventListener("click", (e) => {
      e.stopPropagation()
      setSelectedObservation(obs)
      setShowCompose(false)
      setClosingCompose(false)
      setEditingObservation(false)
      const m = mapRef.current
      if (m) {
        // Offset center to the left so pin isn't hidden behind the right sidebar
        const padding = window.innerWidth < 768 ? { right: 280 } : { right: 360 }
        m.flyTo({ center: [obs.lng, obs.lat], duration: 800, padding })
      }
    })
    el.appendChild(dot)
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([obs.lng, obs.lat])
      .addTo(map)
    return marker
  }, [])

  const loadObservations = useCallback(async (map: mapboxgl.Map) => {
    const { data, error } = await supabase.from("observations").select("*").order("created_at", { ascending: false })
    if (error) { console.error("Failed to load observations:", error); return }
    if (!data) return
    setObservations(data as Observation[])
    // Clear old markers
    observationMarkersRef.current.forEach(m => m.remove())
    observationMarkersRef.current = []
    // Add new markers
    for (const obs of data as Observation[]) {
      const marker = addObservationMarker(obs, map)
      observationMarkersRef.current.push(marker)
    }
  }, [addObservationMarker])

  // Focus textarea when compose opens
  useEffect(() => {
    if (showCompose && !closingCompose && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [showCompose, closingCompose])

  // Map init
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return
    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-122.4058, 37.8008],
      zoom: 15.8,
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
      setAltitude({ zoom: m.getZoom(), pitch: m.getPitch(), bearing: m.getBearing() })
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
            m.setPaintProperty(layer.id, "fill-color", "#f0eeea")
            m.setPaintProperty(layer.id, "fill-opacity", 1)
          } else {
            m.setPaintProperty(layer.id, "fill-color", "#ffffff")
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
        color: "#ffffff",
        "horizon-blend": 1,
        "high-color": "#ffffff",
        "space-color": "#ffffff",
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

      // Buildings — 3D extrusions (building data only available at zoom 15+)
      m.addLayer({
        id: "buildings-3d",
        source: "composite",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": "#bfbfbf",
          "fill-extrusion-height": ["*", ["get", "height"], 1.6],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.4,
          "fill-extrusion-vertical-gradient": true,
          "fill-extrusion-ambient-occlusion-intensity": 1.0,
          "fill-extrusion-ambient-occlusion-radius": 20,
        },
      })

      // Apply desaturation to canvas only, not markers
      const canvas = m.getCanvas()
      if (canvas) canvas.style.filter = "contrast(1.1) brightness(1.05) saturate(0)"

      // Landmark markers (commented out — kept for reference)
      /*
      const landmarks = [
        { name: "Transamerica Pyramid", coords: [-122.4027, 37.7952] },
        { name: "Fort Mason", coords: [-122.4316, 37.8035] },
        { name: "Lombard Street", coords: [-122.4186, 37.8021] },
        { name: "William Stout Architectural Books", coords: [-122.40334, 37.796582] },
        { name: "Holly the psychic", coords: [-122.409657, 37.799829] },
        { name: "Alex's cap at Coffee Roastery", coords: [-122.441759, 37.800003] },
        { name: "Alcatraz View", coords: [-122.4120, 37.8060] },
        { name: "Coit Tower", coords: [-122.4058, 37.8024] },
        { name: "Fort Point View Point", coords: [-122.4734, 37.8090] },
        { name: "Legion of Honor", coords: [-122.4997, 37.7846] },
        { name: "The tucked-away cafe at Fort Mason", coords: [-122.428603, 37.807092] },
        { name: "Betsy at the Bison Paddock", coords: [-122.473904, 37.771229] },
      ]
      for (const lm of landmarks) {
        const el = document.createElement("div")
        el.addEventListener("click", (e) => { e.stopPropagation() })
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
        new mapboxgl.Marker({ element: el }).setLngLat(lm.coords as [number, number]).addTo(m)
      }
      */

      // Load observations from Supabase
      loadObservations(m)

      setReady(true)

    })

    return () => { m.remove(); mapRef.current = null }
  }, [loadObservations])

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

  // Long-press handlers
  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
    if (longPressAnim.current) { cancelAnimationFrame(longPressAnim.current); longPressAnim.current = null }
    setLongPress(null)
  }, [])

  const handleMapMouseDown = useCallback((e: React.MouseEvent) => {
    // Ignore if clicking on a marker
    const target = e.target as HTMLElement
    if (target.closest(".mapboxgl-marker")) return

    const startX = e.clientX
    const startY = e.clientY
    const startTime = Date.now()
    const delayMs = 200
    const durationMs = 600

    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      if (Math.sqrt(dx * dx + dy * dy) > 6) {
        cancelLongPress()
        window.removeEventListener("mousemove", onMove)
        window.removeEventListener("mouseup", onUp)
      }
    }

    const onUp = () => {
      cancelLongPress()
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)

    longPressTimer.current = setTimeout(() => {
      // Start ring animation
      const animate = () => {
        const elapsed = Date.now() - startTime - delayMs
        const progress = Math.min(elapsed / durationMs, 1)
        setLongPress({ x: startX, y: startY, progress })
        if (progress < 1) {
          longPressAnim.current = requestAnimationFrame(animate)
        } else {
          // Long press complete — open compose
          setLongPress(null)
          // Get map coords at click point
          const m = mapRef.current
          if (m) {
            const lngLat = m.unproject([startX, startY - 40]) // offset for top bar
            setDropCoords([lngLat.lng, lngLat.lat])
          }
          setSelectedObservation(null)
          setEditingObservation(false)
          setShowCompose(true)
          setClosingCompose(false)
          setComposeText("")
          window.removeEventListener("mousemove", onMove)
          window.removeEventListener("mouseup", onUp)
        }
      }
      longPressAnim.current = requestAnimationFrame(animate)
    }, delayMs)
  }, [cancelLongPress])

  const handleMapClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest(".mapboxgl-marker")) return

    if (showCompose && !closingCompose) {
      // Set drop coords on map click while compose is open
      const m = mapRef.current
      if (m) {
        const lngLat = m.unproject([e.clientX, e.clientY - 40])
        setDropCoords([lngLat.lng, lngLat.lat])
      }
    } else {
      // Dismiss selection
      setSelectedObservation(null)
      setEditingObservation(false)
    }
  }, [showCompose, closingCompose])

  // Submit observation
  const submitObservation = useCallback(async () => {
    if (!composeText.trim()) return
    const m = mapRef.current
    if (!m) return
    const finalCoords = dropCoords || [m.getCenter().lng, m.getCenter().lat]
    const observerId = getObserverId()
    const { data, error } = await supabase.from("observations").insert({
      text: composeText.trim(),
      lng: finalCoords[0],
      lat: finalCoords[1],
      observer_id: observerId,
    }).select().single()
    if (error) { console.error("Failed to save observation:", error); return }
    if (data) {
      const obs = data as Observation
      setObservations(prev => [obs, ...prev])
      const marker = addObservationMarker(obs, m)
      observationMarkersRef.current.push(marker)
    }
    m.flyTo({ center: [finalCoords[0], finalCoords[1]], zoom: 16, duration: 1200, padding: { right: 360 } })
    setComposeText(""); setDropCoords(null); setConfirmedMentions([])
    if (previewMarkerRef.current) { previewMarkerRef.current.remove(); previewMarkerRef.current = null }
    setShowConfirmation(true)
    setTimeout(() => {
      setShowConfirmation(false)
      if (textareaRef.current) textareaRef.current.focus()
    }, 1500)
  }, [composeText, dropCoords, addObservationMarker])

  // Delete observation
  const deleteObservation = useCallback(async (obs: Observation) => {
    const { error } = await supabase.from("observations").delete().eq("id", obs.id)
    if (error) { console.error("Failed to delete:", error); return }
    setObservations(prev => prev.filter(o => o.id !== obs.id))
    // Reload markers from Supabase
    if (mapRef.current) loadObservations(mapRef.current)
    setSelectedObservation(null)
    setEditingObservation(false)
  }, [observations, loadObservations])

  // Save edit
  const saveEdit = useCallback(async () => {
    if (!selectedObservation || !editText.trim()) return
    const { error } = await supabase.from("observations").update({ text: editText.trim() }).eq("id", selectedObservation.id)
    if (error) { console.error("Failed to update:", error); return }
    const updated = { ...selectedObservation, text: editText.trim() }
    setObservations(prev => prev.map(o => o.id === updated.id ? updated : o))
    setSelectedObservation(updated)
    setEditingObservation(false)
  }, [selectedObservation, editText])

  const t = themes[mode]

  // Navigate observations
  const goToRandomObservation = useCallback(() => {
    if (observations.length === 0) return
    if (showCompose) closeCompose()
    const padding = window.innerWidth < 768 ? { right: 280 } : { right: 360 }
    const random = observations[Math.floor(Math.random() * observations.length)]
    setSelectedObservation(random)
    setEditingObservation(false)
    if (mapRef.current) mapRef.current.flyTo({ center: [random.lng, random.lat], duration: 800, padding })
  }, [observations, showCompose, closeCompose])

  const goToObservation = useCallback((direction: "prev" | "next") => {
    if (observations.length === 0) return
    if (showCompose) closeCompose()
    const padding = window.innerWidth < 768 ? { right: 280 } : { right: 360 }
    if (!selectedObservation) {
      const obs = direction === "next" ? observations[0] : observations[observations.length - 1]
      setSelectedObservation(obs)
      setEditingObservation(false)
      if (mapRef.current) mapRef.current.flyTo({ center: [obs.lng, obs.lat], duration: 800, padding })
      return
    }
    const idx = observations.findIndex(o => o.id === selectedObservation.id)
    const target = direction === "prev"
      ? observations[idx - 1] || observations[observations.length - 1]
      : observations[idx + 1] || observations[0]
    if (target) {
      setSelectedObservation(target)
      setEditingObservation(false)
      if (mapRef.current) mapRef.current.flyTo({ center: [target.lng, target.lat], duration: 800, padding })
    }
  }, [observations, selectedObservation, showCompose, closeCompose])

  // Hamburger/X state
  const hamburgerIsX = showAbout && !closingAbout


  return (
    <div
      className="etched-map-root w-screen overflow-hidden relative"
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
      <div
        className="absolute z-0"
        style={{ top: 40, left: 0, right: 0, bottom: 40 }}
        onClick={handleMapClick}
        onMouseDown={handleMapMouseDown}
      >
        <div
          ref={mapContainer}
          className="w-full h-full"
        />
        {/* Halftone texture overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: "multiply" }}>
          <svg width="100%" height="100%">
            <rect width="100%" height="100%" fill="url(#halftone-dots)" />
            <rect width="100%" height="100%" fill="url(#halftone-lines)" />
          </svg>
        </div>
      </div>

      {/* Long-press progress ring */}
      {longPress && (
        <svg
          width="48" height="48"
          style={{
            position: "fixed",
            left: longPress.x - 24,
            top: longPress.y - 24,
            zIndex: 60,
            pointerEvents: "none",
          }}
        >
          <circle
            cx="24" cy="24" r="20"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="1.5"
            opacity="0.3"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - longPress.progress)}`}
            transform="rotate(-90 24 24)"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* ===== TOP BANNER BAR ===== */}
      <div
        className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between"
        style={{
          height: 40,
          background: mode === "day" ? "#ffffff" : "#0c1020",
          borderBottom: `1.5px solid ${t.textColor}`,
          transition: "all 0.6s ease",
          overflow: "hidden",
        }}
      >
        {/* Left: Hamburger / X */}
        <button
          className="icon-btn"
          onClick={() => {
            if (showAbout && !closingAbout) {
              closeAbout()
            } else if (!showAbout) {
              setShowAbout(true)
              setClosingAbout(false)
            }
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#000"; e.currentTarget.style.color = "#fff" }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = t.textColor }}
          style={{
            width: 40, height: 40,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "none", border: "none", borderRight: `1.5px solid ${t.textColor}`,
            cursor: "default", color: t.textColor,
            transition: "background 0.15s ease, color 0.15s ease",
          }}
        >
          {hamburgerIsX ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" />
              <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
              <div className="icon-line" style={{ width: 14, height: 1.5, background: "currentColor", transition: "background 0.2s" }} />
              <div className="icon-line" style={{ width: 14, height: 1.5, background: "currentColor", transition: "background 0.2s" }} />
              <div className="icon-line" style={{ width: 14, height: 1.5, background: "currentColor", transition: "background 0.2s" }} />
            </div>
          )}
        </button>

        {/* Center: Title */}
        <div
          style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translateX(-50%) translateY(-50%)",
            display: "flex", alignItems: "center", gap: 8,
            whiteSpace: "nowrap",
            transition: "color 0.6s",
            color: t.textColor,
          }}
        >
          <span style={{
            fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
            fontSize: 13,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}>
            <span style={{ fontWeight: 700 }}>State of the Art</span>
            {" "}
            <span style={{ fontWeight: 400 }}>Noticings</span>
          </span>
        </div>

        {/* Right: + / X button */}
        <button
          className="icon-btn"
          onClick={() => {
            if (showCompose && !closingCompose) {
              closeCompose()
            } else {
              setSelectedObservation(null)
              setEditingObservation(false)
              setShowCompose(true)
              setClosingCompose(false)
              setComposeText("")
              setDropCoords(null)
            }
          }}
          onMouseEnter={(e) => {
            if (showCompose) { e.currentTarget.style.opacity = "0.5" }
            else { e.currentTarget.style.opacity = "0.85" }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1"
          }}
          style={{
            width: 40, height: 40,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: showCompose ? "none" : "#FF2A00",
            border: "none", borderLeft: `1.5px solid ${t.textColor}`,
            cursor: "default", color: showCompose ? t.textColor : "#ffffff",
            transition: "all 0.2s ease",
          }}
        >
          {showCompose ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" />
              <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="7" y1="1" x2="7" y2="13" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="1" y1="7" x2="13" y2="7" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
          )}
        </button>
      </div>

      {/* ===== SPINNING BADGE (top-left) ===== */}
      <a
        href="https://sotazine.substack.com/"
        target="_blank"
        rel="noopener"
        className="sota-badge"
        style={{
          position: "fixed",
          top: 52, left: 12,
          width: 120, height: 120,
          zIndex: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          textDecoration: "none",
        }}
      >
        <img
          src="/hyperstition-machine.svg"
          alt=""
          className="sota-spinner"
          style={{
            position: "absolute",
            width: 120, height: 120,
            animation: "spin-slow 20s linear infinite",
          }}
        />
        <img
          src="/read-sota.svg"
          alt="Read SOTA"
          style={{
            position: "relative",
            width: 64, height: "auto",
          }}
        />
      </a>

      {/* ===== ABOUT PANEL (full-width overlay) ===== */}
      {showAbout && (
        <div
          style={{
            position: "fixed",
            top: 40, left: 0, bottom: 84.25,
            width: "min(75vw, 800px)",
            background: mode === "day" ? "#ffffff" : "#0c1020",
            borderRight: `1.5px solid ${t.textColor}`,
            zIndex: 35,
            overflowY: "auto",
            animation: "none",
            display: "flex", flexDirection: "column",
          }}
          className="hide-scrollbar"
        >
          <div style={{ padding: "48px 48px 0", flex: 1 }}>
            {/* Intro */}
            <div style={{
              fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
              fontSize: 18, lineHeight: 1.7, fontWeight: 400,
              color: t.textColor, marginBottom: 16, maxWidth: 700,
            }}>
              <strong style={{ fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', sans-serif", fontWeight: 700 }}>STATE OF THE ART</strong> is a zine produced in San Francisco.
            </div>
            <div style={{
              fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
              fontSize: 16, lineHeight: 1.7, fontWeight: 400,
              color: t.textColor, marginBottom: 32, maxWidth: 700,
            }}>
              We publish nonfiction, fiction, and the occasional poem, online and in print. We believe in singular visions, sharp prose, evasive design, red meat, the liberatory promise of technology, and tomorrow.
            </div>

            {/* Read the zine link */}
            <div style={{ marginBottom: 48, textAlign: "right", maxWidth: 700 }}>
              <a
                href="https://sotazine.substack.com/"
                target="_blank"
                rel="noopener"
                style={{
                  fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
                  fontSize: 16, fontWeight: 700,
                  color: t.textColor, textDecoration: "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.5" }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1" }}
              >
                Read the Zine Here
              </a>
            </div>

            {/* Noticings section */}
            <div style={{ display: "flex", gap: 24, marginBottom: 32, alignItems: "flex-start", maxWidth: 700 }}>
              <img
                src="/sota-emblem.png"
                alt="SOTA"
                style={{ width: 120, height: 120, objectFit: "cover", flexShrink: 0 }}
              />
              <div style={{
                fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
                fontSize: 16, lineHeight: 1.7, fontWeight: 400,
                color: t.textColor,
              }}>
                <p style={{ marginBottom: 16 }}>
                  <strong style={{ fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', sans-serif", fontWeight: 700 }}>NOTICINGS</strong> is a project by <strong style={{ fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', sans-serif", fontWeight: 700 }}>STATE OF THE ART</strong>.
                </p>
                <p>
                  What story could only you tell us about San Francisco? Tell us in no more than three lines. The more detailed, the better.
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 48, maxWidth: 700 }}>
              <div style={{
                fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
                fontSize: 22, fontWeight: 700,
                color: t.textColor,
                lineHeight: 1.2,
                flexShrink: 0,
                width: 120,
              }}>
                How It Works
              </div>
              <div style={{
                display: "flex", gap: 32, flex: 1,
                fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
                fontSize: 14, lineHeight: 1.6, fontWeight: 400,
                color: t.textColor,
              }}>
                <div>Long press on map or click (+) to drop a pin.</div>
                <div>Write a diary entry (250 chars max).</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>Explore other pins on the map to step into other stories.</div>
                  <div>Download and share what you noticed.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MANIFESTO PANEL (left sidebar) ===== */}
      {showManifesto && (
        <div
          style={{
            position: "fixed",
            top: 40, left: 0, bottom: 40,
            width: 420,
            background: mode === "day" ? "#ffffff" : "#0c1020",
            borderRight: `1.5px solid ${t.textColor}`,
            zIndex: 25,
            overflowY: "auto",
            cursor: "default",
            animation: "none",
          }}
        >
          {/* Close button */}
          <button
            className="icon-btn"
            onClick={closeManifesto}
            style={{
              position: "sticky", top: 0, right: 0,
              width: 40, height: 40,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: mode === "day" ? "#ffffff" : "#0c1020",
              border: "none", borderBottom: `1.5px solid ${t.textColor}`,
              cursor: "default",
              marginLeft: "auto",
              zIndex: 2,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="1" y1="1" x2="13" y2="13" stroke={t.textColor} strokeWidth="1.5" />
              <line x1="13" y1="1" x2="1" y2="13" stroke={t.textColor} strokeWidth="1.5" />
            </svg>
          </button>

          <div style={{ padding: "20px 32px 60px" }}>
            <div style={{
              fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif", fontWeight: 700,
              fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase",
              transform: "scaleX(0.72)", transformOrigin: "left",
              color: t.textColor, marginBottom: 8,
            }}>
              What is SOTA ZINE?
            </div>
            <div style={{
              fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
              fontSize: 11, letterSpacing: "0.1em",
              color: t.textColor, marginBottom: 32,
            }}>
              Sanjana Friedman — Editor and Publisher
            </div>

            <div style={{
              fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
              fontSize: 15, lineHeight: 1.7,
              color: t.textColor,
            }}>
              <p style={{ marginBottom: 20 }}>
                <strong style={{ fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.05em", transform: "scaleX(0.85)", display: "inline-block" }}>STATE OF THE ART</strong>, or <strong>SOTA ZINE</strong> is an indefensible project born out of the convictions of a megalomaniac. These convictions run as follows:
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
                fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif", fontWeight: 700,
                fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
                transform: "scaleX(0.75)", transformOrigin: "left",
                color: t.textColor, marginBottom: 8, marginTop: 32,
              }}>
                Red Meat
              </div>
              <p style={{ marginBottom: 20 }}>
                We should do things that look GOOD. Even an inside joke which operates on multiple levels (some of which will be inscrutable to all but us) should be legible to the drooling median social media user as, simply, "cool." This doesn't mean we dumb things down; it just means that everything should also work at some obvious level.
              </p>

              <div style={{
                fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif", fontWeight: 700,
                fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
                transform: "scaleX(0.75)", transformOrigin: "left",
                color: t.textColor, marginBottom: 8, marginTop: 32,
              }}>
                All Killer No Filler
              </div>
              <p style={{ marginBottom: 20 }}>
                We should strive to make everything we touch excellent — according to our very high standards. The goal should always be excellence in prose, visuals, ideas, execution. We obsess over details. We do not accept anything — a phrase, a design choice, a title — that doesn't make sense. In this we will never be satisfied, of course. That is our curse.
              </p>

              <div style={{
                fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif", fontWeight: 700,
                fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
                transform: "scaleX(0.75)", transformOrigin: "left",
                color: t.textColor, marginBottom: 8, marginTop: 32,
              }}>
                Faber Ludens
              </div>
              <p style={{ marginBottom: 20 }}>
                <span>Maker at play.</span> We are doing our life's work; how could we not have fun. Harry Mathews (member of our closest forebear, Oulipo) gives us this: "Literature and game playing, literature as game playing... The words evoke a weedy figure: the playful writer... sauntering down sunny boulevards... <span>Faber ludens</span> — a little ludicrous, too."
              </p>

              <div style={{
                fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif", fontWeight: 700,
                fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
                transform: "scaleX(0.75)", transformOrigin: "left",
                color: t.textColor, marginBottom: 8, marginTop: 32,
              }}>
                Sharp Lines, No Approximation
              </div>
              <p style={{ marginBottom: 20 }}>
                I keep coming back to this line from Bernhard's hallucination of Glenn Gould: "He loved things with sharp contours, detested approximation. One of his favorite words was self-discipline... He was the most ruthless person toward himself. He never allowed himself to be imprecise."
              </p>
              <p style={{ marginBottom: 20 }}>
                Perhaps this is just my sensibility but I feel strongly that everything I touch should be sharp. It should be in focus. If I am ruthless toward myself, it is because I hold myself to high standards that I believe I will one day be capable of meeting.
              </p>
              <p style={{ marginBottom: 40 }}>
                <strong>SOTA ZINE</strong> is not like the other girls; everything we do should be something that only we could do. We are in the business of remembering that we exist as human beings — as unique embodied subjectivities that exist in "the brief crack of light between two eternities of darkness."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== OBSERVATION DETAIL PANEL (right sidebar) ===== */}
      {selectedObservation && !showCompose && (
        <div
          style={{
            position: "fixed",
            top: 40, right: 0, bottom: 40,
            width: 340,
            background: mode === "day" ? "#ffffff" : "#0c1020",
            borderLeft: `1.5px solid ${t.textColor}`,
            zIndex: 25,
            display: "flex", flexDirection: "column",
            cursor: "default",
            animation: "none",
          }}
        >
          <div style={{ padding: "28px 24px", flex: 1, overflowY: "auto" }}>
            {/* Date */}
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9, letterSpacing: "0.1em",
              color: t.textColor, opacity: 0.5,
              marginBottom: 4,
            }}>
              {new Date(selectedObservation.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>

            {/* Coordinates */}
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9, letterSpacing: "0.1em",
              color: t.textColor, opacity: 0.3,
              marginBottom: 28,
            }}>
              {selectedObservation.lat.toFixed(4)}°N {Math.abs(selectedObservation.lng).toFixed(4)}°W
            </div>

            {/* Observation text or edit textarea */}
            {editingObservation ? (
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={composeMaxChars}
                style={{
                  fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
                  fontSize: 32, lineHeight: 1.3,
                  fontWeight: 500,
                  color: t.textColor,
                  background: "none",
                  border: "none", borderBottom: `1.5px solid ${t.textColor}`,
                  outline: "none",
                  width: "100%",
                  resize: "none",
                  cursor: "default",
                  padding: 0,
                  minHeight: 120,
                }}
              />
            ) : (
              <div style={{
                fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
                fontSize: 32, lineHeight: 1.3,
                fontWeight: 500,
                color: t.textColor,
              }}>
                {renderTextWithMentions(selectedObservation.text, t.textColor)}
                <span style={{ color: t.textColor, marginLeft: 7, fontSize: "0.6em", verticalAlign: "middle" }}>➽</span>
              </div>
            )}
          </div>

          {/* Share button */}
          <button
            onClick={() => {
              const text = selectedObservation.text.replace(/@\[([^\]]+)\]/g, "@$1")
              const shareText = `"${text}" — spotted in San Francisco\n\nDrop your own noticing at sotazine.com`
              if (navigator.share) {
                navigator.share({ text: shareText }).catch(() => {})
              } else {
                navigator.clipboard.writeText(shareText)
                const btn = document.getElementById("share-btn")
                if (btn) { btn.textContent = "COPIED"; setTimeout(() => { btn.textContent = "SHARE" }, 1500) }
              }
            }}
            id="share-btn"
            onMouseEnter={(e) => { e.currentTarget.style.background = "#000"; e.currentTarget.style.color = "#fff" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = t.textColor }}
            style={{
              width: "100%", height: 44,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "none",
              color: t.textColor,
              border: "none",
              borderTop: `1.5px solid ${t.textColor}`,
              cursor: "default",
              fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
              fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", fontWeight: 700,
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <svg width="0" height="0" style={{ position: "absolute" }}>
              <filter id="distress">
                <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="4" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.6" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </svg>
            <span style={{ filter: "url(#distress)", transform: "scaleX(0.85) skewX(-3deg)", display: "inline-block" }}>Share</span>
          </button>
        </div>
      )}

      {/* ===== COMPOSE PANEL (right sidebar) ===== */}
      {showCompose && (
        <div
          style={{
            position: "fixed",
            top: 40, right: 0, bottom: 40,
            width: 340,
            background: mode === "day" ? "#ffffff" : "#0c1020",
            borderLeft: `1.5px solid ${t.textColor}`,
            zIndex: 25,
            display: "flex", flexDirection: "column",
            overflow: "hidden",
            cursor: "default",
          }}
        >
          {/* Location search / coordinates */}
          <div style={{
            borderBottom: `1.5px solid ${t.textColor}`,
            position: "relative",
          }}>
            {dropCoords ? (
              <div style={{
                padding: "16px 24px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 9, letterSpacing: "0.1em",
                  color: t.textColor, opacity: 0.5,
                }}>
                  {`${dropCoords[1].toFixed(4)}°N ${Math.abs(dropCoords[0]).toFixed(4)}°W`}
                </div>
                <button
                  onClick={() => { setDropCoords(null); setLocationSearch(""); if (previewMarkerRef.current) { previewMarkerRef.current.remove(); previewMarkerRef.current = null } }}
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9, color: t.textColor, opacity: 0.3,
                    background: "none", border: "none", cursor: "pointer",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "1" }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "0.3" }}
                >
                  clear
                </button>
              </div>
            ) : (
              <div
                onMouseEnter={(e) => { e.currentTarget.style.background = mode === "day" ? "#f7f7f7" : "#1a2448" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none" }}
                style={{ display: "flex", alignItems: "center", padding: "0 0 0 20px", transition: "background 0.15s" }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
                  <circle cx="6" cy="6" r="4.5" stroke={t.textColor} strokeWidth="1.3" />
                  <line x1="9.5" y1="9.5" x2="13" y2="13" stroke={t.textColor} strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => {
                    const val = e.target.value
                    setLocationSearch(val)
                    fetchLocationResults(val)
                  }}
                onKeyDown={(e) => {
                  if (locationResults.length === 0) return
                  if (e.key === "ArrowDown") {
                    e.preventDefault()
                    setLocationSelectedIdx(i => Math.min(i + 1, locationResults.length - 1))
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault()
                    setLocationSelectedIdx(i => Math.max(i - 1, 0))
                  } else if (e.key === "Enter") {
                    e.preventDefault()
                    const place = locationResults[locationSelectedIdx]
                    if (place) {
                      retrieveAndLocate(place.mapbox_id)
                      setLocationSearch(place.name)
                      setLocationResults([])
                    }
                  } else if (e.key === "Escape") {
                    setLocationResults([])
                  }
                }}
                placeholder="set pin location"
                style={{
                  width: "100%",
                  padding: "14px 12px",
                  fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif", fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: t.textColor,
                  background: "none",
                  border: "none",
                  outline: "none",
                  cursor: "default",
                  flex: 1,
                }}
              />
              </div>
            )}

            {/* Location search dropdown */}
            {locationResults.length > 0 && (
              <div style={{
                position: "absolute",
                left: 0, right: 0, top: "100%",
                background: mode === "day" ? "#ffffff" : "#0c1020",
                borderBottom: `1.5px solid ${t.textColor}`,
                zIndex: 30,
              }}>
                {locationResults.map((r, i) => (
                  <button
                    key={i}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      retrieveAndLocate(r.mapbox_id)
                      setLocationSearch(r.name)
                      setLocationResults([])
                    }}
                    onMouseEnter={() => setLocationSelectedIdx(i)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 24px",
                      background: i === locationSelectedIdx ? (mode === "day" ? "#f7f7f7" : "#1a2448") : "none",
                      border: "none",
                      borderBottom: `1px solid ${mode === "day" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}`,
                      cursor: "default",
                      transition: "background 0.1s",
                    }}
                  >
                    <div style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#FF2A00",
                      opacity: i === locationSelectedIdx ? 1 : 0,
                      flexShrink: 0,
                      transition: "opacity 0.15s",
                    }} />
                    <div>
                      <div style={{
                        fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
                        fontSize: 13, fontWeight: 700,
                        color: t.textColor, lineHeight: 1.2,
                      }}>
                        {r.name}
                      </div>
                      {r.address && <div style={{
                        fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
                        fontSize: 11, fontWeight: 400,
                        color: t.textColor, opacity: 0.4,
                        marginTop: 2, lineHeight: 1.4,
                      }}>
                        {r.address}
                      </div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Textarea with mention highlight overlay */}
          <div style={{ flex: 1, padding: "16px 24px 0", display: "flex", flexDirection: "column", position: "relative" }}>
            {/* Section label */}
            <div style={{
              fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif", fontWeight: 700,
              fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase",
              color: t.textColor, opacity: 0.25,
              transform: "scaleX(0.8)", transformOrigin: "center",
              marginBottom: 12,
              textAlign: "center",
            }}>
              Noticings
            </div>
            {/* Mirror overlay — renders confirmed @mentions in accent color */}
            {composeText && (
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 46, left: 24, right: 24,
                  fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
                  fontSize: 32, lineHeight: 1.3,
                  fontWeight: 500,
                  color: "transparent",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              >
                {(() => {
                  if (confirmedMentions.length === 0) return null
                  const parts: { text: string; isMention: boolean }[] = []
                  let remaining = composeText
                  while (remaining.length > 0) {
                    let earliest = -1, earliestMention = ""
                    for (const m of confirmedMentions) {
                      const idx = remaining.indexOf(m)
                      if (idx !== -1 && (earliest === -1 || idx < earliest)) {
                        earliest = idx; earliestMention = m
                      }
                    }
                    if (earliest === -1) { parts.push({ text: remaining, isMention: false }); break }
                    if (earliest > 0) parts.push({ text: remaining.slice(0, earliest), isMention: false })
                    parts.push({ text: earliestMention, isMention: true })
                    remaining = remaining.slice(earliest + earliestMention.length)
                  }
                  return parts.map((p, i) =>
                    p.isMention ? (
                      <span key={i} style={{
                        color: "#FF2A00",
                        textDecoration: "underline",
                        textDecorationColor: "#FF2A00",
                        textDecorationThickness: "1.5px",
                        textUnderlineOffset: "1px",
                      }}>{p.text}</span>
                    ) : <span key={i} style={{ color: t.textColor }}>{p.text}</span>
                  )
                })()}
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={composeText}
              onChange={(e) => {
                const val = e.target.value
                if (val.length > composeMaxChars) return
                setComposeText(val)

                const cursor = e.target.selectionStart
                const before = val.slice(0, cursor)
                // Find last @ that isn't part of an existing @[...] mention
                let atIdx = -1
                for (let i = before.length - 1; i >= 0; i--) {
                  if (before[i] === "@" && before[i + 1] !== "[") {
                    if (i === 0 || before[i - 1] === " " || before[i - 1] === "\n") { atIdx = i; break }
                  }
                }
                if (atIdx !== -1) {
                  const query = before.slice(atIdx + 1)
                  if (!query.includes(" ") || query.length <= 30) {
                    setMentionActive(true)
                    setMentionStartIdx(atIdx)
                    setMentionQuery(query)
                    fetchMentions(query)
                    return
                  }
                }
                setMentionActive(false)
                setMentionResults([])
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (!mentionActive || mentionResults.length === 0)) {
                  e.preventDefault()
                  submitObservation()
                  return
                }
                if (!mentionActive || mentionResults.length === 0) return
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  setMentionSelectedIdx(i => Math.min(i + 1, mentionResults.length - 1))
                } else if (e.key === "ArrowUp") {
                  e.preventDefault()
                  setMentionSelectedIdx(i => Math.max(i - 1, 0))
                } else if (e.key === "Enter") {
                  e.preventDefault()
                  const place = mentionResults[mentionSelectedIdx]
                  if (place) {
                    const mentionText = `@[${place.name}]`
                    const before = composeText.slice(0, mentionStartIdx)
                    const after = composeText.slice(mentionStartIdx + 1 + mentionQuery.length)
                    const inserted = `${mentionText}${after.startsWith(" ") ? "" : " "}`
                    const newText = before + inserted + after
                    if (newText.length <= composeMaxChars) {
                      setComposeText(newText)
                      setConfirmedMentions(prev => prev.includes(mentionText) ? prev : [...prev, mentionText])
                    }
                    retrieveAndLocate(place.mapbox_id)
                    setMentionActive(false)
                    setMentionResults([])
                  }
                } else if (e.key === "Escape") {
                  setMentionActive(false)
                  setMentionResults([])
                }
              }}
              placeholder="Tell us a San Francisco story"
              maxLength={composeMaxChars}
              style={{
                fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
                fontSize: 32, lineHeight: 1.3,
                fontWeight: 500,
                color: confirmedMentions.length > 0 ? "transparent" : t.textColor,
                caretColor: t.textColor,
                background: "none",
                border: "none",
                outline: "none",
                width: "100%",
                flex: 1,
                resize: "none",
                cursor: "default",
                padding: 0,
                position: "relative",
                zIndex: 1,
              }}
            />

            {/* @ mention dropdown */}
            {mentionActive && mentionResults.length > 0 && (
              <div style={{
                position: "absolute",
                left: 0, right: 0, bottom: 60,
                background: mode === "day" ? "#ffffff" : "#0c1020",
                borderTop: `1.5px solid ${t.textColor}`,
                zIndex: 30,
              }}>
                {mentionResults.map((r, i) => (
                  <button
                    key={i}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      const mentionText = `@[${r.name}]`
                      const before = composeText.slice(0, mentionStartIdx)
                      const after = composeText.slice(mentionStartIdx + 1 + mentionQuery.length)
                      const inserted = `${mentionText}${after.startsWith(" ") ? "" : " "}`
                      const newText = before + inserted + after
                      if (newText.length <= composeMaxChars) {
                        setComposeText(newText)
                        setConfirmedMentions(prev => prev.includes(mentionText) ? prev : [...prev, mentionText])
                      }
                      retrieveAndLocate(r.mapbox_id)
                      setMentionActive(false)
                      setMentionResults([])
                    }}
                    onMouseEnter={() => setMentionSelectedIdx(i)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 0,
                      width: "100%",
                      textAlign: "left",
                      padding: "14px 20px",
                      background: i === mentionSelectedIdx ? (mode === "day" ? "#f7f7f7" : "#1a2448") : "none",
                      border: "none",
                      borderBottom: `1px solid ${mode === "day" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}`,
                      cursor: "default",
                      transition: "background 0.1s",
                    }}
                  >
                    <div style={{
                      width: 20, flexShrink: 0, paddingTop: 4,
                    }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "#FF2A00",
                        opacity: i === mentionSelectedIdx ? 1 : 0,
                        transition: "opacity 0.15s",
                      }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
                        fontSize: 14, fontWeight: 700,
                        color: t.textColor,
                        lineHeight: 1.2,
                      }}>
                        {r.name}
                      </div>
                      {r.address && <div style={{
                        fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
                        fontSize: 11, fontWeight: 400,
                        color: t.textColor,
                        opacity: 0.4,
                        marginTop: 3,
                        lineHeight: 1.4,
                      }}>
                        {r.address}
                      </div>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Character counter */}
            <div style={{
              fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif", fontWeight: 700,
              fontSize: 28,
              color: t.textColor,
              opacity: composeMaxChars - composeText.length < 20 ? 0.3 : 0.06,
              textAlign: "right",
              padding: "8px 0 16px",
              transition: "opacity 0.3s",
              transform: "scaleX(0.75)",
              transformOrigin: "right",
            }}>
              {composeMaxChars - composeText.length}
            </div>

            {/* Stamp — fades when typing */}
            <div style={{
              marginTop: "auto",
              display: "flex", justifyContent: "center",
              padding: "0 0 16px",
              opacity: composeText ? 0 : 0.15,
              transition: "opacity 0.5s",
              pointerEvents: "none",
            }}>
              <img
                src="/stamp-sota.png"
                alt=""
                style={{ width: 140, height: "auto" }}
              />
            </div>
          </div>

          {/* Drop button */}
          <button
            onClick={submitObservation}
            disabled={!composeText.trim()}
            style={{
              width: "100%",
              height: 44,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: composeText.trim() ? (mode === "day" ? "#000000" : "#ffffff") : "rgba(0,0,0,0.05)",
              color: composeText.trim() ? (mode === "day" ? "#ffffff" : "#0e1428") : "rgba(0,0,0,0.2)",
              border: "none",
              borderTop: `1.5px solid ${t.textColor}`,
              fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif", fontWeight: 700,
              fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase",
              cursor: "default",
              transition: "all 0.2s",
            }}
          >
            Drop Pin
            {composeText.trim() && <span style={{ opacity: 0.4, fontSize: 8, letterSpacing: "0.15em", marginLeft: 8 }}>&#x23CE; Enter</span>}
          </button>
        </div>
      )}

      {/* Confirmation message */}
      {showConfirmation && (
        <div
          className="fixed z-40"
          style={{
            top: 40, right: 0, bottom: 40, width: 340,
            background: mode === "day" ? "#ffffff" : "#0e1428",
            borderLeft: `1.5px solid ${t.textColor}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.15s ease",
          }}
        >
          <div style={{ textAlign: "center", padding: 28 }}>
            <div style={{
              fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif", fontWeight: 700,
              fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase",
              transform: "scaleX(0.72)",
              color: t.textColor, marginBottom: 8,
            }}>
              Dropped
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9, letterSpacing: "0.1em",
              color: t.textColor, opacity: 0.4,
            }}>
              Your act of attention is on the map.
            </div>
          </div>
        </div>
      )}

      {/* ===== PREV / NEXT BAR (above bottom nav) ===== */}
      {observations.length > 0 && (
        <div
          className="fixed z-30"
          style={{
            bottom: 40,
            left: 0,
            right: (showCompose && !closingCompose) || (selectedObservation && !showCompose) ? 340 : 0,
            display: "flex",
          }}
        >
          <button
            onClick={() => goToObservation("prev")}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#000"; (e.currentTarget.querySelector("img") as HTMLImageElement).style.filter = "invert(1)" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = mode === "day" ? "#ffffff" : "#0c1020"; (e.currentTarget.querySelector("img") as HTMLImageElement).style.filter = "none" }}
            style={{
              flex: 1, height: 44,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: mode === "day" ? "#ffffff" : "#0c1020",
              border: "none",
              borderTop: `1.5px solid ${t.textColor}`,
              borderRight: `0.5px solid ${t.textColor}`,
              cursor: "default",
              transition: "background 0.15s",
            }}
          >
            <img src="/left-hand.svg" alt="Previous" style={{ height: 20, transition: "filter 0.15s" }} />
          </button>
          <button
            onClick={goToRandomObservation}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#000"; (e.currentTarget.querySelector("img") as HTMLImageElement).style.filter = "invert(1)" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = mode === "day" ? "#ffffff" : "#0c1020"; (e.currentTarget.querySelector("img") as HTMLImageElement).style.filter = "none" }}
            style={{
              flex: 1, height: 44,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: mode === "day" ? "#ffffff" : "#0c1020",
              border: "none",
              borderTop: `1.5px solid ${t.textColor}`,
              borderLeft: `0.5px solid ${t.textColor}`,
              borderRight: `0.5px solid ${t.textColor}`,
              cursor: "default",
              transition: "background 0.15s",
            }}
          >
            <img src="/random.svg" alt="Random" style={{ height: 20, transition: "filter 0.15s" }} />
          </button>
          <button
            onClick={() => goToObservation("next")}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#000"; (e.currentTarget.querySelector("img") as HTMLImageElement).style.filter = "invert(1)" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = mode === "day" ? "#ffffff" : "#0c1020"; (e.currentTarget.querySelector("img") as HTMLImageElement).style.filter = "none" }}
            style={{
              flex: 1, height: 44,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: mode === "day" ? "#ffffff" : "#0c1020",
              border: "none",
              borderTop: `1.5px solid ${t.textColor}`,
              borderLeft: `0.5px solid ${t.textColor}`,
              cursor: "default",
              transition: "background 0.15s",
            }}
          >
            <img src="/right-hand.svg" alt="Next" style={{ height: 20, transition: "filter 0.15s" }} />
          </button>
        </div>
      )}

      {/* ===== RSVP POSTERS (bottom-left) ===== */}
      <a
        href="https://partiful.com/e/rUUpQAXN3eyR0TGtjCCA"
        target="_blank"
        rel="noopener"
        style={{
          position: "fixed",
          bottom: 88, left: 12,
          zIndex: 20,
          display: "flex", gap: 4,
          textDecoration: "none",
        }}
      >
        {[
          { src: "/rsvp-yellow.png", label: "RSVP LONG" },
          { src: "/rsvp-pink.png", label: "RSVP LIVE" },
          { src: "/rsvp-red.png", label: "RSVP SF" },
        ].map((poster, i) => (
          <img
            key={i}
            src={poster.src}
            alt={poster.label}
            style={{
              width: 56, height: "auto",
              display: "block",
            }}
          />
        ))}
      </a>

      {/* ===== BOTTOM BANNER BAR ===== */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between"
        style={{
          height: 40,
          background: mode === "day" ? "#ffffff" : "#0c1020",
          borderTop: `1.5px solid ${t.textColor}`,
          fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif", fontWeight: 700,
          fontSize: 10,
          letterSpacing: "0.15em",
          color: t.textColor,
          transition: "all 0.6s ease",
        }}
      >
        {/* Left: Edition */}
        <span
          aria-hidden="true"
          data-nosnippet
          style={{
            transform: "scaleX(0.75)", transformOrigin: "left",
            display: "inline-block", pointerEvents: "none",
            paddingLeft: 16,
            userSelect: "none",
          }}
        >
          EDITION 01 — 20&#8203;26
        </span>

        {/* Center: Live coordinates */}
        <div className="hidden md:block" style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translateX(-50%) translateY(-50%)",
          fontFamily: "'Space Mono', monospace",
          fontSize: 9, letterSpacing: "0.1em",
          color: t.textColor, opacity: 1,
          whiteSpace: "nowrap",
        }}>
          {coords.lat.toFixed(4)}°N {Math.abs(coords.lng).toFixed(4)}°W &nbsp;&nbsp; ALT {Math.round(Math.pow(2, 20 - altitude.zoom) * 0.5)}ft
        </div>

        {/* Right: SOTA text + day/night toggle */}
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <span
            aria-hidden="true"
            data-nosnippet
            style={{
              letterSpacing: "0.25em", textTransform: "uppercase",
              transform: "scaleX(0.75)", transformOrigin: "right",
              display: "inline-block", pointerEvents: "none",
              paddingRight: 12,
              userSelect: "none",
            }}
          >
            State of the Art
          </span>
          <button
            onClick={() => setMode(mode === "day" ? "night" : "day")}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.5" }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1" }}
            style={{
              width: 40, height: 40,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "none",
              border: "none", borderLeft: `1.5px solid ${t.textColor}`,
              cursor: "default",
              fontSize: 16,
              color: t.textColor,
              transition: "background 0.15s ease, color 0.15s ease",
            }}
          >
            {mode === "day" ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M10.5 7a5 5 0 01-7.3 4.4 6 6 0 004.4-7.3A5 5 0 0110.5 7z" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.2" />
                <line x1="7" y1="0.5" x2="7" y2="2.5" stroke="currentColor" strokeWidth="1.2" />
                <line x1="7" y1="11.5" x2="7" y2="13.5" stroke="currentColor" strokeWidth="1.2" />
                <line x1="0.5" y1="7" x2="2.5" y2="7" stroke="currentColor" strokeWidth="1.2" />
                <line x1="11.5" y1="7" x2="13.5" y2="7" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
