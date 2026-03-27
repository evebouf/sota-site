import type { WorldProps } from "./WorldProps"

export default function AgainstProgress({ isActive }: WorldProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)",
        opacity: isActive ? 1 : 0,
        transition: "opacity 600ms ease",
      }}
    />
  )
}
