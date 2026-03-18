// ════════════════════════════════════
//  메인 루프
// ════════════════════════════════════
function loop(){
  if(phase==='walking'){ moveCards(); moveProf(); }
  else if(phase==='stopping'||phase==='jumping'||phase==='entering'||phase==='ready'){ moveCards(); }
  requestAnimationFrame(loop);
}

// ════════════════════════════════════
//  이벤트
// ════════════════════════════════════
stopBtn.addEventListener('click',()=>{
  if(phase==='ready'){
    resumeAC();
    phase='walking';
    stopBtn.disabled=true;
    stopBtn.textContent='탐색하는 중...';
    startBgMusic(); startSteps(); startWalkBubbles();

    // 10~17초 후 자동 멈춤
    setTimeout(()=>{
      phase='stopping';
      clearInterval(walkInterval); clearTimeout(lateTimer);
      stopSteps(); hideBubble();
      showBubble('어디보자... 👀');
      stopBgMusic();
      resetBtn.style.display='none';
      setTimeout(()=>{ const c=pickCard(); if(c) doJumpAndCatch(c); },500);
    }, 10000 + Math.random()*7000);
  }
});

resetBtn.addEventListener('click',()=>{
  resumeAC();
  currentTheme=Math.floor(Math.random()*THEMES.length);
  clearInterval(walkInterval); clearTimeout(lateTimer); clearTimeout(bubbleTimer);
  stopBgMusic(); stopSteps();

  resetBtn.style.display='none';
  stopBtn.style.display='block';
  stopBtn.disabled=true;
  stopBtn.textContent='시작';

  prof.style.transition='none';
  prof.style.animation='none';
  profBody.style.transition='none';
  profBody.style.animation='none';
  prof.classList.remove('stopped','jumping','superman-right','superman-left');
  profBody.classList.remove('reach-fwd','superman-arm','walk-right','walk-left');

  hideBubble();
  resultPanel.classList.remove('show');
  fwActive=false;
  fwP=[]; fwCtx.clearRect(0,0,SW,SH);

  createCards();
  applyTheme();

  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    prof.style.transition='';
    prof.style.animation='';
    profBody.style.transition='';
    profBody.style.animation='';
    doEntrance();
  }));
});

// 클릭으로 AudioContext resume
document.getElementById('stage').addEventListener('click',resumeAC,{once:true});

// ════════════════════════════════════
//  시작
// ════════════════════════════════════
// 비밀번호 처리
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

function startGame(classChar){
  const filename = classChar + '.txt';
  fetch(filename).then(r => {
    if(!r.ok) throw new Error('Network error');
    return r.text();
  }).then(txt => {
    const n = txt.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    if(n.length) names = n;
    document.getElementById('start-screen').style.display = 'none';

    // 게임 초기화 및 시작
    currentTheme=Math.floor(Math.random()*THEMES.length);
    createCards();
    applyTheme();
    prof.style.bottom=(GROUND_OFFSET-2)+'px';
    updateProfVisual();
    loop();
    doEntrance();
  }).catch(e => alert('파일 로드 실패: ' + e.message));
}
