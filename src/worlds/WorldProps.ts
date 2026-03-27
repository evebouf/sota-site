export interface WorldProps {
  isActive: boolean
  enterDuration?: number   // ms, default 500
  exitDuration?: number    // ms, default 350
}

export interface WorldConfig {
  title: string
  words: { text: string; large: boolean }[]
  author: string
  brief: string
  slug?: string
  palette: {
    background: string
    text: string
  }
  siblingEffect: "fade" | "blur" | "none"
  typeBehaviorClass: string
  component: React.ComponentType<WorldProps>
}
