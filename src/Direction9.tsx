// Direction 9: Conversational
// Inspired by: Fuzzco — large red italic serif paragraph, underlined links inline, circled markers, playful tone

import { useState, useEffect } from "react"

function useRedCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])
  return pos
}

function Marker({ letter }: { letter: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-[1.1em] h-[1.1em] rounded-full border-[1.5px] border-current text-[0.35em] font-normal not-italic align-super ml-1"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      {letter}
    </span>
  )
}

function UL({ children }: { children: React.ReactNode }) {
  return (
    <span className="underline underline-offset-[3px] decoration-[1.5px] cursor-pointer hover:opacity-70 transition-opacity">
      {children}
    </span>
  )
}

export default function Direction9() {
  const cursor = useRedCursor()
  const red = "#D93025"

  return (
    <div
      className="w-screen h-screen bg-white overflow-hidden flex flex-col relative"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50"
        style={{ transform: `translate(${cursor.x - 9}px, ${cursor.y - 9}px)` }}
      />

      {/* Top nav */}
      <nav className="flex items-center px-[4vw] py-5 shrink-0 text-[13px] tracking-[0.02em]">
        <span className="font-bold text-[18px] mr-auto" style={{ color: red }}>S</span>
        <div className="flex gap-10 text-black/70">
          <span>Articles <Marker letter="A" /></span>
          <span>Index</span>
          <span className="underline underline-offset-2">Contact</span>
        </div>
      </nav>

      {/* Main body text */}
      <div className="flex-1 flex items-center px-[4vw]">
        <p
          className="max-w-[900px] leading-[1.25] tracking-[-0.01em]"
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: "italic",
            fontSize: "clamp(28px, 4.2vw, 54px)",
            color: red,
          }}
        >
          Read us. Or just <UL>explore</UL>. Want to contribute?{" "}
          <UL>Submit a piece</UL> to get published. Follow the discourse on{" "}
          <UL>urban futures</UL>, <UL>speculative design</UL>,{" "}
          <UL>transit</UL>,
          <Marker letter="B" /> or <UL>architecture</UL>. Curious about poetry? Read{" "}
          <UL>the Ferlinghetti Method</UL> and we'll convince
          you it matters deeply.
        </p>
      </div>

      {/* Bottom section */}
      <div className="shrink-0 px-[4vw] pb-6">
        {/* Divider */}
        <div className="w-full h-px bg-black/10 mb-5" />

        <div className="flex justify-between text-[11px] text-black/50 leading-[1.7]">
          {/* Col 1 */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.1em] text-black/30 mb-1">Edition <Marker letter="C" /></div>
            <div className="underline underline-offset-2">Edition 01</div>
            <div>San Francisco, 2026</div>
          </div>
          {/* Col 2 */}
          <div>
            <div className="text-[9px] uppercase tracking-[0.1em] text-black/30 mb-1">Contributors <Marker letter="D" /></div>
            <div>Wolf Tivy, Jan Sramek</div>
            <div>Olivia Marotte, Pablo Peniche</div>
          </div>
          {/* Col 3 */}
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-[0.1em] text-black/30 mb-1">Contact</div>
            <div className="underline underline-offset-2">sota@stateoftheart.pub</div>
            <div className="text-[9px] mt-2">© State of the Art. All rights reserved. <Marker letter="E" /></div>
          </div>
        </div>
      </div>
    </div>
  )
}
