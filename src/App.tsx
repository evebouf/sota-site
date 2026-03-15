import { useState, useEffect, type MouseEvent } from "react"

interface Word {
  text: string
  large: boolean
}

interface Article {
  slug?: string
  words: Word[]
  hoverClass: string
  bgColor: { light: string; dark: string }
}

const articles: Article[] = [
  {
    words: [{ text: "Against Progress", large: true }],
    hoverClass: "hover:text-[#C0272D]",
    bgColor: { light: "#FFE8E5", dark: "#2a0800" },
  },
  {
    words: [
      { text: "San Francisco", large: true },
      { text: "Is Not", large: false },
      { text: "An Island", large: true },
    ],
    hoverClass: "hover:translate-x-[2vw]",
    bgColor: { light: "#F5F5F5", dark: "#1a1a1a" },
  },
  {
    words: [
      { text: "The", large: false },
      { text: "Ferlinghetti", large: true },
      { text: "Method", large: false },
    ],
    hoverClass: "hover:skew-x-[-6deg] [&:hover>span]:!text-white",
    bgColor: { light: "#1a1a1a", dark: "#000000" },
  },
  {
    slug: "grecofuturism",
    words: [
      { text: "What is", large: false },
      { text: "Grecofuturism?", large: true },
    ],
    hoverClass: "hover:bg-[#FF2A00] [&:hover>span]:!text-white px-[0.6vw] py-[0.1em]",
    bgColor: { light: "#FFF0ED", dark: "#2a0500" },
  },
  {
    words: [
      { text: "Waymo", large: true },
      { text: "and the", large: false },
      { text: "Future", large: true },
      { text: "of", large: false },
      { text: "Transit", large: true },
    ],
    hoverClass:
      "hover:bg-[#1a1a1a] [&:hover>span]:!text-white px-[0.6vw] py-[0.1em]",
    bgColor: { light: "#ECECEC", dark: "#111111" },
  },
  {
    words: [{ text: "Alcatraz 20XX?", large: true }],
    hoverClass:
      "after:content-[''] after:absolute after:left-0 after:top-1/2 after:h-[3px] after:bg-[#FF2A00] after:w-0 hover:after:w-full after:transition-all after:duration-350",
    bgColor: { light: "#FF2A00", dark: "#FF2A00" },
  },
  {
    words: [{ text: "Editor's Note", large: false }],
    hoverClass: "[&>span]:hover:blur-[4px]",
    bgColor: { light: "#F7F7F7", dark: "#151515" },
  },
]

function App() {
  const [mode, setMode] = useState<"writing" | "game">("writing")
  const [activeArticle, setActiveArticle] = useState<string | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 })
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleArticleClick = (e: MouseEvent, article: Article) => {
    e.preventDefault()
    if (article.slug) {
      setActiveArticle(article.slug)
    }
  }

  return (
    <div
      className="w-full h-screen relative overflow-hidden antialiased transition-colors duration-500"
      style={{ backgroundColor: hoveredIndex !== null ? articles[hoveredIndex].bgColor[dark ? "dark" : "light"] : dark ? "#121212" : "#ffffff" }}
    >
      {/* Writing view */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
          mode === "writing" && !activeArticle
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className={`absolute top-[3vh] w-full flex justify-between px-[4vw] font-sans text-[clamp(11px,1vw,14px)] tracking-[0.15em] uppercase font-medium transition-colors duration-500 ${dark ? "text-white/70" : "text-[#1a1a1a]"}`}>
          <span>State of the Art</span>
          <span>Edition 01</span>
        </div>

        <div className="flex flex-col items-center px-[5vw] relative">
          {articles.map((article, i) => (
            <a
              key={i}
              href="#"
              onClick={(e) => handleArticleClick(e, article)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-baseline gap-[0.8vw] cursor-pointer no-underline relative transition-all duration-350 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${article.hoverClass}`}
            >
              {article.words.map((word, j) =>
                word.large ? (
                  <span
                    key={j}
                    className={`font-bodoni text-[clamp(36px,6.2vw,96px)] leading-[0.9] tracking-[0.02em] uppercase transition-[inherit] ${dark ? "text-white" : "text-[#1a1a1a]"}`}
                  >
                    {word.text}
                  </span>
                ) : (
                  <span
                    key={j}
                    className={`font-bodoni italic text-[clamp(16px,2.6vw,36px)] leading-none transition-[inherit] ${dark ? "text-white" : "text-[#1a1a1a]"}`}
                  >
                    {word.text}
                  </span>
                )
              )}
            </a>
          ))}
        </div>

        {/* City Lights sketch — appears on Ferlinghetti hover */}
        <img
          src="/ferlinghetti-portrait.svg"
          alt="Ferlinghetti portrait"
          className={`absolute left-[2vw] top-1/2 -translate-y-1/2 h-[55vh] object-contain pointer-events-none transition-all duration-600 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${dark ? "" : "invert"} ${
            hoveredIndex === 2
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95"
          }`}
        />
        <img
          src="/city-lights.svg"
          alt="City Lights Booksellers"
          className={`absolute right-[2vw] top-1/2 -translate-y-1/2 h-[35vh] object-contain pointer-events-none transition-all duration-600 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${dark ? "" : "invert"} delay-75 ${
            hoveredIndex === 2
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95"
          }`}
        />
      </div>

      {/* Article modal — Grecofuturism */}
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center transition-all duration-500 ${
          activeArticle === "grecofuturism"
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setActiveArticle(null)}
        />

        {/* Modal */}
        <div
          className={`relative w-[80vw] h-[85vh] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
            activeArticle === "grecofuturism"
              ? "scale-100 translate-y-0"
              : "scale-95 translate-y-[40px]"
          }`}
        >
          {/* Close button */}
          <button
            onClick={() => setActiveArticle(null)}
            className="absolute top-4 right-4 z-10 w-[36px] h-[36px] rounded-full bg-[#1a1a1a]/5 backdrop-blur-md border border-[#1a1a1a]/10 flex items-center justify-center font-sans text-[14px] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-all duration-300"
          >
            &times;
          </button>

          {/* Scrollable article */}
          <div className="w-full h-full overflow-y-auto">
            <img
              src="/grecofuturism-article.png"
              alt="What is Grecofuturism?"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Game view */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${mode === "game" && !activeArticle ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <img
          src="/sf-collage.png"
          alt="San Francisco collage"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={() => setDark(!dark)}
        className={`absolute bottom-[4vh] left-[4vw] z-10 w-[40px] h-[40px] rounded-full border transition-all duration-300 hover:scale-110 ${
          dark
            ? "bg-white border-white/20"
            : "bg-[#1a1a1a] border-[#1a1a1a]/20"
        } ${activeArticle ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        aria-label="Toggle dark mode"
      />

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

export default App
