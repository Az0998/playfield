const KEY = 'playfield-scores-v1'

export type Scores = Record<string, number>

export function loadScores(): Scores {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Scores) : {}
  } catch {
    return {}
  }
}

export function saveScore(gameId: string, score: number): number {
  const scores = loadScores()
  const prev = scores[gameId] ?? 0
  if (score > prev) {
    scores[gameId] = score
    localStorage.setItem(KEY, JSON.stringify(scores))
    return score
  }
  return prev
}
