// Secret Admin — Acts of Attention observation manager

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// Load Trade Gothic Heavy + Neue Haas Grotesk
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
  .secret-root, .secret-root * { cursor: auto !important; }
  .secret-root button, .secret-root a { cursor: pointer !important; }
`
if (!document.querySelector('[data-secret-fonts]')) {
  fontStyle.setAttribute('data-secret-fonts', '')
  document.head.appendChild(fontStyle)
}

type Observation = {
  id: string
  text: string
  lat: number
  lng: number
  created_at: string
  observer_id: number
  image_url: string | null
}

export default function Secret() {
  useEffect(() => { document.title = "Admin — Acts of Attention" }, [])


  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [locationNames, setLocationNames] = useState<Record<string, string>>({})
  const geocodeQueue = useRef<Set<string>>(new Set())

  const loadObservations = useCallback(async () => {
    const { data, error } = await supabase
      .from("observations")
      .select("id, text, lat, lng, created_at, observer_id")
      .order("created_at", { ascending: false })
    if (error) { console.error("Failed to load:", error); return }
    setObservations((data || []) as Observation[])
    setLoading(false)
  }, [])

  useEffect(() => { loadObservations() }, [loadObservations])

  // Reverse geocode all observations
  useEffect(() => {
    if (!MAPBOX_TOKEN || observations.length === 0) return
    observations.forEach(obs => {
      const key = `${obs.lat.toFixed(4)},${obs.lng.toFixed(4)}`
      if (locationNames[key] || geocodeQueue.current.has(key)) return
      geocodeQueue.current.add(key)
      fetch(`https://api.mapbox.com/search/geocode/v6/reverse?longitude=${obs.lng}&latitude=${obs.lat}&access_token=${MAPBOX_TOKEN}&types=address,street,neighborhood&limit=1`)
        .then(r => r.json())
        .then(data => {
          const feat = data.features?.[0]
          if (!feat) return
          const props = feat.properties
          const ctx = props.context || {}
          const street = ctx.street?.name || props.name || ""
          const neighborhood = ctx.neighborhood?.name || ""
          let name = ""
          if (street && neighborhood) name = `${street}, ${neighborhood}`
          else name = street || neighborhood
          if (name) setLocationNames(prev => ({ ...prev, [key]: name }))
        })
        .catch(() => {})
    })
  }, [observations])

  const relativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d ago`
    return `${Math.floor(days / 30)}mo ago`
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      + " " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      + ` (${relativeTime(iso)})`
  }

  return (
    <div
      className="secret-root"
      style={{
        minHeight: "100dvh",
        background: "#ffffff",
        fontFamily: "'Space Mono', monospace",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "#ffffff",
          borderBottom: "1.5px solid #1a1a1a",
          padding: "16px 32px",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span
            style={{
              fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
              fontSize: 11,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              transform: "scaleX(0.75)",
              transformOrigin: "left",
              display: "inline-block",
              color: "#1a1a1a",
            }}
          >
            Acts of Attention
          </span>
          <span
            style={{
              fontSize: 9,
              letterSpacing: "0.1em",
              color: "rgba(0,0,0,0.3)",
            }}
          >
            admin
          </span>
        </div>
        <a
          href="/"
          style={{
            fontFamily: "'Trade Gothic Heavy', 'Arial Black', sans-serif",
            fontSize: 9,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#ffffff",
            textDecoration: "none",
            background: "#1a1a1a",
            padding: "8px 16px",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.7" }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1" }}
        >
          View Map
        </a>
      </div>

      {/* List */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 32px 80px" }}>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 0" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${observations.length} observations...`}
            style={{
              width: "100%",
              padding: "8px 14px",
              fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
              fontSize: 13,
              color: "#1a1a1a",
              background: "#f5f5f5",
              border: "1px solid #e0e0e0",
              outline: "none",
              borderRadius: 0,
            }}
          />
          {searchQuery && (
            <span style={{ fontSize: 9, letterSpacing: "0.1em", color: "rgba(0,0,0,0.3)", whiteSpace: "nowrap" }}>
              {observations.filter(o => o.text.toLowerCase().includes(searchQuery.toLowerCase())).length} found
            </span>
          )}
        </div>
        {loading && (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              fontSize: 9,
              letterSpacing: "0.1em",
              color: "rgba(0,0,0,0.3)",
            }}
          >
            loading...
          </div>
        )}

        {observations.filter(o => !searchQuery || o.text.toLowerCase().includes(searchQuery.toLowerCase())).map((obs, i) => (
          <div
            key={obs.id}
            style={{
              borderBottom: i < observations.length - 1 ? "1px solid rgba(0,0,0,0.08)" : "none",
              padding: "16px 0",
            }}
          >
            {/* Metadata */}
            <div style={{ marginBottom: 6 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF2A00", display: "inline-block", flexShrink: 0 }} title="Pin" />
                  <span
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      color: "rgba(0,0,0,0.25)",
                    }}
                  >
                    {formatDate(obs.created_at)}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      color: "rgba(0,0,0,0.2)",
                    }}
                  >
                    {obs.lat.toFixed(4)}°N {Math.abs(obs.lng).toFixed(4)}°W
                  </span>
                </div>

              </div>
              {locationNames[`${obs.lat.toFixed(4)},${obs.lng.toFixed(4)}`] && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <span style={{ color: "#FF2A00", fontSize: 5, lineHeight: "9px", display: "inline-block" }}>&#9679;</span>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#1a1a1a",
                    opacity: 0.4,
                  }}>
                    {locationNames[`${obs.lat.toFixed(4)},${obs.lng.toFixed(4)}`]}
                  </span>
                </div>
              )}
            </div>

            {/* Observation text */}
            <div
              style={{
                fontFamily: "'Neue Haas Grotesk', 'Helvetica Neue', Helvetica, sans-serif",
                fontSize: 17,
                lineHeight: 1.4,
                fontWeight: 500,
                color: "#1a1a1a",
              }}
            >
              {obs.text}
            </div>
          </div>
        ))}

        {!loading && observations.length === 0 && (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              fontSize: 9,
              letterSpacing: "0.1em",
              color: "rgba(0,0,0,0.3)",
            }}
          >
            no observations yet
          </div>
        )}
      </div>
    </div>
  )
}
