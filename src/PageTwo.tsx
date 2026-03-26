import { useState, useEffect, useRef, useCallback } from "react"
import { Link } from "react-router-dom"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const inter = { fontFamily: "'Inter', sans-serif" }

const articles = [
  { ex: "01", title: "Editor's Note: The City of Tomorrow", author: "Sanjana Friedman", teaser: "The state of the art" },
  { ex: "02", title: "San Francisco Is Not an Island", author: "Jan Sramek", teaser: "On the NorCal Megaregion" },
  { ex: "03", title: "The Ferlinghetti Method", author: "Olivia Marotte", teaser: "How to make a scene" },
  { ex: "04", title: "Grecofuturism: The New Aesthetic", author: "Pablo Peniche", teaser: "Marble, sandstone, metal" },
  { ex: "05", title: "The Future of Getting Around", author: "Evan Zimmerman", teaser: "Fully autonomous transit" },
  { ex: "06", title: "Alcatraz 2XXX", author: "Sanjana Friedman", teaser: "Dispatch from the future" },
  { ex: "07", title: "The Waterfront", author: "", teaser: "A polite suggestion" },
  { ex: "08", title: "Against Progress", author: "Wolf Tivy", teaser: "Counter-entropic politics" },
]

function PageTwo() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 })
  const [hoveredArticle, setHoveredArticle] = useState<number | null>(null)
  const [mode, setMode] = useState<"content" | "map">("content")
  const [peelHovered, setPeelHovered] = useState(false)
  const [closePeelHovered, setClosePeelHovered] = useState(false)
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  const peelSize = mode === "map" ? 4000 : peelHovered ? 200 : 100
  const closePeelSize = closePeelHovered ? 200 : 140

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape" && mode === "map") toggleMode() }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [mode])

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-122.405609, 37.791686],
      zoom: 13, pitch: 45, bearing: -17,
      antialias: true, interactive: false, minZoom: 11,
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
          else { m.setPaintProperty(layer.id, "fill-color", "#111111") }
        }
        if (layer.type === "line") { m.setPaintProperty(layer.id, "line-color", "#FF2A00"); m.setPaintProperty(layer.id, "line-opacity", 0.4) }
      }

      m.addLayer({ id: "golden-gate-bridge", source: "composite", "source-layer": "road", type: "line",
        filter: ["any", ["==", ["get", "name"], "Golden Gate Bridge"], ["==", ["get", "name_en"], "Golden Gate Bridge"]],
        paint: { "line-color": "#FF2A00", "line-width": 4, "line-opacity": 1 },
      })
      m.addLayer({ id: "buildings-3d", source: "composite", "source-layer": "building", type: "fill-extrusion", minzoom: 1,
        paint: { "fill-extrusion-color": "#1a1a1a", "fill-extrusion-height": ["get", "height"], "fill-extrusion-base": ["get", "min_height"], "fill-extrusion-opacity": 0.7 },
      })
    })

    const container = mapContainer.current
    const hideControls = () => { container?.querySelectorAll(".mapboxgl-ctrl").forEach((el) => { (el as HTMLElement).style.display = "none" }) }
    mapRef.current.on("style.load", hideControls)
    mapRef.current.on("load", hideControls)
  }, [])

  const toggleMode = useCallback(() => {
    const next = mode === "content" ? "map" : "content"
    setMode(next)
    setPeelHovered(false)
    if (mapRef.current) {
      const actions = ["scrollZoom", "boxZoom", "dragRotate", "dragPan", "keyboard", "doubleClickZoom", "touchZoomRotate"] as const
      actions.forEach((a) => { if (next === "map") mapRef.current?.[a].enable(); else mapRef.current?.[a].disable() })
      setTimeout(() => mapRef.current?.resize(), 50)
      setTimeout(() => mapRef.current?.resize(), 400)
      setTimeout(() => mapRef.current?.resize(), 750)
    }
  }, [mode])

  return (
    <div className="w-full h-screen relative overflow-hidden flex bg-[#0a0a0a]" style={inter}>

      {/* Sidebar */}
      <div className="w-[40px] h-full shrink-0 border-r border-white/[0.06] flex flex-col items-center justify-between py-[3vh] relative z-30">
        <Link to="/" className="no-underline text-[8px] tracking-[0.25em] uppercase text-white/50 hover:text-white transition-colors duration-200 font-light"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Home</Link>
        <button onClick={toggleMode}
          className={`bg-transparent border-none text-[8px] tracking-[0.25em] uppercase transition-colors duration-200 font-light ${mode === "map" ? "text-[#FF2A00]" : "text-white/50 hover:text-[#FF2A00]"}`}
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", cursor: "none" }}>
          {mode === "map" ? "Contents" : "Map"}
        </button>
        <div className="text-[8px] tracking-[0.25em] uppercase text-white/30 font-light"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>SOTA</div>
      </div>

      {/* Map — fullscreen behind content */}
      <div className="absolute left-[40px] right-0 top-0 bottom-0 z-10">
        <div ref={mapContainer} className="w-full h-full" style={{ pointerEvents: mode === "map" ? "auto" : "none" }} />

        {/* Map top label */}
        <div className={`absolute top-[3vh] left-[2.5vw] z-10 transition-all duration-500 ${mode === "map" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}`}>
          <div className="text-[clamp(10px,0.8vw,13px)] tracking-[0.12em] uppercase text-white/50 font-light">San Francisco</div>
        </div>

        {/* Bottom-left corner crop — inverse peel to go back */}
        {mode === "map" && (
          <div
            className="absolute bottom-0 left-0 z-20 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ width: `${closePeelSize}px`, height: `${closePeelSize}px`, cursor: "none" }}
            onClick={toggleMode}
            onMouseEnter={() => setClosePeelHovered(true)}
            onMouseLeave={() => setClosePeelHovered(false)}
          >
            {/* Dark triangle showing content page underneath */}
            <div className="absolute inset-0 bg-[#0a0a0a]" style={{ clipPath: "polygon(0 100%, 0 0, 100% 100%)" }} />
            {/* Red fold */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: "linear-gradient(45deg, #FF2A00 0%, #cc2200 50%, transparent 50%)",
              boxShadow: "3px -3px 12px rgba(0,0,0,0.5)",
            }} />
          </div>
        )}
      </div>

      {/* Content layer — page peel */}
      <div
        className="absolute left-[40px] right-0 top-0 bottom-0 z-20 flex transition-[clip-path] duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          clipPath: `polygon(0 0, calc(100% - ${peelSize}px) 0, 100% ${peelSize}px, 100% 100%, 0 100%)`,
          pointerEvents: mode === "map" ? "none" : "auto",
        }}
      >
        <div className="flex-1 h-full relative bg-[#0a0a0a] flex items-center justify-center">
          <img src="/cover.png" alt="State of the Art — Edition One" className="h-full w-full object-contain" />
        </div>

        <div className="w-[45%] h-full shrink-0 relative flex flex-col justify-between px-[2.5vw] py-[4vh] border-l border-white/[0.06] bg-[#0a0a0a]">
          <div>
            <span className="text-[clamp(10px,0.8vw,13px)] tracking-[0.12em] uppercase text-white/40 font-light">State of the Art</span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-[clamp(10px,0.8vw,13px)] text-white/50 font-light italic">The City</span>
              <span className="text-[clamp(9px,0.7vw,11px)] tracking-[0.15em] uppercase text-white/30 font-light">Edition One</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {articles.map((article, i) => (
              <a key={i} href="#" onClick={(e) => e.preventDefault()}
                onMouseEnter={() => setHoveredArticle(i)} onMouseLeave={() => setHoveredArticle(null)}
                className="no-underline group border-b border-white/[0.06] py-[1.6vh] first:border-t" style={{ cursor: "none" }}>
                <div className="flex items-baseline gap-[1vw]">
                  <span className={`text-[clamp(9px,0.6vw,11px)] tabular-nums font-light transition-colors duration-200 ${hoveredArticle === i ? "text-[#FF2A00]/50" : "text-white/40"}`}>{article.ex}</span>
                  <div className="flex-1">
                    <div className={`text-[clamp(18px,1.7vw,28px)] leading-[1.05] tracking-[-0.01em] uppercase transition-colors duration-200 ${hoveredArticle === i ? "text-[#FF2A00]" : "text-white/90"}`}
                      style={{ fontFamily: "'Anybody', sans-serif", fontVariationSettings: "'wdth' 85, 'wght' 500" }}>{article.title}</div>
                    <div className={`overflow-hidden transition-all duration-400 ${hoveredArticle === i ? "max-h-[30px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                      <span className="text-[clamp(11px,0.75vw,14px)] text-white/50 font-light italic">{article.teaser}</span>
                    </div>
                  </div>
                  {article.author && (
                    <span className={`text-[clamp(8px,0.5vw,10px)] tracking-[0.1em] uppercase shrink-0 font-light transition-colors duration-200 ${hoveredArticle === i ? "text-white/50" : "text-white/30"}`}>{article.author}</span>
                  )}
                </div>
              </a>
            ))}
          </div>

          <div className="text-[7px] tracking-[0.2em] uppercase text-white/40 font-light">Made in San Francisco</div>
        </div>
      </div>

      {/* Red fold triangle */}
      <div
        className="absolute z-[25] pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ top: 0, right: 0, width: `${peelSize}px`, height: `${peelSize}px`, opacity: mode === "map" ? 0 : 1 }}
      >
        <div className="absolute inset-0" style={{
          background: "linear-gradient(225deg, #FF2A00 0%, #cc2200 50%, transparent 50%)",
          boxShadow: "-3px 3px 12px rgba(0,0,0,0.5)",
        }} />
      </div>

      {/* Peel click target */}
      {mode === "content" && (
        <div className="absolute z-[26]" style={{ top: 0, right: 0, width: "180px", height: "180px", cursor: "none" }}
          onMouseEnter={() => setPeelHovered(true)} onMouseLeave={() => setPeelHovered(false)} onClick={toggleMode} />
      )}

      {/* Cursor */}
      <div className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50 mix-blend-normal"
        style={{ transform: `translate(${mousePos.x - 9}px, ${mousePos.y - 9}px)` }} />
    </div>
  )
}

export default PageTwo
