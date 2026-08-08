export type GameHandle = {
  destroy: () => void
}

export type GameMeta = {
  id: string
  name: string
  blurb: string
  tag: string
  accent: string
}

export type GameMount = (root: HTMLElement, onScore: (score: number) => void) => GameHandle
