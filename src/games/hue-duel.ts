import { sfx } from '../lib/audio'
import { burst, flash, popScore, shake } from '../lib/fx'
import type { GameMount } from './types'

const PALETTE = [
  { name: '薄荷绿', color: '#5dffb0' },
  { name: '橘焰', color: '#ff7a45' },
  { name: '晴空', color: '#4ec4ff' },
  { name: '蜜黄', color: '#ffd166' },
  { name: '玫粉', color: '#ff6b9d' },
  { name: '藤紫', color: '#b794f6' },
]

export const mountHueDuel: GameMount = (root, onScore) => {
  let score = 0
  let streak = 0
  let timeLeft = 30
  let running = false
  let targetIdx = 0
  let distractor = false
  let timer = 0
  let tick = 0

  root.innerHTML = `
    <div class="game-shell" data-shell>
      <div class="game-hud">
        <div><span class="hud-label">得分</span><strong data-score class="tabular">0</strong></div>
        <div><span class="hud-label">连击</span><strong data-streak class="tabular">0</strong></div>
        <div><span class="hud-label">倒计时</span><strong data-time class="tabular">30</strong></div>
      </div>
      <p class="game-tip" data-tip>点出与目标<strong>颜色</strong>一致的色块。文字会故意捣乱——相信眼睛。</p>
      <div class="hue-target" data-target aria-live="polite">
        <span class="hue-label">目标色</span>
        <strong data-target-name>—</strong>
      </div>
      <div class="hue-board" data-board role="list"></div>
      <div class="game-actions">
        <button type="button" class="btn primary" data-start>开始对决</button>
      </div>
    </div>
  `

  const shell = root.querySelector('[data-shell]') as HTMLElement
  const board = root.querySelector('[data-board]') as HTMLElement
  const targetName = root.querySelector('[data-target-name]') as HTMLElement
  const scoreEl = root.querySelector('[data-score]') as HTMLElement
  const streakEl = root.querySelector('[data-streak]') as HTMLElement
  const timeEl = root.querySelector('[data-time]') as HTMLElement
  const tipEl = root.querySelector('[data-tip]') as HTMLElement
  const startBtn = root.querySelector('[data-start]') as HTMLButtonElement

  const updateHud = () => {
    scoreEl.textContent = String(score)
    streakEl.textContent = String(streak)
    timeEl.textContent = String(Math.ceil(timeLeft))
    onScore(score)
  }

  const renderRound = () => {
    targetIdx = Math.floor(Math.random() * PALETTE.length)
    distractor = Math.random() > 0.35
    const shownNameIdx = distractor
      ? (targetIdx + 1 + Math.floor(Math.random() * (PALETTE.length - 1))) % PALETTE.length
      : targetIdx
    targetName.textContent = PALETTE[shownNameIdx].name
    targetName.style.color = PALETTE[targetIdx].color

    const options = [...PALETTE.keys()].sort(() => Math.random() - 0.5).slice(0, 4)
    if (!options.includes(targetIdx)) options[0] = targetIdx
    options.sort(() => Math.random() - 0.5)

    board.innerHTML = ''
    options.forEach((idx) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'hue-swatch'
      btn.style.background = PALETTE[idx].color
      btn.setAttribute('aria-label', PALETTE[idx].name)
      // Label uses a mismatched name for Stroop twist
      const labelIdx = (idx + (distractor ? 2 : 0)) % PALETTE.length
      btn.textContent = PALETTE[labelIdx].name
      btn.addEventListener('click', () => pick(idx, btn))
      board.appendChild(btn)
    })
  }

  const pick = (idx: number, btn: HTMLButtonElement) => {
    if (!running) return
    const rect = btn.getBoundingClientRect()
    const host = shell.getBoundingClientRect()
    if (idx === targetIdx) {
      streak += 1
      const gain = 8 + streak * 2
      score += gain
      timeLeft = Math.min(35, timeLeft + 0.35)
      sfx.hit()
      sfx.combo(streak)
      flash(shell, 'good')
      burst(shell, rect.left - host.left + rect.width / 2, rect.top - host.top + rect.height / 2, PALETTE[idx].color)
      popScore(shell, `+${gain}`, rect.left - host.left + rect.width / 2, rect.top - host.top)
      updateHud()
      renderRound()
    } else {
      streak = 0
      timeLeft = Math.max(0, timeLeft - 2)
      sfx.miss()
      shake(shell)
      flash(shell, 'bad')
      updateHud()
      if (timeLeft <= 0) endGame()
      else renderRound()
    }
  }

  const endGame = () => {
    running = false
    window.clearInterval(timer)
    window.clearInterval(tick)
    tipEl.textContent = `时间到 · 得分 ${score}`
    startBtn.hidden = false
    startBtn.textContent = '再战一轮'
    board.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = true))
    sfx.win()
  }

  const start = () => {
    window.clearInterval(timer)
    window.clearInterval(tick)
    score = 0
    streak = 0
    timeLeft = 30
    running = true
    startBtn.hidden = true
    tipEl.textContent = '看颜色，别被文字骗了'
    updateHud()
    renderRound()
    sfx.tap()
    tick = window.setInterval(() => {
      if (!running) return
      timeLeft -= 0.1
      if (timeLeft <= 0) {
        timeLeft = 0
        updateHud()
        endGame()
        return
      }
      updateHud()
    }, 100)
  }

  startBtn.addEventListener('click', start)
  updateHud()

  return {
    destroy: () => {
      running = false
      window.clearInterval(timer)
      window.clearInterval(tick)
      root.innerHTML = ''
    },
  }
}
