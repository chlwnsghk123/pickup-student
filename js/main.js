// ════════════════════════════════════
//  메인 진입점 (루프, 이벤트, 초기화)
// ════════════════════════════════════
import { state, dom, initDOM, DEFAULT_NAMES, GROUND_OFFSET } from './state.js';
import { THEMES, applyTheme } from './themes.js';
import { resumeAC, startBgMusic, startSteps, stopSteps, stopBgMusic } from './audio.js';
import { createCards, moveCards, pickCard, fitStage } from './cards.js';
import { moveProf, doEntrance, doJumpAndCatch, showBubble, hideBubble,
         startWalkBubbles, updateProfVisual } from './professor.js';
import { resetFireworks } from './fireworks.js';

// ── 게임 루프 ──
function loop(){
  if(state.phase==='walking'){ moveCards(); moveProf(); }
  else if(state.phase==='stopping'||state.phase==='jumping'||state.phase==='entering'||state.phase==='ready'){ moveCards(); }
  requestAnimationFrame(loop);
}

// ── 초기화 ──
initDOM();
window.addEventListener('resize', fitStage);

// 스톱 버튼
dom.stopBtn.addEventListener('click',()=>{
  if(state.phase==='ready'){
    resumeAC();
    state.phase='walking';
    dom.stopBtn.disabled=true;
    dom.stopBtn.textContent='탐색하는 중...';
    startBgMusic(); startSteps(); startWalkBubbles();

    // 10~17초 후 자동 멈춤
    setTimeout(()=>{
      state.phase='stopping';
      clearInterval(state.walkInterval); clearTimeout(state.lateTimer);
      stopSteps(); hideBubble();
      showBubble('어디보자... 👀');
      stopBgMusic();
      dom.resetBtn.style.display='none';
      setTimeout(()=>{ const c=pickCard(); if(c) doJumpAndCatch(c); },500);
    }, 10000 + Math.random()*7000);
  }
});

// 리셋 버튼
dom.resetBtn.addEventListener('click',()=>{
  resumeAC();
  state.currentTheme=Math.floor(Math.random()*THEMES.length);
  clearInterval(state.walkInterval); clearTimeout(state.lateTimer); clearTimeout(state.bubbleTimer);
  stopBgMusic(); stopSteps();

  dom.resetBtn.style.display='none';
  dom.stopBtn.style.display='block';
  dom.stopBtn.disabled=true;
  dom.stopBtn.textContent='시작';

  dom.prof.style.transition='none';
  dom.prof.style.animation='none';
  dom.profBody.style.transition='none';
  dom.profBody.style.animation='none';
  dom.prof.classList.remove('stopped','jumping','superman-right','superman-left');
  dom.profBody.classList.remove('reach-fwd','superman-arm','walk-right','walk-left');

  // 비행기 테마 정리
  dom.airplane.style.display='none';
  dom.canopy.classList.remove('visible');
  dom.prof.style.top='';
  dom.prof.style.bottom=(GROUND_OFFSET-2)+'px';

  hideBubble();
  dom.resultPanel.classList.remove('show');
  resetFireworks();

  createCards();
  applyTheme();

  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    dom.prof.style.transition='';
    dom.prof.style.animation='';
    dom.profBody.style.transition='';
    dom.profBody.style.animation='';
    doEntrance();
  }));
});

// 클릭으로 AudioContext resume
dom.stage.addEventListener('click',resumeAC,{once:true});

// ════════════════════════════════════
//  시작 화면
// ════════════════════════════════════
document.getElementById('password-submit').addEventListener('click', () => {
    const input = document.getElementById('password-input');
    if (input.value === '0821') {
        document.getElementById('password-section').style.display = 'none';
        document.getElementById('class-section').style.display = 'block';
    } else {
        alert('비밀번호가 틀렸습니다.');
        input.value = '';
        input.focus();
    }
});
document.getElementById('password-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('password-submit').click();
    }
});

// startGame을 전역에 노출 (HTML onclick에서 호출)
window.startGame = function(classChar){
  const filename = classChar + '.txt';
  fetch(filename).then(r => {
    if(!r.ok) throw new Error('Network error');
    return r.text();
  }).then(txt => {
    const n = txt.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    if(n.length) state.names = n;
    else state.names = [...DEFAULT_NAMES];
    document.getElementById('start-screen').style.display = 'none';

    state.currentTheme=Math.floor(Math.random()*THEMES.length);
    createCards();
    applyTheme();
    dom.prof.style.bottom=(GROUND_OFFSET-2)+'px';
    updateProfVisual();
    loop();
    doEntrance();
  }).catch(e => alert('파일 로드 실패: ' + e.message));
};
