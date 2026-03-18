// ════════════════════════════════════
//  폭죽
// ════════════════════════════════════
let fwP=[], fwActive=false;
function launchFireworks(){
  fwActive=true;
  fwCtx.clearRect(0,0,SW,SH);
  for(let i=0;i<10;i++) setTimeout(burst,i*175);
  let t=0;
  (function fw(){ if(!fwActive||t++>180){
    if(!fwActive) fwCtx.clearRect(0,0,SW,SH);
    return;
  }
    fwCtx.fillStyle='rgba(0,0,0,0.10)'; fwCtx.fillRect(0,0,SW,SH);
    fwP=fwP.filter(p=>p.life>0);
    fwP.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.1;p.life--;
      fwCtx.globalAlpha=p.life/p.maxLife; fwCtx.fillStyle=p.col;
      fwCtx.beginPath();fwCtx.arc(p.x,p.y,p.r,0,Math.PI*2);fwCtx.fill();});
    fwCtx.globalAlpha=1; requestAnimationFrame(fw);})();
}
function burst(){
  const x=80+Math.random()*(SW-160),y=40+Math.random()*SH*.42;
  const cols=['#ffd32a','#ff6b6b','#48dbfb','#ff9ff3','#54a0ff','#1dd1a1','#ff9f43'];
  const col=cols[~~(Math.random()*cols.length)];
  for(let i=0;i<42;i++){
    const a=Math.random()*Math.PI*2,s=Math.random()*5+1;
    fwP.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:Math.random()*3+1,col,life:65,maxLife:65});
  }
}
