# 심층 리서치: 테마 시스템 분석

## 1. 프로젝트 개요
- 단일 `index.html` 파일 (1241줄) — HTML/CSS/JS 올인원
- 대학 수업용 "답변자 랜덤 뽑기" 웹앱
- 비밀번호 → 반 선택 → 교수 캐릭터가 걸어다니며 학생 이름 카드를 잡는 애니메이션

## 2. 테마 시스템 구조

### 2.1 THEMES 배열 (line 577~656)
```js
const THEMES = [
  // 0: 도심 낮
  { name, musicKey, card, prof, stopBtn, result, modal, modalSave, draw(ctx) },
  // 1: 교실
  { name, musicKey, card, prof, stopBtn, result, modal, modalSave, draw(ctx) },
];
```

각 테마 객체의 프로퍼티:
| 프로퍼티 | 역할 | 예시 |
|---------|------|------|
| `name` | 테마 이름 (UI 표시용) | `'🌆 도심'` |
| `musicKey` | 배경음악 선택 키 | `'city'` \| `'classroom'` |
| `card` | 이름 카드 스타일 (bg, border, color, shadow) | CSS 문자열 |
| `prof` | 교수 캐릭터 색상 (torso, tie, leg, shoe) | 색상 코드 |
| `stopBtn` | 시작 버튼 스타일 (bg, shadow) | CSS gradient |
| `result` | 결과 패널 스타일 (bg, border, nameGrad, text) | CSS 문자열 |
| `modal` | 모달 배경색 | 색상 코드 |
| `modalSave` | 모달 저장 버튼 색상 | 색상 코드 |
| `draw(ctx)` | **캔버스 배경 그리기 함수** | Canvas 2D API 호출 |

### 2.2 테마 적용 함수 `applyTheme()` (line 685~701)
- `bgCtx.clearRect()` → `th.draw(bgCtx)` 로 배경 캔버스에 그림
- 교수 몸통/팔/다리/넥타이/신발 색상 적용
- 시작 버튼, 결과 패널 스타일 적용

### 2.3 테마 선택 방식
- 리셋 시 랜덤: `currentTheme = Math.floor(Math.random() * THEMES.length)` (line 1131)
- 게임 시작 시 랜덤: line 1230

## 3. 교수 캐릭터 시스템

### 3.1 DOM 구조 (HTML)
```
#professor
  #prof-body (.walk-right|.walk-left|.stopped|.reach-fwd|.superman-arm)
    #speech-bubble
    #prof-face > img (base64 인코딩된 실제 사진)
    #prof-torso (몸통, ::after로 넥타이)
      #prof-left-arm (왼팔, ::after로 ✊)
      #prof-right-arm (오른팔, ::after로 ✊)
    #prof-legs
      .leg.left (왼다리, ::after로 신발)
      .leg.right (오른다리, ::after로 신발)
```

### 3.2 교수 스타일링 시스템
- **몸통**: `#prof-torso` — 50×44px, `background` 색상은 테마에서 지정
- **넥타이**: `#prof-torso::after` — clip-path 삼각형, `--tie-color` CSS 변수
- **팔**: `#prof-left-arm`, `#prof-right-arm` — 13×34px, 배경색 = torso 색상
- **다리**: `.leg` — 13×28px, `--shoe-color` CSS 변수
- **신발**: `.leg::after` — 21×8px

→ **중요**: 현재 교수 복장 변경은 **색상만** 가능 (torso, tie, leg, shoe). 형태 변경은 CSS 수정 필요.

### 3.3 교수 복장 CSS (line 44~118)
```css
#prof-torso { width:50px; height:44px; border-radius:8px 8px 4px 4px; }
#prof-torso::after { /* 넥타이 — clip-path polygon */ }
#prof-left-arm, #prof-right-arm { width:13px; height:34px; }
.leg { width:13px; height:28px; }
.leg::after { /* 신발 — 21×8px */ }
```

### 3.4 입장 애니메이션 `doEntrance()` (line 837~876)
1. 화면 밖에서 시작 (left:-120px 또는 SW+20)
2. CSS transition으로 2.4초 동안 목표 위치로 이동
3. 완료 후 `phase='ready'`, 시작 버튼 활성화

### 3.5 잡기 모드 3가지 `doJumpAndCatch()` (line 923~1040)
| 모드 | 조건 | 동작 |
|------|------|------|
| `grab` | 거리 ≤ 120px | 팔 뻗고 천천히 걸어가서 잡기 |
| `jump` | 기본 | 점프해서 잡기 |
| `superman` | 20% 확률 (가장 먼 카드) | 날아가서 잡기 |

### 3.6 걷기 애니메이션 (CSS)
```css
.walk-right .leg.left  { animation:walkL 0.34s infinite alternate; }
.walk-right .leg.right { animation:walkR 0.34s infinite alternate; }
@keyframes walkL { from{rotate(-18deg)} to{rotate(18deg)} }
```

## 4. 배경 캔버스 시스템

### 4.1 스테이지 크기
- `SW`, `SH` — 학생 수에 따라 동적 (20명↓:1000×700, 30명↓:1200×800, 50명↓:1600×950)
- `GROUND_OFFSET = 70` — 바닥 영역 높이

### 4.2 배경 그리기 (draw 함수)
- 도심: 하늘 그라데이션 → 구름 → 태양 → 빌딩 (랜덤) → 도로 → 가로등
- 교실: 벽 → 칠판 → 창문 → 게시판 → 나무 바닥

### 4.3 `cloudFn(ctx)` 유틸리티 (line 570~576)
원형 4개를 합쳐 구름 형태를 그리는 공용 함수.

## 5. 배경음악 시스템 (line 461~530)

- `musicKey`에 따라 분기: `'city'` → 재즈풍, `'classroom'` → 피아노 멜로디
- `startBgMusic()` → `startBgMusicCity(gain)` 또는 `startBgMusicClassroom(gain)`
- 새 테마 추가 시 새 musicKey + 음악 함수 필요 (또는 기존 것 재사용 가능)

## 6. 핵심 발견 — 새 테마 추가 시 영향 범위

### 반드시 수정해야 할 것
1. **THEMES 배열**: 새 테마 객체 2개 추가 (도심은 주석 처리)
2. **draw() 함수**: 비행기 테마 배경, 해변 테마 배경 캔버스 그리기

### 비행기 테마에서 추가 필요한 것 (기존 시스템에 없는 것들)
1. **비행기 DOM 요소**: 화면 바깥에서 날아오는 비행기 (새 HTML 요소 또는 캔버스)
2. **패러글라이딩 입장 애니메이션**: 기존 `doEntrance()`는 좌/우 수평 입장만 지원 → 비행기에서 뛰어내리는 수직+수평 애니메이션 필요
3. **새 CSS 키프레임**: 패러글라이딩 하강 애니메이션
4. **테마별 입장 분기**: `doEntrance()` 내부에서 `THEMES[currentTheme]`에 따라 입장 방식 분기

### 해변 테마에서 추가 필요한 것
1. **교수 복장 변경**: 하와이안 셔츠 + 반바지
   - 방법 A: CSS만으로 (색상 + 패턴 background)
   - 방법 B: 추가 DOM 요소 (셔츠 무늬 오버레이)
   - **현실적 방법**: `prof` 객체에 추가 스타일 프로퍼티 + `applyTheme()`에서 적용
2. **배경 그리기**: 해변 (하늘, 바다, 모래, 야자수, 파도 등)

### 기존 시스템과의 호환성
- 걷기/잡기/슈퍼맨 로직은 테마와 독립적 → 그대로 사용 가능
- `applyTheme()`에 교수 복장 추가 스타일링 코드 필요 (해변용)
- 비행기 테마는 `doEntrance()`에 별도 분기 필수
