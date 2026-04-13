// Direction 15: Map World
// Full-bleed textured map of San Francisco. Flat, printed-feeling cartography with grain, vignette, and slow drift.

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { PaperTexture } from "@paper-design/shaders-react"

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

interface Preset {
  name: string
  // map
  zoom: number; pitch: number; bearing: number
  terrainExaggeration: number
  fogRangeMin: number; fogRangeMax: number; fogColor: string
  fogHorizonBlend: number; fogStarIntensity: number
  waterColor: string; waterOpacity: number
  landColor: string
  lineColor: string; lineOpacity: number; lineWidth: number
  buildingColor: string; buildingOpacity: number; buildingHeight: number
  ggbColor: string; ggbWidth: number; ggbOpacity: number
  // style
  mapStyle?: string
  // post
  cssContrast: number; cssBrightness: number; cssSaturate: number
  grainOpacity: number; vignetteIntensity: number
  // texture layers
  paperOpacity: number      // paper fiber texture
  halftoneOpacity: number   // dot screen pattern
  displacementScale: number // SVG turbulence warp on the map itself
  paperShaderOpacity: number // WebGL paper shader overlay
  shaderOverride?: {
    colorBack: string; colorFront: string; blendMode: string
    opacity: number; contrast: number; roughness: number
    fiber: number; fiberSize: number; crumples: number; crumpleSize: number
    folds: number; foldCount: number; drops: number; fade: number
    seed: number; scale: number
  }
}

const presets: Preset[] = [
  // ── ORIGINAL 7 ──
  {
    name: "Etched",
    mapStyle: "light-v11",
    zoom: 14, pitch: 0, bearing: 0,
    terrainExaggeration: 0,
    fogRangeMin: -2, fogRangeMax: 2, fogColor: "#f5f2ec",
    fogHorizonBlend: 1, fogStarIntensity: 0,
    waterColor: "#e8e4de", waterOpacity: 1,
    landColor: "#f5f2ec",
    lineColor: "#1a1a1a", lineOpacity: 0.7, lineWidth: 0.6,
    buildingColor: "#1a1a1a", buildingOpacity: 0.12, buildingHeight: 0.8,
    ggbColor: "#FF2A00", ggbWidth: 2.5, ggbOpacity: 1,
    cssContrast: 1.1, cssBrightness: 1.05, cssSaturate: 0,
    grainOpacity: 0, vignetteIntensity: 0,
    paperOpacity: 0, halftoneOpacity: 0, displacementScale: 0, paperShaderOpacity: 0,
  },
  {
    name: "Parchment",
    zoom: 13, pitch: 0, bearing: 12,
    terrainExaggeration: 0,
    fogRangeMin: -0.5, fogRangeMax: 10, fogColor: "#e8dcc8",
    fogHorizonBlend: 0.3, fogStarIntensity: 0,
    waterColor: "#c4d8e0", waterOpacity: 1,
    landColor: "#e8dcc8",
    lineColor: "#3a2a1a", lineOpacity: 0.3, lineWidth: 0.6,
    buildingColor: "#d4c8b0", buildingOpacity: 0.15, buildingHeight: 0.3,
    ggbColor: "#8b2500", ggbWidth: 2.5, ggbOpacity: 0.7,
    cssContrast: 0.9, cssBrightness: 1.8, cssSaturate: 0.4,
    grainOpacity: 0.9, vignetteIntensity: 0.2,
    paperOpacity: 0, halftoneOpacity: 0, displacementScale: 0, paperShaderOpacity: 0,
  },
  {
    name: "Neon",
    zoom: 15, pitch: 70, bearing: 45,
    terrainExaggeration: 3,
    fogRangeMin: 0.5, fogRangeMax: 4, fogColor: "#08001a",
    fogHorizonBlend: 0.1, fogStarIntensity: 0.8,
    waterColor: "#000515", waterOpacity: 1,
    landColor: "#06000f",
    lineColor: "#00ffcc", lineOpacity: 0.6, lineWidth: 2,
    buildingColor: "#2a0060", buildingOpacity: 0.7, buildingHeight: 3,
    ggbColor: "#ff00aa", ggbWidth: 6, ggbOpacity: 1,
    cssContrast: 1.5, cssBrightness: 1.1, cssSaturate: 3,
    grainOpacity: 0.1, vignetteIntensity: 0.6,
    paperOpacity: 0, halftoneOpacity: 0, displacementScale: 0, paperShaderOpacity: 0,
  },
  {
    name: "Satellite",
    mapStyle: "satellite-v9",
    zoom: 13.5, pitch: 45, bearing: -15,
    terrainExaggeration: 1.5,
    fogRangeMin: -0.5, fogRangeMax: 12, fogColor: "#88aabb",
    fogHorizonBlend: 0.4, fogStarIntensity: 0,
    waterColor: "#1a4060", waterOpacity: 1,
    landColor: "#2a5530",
    lineColor: "#ffffff", lineOpacity: 0, lineWidth: 0,
    buildingColor: "#888888", buildingOpacity: 0.6, buildingHeight: 1.2,
    ggbColor: "#FF2A00", ggbWidth: 4, ggbOpacity: 1,
    cssContrast: 1.05, cssBrightness: 1.0, cssSaturate: 1.3,
    grainOpacity: 0, vignetteIntensity: 0,
    paperOpacity: 0, halftoneOpacity: 0, displacementScale: 0, paperShaderOpacity: 0,
  },
  {
    name: "Invisible",
    zoom: 11.5, pitch: 0, bearing: 0,
    terrainExaggeration: 0,
    fogRangeMin: -2, fogRangeMax: 1.5, fogColor: "#f0f0f0",
    fogHorizonBlend: 1, fogStarIntensity: 0,
    waterColor: "#e8e8e8", waterOpacity: 1,
    landColor: "#f5f5f5",
    lineColor: "#cccccc", lineOpacity: 0.08, lineWidth: 0.3,
    buildingColor: "#eeeeee", buildingOpacity: 0.05, buildingHeight: 0.1,
    ggbColor: "#FF2A00", ggbWidth: 1, ggbOpacity: 0.3,
    cssContrast: 0.8, cssBrightness: 2, cssSaturate: 0,
    grainOpacity: 0.4, vignetteIntensity: 0,
    paperOpacity: 0, halftoneOpacity: 0, displacementScale: 0, paperShaderOpacity: 0,
  },
  {
    name: "Fibrous",
    zoom: 12.8, pitch: 0, bearing: 0,
    terrainExaggeration: 1.2,
    fogRangeMin: -0.5, fogRangeMax: 3, fogColor: "#0a0a0a",
    fogHorizonBlend: 0.05, fogStarIntensity: 0,
    waterColor: "#050505", waterOpacity: 1,
    landColor: "#0e0e0e",
    lineColor: "#ffffff", lineOpacity: 1, lineWidth: 1,
    buildingColor: "#141414", buildingOpacity: 0.5, buildingHeight: 1,
    ggbColor: "#FF2A00", ggbWidth: 3, ggbOpacity: 0.9,
    cssContrast: 1.3, cssBrightness: 0.7, cssSaturate: 0.2,
    grainOpacity: 0.7, vignetteIntensity: 0,
    paperOpacity: 0, halftoneOpacity: 0, displacementScale: 0, paperShaderOpacity: 0,
    shaderOverride: {
      colorBack: "#e8dcc4", colorFront: "#9f9080", blendMode: "soft-light",
      opacity: 1, contrast: 1, roughness: 0.3, fiber: 1, fiberSize: 0.4,
      crumples: 0.1, crumpleSize: 0.25, folds: 0.05, foldCount: 8,
      drops: 0.2, fade: 1, seed: 96.8, scale: 0.01,
    },
  },
  {
    name: "Printed",
    zoom: 13.2, pitch: 0, bearing: 3,
    terrainExaggeration: 0,
    fogRangeMin: -0.5, fogRangeMax: 10, fogColor: "#d8ccb4",
    fogHorizonBlend: 0.3, fogStarIntensity: 0,
    waterColor: "#b8c8cc", waterOpacity: 1,
    landColor: "#d8ccb4",
    lineColor: "#5a4530", lineOpacity: 0.4, lineWidth: 0.7,
    buildingColor: "#c4b898", buildingOpacity: 0.2, buildingHeight: 0.3,
    ggbColor: "#8b2000", ggbWidth: 2.5, ggbOpacity: 0.6,
    cssContrast: 0.85, cssBrightness: 1.9, cssSaturate: 0.25,
    grainOpacity: 0.8, vignetteIntensity: 0,
    paperOpacity: 0.6, halftoneOpacity: 0.2, displacementScale: 2, paperShaderOpacity: 0.8,
  },

  // ── PHOTO-MATCHED ──

  {
    // Teal sky, warm amber city, golden hour glow, film grain. Matches the photos.
    name: "Blue Hour",
    zoom: 13.5, pitch: 30, bearing: 15,
    terrainExaggeration: 1.5,
    fogRangeMin: -0.5, fogRangeMax: 8, fogColor: "#0c1a2a",
    fogHorizonBlend: 0.35, fogStarIntensity: 0.15,
    waterColor: "#0a2840", waterOpacity: 1,
    landColor: "#101820",
    lineColor: "#f0c870", lineOpacity: 0.45, lineWidth: 0.8,
    buildingColor: "#e0a050", buildingOpacity: 0.7, buildingHeight: 1.5,
    ggbColor: "#FF2A00", ggbWidth: 4, ggbOpacity: 1,
    cssContrast: 1.15, cssBrightness: 1.2, cssSaturate: 1.6,
    grainOpacity: 0.5, vignetteIntensity: 0.1,
    paperOpacity: 0, halftoneOpacity: 0, displacementScale: 0, paperShaderOpacity: 0,
    shaderOverride: {
      colorBack: "#e0c890", colorFront: "#2a6080", blendMode: "soft-light",
      opacity: 0.2, contrast: 0.3, roughness: 0.4, fiber: 0.25, fiberSize: 0.15,
      crumples: 0.1, crumpleSize: 0.25, folds: 0.05, foldCount: 4,
      drops: 0.08, fade: 0.5, seed: 61, scale: 0.3,
    },
  },

  // ── 10 NEW EXTREMES ──

  {
    // Street-level, maxed buildings, deep canyon shadows. Feel the density.
    name: "Canyon",
    zoom: 16, pitch: 75, bearing: -30,
    terrainExaggeration: 2.5,
    fogRangeMin: 0.8, fogRangeMax: 2.5, fogColor: "#1a1410",
    fogHorizonBlend: 0.02, fogStarIntensity: 0,
    waterColor: "#0a0805", waterOpacity: 1,
    landColor: "#1a1510",
    lineColor: "#4a3e2e", lineOpacity: 0.8, lineWidth: 1.5,
    buildingColor: "#2a2218", buildingOpacity: 0.95, buildingHeight: 5,
    ggbColor: "#FF2A00", ggbWidth: 5, ggbOpacity: 1,
    cssContrast: 1.6, cssBrightness: 0.5, cssSaturate: 0.3,
    grainOpacity: 0.9, vignetteIntensity: 0.7,
    paperOpacity: 0.3, halftoneOpacity: 0, displacementScale: 0, paperShaderOpacity: 0,
    shaderOverride: {
      colorBack: "#2a2015", colorFront: "#0a0805", blendMode: "multiply",
      opacity: 0.4, contrast: 0.8, roughness: 0.7, fiber: 0.2, fiberSize: 0.1,
      crumples: 0.6, crumpleSize: 0.5, folds: 0.3, foldCount: 4,
      drops: 0.4, fade: 0.2, seed: 33, scale: 0.8,
    },
  },
  {
    // Bright white, all roads visible, like a xeroxed city planning document.
    name: "Xerox",
    zoom: 14, pitch: 0, bearing: 0,
    terrainExaggeration: 0,
    fogRangeMin: -2, fogRangeMax: 2, fogColor: "#ffffff",
    fogHorizonBlend: 1, fogStarIntensity: 0,
    waterColor: "#d0d0d0", waterOpacity: 1,
    landColor: "#f8f8f8",
    lineColor: "#000000", lineOpacity: 0.9, lineWidth: 0.8,
    buildingColor: "#e8e8e8", buildingOpacity: 0.3, buildingHeight: 0,
    ggbColor: "#FF2A00", ggbWidth: 2, ggbOpacity: 1,
    cssContrast: 2.5, cssBrightness: 1.5, cssSaturate: 0,
    grainOpacity: 1, vignetteIntensity: 0,
    paperOpacity: 0, halftoneOpacity: 0.5, displacementScale: 3, paperShaderOpacity: 0,
    shaderOverride: {
      colorBack: "#f0ece0", colorFront: "#a0a0a0", blendMode: "multiply",
      opacity: 0.6, contrast: 0.5, roughness: 0.8, fiber: 0.8, fiberSize: 0.6,
      crumples: 0.4, crumpleSize: 0.3, folds: 0.15, foldCount: 6,
      drops: 0.6, fade: 0.3, seed: 12, scale: 0.3,
    },
  },
  {
    // Copper/rust/oxidized metal. Heavy warm tones, corroded.
    name: "Corroded",
    zoom: 13.5, pitch: 35, bearing: 60,
    terrainExaggeration: 1.8,
    fogRangeMin: 0, fogRangeMax: 5, fogColor: "#2a1a0a",
    fogHorizonBlend: 0.15, fogStarIntensity: 0,
    waterColor: "#0a1518", waterOpacity: 1,
    landColor: "#3a2510",
    lineColor: "#c07040", lineOpacity: 0.7, lineWidth: 1.2,
    buildingColor: "#6a4020", buildingOpacity: 0.8, buildingHeight: 1.8,
    ggbColor: "#40e0a0", ggbWidth: 4, ggbOpacity: 0.9,
    cssContrast: 1.4, cssBrightness: 0.8, cssSaturate: 1.5,
    grainOpacity: 0.8, vignetteIntensity: 0.4,
    paperOpacity: 0.4, halftoneOpacity: 0, displacementScale: 4, paperShaderOpacity: 0,
    shaderOverride: {
      colorBack: "#5a3818", colorFront: "#2a1808", blendMode: "overlay",
      opacity: 0.7, contrast: 0.6, roughness: 0.9, fiber: 0.4, fiberSize: 0.3,
      crumples: 0.8, crumpleSize: 0.6, folds: 0.4, foldCount: 3,
      drops: 0.7, fade: 0.1, seed: 55, scale: 0.5,
    },
  },
  {
    // Tilt-shift toy model. Hyper-saturated, shallow fog, everything looks miniature.
    name: "Diorama",
    mapStyle: "satellite-streets-v12",
    zoom: 16, pitch: 60, bearing: 120,
    terrainExaggeration: 4,
    fogRangeMin: 1, fogRangeMax: 3, fogColor: "#e8e0d0",
    fogHorizonBlend: 0.6, fogStarIntensity: 0,
    waterColor: "#2060a0", waterOpacity: 1,
    landColor: "#60a040",
    lineColor: "#ffffff", lineOpacity: 0.4, lineWidth: 0.5,
    buildingColor: "#d8c8a0", buildingOpacity: 0.9, buildingHeight: 2,
    ggbColor: "#FF2A00", ggbWidth: 6, ggbOpacity: 1,
    cssContrast: 1.3, cssBrightness: 1.3, cssSaturate: 2.5,
    grainOpacity: 0.15, vignetteIntensity: 0,
    paperOpacity: 0, halftoneOpacity: 0, displacementScale: 0, paperShaderOpacity: 0,
  },
  {
    // Like a relief map carved from stone. Monochrome, all terrain, heavy shadows.
    name: "Relief",
    zoom: 12.5, pitch: 50, bearing: -45,
    terrainExaggeration: 6,
    fogRangeMin: -0.5, fogRangeMax: 5, fogColor: "#808078",
    fogHorizonBlend: 0.2, fogStarIntensity: 0,
    waterColor: "#505048", waterOpacity: 1,
    landColor: "#909088",
    lineColor: "#a0a098", lineOpacity: 0.15, lineWidth: 0.3,
    buildingColor: "#98988e", buildingOpacity: 0.4, buildingHeight: 0.6,
    ggbColor: "#FF2A00", ggbWidth: 3, ggbOpacity: 0.8,
    cssContrast: 1.2, cssBrightness: 0.9, cssSaturate: 0,
    grainOpacity: 0.5, vignetteIntensity: 0.3,
    paperOpacity: 0.3, halftoneOpacity: 0, displacementScale: 0, paperShaderOpacity: 0,
    shaderOverride: {
      colorBack: "#b0b0a8", colorFront: "#606058", blendMode: "multiply",
      opacity: 0.3, contrast: 0.4, roughness: 0.95, fiber: 0.1, fiberSize: 0.05,
      crumples: 0.2, crumpleSize: 0.8, folds: 0, foldCount: 1,
      drops: 0.1, fade: 0.5, seed: 77, scale: 1.2,
    },
  },
  {
    // Blueprint/cyanotype. Deep blue, white lines, technical drawing feel.
    name: "Blueprint",
    zoom: 14.5, pitch: 0, bearing: 0,
    terrainExaggeration: 0,
    fogRangeMin: -1, fogRangeMax: 3, fogColor: "#0a1830",
    fogHorizonBlend: 0.1, fogStarIntensity: 0,
    waterColor: "#081428", waterOpacity: 1,
    landColor: "#0c1e3a",
    lineColor: "#88bbff", lineOpacity: 0.6, lineWidth: 0.6,
    buildingColor: "#102850", buildingOpacity: 0.3, buildingHeight: 0.4,
    ggbColor: "#ffcc00", ggbWidth: 2, ggbOpacity: 0.9,
    cssContrast: 1.1, cssBrightness: 0.9, cssSaturate: 1.8,
    grainOpacity: 0.6, vignetteIntensity: 0.2,
    paperOpacity: 0, halftoneOpacity: 0, displacementScale: 0, paperShaderOpacity: 0,
    shaderOverride: {
      colorBack: "#1a3060", colorFront: "#0a1830", blendMode: "soft-light",
      opacity: 0.5, contrast: 0.3, roughness: 0.6, fiber: 0.5, fiberSize: 0.3,
      crumples: 0.15, crumpleSize: 0.2, folds: 0.3, foldCount: 10,
      drops: 0, fade: 0.8, seed: 42, scale: 0.15,
    },
  },
  {
    // Everything is the grid. No fill, just the bones of the street network.
    name: "Skeleton",
    zoom: 13, pitch: 0, bearing: 0,
    terrainExaggeration: 0,
    fogRangeMin: -2, fogRangeMax: 2, fogColor: "#000000",
    fogHorizonBlend: 0, fogStarIntensity: 0,
    waterColor: "#000000", waterOpacity: 1,
    landColor: "#000000",
    lineColor: "#FF2A00", lineOpacity: 0.4, lineWidth: 0.5,
    buildingColor: "#000000", buildingOpacity: 0, buildingHeight: 0,
    ggbColor: "#ffffff", ggbWidth: 2, ggbOpacity: 1,
    cssContrast: 1.8, cssBrightness: 0.6, cssSaturate: 1,
    grainOpacity: 0.3, vignetteIntensity: 0,
    paperOpacity: 0, halftoneOpacity: 0, displacementScale: 0, paperShaderOpacity: 0,
  },
  {
    // Dense city model. Max zoom, max buildings, max detail. See every block.
    name: "Concrete",
    zoom: 15.5, pitch: 55, bearing: 170,
    terrainExaggeration: 1,
    fogRangeMin: 0.5, fogRangeMax: 4, fogColor: "#c8c0b0",
    fogHorizonBlend: 0.08, fogStarIntensity: 0,
    waterColor: "#a0b8c0", waterOpacity: 1,
    landColor: "#b8b0a0",
    lineColor: "#888078", lineOpacity: 0.5, lineWidth: 0.8,
    buildingColor: "#a09888", buildingOpacity: 0.9, buildingHeight: 2.5,
    ggbColor: "#FF2A00", ggbWidth: 4, ggbOpacity: 1,
    cssContrast: 1.0, cssBrightness: 1.1, cssSaturate: 0.3,
    grainOpacity: 0.4, vignetteIntensity: 0.15,
    paperOpacity: 0, halftoneOpacity: 0, displacementScale: 0, paperShaderOpacity: 0,
    shaderOverride: {
      colorBack: "#d0c8b8", colorFront: "#908880", blendMode: "multiply",
      opacity: 0.35, contrast: 0.5, roughness: 0.85, fiber: 0.15, fiberSize: 0.1,
      crumples: 0.5, crumpleSize: 0.4, folds: 0.1, foldCount: 5,
      drops: 0.3, fade: 0.4, seed: 88, scale: 0.7,
    },
  },
  {
    // Infrared/thermal. Inverted colors, otherworldly, like a heat map of the city.
    name: "Thermal",
    zoom: 13.5, pitch: 40, bearing: 90,
    terrainExaggeration: 2,
    fogRangeMin: 0, fogRangeMax: 5, fogColor: "#180028",
    fogHorizonBlend: 0.1, fogStarIntensity: 0.3,
    waterColor: "#000020", waterOpacity: 1,
    landColor: "#1a0030",
    lineColor: "#ff6020", lineOpacity: 0.5, lineWidth: 1.2,
    buildingColor: "#ff2060", buildingOpacity: 0.6, buildingHeight: 2,
    ggbColor: "#00ffff", ggbWidth: 4, ggbOpacity: 1,
    cssContrast: 1.3, cssBrightness: 0.9, cssSaturate: 2,
    grainOpacity: 0.5, vignetteIntensity: 0.5,
    paperOpacity: 0, halftoneOpacity: 0.15, displacementScale: 0, paperShaderOpacity: 0,
  },
  {
    // Wabi-sabi. Warm, worn, crumpled, folded, stained. Every texture layer at once.
    name: "Wabi-Sabi",
    zoom: 13, pitch: 10, bearing: 5,
    terrainExaggeration: 0.8,
    fogRangeMin: -0.5, fogRangeMax: 6, fogColor: "#c8b898",
    fogHorizonBlend: 0.25, fogStarIntensity: 0,
    waterColor: "#8a9898", waterOpacity: 1,
    landColor: "#c0b090",
    lineColor: "#6a5a40", lineOpacity: 0.25, lineWidth: 0.5,
    buildingColor: "#b0a080", buildingOpacity: 0.25, buildingHeight: 0.5,
    ggbColor: "#8b2000", ggbWidth: 2, ggbOpacity: 0.5,
    cssContrast: 0.85, cssBrightness: 1.6, cssSaturate: 0.5,
    grainOpacity: 1, vignetteIntensity: 0.15,
    paperOpacity: 0.7, halftoneOpacity: 0.1, displacementScale: 5, paperShaderOpacity: 0,
    shaderOverride: {
      colorBack: "#d8c8a0", colorFront: "#8a7a58", blendMode: "multiply",
      opacity: 0.85, contrast: 0.7, roughness: 1, fiber: 0.9, fiberSize: 0.5,
      crumples: 0.9, crumpleSize: 0.7, folds: 0.8, foldCount: 6,
      drops: 0.8, fade: 0.15, seed: 22, scale: 0.4,
    },
  },
]

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

export default function Direction15() {
  useEffect(() => { document.title = "D17 — Map World" }, [])
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [ready, setReady] = useState(false)
  const cursor = useRedCursor()
  const [activePreset, setActivePreset] = useState(0)
  const [shaderOpen, setShaderOpen] = useState(false)
  const [shaderParams, setShaderParams] = useState({
    colorBack: "#e8dcc4",
    colorFront: "#9f9080",
    contrast: 0.3,
    roughness: 0.45,
    fiber: 0.35,
    fiberSize: 0.2,
    crumples: 0.3,
    crumpleSize: 0.35,
    folds: 0.65,
    foldCount: 5,
    drops: 0.2,
    fade: 0,
    seed: 6,
    scale: 0.6,
    opacity: 0.8,
    blendMode: "multiply" as string,
  })

  // Coordinates of interest
  const landmarks: { name: string; coords: [number, number]; label: string; photo?: string }[] = [
    { name: "Transamerica Pyramid", coords: [-122.4027, 37.7952], label: "Transamerica", photo: "/photos/transamerica.jpeg" },
    { name: "Fort Mason", coords: [-122.4316, 37.8035], label: "Fort Mason", photo: "/photos/fort-mason.jpeg" },
    { name: "Lombard Street", coords: [-122.4186, 37.8021], label: "Lombard St", photo: "/photos/lombard.jpeg" },
    { name: "William Stout Architectural Books", coords: [-122.4028, 37.7962], label: "Stout Books" },
    { name: "North Beach Psychic", coords: [-122.4084, 37.7999], label: "Psychic" },
    { name: "Coffee Roastery", coords: [-122.4400, 37.8005], label: "Roastery" },
    { name: "Alcatraz View", coords: [-122.4120, 37.8060], label: "North Point", photo: "/photos/alcatraz-view.jpeg" },
    { name: "SOMA", coords: [-122.3986, 37.7785], label: "Launch site" },
    { name: "Ferry Building", coords: [-122.3937, 37.7956], label: "Ferry Bldg" },
    { name: "Coit Tower", coords: [-122.4058, 37.8024], label: "Coit Tower", photo: "/photos/coit-tower.jpeg" },
    { name: "Mission Dolores", coords: [-122.4270, 37.7600], label: "Mission" },
    { name: "Fort Point View Point", coords: [-122.4734, 37.8090], label: "Fort Point", photo: "/photos/fort-point.jpeg" },
    { name: "Legion of Honor", coords: [-122.4997, 37.7846], label: "Legion of Honor" },
    { name: "Golden Gate Bridge", coords: [-122.4783, 37.8199], label: "GG Bridge" },
  ]

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return
    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
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

      // Terrain
      m.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      })
      m.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 })

      // Fog
      m.setFog({
        range: [-2, 2],
        color: "#f5f2ec",
        "horizon-blend": 1,
        "high-color": "#f5f2ec",
        "space-color": "#f5f2ec",
        "star-intensity": 0,
      })

      // Restyle layers — inverted etched look (white bg, black lines)
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
        }
      }

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

      // Buildings — light outlined extrusions
      m.addLayer({
        id: "buildings-3d",
        source: "composite",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 1,
        paint: {
          "fill-extrusion-color": "#1a1a1a",
          "fill-extrusion-height": ["*", ["get", "height"], 0.8],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.12,
        },
      })

      setReady(true)

      // Capture paper shader canvas and add as map image source
      setTimeout(() => {
        if (!paperShaderRef.current) return
        const shaderCanvas = paperShaderRef.current.querySelector("canvas")
        if (!shaderCanvas) return
        const dataUrl = shaderCanvas.toDataURL("image/png")

        // Cover the full maxBounds area with the paper texture
        const bounds: [[number, number], [number, number], [number, number], [number, number]] = [
          [-122.55, 37.85],  // top-left
          [-122.30, 37.85],  // top-right
          [-122.30, 37.70],  // bottom-right
          [-122.55, 37.70],  // bottom-left
        ]

        if (!m.getSource("paper-texture")) {
          m.addSource("paper-texture", {
            type: "image",
            url: dataUrl,
            coordinates: bounds,
          })
          m.addLayer({
            id: "paper-texture-layer",
            type: "raster",
            source: "paper-texture",
            paint: {
              "raster-opacity": 0,
              "raster-fade-duration": 0,
            },
          })
        }
      }, 1500) // wait for shader to render
    })

    // Add markers
    for (const lm of landmarks) {
      const el = document.createElement("div")
      if (lm.photo) {
        // Outer wrapper stays fixed size for Mapbox anchoring
        el.style.cssText = `width: 70px; height: 70px; cursor: none;`
        // Inner element handles the visual + hover scale
        const inner = document.createElement("div")
        inner.style.cssText = `
          width: 100%; height: 100%; border: 1px solid rgba(255,255,255,0.15);
          overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 2px 12px rgba(0,0,0,0.5); transform-origin: center center;
        `
        inner.innerHTML = `<img src="${lm.photo}" style="width:100%;height:100%;object-fit:cover;filter:saturate(1) contrast(1.1);" />`
        inner.onmouseenter = () => { inner.style.transform = "scale(1.8)"; inner.style.boxShadow = "0 4px 24px rgba(0,0,0,0.7)" }
        inner.onmouseleave = () => { inner.style.transform = "scale(1)"; inner.style.boxShadow = "0 2px 12px rgba(0,0,0,0.5)" }
        el.appendChild(inner)
        photoMarkers.current.push(el)
      } else {
        el.style.cssText = `
          width: 14px; height: 14px; border-radius: 50%;
          background: #FF2A00; box-shadow: 0 0 12px rgba(255,42,0,0.6), 0 0 24px rgba(255,42,0,0.3);
          border: 2px solid rgba(255,255,255,0.4);
        `
      }
      new mapboxgl.Marker({ element: el })
        .setLngLat(lm.coords)
        .addTo(m)
    }

    return () => {
      m.remove()
      mapRef.current = null
    }
  }, [])

  // BroadcastChannel listener for live control panel
  const mapContainerOuter = useRef<HTMLDivElement>(null)
  const grainRef = useRef<HTMLDivElement>(null)
  const vignetteRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLDivElement>(null)
  const halftoneRef = useRef<HTMLDivElement>(null)
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null)
  const paperShaderRef = useRef<HTMLDivElement>(null)

  const photoMarkers = useRef<HTMLDivElement[]>([])

  const applyStyleOverrides = (m: mapboxgl.Map, p: Preset) => {
    // Layer styles
    for (const layer of m.getStyle().layers || []) {
      if (layer.type === "symbol") {
        m.setLayoutProperty(layer.id, "visibility", "none")
      }
      if (layer.type === "fill" && layer.id !== "ggb") {
        if (layer["source-layer"] === "water") {
          m.setPaintProperty(layer.id, "fill-color", p.waterColor)
          m.setPaintProperty(layer.id, "fill-opacity", p.waterOpacity)
        } else {
          m.setPaintProperty(layer.id, "fill-color", p.landColor)
        }
      }
      if (layer.type === "line" && layer.id !== "ggb") {
        m.setPaintProperty(layer.id, "line-color", p.lineColor)
        m.setPaintProperty(layer.id, "line-opacity", p.lineOpacity)
        try { m.setPaintProperty(layer.id, "line-width", p.lineWidth) } catch (_) {}
      }
    }

    // Re-add custom layers if they were lost in style switch
    if (!m.getSource("mapbox-dem")) {
      m.addSource("mapbox-dem", { type: "raster-dem", url: "mapbox://mapbox.mapbox-terrain-dem-v1", tileSize: 512, maxzoom: 14 })
    }
    try { m.setTerrain({ source: "mapbox-dem", exaggeration: p.terrainExaggeration }) } catch (_) {}

    if (!m.getLayer("ggb")) {
      m.addLayer({ id: "ggb", source: "composite", "source-layer": "road", type: "line",
        filter: ["any", ["==", ["get", "name"], "Golden Gate Bridge"], ["==", ["get", "name_en"], "Golden Gate Bridge"]],
        paint: { "line-color": p.ggbColor, "line-width": p.ggbWidth, "line-opacity": p.ggbOpacity },
      })
    } else {
      m.setPaintProperty("ggb", "line-color", p.ggbColor)
      m.setPaintProperty("ggb", "line-width", p.ggbWidth)
      m.setPaintProperty("ggb", "line-opacity", p.ggbOpacity)
    }

    if (!m.getLayer("buildings-3d")) {
      m.addLayer({ id: "buildings-3d", source: "composite", "source-layer": "building", type: "fill-extrusion", minzoom: 1,
        paint: { "fill-extrusion-color": p.buildingColor, "fill-extrusion-height": ["*", ["get", "height"], p.buildingHeight], "fill-extrusion-base": ["get", "min_height"], "fill-extrusion-opacity": p.buildingOpacity },
      })
    } else {
      m.setPaintProperty("buildings-3d", "fill-extrusion-color", p.buildingColor)
      m.setPaintProperty("buildings-3d", "fill-extrusion-opacity", p.buildingOpacity)
      m.setPaintProperty("buildings-3d", "fill-extrusion-height", ["*", ["get", "height"], p.buildingHeight])
    }

    // Fog
    m.setFog({ range: [p.fogRangeMin, p.fogRangeMax], color: p.fogColor, "horizon-blend": p.fogHorizonBlend, "high-color": p.fogColor, "space-color": p.fogColor, "star-intensity": p.fogStarIntensity })

    // Re-add paper texture layer after style switch
    if (!m.getSource("paper-texture") && paperShaderRef.current) {
      const shaderCanvas = paperShaderRef.current.querySelector("canvas")
      if (shaderCanvas) {
        const dataUrl = shaderCanvas.toDataURL("image/png")
        const bounds: [[number, number], [number, number], [number, number], [number, number]] = [
          [-122.55, 37.85], [-122.30, 37.85], [-122.30, 37.70], [-122.55, 37.70],
        ]
        m.addSource("paper-texture", { type: "image", url: dataUrl, coordinates: bounds })
        m.addLayer({ id: "paper-texture-layer", type: "raster", source: "paper-texture", paint: { "raster-opacity": p.paperShaderOpacity, "raster-fade-duration": 0 } })
      }
    } else {
      try { m.setPaintProperty("paper-texture-layer", "raster-opacity", p.paperShaderOpacity) } catch (_) {}
    }
  }

  const applyPreset = (p: Preset, animated = true) => {
    const m = mapRef.current
    if (!m) return

    const dur = animated ? 800 : 0

    // Camera
    if (dur > 0) {
      m.easeTo({ zoom: p.zoom, pitch: p.pitch, bearing: p.bearing, duration: dur })
    } else {
      m.jumpTo({ zoom: p.zoom, pitch: p.pitch, bearing: p.bearing })
    }

    // Style switch (satellite vs vector)
    const targetStyle = p.mapStyle || "dark-v11"
    const currentSprite = m.getStyle()?.sprite
    const needsStyleSwitch = currentSprite && !currentSprite.toString().includes(targetStyle)
    if (needsStyleSwitch) {
      m.once("style.load", () => applyStyleOverrides(m, p))
      m.setStyle(`mapbox://styles/mapbox/${targetStyle}`)
    } else {
      applyStyleOverrides(m, p)
    }

    // CSS filters
    if (mapContainerOuter.current) {
      const canvas = mapContainerOuter.current.querySelector(".mapboxgl-canvas-container")?.parentElement
      if (canvas) canvas.style.filter = `contrast(${p.cssContrast}) brightness(${p.cssBrightness}) saturate(${p.cssSaturate})`
    }

    // Update page background to match preset
    const isLight = p.mapStyle === "light-v11" || p.landColor > "#888888"
    const bg = isLight ? p.landColor : (p.fogColor || "#0a0a0a")
    document.body.style.backgroundColor = bg
    const root = document.querySelector<HTMLDivElement>("[data-map-root]")
    if (root) root.style.background = bg

    // Grain + vignette + textures
    if (grainRef.current) grainRef.current.style.opacity = String(p.grainOpacity)
    if (vignetteRef.current) {
      vignetteRef.current.style.background = `radial-gradient(ellipse at center, transparent 25%, rgba(10,10,10,0.45) 60%, rgba(10,10,10,${p.vignetteIntensity}) 100%)`
    }
    if (paperRef.current) paperRef.current.style.opacity = String(p.paperOpacity)
    if (halftoneRef.current) halftoneRef.current.style.opacity = String(p.halftoneOpacity)
    // Paper shader as map layer
    try { m.setPaintProperty("paper-texture-layer", "raster-opacity", p.paperShaderOpacity) } catch (_) {}
    // Displacement filter on the map canvas
    if (displacementRef.current) displacementRef.current.setAttribute("scale", String(p.displacementScale))
    if (mapContainerOuter.current) {
      const mapDiv = mapContainerOuter.current.querySelector("div") as HTMLDivElement
      if (mapDiv) {
        const existingFilter = mapDiv.style.filter || ""
        const base = existingFilter.replace(/url\(#map-displace\)\s*/g, "").trim()
        mapDiv.style.filter = p.displacementScale > 0 ? `url(#map-displace) ${base}` : base
      }
    }

    // Apply shader override if preset has one, otherwise hide shader
    if (p.shaderOverride) {
      setShaderParams(prev => ({ ...prev, ...p.shaderOverride }))
    } else {
      setShaderParams(prev => ({ ...prev, opacity: 0 }))
    }
  }

  // BroadcastChannel listener for live control panel
  useEffect(() => {
    const channel = new BroadcastChannel("sota-map-controls")
    channel.onmessage = (e) => {
      const p = e.data
      const m = mapRef.current
      if (!m) return

      const dur = p.transitionDuration || 0
      if (dur > 0) {
        m.easeTo({ center: [p.centerLng, p.centerLat], zoom: p.zoom, pitch: p.pitch, bearing: p.bearing, duration: dur })
      } else {
        m.jumpTo({ center: [p.centerLng, p.centerLat], zoom: p.zoom, pitch: p.pitch, bearing: p.bearing })
      }
      m.setMinZoom(p.minZoom); m.setMaxZoom(p.maxZoom)
      try { m.setProjection(p.projection) } catch (_) {}
      if (p.mapStyle && !m.getStyle()?.sprite?.includes(p.mapStyle)) {
        m.setStyle(`mapbox://styles/mapbox/${p.mapStyle}`)
      }
      try { if (m.getSource("mapbox-dem")) m.setTerrain({ source: "mapbox-dem", exaggeration: p.terrainExaggeration }) } catch (_) {}
      m.setFog({ range: [p.fogRangeMin, p.fogRangeMax], color: p.fogColor, "horizon-blend": p.fogHorizonBlend, "high-color": p.fogColor, "space-color": p.fogColor, "star-intensity": p.fogStarIntensity })
      try { if (p.skyEnabled) { m.setSky({ "sky-color": p.skyAtmosphereColor, "sky-horizon-blend": 0.5, "horizon-color": p.skyAtmosphereColor, "horizon-fog-blend": 0.5, "fog-color": p.fogColor, "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 12, 0] }) } else { m.setSky({}) } } catch (_) {}
      try { m.setLight({ anchor: p.lightAnchor as "viewport" | "map", color: p.lightColor, intensity: p.lightIntensity, position: p.lightPosition }) } catch (_) {}
      for (const layer of m.getStyle().layers || []) {
        if (layer.type === "symbol") m.setLayoutProperty(layer.id, "visibility", p.labelsVisible ? "visible" : "none")
        if (layer.type === "fill" && layer.id !== "ggb") {
          if (layer["source-layer"] === "water") { m.setPaintProperty(layer.id, "fill-color", p.waterColor); m.setPaintProperty(layer.id, "fill-opacity", p.waterOpacity) }
          else m.setPaintProperty(layer.id, "fill-color", p.landColor)
        }
        if (layer.type === "line" && layer.id !== "ggb") { m.setPaintProperty(layer.id, "line-color", p.lineColor); m.setPaintProperty(layer.id, "line-opacity", p.lineOpacity); try { m.setPaintProperty(layer.id, "line-width", p.lineWidth) } catch (_) {} }
      }
      try { m.setPaintProperty("buildings-3d", "fill-extrusion-color", p.buildingColor); m.setPaintProperty("buildings-3d", "fill-extrusion-opacity", p.buildingOpacity); m.setPaintProperty("buildings-3d", "fill-extrusion-height", ["*", ["get", "height"], p.buildingHeight]); m.setLayerZoomRange("buildings-3d", p.buildingMinZoom, 24) } catch (_) {}
      try { m.setPaintProperty("ggb", "line-color", p.ggbColor); m.setPaintProperty("ggb", "line-width", p.ggbWidth); m.setPaintProperty("ggb", "line-opacity", p.ggbOpacity) } catch (_) {}
      if (mapContainerOuter.current) { const canvas = mapContainerOuter.current.querySelector(".mapboxgl-canvas-container")?.parentElement; if (canvas) canvas.style.filter = `contrast(${p.cssContrast}) brightness(${p.cssBrightness}) saturate(${p.cssSaturate})` }
      for (const el of photoMarkers.current) { el.style.width = `${p.photoSize}px`; el.style.height = `${p.photoSize}px`; const inner = el.firstChild as HTMLDivElement; if (inner) inner.style.border = `${p.photoBorderWidth}px solid ${p.photoBorderColor}26` }
      if (grainRef.current) grainRef.current.style.opacity = String(p.grainOpacity)
      if (vignetteRef.current) vignetteRef.current.style.background = `radial-gradient(ellipse at center, transparent 25%, rgba(10,10,10,0.45) 60%, rgba(10,10,10,${p.vignetteIntensity}) 100%)`
    }
    return () => channel.close()
  }, [])

  // Body bg matches first preset
  useEffect(() => {
    document.body.style.setProperty("--grain-opacity", "0")
    document.body.style.backgroundColor = "#f5f2ec"
    return () => {
      document.body.style.removeProperty("--grain-opacity")
      document.body.style.backgroundColor = ""
    }
  }, [])

  return (
    <div
      className="w-screen overflow-hidden relative"
      data-map-root
      style={{ fontFamily: "'Space Mono', monospace", height: "100dvh", background: "#f5f2ec", cursor: "none" }}
    >
      {/* Map */}
      <div ref={mapContainerOuter} className="absolute inset-0 z-0">
        <div
          ref={mapContainer}
          className="w-full h-full"
          style={{ filter: "contrast(1.1) brightness(1.05) saturate(0)" }}
        />
      </div>

      {/* Grain overlay */}
      <div
        ref={grainRef}
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
          mixBlendMode: "overlay",
          opacity: 0,
        }}
      />

      {/* Vignette */}
      <div
        ref={vignetteRef}
        className="absolute inset-0 pointer-events-none z-[6]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 25%, rgba(10,10,10,0.45) 60%, rgba(10,10,10,0) 100%)",
        }}
      />

      {/* Paper fiber texture — coarse, organic noise */}
      <div
        ref={paperRef}
        className="absolute inset-0 pointer-events-none z-[7]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.035' numOctaves='5' seed='15' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "512px 512px",
          mixBlendMode: "soft-light",
          opacity: 0,
        }}
      />

      {/* Halftone dot screen */}
      <div
        ref={halftoneRef}
        className="absolute inset-0 pointer-events-none z-[8]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "4px 4px",
          mixBlendMode: "overlay",
          opacity: 0,
        }}
      />

      {/* Paper shader — renders to canvas, viewport overlay + captured as map layer */}
      <div
        ref={paperShaderRef}
        className="absolute inset-0 pointer-events-none z-[9]"
        style={{ mixBlendMode: shaderParams.blendMode, opacity: shaderParams.opacity }}
      >
        <PaperTexture
          width="100%"
          height="100%"
          colorBack={shaderParams.colorBack}
          colorFront={shaderParams.colorFront}
          contrast={shaderParams.contrast}
          roughness={shaderParams.roughness}
          fiber={shaderParams.fiber}
          fiberSize={shaderParams.fiberSize}
          crumples={shaderParams.crumples}
          crumpleSize={shaderParams.crumpleSize}
          folds={shaderParams.folds}
          foldCount={shaderParams.foldCount}
          drops={shaderParams.drops}
          fade={shaderParams.fade}
          seed={shaderParams.seed}
          scale={shaderParams.scale}
          fit="cover"
        />
      </div>

      {/* SVG displacement filter for map warp */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="map-displace" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" seed="42" result="warp" />
            <feDisplacementMap ref={displacementRef} in="SourceGraphic" in2="warp" scale="0" xChannelSelector="R" yChannelSelector="G" />
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
          className="uppercase text-white/30"
          style={{ fontSize: "clamp(8px, 0.7vw, 11px)", letterSpacing: "0.15em", lineHeight: 1.8 }}
        >
          37.7749° N, 122.4194° W<br />
          Edition 01 — State of the Art<br />
          April 2026
        </div>
      </div>


      {/* Preset toggle — bottom center, scrollable */}
      <div
        className="absolute bottom-[4vh] left-[12vw] right-[12vw] z-10 transition-opacity duration-1000"
        style={{ opacity: ready ? 1 : 0, overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex gap-[2px] justify-center flex-wrap" style={{ maxHeight: "72px" }}>
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => { setActivePreset(i); applyPreset(p) }}
              className="uppercase transition-all duration-300 whitespace-nowrap"
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: "clamp(7px, 0.55vw, 9px)",
                letterSpacing: "0.12em",
                padding: "4px 10px",
                background: activePreset === i ? "rgba(255,42,0,0.15)" : "rgba(10,10,10,0.6)",
                border: `1px solid ${activePreset === i ? "rgba(255,42,0,0.5)" : "rgba(255,255,255,0.08)"}`,
                color: activePreset === i ? "#FF2A00" : "rgba(255,255,255,0.3)",
                cursor: "none",
                backdropFilter: "blur(8px)",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom-left controls */}
      <div className="absolute bottom-[4vh] left-[4vw] z-10 flex items-center gap-4">
        <a
          href="/d12"
          className="uppercase text-white/25 hover:text-[#FF2A00] transition-colors"
          style={{ fontSize: "clamp(8px, 0.7vw, 11px)", letterSpacing: "0.12em", textDecoration: "none" }}
        >
          ← Back
        </a>
        <button
          onClick={() => setShaderOpen(!shaderOpen)}
          className="uppercase transition-all duration-300"
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(8px, 0.65vw, 10px)",
            letterSpacing: "0.15em",
            padding: "6px 14px",
            background: shaderOpen ? "rgba(255,42,0,0.15)" : "rgba(10,10,10,0.6)",
            border: `1px solid ${shaderOpen ? "rgba(255,42,0,0.5)" : "rgba(255,255,255,0.08)"}`,
            color: shaderOpen ? "#FF2A00" : "rgba(255,255,255,0.3)",
            cursor: "none",
            backdropFilter: "blur(8px)",
          }}
        >
          Paper Shader
        </button>
      </div>

      {/* Paper shader modal */}
      {shaderOpen && (
        <div
          className="absolute top-[3vh] right-[3vw] z-30 overflow-y-auto"
          style={{
            width: "280px",
            maxHeight: "90vh",
            background: "rgba(10,10,10,0.92)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            padding: "16px",
            fontFamily: "'Space Mono', monospace",
            fontSize: "10px",
            color: "#e8e4dc",
            cursor: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span className="uppercase" style={{ letterSpacing: "0.15em", fontSize: "11px" }}>Paper Shader</span>
            <button
              onClick={() => {
                const json = JSON.stringify(shaderParams, null, 2)
                navigator.clipboard.writeText(json)
              }}
              style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", fontFamily: "'Space Mono', monospace", fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase" as const, padding: "3px 8px", cursor: "pointer" }}
            >
              Copy
            </button>
          </div>

          {/* Colors */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.5)" }}>
              <input type="color" value={shaderParams.colorBack} onChange={(e) => setShaderParams(p => ({ ...p, colorBack: e.target.value }))} style={{ width: "24px", height: "24px", border: "1px solid rgba(255,255,255,0.1)", background: "none", padding: 0, cursor: "pointer" }} />
              Back
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.5)" }}>
              <input type="color" value={shaderParams.colorFront} onChange={(e) => setShaderParams(p => ({ ...p, colorFront: e.target.value }))} style={{ width: "24px", height: "24px", border: "1px solid rgba(255,255,255,0.1)", background: "none", padding: 0, cursor: "pointer" }} />
              Front
            </label>
          </div>

          {/* Blend mode */}
          <div style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Blend Mode</span>
              <select
                value={shaderParams.blendMode}
                onChange={(e) => setShaderParams(p => ({ ...p, blendMode: e.target.value }))}
                style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.15)", color: "#e8e4dc", fontFamily: "'Space Mono', monospace", fontSize: "9px", padding: "3px 6px", cursor: "pointer" }}
              >
                {["multiply", "overlay", "soft-light", "hard-light", "screen", "darken", "lighten", "color-burn", "color-dodge", "normal"].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sliders */}
          {([
            ["opacity", "Opacity", 0, 1, 0.05],
            ["contrast", "Contrast", 0, 1, 0.05],
            ["roughness", "Roughness", 0, 1, 0.05],
            ["fiber", "Fiber", 0, 1, 0.05],
            ["fiberSize", "Fiber Size", 0, 1, 0.05],
            ["crumples", "Crumples", 0, 1, 0.05],
            ["crumpleSize", "Crumple Size", 0, 1, 0.05],
            ["folds", "Folds", 0, 1, 0.05],
            ["foldCount", "Fold Count", 1, 15, 1],
            ["drops", "Drops", 0, 1, 0.05],
            ["fade", "Fade", 0, 1, 0.05],
            ["seed", "Seed", 0, 100, 0.1],
            ["scale", "Scale", 0.01, 4, 0.05],
          ] as [string, string, number, number, number][]).map(([key, label, min, max, step]) => (
            <div key={key} style={{ marginBottom: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1px" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
                <span className="tabular-nums" style={{ color: "rgba(255,255,255,0.7)" }}>
                  {(shaderParams[key as keyof typeof shaderParams] as number).toFixed(step < 1 ? 2 : 0)}
                </span>
              </div>
              <input
                type="range" min={min} max={max} step={step}
                value={shaderParams[key as keyof typeof shaderParams] as number}
                onChange={(e) => setShaderParams(p => ({ ...p, [key]: parseFloat(e.target.value) }))}
                style={{ width: "100%", accentColor: "#FF2A00" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Popup styles + hide default cursor on map canvas */}
      <style>{`
        .mapboxgl-canvas-container, .mapboxgl-canvas-container canvas,
        .mapboxgl-canvas-container.mapboxgl-interactive { cursor: none !important; }
        .sota-popup .mapboxgl-popup-content {
          background: rgba(10,10,10,0.92);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0;
          padding: 8px 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .sota-popup .mapboxgl-popup-tip {
          border-top-color: rgba(10,10,10,0.92);
        }
      `}</style>
    </div>
  )
}
