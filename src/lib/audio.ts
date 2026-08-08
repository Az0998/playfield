let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function unlockAudio(): void {
  getCtx()
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.08,
  when = 0,
): void {
  const ac = getCtx()
  const t0 = ac.currentTime + when
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g)
  g.connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export const sfx = {
  tap: () => tone(520, 0.08, 'triangle', 0.06),
  hit: () => {
    tone(660, 0.1, 'square', 0.05)
    tone(990, 0.12, 'sine', 0.04, 0.02)
  },
  miss: () => {
    tone(180, 0.18, 'sawtooth', 0.05)
    tone(120, 0.22, 'triangle', 0.04, 0.04)
  },
  combo: (n: number) => tone(440 + Math.min(n, 12) * 40, 0.1, 'sine', 0.07),
  win: () => {
    ;[523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'triangle', 0.06, i * 0.08))
  },
  tick: () => tone(880, 0.04, 'sine', 0.03),
  echo: (step: number) => tone(300 + step * 70, 0.18, 'sine', 0.07),
  pulse: () => tone(220, 0.06, 'triangle', 0.05),
}
