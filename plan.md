# 리팩토링 계획: index.html 모듈 분리

## 현황 분석

### 파일 현황
- **index.html**: 1,499줄, CSS(~350줄) + HTML(~55줄) + JS(~1,075줄) 단일 파일
- 6개의 서로 다른 관심사가 하나의 파일에 혼재

### 현재 코드의 논리적 영역 (line 기준)

| 영역 | 라인 범위 | 줄 수 | 내용 |
|------|----------|-------|------|
| CSS 전체 | 8~356 | ~348 | 캐릭터, 애니메이션, UI, 테마요소, 시작화면 |
| HTML 바디 | 357~412 | ~55 | stage, professor, UI, start-screen DOM |
| 오디오 시스템 | 413~577 | ~165 | Web Audio API, 효과음, BGM |
| 테마 + 상수 | 579~815 | ~237 | THEMES 배열(draw 포함), 상태변수, DOM 참조 |
| 게임 로직 | 816~1346 | ~530 | applyTheme, 카드물리, 교수이동, 입장, 캐치 |
| 루프 + 이벤트 | 1347~1499 | ~152 | game loop, 버튼핸들러, 초기화, 시작화면 |

### 핵심 의존 관계

```
startGame() → createCards() → resizeStage() → fitStage()
           → applyTheme() → THEMES[n].draw(bgCtx)
           → loop()        → moveCards() + moveProf()
           → doEntrance()  → doAirplaneEntrance() (비행기 테마)

stopBtn click → pickCard() → doJumpAndCatch(card)
                            → pulseCard() + floatCardAboveProf()
                            → showResult() → launchFireworks()

resetBtn click → createCards() + applyTheme() + doEntrance()
```

### 공유 상태 (전역 변수)

```
SW, SH, GROUND_OFFSET         // 스테이지 크기
names, cards                   // 학생 데이터
profX, profDir, profSpeed      // 교수 위치/방향
phase                          // 게임 상태머신
currentTheme, walkCount        // 테마/걷기 카운트
walkInterval, bubbleTimer, lateTimer  // 타이머 ID
```

---

## 모듈 분리 전략

### 설계 원칙

1. **ES Module (`import`/`export`)** 사용 — `<script type="module">`
2. **공유 상태**는 `state.js`에 객체 하나로 집중 관리 → 각 모듈이 import하여 읽기/쓰기
3. **DOM 참조**도 `state.js`에서 한 번만 쿼리 → 모든 모듈이 재사용
4. **테마 데이터**는 JS 모듈로 분리, `draw()` 함수 포함
5. **CSS**는 관심사별 파일 분리 (캐릭터, 애니메이션, UI, 시작화면)
6. 기존 동작/타이밍 100% 유지 — 리팩토링 전후 동작 차이 없음

---

## 변경 후 디렉토리 트리

```
pickup-student/
├── index.html              ← HTML 골격만 (~80줄)
├── A.txt                   (기존 유지)
├── B.txt                   (기존 유지)
├── plan.md
├── research.md
│
├── css/
│   ├── base.css            ← 글로벌 리셋, #stage, #scene, canvas
│   ├── professor.css       ← 교수 캐릭터 (#prof-*), 걷기/점프 애니메이션
│   ├── cards.css           ← .name-card 스타일
│   ├── ui.css              ← 버튼, 결과패널, 테마라벨, 비행기/캐노피
│   └── start-screen.css    ← 시작화면 오버레이, 메뉴박스, 비밀번호 입력
│
└── js/
    ├── state.js            ← 공유 상태 객체 + DOM 참조 초기화
    ├── audio.js            ← Web Audio API (효과음 + BGM)
    ├── themes.js           ← THEMES 배열 (draw 함수 포함) + applyTheme()
    ├── cards.js            ← 카드 생성, 물리 이동, 피킹, 애니메이션
    ├── professor.js        ← 교수 이동, 비주얼, 입장, 캐치 시퀀스
    ├── fireworks.js        ← 불꽃놀이 파티클 시스템
    └── main.js             ← 게임 루프, 이벤트 바인딩, 초기화, 시작화면
```

---

## 각 파일의 역할과 내용

### `index.html` (~80줄)

HTML 골격만 남김. CSS link 5개 + `<script type="module">` 1개.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>교수의 답변자 뽑기</title>
  <link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/professor.css">
  <link rel="stylesheet" href="css/cards.css">
  <link rel="stylesheet" href="css/ui.css">
  <link rel="stylesheet" href="css/start-screen.css">
</head>
<body>
  <div id="stage">
    <canvas id="bg-canvas" width="800" height="600"></canvas>
    <canvas id="fireworks" width="800" height="600"></canvas>
    <div id="scene"></div>
    <div id="airplane">✈️</div>

    <div id="professor">
      <div id="prof-body" class="walk-right">
        <div id="speech-bubble"></div>
        <div id="paraglide-canopy"></div>
        <div id="prof-face">
          <img id="prof-img" src="data:image/jpeg;base64,..." />
        </div>
        <div id="prof-torso">
          <div id="prof-left-arm"></div>
          <div id="prof-right-arm"></div>
        </div>
        <div id="prof-legs">
          <div class="leg left"></div>
          <div class="leg right"></div>
        </div>
      </div>
    </div>

    <div id="ui">
      <button id="stop-btn">멈춰!</button>
      <button id="reset-btn" style="display:none;">다시</button>
    </div>
    <div id="theme-label"></div>
    <div id="result-panel">
      <div id="result-label"></div>
      <div id="result-name"></div>
      <div id="result-sub"></div>
    </div>
  </div>

  <div id="start-screen">
    <!-- 메뉴박스 구조 동일 -->
  </div>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

---

### `css/base.css` (~30줄)

```css
/* 글로벌 리셋 + 스테이지 레이아웃 */
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:100%; height:100%; overflow:hidden; background:#111; ... }
#stage { position:relative; overflow:hidden; border-radius:12px; ... }
#bg-canvas, #fireworks { position:absolute; top:0; left:0; width:100%; height:100%; }
#fireworks { z-index:30; pointer-events:none; }
#scene { position:absolute; inset:0; z-index:2; }
```

현재 라인 9~29 해당.

---

### `css/professor.css` (~130줄)

```css
/* 교수 캐릭터 전체 */
#professor { position:absolute; z-index:5; width:100px; ... }
#prof-body { display:flex; flex-direction:column; ... }
#prof-face { ... }
#prof-torso { ... }
#prof-torso::after { /* 넥타이 */ }
#prof-left-arm, #prof-right-arm { ... }
#prof-legs { ... }
.leg { ... }

/* 걷기 애니메이션 (@keyframes walkL, walkR) */
/* 점프 애니메이션 (@keyframes profJump) */
/* 슈퍼맨 비행 (@keyframes profFlyRight, profFlyLeft) */
/* 입장 애니메이션 (@keyframes enterFromLeft, enterFromRight) */
/* 말풍선 (#speech-bubble) */

/* 상태 클래스 */
.stopped .leg { ... }
#prof-body.reach-fwd #prof-right-arm { ... }
#prof-body.superman-arm { ... }
.jumping { ... }
.superman-right { ... }
.superman-left { ... }
.entering-left { ... }
.entering-right { ... }
```

현재 라인 43~201 해당. 교수 캐릭터와 관련된 모든 CSS를 여기에 집중.

---

### `css/cards.css` (~15줄)

```css
/* 이름 카드 */
.name-card { position:absolute; padding:10px 16px; border-radius:10px; ... }
.name-card.caught { z-index:6; }

/* 카드 캐치 애니메이션 */
@keyframes cardFlyIn { ... }
.card-caught-anim { animation:cardFlyIn 0.8s ... }
```

현재 라인 31~41 + 183~188 해당.

---

### `css/ui.css` (~100줄)

```css
/* 비행기/캐노피 테마 요소 */
#airplane { ... }
#paraglide-canopy { ... }

/* 하단 버튼 UI */
#ui { ... }
#stop-btn { ... }
#reset-btn { ... }
@media (max-width:600px) { ... }

/* 테마 라벨 */
#theme-label { ... }

/* 결과 패널 */
#result-panel { ... }
#result-panel.show { ... }
#result-label { ... }
#result-name { ... }
#result-sub { ... }
```

현재 라인 203~300 해당.

---

### `css/start-screen.css` (~55줄)

```css
/* 시작 오버레이 */
#start-screen { position:fixed; inset:0; z-index:9999; ... }
.menu-box { ... }
.menu-box h1 { ... }
.menu-btns button { ... }
#password-input { ... }
#password-submit { ... }
```

현재 라인 302~355 해당.

---

### `js/state.js` (~60줄)

모든 모듈이 공유하는 **단일 상태 객체** + **DOM 참조**.

```js
// ── 스테이지 크기 계산 ──
export function getStageDims(count) {
  if (count <= 20) return { w: 1000, h: 700 };
  if (count <= 30) return { w: 1200, h: 800 };
  return { w: 1600, h: 950 };
}

// ── 공유 상태 ──
export const state = {
  SW: 1000,
  SH: 700,
  GROUND_OFFSET: 70,

  names: [],
  cards: [],

  profX: 0,
  profDir: 1,
  profSpeed: 2.2,

  phase: 'entering',      // 'entering'|'ready'|'walking'|'stopping'|'jumping'|'done'
  currentTheme: 0,
  walkCount: 0,

  walkInterval: null,
  bubbleTimer: null,
  lateTimer: null,
};

// ── 기본 이름 목록 ──
export const DEFAULT_NAMES = [
  '김민수','이서연','박지호','최유진','정하늘',
  '강도윤','조수빈','윤태양','임서현','한지우',
  '오민재','신예은','문준혁','배소율','류하린'
];

// ── 대사 ──
export const WALK_LINES_EARLY = [
  '음... 누가 좋을까? 🤔', '어디 한번 볼까~',
  '오늘의 주인공은...', '두근두근 🥁',
  '다들 긴장되지? 😏', '자~ 집중!', '골라볼까~'
];
export const WALK_LINES_LATE = ['슬슬 정해야겠다!','이쯤에서!'];

// ── DOM 참조 (DOMContentLoaded 이후 초기화) ──
export const dom = {};

export function initDOM() {
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
```

**핵심 포인트**: 기존 전역 변수(`profX`, `phase`, `SW` 등)를 모두 `state` 객체로 통합. DOM 참조를 `dom` 객체로 통합. 모든 모듈이 `import { state, dom } from './state.js'`로 접근.

---

### `js/audio.js` (~165줄)

```js
import { state } from './state.js';

let AC;
let bgMusicNode, bgMusicGain, bgMusicActive = false;

export function resumeAC() { ... }
export function playTone(freq, type, dur, vol, delay) { ... }
export function startSteps() { ... }
export function stopSteps() { ... }
export function playEntrance() { ... }
export function playStop() { ... }
export function playJump() { ... }
export function playSuperman() { ... }
export function playCatch() { ... }
export function startBgMusic() { ... }
export function stopBgMusic() { ... }

// 내부 함수 (export 안 함)
function startBgMusicCity(masterGain) { ... }
function startBgMusicClassroom(masterGain) { ... }
```

현재 라인 413~577 그대로 이동. `AC`, `bgMusicNode` 등은 모듈 스코프 변수로 유지(외부 노출 불필요). `startBgMusic()`에서 `THEMES[state.currentTheme].musicKey`를 참조해야 하므로 themes를 dynamic import 또는 musicKey를 인자로 전달.

**의존**: `state` (currentTheme 읽기)

---

### `js/themes.js` (~250줄)

```js
import { state, dom } from './state.js';

// ── 구름 그리기 헬퍼 ──
export function cloudFn(ctx) { ... }

// ── 테마 배열 ──
export const THEMES = [
  // 0: 교실
  { name: '🏫 교실', musicKey: 'classroom', draw(ctx) { ... }, ... },

  // 1: 비행기
  { name: '✈️ 비행기', musicKey: 'city', entranceMode: 'airplane', draw(ctx) { ... }, ... },

  // 2: 해변
  { name: '🏖️ 해변', musicKey: 'city', draw(ctx) { ... }, ... },

  /* // 도심 낮 (비활성화)
  { name: '🌆 도심', ... },
  */
];

// ── 테마 적용 ──
export function applyTheme() {
  const th = THEMES[state.currentTheme];
  dom.bgCtx.clearRect(0, 0, state.SW, state.SH);
  th.draw(dom.bgCtx);

  // 복장 리셋
  dom.profTorso.style.backgroundImage = '';
  dom.profTorso.style.borderRadius = '8px 8px 4px 4px';
  document.querySelectorAll('.leg').forEach(l => { ... });

  if (th.prof.torsoStyle === 'hawaiian-shirt') {
    // 해변 복장
    ...
  } else {
    // 기본 복장
    ...
  }

  // 버튼/결과패널 색상
  dom.stopBtn.style.background = th.stopBtn.bg;
  ...
}
```

`THEMES` 배열 내 `draw()` 함수들이 `state.SW`, `state.SH`, `state.GROUND_OFFSET`, `cloudFn`을 참조 → 같은 모듈 내이므로 문제 없음.

**의존**: `state`, `dom`

---

### `js/cards.js` (~120줄)

```js
import { state, dom, getStageDims } from './state.js';
import { THEMES } from './themes.js';

// ── 스테이지 리사이즈 ──
export function resizeStage() { ... }

// ── 스테이지 피팅 (화면 맞춤) ──
export function fitStage() { ... }

// ── 카드 생성 ──
export function createCards() { ... }

// ── 카드 물리 이동 ──
export function moveCards() { ... }

// ── 카드 피킹 (가장 가까운 카드 선택) ──
export function pickCard() { ... }

// ── 카드 펄스 애니메이션 ──
export function pulseCard(card) { ... }

// ── 카드를 교수 위로 띄우기 ──
export function floatCardAboveProf(card, tx) { ... }

// ── 카드 속도 복원 ──
export function restoreCardSpeeds() { ... }
```

**의존**: `state` (cards, SW, SH, profX, phase), `dom` (scene), `THEMES` (card 스타일 읽기)

---

### `js/professor.js` (~280줄)

가장 큰 모듈. 교수 캐릭터의 모든 행동을 담당.

```js
import { state, dom, WALK_LINES_EARLY, WALK_LINES_LATE } from './state.js';
import { THEMES } from './themes.js';
import { playEntrance, playStop, playJump, playSuperman, playCatch,
         startSteps, stopSteps, startBgMusic, stopBgMusic } from './audio.js';
import { pickCard, pulseCard, floatCardAboveProf, restoreCardSpeeds } from './cards.js';
import { launchFireworks } from './fireworks.js';

// ── 교수 이동 ──
export function moveProf() { ... }

// ── 방향 설정 ──
export function setDir(d) { ... }

// ── 비주얼 업데이트 (방향에 따른 CSS 클래스) ──
export function updateProfVisual() { ... }

// ── 말풍선 ──
export function showBubble(text, dur) { ... }
export function hideBubble() { ... }
function pickWalkLine() { ... }
export function startWalkBubbles() { ... }

// ── 입장 애니메이션 ──
export function doEntrance() {
  const th = THEMES[state.currentTheme];
  if (th.entranceMode === 'airplane') {
    doAirplaneEntrance();
    return;
  }
  // 기존 좌우 입장 ...
}

function doAirplaneEntrance() { ... }

// ── 결과 표시 ──
export function showResult(card) { ... }

// ── 캐치 시퀀스 (슈퍼맨/잡기/점프) ──
export function doJumpAndCatch(card) { ... }
```

**의존**: `state`, `dom`, `THEMES`, `audio.*`, `cards.*`, `fireworks.launchFireworks`

---

### `js/fireworks.js` (~55줄)

```js
import { state, dom } from './state.js';

let fwActive = false;
let fwP = [];

export function launchFireworks() { ... }
function burst() { ... }
```

**의존**: `state` (SW, SH), `dom` (fwCtx, fwCanvas)

---

### `js/main.js` (~80줄)

앱의 진입점. 게임 루프 + 이벤트 바인딩 + 시작화면.

```js
import { state, dom, initDOM, DEFAULT_NAMES } from './state.js';
import { THEMES, applyTheme } from './themes.js';
import { resumeAC } from './audio.js';
import { createCards, moveCards } from './cards.js';
import { moveProf, doEntrance, doJumpAndCatch, showBubble, hideBubble,
         startWalkBubbles, showResult } from './professor.js';
import { pickCard } from './cards.js';

// ── 게임 루프 ──
function loop() {
  if (state.phase === 'walking') { moveCards(); moveProf(); }
  else if (['stopping','jumping','entering','ready'].includes(state.phase)) { moveCards(); }
  requestAnimationFrame(loop);
}

// ── 초기화 ──
document.addEventListener('DOMContentLoaded', () => {
  initDOM();

  // 시작 화면 이벤트
  document.getElementById('password-submit').addEventListener('click', () => { ... });
  document.getElementById('password-input').addEventListener('keypress', (e) => { ... });

  // 스톱 버튼
  dom.stopBtn.addEventListener('click', () => {
    if (state.phase === 'walking') {
      state.phase = 'stopping';
      const card = pickCard();
      if (!card) { state.phase = 'walking'; return; }
      doJumpAndCatch(card);
    }
  });

  // 리셋 버튼
  dom.resetBtn.addEventListener('click', () => { ... });

  // AudioContext resume
  dom.stage.addEventListener('click', resumeAC, { once: true });
});

// ── 게임 시작 ──
function startGame(classChar) {
  fetch(classChar + '.txt')
    .then(r => r.text())
    .then(text => {
      state.names = text.trim().split('\n').map(s => s.trim()).filter(Boolean);
      state.currentTheme = Math.floor(Math.random() * THEMES.length);
      createCards();
      applyTheme();
      loop();
      doEntrance();
    });
}
```

**의존**: 모든 모듈 import

---

## 모듈 의존 관계도

```
              state.js
            ↗   ↑   ↖
     audio.js  themes.js  fireworks.js
         ↑       ↑            ↑
         └── professor.js ────┘
              ↑       ↑
          cards.js    │
              ↑       │
              └── main.js
```

```
main.js → state, themes, audio, cards, professor
professor.js → state, themes, audio, cards, fireworks
cards.js → state, themes
themes.js → state
audio.js → state
fireworks.js → state
```

**순환 의존 없음** — 단방향 그래프.

---

## 마이그레이션 순서

코드 이동 시 기존 동작을 깨뜨리지 않기 위해, 아래 순서로 진행:

| 단계 | 작업 | 검증 기준 |
|------|------|----------|
| 1 | `css/` 폴더 생성, CSS를 5개 파일로 분리 | 브라우저에서 기존과 동일하게 렌더링 |
| 2 | `js/state.js` 생성 — 상수, 상태, DOM 참조 | import 가능 확인 |
| 3 | `js/audio.js` 생성 — 오디오 시스템 이동 | 효과음/BGM 정상 재생 |
| 4 | `js/fireworks.js` 생성 — 불꽃놀이 이동 | 불꽃놀이 정상 동작 |
| 5 | `js/themes.js` 생성 — THEMES + applyTheme 이동 | 테마 전환 정상 |
| 6 | `js/cards.js` 생성 — 카드 관련 함수 이동 | 카드 생성/물리/피킹 정상 |
| 7 | `js/professor.js` 생성 — 교수 관련 함수 이동 | 입장/캐치/말풍선 정상 |
| 8 | `js/main.js` 생성 — 루프, 이벤트, 초기화 이동 | 전체 게임 플로우 정상 |
| 9 | `index.html` 정리 — CSS link + script module만 남김 | 최종 통합 테스트 |

---

## 변경 전후 줄 수 비교

| 파일 | 줄 수 (예상) |
|------|-------------|
| `index.html` | ~80 |
| `css/base.css` | ~30 |
| `css/professor.css` | ~130 |
| `css/cards.css` | ~15 |
| `css/ui.css` | ~100 |
| `css/start-screen.css` | ~55 |
| `js/state.js` | ~60 |
| `js/audio.js` | ~165 |
| `js/themes.js` | ~250 |
| `js/cards.js` | ~120 |
| `js/professor.js` | ~280 |
| `js/fireworks.js` | ~55 |
| `js/main.js` | ~80 |
| **총계** | **~1,420** |

기존 1,499줄 → 13개 파일 총 ~1,420줄. 코드 양은 거의 동일하지만 **각 파일이 200줄 이내**로 관리 가능.

---

## 주의 사항

1. **`<script type="module">`**: ES 모듈은 `file://` 프로토콜에서 CORS 오류 발생 → 로컬 서버(`python -m http.server` 등) 필요. 현재 이미 서버에서 서빙 중이라면 문제 없음.
2. **Base64 이미지**: `prof-img`의 대용량 base64 문자열은 `index.html`에 그대로 유지 (별도 이미지 파일로 추출하면 더 깔끔하지만 현재 스코프 밖).
3. **전역 → 모듈 전환**: 기존 `var`/`let`/`const` 전역 변수가 모두 `state` 객체 속성으로 바뀜. 각 함수에서 `profX` → `state.profX` 식으로 수정 필요.
4. **타이머 정리**: `walkInterval`, `bubbleTimer`, `lateTimer`는 `state`에 저장 → 리셋 시 모듈 경계 넘어서 clear 가능.
5. **비활성화된 도심 테마**: 주석 처리된 채로 `themes.js`에 유지.
