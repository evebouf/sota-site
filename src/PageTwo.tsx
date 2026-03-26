import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="w-full h-screen relative overflow-hidden flex bg-[#0a0a0a]" style={inter}>

      {/* Sidebar — left edge */}
      <div className="w-[40px] h-full shrink-0 border-r border-white/[0.06] flex flex-col items-center justify-between py-[3vh] relative">
        <Link to="/" className="no-underline text-[8px] tracking-[0.25em] uppercase text-white/25 hover:text-white transition-colors duration-200 font-light"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          Home
        </Link>
        <div className="flex flex-col items-center gap-4">
          <Link to="/1" className="no-underline text-[8px] tracking-[0.25em] uppercase text-white/25 hover:text-[#FF2A00] transition-colors duration-200 font-light"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
            Map
          </Link>
          <div className="text-[8px] tracking-[0.25em] uppercase text-white/10 font-light"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
            Contents
          </div>
        </div>
        <div className="text-[8px] tracking-[0.25em] uppercase text-white/10 font-light"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          SOTA
        </div>
      </div>

      {/* Cover */}
      <div className="flex-1 h-full relative bg-[#0a0a0a] flex items-center justify-center">
        <img
          src="/cover.png"
          alt="State of the Art — Edition One"
          className="h-full w-full object-contain"
        />
      </div>

      {/* Right — TOC */}
      <div className="w-[45%] h-full shrink-0 relative flex flex-col justify-between px-[2.5vw] py-[4vh] border-l border-white/[0.06]">

        {/* Header */}
        <div className="flex justify-between items-baseline">
          <Link to="/" className="no-underline text-[clamp(10px,0.8vw,13px)] tracking-[0.12em] uppercase text-white/40 hover:text-white transition-colors duration-200 font-light">
            State of the Art
          </Link>
          <div className="flex items-baseline gap-[1em]">
            <span className="text-[clamp(10px,0.8vw,13px)] text-white/50 font-light italic">The City</span>
            <span className="text-[clamp(9px,0.7vw,11px)] tracking-[0.15em] uppercase text-white/25 font-light">Edition One</span>
          </div>
        </div>

        {/* Articles */}
        <div className="flex-1 flex flex-col justify-center">
          {articles.map((article, i) => (
            <a
              key={i}
              href="#"
              onClick={(e) => e.preventDefault()}
              onMouseEnter={() => setHoveredArticle(i)}
              onMouseLeave={() => setHoveredArticle(null)}
              className="no-underline group border-b border-white/[0.06] py-[1.6vh] first:border-t"
              style={{ cursor: "none" }}
            >
              <div className="flex items-baseline gap-[1vw]">
                <span className={`text-[clamp(9px,0.6vw,11px)] tabular-nums font-light transition-colors duration-200 ${
                  hoveredArticle === i ? "text-[#FF2A00]/50" : "text-white/15"
                }`}>
                  {article.ex}
                </span>
                <div className="flex-1">
                  <div className={`text-[clamp(16px,1.5vw,24px)] leading-[1.1] tracking-[-0.01em] font-light transition-colors duration-200 ${
                    hoveredArticle === i ? "text-[#FF2A00]" : "text-white/90"
                  }`}>
                    {article.title}
                  </div>
                  <div className={`overflow-hidden transition-all duration-400 ${hoveredArticle === i ? "max-h-[30px] opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                    <span className="text-[clamp(11px,0.75vw,14px)] text-white/25 font-light italic">{article.teaser}</span>
                  </div>
                </div>
                {article.author && (
                  <span className={`text-[clamp(8px,0.5vw,10px)] tracking-[0.1em] uppercase shrink-0 font-light transition-colors duration-200 ${
                    hoveredArticle === i ? "text-white/25" : "text-white/10"
                  }`}>
                    {article.author}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end">
          <div className="text-[7px] tracking-[0.2em] uppercase text-white/15 font-light">
            San Francisco, 2026
          </div>
          <Link to="/1" className="no-underline text-[8px] tracking-[0.15em] uppercase text-white/20 hover:text-[#FF2A00] transition-colors duration-200 border border-white/[0.08] px-3 py-1 hover:border-[#FF2A00]/30 font-light">
            Explore the City
          </Link>
        </div>
      </div>

      {/* Custom cursor */}
      <div
        className="fixed top-0 left-0 w-[18px] h-[18px] rounded-full bg-[#FF2A00] pointer-events-none z-50 mix-blend-normal"
        style={{
          transform: `translate(${mousePos.x - 9}px, ${mousePos.y - 9}px)`,
        }}
      />
    </div>
  )
}

export default PageTwo
