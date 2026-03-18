// ════════════════════════════════════
//  폭죽 파티클 시스템
// ════════════════════════════════════
import { state, dom } from './state.js';

let fwP=[], fwActive=false;

export function launchFireworks(){
  fwActive=true;
  dom.fwCtx.clearRect(0,0,state.SW,state.SH);
  for(let i=0;i<10;i++) setTimeout(burst,i*175);
  let t=0;
  (function fw(){ if(!fwActive||t++>180){
    if(!fwActive) dom.fwCtx.clearRect(0,0,state.SW,state.SH);
    return;
  }
    dom.fwCtx.fillStyle='rgba(0,0,0,0.10)'; dom.fwCtx.fillRect(0,0,state.SW,state.SH);
    fwP=fwP.filter(p=>p.life>0);
    fwP.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.1;p.life--;
      dom.fwCtx.globalAlpha=p.life/p.maxLife; dom.fwCtx.fillStyle=p.col;
      dom.fwCtx.beginPath();dom.fwCtx.arc(p.x,p.y,p.r,0,Math.PI*2);dom.fwCtx.fill();});
    dom.fwCtx.globalAlpha=1; requestAnimationFrame(fw);})();
}

function burst(){
  const x=80+Math.random()*(state.SW-160),y=40+Math.random()*state.SH*.42;
  const cols=['#ffd32a','#ff6b6b','#48dbfb','#ff9ff3','#54a0ff','#1dd1a1','#ff9f43'];
  const col=cols[~~(Math.random()*cols.length)];
  for(let i=0;i<42;i++){
    const a=Math.random()*Math.PI*2,s=Math.random()*5+1;
    fwP.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:Math.random()*3+1,col,life:65,maxLife:65});
  }
}

export function resetFireworks(){
  fwActive=false;
  fwP=[];
  dom.fwCtx.clearRect(0,0,state.SW,state.SH);
}
