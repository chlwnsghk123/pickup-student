// ════════════════════════════════════
//  상태
// ════════════════════════════════════
let names=[...DEFAULT_NAMES], cards=[];
let profX=80, profDir=1, profSpeed=2.5;
let phase='entering';   // entering | walking | stopping | jumping | done
let currentTheme=0;
let walkCount=0, walkInterval=null, bubbleTimer=null, lateTimer=null;

const stage   =document.getElementById('stage');
const prof    =document.getElementById('professor');
const profBody=document.getElementById('prof-body');
const profTorso=document.getElementById('prof-torso');
const profLA  =document.getElementById('prof-left-arm');
const profRA  =document.getElementById('prof-right-arm');
const bubble  =document.getElementById('speech-bubble');
const stopBtn =document.getElementById('stop-btn');
const resetBtn=document.getElementById('reset-btn');
const scene   =document.getElementById('scene');
const resultPanel=document.getElementById('result-panel');
const fwCanvas=document.getElementById('fireworks');
let fwCtx   =fwCanvas.getContext('2d');
const bgCanvas=document.getElementById('bg-canvas');
let bgCtx   =bgCanvas.getContext('2d');

// ════════════════════════════════════
//  테마 적용
// ════════════════════════════════════
function applyTheme(){
  const th=THEMES[currentTheme];
  bgCtx.clearRect(0,0,SW,SH); th.draw(bgCtx);
  profTorso.style.background=th.prof.torso;
  profTorso.style.setProperty('--tie-color',th.prof.tie);
  profLA.style.background=th.prof.torso;
  profRA.style.background=th.prof.torso;
  document.querySelectorAll('.leg').forEach(l=>{ l.style.background=th.prof.leg; l.style.setProperty('--shoe-color',th.prof.shoe); });
  stopBtn.style.background=th.stopBtn.bg; stopBtn.style.boxShadow=th.stopBtn.shadow;
  resultPanel.style.background=th.result.bg; resultPanel.style.border=th.result.border;
  document.getElementById('result-name').style.background=th.result.nameGrad;
  document.getElementById('result-name').style.webkitBackgroundClip='text';
  document.getElementById('result-name').style.webkitTextFillColor='transparent';
  document.getElementById('result-sub').style.color=th.result.text;
  document.getElementById('result-label').style.color=th.result.text;
}

// ════════════════════════════════════
//  무대 크기 조정
// ════════════════════════════════════
function resizeStage(){
  const dims=getStageDims(names.length);
  if(SW===dims.w && SH===dims.h) return;
  SW=dims.w; SH=dims.h;
  const stage=document.getElementById('stage');
  stage.style.width=SW+'px';
  stage.style.height=SH+'px';
  const bgCvs=document.getElementById('bg-canvas');
  bgCvs.width=SW; bgCvs.height=SH;
  const fwCvs=document.getElementById('fireworks');
  fwCvs.width=SW; fwCvs.height=SH;
  bgCtx=bgCvs.getContext('2d');
  fwCtx=fwCvs.getContext('2d');
}

function fitStage(){
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const scale = Math.min(winW / SW, winH / SH, 1);
  const stage = document.getElementById('stage');
  stage.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', fitStage);

// ════════════════════════════════════
//  카드 생성
// ════════════════════════════════════
function createCards(){
  resizeStage();
  fitStage();
  scene.innerHTML=''; cards=[];
  const th=THEMES[currentTheme];
  const groundY=SH-GROUND_OFFSET;

  names.forEach(name=>{
    const el=document.createElement('div');
    el.className='name-card';
    const t=th.card;
    el.style.background=t.bg; el.style.border=t.border;
    el.style.color=t.color; el.style.boxShadow=t.shadow;
    el.textContent=name;
    const x=Math.random()*(SW-170)+10;
    const y=Math.random()*(groundY-180)+10;
    el.style.left=x+'px'; el.style.top=y+'px';
    const spd=0.5+Math.random()*1.0;
    const ang=Math.random()*Math.PI*2;
    cards.push({el,name,x,y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,w:0,h:0,caught:false});
    scene.appendChild(el);
  });
  requestAnimationFrame(()=>{ cards.forEach(c=>{ const r=c.el.getBoundingClientRect(); c.w=r.width; c.h=r.height; }); });
}
