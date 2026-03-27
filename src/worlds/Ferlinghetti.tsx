import type { WorldProps } from "./WorldProps"

export default function Ferlinghetti({ isActive }: WorldProps) {
  return (
    <img
      src="/ferlinghetti-portrait.svg"
      alt=""
      className="absolute pointer-events-none"
      style={{
        right: "5vw",
        top: "50%",
        height: "60vh",
        objectFit: "contain",
        filter: "invert(1) brightness(0.6)",
        opacity: isActive ? 0.12 : 0,
        transform: `translateY(-50%)`,
        transition: "opacity 600ms ease",
      }}
    />
  )
}
