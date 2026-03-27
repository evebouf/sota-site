import type { WorldProps } from "./WorldProps"

export default function Waymo({ isActive }: WorldProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
        opacity: isActive ? 1 : 0,
        transition: "opacity 600ms ease",
      }}
    />
  )
}
