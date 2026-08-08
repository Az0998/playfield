import { sfx } from '../lib/audio'
import { burst, flash, popScore, shake } from '../lib/fx'
import type { GameMount } from './types'

export const mountPulseTap: GameMount = (root, onScore) => {
  let score = 0
  let combo = 0
  let lives = 3
  let running = false
  let beat = 0
  let period = 1000
  let phase = 0
  let last = 0
  let raf = 0
  let judged = false

  root.innerHTML = `
    <div class="game-shell" data-shell>
      <div class="game-hud">
        <div><span class="hud-label">得分</span><strong data-score class="tabular">0</strong></div>
        <div><span class="hud-label">连击</span><strong data-combo class="tabular">0</strong></div>
        <div><span class="hud-label">生命</span><strong data-lives class="tabular">♥♥♥</strong></div>
      </div>
      <p class="game-tip" data-tip>圆环收缩到中心环时点击或按空格。完美时机翻倍得分。</p>
      <div class="pulse-stage" data-stage tabindex="0" role="button" aria-label="节拍台，按空格或点击">
        <div class="pulse-ring" data-ring aria-hidden="true"></div>
        <div class="pulse-target" aria-hidden="true"></div>
        <div class="pulse-core" data-core aria-hidden="true">TAP</div>
        <div class="pulse-grade" data-grade aria-live="polite"></div>
      </div>
      <div class="game-actions">
        <button type="button" class="btn primary" data-start>跟上节拍</button>
      </div>
    </div>
  `

  const shell = root.querySelector('[data-shell]') as HTMLElement
  const stage = root.querySelector('[data-stage]') as HTMLElement
  const ring = root.querySelector('[data-ring]') as HTMLElement
  const core = root.querySelector('[data-core]') as HTMLElement
  const gradeEl = root.querySelector('[data-grade]') as HTMLElement
  const scoreEl = root.querySelector('[data-score]') as HTMLElement
  const comboEl = root.querySelector('[data-combo]') as HTMLElement
  const livesEl = root.querySelector('[data-lives]') as HTMLElement
  const tipEl = root.querySelector('[data-tip]') as HTMLElement
  const startBtn = root.querySelector('[data-start]') as HTMLButtonElement

  const updateHud = () => {
    scoreEl.textContent = String(score)
    comboEl.textContent = String(combo)
    livesEl.textContent = '♥'.repeat(lives) + '♡'.repeat(3 - lives)
    onScore(score)
  }

  const nextBeat = () => {
    beat += 1
    period = Math.max(620, 1000 - beat * 18)
    phase = 0
    judged = false
    gradeEl.textContent = ''
    ring.style.opacity = '1'
    sfx.tick()
  }

  const loseLife = (reason: string) => {
    lives -= 1
    combo = 0
    sfx.miss()
    shake(shell)
    flash(shell, 'bad')
    gradeEl.textContent = reason
    gradeEl.dataset.kind = 'miss'
    updateHud()
    if (lives <= 0) {
      endGame()
      return
    }
    nextBeat()
  }

  const endGame = () => {
    running = false
    cancelAnimationFrame(raf)
    tipEl.textContent = `节拍结束 · 得分 ${score}`
    startBtn.hidden = false
    startBtn.textContent = '再跟一局'
    core.textContent = 'END'
    sfx.win()
  }

  const judge = () => {
    if (!running || judged) return
    judged = true
    // Ideal hit when scale ≈ 1 (ring meets target). phase 0→1, scale from 2.2→0.55
    const scale = 2.2 - phase * 1.65
    const err = Math.abs(scale - 1)
    const rect = stage.getBoundingClientRect()
    const host = shell.getBoundingClientRect()
    const cx = rect.left - host.left + rect.width / 2
    const cy = rect.top - host.top + rect.height / 2

    if (err <= 0.1) {
      combo += 1
      const gain = 20 + combo * 3
      score += gain
      gradeEl.textContent = 'PERFECT'
      gradeEl.dataset.kind = 'perfect'
      sfx.hit()
      sfx.combo(combo)
      flash(shell, 'good')
      burst(shell, cx, cy, 'var(--mint)')
      popScore(shell, `+${gain}`, cx, cy - 40)
      updateHud()
      nextBeat()
    } else if (err <= 0.28) {
      combo += 1
      const gain = 10 + combo
      score += gain
      gradeEl.textContent = 'GOOD'
      gradeEl.dataset.kind = 'good'
      sfx.tap()
      popScore(shell, `+${gain}`, cx, cy - 40)
      updateHud()
      nextBeat()
    } else {
      loseLife('MISS')
    }
  }

  const loop = (t: number) => {
    if (!running) return
    if (!last) last = t
    const dt = t - last
    last = t
    phase += dt / period
    const scale = Math.max(0.55, 2.2 - phase * 1.65)
    ring.style.transform = `translate(-50%, -50%) scale(${scale})`
    ring.style.opacity = String(Math.max(0.15, 1 - phase * 0.35))

    if (phase >= 1 && !judged) {
      loseLife('LATE')
    }
    raf = requestAnimationFrame(loop)
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault()
      judge()
    }
  }

  const start = () => {
    cancelAnimationFrame(raf)
    score = 0
    combo = 0
    lives = 3
    beat = 0
    period = 1000
    last = 0
    running = true
    startBtn.hidden = true
    core.textContent = 'TAP'
    tipEl.textContent = '空格或点击舞台'
    updateHud()
    nextBeat()
    sfx.pulse()
    stage.focus()
    raf = requestAnimationFrame(loop)
  }

  startBtn.addEventListener('click', start)
  stage.addEventListener('click', () => {
    if (running) judge()
  })
  stage.addEventListener('keydown', onKey)
  window.addEventListener('keydown', onKey)
  updateHud()

  return {
    destroy: () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      root.innerHTML = ''
    },
  }
}
