import type { WorldProps } from "./WorldProps"

export default function SFIsland({ isActive }: WorldProps) {
  return (
    <img
      src="/peninsula-bg.webp"
      alt=""
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      style={{
        opacity: isActive ? 0.08 : 0,
        mixBlendMode: "screen",
        transition: "opacity 600ms ease",
      }}
    />
  )
}
