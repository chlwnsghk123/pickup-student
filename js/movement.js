// ════════════════════════════════════
//  이동
// ════════════════════════════════════
function moveCards(){
  const groundY=SH-GROUND_OFFSET;
  const profCX = profX + 50;

  cards.forEach((c1, i)=>{
    if(c1.caught) return;

    // 카드끼리 충돌 방지 (부드럽게)
    for (let j = i + 1; j < cards.length; j++) {
      const c2 = cards[j];
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

    // 교수님이 걸을 때(탐색 중) 가까이 오면 도망가기
    if(phase === 'walking'){
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
    if(c1.x>SW-c1.w-8){c1.x=SW-c1.w-8;c1.vx*=-1;}
    if(c1.y<0){c1.y=0;c1.vy*=-1;}
    if(c1.y>groundY-c1.h-8){c1.y=groundY-c1.h-8;c1.vy*=-1;}
    c1.el.style.left=c1.x+'px'; c1.el.style.top=c1.y+'px';
  });
}

function moveProf(){
  profX+=profDir*profSpeed;
  if(profX>SW-110){profX=SW-110; setDir(-1);}
  if(profX<15)    {profX=15;     setDir(1); }
  prof.style.left=profX+'px';
}

function setDir(d){
  profDir=d; updateProfVisual();
}
function updateProfVisual(){
  if(profDir===1){
    profBody.style.transform='scaleX(1)';
    document.getElementById('prof-face').style.transform='scaleX(1)';
    bubble.style.transform='translateX(-50%) scaleX(1)';
    profBody.classList.remove('walk-left'); profBody.classList.add('walk-right');
  } else {
    profBody.style.transform='scaleX(-1)';
    document.getElementById('prof-face').style.transform='scaleX(-1)';
    bubble.style.transform='translateX(-50%) scaleX(-1)';
    profBody.classList.remove('walk-right'); profBody.classList.add('walk-left');
  }
}
