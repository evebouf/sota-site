import { useEffect, useRef, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

// --- Generative ambient engine ---
interface AmbientEngine {
  ctx: AudioContext
  master: GainNode
  start: () => void
  stop: () => void
  setMood: (index: number) => void
}

const moods = [
  { name: "Fog", note: "Ambient drone" },
  { name: "Grid", note: "City hum" },
  { name: "Signal", note: "Transmission" },
]

function createAmbientEngine(): AmbientEngine {
  const ctx = new AudioContext()
  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)

  let nodes: { stop?: () => void; disconnect: () => void }[] = []

  function clearNodes() {
    nodes.forEach((n) => {
      try { n.stop?.() } catch {}
      n.disconnect()
    })
    nodes = []
  }

  function buildMood(index: number) {
    clearNodes()
    const t = ctx.currentTime

    if (index === 0) {
      // Fog — deep warm drone with slow movement
      const freqs = [55, 82.5, 110, 165]
      freqs.forEach((f) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const filter = ctx.createBiquadFilter()
        osc.type = "sine"
        osc.frequency.value = f
        // Slow detune drift
        osc.detune.setValueAtTime(0, t)
        osc.detune.linearRampToValueAtTime(12, t + 8)
        osc.detune.linearRampToValueAtTime(-8, t + 16)
        osc.detune.linearRampToValueAtTime(0, t + 24)
        filter.type = "lowpass"
        filter.frequency.value = 200 + Math.random() * 100
        filter.Q.value = 1
        gain.gain.value = f < 100 ? 0.12 : 0.05
        osc.connect(filter).connect(gain).connect(master)
        osc.start()
        nodes.push(osc, gain, filter)
      })

      // Noise bed
      const bufferSize = ctx.sampleRate * 4
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5
      const noise = ctx.createBufferSource()
      noise.buffer = noiseBuffer
      noise.loop = true
      const noiseFilter = ctx.createBiquadFilter()
      noiseFilter.type = "lowpass"
      noiseFilter.frequency.value = 120
      const noiseGain = ctx.createGain()
      noiseGain.gain.value = 0.06
      noise.connect(noiseFilter).connect(noiseGain).connect(master)
      noise.start()
      nodes.push(noise, noiseFilter, noiseGain)

    } else if (index === 1) {
      // Grid — rhythmic low pulse, mechanical
      const lfo = ctx.createOscillator()
      lfo.type = "square"
      lfo.frequency.value = 0.5
      const lfoGain = ctx.createGain()
      lfoGain.gain.value = 0.08

      const sub = ctx.createOscillator()
      sub.type = "sawtooth"
      sub.frequency.value = 41.2
      const subFilter = ctx.createBiquadFilter()
      subFilter.type = "lowpass"
      subFilter.frequency.value = 80
      const subGain = ctx.createGain()
      subGain.gain.value = 0.15
      lfo.connect(lfoGain).connect(subGain.gain)
      sub.connect(subFilter).connect(subGain).connect(master)
      lfo.start()
      sub.start()
      nodes.push(lfo, lfoGain, sub, subFilter, subGain)

      // High harmonic hum
      const hum = ctx.createOscillator()
      hum.type = "triangle"
      hum.frequency.value = 330
      const humFilter = ctx.createBiquadFilter()
      humFilter.type = "bandpass"
      humFilter.frequency.value = 330
      humFilter.Q.value = 20
      const humGain = ctx.createGain()
      humGain.gain.value = 0.02
      hum.connect(humFilter).connect(humGain).connect(master)
      hum.start()
      nodes.push(hum, humFilter, humGain)

      // Noise clicks
      const bufferSize = ctx.sampleRate * 2
      const clickBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const cData = clickBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        cData[i] = Math.random() > 0.998 ? (Math.random() * 2 - 1) : 0
      }
      const clicks = ctx.createBufferSource()
      clicks.buffer = clickBuffer
      clicks.loop = true
      const clickGain = ctx.createGain()
      clickGain.gain.value = 0.08
      clicks.connect(clickGain).connect(master)
      clicks.start()
      nodes.push(clicks, clickGain)

    } else {
      // Signal — eerie shortwave radio texture
      const carrier = ctx.createOscillator()
      carrier.type = "sine"
      carrier.frequency.value = 660
      const modulator = ctx.createOscillator()
      modulator.type = "sine"
      modulator.frequency.value = 2.5
      const modGain = ctx.createGain()
      modGain.gain.value = 50
      modulator.connect(modGain).connect(carrier.frequency)
      const carFilter = ctx.createBiquadFilter()
      carFilter.type = "bandpass"
      carFilter.frequency.value = 660
      carFilter.Q.value = 15
      const carGain = ctx.createGain()
      carGain.gain.value = 0.04
      carrier.connect(carFilter).connect(carGain).connect(master)
      carrier.start()
      modulator.start()
      nodes.push(carrier, modulator, modGain, carFilter, carGain)

      // Static
      const bufferSize = ctx.sampleRate * 3
      const staticBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const sData = staticBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) sData[i] = (Math.random() * 2 - 1)
      const staticSrc = ctx.createBufferSource()
      staticSrc.buffer = staticBuffer
      staticSrc.loop = true
      const staticFilter = ctx.createBiquadFilter()
      staticFilter.type = "bandpass"
      staticFilter.frequency.value = 2000
      staticFilter.Q.value = 3
      const staticGain = ctx.createGain()
      staticGain.gain.value = 0.03
      staticSrc.connect(staticFilter).connect(staticGain).connect(master)
      staticSrc.start()
      nodes.push(staticSrc, staticFilter, staticGain)

      // Sub tone
      const sub = ctx.createOscillator()
      sub.type = "sine"
      sub.frequency.value = 65
      sub.detune.setValueAtTime(0, t)
      sub.detune.linearRampToValueAtTime(30, t + 10)
      sub.detune.linearRampToValueAtTime(-20, t + 20)
      const subGain = ctx.createGain()
      subGain.gain.value = 0.08
      sub.connect(subGain).connect(master)
      sub.start()
      nodes.push(sub, subGain)
    }
  }

  return {
    ctx,
    master,
    start() {
      if (ctx.state === "suspended") ctx.resume()
      master.gain.linearRampToValueAtTime(1, ctx.currentTime + 2)
      buildMood(0)
    },
    stop() {
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1)
    },
    setMood(index: number) {
      // Crossfade
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)
      setTimeout(() => {
        buildMood(index)
        master.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.5)
      }, 600)
    },
  }
}

// --- Articles with exhibit numbers and images ---
const articles = [
  { ex: "01", title: "The City of Tomorrow", author: "Sanjana Friedman", teaser: "The state of the art", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { ex: "02", title: "San Francisco Is Not an Island", author: "Jan Sramek", teaser: "On the NorCal Megaregion", desc: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
  { ex: "03", title: "The Ferlinghetti Method", author: "Olivia Marotte", teaser: "How to make a scene", desc: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
  { ex: "04", title: "Grecofuturism", author: "Pablo Peniche", teaser: "Marble, sandstone, metal", desc: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
  { ex: "05", title: "The Future of Getting Around", author: "Evan Zimmerman", teaser: "Fully autonomous transit", desc: "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra." },
  { ex: "06", title: "Alcatraz 2XXX", author: "Sanjana Friedman", teaser: "Dispatch from the future", desc: "Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet." },
  { ex: "07", title: "The Waterfront", author: "", teaser: "A polite suggestion", desc: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas." },
  { ex: "08", title: "Against Progress", author: "Wolf Tivy", teaser: "Counter-entropic politics", desc: "Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean lacinia bibendum nulla." },
]

// --- Component ---
function PageOne() {
  useEffect(() => { document.title = "D1 — Map & Audio" }, [])
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const engine = useRef<AmbientEngine | null>(null)
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 })
  const [mouseAngle, setMouseAngle] = useState(0)
  const prevMousePos = useRef({ x: -100, y: -100 })
  const mouseAngleRef = useRef(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [moodIndex, setMoodIndex] = useState(0)

  const [hoveredArticle, setHoveredArticle] = useState<number | null>(null)
  const [coverOpen, setCoverOpen] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)
  const [hyperstitionMode, setHyperstitionMode] = useState(false)

  const togglePlay = useCallback(() => {
    if (!engine.current) {
      engine.current = createAmbientEngine()
    }
    if (isPlaying) {
      engine.current.stop()
    } else {
      engine.current.start()
      engine.current.setMood(moodIndex)
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying, moodIndex])

  const nextMood = useCallback(() => {
    const next = (moodIndex + 1) % moods.length
    setMoodIndex(next)
    if (isPlaying && engine.current) {
      engine.current.setMood(next)
    }
  }, [moodIndex, isPlaying])

  const prevMood = useCallback(() => {
    const prev = (moodIndex - 1 + moods.length) % moods.length
    setMoodIndex(prev)
    if (isPlaying && engine.current) {
      engine.current.setMood(prev)
    }
  }, [moodIndex, isPlaying])

  useEffect(() => {
    return () => {
      engine.current?.stop()
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - prevMousePos.current.x
      const dy = e.clientY - prevMousePos.current.y
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        const target = Math.atan2(dy, dx) * (180 / Math.PI)
        let diff = target - mouseAngleRef.current
        diff = ((diff + 180) % 360 + 360) % 360 - 180
        mouseAngleRef.current += diff
        setMouseAngle(mouseAngleRef.current)
        prevMousePos.current = { x: e.clientX, y: e.clientY }
      }
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

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

      // Golden Gate Bridge — bright red
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

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right")

    // Log camera position on every move — check browser console
    map.current.on("moveend", () => {
      const m = map.current!
      const c = m.getCenter()
      console.log(`📍 center: [${c.lng.toFixed(6)}, ${c.lat.toFixed(6)}], zoom: ${m.getZoom().toFixed(2)}, pitch: ${m.getPitch().toFixed(1)}, bearing: ${m.getBearing().toFixed(1)}`)
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  return (
    <div className="w-full h-screen relative overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-[52px] h-full shrink-0 border-r border-white/[0.06] flex flex-col items-center justify-between py-[3vh] z-[100] bg-[#050505]">
        <div className="font-sans text-[11px] tracking-[0.2em] uppercase text-white/50"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          Menu
        </div>
        <div className="flex flex-col items-center gap-6">
          <button onClick={() => {
            if (contentVisible) { setContentVisible(false) } else { setContentVisible(true); setCoverOpen(false); setHyperstitionMode(false) }
          }} className={`bg-transparent border-none font-sans text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 p-0 ${
            contentVisible ? "text-[#FF2A00]" : "text-white/50 hover:text-[#FF2A00]"
          }`}
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", cursor: "none" }}>
            Contents
          </button>
          <button onClick={() => {
            if (coverOpen) { setCoverOpen(false) } else { setCoverOpen(true); setContentVisible(false); setHyperstitionMode(false) }
          }} className={`bg-transparent border-none font-sans text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 p-0 ${
            coverOpen ? "text-[#FF2A00]" : "text-white/50 hover:text-[#FF2A00]"
          }`}
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", cursor: "none" }}>
            Cover
          </button>
          <button onClick={() => {
            if (hyperstitionMode) { setHyperstitionMode(false) } else { setHyperstitionMode(true); setContentVisible(false); setCoverOpen(false) }
          }} className={`bg-transparent border-none font-sans text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 p-0 ${
            hyperstitionMode ? "text-[#FF2A00]" : "text-white/50 hover:text-[#FF2A00]"
          }`}
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", cursor: "none" }}>
            Hyperstition
          </button>
          <button onClick={() => { setContentVisible(false); setCoverOpen(false); setHyperstitionMode(false) }} className={`bg-transparent border-none font-sans text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 p-0 ${
            !contentVisible && !coverOpen && !hyperstitionMode ? "text-[#FF2A00]" : "text-white/50 hover:text-[#FF2A00]"
          }`}
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", cursor: "none" }}>
            Map
          </button>
          <button onClick={togglePlay} className={`bg-transparent border-none font-sans text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 p-0 ${
            isPlaying ? "text-[#FF2A00]" : "text-white/50 hover:text-[#FF2A00]"
          }`}
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", cursor: "none" }}>
            {isPlaying ? "Mute" : "Sound"}
          </button>
        </div>
        <div className="font-sans text-[11px] tracking-[0.2em] uppercase text-white/20"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          SOTA
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 h-full relative">

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center px-[4vw] pt-[3vh] font-sans text-[clamp(11px,1vw,14px)] tracking-[0.15em] uppercase font-medium text-white/60 pointer-events-none">
        <span className="text-white/60">
          State of the Art
        </span>
        <span className="flex items-baseline gap-[0.6em]">
          <span className="font-bodoni italic text-[clamp(14px,1.4vw,20px)] tracking-[0.02em] normal-case text-white/80">The City</span>
          <span className="ml-[0.8em]">Edition One</span>
        </span>
      </div>

      {/* Map */}
      <div className="w-full h-full relative">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Overlays — visible when NOT in map mode */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${!contentVisible && !coverOpen && !hyperstitionMode ? "opacity-0" : "opacity-100"}`}>
          {/* Dark scrim base */}
          <div className="absolute inset-0 bg-black/70" />

          {/* Halftone dot grid — red */}
          <div className="absolute inset-0 opacity-[0.25] mix-blend-screen"
            style={{
              backgroundImage: "radial-gradient(circle, #FF2A00 1px, transparent 1px)",
              backgroundSize: "4px 4px",
            }}
          />

          {/* GGB illustration — centered, red */}
          <img
            src="/ggb-grave-red.png"
            alt=""
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[20vh] object-contain opacity-50"
          />

          {/* Hyperstition Machine */}
          <img
            src="/hyperstition.png"
            alt="Hyperstition Machine"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] object-contain mix-blend-screen opacity-70"
          />

          {/* Grain overlay */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              backgroundSize: "256px",
            }}
          />
        </div>
      </div>

      {/* Horizontal rules — spanning full width */}
      <div className="absolute inset-0 z-[5] pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent 0px, transparent 79px, rgba(255,255,255,0.06) 79px, rgba(255,255,255,0.06) 80px)",
        }}
      />


      {/* Dark scrim when content is visible */}
      <div className={`absolute inset-0 z-[8] bg-black/80 pointer-events-none transition-opacity duration-700 ${contentVisible && !hyperstitionMode ? "opacity-100" : "opacity-0"}`} />

      {/* Editorial content layer */}
      <div className={`absolute inset-0 z-10 flex items-center pointer-events-none transition-all duration-700 ${contentVisible ? "opacity-100" : "opacity-0"}`}>
        <div className="w-full px-[4vw] py-[8vh] flex flex-col justify-between h-full">
          {articles.map((article, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredArticle(i)}
              onMouseLeave={() => setHoveredArticle(null)}
              className={`${contentVisible ? "pointer-events-auto" : "pointer-events-none"} transition-all duration-400 ${
                hoveredArticle !== null && hoveredArticle !== i ? "opacity-[0.08]" : ""
              }`}
              style={{ cursor: "none" }}
            >
              {/* Top line — number + title */}
              <div className="flex items-baseline gap-[1.5vw]">
                <span className={`text-[clamp(11px,0.9vw,14px)] tracking-[0.05em] transition-colors duration-200 ${
                  hoveredArticle === i ? "text-[#FF2A00]/40" : "text-white/15"
                }`}
                  style={{ fontFamily: "'Special Elite', cursive" }}>
                  {article.ex}
                </span>
                <span className={`text-[clamp(20px,2.8vw,44px)] leading-[0.92] uppercase transition-colors duration-200 ${
                  hoveredArticle === i ? "text-[#FF2A00]" : "text-white"
                }`}
                  style={{ fontFamily: "'Anybody', sans-serif", fontWeight: 800, fontStretch: "75%" }}>
                  {article.title.split("").map((char, j) => (
                    <span key={j} style={{
                      letterSpacing: `${(Math.sin(j * 1.7 + i * 3) * 0.04).toFixed(3)}em`,
                      fontStretch: `${73 + Math.sin(j * 0.9 + i * 2) * 5}%`,
                    }}>
                      {char}
                    </span>
                  ))}
                </span>
              </div>

              {/* Details — author, teaser, description on one line */}
              <div className="mt-[0.3vh] ml-[3.5vw] flex items-baseline gap-[1.2vw]">
                {article.author && (
                  <span className="font-sans text-[clamp(11px,0.85vw,15px)] tracking-[0.1em] uppercase text-white/70 shrink-0 font-medium">
                    {article.author}
                  </span>
                )}
                <span className="font-bodoni italic text-[clamp(11px,0.9vw,15px)] text-white/40">
                  {article.teaser}
                </span>
                <span className="font-sans text-[clamp(9px,0.65vw,12px)] text-white/20 max-w-[35vw] leading-[1.3] font-light truncate">
                  {article.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cover — front and center, click to dismiss/show */}
      <div
        className={`absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          coverOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setCoverOpen(false)}
        style={{ cursor: "none" }}
      >
        <img
          src="/cover.png"
          alt="Cover"
          draggable={false}
          className="h-[82vh] object-contain drop-shadow-[0_0_80px_rgba(0,0,0,0.6)]"
        />
        <a href="https://www.jaredpoblete.com/" target="_blank" rel="noopener noreferrer"
          className="font-sans text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white/60 transition-colors duration-200 no-underline mt-4"
          onClick={(e) => e.stopPropagation()}>
          Created by Jared Poblete
        </a>
      </div>

      {/* Sound — waveform bar, bottom right */}
      <div className="absolute bottom-[3vh] right-[4vw] z-[100] flex items-end gap-3" onClick={togglePlay} style={{ cursor: "none" }}>
        <div className="flex items-end gap-[2px] h-[28px]">
          {[0.4, 0.7, 0.3, 1, 0.5, 0.8, 0.35, 0.65, 0.9, 0.45, 0.75, 0.3].map((h, j) => (
            <div
              key={j}
              className={`w-[3px] bg-[#FF2A00] transition-all duration-300 ${isPlaying ? "" : "!h-[3px]"}`}
              style={{
                height: isPlaying ? `${h * 28}px` : "3px",
                animation: isPlaying ? `waveform ${0.4 + j * 0.08}s ease-in-out infinite alternate` : "none",
              }}
            />
          ))}
        </div>
        <span className="font-sans text-[8px] tracking-[0.2em] uppercase text-white/25 pb-[2px]">
          {isPlaying ? "On" : "Off"}
        </span>
      </div>


      </div>{/* end main area */}

      {/* Custom cursor */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y - 12}px) rotate(${mouseAngle}deg)`, color: "#FF2A00", fontSize: "24px", lineHeight: 1 }}
        >➽</div>
    </div>
  )
}

export default PageOne
