import './style.css'
import { unlockAudio } from './lib/audio'
import { loadScores, saveScore } from './lib/storage'
import { mountEchoGrid } from './games/echo-grid'
import { mountOrbitSlice } from './games/orbit-slice'
import { mountHueDuel } from './games/hue-duel'
import { mountPulseTap } from './games/pulse-tap'
import type { GameHandle, GameMeta, GameMount } from './games/types'

const GAMES: (GameMeta & { mount: GameMount })[] = [
  {
    id: 'echo-grid',
    name: '回声网格',
    blurb: '记住亮起的格子顺序，用耳朵和眼睛一起回放。',
    tag: '记忆',
    accent: '#5dffb0',
    mount: mountEchoGrid,
  },
  {
    id: 'orbit-slice',
    name: '轨道切片',
    blurb: '球体绕圈飞过橙色切片区时点击 — 时机就是一切。',
    tag: '时机',
    accent: '#ff7a45',
    mount: mountOrbitSlice,
  },
  {
    id: 'hue-duel',
    name: '色相对决',
    blurb: '文字会骗人，颜色不会。在倒计时里保持连击。',
    tag: '反应',
    accent: '#4ec4ff',
    mount: mountHueDuel,
  },
  {
    id: 'pulse-tap',
    name: '脉冲节拍',
    blurb: '圆环收缩到目标时按下。Perfect 连击翻倍得分。',
    tag: '节奏',
    accent: '#ffd166',
    mount: mountPulseTap,
  },
]

const app = document.querySelector<HTMLDivElement>('#app')!

let active: GameHandle | null = null
let currentScore = 0

function destroyActive() {
  active?.destroy()
  active = null
}

function renderHub() {
  destroyActive()
  const scores = loadScores()
  app.innerHTML = `
    <div class="atmosphere" aria-hidden="true"></div>
    <div class="page">
      <header class="topbar">
        <a class="brand" href="#/" aria-label="PLAYFIELD 首页">
          <span class="brand-mark" aria-hidden="true"></span>
          <span>
            <div class="brand-name">PLAYFIELD</div>
            <div class="brand-sub">轻量街机 · 即时反馈</div>
          </span>
        </a>
      </header>
      <section class="hero">
        <h1>四款短局游戏，<em>一套手感</em></h1>
        <p>连击、震屏、音效与飘分都接好了。选一局，三十秒内就能上瘾。</p>
      </section>
      <section class="game-grid" aria-label="游戏列表">
        ${GAMES.map(
          (g) => `
          <button type="button" class="game-card" data-game="${g.id}" style="--card-accent:${g.accent}">
            <span class="card-tag">${g.tag}</span>
            <h2 class="card-title">${g.name}</h2>
            <p class="card-blurb">${g.blurb}</p>
            <div class="card-meta">
              <span class="card-score">最高分 <strong>${scores[g.id] ?? 0}</strong></span>
              <span class="card-cta">开玩 →</span>
            </div>
          </button>
        `,
        ).join('')}
      </section>
      <p class="footer-note">最高分保存在本机 · 支持触控与键盘</p>
    </div>
  `

  app.querySelectorAll<HTMLButtonElement>('[data-game]').forEach((btn) => {
    btn.addEventListener('click', () => {
      unlockAudio()
      location.hash = `#/play/${btn.dataset.game}`
    })
  })
}

function renderGame(id: string) {
  const game = GAMES.find((g) => g.id === id)
  if (!game) {
    location.hash = '#/'
    return
  }

  destroyActive()
  currentScore = 0
  const scores = loadScores()

  app.innerHTML = `
    <div class="atmosphere" aria-hidden="true"></div>
    <div class="page game-view">
      <header class="game-header">
        <div>
          <button type="button" class="btn ghost" data-back>← 返回</button>
        </div>
        <h2>${game.name}</h2>
        <div class="card-score">纪录 <strong data-best>${scores[game.id] ?? 0}</strong></div>
      </header>
      <div data-mount></div>
    </div>
  `

  const mountEl = app.querySelector('[data-mount]') as HTMLElement
  const bestEl = app.querySelector('[data-best]') as HTMLElement

  app.querySelector('[data-back]')?.addEventListener('click', () => {
    const best = saveScore(game.id, currentScore)
    bestEl.textContent = String(best)
    location.hash = '#/'
  })

  active = game.mount(mountEl, (score) => {
    currentScore = score
    const best = Math.max(score, loadScores()[game.id] ?? 0)
    bestEl.textContent = String(best)
    if (score > 0) saveScore(game.id, score)
  })
}

function route() {
  const hash = location.hash || '#/'
  const play = hash.match(/^#\/play\/([\w-]+)/)
  if (play) renderGame(play[1])
  else renderHub()
}

window.addEventListener('hashchange', route)
window.addEventListener('pointerdown', () => unlockAudio(), { once: true })
route()
