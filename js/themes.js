// ════════════════════════════════════
//  테마 시스템 (THEMES 배열 + applyTheme)
// ════════════════════════════════════
import { state, dom, GROUND_OFFSET } from './state.js';

export function cloudFn(ctx){ return function(cx,cy,r){
  ctx.fillStyle='rgba(255,255,255,0.9)';
  [[0,0,r],[r*.65,-r*.28,r*.72],[-r*.6,-r*.22,r*.65],[0,-r*.38,r*.78]].forEach(([dx,dy,sr])=>{
    ctx.beginPath(); ctx.arc(cx+dx,cy+dy,sr,0,Math.PI*2); ctx.fill();
  });
};}

export const THEMES=[
  /* // 도심 낮 (비활성화)
  {name:'🌆 도심',
   musicKey:'city',
   card:{bg:'rgba(20,35,60,0.92)',border:'2px solid rgba(120,180,255,0.75)',color:'#deeeff',shadow:'0 3px 16px rgba(0,0,50,0.45)'},
   prof:{torso:'#2c3a5a',tie:'#e74c3c',leg:'#1e2840',shoe:'#111'},
   stopBtn:{bg:'linear-gradient(135deg,#e74c3c,#a02010)',shadow:'0 5px 18px rgba(200,50,30,0.55)'},
   result:{bg:'rgba(8,16,40,0.95)',border:'2px solid rgba(120,180,255,0.6)',nameGrad:'linear-gradient(135deg,#74b9ff,#a29bfe)',text:'#deeeff'},
   modal:{bg:'#0a1428'},modalSave:'#2563eb',
   draw(ctx){
    const W=state.SW,H=state.SH,G=GROUND_OFFSET;
    const sky=ctx.createLinearGradient(0,0,0,H*.6); sky.addColorStop(0,'#3a7cc4'); sky.addColorStop(1,'#90c8e8');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    const cloud=cloudFn(ctx);
    cloud(W*0.15,55,32); cloud(W*0.35,44,26); cloud(W*0.65,50,38); cloud(W*0.85,60,28);
    ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.arc(W-90,52,26,0,Math.PI*2); ctx.fill();
    const colors=['#3d4d65','#4e5f75','#303d52','#566070','#283040','#445062','#60708a'];
    let bx=0;
    while(bx<W){
      const bw=40+Math.random()*70;
      const bh=H*(0.3+Math.random()*0.45);
      const c=colors[Math.floor(Math.random()*colors.length)];
      ctx.fillStyle=c; ctx.fillRect(bx,H-bh,bw,bh);
      ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.fillRect(bx,H-bh,4,bh);
      ctx.fillStyle='rgba(255,240,150,0.72)';
      for(let wy=H-bh+14;wy<H-G-10;wy+=22) for(let wx=bx+8;wx<bx+bw-10;wx+=16) if(Math.random()>.3) ctx.fillRect(wx,wy,9,12);
      bx+=bw-5;
    }
    ctx.fillStyle='#484848'; ctx.fillRect(0,H-G,W,G);
    ctx.fillStyle='#d4b800'; ctx.fillRect(0,H-G,W,3);
    ctx.setLineDash([36,28]); ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(0,H-G/2); ctx.lineTo(W,H-G/2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#7a7a7a'; ctx.fillRect(0,H-G,W,11);
    for(let lx=W*0.15; lx<W; lx+=W*0.25){
      ctx.strokeStyle='#bbb'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(lx,H-G); ctx.lineTo(lx,H-G-88); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lx,H-G-88); ctx.lineTo(lx+17,H-G-96); ctx.stroke();
      ctx.fillStyle='#FFE030'; ctx.beginPath(); ctx.arc(lx+17,H-G-98,5,0,Math.PI*2); ctx.fill();
    }
   }
  },
  */
  // 0: 교실
  {name:'🏫 교실',
   musicKey:'classroom',
   card:{bg:'rgba(40,20,0,0.90)',border:'2px solid rgba(255,200,100,0.75)',color:'#fff8e8',shadow:'0 3px 16px rgba(80,40,0,0.45)'},
   prof:{torso:'#4a2010',tie:'#c0392b',leg:'#2a1008',shoe:'#1a0a00'},
   stopBtn:{bg:'linear-gradient(135deg,#e67e22,#a04010)',shadow:'0 5px 18px rgba(200,100,30,0.55)'},
   result:{bg:'rgba(30,15,0,0.97)',border:'2px solid rgba(255,200,100,0.65)',nameGrad:'linear-gradient(135deg,#f39c12,#e74c3c)',text:'#fff8e8'},
   modal:{bg:'#1e1000'},modalSave:'#e67e22',
   draw(ctx){
    const W=state.SW,H=state.SH,G=GROUND_OFFSET;
    const wall=ctx.createLinearGradient(0,0,0,H); wall.addColorStop(0,'#f5e8d0'); wall.addColorStop(1,'#e8d4b0');
    ctx.fillStyle=wall; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#2d6a4f'; ctx.fillRect(80,30,W-160,H*.38);
    ctx.strokeStyle='#1a4a32'; ctx.lineWidth=6; ctx.strokeRect(80,30,W-160,H*.38);
    ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='bold 22px serif';
    ctx.fillText('오늘의 답변자는?',110,85);
    ctx.fillStyle='rgba(200,220,255,0.5)'; ctx.font='16px serif';
    ctx.fillText('∮ f(x)dx = F(b) - F(a)',120,125);
    ctx.fillText('E = mc²     λ = h/mv',300,155);
    ctx.fillStyle='rgba(255,255,255,0.15)'; for(let i=0;i<40;i++){ ctx.beginPath(); ctx.arc(90+Math.random()*(W-200),35+Math.random()*H*.35,Math.random()*3+1,0,Math.PI*2); ctx.fill(); }
    ctx.fillStyle='rgba(255,255,255,0.08)'; for(let i=0;i<6;i++) ctx.fillRect(100+i*100,H*.38-30,60,20);
    function window2(wx,wy,ww,wh){ ctx.fillStyle='rgba(135,206,235,0.6)'; ctx.fillRect(wx,wy,ww,wh); ctx.strokeStyle='#8B6914'; ctx.lineWidth=5; ctx.strokeRect(wx,wy,ww,wh); ctx.strokeStyle='rgba(139,105,20,0.8)'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(wx+ww/2,wy); ctx.lineTo(wx+ww/2,wy+wh); ctx.moveTo(wx,wy+wh/2); ctx.lineTo(wx+ww,wy+wh/2); ctx.stroke(); }
    window2(W-160,H*.42,130,H*.22); window2(40,H*.42,130,H*.22);
    ctx.fillStyle='#c8a060'; ctx.fillRect(W-150,60,120,H*.32);
    ctx.strokeStyle='#8B6914'; ctx.lineWidth=4; ctx.strokeRect(W-150,60,120,H*.32);
    ctx.fillStyle='rgba(255,240,200,0.8)'; ctx.fillRect(W-142,70,50,40); ctx.fillRect(W-142,120,50,35); ctx.fillRect(W-82,70,44,50);
    const floor=ctx.createLinearGradient(0,H-G,0,H); floor.addColorStop(0,'#c8a848'); floor.addColorStop(1,'#b09030');
    ctx.fillStyle=floor; ctx.fillRect(0,H-G,W,G);
    ctx.strokeStyle='rgba(100,70,20,0.2)'; ctx.lineWidth=1;
    for(let x=0;x<W;x+=40){ ctx.beginPath(); ctx.moveTo(x,H-G); ctx.lineTo(x+10,H); ctx.stroke(); }
    ctx.fillStyle='rgba(180,140,60,0.5)'; ctx.fillRect(0,H-G,W,8);
   }
  },
  // 1: 비행기
  {name:'✈️ 비행기',
   musicKey:'city',
   entranceMode:'airplane',
   card:{bg:'rgba(10,20,50,0.90)',border:'2px solid rgba(100,200,255,0.7)',color:'#e0f0ff',shadow:'0 3px 16px rgba(0,30,80,0.5)'},
   prof:{torso:'#1a3a5c',tie:'#e74c3c',leg:'#0f2840',shoe:'#0a0a0a'},
   stopBtn:{bg:'linear-gradient(135deg,#2980b9,#1a5276)',shadow:'0 5px 18px rgba(40,120,180,0.55)'},
   result:{bg:'rgba(5,15,40,0.96)',border:'2px solid rgba(100,200,255,0.6)',nameGrad:'linear-gradient(135deg,#74b9ff,#0984e3)',text:'#e0f0ff'},
   modal:{bg:'#051028'},modalSave:'#2980b9',
   draw(ctx){
    const W=state.SW,H=state.SH,G=GROUND_OFFSET;
    const sky=ctx.createLinearGradient(0,0,0,H-G);
    sky.addColorStop(0,'#1a3a6c'); sky.addColorStop(0.4,'#4a8abf'); sky.addColorStop(1,'#87ceeb');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    const cloud=cloudFn(ctx);
    cloud(W*0.08,80,28); cloud(W*0.22,45,35); cloud(W*0.4,65,40);
    cloud(W*0.58,35,30); cloud(W*0.75,55,45); cloud(W*0.92,70,25);
    cloud(W*0.15,140,22); cloud(W*0.5,160,28); cloud(W*0.82,130,32);
    ctx.fillStyle='#555'; ctx.fillRect(0,H-G,W,G);
    ctx.fillStyle='#777'; ctx.fillRect(0,H-G,W,5);
    ctx.setLineDash([50,30]); ctx.strokeStyle='#fff'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(0,H-G/2); ctx.lineTo(W,H-G/2); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle='rgba(255,255,100,0.6)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(0,H-G+8); ctx.lineTo(W,H-G+8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,H-4); ctx.lineTo(W,H-4); ctx.stroke();
    for(let lx=30; lx<W; lx+=80){
      ctx.fillStyle='rgba(100,200,255,0.7)';
      ctx.beginPath(); ctx.arc(lx,H-G+4,3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(lx,H-6,3,0,Math.PI*2); ctx.fill();
    }
   }
  },
  // 2: 해변
  {name:'🏖️ 해변',
   musicKey:'city',
   card:{bg:'rgba(255,240,200,0.92)',border:'2px solid rgba(255,160,60,0.7)',color:'#3a2a10',shadow:'0 3px 16px rgba(120,80,20,0.4)'},
   prof:{torso:'hawaiian',tie:'none',leg:'#c8a870',shoe:'#d4a050',
         torsoStyle:'hawaiian-shirt', shortsColor:'#f0d090'},
   stopBtn:{bg:'linear-gradient(135deg,#f39c12,#e67e22)',shadow:'0 5px 18px rgba(240,160,30,0.55)'},
   result:{bg:'rgba(40,25,5,0.95)',border:'2px solid rgba(255,200,100,0.65)',nameGrad:'linear-gradient(135deg,#fdcb6e,#e17055)',text:'#fff8e0'},
   modal:{bg:'#1a1000'},modalSave:'#f39c12',
   draw(ctx){
    const W=state.SW,H=state.SH,G=GROUND_OFFSET;
    const sky=ctx.createLinearGradient(0,0,0,H*0.45);
    sky.addColorStop(0,'#87ceeb'); sky.addColorStop(1,'#b8e6ff');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.arc(W*0.82,60,35,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,215,0,0.2)'; ctx.beginPath(); ctx.arc(W*0.82,60,55,0,Math.PI*2); ctx.fill();
    const cloud=cloudFn(ctx);
    cloud(W*0.15,50,30); cloud(W*0.45,40,36); cloud(W*0.7,55,28);
    const sea=ctx.createLinearGradient(0,H*0.4,0,H-G);
    sea.addColorStop(0,'#1e90ff'); sea.addColorStop(0.5,'#4db8ff'); sea.addColorStop(1,'#87ceeb');
    ctx.fillStyle=sea; ctx.fillRect(0,H*0.4,W,H-G-H*0.4);
    ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=2;
    for(let wy=H*0.45; wy<H-G; wy+=30){
      ctx.beginPath();
      for(let wx=0; wx<W; wx+=5){ ctx.lineTo(wx, wy + Math.sin(wx*0.03 + wy*0.1)*6); }
      ctx.stroke();
    }
    const sand=ctx.createLinearGradient(0,H-G-15,0,H);
    sand.addColorStop(0,'#f4d68c'); sand.addColorStop(1,'#e8c06a');
    ctx.fillStyle=sand; ctx.fillRect(0,H-G,W,G);
    ctx.fillStyle='rgba(200,160,80,0.3)';
    for(let i=0;i<60;i++){
      ctx.beginPath();
      ctx.arc(Math.random()*W, H-G+Math.random()*G, Math.random()*2+0.5, 0, Math.PI*2);
      ctx.fill();
    }
    const px=W*0.08, py=H-G;
    ctx.strokeStyle='#8B6914'; ctx.lineWidth=8;
    ctx.beginPath(); ctx.moveTo(px,py); ctx.quadraticCurveTo(px+15,py-80,px+5,py-140); ctx.stroke();
    ctx.fillStyle='#228B22';
    for(let a=-0.8;a<=0.8;a+=0.4){
      ctx.save(); ctx.translate(px+5,py-140); ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(0,-15,8,40,0,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    const px2=W*0.92, py2=H-G;
    ctx.strokeStyle='#8B6914'; ctx.lineWidth=8;
    ctx.beginPath(); ctx.moveTo(px2,py2); ctx.quadraticCurveTo(px2-15,py2-80,px2-5,py2-140); ctx.stroke();
    ctx.fillStyle='#228B22';
    for(let a=-0.8;a<=0.8;a+=0.4){
      ctx.save(); ctx.translate(px2-5,py2-140); ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(0,-15,8,40,0,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    const ux=W*0.65, uy=H-G;
    ctx.strokeStyle='#999'; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(ux,uy); ctx.lineTo(ux,uy-80); ctx.stroke();
    ctx.fillStyle='#e74c3c';
    ctx.beginPath(); ctx.arc(ux,uy-80,40,Math.PI,0); ctx.fill();
    ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.moveTo(ux-40,uy-80); ctx.arc(ux,uy-80,40,Math.PI,Math.PI+Math.PI/4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(ux-40+53,uy-80); ctx.arc(ux,uy-80,40,Math.PI+Math.PI/2,Math.PI+Math.PI*3/4); ctx.closePath(); ctx.fill();
   }
  },
];

// ════════════════════════════════════
//  테마 적용
// ════════════════════════════════════
export function applyTheme(){
  const th=THEMES[state.currentTheme];
  dom.bgCtx.clearRect(0,0,state.SW,state.SH); th.draw(dom.bgCtx);

  // 복장 리셋 (테마 전환 시 이전 스타일 잔존 방지)
  dom.profTorso.style.backgroundImage='';
  dom.profTorso.style.borderRadius='8px 8px 4px 4px';
  document.querySelectorAll('.leg').forEach(l=>{
    l.style.height='28px';
    l.style.borderRadius='5px';
  });

  if(th.prof.torsoStyle==='hawaiian-shirt'){
    // 해변 복장: 하와이안 셔츠 + 반바지
    dom.profTorso.style.background='#2196F3';
    dom.profTorso.style.backgroundImage=
      'radial-gradient(circle 4px at 30% 30%, #ff6b6b 2px, transparent 3px),'+
      'radial-gradient(circle 4px at 70% 60%, #ffd32a 2px, transparent 3px),'+
      'radial-gradient(circle 4px at 50% 85%, #ff6b6b 2px, transparent 3px),'+
      'radial-gradient(circle 3px at 15% 70%, #fff 1.5px, transparent 2px),'+
      'radial-gradient(circle 3px at 85% 25%, #ffd32a 1.5px, transparent 2px)';
    dom.profTorso.style.borderRadius='6px 6px 2px 2px';
    dom.profTorso.style.setProperty('--tie-color','transparent');
    dom.profLA.style.background='#2196F3';
    dom.profRA.style.background='#2196F3';
    document.querySelectorAll('.leg').forEach(l=>{
      l.style.background=th.prof.shortsColor||'#f0d090';
      l.style.height='20px';
      l.style.setProperty('--shoe-color',th.prof.shoe);
    });
  } else {
    // 기본 복장
    dom.profTorso.style.background=th.prof.torso;
    dom.profTorso.style.setProperty('--tie-color',th.prof.tie);
    dom.profLA.style.background=th.prof.torso;
    dom.profRA.style.background=th.prof.torso;
    document.querySelectorAll('.leg').forEach(l=>{
      l.style.background=th.prof.leg;
      l.style.setProperty('--shoe-color',th.prof.shoe);
    });
  }

  dom.stopBtn.style.background=th.stopBtn.bg; dom.stopBtn.style.boxShadow=th.stopBtn.shadow;
  dom.resultPanel.style.background=th.result.bg; dom.resultPanel.style.border=th.result.border;
  document.getElementById('result-name').style.background=th.result.nameGrad;
  document.getElementById('result-name').style.webkitBackgroundClip='text';
  document.getElementById('result-name').style.webkitTextFillColor='transparent';
  document.getElementById('result-sub').style.color=th.result.text;
  document.getElementById('result-label').style.color=th.result.text;
}
