import type { WorldProps } from "./WorldProps"

export default function Grecofuturism({ isActive }: WorldProps) {
  return (
    <img
      src="/greco-sketch.webp"
      alt=""
      className="absolute pointer-events-none"
      style={{
        left: "50%",
        top: "50%",
        height: "55vh",
        objectFit: "contain",
        mixBlendMode: "screen",
        opacity: isActive ? 0.08 : 0,
        transform: "translate(-50%, -50%)",
        transition: "opacity 600ms ease",
      }}
    />
  )
}
