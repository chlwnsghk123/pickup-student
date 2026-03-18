// ════════════════════════════════════
//  공유 상태 + DOM 참조
// ════════════════════════════════════

export function getStageDims(count){
  if(count<=20) return {w:1000,h:700};
  if(count<=30) return {w:1200,h:800};
  return {w:1600,h:950};
}

export const GROUND_OFFSET=70;

export const state = {
  SW: 800,
  SH: 600,
  names: [],
  cards: [],
  profX: 80,
  profDir: 1,
  profSpeed: 2.5,
  phase: 'entering',   // entering | walking | stopping | jumping | done
  currentTheme: 0,
  walkCount: 0,
  walkInterval: null,
  bubbleTimer: null,
  lateTimer: null,
};

export const DEFAULT_NAMES=[
  "김민준","이서연","박지호","최수아","정예준",
  "강하은","윤도현","임지수","한민서","오준혁",
  "신예은","류성민","배나연","조현우","허서윤"
];

export const WALK_LINES_EARLY=[
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
export const WALK_LINES_LATE=["뽑을 때가 됐는데..","이제 뽑아야 하는데.."];

// DOM 참조 (initDOM()에서 초기화)
export const dom = {};

export function initDOM(){
  dom.stage       = document.getElementById('stage');
  dom.prof        = document.getElementById('professor');
  dom.profBody    = document.getElementById('prof-body');
  dom.profTorso   = document.getElementById('prof-torso');
  dom.profLA      = document.getElementById('prof-left-arm');
  dom.profRA      = document.getElementById('prof-right-arm');
  dom.bubble      = document.getElementById('speech-bubble');
  dom.stopBtn     = document.getElementById('stop-btn');
  dom.resetBtn    = document.getElementById('reset-btn');
  dom.scene       = document.getElementById('scene');
  dom.resultPanel = document.getElementById('result-panel');
  dom.fwCanvas    = document.getElementById('fireworks');
  dom.bgCanvas    = document.getElementById('bg-canvas');
  dom.fwCtx       = dom.fwCanvas.getContext('2d');
  dom.bgCtx       = dom.bgCanvas.getContext('2d');
  dom.airplane    = document.getElementById('airplane');
  dom.canopy      = document.getElementById('paraglide-canopy');
}
