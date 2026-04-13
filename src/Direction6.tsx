// Direction 6: Dark Stacked Nav
// Inspired by: conference/event site, huge bold text zigzagging left/right, thin horizontal rules, black background

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

const items: { label: string; align: "flex-start" | "flex-end" | "center" }[] = [
  { label: "Against Progress", align: "flex-start" },
  { label: "The Ferlinghetti Method", align: "flex-end" },
  { label: "Grecofuturism", align: "flex-start" },
  { label: "Alcatraz 20XX?", align: "flex-end" },
  { label: "Waymo & Transit", align: "flex-start" },
  { label: "SF Is Not An Island", align: "flex-end" },
  { label: "City of Tomorrow", align: "center" },
]

export default function Direction6() {
  useEffect(() => { document.title = "D8 — Dark Stacked Nav" }, [])
  const cursor = useRedCursor()
  return (
    <div
      className="w-screen h-screen bg-black overflow-hidden flex flex-col relative"
      style={{ fontFamily: "'Anybody', sans-serif" }}
    >
      {/* Red dot cursor */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-50 hidden md:block"
        style={{ transform: `translate(${cursor.x}px, ${cursor.y - 12}px) rotate(${cursor.angle}deg)`, color: "#FF2A00", fontSize: "24px", lineHeight: 1 }}
        >➽</div>

      {/* Stacked nav items */}
      <div className="flex-1 flex flex-col justify-center px-[5vw] gap-0">
        {items.map((item, i) => (
          <div key={i}>
            {/* Horizontal rule */}
            {i > 0 && <div className="w-full h-px bg-white/30" />}
            {/* Nav item */}
            <div
              className="flex py-[0.4vh] cursor-pointer group"
              style={{ justifyContent: item.align }}
            >
              <span
                className="text-white uppercase leading-[1] tracking-[0.01em] group-hover:opacity-60 transition-opacity"
                style={{
                  fontSize: "clamp(36px, 7vw, 100px)",
                  fontVariationSettings: "'wdth' 100, 'wght' 800",
                }}
              >
                {item.label}
              </span>
            </div>
          </div>
        ))}
        {/* Final rule */}
        <div className="w-full h-px bg-white/30" />
      </div>

      {/* Footer */}
      <div className="flex justify-between px-[5vw] pb-5 text-white/30 text-[11px] tracking-[0.05em] shrink-0">
        <span>© 2026 State of the Art</span>
        <span>Edition 01 — San Francisco</span>
      </div>
    </div>
  )
}
