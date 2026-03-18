// ════════════════════════════════════
//  상수
// ════════════════════════════════════
function getStageDims(count){
  if(count<=20) return {w:1000,h:700};
  if(count<=30) return {w:1200,h:800};
  return {w:1600,h:950};
}
let SW=800, SH=600;
const GROUND_OFFSET=70;

const DEFAULT_NAMES=[
  "김민준","이서연","박지호","최수아","정예준",
  "강하은","윤도현","임지수","한민서","오준혁",
  "신예은","류성민","배나연","조현우","허서윤"
];

const WALK_LINES_EARLY=[
  "누가 답변할까? 👀",
  "자, 누구의 순서지? 👀",
  "자네와 눈이 마주쳤군. 👀",
  "음....... 누구뽑지?",
  "두근두근.. 💓",
  "자네들의 반짝이는 눈빛! 🌟",
  "학구적인 향기가 나는구먼~ 🌸",
  "오호, 다들 열정이 가득하군! 🔥",
  "에헤이, 눈 피하면 안 되지~ 👀",
];
const WALK_LINES_LATE=["뽑을 때가 됐는데..","이제 뽑아야 하는데.."];

// ════════════════════════════════════
//  테마
// ════════════════════════════════════
function cloudFn(ctx){ return function(cx,cy,r){
  ctx.fillStyle='rgba(255,255,255,0.9)';
  [[0,0,r],[r*.65,-r*.28,r*.72],[-r*.6,-r*.22,r*.65],[0,-r*.38,r*.78]].forEach(([dx,dy,sr])=>{
    ctx.beginPath(); ctx.arc(cx+dx,cy+dy,sr,0,Math.PI*2); ctx.fill();
  });
};}

const THEMES=[
  // 0: 도심 낮
  {name:'🌆 도심',
   musicKey:'city',
   card:{bg:'rgba(20,35,60,0.92)',border:'2px solid rgba(120,180,255,0.75)',color:'#deeeff',shadow:'0 3px 16px rgba(0,0,50,0.45)'},
   prof:{torso:'#2c3a5a',tie:'#e74c3c',leg:'#1e2840',shoe:'#111'},
   stopBtn:{bg:'linear-gradient(135deg,#e74c3c,#a02010)',shadow:'0 5px 18px rgba(200,50,30,0.55)'},
   result:{bg:'rgba(8,16,40,0.95)',border:'2px solid rgba(120,180,255,0.6)',nameGrad:'linear-gradient(135deg,#74b9ff,#a29bfe)',text:'#deeeff'},
   modal:{bg:'#0a1428'},modalSave:'#2563eb',
   draw(ctx){
    const W=SW,H=SH,G=GROUND_OFFSET;
    const sky=ctx.createLinearGradient(0,0,0,H*.6); sky.addColorStop(0,'#3a7cc4'); sky.addColorStop(1,'#90c8e8');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    const cloud=cloudFn(ctx);
    cloud(W*0.15,55,32); cloud(W*0.35,44,26); cloud(W*0.65,50,38); cloud(W*0.85,60,28);
    ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.arc(W-90,52,26,0,Math.PI*2); ctx.fill();

    // 빌딩 동적 생성 (화면 너비에 맞춰 꽉 채움)
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
      bx+=bw-5; // 약간 겹치게
    }

    ctx.fillStyle='#484848'; ctx.fillRect(0,H-G,W,G);
    ctx.fillStyle='#d4b800'; ctx.fillRect(0,H-G,W,3);
    ctx.setLineDash([36,28]); ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(0,H-G/2); ctx.lineTo(W,H-G/2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='#7a7a7a'; ctx.fillRect(0,H-G,W,11);

    // 가로등 (상대 좌표)
    for(let lx=W*0.15; lx<W; lx+=W*0.25){
      ctx.strokeStyle='#bbb'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(lx,H-G); ctx.lineTo(lx,H-G-88); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lx,H-G-88); ctx.lineTo(lx+17,H-G-96); ctx.stroke();
      ctx.fillStyle='#FFE030'; ctx.beginPath(); ctx.arc(lx+17,H-G-98,5,0,Math.PI*2); ctx.fill();
    }
   }
  },
  // 1: 교실
  {name:'🏫 교실',
   musicKey:'classroom',
   card:{bg:'rgba(40,20,0,0.90)',border:'2px solid rgba(255,200,100,0.75)',color:'#fff8e8',shadow:'0 3px 16px rgba(80,40,0,0.45)'},
   prof:{torso:'#4a2010',tie:'#c0392b',leg:'#2a1008',shoe:'#1a0a00'},
   stopBtn:{bg:'linear-gradient(135deg,#e67e22,#a04010)',shadow:'0 5px 18px rgba(200,100,30,0.55)'},
   result:{bg:'rgba(30,15,0,0.97)',border:'2px solid rgba(255,200,100,0.65)',nameGrad:'linear-gradient(135deg,#f39c12,#e74c3c)',text:'#fff8e8'},
   modal:{bg:'#1e1000'},modalSave:'#e67e22',
   draw(ctx){
    const W=SW,H=SH,G=GROUND_OFFSET;
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
];
