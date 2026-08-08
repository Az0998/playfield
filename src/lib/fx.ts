export function shake(el: HTMLElement, ms = 220): void {
  el.classList.remove('is-shake')
  void el.offsetWidth
  el.classList.add('is-shake')
  window.setTimeout(() => el.classList.remove('is-shake'), ms)
}

export function flash(el: HTMLElement, kind: 'good' | 'bad' = 'good'): void {
  const cls = kind === 'good' ? 'is-flash-good' : 'is-flash-bad'
  el.classList.remove('is-flash-good', 'is-flash-bad')
  void el.offsetWidth
  el.classList.add(cls)
  window.setTimeout(() => el.classList.remove(cls), 280)
}

export function popScore(host: HTMLElement, text: string, x: number, y: number): void {
  const node = document.createElement('span')
  node.className = 'score-pop'
  node.textContent = text
  node.style.left = `${x}px`
  node.style.top = `${y}px`
  host.appendChild(node)
  window.setTimeout(() => node.remove(), 700)
}

export function burst(host: HTMLElement, x: number, y: number, color: string): void {
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('span')
    p.className = 'particle'
    const angle = (Math.PI * 2 * i) / 10
    const dist = 28 + Math.random() * 36
    p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`)
    p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`)
    p.style.left = `${x}px`
    p.style.top = `${y}px`
    p.style.background = color
    host.appendChild(p)
    window.setTimeout(() => p.remove(), 520)
  }
}
