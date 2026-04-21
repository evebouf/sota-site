// Card Preview — live preview of the share card without downloading

import { useEffect, useRef, useState } from "react"
import { createClient } from "@supabase/supabase-js"

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

export default function CardPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [observations, setObservations] = useState<Observation[]>([])
  const [selectedIdx, setSelectedIdx] = useState(0)

  useEffect(() => { document.title = "Card Preview" }, [])

  useEffect(() => {
    supabase.from("observations").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setObservations(data as Observation[]) })
  }, [])

  const obs = observations[selectedIdx]

  useEffect(() => {
    if (!obs || !canvasRef.current) return
    const canvas = canvasRef.current
    const displayText = obs.text.replace(/@\[([^\]]+)\]/g, "@$1")
    const w = 1920, h = 1080
    const pad = 80

    // Measure text
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")!
    const fontSize = 72
    const lineH = 92
    tempCtx.font = `bold ${fontSize}px 'Helvetica Neue', Helvetica, sans-serif`
    const textMaxW = w * 0.52
    const words = displayText.split(" ")
    let tempLine = "", lines: string[] = []
    for (const word of words) {
      const test = tempLine + (tempLine ? " " : "") + word
      if (tempCtx.measureText(test).width > textMaxW && tempLine) {
        lines.push(tempLine); tempLine = word
      } else { tempLine = test }
    }
    lines.push(tempLine + " ➽")

    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext("2d")!

    // White background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, w, h)

    // Draw stamp watermark
    const stamp = new Image()
    stamp.onload = () => {
      const stampH = h * 0.85
      const stampW = stampH * (stamp.width / stamp.height)
      ctx.save()
      ctx.globalAlpha = 0.06
      ctx.drawImage(stamp, (w - stampW) / 2, (h - stampH) / 2, stampW, stampH)
      ctx.restore()
      drawContent()
    }
    stamp.onerror = () => drawContent()
    stamp.src = "/sota-stamp-black.png"

    function drawContent() {
      // Top left: red dot
      ctx.fillStyle = "#FF2A00"
      ctx.beginPath()
      ctx.arc(pad + 10, pad + 10, 10, 0, Math.PI * 2)
      ctx.fill()

      // Top right: coordinates + date
      ctx.font = `28px 'Courier New', monospace`
      ctx.fillStyle = "rgba(0,0,0,0.4)"
      const coordStr = `${obs.lat.toFixed(4)}°N  ${Math.abs(obs.lng).toFixed(4)}°W`
      const dateStr = new Date(obs.created_at).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" }).replace(/\//g, ".")
      const coordW = ctx.measureText(coordStr).width
      const dateW = ctx.measureText(dateStr).width
      ctx.fillText(coordStr, w - pad - coordW - dateW - 60, pad + 18)
      ctx.fillText(dateStr, w - pad - dateW, pad + 18)

      // Observation text — right half, vertically centered
      ctx.font = `bold ${fontSize}px 'Helvetica Neue', Helvetica, sans-serif`
      ctx.fillStyle = "#1a1a1a"
      const textBlockH = lines.length * lineH
      const textStartX = w * 0.42
      const textStartY = (h - textBlockH) / 2 + fontSize
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], textStartX, textStartY + i * lineH)
      }

      // Bottom left: branding stack
      ctx.font = `bold 26px 'Helvetica Neue', Helvetica, sans-serif`
      ctx.fillStyle = "#1a1a1a"
      // Bottom left: single line branding
      const brand = "STATE OF THE ART"
      ctx.fillText(brand, pad, h - pad)
      const brandW = ctx.measureText(brand).width
      ctx.font = `300 24px 'Helvetica Neue', Helvetica, sans-serif`
      ctx.fillStyle = "rgba(0,0,0,0.35)"
      ctx.fillText("  NOTICINGS", pad + brandW, h - pad)

      // Bottom right: url + handle
      ctx.font = `20px 'Courier New', monospace`
      ctx.fillStyle = "rgba(0,0,0,0.7)"
      const bottomRight = "sotazine.com  ·  @sotazine"
      const brW = ctx.measureText(bottomRight).width
      ctx.fillText(bottomRight, w - pad - brW, h - pad)
    }
  }, [obs])

  return (
    <div style={{ background: "#f0f0f0", minHeight: "100dvh", padding: 32, fontFamily: "'Space Mono', monospace" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 11, letterSpacing: "0.1em", color: "rgba(0,0,0,0.4)" }}>
            CARD PREVIEW — {observations.length} observations
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setSelectedIdx(Math.max(0, selectedIdx - 1))}
              disabled={selectedIdx === 0}
              style={{ padding: "4px 12px", fontSize: 11, background: "#fff", border: "1px solid #ccc", opacity: selectedIdx === 0 ? 0.3 : 1 }}
            >Prev</button>
            <span style={{ fontSize: 11, alignSelf: "center", color: "rgba(0,0,0,0.4)" }}>{selectedIdx + 1} / {observations.length}</span>
            <button
              onClick={() => setSelectedIdx(Math.min(observations.length - 1, selectedIdx + 1))}
              disabled={selectedIdx >= observations.length - 1}
              style={{ padding: "4px 12px", fontSize: 11, background: "#fff", border: "1px solid #ccc", opacity: selectedIdx >= observations.length - 1 ? 0.3 : 1 }}
            >Next</button>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "auto", background: "#fff", boxShadow: "0 2px 20px rgba(0,0,0,0.1)" }}
        />
      </div>
    </div>
  )
}
