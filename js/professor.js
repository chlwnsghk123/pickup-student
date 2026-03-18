// ════════════════════════════════════
//  교수 캐릭터 (이동, 비주얼, 입장, 캐치)
// ════════════════════════════════════
import { state, dom, GROUND_OFFSET, WALK_LINES_EARLY, WALK_LINES_LATE } from './state.js';
import { THEMES } from './themes.js';
import { playEntrance, playStop, playJump, playSuperman, playCatch,
         startSteps, stopSteps, startBgMusic, stopBgMusic } from './audio.js';
import { pickCard, pulseCard, floatCardAboveProf, restoreCardSpeeds } from './cards.js';
import { launchFireworks } from './fireworks.js';

// ── 교수 이동 ──
export function moveProf(){
  state.profX+=state.profDir*state.profSpeed;
  if(state.profX>state.SW-110){state.profX=state.SW-110; setDir(-1);}
  if(state.profX<15)          {state.profX=15;            setDir(1); }
  dom.prof.style.left=state.profX+'px';
}

export function setDir(d){
  state.profDir=d; updateProfVisual();
}

export function updateProfVisual(){
  if(state.profDir===1){
    dom.profBody.style.transform='scaleX(1)';
    document.getElementById('prof-face').style.transform='scaleX(1)';
    dom.bubble.style.transform='translateX(-50%) scaleX(1)';
    dom.profBody.classList.remove('walk-left'); dom.profBody.classList.add('walk-right');
  } else {
    dom.profBody.style.transform='scaleX(-1)';
    document.getElementById('prof-face').style.transform='scaleX(-1)';
    dom.bubble.style.transform='translateX(-50%) scaleX(-1)';
    dom.profBody.classList.remove('walk-right'); dom.profBody.classList.add('walk-left');
  }
}

// ── 말풍선 ──
export function showBubble(text,dur=0){
  clearTimeout(state.bubbleTimer);
  dom.bubble.textContent=text; dom.bubble.classList.add('visible');
  if(dur>0) state.bubbleTimer=setTimeout(hideBubble,dur);
}
export function hideBubble(){ dom.bubble.classList.remove('visible'); }

function pickWalkLine(){
  state.walkCount++;
  const pool=state.walkCount<=3?WALK_LINES_EARLY:WALK_LINES_LATE;
  return pool[Math.floor(Math.random()*pool.length)];
}

export function startWalkBubbles(){
  clearInterval(state.walkInterval); clearTimeout(state.lateTimer);
  state.walkCount=0;
  showBubble(pickWalkLine(),5000);
  state.walkInterval=setInterval(()=>{ if(state.phase==='walking') showBubble(pickWalkLine(),5000); },7200);
  state.lateTimer=setTimeout(()=>{ if(state.phase==='walking') state.walkCount=99; },10000);
}

// ════════════════════════════════════
//  비행기 테마 전용 입장
// ════════════════════════════════════
function doAirplaneEntrance(){
  state.phase='entering';
  dom.stopBtn.disabled=true;

  const airplane=dom.airplane;
  const canopy=dom.canopy;

  // 1단계: 비행기가 오른쪽 바깥에서 날아와 오른쪽 상단에 멈춤
  airplane.style.display='block';
  airplane.style.transition='none';
  airplane.style.left=(state.SW+80)+'px';
  airplane.style.top='40px';

  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    airplane.style.transition='left 2s cubic-bezier(0.25,0.46,0.45,0.94)';
    airplane.style.left=(state.SW-160)+'px';
  }));

  playEntrance();

  // 교수를 화면 밖에 숨김
  dom.prof.style.left='-200px';
  dom.prof.classList.add('stopped');
  dom.profBody.classList.remove('walk-right','walk-left');

  // 2단계 (2.2초 후): 교수가 비행기 위치에서 패러글라이딩 시작
  setTimeout(()=>{
    const dropStartX=state.SW-180;
    const dropStartY=60;

    state.profX=dropStartX;
    dom.prof.style.left=state.profX+'px';
    dom.prof.style.bottom='auto';
    dom.prof.style.top=dropStartY+'px';
    state.profDir=-1;
    updateProfVisual();

    canopy.classList.add('visible');

    // 3단계: 대각선 하강
    const targetX=state.SW*0.3;
    const targetTop=state.SH-GROUND_OFFSET-140;

    dom.prof.style.transition='left 2.8s cubic-bezier(0.3,0,0.2,1), top 2.8s cubic-bezier(0.4,0,0.6,1)';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      dom.prof.style.left=targetX+'px';
      dom.prof.style.top=targetTop+'px';
    }));

    // 비행기는 0.8초 뒤 왼쪽으로 퇴장
    setTimeout(()=>{
      airplane.style.transition='left 3s linear';
      airplane.style.left='-150px';
    },800);

    // 4단계 (3초 후): 착지 완료
    setTimeout(()=>{
      dom.prof.style.transition='';
      dom.prof.style.top='';
      dom.prof.style.bottom=(GROUND_OFFSET-2)+'px';
      state.profX=targetX;
      dom.prof.style.left=state.profX+'px';

      canopy.classList.remove('visible');
      airplane.style.display='none';
      dom.prof.classList.remove('stopped');

      state.profDir=1;
      updateProfVisual();

      state.phase='ready';
      dom.stopBtn.disabled=false;
      dom.stopBtn.style.display='block';
      dom.resetBtn.style.display='none';
    },3000);
  },2200);
}

// ════════════════════════════════════
//  입장 애니메이션
// ════════════════════════════════════
export function doEntrance(){
  const th=THEMES[state.currentTheme];
  if(th.entranceMode==='airplane'){
    doAirplaneEntrance();
    return;
  }

  state.phase='entering';
  dom.stopBtn.disabled=true;
  const fromLeft=Math.random()>.5;
  state.profDir=fromLeft?1:-1;
  state.profX=fromLeft?-120:state.SW+20;
  const targetX=fromLeft?80:state.SW-180;
  dom.prof.style.left=state.profX+'px';
  dom.prof.style.bottom=(GROUND_OFFSET-2)+'px';
  updateProfVisual();
  dom.prof.classList.add('stopped');
  dom.profBody.classList.remove('stopped');

  dom.prof.style.transition='left 2.4s cubic-bezier(0.25,0.46,0.45,0.94)';
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      dom.prof.style.left=targetX+'px';
    });
  });

  playEntrance();

  setTimeout(()=>{
    dom.prof.style.transition='';
    state.profX=targetX;
    dom.prof.classList.remove('stopped');
    state.phase='ready';
    dom.stopBtn.disabled=false;
    dom.stopBtn.style.display='block';
    dom.resetBtn.style.display='none';
  },2500);
}

// ════════════════════════════════════
//  결과 표시
// ════════════════════════════════════
export function showResult(card){
  document.getElementById('result-name').textContent=card.name;
  dom.resultPanel.classList.add('show');
  launchFireworks();
  playCatch();
  state.phase='done';
  stopBgMusic(); stopSteps();
  dom.stopBtn.disabled=true;
  dom.resetBtn.style.display='none';
  setTimeout(()=>{
    dom.resetBtn.style.display='block';
  }, 2000);
}

// ════════════════════════════════════
//  잡기 시퀀스
// ════════════════════════════════════
export function doJumpAndCatch(card){
  state.phase='jumping';
  stopSteps(); stopBgMusic();
  dom.prof.classList.add('stopped');
  dom.profBody.classList.remove('reach-fwd','superman-arm');
  dom.prof.classList.remove('jumping','superman-right','superman-left');

  const cardCX=card.x+card.w/2;
  const newDir=cardCX>(state.profX+50)?1:-1;
  state.profDir=newDir; updateProfVisual();

  const mode=card._mode||'jump';
  const isSuperman=(mode==='superman');
  const isGrab=(mode==='grab');

  showBubble(isSuperman?'슈퍼 교수님 출동! 🦸':'잡아야지! 😈');
  playStop();

  let targetX;
  if(state.profDir === 1) {
    targetX = card.x - 60;
  } else {
    targetX = card.x + 10;
  }
  targetX = Math.max(15, Math.min(state.SW-110, targetX));

  setTimeout(()=>{
    if(isSuperman){
      setTimeout(()=>{ playSuperman(); },50);
      dom.profBody.classList.add('superman-arm');
      dom.prof.classList.add(state.profDir===1?'superman-right':'superman-left');

      dom.prof.style.transition = 'left 0.9s cubic-bezier(0.4, 0, 0.6, 1)';
      setTimeout(() => {
          state.profX = targetX;
          dom.prof.style.left = state.profX + 'px';
      }, 50);

      setTimeout(()=>{
        card.caught=true;
        card.el.classList.add('caught');
        pulseCard(card);
      }, 950);

      setTimeout(()=>{
        dom.prof.style.transition = '';
        dom.prof.classList.remove('superman-right','superman-left');
        dom.profBody.classList.remove('superman-arm');
        dom.profBody.classList.add('reach-fwd');
        showBubble('잡았다!! 🎉');
        floatCardAboveProf(card,state.profX);
      }, 1900);

      setTimeout(()=>{
        showResult(card);
      }, 3000);

    } else {
      state.cards.forEach(c=>{ if(!c.caught){ c._savedVx=c.vx; c._savedVy=c.vy; c.vx*=0.18; c.vy*=0.18; }});

      if(isGrab){
        dom.profBody.classList.add('reach-fwd');
        const startX=state.profX, dist2=Math.abs(targetX-startX);
        const steps=Math.max(20, Math.round(dist2/2));
        let step=0;
        const iv=setInterval(()=>{
          step++;
          const t=step/steps;
          const ease=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
          state.profX=startX+(targetX-startX)*ease;
          dom.prof.style.left=state.profX+'px';
          if(step>=steps){
            clearInterval(iv);
            card.caught=true; card.el.classList.add('caught');
            pulseCard(card);
            showBubble('잡았다!! 🎉');
            setTimeout(()=>{
              floatCardAboveProf(card,state.profX);
              setTimeout(()=>{ restoreCardSpeeds(); showResult(card); },1000);
            },600);
          }
        },35);
      } else {
        playJump();
        dom.prof.classList.add('jumping');
        dom.profBody.classList.add('reach-fwd');
        setTimeout(()=>{
          state.profX=targetX; dom.prof.style.left=state.profX+'px';
          card.caught=true; card.el.classList.add('caught');
          pulseCard(card);
          showBubble('잡았다!! 🎉');
        },550);
        setTimeout(()=>{
          dom.prof.classList.remove('jumping');
          floatCardAboveProf(card,state.profX);
        },1250);
        setTimeout(()=>{ restoreCardSpeeds(); showResult(card); },2200);
      }
    }
  },500);
}
