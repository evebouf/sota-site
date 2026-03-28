// MapControls: separate-tab control panel for D17 map parameters
// Communicates via BroadcastChannel so the map updates live

import { useState, useEffect, useCallback } from "react"

interface MapParams {
  // Camera
  zoom: number
  pitch: number
  bearing: number
  centerLng: number
  centerLat: number
  minZoom: number
  maxZoom: number
  // Projection
  projection: string
  // Map style
  mapStyle: string
  // Terrain & Fog
  terrainExaggeration: number
  fogRangeMin: number
  fogRangeMax: number
  fogColor: string
  fogHorizonBlend: number
  fogStarIntensity: number
  // Sky
  skyEnabled: boolean
  skyAtmosphereColor: string
  skySpaceColor: string
  skySunIntensity: number
  // Light
  lightAnchor: string
  lightColor: string
  lightIntensity: number
  lightPosition: [number, number, number]
  // Water & Land
  waterColor: string
  waterOpacity: number
  landColor: string
  lineColor: string
  lineOpacity: number
  lineWidth: number
  // Labels
  labelsVisible: boolean
  // Buildings
  buildingColor: string
  buildingOpacity: number
  buildingHeight: number
  buildingMinZoom: number
  // Golden Gate Bridge
  ggbColor: string
  ggbWidth: number
  ggbOpacity: number
  // Photo markers
  photoSize: number
  photoBorderWidth: number
  photoBorderColor: string
  // Post-Processing
  cssContrast: number
  cssBrightness: number
  cssSaturate: number
  grainOpacity: number
  vignetteIntensity: number
  // Transition
  transitionDuration: number
}

const defaults: MapParams = {
  zoom: 12.8,
  pitch: 0,
  bearing: 0,
  centerLng: -122.405609,
  centerLat: 37.791686,
  minZoom: 11,
  maxZoom: 16,
  projection: "mercator",
  mapStyle: "dark-v11",
  terrainExaggeration: 1.2,
  fogRangeMin: -0.5,
  fogRangeMax: 3,
  fogColor: "#0a0a0a",
  fogHorizonBlend: 0.05,
  fogStarIntensity: 0,
  skyEnabled: false,
  skyAtmosphereColor: "#1a1a2e",
  skySpaceColor: "#0a0a0a",
  skySunIntensity: 0,
  lightAnchor: "viewport",
  lightColor: "#ffffff",
  lightIntensity: 0.5,
  lightPosition: [1.5, 90, 80],
  waterColor: "#050505",
  waterOpacity: 1,
  landColor: "#0e0e0e",
  lineColor: "#ffffff",
  lineOpacity: 0.05,
  lineWidth: 1,
  labelsVisible: false,
  buildingColor: "#141414",
  buildingOpacity: 0.5,
  buildingHeight: 1,
  buildingMinZoom: 1,
  ggbColor: "#FF2A00",
  ggbWidth: 3,
  ggbOpacity: 0.9,
  photoSize: 70,
  photoBorderWidth: 1,
  photoBorderColor: "#ffffff",
  cssContrast: 1.3,
  cssBrightness: 0.7,
  cssSaturate: 0.2,
  grainOpacity: 0.7,
  vignetteIntensity: 0.85,
  transitionDuration: 300,
}

type SliderDef = { key: keyof MapParams; label: string; min: number; max: number; step: number }
type ColorDef = { key: keyof MapParams; label: string }
type ToggleDef = { key: keyof MapParams; label: string }
type SelectDef = { key: keyof MapParams; label: string; options: { value: string; label: string }[] }

const sections: { title: string; sliders?: SliderDef[]; colors?: ColorDef[]; toggles?: ToggleDef[]; selects?: SelectDef[] }[] = [
  {
    title: "Camera",
    sliders: [
      { key: "zoom", label: "Zoom", min: 1, max: 22, step: 0.1 },
      { key: "pitch", label: "Pitch", min: 0, max: 85, step: 1 },
      { key: "bearing", label: "Bearing", min: -180, max: 180, step: 1 },
      { key: "centerLng", label: "Center Lng", min: -122.55, max: -122.3, step: 0.001 },
      { key: "centerLat", label: "Center Lat", min: 37.7, max: 37.85, step: 0.001 },
      { key: "minZoom", label: "Min Zoom", min: 0, max: 22, step: 0.5 },
      { key: "maxZoom", label: "Max Zoom", min: 0, max: 22, step: 0.5 },
    ],
    selects: [
      { key: "projection", label: "Projection", options: [
        { value: "mercator", label: "Mercator" },
        { value: "globe", label: "Globe" },
      ]},
    ],
  },
  {
    title: "Map Style",
    selects: [
      { key: "mapStyle", label: "Base Style", options: [
        { value: "dark-v11", label: "Dark" },
        { value: "light-v11", label: "Light" },
        { value: "satellite-v9", label: "Satellite" },
        { value: "satellite-streets-v12", label: "Satellite Streets" },
        { value: "streets-v12", label: "Streets" },
        { value: "outdoors-v12", label: "Outdoors" },
        { value: "navigation-night-v1", label: "Navigation Night" },
      ]},
    ],
  },
  {
    title: "Terrain & Fog",
    sliders: [
      { key: "terrainExaggeration", label: "Terrain Exaggeration", min: 0, max: 5, step: 0.1 },
      { key: "fogRangeMin", label: "Fog Range Min", min: -2, max: 5, step: 0.1 },
      { key: "fogRangeMax", label: "Fog Range Max", min: 0, max: 15, step: 0.1 },
      { key: "fogHorizonBlend", label: "Horizon Blend", min: 0, max: 1, step: 0.01 },
      { key: "fogStarIntensity", label: "Star Intensity", min: 0, max: 1, step: 0.01 },
    ],
    colors: [{ key: "fogColor", label: "Fog Color" }],
  },
  {
    title: "Sky & Atmosphere",
    sliders: [
      { key: "skySunIntensity", label: "Sun Intensity", min: 0, max: 20, step: 0.5 },
    ],
    colors: [
      { key: "skyAtmosphereColor", label: "Atmosphere" },
      { key: "skySpaceColor", label: "Space" },
    ],
    toggles: [{ key: "skyEnabled", label: "Sky Enabled" }],
  },
  {
    title: "Light & Shadows",
    sliders: [
      { key: "lightIntensity", label: "Intensity", min: 0, max: 1, step: 0.05 },
      { key: "lightPosition", label: "Sun Azimuth", min: 0, max: 360, step: 1 },
    ],
    colors: [{ key: "lightColor", label: "Color" }],
    selects: [
      { key: "lightAnchor", label: "Anchor", options: [
        { value: "viewport", label: "Viewport" },
        { value: "map", label: "Map" },
      ]},
    ],
  },
  {
    title: "Water & Land",
    sliders: [
      { key: "waterOpacity", label: "Water Opacity", min: 0, max: 1, step: 0.05 },
      { key: "lineOpacity", label: "Road Opacity", min: 0, max: 1, step: 0.01 },
      { key: "lineWidth", label: "Road Width", min: 0, max: 5, step: 0.1 },
    ],
    colors: [
      { key: "waterColor", label: "Water" },
      { key: "landColor", label: "Land" },
      { key: "lineColor", label: "Roads" },
    ],
    toggles: [{ key: "labelsVisible", label: "Show Labels" }],
  },
  {
    title: "Buildings",
    sliders: [
      { key: "buildingOpacity", label: "Opacity", min: 0, max: 1, step: 0.05 },
      { key: "buildingHeight", label: "Height Multiplier", min: 0, max: 5, step: 0.1 },
      { key: "buildingMinZoom", label: "Min Zoom", min: 0, max: 18, step: 0.5 },
    ],
    colors: [{ key: "buildingColor", label: "Color" }],
  },
  {
    title: "Golden Gate Bridge",
    sliders: [
      { key: "ggbWidth", label: "Width", min: 0, max: 10, step: 0.5 },
      { key: "ggbOpacity", label: "Opacity", min: 0, max: 1, step: 0.05 },
    ],
    colors: [{ key: "ggbColor", label: "Color" }],
  },
  {
    title: "Photo Markers",
    sliders: [
      { key: "photoSize", label: "Size (px)", min: 20, max: 200, step: 5 },
      { key: "photoBorderWidth", label: "Border Width", min: 0, max: 5, step: 0.5 },
    ],
    colors: [{ key: "photoBorderColor", label: "Border Color" }],
  },
  {
    title: "Post-Processing",
    sliders: [
      { key: "cssContrast", label: "Contrast", min: 0.5, max: 3, step: 0.05 },
      { key: "cssBrightness", label: "Brightness", min: 0.1, max: 2, step: 0.05 },
      { key: "cssSaturate", label: "Saturation", min: 0, max: 3, step: 0.05 },
      { key: "grainOpacity", label: "Grain", min: 0, max: 1, step: 0.05 },
      { key: "vignetteIntensity", label: "Vignette", min: 0, max: 1, step: 0.05 },
      { key: "transitionDuration", label: "Transition Speed (ms)", min: 0, max: 2000, step: 50 },
    ],
  },
]

export default function MapControls() {
  const [params, setParams] = useState<MapParams>(defaults)
  const channel = new BroadcastChannel("sota-map-controls")

  useEffect(() => {
    document.title = "Map Controls"
    document.body.style.backgroundColor = "#111"
    document.body.style.setProperty("cursor", "auto", "important")
    const style = document.createElement("style")
    style.textContent = "* { cursor: auto !important; } input[type=range] { cursor: pointer !important; } input[type=color] { cursor: pointer !important; } button { cursor: pointer !important; } select { cursor: pointer !important; }"
    document.head.appendChild(style)
    return () => { document.body.style.backgroundColor = ""; document.body.style.removeProperty("cursor"); style.remove() }
  }, [])

  const send = useCallback(
    (p: MapParams) => { channel.postMessage(p) },
    [channel]
  )

  const update = (key: keyof MapParams, value: number | string | boolean) => {
    const next = { ...params, [key]: value }
    setParams(next)
    send(next)
  }

  // Special handler for light position (azimuth slider controls second element)
  const updateLightAzimuth = (azimuth: number) => {
    const next = { ...params, lightPosition: [params.lightPosition[0], azimuth, params.lightPosition[2]] as [number, number, number] }
    setParams(next)
    send(next)
  }

  const reset = () => { setParams(defaults); send(defaults) }
  const exportParams = () => { navigator.clipboard.writeText(JSON.stringify(params, null, 2)) }

  return (
    <div
      style={{
        fontFamily: "'Space Mono', monospace",
        color: "#e8e4dc",
        padding: "24px",
        maxWidth: "420px",
        margin: "0 auto",
        fontSize: "11px",
        paddingBottom: "80px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: "13px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Map Controls
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={exportParams} style={btnStyle}>Copy JSON</button>
          <button onClick={reset} style={btnStyle}>Reset</button>
        </div>
      </div>

      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", marginBottom: "24px", letterSpacing: "0.1em" }}>
        Open /d17 in another tab. Changes update live.
      </div>

      {sections.map((section) => (
        <div key={section.title} style={{ marginBottom: "20px" }}>
          <div style={{
            fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#FF2A00", marginBottom: "10px",
            borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "6px",
          }}>
            {section.title}
          </div>

          {/* Selects */}
          {section.selects?.map((s) => (
            <div key={s.key} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</span>
                <select
                  value={params[s.key] as string}
                  onChange={(e) => update(s.key, e.target.value)}
                  style={selectStyle}
                >
                  {s.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          {/* Toggles */}
          {section.toggles?.map((t) => (
            <div key={t.key} style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{t.label}</span>
              <button
                onClick={() => update(t.key, !params[t.key])}
                style={{
                  ...btnStyle,
                  background: params[t.key] ? "rgba(255,42,0,0.2)" : "none",
                  borderColor: params[t.key] ? "#FF2A00" : "rgba(255,255,255,0.15)",
                  color: params[t.key] ? "#FF2A00" : "rgba(255,255,255,0.5)",
                }}
              >
                {params[t.key] ? "ON" : "OFF"}
              </button>
            </div>
          ))}

          {/* Sliders */}
          {section.sliders?.map((s) => {
            // Special case for light position azimuth
            if (s.key === "lightPosition") {
              return (
                <div key={s.key} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</span>
                    <span className="tabular-nums" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {params.lightPosition[1].toFixed(0)}°
                    </span>
                  </div>
                  <input
                    type="range" min={s.min} max={s.max} step={s.step}
                    value={params.lightPosition[1]}
                    onChange={(e) => updateLightAzimuth(parseFloat(e.target.value))}
                    style={{ width: "100%", accentColor: "#FF2A00" }}
                  />
                </div>
              )
            }
            return (
              <div key={s.key} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>{s.label}</span>
                  <span className="tabular-nums" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {typeof params[s.key] === "number" ? (params[s.key] as number).toFixed(String(s.step).split(".")[1]?.length || 0) : params[s.key]}
                  </span>
                </div>
                <input
                  type="range" min={s.min} max={s.max} step={s.step}
                  value={params[s.key] as number}
                  onChange={(e) => update(s.key, parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: "#FF2A00" }}
                />
              </div>
            )
          })}

          {/* Colors */}
          {section.colors && (
            <div style={{ display: "flex", gap: "12px", marginTop: "6px", flexWrap: "wrap" }}>
              {section.colors.map((c) => (
                <label key={c.key} style={{ display: "flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.5)" }}>
                  <input
                    type="color"
                    value={params[c.key] as string}
                    onChange={(e) => update(c.key, e.target.value)}
                    style={{ width: "24px", height: "24px", border: "1px solid rgba(255,255,255,0.1)", background: "none", padding: 0 }}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "rgba(255,255,255,0.5)",
  fontFamily: "'Space Mono', monospace",
  fontSize: "9px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  padding: "4px 10px",
}

const selectStyle: React.CSSProperties = {
  background: "#1a1a1a",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#e8e4dc",
  fontFamily: "'Space Mono', monospace",
  fontSize: "9px",
  letterSpacing: "0.08em",
  padding: "4px 8px",
}
