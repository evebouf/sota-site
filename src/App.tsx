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
  author: string
  brief: string
}

const articles: Article[] = [
  {
    words: [{ text: "Against Progress", large: true }],
    hoverClass: "hover:line-through hover:decoration-[#FF2A00] hover:decoration-[4px]",
    bgColor: { light: "#F5F5F5", dark: "#1a1a1a" },
    author: "Wolf Tivy",
    brief: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  },
  {
    words: [
      { text: "San Francisco", large: true },
      { text: "Is Not", large: false },
      { text: "An Island", large: true },
    ],
    hoverClass: "hover:translate-x-[2vw]",
    bgColor: { light: "#F5F5F5", dark: "#1a1a1a" },
    author: "Jan Sramek",
    brief: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
  },
  {
    words: [
      { text: "The", large: false },
      { text: "Ferlinghetti", large: true },
      { text: "Method", large: false },
    ],
    hoverClass: "hover:skew-x-[-6deg] [&:hover>span]:!text-white",
    bgColor: { light: "#1a1a1a", dark: "#000000" },
    author: "Olivia Marotte",
    brief: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
  {
    slug: "grecofuturism",
    words: [
      { text: "What is", large: false },
      { text: "Grecofuturism?", large: true },
    ],
    hoverClass: "hover:underline hover:decoration-[3px] hover:underline-offset-[8px]",
    bgColor: { light: "#ECECEC", dark: "#111111" },
    author: "Pablo Peniche",
    brief: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id.",
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
    author: "Evan Zimmerman",
    brief: "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo.",
  },
  {
    words: [{ text: "Alcatraz 20XX?", large: true }],
    hoverClass:
      "after:content-[''] after:absolute after:left-0 after:top-1/2 after:h-[3px] after:bg-[#FF2A00] after:w-0 hover:after:w-full after:transition-all after:duration-350",
    bgColor: { light: "#E02010", dark: "#E02010" },
    author: "Sanjana Friedman",
    brief: "Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh ut fermentum massa.",
  },
  {
    words: [
      { text: "Editor's Note:", large: false },
      { text: "The City", large: true },
      { text: "of", large: false },
      { text: "Tomorrow", large: true },
    ],
    hoverClass: "hover:blur-[4px]",
    bgColor: { light: "#F7F7F7", dark: "#151515" },
    author: "Sanjana Friedman",
    brief: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
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
          <span className="flex items-center gap-3">
            Edition 01
            <button
              onClick={() => setDark(!dark)}
              className={`w-[20px] h-[20px] rounded-full border outline-none transition-all duration-300 hover:scale-110 ${
                dark
                  ? "bg-white border-white/20"
                  : "bg-[#1a1a1a] border-[#1a1a1a]/20"
              }`}
              aria-label="Toggle dark mode"
            />
          </span>
        </div>

        <img
          src="/alcatraz-sketch.png"
          alt=""
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none mix-blend-darken transition-opacity duration-500 ${
            hoveredIndex === 5 ? "opacity-15" : "opacity-0"
          }`}
        />

        <div className="flex flex-col items-center px-[5vw] relative">
          {articles.map((article, i) => (
            <a
              key={i}
              href="#"
              onClick={(e) => handleArticleClick(e, article)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-baseline gap-[0.8vw] cursor-pointer no-underline relative transition-all duration-350 ease-[cubic-bezier(0.25,0.1,0.25,1)] group ${article.hoverClass} ${(hoveredIndex === 5 && i !== 5) || (hoveredIndex === 3 && i !== 3) || (hoveredIndex === 4 && i !== 4) || (hoveredIndex === 2 && i !== 2) ? "opacity-[0.06]" : ""}`}
            >
              {article.words.map((word, j) =>
                word.large ? (
                  <span
                    key={j}
                    className={`font-bodoni text-[clamp(36px,6.2vw,96px)] leading-[0.9] tracking-[0.02em] uppercase transition-[inherit] ${dark || (hoveredIndex !== null && ["#1a1a1a", "#111111", "#000000"].includes(articles[hoveredIndex].bgColor.light)) ? "text-white" : "text-[#1a1a1a]"}`}
                  >
                    {word.text}
                  </span>
                ) : (
                  <span
                    key={j}
                    className={`font-bodoni italic text-[clamp(16px,2.6vw,36px)] leading-none transition-[inherit] ${dark || (hoveredIndex !== null && ["#1a1a1a", "#111111", "#000000"].includes(articles[hoveredIndex].bgColor.light)) ? "text-white" : "text-[#1a1a1a]"}`}
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

        {/* Waymo sketches — flickering animation */}

{/* Grecofuturism sketch — full bg */}
        <img
          src="/greco-sketch.png"
          alt="Grecofuturist sketch"
          className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-500 ${
            hoveredIndex === 3 ? "opacity-20" : "opacity-0"
          }`}
        />

        {/* Traffic light animation — Waymo hover */}
        <div className={`absolute left-[4vw] top-[40%] -translate-y-1/2 w-[15vw] h-[80vh] pointer-events-none transition-opacity duration-300 ${hoveredIndex === 4 ? "opacity-100" : "opacity-0"}`}>
          <img src="/light-3.png" alt="" className="absolute inset-0 w-full h-full object-contain" style={{ animation: "light-1 0.9s steps(1) infinite" }} />
          <img src="/light-2.png" alt="" className="absolute inset-0 w-full h-full object-contain" style={{ animation: "light-2 0.9s steps(1) infinite" }} />
          <img src="/light-1.png" alt="" className="absolute inset-0 w-full h-full object-contain" style={{ animation: "light-3 0.9s steps(1) infinite" }} />
        </div>

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


      {/* Bottom info bar — brief left, author right */}
      <div
        className={`absolute bottom-[4vh] left-[4vw] right-[4vw] flex items-end justify-between transition-all duration-300 pointer-events-none ${
          hoveredIndex !== null && !activeArticle
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-[4px]"
        } ${dark || (hoveredIndex !== null && ["#1a1a1a", "#111111", "#000000"].includes(articles[hoveredIndex].bgColor.light)) ? "text-white" : "text-[#1a1a1a]"}`}
      >
        <div className="max-w-[35vw] font-sans text-[clamp(9px,0.75vw,12px)] leading-[1.5] tracking-[0.05em] opacity-70">
          {hoveredIndex !== null ? articles[hoveredIndex].brief : ""}
        </div>
        <div className="font-sans text-[clamp(10px,0.85vw,13px)] tracking-[0.2em] uppercase whitespace-nowrap">
          {hoveredIndex !== null ? articles[hoveredIndex].author : ""}
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

export default App
