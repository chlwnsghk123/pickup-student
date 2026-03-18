// ════════════════════════════════════
//  입장 애니메이션
// ════════════════════════════════════
function doEntrance(){
  phase='entering';
  stopBtn.disabled=true;
  const fromLeft=Math.random()>.5;
  profDir=fromLeft?1:-1;
  profX=fromLeft?-120:SW+20;
  const targetX=fromLeft?80:SW-180;
  prof.style.left=profX+'px';
  prof.style.bottom=(GROUND_OFFSET-2)+'px';
  updateProfVisual();
  prof.classList.add('stopped');
  profBody.classList.remove('stopped');

  prof.style.transition='left 2.4s cubic-bezier(0.25,0.46,0.45,0.94)';
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      prof.style.left=targetX+'px';
    });
  });

  playEntrance();

  setTimeout(()=>{
    prof.style.transition='';
    profX=targetX;
    prof.classList.remove('stopped');
    phase='ready';
    stopBtn.disabled=false;
    stopBtn.style.display='block';
    resetBtn.style.display='none';
  },2500);
}

// ════════════════════════════════════
//  카드 선택
// ════════════════════════════════════
const GRAB_DIST=120, JUMP_DIST=260, SUPER_DIST=380;

function pickCard(){
  const avail=cards.filter(c=>!c.caught);
  if(!avail.length) return null;
  const px=profX+50, py=SH-GROUND_OFFSET-80;

  let candidates = avail.filter(c => {
    const cx = c.x + c.w/2;
    return (profDir === 1) ? (cx >= px) : (cx <= px);
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

// ════════════════════════════════════
//  잡기
// ════════════════════════════════════
function showResult(card){
  document.getElementById('result-name').textContent=card.name;
  resultPanel.classList.add('show');
  launchFireworks();
  playCatch();
  phase='done';
  stopBgMusic(); stopSteps();
  stopBtn.disabled=true;
  resetBtn.style.display='none';
  setTimeout(()=>{
    resetBtn.style.display='block';
  }, 2000);
}

function doJumpAndCatch(card){
  phase='jumping';
  stopSteps(); stopBgMusic();
  prof.classList.add('stopped');
  profBody.classList.remove('reach-fwd','superman-arm');
  prof.classList.remove('jumping','superman-right','superman-left');

  const cardCX=card.x+card.w/2;
  const newDir=cardCX>(profX+50)?1:-1;
  profDir=newDir; updateProfVisual();

  const mode=card._mode||'jump';
  const isSuperman=(mode==='superman');
  const isGrab=(mode==='grab');

  showBubble(isSuperman?'슈퍼 교수님 출동! 🦸':'잡아야지! 😈');
  playStop();

  let targetX;
  if(profDir === 1) {
    targetX = card.x - 60;
  } else {
    targetX = card.x + 10;
  }
  targetX = Math.max(15, Math.min(SW-110, targetX));

  setTimeout(()=>{
    if(isSuperman){
      setTimeout(()=>{ playSuperman(); },50);
      profBody.classList.add('superman-arm');
      prof.classList.add(profDir===1?'superman-right':'superman-left');

      prof.style.transition = 'left 0.9s cubic-bezier(0.4, 0, 0.6, 1)';
      setTimeout(() => {
          profX = targetX;
          prof.style.left = profX + 'px';
      }, 50);

      setTimeout(()=>{
        card.caught=true;
        card.el.classList.add('caught');
        pulseCard(card);
      }, 950);

      setTimeout(()=>{
        prof.style.transition = '';
        prof.classList.remove('superman-right','superman-left');
        profBody.classList.remove('superman-arm');
        profBody.classList.add('reach-fwd');
        showBubble('잡았다!! 🎉');
        floatCardAboveProf(card,profX);
      }, 1900);

      setTimeout(()=>{
        showResult(card);
      }, 3000);

    } else {
      cards.forEach(c=>{ if(!c.caught){ c._savedVx=c.vx; c._savedVy=c.vy; c.vx*=0.18; c.vy*=0.18; }});

      if(isGrab){
        profBody.classList.add('reach-fwd');
        const startX=profX, dist2=Math.abs(targetX-startX);
        const steps=Math.max(20, Math.round(dist2/2));
        let step=0;
        const iv=setInterval(()=>{
          step++;
          const t=step/steps;
          const ease=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
          profX=startX+(targetX-startX)*ease;
          prof.style.left=profX+'px';
          if(step>=steps){
            clearInterval(iv);
            card.caught=true; card.el.classList.add('caught');
            pulseCard(card);
            showBubble('잡았다!! 🎉');
            setTimeout(()=>{
              floatCardAboveProf(card,profX);
              setTimeout(()=>{ restoreCardSpeeds(); showResult(card); },1000);
            },600);
          }
        },35);
      } else {
        playJump();
        prof.classList.add('jumping');
        profBody.classList.add('reach-fwd');
        setTimeout(()=>{
          profX=targetX; prof.style.left=profX+'px';
          card.caught=true; card.el.classList.add('caught');
          pulseCard(card);
          showBubble('잡았다!! 🎉');
        },550);
        setTimeout(()=>{
          prof.classList.remove('jumping');
          floatCardAboveProf(card,profX);
        },1250);
        setTimeout(()=>{ restoreCardSpeeds(); showResult(card); },2200);
      }
    }
  },500);
}

// 카드 강조 (잡는 순간)
function pulseCard(card){
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

// 카드 교수 위로 이동
function floatCardAboveProf(card,tx){
  const groundY=SH-GROUND_OFFSET;
  card.el.style.transition='left 0.7s cubic-bezier(0.34,1.56,0.64,1),top 0.7s cubic-bezier(0.34,1.56,0.64,1),transform 0.7s';
  card.el.style.left=(tx+5)+'px';
  card.el.style.top=(groundY-270)+'px';
  card.el.style.transform='scale(1.3)';
}

function restoreCardSpeeds(){
  cards.forEach(c=>{ if(!c.caught&&c._savedVx!==undefined){ c.vx=c._savedVx; c.vy=c._savedVy; delete c._savedVx; delete c._savedVy; }});
}
