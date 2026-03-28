// Neon Map — wireframe buildings, outlined footprints, no solid fills

import { useEffect, useRef, useState } from "react"
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

export default function NeonMap() {
  useEffect(() => { document.title = "Neon — State of the Art" }, [])
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
      zoom: 15,
      pitch: 70,
      bearing: 45,
      antialias: true,
      interactive: true,
      minZoom: 11,
      maxZoom: 18,
      maxBounds: [[-122.55, 37.70], [-122.30, 37.85]],
    })
    mapRef.current = m

    m.on("style.load", () => {
      // Strip labels
      for (const layer of m.getStyle().layers || []) {
        if (layer.type === "symbol") m.removeLayer(layer.id)
      }

      // Terrain
      m.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      })
      m.setTerrain({ source: "mapbox-dem", exaggeration: 3 })

      // Neon style: deep void ground, glowing lines
      for (const layer of m.getStyle().layers || []) {
        if (layer.type === "fill") {
          if (layer["source-layer"] === "water") {
            m.setPaintProperty(layer.id, "fill-color", "#000515")
            m.setPaintProperty(layer.id, "fill-opacity", 1)
          } else {
            m.setPaintProperty(layer.id, "fill-color", "#06000f")
          }
        }
        if (layer.type === "line") {
          m.setPaintProperty(layer.id, "line-color", "#00ffcc")
          m.setPaintProperty(layer.id, "line-opacity", 0.6)
          try { m.setPaintProperty(layer.id, "line-width", 2) } catch (_) {}
        }
      }

      // Fog — deep space
      m.setFog({
        range: [0.5, 4],
        color: "#08001a",
        "horizon-blend": 0.1,
        "high-color": "#08001a",
        "space-color": "#08001a",
        "star-intensity": 0.8,
      })

      // Building footprints — transparent fill with glowing outline
      m.addLayer({
        id: "building-outlines",
        source: "composite",
        "source-layer": "building",
        type: "fill",
        minzoom: 13,
        paint: {
          "fill-color": "transparent",
          "fill-outline-color": "#00ffcc",
          "fill-opacity": [
            "interpolate", ["linear"], ["zoom"],
            13, 0.3,
            15, 0.6,
            17, 0.8,
          ],
        },
      })

      // Second pass: tall buildings get a pink fill-outline
      m.addLayer({
        id: "building-outlines-tall",
        source: "composite",
        "source-layer": "building",
        type: "fill",
        minzoom: 14,
        filter: [">=", ["get", "height"], 30],
        paint: {
          "fill-color": "rgba(255,0,170,0.05)",
          "fill-outline-color": "#ff00aa",
          "fill-opacity": 0.9,
        },
      })

      // 3D wireframe effect: outer shell (slightly larger, colored)
      m.addLayer({
        id: "building-extrusion-outer",
        source: "composite",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 13,
        paint: {
          "fill-extrusion-color": "#00ffcc",
          "fill-extrusion-height": ["*", ["get", "height"], 3],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.15,
        },
      })

      // Inner core (dark, slightly shorter — contrast creates visible edges)
      m.addLayer({
        id: "building-extrusion-inner",
        source: "composite",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 13,
        paint: {
          "fill-extrusion-color": "#06000f",
          "fill-extrusion-height": ["*", ["coalesce", ["get", "height"], 5], 2.95],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.9,
        },
      })

      // Golden Gate — hot pink
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
        paint: { "line-color": "#ff00aa", "line-width": 6, "line-opacity": 1 },
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
          width: 100%; height: 100%; border: 1px solid rgba(0,255,204,0.3);
          overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 0 15px rgba(0,255,204,0.15); transform-origin: center center;
        `
        inner.innerHTML = `<img src="${lm.photo}" style="width:100%;height:100%;object-fit:cover;filter:saturate(2) contrast(1.2) hue-rotate(20deg);" />`
        inner.onmouseenter = () => { inner.style.transform = "scale(1.8)"; inner.style.boxShadow = "0 0 30px rgba(0,255,204,0.3)" }
        inner.onmouseleave = () => { inner.style.transform = "scale(1)"; inner.style.boxShadow = "0 0 15px rgba(0,255,204,0.15)" }
        el.appendChild(inner)
      } else {
        el.style.cssText = `
          width: 12px; height: 12px; border-radius: 50%;
          background: #ff00aa; box-shadow: 0 0 12px rgba(255,0,170,0.5), 0 0 24px rgba(255,0,170,0.2);
          border: 1.5px solid rgba(0,255,204,0.4);
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
    document.body.style.backgroundColor = "#06000f"
    return () => {
      document.body.style.removeProperty("--grain-opacity")
      document.body.style.backgroundColor = ""
    }
  }, [])

  return (
    <div
      className="w-screen overflow-hidden relative"
      style={{ fontFamily: "'Space Mono', monospace", height: "100dvh", background: "#06000f", cursor: "none" }}
    >
      {/* Map */}
      <div className="absolute inset-0 z-0">
        <div
          ref={mapContainer}
          className="w-full h-full"
          style={{ filter: "contrast(1.5) brightness(1.1) saturate(3)" }}
        />
      </div>

      {/* Subtle grain */}
      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          mixBlendMode: "overlay",
          opacity: 0.1,
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[6]"
        style={{
          background: "radial-gradient(ellipse at center, transparent 25%, rgba(6,0,15,0.45) 60%, rgba(6,0,15,0.6) 100%)",
        }}
      />

      {/* Red cursor */}
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />

      {/* Top-left legend */}
      <div
        className="absolute top-[4vh] left-[4vw] z-10 pointer-events-none transition-opacity duration-1000"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <div
          className="uppercase"
          style={{ fontSize: "clamp(8px, 0.7vw, 11px)", letterSpacing: "0.15em", lineHeight: 1.8, color: "rgba(0,255,204,0.3)" }}
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
            color: "rgba(0,255,204,0.25)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ff00aa")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(0,255,204,0.25)")}
        >
          ← Back
        </a>
      </div>

      {/* Hide default cursor */}
      <style>{`
        .mapboxgl-canvas-container, .mapboxgl-canvas-container canvas,
        .mapboxgl-canvas-container.mapboxgl-interactive { cursor: none !important; }
      `}</style>
    </div>
  )
}
