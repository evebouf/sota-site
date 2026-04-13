// Xerox Map — standalone page for the xeroxed/photocopied map aesthetic
// White ground, black ink lines, halftone dots, crumpled paper texture

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { PaperTexture } from "@paper-design/shaders-react"

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

function useRedCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [angle, setAngle] = useState(0)
  const prevPos = useRef({ x: -100, y: -100 })
  const angleRef = useRef(0)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - prevPos.current.x
      const dy = e.clientY - prevPos.current.y
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        const target = Math.atan2(dy, dx) * (180 / Math.PI)
        let diff = target - angleRef.current
        diff = ((diff + 180) % 360 + 360) % 360 - 180
        angleRef.current += diff
        setAngle(angleRef.current)
        prevPos.current = { x: e.clientX, y: e.clientY }
      }
      setPos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])
  return { ...pos, angle }
}

const landmarks: { name: string; coords: [number, number]; photo?: string }[] = [
  { name: "Transamerica Pyramid", coords: [-122.4027, 37.7952], photo: "/photos/transamerica.jpeg" },
  { name: "Fort Mason", coords: [-122.4316, 37.8035], photo: "/photos/fort-mason.jpeg" },
  { name: "Lombard Street", coords: [-122.4186, 37.8021], photo: "/photos/lombard.jpeg" },
  { name: "William Stout Architectural Books", coords: [-122.4028, 37.7962] },
  { name: "North Beach Psychic", coords: [-122.4084, 37.7999] },
  { name: "Coffee Roastery", coords: [-122.4400, 37.8005] },
  { name: "Alcatraz View", coords: [-122.4120, 37.8060], photo: "/photos/alcatraz-view.jpeg" },
  { name: "SOMA", coords: [-122.3986, 37.7785] },
  { name: "Ferry Building", coords: [-122.3937, 37.7956] },
  { name: "Coit Tower", coords: [-122.4058, 37.8024], photo: "/photos/coit-tower.jpeg" },
  { name: "Mission Dolores", coords: [-122.4270, 37.7600] },
  { name: "Fort Point View Point", coords: [-122.4734, 37.8090], photo: "/photos/fort-point.jpeg" },
  { name: "Legion of Honor", coords: [-122.4997, 37.7846] },
  { name: "Golden Gate Bridge", coords: [-122.4783, 37.8199] },
]

export default function XeroxMap() {
  useEffect(() => { document.title = "Xerox — State of the Art" }, [])
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [ready, setReady] = useState(false)
  const cursor = useRedCursor()

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return
    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-122.405609, 37.791686],
      zoom: 14,
      pitch: 0,
      bearing: 0,
      antialias: true,
      interactive: true,
      minZoom: 11,
      maxZoom: 16,
      pitchWithRotate: false,
      maxBounds: [[-122.55, 37.70], [-122.30, 37.85]],
    })
    mapRef.current = m

    m.on("style.load", () => {
      // Strip labels
      for (const layer of m.getStyle().layers || []) {
        if (layer.type === "symbol") m.removeLayer(layer.id)
      }

      // Xerox style: white ground, black ink
      for (const layer of m.getStyle().layers || []) {
        if (layer.type === "fill") {
          if (layer["source-layer"] === "water") {
            m.setPaintProperty(layer.id, "fill-color", "#d0d0d0")
            m.setPaintProperty(layer.id, "fill-opacity", 1)
          } else {
            m.setPaintProperty(layer.id, "fill-color", "#f8f8f8")
          }
        }
        if (layer.type === "line") {
          m.setPaintProperty(layer.id, "line-color", "#000000")
          m.setPaintProperty(layer.id, "line-opacity", 0.9)
          try { m.setPaintProperty(layer.id, "line-width", 0.8) } catch (_) {}
        }
      }

      // Fog — white wash
      m.setFog({
        range: [-2, 2],
        color: "#ffffff",
        "horizon-blend": 1,
        "high-color": "#ffffff",
        "space-color": "#ffffff",
        "star-intensity": 0,
      })

      // Buildings — barely there
      m.addLayer({
        id: "buildings-3d",
        source: "composite",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 1,
        paint: {
          "fill-extrusion-color": "#e8e8e8",
          "fill-extrusion-height": 0,
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.3,
        },
      })

      // Golden Gate — red ink
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
        paint: { "line-color": "#FF2A00", "line-width": 2, "line-opacity": 1 },
      })

      setReady(true)
    })

    // Markers
    for (const lm of landmarks) {
      const el = document.createElement("div")
      if (lm.photo) {
        el.style.cssText = `width: 70px; height: 70px; cursor: none;`
        const inner = document.createElement("div")
        inner.style.cssText = `
          width: 100%; height: 100%; border: 1px solid rgba(0,0,0,0.2);
          overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15); transform-origin: center center;
          filter: grayscale(0.6) contrast(1.3);
        `
        inner.innerHTML = `<img src="${lm.photo}" style="width:100%;height:100%;object-fit:cover;" />`
        inner.onmouseenter = () => { inner.style.transform = "scale(1.8)"; inner.style.boxShadow = "0 4px 20px rgba(0,0,0,0.25)" }
        inner.onmouseleave = () => { inner.style.transform = "scale(1)"; inner.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)" }
        el.appendChild(inner)
      } else {
        el.style.cssText = `
          width: 10px; height: 10px; border-radius: 50%;
          background: #FF2A00; box-shadow: 0 0 6px rgba(255,42,0,0.3);
          border: 1.5px solid rgba(0,0,0,0.2);
        `
      }
      new mapboxgl.Marker({ element: el })
        .setLngLat(lm.coords)
        .addTo(m)
    }

    return () => { m.remove(); mapRef.current = null }
  }, [])

  // Body style
  useEffect(() => {
    document.body.style.setProperty("--grain-opacity", "0")
    document.body.style.backgroundColor = "#f8f8f8"
    return () => {
      document.body.style.removeProperty("--grain-opacity")
      document.body.style.backgroundColor = ""
    }
  }, [])

  return (
    <div
      className="w-screen overflow-hidden relative"
      style={{ fontFamily: "'Space Mono', monospace", height: "100dvh", background: "#f8f8f8", cursor: "none" }}
    >
      {/* Map */}
      <div className="absolute inset-0 z-0">
        <div
          ref={mapContainer}
          className="w-full h-full"
          style={{ filter: "contrast(2.5) brightness(1.5) saturate(0)" }}
        />
      </div>

      {/* Grain — heavy, like a photocopy */}
      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          mixBlendMode: "multiply",
          opacity: 1,
        }}
      />

      {/* Halftone dot screen */}
      <div
        className="absolute inset-0 pointer-events-none z-[6]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px)`,
          backgroundSize: "4px 4px",
          mixBlendMode: "multiply",
          opacity: 0.5,
        }}
      />

      {/* Paper shader — crumpled photocopy texture */}
      <div
        className="absolute inset-0 pointer-events-none z-[7]"
        style={{ mixBlendMode: "multiply", opacity: 0.6 }}
      >
        <PaperTexture
          width="100%"
          height="100%"
          colorBack="#f0ece0"
          colorFront="#a0a0a0"
          contrast={0.5}
          roughness={0.8}
          fiber={0.8}
          fiberSize={0.6}
          crumples={0.4}
          crumpleSize={0.3}
          folds={0.15}
          foldCount={6}
          drops={0.6}
          fade={0.3}
          seed={12}
          scale={0.3}
          fit="cover"
        />
      </div>

      {/* SVG displacement warp */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="xerox-displace" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="42" result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Red cursor */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-50 hidden md:block"
        style={{ transform: `translate(${cursor.x}px, ${cursor.y - 12}px) rotate(${cursor.angle}deg)`, color: "#FF2A00", fontSize: "24px", lineHeight: 1 }}
        >➽</div>

      {/* Top-left legend */}
      <div
        className="absolute top-[4vh] left-[4vw] z-10 pointer-events-none transition-opacity duration-1000"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <div
          className="uppercase"
          style={{ fontSize: "clamp(8px, 0.7vw, 11px)", letterSpacing: "0.15em", lineHeight: 1.8, color: "rgba(0,0,0,0.3)" }}
        >
          37.7749° N, 122.4194° W<br />
          Edition 01 — State of the Art<br />
          April 2026
        </div>
      </div>

      {/* Bottom-left back link */}
      <div className="absolute bottom-[4vh] left-[4vw] z-10">
        <a
          href="/d17"
          className="uppercase transition-colors"
          style={{
            fontSize: "clamp(8px, 0.7vw, 11px)",
            letterSpacing: "0.12em",
            textDecoration: "none",
            color: "rgba(0,0,0,0.25)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#FF2A00")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,0,0,0.25)")}
        >
          ← Back
        </a>
      </div>

      {/* Hide default cursor on map canvas */}
      <style>{`
        .mapboxgl-canvas-container, .mapboxgl-canvas-container canvas,
        .mapboxgl-canvas-container.mapboxgl-interactive { cursor: none !important; }
      `}</style>
    </div>
  )
}
