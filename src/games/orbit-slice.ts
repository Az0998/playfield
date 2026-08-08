import { sfx } from '../lib/audio'
import { burst, flash, popScore, shake } from '../lib/fx'
import type { GameMount } from './types'

type Orb = {
  angle: number
  speed: number
  radius: number
  hue: number
  alive: boolean
  el: HTMLButtonElement
}

export const mountOrbitSlice: GameMount = (root, onScore) => {
  let score = 0
  let combo = 0
  let missLeft = 3
  let running = false
  let orbs: Orb[] = []
  let raf = 0
  let spawnAcc = 0
  let last = 0
  let zoneWidth = 0.42

  root.innerHTML = `
    <div class="game-shell" data-shell>
      <div class="game-hud">
        <div><span class="hud-label">得分</span><strong data-score class="tabular">0</strong></div>
        <div><span class="hud-label">连击</span><strong data-combo class="tabular">0</strong></div>
        <div><span class="hud-label">失误</span><strong data-miss class="tabular">0/3</strong></div>
      </div>
      <p class="game-tip" data-tip>球体绕圈飞过时，只在橙色切片区点击。太早或太晚都算失误。</p>
      <div class="orbit-stage" data-stage>
        <div class="orbit-ring" aria-hidden="true"></div>
        <div class="orbit-zone" data-zone aria-hidden="true"></div>
        <div class="orbit-core" aria-hidden="true"></div>
        <div class="orbit-orbs" data-orbs></div>
      </div>
      <div class="game-actions">
        <button type="button" class="btn primary" data-start>进入轨道</button>
      </div>
    </div>
  `

  const shell = root.querySelector('[data-shell]') as HTMLElement
  const stage = root.querySelector('[data-stage]') as HTMLElement
  const orbsHost = root.querySelector('[data-orbs]') as HTMLElement
  const zone = root.querySelector('[data-zone]') as HTMLElement
  const scoreEl = root.querySelector('[data-score]') as HTMLElement
  const comboEl = root.querySelector('[data-combo]') as HTMLElement
  const missEl = root.querySelector('[data-miss]') as HTMLElement
  const tipEl = root.querySelector('[data-tip]') as HTMLElement
  const startBtn = root.querySelector('[data-start]') as HTMLButtonElement

  const updateHud = () => {
    scoreEl.textContent = String(score)
    comboEl.textContent = String(combo)
    missEl.textContent = `${missLeft}/3`
    onScore(score)
  }

  const placeOrb = (orb: Orb) => {
    const size = stage.clientWidth
    const cx = size / 2
    const cy = size / 2
    const r = size * 0.34
    const x = cx + Math.cos(orb.angle) * r
    const y = cy + Math.sin(orb.angle) * r
    orb.el.style.transform = `translate(${x - 14}px, ${y - 14}px)`
  }

  const inZone = (angle: number) => {
    // Zone centered at angle 0 (right side), wrap-aware
    let a = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    if (a > Math.PI) a -= Math.PI * 2
    return Math.abs(a) <= zoneWidth / 2
  }

  const spawn = () => {
    const el = document.createElement('button')
    el.type = 'button'
    el.className = 'orbit-orb'
    el.setAttribute('aria-label', '轨道球')
    const hue = 140 + Math.random() * 40
    el.style.background = `hsl(${hue} 80% 58%)`
    orbsHost.appendChild(el)
    const orb: Orb = {
      angle: Math.PI + (Math.random() * 0.8 - 0.4),
      speed: 1.4 + Math.random() * 1.1 + Math.min(score / 120, 1.2),
      radius: 1,
      hue,
      alive: true,
      el,
    }
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      if (!running || !orb.alive) return
      if (inZone(orb.angle)) {
        orb.alive = false
        combo += 1
        const gain = 10 + combo * 2
        score += gain
        sfx.hit()
        sfx.combo(combo)
        flash(shell, 'good')
        const rect = el.getBoundingClientRect()
        const host = shell.getBoundingClientRect()
        burst(shell, rect.left - host.left + 14, rect.top - host.top + 14, `hsl(${orb.hue} 80% 58%)`)
        popScore(shell, `+${gain}`, rect.left - host.left, rect.top - host.top - 8)
        el.remove()
        orbs = orbs.filter((o) => o !== orb)
        zoneWidth = Math.max(0.28, zoneWidth - 0.008)
        zone.style.setProperty('--zone', `${(zoneWidth / (Math.PI * 2)) * 360}deg`)
        updateHud()
      } else {
        miss()
      }
    })
    orbs.push(orb)
    placeOrb(orb)
  }

  const miss = () => {
    combo = 0
    missLeft -= 1
    sfx.miss()
    shake(shell)
    flash(shell, 'bad')
    updateHud()
    if (missLeft <= 0) endGame()
  }

  const endGame = () => {
    running = false
    cancelAnimationFrame(raf)
    tipEl.textContent = `轨道崩溃 · 得分 ${score}`
    startBtn.hidden = false
    startBtn.textContent = '重新进入'
    sfx.win()
  }

  const loop = (t: number) => {
    if (!running) return
    if (!last) last = t
    const dt = Math.min(0.032, (t - last) / 1000)
    last = t
    spawnAcc += dt
    const interval = Math.max(0.55, 1.15 - score / 200)
    if (spawnAcc >= interval) {
      spawnAcc = 0
      spawn()
    }
    for (const orb of [...orbs]) {
      orb.angle += orb.speed * dt
      placeOrb(orb)
      // Passed the zone without click
      let a = ((orb.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      if (a > Math.PI) a -= Math.PI * 2
      if (a > zoneWidth / 2 + 0.15) {
        orb.alive = false
        orb.el.remove()
        orbs = orbs.filter((o) => o !== orb)
        miss()
      }
    }
    raf = requestAnimationFrame(loop)
  }

  const start = () => {
    cancelAnimationFrame(raf)
    orbs.forEach((o) => o.el.remove())
    orbs = []
    score = 0
    combo = 0
    missLeft = 3
    spawnAcc = 0
    last = 0
    zoneWidth = 0.42
    zone.style.setProperty('--zone', `${(zoneWidth / (Math.PI * 2)) * 360}deg`)
    running = true
    startBtn.hidden = true
    tipEl.textContent = '盯住橙色切片区'
    updateHud()
    sfx.pulse()
    raf = requestAnimationFrame(loop)
  }

  startBtn.addEventListener('click', start)
  zone.style.setProperty('--zone', `${(zoneWidth / (Math.PI * 2)) * 360}deg`)
  updateHud()

  return {
    destroy: () => {
      running = false
      cancelAnimationFrame(raf)
      root.innerHTML = ''
    },
  }
}
