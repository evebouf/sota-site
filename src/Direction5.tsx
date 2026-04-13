// Direction 5: Editorial Spread
// Inspired by: Vein Magazine — full bleed split, marble/texture left, clean serif right

import { useState, useEffect } from "react"

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

export default function Direction5() {
  useEffect(() => { document.title = "D7 — Editorial Spread" }, [])
  const cursor = useRedCursor()
  return (
    <div className="w-screen h-screen overflow-hidden relative flex">
      <div
        className="fixed top-0 left-0 pointer-events-none z-50 hidden md:block"
        style={{ transform: `translate(${cursor.x}px, ${cursor.y - 12}px) rotate(${cursor.angle}deg)`, color: "#FF2A00", fontSize: "24px", lineHeight: 1 }}
        >➽</div>

      {/* Left page — full bleed abstract texture */}
      <div className="w-1/2 h-full relative overflow-hidden bg-[#e8e4dc]">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="ink-blot">
              <feTurbulence type="fractalNoise" baseFrequency="0.005" numOctaves="6" seed="3" result="noise" />
              <feColorMatrix in="noise" type="saturate" values="0" result="bw" />
              <feComponentTransfer in="bw">
                <feFuncR type="discrete" tableValues="0 0 0 0 0 0.2 0.5 0.8 1 1" />
                <feFuncG type="discrete" tableValues="0 0 0 0 0 0.2 0.5 0.8 1 1" />
                <feFuncB type="discrete" tableValues="0 0 0 0 0 0.2 0.5 0.8 1 1" />
              </feComponentTransfer>
            </filter>
            <filter id="ink-blot-2">
              <feTurbulence type="turbulence" baseFrequency="0.012" numOctaves="4" seed="17" result="noise2" />
              <feColorMatrix in="noise2" type="saturate" values="0" result="bw2" />
              <feComponentTransfer in="bw2">
                <feFuncR type="discrete" tableValues="0 0 0 0.1 0.4 0.7 1 1 1 1" />
                <feFuncG type="discrete" tableValues="0 0 0 0.1 0.4 0.7 1 1 1 1" />
                <feFuncB type="discrete" tableValues="0 0 0 0.1 0.4 0.7 1 1 1 1" />
              </feComponentTransfer>
            </filter>
          </defs>
          <rect width="400" height="600" fill="#0a0a0a" />
          <rect width="400" height="600" fill="#e8e4dc" filter="url(#ink-blot)" opacity="0.35" />
          <rect width="400" height="600" fill="#e8e4dc" filter="url(#ink-blot-2)" opacity="0.2" />
        </svg>

        {/* Spine shadow — right edge */}
        <div
          className="absolute top-0 right-0 bottom-0 w-[40px]"
          style={{ background: "linear-gradient(to left, rgba(0,0,0,0.12), transparent)" }}
        />
      </div>

      {/* Right page — clean editorial */}
      <div
        className="w-1/2 h-full relative bg-[#f5f2ed] flex flex-col justify-between"
        style={{ padding: "clamp(28px, 5vh, 56px) clamp(28px, 4vw, 56px)" }}
      >
        {/* Spine shadow — left edge */}
        <div
          className="absolute top-0 left-0 bottom-0 w-[30px]"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.06), transparent)" }}
        />

        {/* Top header */}
        <div className="flex justify-between items-start relative z-10">
          <div
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(13px, 1.6vh, 20px)",
              color: "#0a0a0a",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Contents
          </div>
          <div className="text-right">
            <div
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(13px, 1.6vh, 20px)",
                color: "#0a0a0a",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              State of
            </div>
            <div
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(13px, 1.6vh, 20px)",
                color: "#0a0a0a",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              the Art
            </div>
            <div
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: "clamp(13px, 1.6vh, 20px)",
                color: "#0a0a0a",
                letterSpacing: "0.08em",
                marginTop: "clamp(6px, 1vh, 12px)",
              }}
            >
              N<sup style={{ fontSize: "0.65em" }}>o</sup>1
            </div>
          </div>
        </div>

        {/* Page number — centered */}
        <div
          className="absolute top-[clamp(28px,5vh,56px)] left-1/2 -translate-x-1/2"
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(12px, 1.4vh, 16px)",
            color: "#0a0a0a",
            opacity: 0.35,
          }}
        >
          03
        </div>

        {/* Body text — editorial paragraph */}
        <div className="relative z-10" style={{ maxWidth: "85%" }}>
          <p
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: "clamp(13px, 1.6vh, 20px)",
              lineHeight: 1.55,
              color: "#0a0a0a",
              textAlign: "justify",
              hyphens: "auto",
            }}
          >
            A publication dedicated to the ongoing evolution of San Francisco. An attempt to expand on conversations surrounding why and how cities are built, and what social, functional, or symbolic needs they satisfy. Seven writers explore transit, architecture, poetry, speculative fiction, and the counter-entropic politics of building something that lasts. Edition one asks: what does it mean to be absolutely modern?
          </p>
        </div>
      </div>
    </div>
  )
}
