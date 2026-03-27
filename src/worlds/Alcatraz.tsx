import type { WorldProps } from "./WorldProps"

export default function Alcatraz({ isActive }: WorldProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,42,0,0.06) 0%, transparent 70%)",
        opacity: isActive ? 1 : 0,
        transition: "opacity 600ms ease",
      }}
    />
  )
}
