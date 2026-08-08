(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=null;function t(){return e||=new AudioContext,e.state===`suspended`&&e.resume(),e}function n(){t()}function r(e,n,r=`sine`,i=.08,a=0){let o=t(),s=o.currentTime+a,c=o.createOscillator(),l=o.createGain();c.type=r,c.frequency.setValueAtTime(e,s),l.gain.setValueAtTime(1e-4,s),l.gain.exponentialRampToValueAtTime(i,s+.015),l.gain.exponentialRampToValueAtTime(1e-4,s+n),c.connect(l),l.connect(o.destination),c.start(s),c.stop(s+n+.02)}var i={tap:()=>r(520,.08,`triangle`,.06),hit:()=>{r(660,.1,`square`,.05),r(990,.12,`sine`,.04,.02)},miss:()=>{r(180,.18,`sawtooth`,.05),r(120,.22,`triangle`,.04,.04)},combo:e=>r(440+Math.min(e,12)*40,.1,`sine`,.07),win:()=>{[523,659,784,1046].forEach((e,t)=>r(e,.16,`triangle`,.06,t*.08))},tick:()=>r(880,.04,`sine`,.03),echo:e=>r(300+e*70,.18,`sine`,.07),pulse:()=>r(220,.06,`triangle`,.05)},a=`playfield-scores-v1`;function o(){try{let e=localStorage.getItem(a);return e?JSON.parse(e):{}}catch{return{}}}function s(e,t){let n=o(),r=n[e]??0;return t>r?(n[e]=t,localStorage.setItem(a,JSON.stringify(n)),t):r}function c(e,t=220){e.classList.remove(`is-shake`),e.offsetWidth,e.classList.add(`is-shake`),window.setTimeout(()=>e.classList.remove(`is-shake`),t)}function l(e,t=`good`){let n=t===`good`?`is-flash-good`:`is-flash-bad`;e.classList.remove(`is-flash-good`,`is-flash-bad`),e.offsetWidth,e.classList.add(n),window.setTimeout(()=>e.classList.remove(n),280)}function u(e,t,n,r){let i=document.createElement(`span`);i.className=`score-pop`,i.textContent=t,i.style.left=`${n}px`,i.style.top=`${r}px`,e.appendChild(i),window.setTimeout(()=>i.remove(),700)}function d(e,t,n,r){for(let i=0;i<10;i++){let a=document.createElement(`span`);a.className=`particle`;let o=Math.PI*2*i/10,s=28+Math.random()*36;a.style.setProperty(`--dx`,`${Math.cos(o)*s}px`),a.style.setProperty(`--dy`,`${Math.sin(o)*s}px`),a.style.left=`${t}px`,a.style.top=`${n}px`,a.style.background=r,e.appendChild(a),window.setTimeout(()=>a.remove(),520)}}var f=9,p=(e,t)=>{let n=[],r=0,a=!0,o=0,s=3,u=!1,p=[];e.innerHTML=`
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
  `;let m=e.querySelector(`[data-shell]`),h=e.querySelector(`[data-grid]`),g=e.querySelector(`[data-score]`),_=e.querySelector(`[data-lives]`),v=e.querySelector(`[data-round]`),y=e.querySelector(`[data-tip]`),b=e.querySelector(`[data-start]`),x=[];for(let e=0;e<f;e++){let t=document.createElement(`button`);t.type=`button`,t.className=`echo-cell`,t.setAttribute(`aria-label`,`格子 ${e+1}`),t.dataset.index=String(e),h.appendChild(t),x.push(t)}let S=()=>{p.forEach(e=>window.clearTimeout(e)),p=[]},C=()=>{g.textContent=String(o),_.textContent=`♥`.repeat(s)+`♡`.repeat(3-s),v.textContent=String(n.length),t(o)},w=(e,t)=>{x[e].classList.toggle(`is-lit`,t)},T=e=>{w(e,!0),i.echo(e);let t=window.setTimeout(()=>w(e,!1),280);p.push(t)},E=()=>{a=!0,y.textContent=`听好节奏…`,n.forEach((e,t)=>{let n=window.setTimeout(()=>T(e),450+t*520);p.push(n)});let e=window.setTimeout(()=>{a=!1,y.textContent=`轮到你了 — 复现序列`},450+n.length*520+120);p.push(e)},D=()=>{n.push(Math.floor(Math.random()*f)),r=0,C(),E()},O=()=>{if(--s,i.miss(),c(m),l(m,`bad`),C(),s<=0){u=!1,a=!0,y.textContent=`游戏结束 · 最终得分 ${o}`,b.textContent=`再来一局`,b.hidden=!1,i.win();return}y.textContent=`差一点！重播本回合`;let e=window.setTimeout(()=>{r=0,E()},700);p.push(e)},k=e=>{if(!u||a)return;let t=x[e].getBoundingClientRect(),s=m.getBoundingClientRect();if(T(e),e===n[r]){if(r+=1,o+=10+n.length*2,i.combo(r),d(m,t.left-s.left+t.width/2,t.top-s.top+t.height/2,`var(--mint)`),C(),r>=n.length){a=!0,y.textContent=`完美！下一回合`,l(m,`good`);let e=window.setTimeout(D,650);p.push(e)}}else O()};return x.forEach(e=>{e.addEventListener(`click`,()=>k(Number(e.dataset.index)))}),b.addEventListener(`click`,()=>{S(),n=[],r=0,o=0,s=3,u=!0,b.hidden=!0,y.textContent=`准备…`,C(),i.hit();let e=window.setTimeout(D,400);p.push(e)}),C(),{destroy:()=>{S(),e.innerHTML=``}}},m=(e,t)=>{let n=0,r=0,a=3,o=!1,s=[],f=0,p=0,m=0,h=.42;e.innerHTML=`
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
  `;let g=e.querySelector(`[data-shell]`),_=e.querySelector(`[data-stage]`),v=e.querySelector(`[data-orbs]`),y=e.querySelector(`[data-zone]`),b=e.querySelector(`[data-score]`),x=e.querySelector(`[data-combo]`),S=e.querySelector(`[data-miss]`),C=e.querySelector(`[data-tip]`),w=e.querySelector(`[data-start]`),T=()=>{b.textContent=String(n),x.textContent=String(r),S.textContent=`${a}/3`,t(n)},E=e=>{let t=_.clientWidth,n=t/2,r=t/2,i=t*.34,a=n+Math.cos(e.angle)*i,o=r+Math.sin(e.angle)*i;e.el.style.transform=`translate(${a-14}px, ${o-14}px)`},D=e=>{let t=(e%(Math.PI*2)+Math.PI*2)%(Math.PI*2);return t>Math.PI&&(t-=Math.PI*2),Math.abs(t)<=h/2},O=()=>{let e=document.createElement(`button`);e.type=`button`,e.className=`orbit-orb`,e.setAttribute(`aria-label`,`轨道球`);let t=140+Math.random()*40;e.style.background=`hsl(${t} 80% 58%)`,v.appendChild(e);let a={angle:Math.PI+(Math.random()*.8-.4),speed:1.4+Math.random()*1.1+Math.min(n/120,1.2),radius:1,hue:t,alive:!0,el:e};e.addEventListener(`click`,t=>{if(t.stopPropagation(),!(!o||!a.alive)){if(D(a.angle)){a.alive=!1,r+=1;let t=10+r*2;n+=t,i.hit(),i.combo(r),l(g,`good`);let o=e.getBoundingClientRect(),c=g.getBoundingClientRect();d(g,o.left-c.left+14,o.top-c.top+14,`hsl(${a.hue} 80% 58%)`),u(g,`+${t}`,o.left-c.left,o.top-c.top-8),e.remove(),s=s.filter(e=>e!==a),h=Math.max(.28,h-.008),y.style.setProperty(`--zone`,`${h/(Math.PI*2)*360}deg`),T()}else k()}}),s.push(a),E(a)},k=()=>{r=0,--a,i.miss(),c(g),l(g,`bad`),T(),a<=0&&A()},A=()=>{o=!1,cancelAnimationFrame(f),C.textContent=`轨道崩溃 · 得分 ${n}`,w.hidden=!1,w.textContent=`重新进入`,i.win()},j=e=>{if(!o)return;m||=e;let t=Math.min(.032,(e-m)/1e3);m=e,p+=t;let r=Math.max(.55,1.15-n/200);p>=r&&(p=0,O());for(let e of[...s]){e.angle+=e.speed*t,E(e);let n=(e.angle%(Math.PI*2)+Math.PI*2)%(Math.PI*2);n>Math.PI&&(n-=Math.PI*2),n>h/2+.15&&(e.alive=!1,e.el.remove(),s=s.filter(t=>t!==e),k())}f=requestAnimationFrame(j)};return w.addEventListener(`click`,()=>{cancelAnimationFrame(f),s.forEach(e=>e.el.remove()),s=[],n=0,r=0,a=3,p=0,m=0,h=.42,y.style.setProperty(`--zone`,`${h/(Math.PI*2)*360}deg`),o=!0,w.hidden=!0,C.textContent=`盯住橙色切片区`,T(),i.pulse(),f=requestAnimationFrame(j)}),y.style.setProperty(`--zone`,`${h/(Math.PI*2)*360}deg`),T(),{destroy:()=>{o=!1,cancelAnimationFrame(f),e.innerHTML=``}}},h=[{name:`薄荷绿`,color:`#5dffb0`},{name:`橘焰`,color:`#ff7a45`},{name:`晴空`,color:`#4ec4ff`},{name:`蜜黄`,color:`#ffd166`},{name:`玫粉`,color:`#ff6b9d`},{name:`藤紫`,color:`#b794f6`}],g=[{id:`echo-grid`,name:`回声网格`,blurb:`记住亮起的格子顺序，用耳朵和眼睛一起回放。`,tag:`记忆`,accent:`#5dffb0`,mount:p},{id:`orbit-slice`,name:`轨道切片`,blurb:`球体绕圈飞过橙色切片区时点击 — 时机就是一切。`,tag:`时机`,accent:`#ff7a45`,mount:m},{id:`hue-duel`,name:`色相对决`,blurb:`文字会骗人，颜色不会。在倒计时里保持连击。`,tag:`反应`,accent:`#4ec4ff`,mount:(e,t)=>{let n=0,r=0,a=30,o=!1,s=0,f=!1,p=0;e.innerHTML=`
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
  `;let m=e.querySelector(`[data-shell]`),g=e.querySelector(`[data-board]`),_=e.querySelector(`[data-target-name]`),v=e.querySelector(`[data-score]`),y=e.querySelector(`[data-streak]`),b=e.querySelector(`[data-time]`),x=e.querySelector(`[data-tip]`),S=e.querySelector(`[data-start]`),C=()=>{v.textContent=String(n),y.textContent=String(r),b.textContent=String(Math.ceil(a)),t(n)},w=()=>{s=Math.floor(Math.random()*h.length),f=Math.random()>.35;let e=f?(s+1+Math.floor(Math.random()*(h.length-1)))%h.length:s;_.textContent=h[e].name,_.style.color=h[s].color;let t=[...h.keys()].sort(()=>Math.random()-.5).slice(0,4);t.includes(s)||(t[0]=s),t.sort(()=>Math.random()-.5),g.innerHTML=``,t.forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.className=`hue-swatch`,t.style.background=h[e].color,t.setAttribute(`aria-label`,h[e].name),t.textContent=h[(e+(f?2:0))%h.length].name,t.addEventListener(`click`,()=>T(e,t)),g.appendChild(t)})},T=(e,t)=>{if(!o)return;let f=t.getBoundingClientRect(),p=m.getBoundingClientRect();if(e===s){r+=1;let t=8+r*2;n+=t,a=Math.min(35,a+.35),i.hit(),i.combo(r),l(m,`good`),d(m,f.left-p.left+f.width/2,f.top-p.top+f.height/2,h[e].color),u(m,`+${t}`,f.left-p.left+f.width/2,f.top-p.top),C(),w()}else r=0,a=Math.max(0,a-2),i.miss(),c(m),l(m,`bad`),C(),a<=0?E():w()},E=()=>{o=!1,window.clearInterval(0),window.clearInterval(p),x.textContent=`时间到 · 得分 ${n}`,S.hidden=!1,S.textContent=`再战一轮`,g.querySelectorAll(`button`).forEach(e=>e.disabled=!0),i.win()};return S.addEventListener(`click`,()=>{window.clearInterval(0),window.clearInterval(p),n=0,r=0,a=30,o=!0,S.hidden=!0,x.textContent=`看颜色，别被文字骗了`,C(),w(),i.tap(),p=window.setInterval(()=>{if(o){if(a-=.1,a<=0){a=0,C(),E();return}C()}},100)}),C(),{destroy:()=>{o=!1,window.clearInterval(0),window.clearInterval(p),e.innerHTML=``}}}},{id:`pulse-tap`,name:`脉冲节拍`,blurb:`圆环收缩到目标时按下。Perfect 连击翻倍得分。`,tag:`节奏`,accent:`#ffd166`,mount:(e,t)=>{let n=0,r=0,a=3,o=!1,s=0,f=1e3,p=0,m=0,h=0,g=!1;e.innerHTML=`
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
  `;let _=e.querySelector(`[data-shell]`),v=e.querySelector(`[data-stage]`),y=e.querySelector(`[data-ring]`),b=e.querySelector(`[data-core]`),x=e.querySelector(`[data-grade]`),S=e.querySelector(`[data-score]`),C=e.querySelector(`[data-combo]`),w=e.querySelector(`[data-lives]`),T=e.querySelector(`[data-tip]`),E=e.querySelector(`[data-start]`),D=()=>{S.textContent=String(n),C.textContent=String(r),w.textContent=`♥`.repeat(a)+`♡`.repeat(3-a),t(n)},O=()=>{s+=1,f=Math.max(620,1e3-s*18),p=0,g=!1,x.textContent=``,y.style.opacity=`1`,i.tick()},k=e=>{if(--a,r=0,i.miss(),c(_),l(_,`bad`),x.textContent=e,x.dataset.kind=`miss`,D(),a<=0){A();return}O()},A=()=>{o=!1,cancelAnimationFrame(h),T.textContent=`节拍结束 · 得分 ${n}`,E.hidden=!1,E.textContent=`再跟一局`,b.textContent=`END`,i.win()},j=()=>{if(!o||g)return;g=!0;let e=2.2-p*1.65,t=Math.abs(e-1),a=v.getBoundingClientRect(),s=_.getBoundingClientRect(),c=a.left-s.left+a.width/2,f=a.top-s.top+a.height/2;if(t<=.1){r+=1;let e=20+r*3;n+=e,x.textContent=`PERFECT`,x.dataset.kind=`perfect`,i.hit(),i.combo(r),l(_,`good`),d(_,c,f,`var(--mint)`),u(_,`+${e}`,c,f-40),D(),O()}else if(t<=.28){r+=1;let e=10+r;n+=e,x.textContent=`GOOD`,x.dataset.kind=`good`,i.tap(),u(_,`+${e}`,c,f-40),D(),O()}else k(`MISS`)},M=e=>{if(!o)return;m||=e;let t=e-m;m=e,p+=t/f;let n=Math.max(.55,2.2-p*1.65);y.style.transform=`translate(-50%, -50%) scale(${n})`,y.style.opacity=String(Math.max(.15,1-p*.35)),p>=1&&!g&&k(`LATE`),h=requestAnimationFrame(M)},N=e=>{e.code===`Space`&&(e.preventDefault(),j())};return E.addEventListener(`click`,()=>{cancelAnimationFrame(h),n=0,r=0,a=3,s=0,f=1e3,m=0,o=!0,E.hidden=!0,b.textContent=`TAP`,T.textContent=`空格或点击舞台`,D(),O(),i.pulse(),v.focus(),h=requestAnimationFrame(M)}),v.addEventListener(`click`,()=>{o&&j()}),v.addEventListener(`keydown`,N),window.addEventListener(`keydown`,N),D(),{destroy:()=>{o=!1,cancelAnimationFrame(h),window.removeEventListener(`keydown`,N),e.innerHTML=``}}}}],_=document.querySelector(`#app`),v=null,y=0;function b(){v?.destroy(),v=null}function x(){b();let e=o();_.innerHTML=`
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
        ${g.map(t=>`
          <button type="button" class="game-card" data-game="${t.id}" style="--card-accent:${t.accent}">
            <span class="card-tag">${t.tag}</span>
            <h2 class="card-title">${t.name}</h2>
            <p class="card-blurb">${t.blurb}</p>
            <div class="card-meta">
              <span class="card-score">最高分 <strong>${e[t.id]??0}</strong></span>
              <span class="card-cta">开玩 →</span>
            </div>
          </button>
        `).join(``)}
      </section>
      <p class="footer-note">最高分保存在本机 · 支持触控与键盘</p>
    </div>
  `,_.querySelectorAll(`[data-game]`).forEach(e=>{e.addEventListener(`click`,()=>{n(),location.hash=`#/play/${e.dataset.game}`})})}function S(e){let t=g.find(t=>t.id===e);if(!t){location.hash=`#/`;return}b(),y=0;let n=o();_.innerHTML=`
    <div class="atmosphere" aria-hidden="true"></div>
    <div class="page game-view">
      <header class="game-header">
        <div>
          <button type="button" class="btn ghost" data-back>← 返回</button>
        </div>
        <h2>${t.name}</h2>
        <div class="card-score">纪录 <strong data-best>${n[t.id]??0}</strong></div>
      </header>
      <div data-mount></div>
    </div>
  `;let r=_.querySelector(`[data-mount]`),i=_.querySelector(`[data-best]`);_.querySelector(`[data-back]`)?.addEventListener(`click`,()=>{let e=s(t.id,y);i.textContent=String(e),location.hash=`#/`}),v=t.mount(r,e=>{y=e;let n=Math.max(e,o()[t.id]??0);i.textContent=String(n),e>0&&s(t.id,e)})}function C(){let e=(location.hash||`#/`).match(/^#\/play\/([\w-]+)/);e?S(e[1]):x()}window.addEventListener(`hashchange`,C),window.addEventListener(`pointerdown`,()=>n(),{once:!0}),C();