// ════════════════════════════════════
//  카드 시스템 (생성, 물리, 피킹, 애니메이션)
// ════════════════════════════════════
import { state, dom, getStageDims, GROUND_OFFSET } from './state.js';
import { THEMES } from './themes.js';

// ── 스테이지 리사이즈 ──
export function resizeStage(){
  const dims=getStageDims(state.names.length);
  if(state.SW===dims.w && state.SH===dims.h) return;
  state.SW=dims.w; state.SH=dims.h;
  dom.stage.style.width=state.SW+'px';
  dom.stage.style.height=state.SH+'px';
  dom.bgCanvas.width=state.SW; dom.bgCanvas.height=state.SH;
  dom.fwCanvas.width=state.SW; dom.fwCanvas.height=state.SH;
  dom.bgCtx=dom.bgCanvas.getContext('2d');
  dom.fwCtx=dom.fwCanvas.getContext('2d');
}

// ── 화면 크기에 맞춰 스테이지 스케일 조정 ──
export function fitStage(){
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const scale = Math.min(winW / state.SW, winH / state.SH, 1);
  dom.stage.style.transform = `scale(${scale})`;
}

// ── 카드 생성 ──
export function createCards(){
  resizeStage();
  fitStage();
  dom.scene.innerHTML=''; state.cards=[];
  const th=THEMES[state.currentTheme];
  const groundY=state.SH-GROUND_OFFSET;

  state.names.forEach(name=>{
    const el=document.createElement('div');
    el.className='name-card';
    const t=th.card;
    el.style.background=t.bg; el.style.border=t.border;
    el.style.color=t.color; el.style.boxShadow=t.shadow;
    el.textContent=name;
    const x=Math.random()*(state.SW-170)+10;
    const y=Math.random()*(groundY-180)+10;
    el.style.left=x+'px'; el.style.top=y+'px';
    const spd=0.5+Math.random()*1.0;
    const ang=Math.random()*Math.PI*2;
    state.cards.push({el,name,x,y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,w:0,h:0,caught:false});
    dom.scene.appendChild(el);
  });
  requestAnimationFrame(()=>{ state.cards.forEach(c=>{ const r=c.el.getBoundingClientRect(); c.w=r.width; c.h=r.height; }); });
}

// ── 카드 물리 이동 ──
export function moveCards(){
  const groundY=state.SH-GROUND_OFFSET;
  const profCX = state.profX + 50;

  state.cards.forEach((c1, i)=>{
    if(c1.caught) return;

    // 카드끼리 충돌 방지
    for (let j = i + 1; j < state.cards.length; j++) {
      const c2 = state.cards[j];
      if (c2.caught) continue;
      const dx = (c1.x + c1.w / 2) - (c2.x + c2.w / 2);
      const dy = (c1.y + c1.h / 2) - (c2.y + c2.h / 2);
      const dist = Math.hypot(dx, dy);
      const min_dist = (c1.w + c2.w) / 2 * 0.85;
      if (dist < min_dist) {
        const overlap = min_dist - dist;
        const force = overlap * 0.05;
        const angle = Math.atan2(dy, dx);
        c1.vx += Math.cos(angle) * force;
        c1.vy += Math.sin(angle) * force;
        c2.vx -= Math.cos(angle) * force;
        c2.vy -= Math.sin(angle) * force;
      }
    }

    // 교수님이 걸을 때 가까이 오면 도망가기
    if(state.phase === 'walking'){
      const cardCX = c1.x + c1.w/2;
      const dist = Math.abs(cardCX - profCX);
      const runawayDist = 120;
      if(dist < runawayDist){
        const force = (1 - dist/runawayDist) * 0.25;
        c1.vx += (cardCX > profCX ? 1 : -1) * force;
      }
    }

    c1.x+=c1.vx; c1.y+=c1.vy;
    if(c1.x<0){c1.x=0;c1.vx*=-1;}
    if(c1.x>state.SW-c1.w-8){c1.x=state.SW-c1.w-8;c1.vx*=-1;}
    if(c1.y<0){c1.y=0;c1.vy*=-1;}
    if(c1.y>groundY-c1.h-8){c1.y=groundY-c1.h-8;c1.vy*=-1;}
    c1.el.style.left=c1.x+'px'; c1.el.style.top=c1.y+'px';
  });
}

// ── 카드 피킹 ──
const GRAB_DIST=120, JUMP_DIST=260, SUPER_DIST=380;

export function pickCard(){
  const avail=state.cards.filter(c=>!c.caught);
  if(!avail.length) return null;
  const px=state.profX+50, py=state.SH-GROUND_OFFSET-80;

  let candidates = avail.filter(c => {
    const cx = c.x + c.w/2;
    return (state.profDir === 1) ? (cx >= px) : (cx <= px);
  });
  if(candidates.length === 0) candidates = avail;

  const dists=candidates.map(c=>({c,d:Math.hypot(c.x+c.w/2-px,c.y+c.h/2-py)}));
  const sorted=dists.slice().sort((a,b)=>a.d-b.d);
  const nearest=sorted[0];
  const farthest=sorted[sorted.length-1];
  if(Math.random()<0.20){ farthest.c._mode='superman'; return farthest.c; }
  if(nearest.d<=GRAB_DIST){ nearest.c._mode='grab'; return nearest.c; }
  nearest.c._mode='jump'; return nearest.c;
}

// ── 카드 강조 (잡는 순간) ──
export function pulseCard(card){
  card.el.style.transition='transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s';
  card.el.style.background='linear-gradient(135deg,rgba(255,140,40,0.97),rgba(255,50,50,0.97))';
  card.el.style.border='2px solid rgba(255,230,80,1)';
  card.el.style.color='#fff';
  card.el.style.boxShadow='0 0 0px rgba(255,160,40,0)';
  card.el.style.fontSize='20px';
  card.el.style.zIndex='30';
  setTimeout(()=>{ card.el.style.transform='scale(1.5)'; card.el.style.boxShadow='0 0 40px rgba(255,160,40,0.9),0 0 80px rgba(255,80,80,0.4)'; },20);
  setTimeout(()=>{ card.el.style.transform='scale(1.15)'; },300);
}

// ── 카드 교수 위로 이동 ──
export function floatCardAboveProf(card,tx){
  const groundY=state.SH-GROUND_OFFSET;
  card.el.style.transition='left 0.7s cubic-bezier(0.34,1.56,0.64,1),top 0.7s cubic-bezier(0.34,1.56,0.64,1),transform 0.7s';
  card.el.style.left=(tx+5)+'px';
  card.el.style.top=(groundY-270)+'px';
  card.el.style.transform='scale(1.3)';
}

// ── 카드 속도 복원 ──
export function restoreCardSpeeds(){
  state.cards.forEach(c=>{ if(!c.caught&&c._savedVx!==undefined){ c.vx=c._savedVx; c.vy=c._savedVy; delete c._savedVx; delete c._savedVy; }});
}
