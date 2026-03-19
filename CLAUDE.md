# Pickup Student - 교수의 답변자 뽑기

교수님이 학생 이름 카드를 돌아다니며 잡아서 답변자를 뽑는 애니메이션 웹 앱.

## 기술 스택

- **순수 HTML/CSS/JS** (프레임워크, 번들러 없음)
- **Web Audio API** - 모든 효과음/배경음악을 코드로 생성 (외부 오디오 파일 없음)
- **Canvas API** - 배경 그래픽, 폭죽 효과
- **CSS Animations** - 교수 걷기, 점프, 슈퍼맨 비행 등

## 프로젝트 구조

```
pickup-student/
├── index.html              # HTML 구조 + 스크립트 로드 (73줄)
├── A.txt                   # A반 학생 이름 목록 (줄 단위)
├── B.txt                   # B반 학생 이름 목록 (줄 단위)
├── css/
│   └── styles.css          # 전체 CSS (310줄)
├── img/
│   └── prof-face.jpg       # 교수님 얼굴 이미지
└── js/                     # JavaScript 모듈 (전역 스코프 공유)
    ├── themes.js           # 상수 + 테마 정의
    ├── audio.js            # 오디오 시스템
    ├── stage.js            # 상태 관리 + 무대/카드 생성
    ├── movement.js         # 이동/물리 엔진
    ├── ui.js               # 말풍선 UI
    ├── fireworks.js        # 폭죽 효과
    ├── animation.js        # 입장/잡기 애니메이션
    └── main.js             # 게임 루프 + 이벤트 + 초기화
```

## 스크립트 로드 순서 (의존성)

```
themes.js → audio.js → stage.js → movement.js → ui.js → fireworks.js → animation.js → main.js
```

모든 JS 파일은 **전역 스코프**를 공유한다 (ES modules 미사용). 따라서 로드 순서가 중요하다.

## 파일별 상세 설명

### index.html
- HTML 뼈대만 포함 (CSS/JS는 외부 파일 참조)
- 주요 DOM 요소: `#stage` (게임 무대), `#professor` (교수 스프라이트), `#start-screen` (시작 메뉴)
- 비밀번호 입력 → 반 선택 → 게임 시작 흐름

### css/styles.css (310줄)
- **레이아웃**: `#stage` 800x600 고정 크기, JS로 동적 조정
- **교수 스프라이트**: `#prof-body`, `#prof-face`, `#prof-torso`, 팔/다리 각각 CSS로 구현
- **애니메이션 키프레임**:
  - `walkL`/`walkR` - 다리 걷기
  - `profJump` - 점프 (Y축 -130px)
  - `profFlyRight`/`profFlyLeft` - 슈퍼맨 비행
  - `cardFlyIn` - 카드 잡기 효과
  - `enterFromLeft`/`enterFromRight` - 입장
- **반응형**: `fitStage()`와 연동하여 모바일 스케일링

### js/themes.js (120줄)
상수 정의와 테마 시스템.

**전역 변수**:
- `SW`, `SH` - 무대 너비/높이 (학생 수에 따라 동적 변경)
- `GROUND_OFFSET` = 70px (바닥 높이)
- `DEFAULT_NAMES` - 기본 학생 이름 15명
- `WALK_LINES_EARLY` / `WALK_LINES_LATE` - 교수 대사

**함수**:
- `getStageDims(count)` - 학생 수 → 무대 크기 매핑 (20명: 1000x700, 30명: 1200x800, 50+: 1600x950)
- `cloudFn(ctx)` - 구름 그리기 팩토리 함수

**THEMES 배열** (현재 2개):
| 인덱스 | 이름 | musicKey | 특징 |
|--------|------|----------|------|
| 0 | 도심 | city | 하늘+빌딩+가로등, 재즈 BGM |
| 1 | 교실 | classroom | 칠판+창문+나무바닥, 피아노 BGM |

각 테마 객체 속성: `name`, `musicKey`, `card`(카드 스타일), `prof`(교수 색상), `stopBtn`, `result`, `modal`, `draw(ctx)`

### js/audio.js (158줄)
Web Audio API 기반 사운드 시스템. 외부 오디오 파일 없이 모든 소리를 코드로 생성.

**전역 변수**: `AC` (AudioContext), `bgMusicNode`, `bgMusicGain`, `bgMusicActive`, `stepInterval`, `stepPhase`

**효과음 함수**:
| 함수 | 용도 | 방식 |
|------|------|------|
| `playTone(freq,type,dur,vol,delay)` | 범용 톤 생성 | Oscillator+Gain |
| `startSteps()` / `stopSteps()` | 걷기 발소리 | 420ms 간격 메트로놈 |
| `playEntrance()` | 입장 팡파레 | 4음 삼각파 (도-미-솔-높은도) |
| `playStop()` | 멈춤 효과 | 톱니파 2음 |
| `playJump()` | 점프 | 주파수 스윕 300→800Hz |
| `playSuperman()` | 슈퍼맨 비행 | 노이즈 whoosh + 상승음 |
| `playCatch()` | 잡기 성공 | 5음 펜타토닉 상행 |

**BGM 함수**:
- `startBgMusicCity(gain)` - 재즈 스윙 화음 (4개 코드 순환)
- `startBgMusicClassroom(gain)` - 학교종 느낌 피아노 멜로디
- `startBgMusic()` / `stopBgMusic()` - 현재 테마에 맞는 BGM 제어

### js/stage.js (99줄)
무대 설정, 상태 변수, 카드 생성.

**전역 상태 변수**:
- `names` - 현재 학생 이름 배열
- `cards` - 카드 객체 배열 `{el, name, x, y, vx, vy, w, h, caught}`
- `profX`, `profDir`, `profSpeed` - 교수 위치/방향/속도
- `phase` - 게임 상태 (`entering` | `walking` | `stopping` | `jumping` | `done` | `ready`)
- `currentTheme` - 현재 테마 인덱스
- `walkCount`, `walkInterval`, `bubbleTimer`, `lateTimer` - 타이밍 제어

**DOM 참조**: `stage`, `prof`, `profBody`, `profTorso`, `profLA`, `profRA`, `bubble`, `stopBtn`, `resetBtn`, `scene`, `resultPanel`, `fwCanvas`, `fwCtx`, `bgCanvas`, `bgCtx`

**함수**:
- `applyTheme()` - 현재 테마를 모든 DOM 요소에 적용 (배경 그리기, 색상 설정)
- `resizeStage()` - 학생 수에 따라 무대/캔버스 크기 조정
- `fitStage()` - 브라우저 창 크기에 맞춰 스케일 조정 (모바일 대응)
- `createCards()` - 학생 이름으로 카드 DOM 생성, 랜덤 위치/속도 부여

### js/movement.js (74줄)
물리 엔진과 이동 로직.

**함수**:
- `moveCards()` - 매 프레임 카드 위치 업데이트
  - 카드간 충돌 감지 (소프트 물리, overlap × 0.05 힘)
  - 교수 접근 시 도망 (120px 내, 힘 0.25)
  - 벽/바닥 반사
- `moveProf()` - 교수 좌우 이동, 벽에서 방향 전환
- `setDir(d)` - 방향 설정 (1=오른쪽, -1=왼쪽)
- `updateProfVisual()` - 방향에 따라 스프라이트 뒤집기 (`scaleX`)

### js/ui.js (22줄)
말풍선과 대사 시스템.

**함수**:
- `showBubble(text, dur)` - 말풍선 표시 (dur>0이면 자동 숨김)
- `hideBubble()` - 말풍선 숨김
- `pickWalkLine()` - 걷기 중 랜덤 대사 선택 (walkCount≤3: EARLY, 이후: LATE)
- `startWalkBubbles()` - 7.2초 간격 대사 루프 시작, 10초 후 후반부 전환

### js/fireworks.js (29줄)
캔버스 기반 폭죽 파티클 시스템.

**전역 변수**: `fwP` (파티클 배열), `fwActive`

**함수**:
- `launchFireworks()` - 10회 burst를 175ms 간격으로 발사, 180프레임 동안 애니메이션
- `burst()` - 랜덤 위치에 42개 파티클 생성 (7가지 색상, 중력 vy+=0.1)

### js/animation.js (205줄)
입장, 카드 선택, 잡기 애니메이션. 가장 복잡한 모듈.

**상수**: `GRAB_DIST`=120, `JUMP_DIST`=260, `SUPER_DIST`=380

**함수**:
- `doEntrance()` - 랜덤 방향에서 교수 입장 (2.4초 CSS transition)
- `pickCard()` - 카드 선택 알고리즘
  - 교수 방향 기준 후보 필터링
  - 20% 확률 → 슈퍼맨 (가장 먼 카드)
  - ≤120px → grab (손 뻗기)
  - 그 외 → jump (점프)
- `doJumpAndCatch(card)` - 3가지 잡기 모드:
  - **grab**: 천천히 걸어가서 잡기 (35ms 스텝, easeInOut)
  - **jump**: 점프 후 잡기 (550ms 정점, 1250ms 착지)
  - **superman**: 0.9초 비행 후 잡기 (950ms 캐치, 1900ms 착지)
- `showResult(card)` - 결과 패널 표시 + 폭죽 + 성공음
- `pulseCard(card)` - 카드 강조 펄스 (scale 1→1.5→1.15)
- `floatCardAboveProf(card, tx)` - 카드를 교수 위로 이동
- `restoreCardSpeeds()` - 슬로우모션 해제

### js/main.js (112줄)
게임 루프, 이벤트 리스너, 초기화.

**함수**:
- `loop()` - requestAnimationFrame 메인 루프
  - walking: moveCards + moveProf
  - stopping/jumping/entering/ready: moveCards만
- `startGame(classChar)` - 게임 시작 (파일 로드 → 카드 생성 → 입장)

**이벤트**:
- `stopBtn` 클릭 → walking 시작, 10~17초 후 자동 멈춤 → pickCard → doJumpAndCatch
- `resetBtn` 클릭 → 상태 초기화, 테마 랜덤 변경, 재입장
- `password-submit` → 비밀번호 `0821` 검증
- `password-input` Enter키 → submit 트리거

## 게임 흐름 (phase 상태)

```
[시작화면] → 비밀번호 입력 → 반 선택
    ↓
entering → ready → walking → stopping → jumping → done
    ↑                                                |
    └──────────── resetBtn 클릭 ─────────────────────┘
```

1. **entering**: 교수 입장 애니메이션 (2.4초)
2. **ready**: "시작" 버튼 활성화, 대기
3. **walking**: 교수 걸어다님, BGM 재생, 카드 도망, 10~17초
4. **stopping**: 멈춤, "어디보자..." 표시
5. **jumping**: 카드 선택 후 잡기 애니메이션
6. **done**: 결과 표시, 폭죽, "다시" 버튼

## 새 테마 추가 방법

`js/themes.js`의 `THEMES` 배열에 객체 추가:
```js
{
  name: '이름',
  musicKey: 'city' | 'classroom',  // BGM 종류
  card: { bg, border, color, shadow },
  prof: { torso, tie, leg, shoe },
  stopBtn: { bg, shadow },
  result: { bg, border, nameGrad, text },
  modal: { bg }, modalSave: '색상',
  draw(ctx) { /* Canvas로 배경 그리기 */ }
}
```

## 새 반 추가 방법

1. 루트에 `C.txt` 파일 생성 (학생 이름 줄 단위)
2. `index.html`의 `.menu-btns`에 버튼 추가: `<button onclick="startGame('C')">C반</button>`

## 개발 시 주의사항

- JS 파일 간 전역 변수 공유 → 변수명 충돌 주의
- 스크립트 로드 순서 변경 시 의존성 확인 필수
- Canvas 배경은 `resizeStage()` 호출 시 context가 재생성됨
- 모바일 대응: `fitStage()`가 window resize 이벤트에 바인딩됨
- 비밀번호: `0821` (js/main.js에 하드코딩)
