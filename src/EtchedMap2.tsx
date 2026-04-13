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
  a[href^="tel"], a[href^="mailto"], a[x-apple-data-detectors], a[href^="x-apple-mapitem"], a[href^="maps:"] {
    color: inherit !important;
    text-decoration: none !important;
    pointer-events: none !important;
  }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes fadeOut { from { opacity: 1 } to { opacity: 0 } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(40px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes slideDown { from { opacity: 1; transform: translateY(0) } to { opacity: 0; transform: translateY(40px) } }
  @keyframes dot-fade { 0%, 20% { opacity: 0 } 30%, 70% { opacity: 1 } 80%, 100% { opacity: 0 } }
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

type Landmark = { name: string; coords: [number, number]; photo?: string; description?: string }

// Simple line drawings for each object type — pen traces these paths
type Stroke = [number, number][]
const objectDrawings: Record<string, Stroke[]> = {
  bench: [
    [[20, 50], [80, 50]], [[20, 33], [80, 33]], [[20, 33], [20, 50]], [[80, 33], [80, 50]],
    [[28, 50], [28, 68]], [[72, 50], [72, 68]],
  ],
  chair: [
    [[35, 52], [65, 52]], [[35, 28], [35, 52]], [[35, 28], [50, 28]],
    [[35, 52], [32, 72]], [[65, 52], [68, 72]],
  ],
  box: [
    [[30, 42], [70, 42], [70, 68], [30, 68], [30, 42]],
    [[30, 42], [45, 32], [85, 32], [70, 42]], [[70, 42], [85, 32], [85, 58], [70, 68]],
  ],
  pylon: [
    [[38, 70], [50, 28], [62, 70]], [[33, 70], [67, 70]], [[43, 52], [57, 52]], [[45, 42], [55, 42]],
  ],
  rock: [
    [[32, 60], [28, 48], [35, 38], [50, 33], [65, 38], [70, 50], [68, 60], [55, 65], [40, 65], [32, 60]],
  ],
  pipes: [
    [[32, 35], [32, 65]], [[44, 35], [44, 65]], [[32, 35], [44, 35]], [[32, 65], [44, 65]],
    [[56, 35], [56, 65]], [[68, 35], [68, 65]], [[56, 35], [68, 35]], [[56, 65], [68, 65]],
  ],
  corner: [
    [[30, 25], [30, 70]], [[30, 70], [75, 70]], [[30, 52], [55, 52]],
  ],
  cooler: [
    [[28, 42], [72, 42], [72, 65], [28, 65], [28, 42]],
    [[28, 38], [72, 38], [72, 42]], [[38, 38], [38, 30], [62, 30], [62, 38]],
  ],
  bin: [
    [[35, 30], [65, 30], [62, 68], [38, 68], [35, 30]], [[33, 30], [67, 30]],
  ],
  stool: [
    [[38, 45], [62, 45], [62, 50], [38, 50], [38, 45]],
    [[42, 50], [35, 72]], [[50, 50], [50, 72]], [[58, 50], [65, 72]],
  ],
  hydrant: [
    [[40, 38], [60, 38], [58, 65], [42, 65], [40, 38]],
    [[44, 38], [44, 28], [56, 28], [56, 38]], [[60, 48], [70, 48], [70, 52], [60, 52]],
    [[38, 65], [62, 65], [62, 70], [38, 70]],
  ],
  bucket: [
    [[35, 32], [30, 68], [70, 68], [65, 32]], [[35, 32], [65, 32]],
    [[38, 32], [45, 20], [55, 20], [62, 32]],
  ],
  sculpture: [
    [[50, 70], [42, 50], [35, 40], [42, 28], [55, 25], [62, 35], [55, 48], [58, 58], [50, 70]],
  ],
  stump: [
    [[32, 50], [32, 68], [68, 68], [68, 50]],
    [[30, 50], [40, 44], [50, 42], [60, 44], [70, 50], [60, 52], [50, 54], [40, 52], [30, 50]],
  ],
  pigeons: [
    [[28, 55], [32, 48], [40, 45], [46, 48], [44, 52], [36, 56], [28, 55]],
    [[40, 45], [44, 42]], [[34, 56], [32, 62]], [[37, 56], [36, 62]],
    [[58, 52], [62, 46], [70, 44], [76, 46], [74, 50], [66, 54], [58, 52]],
    [[70, 44], [74, 40]], [[64, 54], [63, 60]], [[67, 54], [66, 60]],
  ],
  cushion: [
    [[30, 40], [70, 40], [72, 48], [70, 58], [30, 58], [28, 48], [30, 40]], [[35, 49], [65, 49]],
  ],
  rocking_chair: [
    [[38, 48], [62, 48]], [[38, 25], [38, 48]], [[38, 25], [55, 25]],
    [[38, 48], [35, 58]], [[62, 48], [65, 58]], [[28, 62], [42, 58], [58, 58], [72, 62]],
  ],
  shelf: [
    [[28, 48], [72, 48]], [[28, 48], [28, 58], [35, 58]], [[72, 48], [72, 58], [65, 58]],
  ],
  motorbike: [
    [[28, 58], [32, 52], [38, 52], [42, 58], [38, 64], [32, 64], [28, 58]],
    [[58, 58], [62, 52], [68, 52], [72, 58], [68, 64], [62, 64], [58, 58]],
    [[38, 52], [50, 38], [62, 52]], [[48, 38], [44, 35]], [[62, 52], [68, 42]],
  ],
  bike_rack: [
    [[35, 68], [35, 35], [50, 28], [65, 35], [65, 68]], [[30, 68], [70, 68]],
  ],
  stoop: [
    [[25, 68], [75, 68]], [[25, 68], [25, 52], [55, 52]], [[25, 52], [25, 38], [45, 38]],
  ],
  car_seat: [
    [[35, 65], [38, 45], [38, 25], [58, 25], [58, 45]], [[38, 45], [68, 45], [68, 55], [35, 65]],
  ],
  generic: [
    [[40, 55], [35, 42], [42, 32], [55, 30], [65, 38], [62, 52], [52, 58], [40, 55]],
  ],
}

function getDrawingType(name: string): string {
  const n = name.toLowerCase()
  if (n.includes("rocking chair")) return "rocking_chair"
  if (n.includes("motorbike")) return "motorbike"
  if (n.includes("bike")) return "bike_rack"
  if (n.includes("car seat")) return "car_seat"
  if (n.includes("bench")) return "bench"
  if (n.includes("chair") || n.includes("seat")) return "chair"
  if (n.includes("stool")) return "stool"
  if (n.includes("cushion")) return "cushion"
  if (n.includes("box") || n.includes("crate")) return "box"
  if (n.includes("pylon")) return "pylon"
  if (n.includes("slab") || n.includes("rock")) return "rock"
  if (n.includes("hydrant")) return "hydrant"
  if (n.includes("bucket")) return "bucket"
  if (n.includes("pipe")) return "pipes"
  if (n.includes("cooler")) return "cooler"
  if (n.includes("stump")) return "stump"
  if (n.includes("sculpture")) return "sculpture"
  if (n.includes("pigeon")) return "pigeons"
  if (n.includes("shelf")) return "shelf"
  if (n.includes("corner")) return "corner"
  if (n.includes("bin")) return "bin"
  if (n.includes("stoop") || n.includes("step")) return "stoop"
  return "generic"
}

function getDrawing(name: string): Stroke[] {
  return objectDrawings[getDrawingType(name)] || objectDrawings.generic
}

// Interpolate paths into fine-grained draw points for smooth animation
function buildDrawPoints(paths: Stroke[], scale: number) {
  const points: { x: number; y: number; penDown: boolean }[] = []
  const step = 3
  for (const path of paths) {
    for (let i = 0; i < path.length; i++) {
      const [x, y] = [path[i][0] * scale, path[i][1] * scale]
      if (i === 0) {
        points.push({ x, y, penDown: false })
      } else {
        const [px, py] = [path[i - 1][0] * scale, path[i - 1][1] * scale]
        const dx = x - px, dy = y - py
        const dist = Math.sqrt(dx * dx + dy * dy)
        const steps = Math.max(1, Math.floor(dist / step))
        for (let s = 1; s <= steps; s++) {
          const t = s / steps
          points.push({
            x: px + dx * t + (Math.random() - 0.5) * 1.2,
            y: py + dy * t + (Math.random() - 0.5) * 1.2,
            penDown: true,
          })
        }
      }
    }
  }
  return points
}

// Draw all paths instantly (for grid / cached view)
function drawPathsStatic(ctx: CanvasRenderingContext2D, paths: Stroke[], s: number, color: string) {
  const scale = s / 100
  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.globalAlpha = 0.85
  for (const path of paths) {
    if (path.length < 2) continue
    ctx.beginPath()
    ctx.moveTo(path[0][0] * scale, path[0][1] * scale)
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(
        path[i][0] * scale + (Math.random() - 0.5) * 1,
        path[i][1] * scale + (Math.random() - 0.5) * 1,
      )
    }
    ctx.stroke()
  }
}

function SketchingPen({ size, color, paths, animate = true }: { size: number; color: string; paths: Stroke[]; animate?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const penRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    cancelAnimationFrame(animRef.current)
    const s = size * 2
    canvas.width = s
    canvas.height = s
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, s, s)

    if (!animate) {
      drawPathsStatic(ctx, paths, s, color)
      if (penRef.current) penRef.current.style.opacity = "0"
      return
    }

    // Animated drawing
    const scale = s / 100
    const points = buildDrawPoints(paths, scale)
    if (points.length === 0) return

    ctx.strokeStyle = color
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.globalAlpha = 0.85

    if (penRef.current) penRef.current.style.opacity = "0.6"

    let i = 0
    const perFrame = 5

    const draw = () => {
      for (let j = 0; j < perFrame && i < points.length; j++, i++) {
        const pt = points[i]
        if (pt.penDown && i > 0) {
          const prev = points[i - 1]
          ctx.beginPath()
          ctx.moveTo(prev.x, prev.y)
          ctx.lineTo(pt.x, pt.y)
          ctx.stroke()
        }
        if (penRef.current) {
          penRef.current.style.transform = `translate(${pt.x / 2 - 4}px, ${pt.y / 2 - 4}px)`
        }
      }

      if (i < points.length) {
        animRef.current = requestAnimationFrame(draw)
      } else {
        if (penRef.current) penRef.current.style.opacity = "0"
      }
    }
    animRef.current = requestAnimationFrame(draw)

    return () => cancelAnimationFrame(animRef.current)
  }, [paths, size, color, animate])

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <canvas ref={canvasRef} style={{ width: size, height: size, display: "block" }} />
      <div
        ref={penRef}
        style={{
          position: "absolute", top: 0, left: 0,
          width: 8, height: 8, borderRadius: "50%",
          background: color, opacity: 0,
          pointerEvents: "none",
          transition: "opacity 0.3s",
        }}
      />
    </div>
  )
}

// "The Best Spots to Sit and Read a Book in San Francisco" — Warby Parker × Jason Polan
const landmarks: Landmark[] = [
  // === TURK / GOLDEN GATE ===
  { name: "Bench at bus stop on Laguna & Turk", coords: [-122.4273, 37.7823] },
  { name: "Bench in front on the third floor side at Bass Hall", coords: [-122.4252, 37.7822] },
  { name: "Chair in lobby on Turk", coords: [-122.4235, 37.7824] },
  { name: "Rock next to a Frankenstein-looking plant on Golden Gate and Gough", coords: [-122.4230, 37.7816] },
  { name: "Two pipes on Golden Gate", coords: [-122.4260, 37.7814] },

  // === McALLISTER / REDWOOD ===
  { name: "Construction pylon on Laguna and McAllister", coords: [-122.4272, 37.7806] },
  { name: "Bench on Redwood", coords: [-122.4238, 37.7800] },
  { name: "Three boxes stacked up at Franklin and Fulton", coords: [-122.4210, 37.7796] },
  { name: "Bench on McAllister and Van Ness", coords: [-122.4194, 37.7808] },
  { name: "Big slab or rock at Polk and McAllister at City Hall", coords: [-122.4174, 37.7808] },
  { name: "Bench in front of the Asian Art Museum", coords: [-122.4155, 37.7804] },
  { name: "Chair in the Tenderloin People's Garden", coords: [-122.4142, 37.7816] },

  // === FULTON ===
  { name: "Bike share stand on Fulton", coords: [-122.4265, 37.7796] },
  { name: "Box on Octavia", coords: [-122.4250, 37.7797] },
  { name: "Chair in cleaners on Fulton", coords: [-122.4240, 37.7796] },
  { name: "Corner on Ash & Gough", coords: [-122.4230, 37.7798] },
  { name: "I think it might be going into the Opera House", coords: [-122.4200, 37.7796] },
  { name: "Chair in area on Fulton between Franklin and Van Ness", coords: [-122.4197, 37.7798] },

  // === GROVE ===
  { name: "Crate on Grove", coords: [-122.4262, 37.7787] },
  { name: "A silver cooler on Ivy", coords: [-122.4260, 37.7782] },
  { name: "A construction worker just put a sign down on it, on Ivy", coords: [-122.4255, 37.7781] },
  { name: "Corner on Gough above Grove", coords: [-122.4230, 37.7789] },
  { name: "Cardboard box on Gough & Grove — it looks pretty sturdy", coords: [-122.4230, 37.7786] },
  { name: "Bench with a big leaf on it across the stages", coords: [-122.4216, 37.7787] },
  { name: "A little slab at the end of a driveway of the San Francisco Opera", coords: [-122.4204, 37.7789] },
  { name: "Bench just outside Davies Symphony Hall", coords: [-122.4200, 37.7784] },
  { name: "Henry Moore Sculpture", coords: [-122.4195, 37.7782] },
  { name: "Pylon bench near City Hall", coords: [-122.4185, 37.7793] },
  { name: "Milk crate at Grove and Polk", coords: [-122.4174, 37.7790] },

  // === HAYES ===
  { name: "Chair in office on Linden", coords: [-122.4242, 37.7774] },
  { name: "Sideways bin on Hayes and Laguna", coords: [-122.4268, 37.7768] },
  { name: "Chair at Gough and Hayes", coords: [-122.4230, 37.7772] },
  { name: "Warby Parker, 357 Hayes", coords: [-122.4222, 37.7772] },
  { name: "Stool near Davies Symphony Hall", coords: [-122.4210, 37.7778] },
  { name: "Might be nice to lean against on Hayes", coords: [-122.4200, 37.7779] },
  { name: "Red fire hydrant on Lech Walesa and Van Ness", coords: [-122.4188, 37.7774] },
  { name: "Corner on Polk and Hayes", coords: [-122.4174, 37.7780] },
  { name: "Seat in Civic Center Station", coords: [-122.4155, 37.7782] },
  { name: "Just sit here", coords: [-122.4145, 37.7779] },

  // === LINDEN / FELL ===
  { name: "Terra cotta clay pipe on Linden", coords: [-122.4232, 37.7768] },
  { name: "Big tree stump on Fell just east of Octavia", coords: [-122.4244, 37.7760] },
  { name: "Two big slabs on Linden", coords: [-122.4236, 37.7767] },
  { name: "Chair at San Francisco Jazz Center", coords: [-122.4214, 37.7764] },
  { name: "Black bucket on Hickory", coords: [-122.4212, 37.7756] },
  { name: "Cushion in the lobby of an apartment building on Fell", coords: [-122.4192, 37.7760] },
  { name: "Two pigeons", coords: [-122.4165, 37.7764] },
  { name: "Chair on 10th and Market", coords: [-122.4158, 37.7760] },
  { name: "Chair in pizza shop on Mission", coords: [-122.4150, 37.7748] },

  // === OAK ===
  { name: "Rocking chair in the back of a pickup truck on Oak and Laguna", coords: [-122.4268, 37.7750] },
  { name: "Seat next to geodesic dome playground on Octavia and Fell", coords: [-122.4248, 37.7762] },
  { name: "Shelf seat outside door on Gough and Oak", coords: [-122.4230, 37.7749] },
  { name: "Bench on Gough and Oak", coords: [-122.4228, 37.7751] },
  { name: "Red chair outside cafe on Franklin and Oak", coords: [-122.4210, 37.7752] },
  { name: "Car seats in auto detailing shop across from the Conservatory of Music on Oak, just west of Van Ness", coords: [-122.4196, 37.7750] },
  { name: "Wooden bench behind building near Market", coords: [-122.4175, 37.7754] },
  { name: "Bench on Market", coords: [-122.4168, 37.7750] },

  // === LILY / PAGE ===
  { name: "Motorbike on Lily Street that says 'like on it'", coords: [-122.4262, 37.7744] },
  { name: "Seat on Page", coords: [-122.4252, 37.7738] },
  { name: "Step on Page Street and Gough", coords: [-122.4230, 37.7738] },
  { name: "Bike rack on Market", coords: [-122.4215, 37.7736] },
  { name: "Chair in building on Market and Van Ness", coords: [-122.4194, 37.7742] },

  // === HAIGHT / MISSION ===
  { name: "Stoop on Haight between Laguna and Octavia", coords: [-122.4258, 37.7725] },
  { name: "Construction pylon on Mission", coords: [-122.4155, 37.7730] },

  // === STOCKTON (off-map) ===
  { name: "Warby Parker, 216 Stockton Street", coords: [-122.4065, 37.7870] },
]

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
    textColor: "#ffffff",
    borderColor: "rgba(40,60,120,0.3)",
    photoBorder: "rgba(40,60,120,0.3)",
    photoShadow: "rgba(0,0,0,0.4)",
    pinBorder: "rgba(40,60,120,0.4)",
  },
}

export default function EtchedMap2() {
  useEffect(() => { document.title = "Etched 2 — State of the Art" }, [])
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState<MapMode>("day")
  const [showManifesto, setShowManifesto] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
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
      center: [-122.4210, 37.7780],
      zoom: 14.5,
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

    // Markers — dark dots for reading spots
    for (const lm of landmarks) {
      const el = document.createElement("div")
      el.addEventListener("click", (e) => {
        e.stopPropagation()
        setSelectedLandmark(lm)
      })
      el.style.cssText = `cursor: none; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;`
      const dot = document.createElement("div")
      dot.style.cssText = `
        width: 7px; height: 7px; border-radius: 50%;
        background: #1a1a1a; box-shadow: 0 0 4px rgba(0,0,0,0.15);
        border: 1px solid rgba(0,0,0,0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      `
      el.onmouseenter = () => { dot.style.transform = "scale(1.8)"; dot.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)" }
      el.onmouseleave = () => { dot.style.transform = "scale(1)"; dot.style.boxShadow = "0 0 4px rgba(0,0,0,0.15)" }
      el.appendChild(dot)
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
      className="w-screen overflow-hidden relative"
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
              The best spots to sit and read a book in San Francisco
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
              A bench, a stoop, a pickup truck bed, a construction pylon. Every spot is a place to read if you believe hard enough. Drawings by Jason Polan.
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
        className="fixed top-0 left-0 pointer-events-none z-50 hidden md:block"
        style={{ transform: `translate(${cursor.x}px, ${cursor.y - 12}px) rotate(${cursor.angle}deg)`, color: "#FF2A00", fontSize: "24px", lineHeight: 1 }}
        >➽</div>

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
          fontSize: 16,
          lineHeight: 1,
          color: t.textColor,
          opacity: 0.7,
          background: "none",
          border: `1px solid ${t.borderColor}`,
          padding: "6px 14px",
          cursor: "none",
          transition: "all 0.6s ease",
        }}
      >
        {mode === "day" ? "☽" : "☀"}
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
            {/* Pen draws the object */}
            <div style={{ marginBottom: 20 }}>
              <SketchingPen size={320} color={t.textColor} paths={getDrawing(selectedLandmark.name)} />
            </div>
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

      {/* Grid view */}
      {showGrid && (
        <div
          className="fixed inset-0 z-40"
          style={{
            background: mode === "day" ? "#ffffff" : "#0a0e1a",
            overflowY: "auto",
            cursor: "none",
            animation: "fadeIn 0.4s ease",
            paddingBottom: 60,
          }}
        >
          <button
            className="sota-btn"
            onClick={() => setShowGrid(false)}
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
          <div style={{ padding: "60px 4vw 40px", maxWidth: 1200, margin: "0 auto" }}>
            <div style={{
              fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
              fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase",
              transform: "scaleX(0.72)", transformOrigin: "left",
              color: t.textColor, marginBottom: 32,
            }}>
              All Drawings
            </div>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 24,
            }}>
              {landmarks.map(lm => (
                  <div
                    key={lm.name}
                    style={{ width: "calc(33.333% - 16px)", display: "flex", flexDirection: "column" }}
                  >
                    <SketchingPen size={200} color={t.textColor} paths={getDrawing(lm.name)} animate={false} />
                    <div style={{
                      fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
                      fontSize: 11, lineHeight: 1.5,
                      color: t.textColor, opacity: 0.7,
                      marginTop: 8, marginBottom: 8,
                    }}>
                      {lm.name}
                    </div>
                  </div>
              ))}
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
        <span aria-hidden="true" data-nosnippet style={{ transform: "scaleX(0.75)", transformOrigin: "left", display: "inline-block", pointerEvents: "none", textDecoration: "none !important" as any, WebkitTapHighlightColor: "transparent", userSelect: "none" }}>WARBY PARKER × JASON POLAN</span>
        <button
          onClick={() => showManifesto ? closeManifesto() : setShowManifesto(true)}
          style={{ position: "absolute", left: "50%", top: "50%", transform: "translateX(-50%) translateY(-50%) scaleX(0.75)", letterSpacing: "0.25em", textTransform: "uppercase", display: "inline-block", color: t.textColor, background: "none", border: "none", cursor: "none", borderBottom: `1px solid ${t.borderColor}`, paddingBottom: 2, fontFamily: "inherit", fontSize: "inherit" }}
        >
          Manifesto
        </button>
        <button
          onClick={() => setShowGrid(true)}
          style={{ position: "absolute", left: "calc(50% + 80px)", top: "50%", transform: "translateY(-50%) scaleX(0.75)", letterSpacing: "0.25em", textTransform: "uppercase", display: "inline-block", color: t.textColor, background: "none", border: "none", cursor: "none", borderBottom: `1px solid ${t.borderColor}`, paddingBottom: 2, fontFamily: "inherit", fontSize: "inherit" }}
        >
          Grid
        </button>
        <span aria-hidden="true" data-nosnippet style={{ letterSpacing: "0.25em", textTransform: "uppercase", transform: "scaleX(0.75)", transformOrigin: "right", display: "inline-block", pointerEvents: "none", textDecoration: "none !important" as any, WebkitTapHighlightColor: "transparent", userSelect: "none" }}>{landmarks.length}&nbsp;Spots</span>
      </div>
    </div>
  )
}
