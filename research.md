# 심층 리서치: 프로젝트 아키텍처 분석

## 1. 프로젝트 개요
- **모듈화된 ES Module 구조** — HTML, CSS(5파일), JS(7파일)로 분리
- 대학 수업용 "답변자 랜덤 뽑기" 웹앱
- 비밀번호 → 반 선택 → 교수 캐릭터가 걸어다니며 학생 이름 카드를 잡는 애니메이션

### 1.1 파일 구조
```
pickup-student/
├── index.html              ← HTML 골격 (~70줄)
├── A.txt / B.txt           ← 학생 이름 목록
├── css/
│   ├── base.css            ← 글로벌 리셋, #stage, canvas
│   ├── professor.css       ← 교수 캐릭터, 걷기/점프/비행 애니메이션
│   ├── cards.css           ← .name-card 스타일, 카드 등장 애니메이션
│   ├── ui.css              ← 버튼, 결과패널, 비행기/캐노피, 테마라벨
│   └── start-screen.css    ← 시작화면 오버레이, 비밀번호 입력
└── js/
    ├── state.js            ← 공유 상태(state), DOM 참조(dom), 상수
    ├── audio.js            ← Web Audio API (효과음 + BGM)
    ├── themes.js           ← THEMES 배열 + applyTheme()
    ├── cards.js            ← 카드 생성, 물리 이동, 피킹, 애니메이션
    ├── professor.js        ← 교수 이동, 비주얼, 입장, 캐치 시퀀스
    ├── fireworks.js        ← 불꽃놀이 파티클 시스템
    └── main.js             ← 게임 루프, 이벤트 바인딩, 시작화면
```

### 1.2 모듈 의존 관계
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

## 2. 테마 시스템 구조

### 2.1 THEMES 배열 (`js/themes.js`)
```js
const THEMES = [
  // 0: 교실   (musicKey: 'classroom')
  // 1: 비행기 (musicKey: 'city', entranceMode: 'airplane')
  // 2: 해변   (musicKey: 'city', prof.torsoStyle: 'hawaiian-shirt')
  // (도심 낮 — 주석 처리로 비활성화)
];
```

각 테마 객체의 프로퍼티:
| 프로퍼티 | 역할 | 예시 |
|---------|------|------|
| `name` | 테마 이름 (UI 표시용) | `'🏫 교실'` |
| `musicKey` | 배경음악 선택 키 | `'city'` \| `'classroom'` |
| `entranceMode` | 커스텀 입장 방식 | `'airplane'` (비행기만) |
| `card` | 이름 카드 스타일 (bg, border, color, shadow) | CSS 문자열 |
| `prof` | 교수 캐릭터 색상 (torso, tie, leg, shoe) | 색상 코드 |
| `prof.torsoStyle` | 특수 복장 플래그 | `'hawaiian-shirt'` (해변만) |
| `prof.shortsColor` | 반바지 색상 | `'#f0d090'` (해변만) |
| `stopBtn` | 시작 버튼 스타일 (bg, shadow) | CSS gradient |
| `result` | 결과 패널 스타일 (bg, border, nameGrad, text) | CSS 문자열 |
| `draw(ctx)` | **캔버스 배경 그리기 함수** | Canvas 2D API 호출 |

### 2.2 테마 적용 함수 `applyTheme()` (`js/themes.js`)
- `dom.bgCtx.clearRect()` → `th.draw(dom.bgCtx)` 로 배경 캔버스에 그림
- 교수 복장 리셋 후 분기:
  - `hawaiian-shirt` → 꽃무늬 gradient + 반바지 (height: 20px)
  - 기본 → torso/tie/leg/shoe 색상 적용
- 시작 버튼, 결과 패널 스타일 적용

### 2.3 테마 선택 방식
- 리셋 시 랜덤: `state.currentTheme = Math.floor(Math.random() * THEMES.length)`
- 게임 시작 시 랜덤 (동일)

## 3. 교수 캐릭터 시스템

### 3.1 DOM 구조 (`index.html`)
```
#professor
  #prof-body (.walk-right|.walk-left|.stopped|.reach-fwd|.superman-arm)
    #speech-bubble
    #paraglide-canopy (비행기 테마용)
    #prof-face > img (base64 인코딩된 실제 사진)
    #prof-torso (몸통, ::after로 넥타이)
      #prof-left-arm (왼팔, ::after로 ✊)
      #prof-right-arm (오른팔, ::after로 ✊)
    #prof-legs
      .leg.left (왼다리, ::after로 신발)
      .leg.right (오른다리, ::after로 신발)
```

### 3.2 교수 스타일링 시스템 (`css/professor.css`)
- **몸통**: `#prof-torso` — 50×44px, `background` 색상은 테마에서 지정
- **넥타이**: `#prof-torso::after` — clip-path 삼각형, `--tie-color` CSS 변수
- **팔**: `#prof-left-arm`, `#prof-right-arm` — 13×34px, 배경색 = torso 색상
- **다리**: `.leg` — 13×28px, `--shoe-color` CSS 변수
- **신발**: `.leg::after` — 21×8px

→ 복장 변경은 **색상 + radial-gradient 패턴**으로 구현 (해변 하와이안 셔츠)

### 3.3 입장 애니메이션 (`js/professor.js`)

| 모드 | 조건 | 동작 |
|------|------|------|
| 일반 입장 | 기본 | 좌/우에서 2.4초 CSS transition 이동 |
| 비행기 입장 | `entranceMode === 'airplane'` | 비행기 등장 → 교수 패러글라이딩 하강 (약 5.2초) |

### 3.4 잡기 모드 3가지 (`js/professor.js` — `doJumpAndCatch()`)
| 모드 | 조건 | 동작 |
|------|------|------|
| `grab` | 거리 ≤ 120px | 팔 뻗고 천천히 걸어가서 잡기 |
| `jump` | 기본 | 점프해서 잡기 |
| `superman` | 20% 확률 (가장 먼 카드) | 날아가서 잡기 |

### 3.5 걷기 애니메이션 (`css/professor.css`)
```css
.walk-right .leg.left  { animation:walkL 0.34s infinite alternate; }
.walk-right .leg.right { animation:walkR 0.34s infinite alternate; }
@keyframes walkL { from{rotate(-18deg)} to{rotate(18deg)} }
```

## 4. 공유 상태 시스템

### 4.1 `state` 객체 (`js/state.js`)
```js
state = {
  SW, SH,                // 스테이지 크기 (학생 수에 따라 동적)
  names, cards,           // 학생 데이터
  profX, profDir, profSpeed,  // 교수 위치/방향
  phase,                  // 게임 상태머신
  currentTheme, walkCount,    // 테마/걷기 카운트
  walkInterval, bubbleTimer, lateTimer  // 타이머 ID
}
```

### 4.2 `dom` 객체 (`js/state.js`)
모든 DOM 참조를 `initDOM()`에서 한 번만 쿼리하여 보관.

### 4.3 게임 상태 머신 (phase)
```
entering → ready → walking → stopping → jumping → done
                      ↑                              │
                      └── (reset) ───────────────────┘
```

## 5. 배경 캔버스 시스템

### 5.1 스테이지 크기
- 학생 수에 따라 동적 (`getStageDims()` in `js/state.js`)
  - 20명↓: 1000×700
  - 30명↓: 1200×800
  - 50명↓: 1600×950
- `GROUND_OFFSET = 70` — 바닥 영역 높이

### 5.2 배경 그리기 (각 테마 `draw()` 함수)
- **교실**: 벽 → 칠판 → 창문 → 게시판 → 나무 바닥
- **비행기**: 하늘 그라데이션 → 구름(3줄) → 활주로 → 점선 → 조명
- **해변**: 하늘 → 태양 → 바다(파도) → 모래사장 → 야자수 2개 → 비치파라솔
- (도심 — 비활성화): 하늘 → 구름 → 태양 → 빌딩(랜덤) → 도로 → 가로등

### 5.3 `cloudFn(ctx)` 유틸리티 (`js/themes.js`)
원형 4개를 합쳐 구름 형태를 그리는 공용 함수.

## 6. 배경음악 시스템 (`js/audio.js`)
- `musicKey`에 따라 분기: `'city'` → 재즈풍, `'classroom'` → 피아노 멜로디
- `startBgMusic()` → `startBgMusicCity(gain)` 또는 `startBgMusicClassroom(gain)`
- 새 테마 추가 시 새 musicKey + 음악 함수 필요 (또는 기존 것 재사용 가능)

## 7. 비행기 테마 전용 요소

### DOM 요소
- `#airplane` (`css/ui.css`): 60px ✈️ 이모지, `scaleX(-1)` 반전, `display:none`
- `#paraglide-canopy` (`css/ui.css`): 반원형 gradient 캐노피 + 연결줄(::before/::after)

### 입장 시퀀스 (`js/professor.js` — `doAirplaneEntrance()`)
| 시점 | 동작 |
|------|------|
| 0ms | 비행기 화면 밖(SW+80)에서 출발 |
| 0~2000ms | 비행기가 오른쪽 상단(SW-160, 40)으로 이동 |
| 2200ms | 교수가 비행기 위치에 나타남 + 캐노피 표시 |
| 2200~5000ms | 교수 대각선 하강 (패러글라이딩) |
| 3000ms | 비행기 왼쪽(-150)으로 퇴장 |
| 5200ms | 착지 완료 → 게임 준비 |

## 8. 새 테마 추가 가이드

### 필수 작업
1. `js/themes.js`의 THEMES 배열에 새 테마 객체 추가
2. `draw(ctx)` 함수로 배경 그리기 구현

### 선택적 작업 (특수 기능이 필요한 경우)
- 커스텀 입장: `entranceMode` 프로퍼티 + `js/professor.js`에 입장 함수 추가
- 특수 복장: `prof.torsoStyle` 프로퍼티 + `applyTheme()`에 분기 추가
- 새 배경음악: `js/audio.js`에 `startBgMusic[Name]()` 함수 추가

### 기존 시스템과의 호환성
- 걷기/잡기/슈퍼맨 로직은 테마와 독립적 → 그대로 사용 가능
- 카드 물리/충돌/도망 시스템도 테마 무관
