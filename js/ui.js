// ════════════════════════════════════
//  말풍선
// ════════════════════════════════════
function showBubble(text,dur=0){
  clearTimeout(bubbleTimer);
  bubble.textContent=text; bubble.classList.add('visible');
  if(dur>0) bubbleTimer=setTimeout(hideBubble,dur);
}
function hideBubble(){ bubble.classList.remove('visible'); }

function pickWalkLine(){
  walkCount++;
  const pool=walkCount<=3?WALK_LINES_EARLY:WALK_LINES_LATE;
  return pool[Math.floor(Math.random()*pool.length)];
}
function startWalkBubbles(){
  clearInterval(walkInterval); clearTimeout(lateTimer);
  walkCount=0;
  showBubble(pickWalkLine(),5000);
  walkInterval=setInterval(()=>{ if(phase==='walking') showBubble(pickWalkLine(),5000); },7200);
  lateTimer=setTimeout(()=>{ if(phase==='walking') walkCount=99; },10000);
}
