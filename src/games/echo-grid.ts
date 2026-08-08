import { sfx } from '../lib/audio'
import { burst, flash, shake } from '../lib/fx'
import type { GameMount } from './types'

const SIZE = 9

export const mountEchoGrid: GameMount = (root, onScore) => {
  let sequence: number[] = []
  let inputIndex = 0
  let locked = true
  let score = 0
  let lives = 3
  let playing = false
  let timers: number[] = []

  root.innerHTML = `
    <div class="game-shell" data-shell>
      <div class="game-hud">
        <div><span class="hud-label">得分</span><strong data-score class="tabular">0</strong></div>
        <div><span class="hud-label">生命</span><strong data-lives class="tabular">♥♥♥</strong></div>
        <div><span class="hud-label">回合</span><strong data-round class="tabular">0</strong></div>
      </div>
      <p class="game-tip" data-tip>记住亮起的格子，按同样顺序点回来。错一次扣一命。</p>
      <div class="echo-grid" data-grid role="grid" aria-label="回声网格"></div>
      <div class="game-actions">
        <button type="button" class="btn primary" data-start>开始挑战</button>
      </div>
    </div>
  `

  const shell = root.querySelector('[data-shell]') as HTMLElement
  const grid = root.querySelector('[data-grid]') as HTMLElement
  const scoreEl = root.querySelector('[data-score]') as HTMLElement
  const livesEl = root.querySelector('[data-lives]') as HTMLElement
  const roundEl = root.querySelector('[data-round]') as HTMLElement
  const tipEl = root.querySelector('[data-tip]') as HTMLElement
  const startBtn = root.querySelector('[data-start]') as HTMLButtonElement

  const cells: HTMLButtonElement[] = []
  for (let i = 0; i < SIZE; i++) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'echo-cell'
    btn.setAttribute('aria-label', `格子 ${i + 1}`)
    btn.dataset.index = String(i)
    grid.appendChild(btn)
    cells.push(btn)
  }

  const clearTimers = () => {
    timers.forEach((id) => window.clearTimeout(id))
    timers = []
  }

  const updateHud = () => {
    scoreEl.textContent = String(score)
    livesEl.textContent = '♥'.repeat(lives) + '♡'.repeat(3 - lives)
    roundEl.textContent = String(sequence.length)
    onScore(score)
  }

  const light = (index: number, active: boolean) => {
    cells[index].classList.toggle('is-lit', active)
  }

  const playNote = (index: number) => {
    light(index, true)
    sfx.echo(index)
    const id = window.setTimeout(() => light(index, false), 280)
    timers.push(id)
  }

  const playback = () => {
    locked = true
    tipEl.textContent = '听好节奏…'
    sequence.forEach((idx, i) => {
      const id = window.setTimeout(() => playNote(idx), 450 + i * 520)
      timers.push(id)
    })
    const done = window.setTimeout(
      () => {
        locked = false
        tipEl.textContent = '轮到你了 — 复现序列'
      },
      450 + sequence.length * 520 + 120,
    )
    timers.push(done)
  }

  const nextRound = () => {
    sequence.push(Math.floor(Math.random() * SIZE))
    inputIndex = 0
    updateHud()
    playback()
  }

  const fail = () => {
    lives -= 1
    sfx.miss()
    shake(shell)
    flash(shell, 'bad')
    updateHud()
    if (lives <= 0) {
      playing = false
      locked = true
      tipEl.textContent = `游戏结束 · 最终得分 ${score}`
      startBtn.textContent = '再来一局'
      startBtn.hidden = false
      sfx.win()
      return
    }
    tipEl.textContent = '差一点！重播本回合'
    const id = window.setTimeout(() => {
      inputIndex = 0
      playback()
    }, 700)
    timers.push(id)
  }

  const onCell = (index: number) => {
    if (!playing || locked) return
    const cell = cells[index]
    const rect = cell.getBoundingClientRect()
    const hostRect = shell.getBoundingClientRect()
    playNote(index)
    if (index === sequence[inputIndex]) {
      inputIndex += 1
      score += 10 + sequence.length * 2
      sfx.combo(inputIndex)
      burst(shell, rect.left - hostRect.left + rect.width / 2, rect.top - hostRect.top + rect.height / 2, 'var(--mint)')
      updateHud()
      if (inputIndex >= sequence.length) {
        locked = true
        tipEl.textContent = '完美！下一回合'
        flash(shell, 'good')
        const id = window.setTimeout(nextRound, 650)
        timers.push(id)
      }
    } else {
      fail()
    }
  }

  cells.forEach((btn) => {
    btn.addEventListener('click', () => onCell(Number(btn.dataset.index)))
  })

  const start = () => {
    clearTimers()
    sequence = []
    inputIndex = 0
    score = 0
    lives = 3
    playing = true
    startBtn.hidden = true
    tipEl.textContent = '准备…'
    updateHud()
    sfx.hit()
    const id = window.setTimeout(nextRound, 400)
    timers.push(id)
  }

  startBtn.addEventListener('click', start)
  updateHud()

  return {
    destroy: () => {
      clearTimers()
      root.innerHTML = ''
    },
  }
}
