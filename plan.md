# 구현 계획: 비행기 테마 + 해변 테마 추가

## 개요
- 기존 도심 테마(THEMES[0])를 **주석 처리**하여 비활성화
- 새 테마 2개 추가: **✈️ 비행기** (특수 입장), **🏖️ 해변** (일반 입장 + 복장 변경)
- 기존 교실 테마는 유지
- 최종 THEMES 배열: `[교실, 비행기, 해변]` (인덱스 0, 1, 2)

---

## 작업 1: CSS 추가 — 비행기 요소 + 패러글라이딩 애니메이션

**위치**: `index.html` line 201 (`#professor.entering-right` 규칙 바로 뒤)

아래 CSS를 `/* ── UI ── */` 주석(line 203) **바로 위**에 삽입:

```css
/* ── 비행기 테마 ── */
#airplane {
  position:absolute;
  font-size:60px;
  z-index:4;
  display:none;
  filter:drop-shadow(0 4px 12px rgba(0,0,0,0.4));
  transform:scaleX(-1);  /* 비행기를 왼쪽 방향으로 뒤집기 */
}

/* 패러글라이딩 캐노피 (교수 머리 위) */
#paraglide-canopy {
  position:absolute;
  bottom:calc(100% + 5px);
  left:50%; transform:translateX(-50%);
  width:80px; height:35px;
  background:radial-gradient(ellipse at center, #ff6b6b 0%, #ee5a24 50%, #c44569 100%);
  border-radius:50% 50% 10% 10%;
  opacity:0;
  transition:opacity 0.3s;
  z-index:6;
  pointer-events:none;
}
#paraglide-canopy.visible { opacity:1; }
/* 캐노피 → 교수 연결 줄 */
#paraglide-canopy::before {
  content:'';
  position:absolute;
  bottom:-12px; left:20%;
  width:1px; height:14px;
  background:rgba(0,0,0,0.5);
}
#paraglide-canopy::after {
  content:'';
  position:absolute;
  bottom:-12px; right:20%;
  width:1px; height:14px;
  background:rgba(0,0,0,0.5);
}
```

### 정확한 삽입 위치 (before/after 맵핑)

**현재 코드 (line 200~203)**:
```
#professor.entering-left  { animation:enterFromLeft  2.2s ... }
#professor.entering-right { animation:enterFromRight 2.2s ... }

/* ── UI ── */
```

**변경 후**:
```
#professor.entering-left  { animation:enterFromLeft  2.2s ... }
#professor.entering-right { animation:enterFromRight 2.2s ... }

/* ── 비행기 테마 ── */
#airplane { ... }
#paraglide-canopy { ... }
...

/* ── UI ── */
```

---

## 작업 2: HTML 추가 — 비행기 + 캐노피 DOM 요소

### 2-1. 비행기 요소

**위치**: `index.html` line 327, `<div id="scene"></div>` 바로 뒤

**현재 코드 (line 325~328)**:
```html
  <canvas id="fireworks" width="800" height="600"></canvas>
  <div id="scene"></div>

  <div id="professor">
```

**변경 후**:
```html
  <canvas id="fireworks" width="800" height="600"></canvas>
  <div id="scene"></div>
  <div id="airplane">✈️</div>

  <div id="professor">
```

### 2-2. 패러글라이딩 캐노피 요소

**위치**: `index.html` line 329, `<div id="speech-bubble"></div>` 바로 뒤, `#prof-body` 내부

**현재 코드 (line 328~330)**:
```html
    <div id="prof-body" class="walk-right">
      <div id="speech-bubble"></div>
      <div id="prof-face">
```

**변경 후**:
```html
    <div id="prof-body" class="walk-right">
      <div id="speech-bubble"></div>
      <div id="paraglide-canopy"></div>
      <div id="prof-face">
```

---

## 작업 3: THEMES 배열 수정 — 도심 비활성화 + 새 테마 2개 추가

**위치**: `index.html` line 577~656 (THEMES 배열 전체)

### 3-1. 도심 테마 주석 처리

**현재 코드 (line 577~629)**:
```js
const THEMES=[
  // 0: 도심 낮
  {name:'🌆 도심',
   musicKey:'city',
   ...
  },
  // 1: 교실
  {name:'🏫 교실',
```

**변경 후**:
```js
const THEMES=[
  /* // 0: 도심 낮 (비활성화)
  {name:'🌆 도심',
   musicKey:'city',
   card:{bg:'rgba(20,35,60,0.92)',border:'2px solid rgba(120,180,255,0.75)',color:'#deeeff',shadow:'0 3px 16px rgba(0,0,50,0.45)'},
   prof:{torso:'#2c3a5a',tie:'#e74c3c',leg:'#1e2840',shoe:'#111'},
   stopBtn:{bg:'linear-gradient(135deg,#e74c3c,#a02010)',shadow:'0 5px 18px rgba(200,50,30,0.55)'},
   result:{bg:'rgba(8,16,40,0.95)',border:'2px solid rgba(120,180,255,0.6)',nameGrad:'linear-gradient(135deg,#74b9ff,#a29bfe)',text:'#deeeff'},
   modal:{bg:'#0a1428'},modalSave:'#2563eb',
   draw(ctx){
    ... (기존 코드 전체 주석 안에 유지)
   }
  },
  */
  // 0: 교실
  {name:'🏫 교실',
```

### 3-2. 비행기 테마 추가

교실 테마 닫는 `},` (line 656, `];` 바로 위) 뒤에 추가:

```js
  // 1: 비행기
  {name:'✈️ 비행기',
   musicKey:'city',
   entranceMode:'airplane',
   card:{bg:'rgba(10,20,50,0.90)',border:'2px solid rgba(100,200,255,0.7)',color:'#e0f0ff',shadow:'0 3px 16px rgba(0,30,80,0.5)'},
   prof:{torso:'#1a3a5c',tie:'#e74c3c',leg:'#0f2840',shoe:'#0a0a0a'},
   stopBtn:{bg:'linear-gradient(135deg,#2980b9,#1a5276)',shadow:'0 5px 18px rgba(40,120,180,0.55)'},
   result:{bg:'rgba(5,15,40,0.96)',border:'2px solid rgba(100,200,255,0.6)',nameGrad:'linear-gradient(135deg,#74b9ff,#0984e3)',text:'#e0f0ff'},
   modal:{bg:'#051028'},modalSave:'#2980b9',
   draw(ctx){
    const W=SW,H=SH,G=GROUND_OFFSET;
    // 하늘 (높은 고도 느낌 — 진한 파랑 → 연한 파랑)
    const sky=ctx.createLinearGradient(0,0,0,H-G);
    sky.addColorStop(0,'#1a3a6c'); sky.addColorStop(0.4,'#4a8abf'); sky.addColorStop(1,'#87ceeb');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    // 구름 (많이, 3줄 배치)
    const cloud=cloudFn(ctx);
    cloud(W*0.08,80,28); cloud(W*0.22,45,35); cloud(W*0.4,65,40);
    cloud(W*0.58,35,30); cloud(W*0.75,55,45); cloud(W*0.92,70,25);
    cloud(W*0.15,140,22); cloud(W*0.5,160,28); cloud(W*0.82,130,32);
    // 바닥 — 활주로 (어두운 회색)
    ctx.fillStyle='#555'; ctx.fillRect(0,H-G,W,G);
    ctx.fillStyle='#777'; ctx.fillRect(0,H-G,W,5);
    // 활주로 중앙 점선
    ctx.setLineDash([50,30]); ctx.strokeStyle='#fff'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(0,H-G/2); ctx.lineTo(W,H-G/2); ctx.stroke(); ctx.setLineDash([]);
    // 활주로 노란 가장자리선
    ctx.strokeStyle='rgba(255,255,100,0.6)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(0,H-G+8); ctx.lineTo(W,H-G+8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,H-4); ctx.lineTo(W,H-4); ctx.stroke();
    // 활주로 바닥 조명 (양쪽 줄)
    for(let lx=30; lx<W; lx+=80){
      ctx.fillStyle='rgba(100,200,255,0.7)';
      ctx.beginPath(); ctx.arc(lx,H-G+4,3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(lx,H-6,3,0,Math.PI*2); ctx.fill();
    }
   }
  },
```

### 3-3. 해변 테마 추가

비행기 테마 닫는 `},` 바로 뒤에 추가:

```js
  // 2: 해변
  {name:'🏖️ 해변',
   musicKey:'city',
   card:{bg:'rgba(255,240,200,0.92)',border:'2px solid rgba(255,160,60,0.7)',color:'#3a2a10',shadow:'0 3px 16px rgba(120,80,20,0.4)'},
   prof:{torso:'hawaiian',tie:'none',leg:'#c8a870',shoe:'#d4a050',
         torsoStyle:'hawaiian-shirt', shortsColor:'#f0d090'},
   stopBtn:{bg:'linear-gradient(135deg,#f39c12,#e67e22)',shadow:'0 5px 18px rgba(240,160,30,0.55)'},
   result:{bg:'rgba(40,25,5,0.95)',border:'2px solid rgba(255,200,100,0.65)',nameGrad:'linear-gradient(135deg,#fdcb6e,#e17055)',text:'#fff8e0'},
   modal:{bg:'#1a1000'},modalSave:'#f39c12',
   draw(ctx){
    const W=SW,H=SH,G=GROUND_OFFSET;
    // 하늘
    const sky=ctx.createLinearGradient(0,0,0,H*0.45);
    sky.addColorStop(0,'#87ceeb'); sky.addColorStop(1,'#b8e6ff');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    // 태양 (글로우 포함)
    ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.arc(W*0.82,60,35,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,215,0,0.2)'; ctx.beginPath(); ctx.arc(W*0.82,60,55,0,Math.PI*2); ctx.fill();
    // 구름
    const cloud=cloudFn(ctx);
    cloud(W*0.15,50,30); cloud(W*0.45,40,36); cloud(W*0.7,55,28);
    // 바다 (그라데이션)
    const sea=ctx.createLinearGradient(0,H*0.4,0,H-G);
    sea.addColorStop(0,'#1e90ff'); sea.addColorStop(0.5,'#4db8ff'); sea.addColorStop(1,'#87ceeb');
    ctx.fillStyle=sea; ctx.fillRect(0,H*0.4,W,H-G-H*0.4);
    // 파도 (사인파 물결선)
    ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=2;
    for(let wy=H*0.45; wy<H-G; wy+=30){
      ctx.beginPath();
      for(let wx=0; wx<W; wx+=5){
        ctx.lineTo(wx, wy + Math.sin(wx*0.03 + wy*0.1)*6);
      }
      ctx.stroke();
    }
    // 모래사장 (바닥)
    const sand=ctx.createLinearGradient(0,H-G-15,0,H);
    sand.addColorStop(0,'#f4d68c'); sand.addColorStop(1,'#e8c06a');
    ctx.fillStyle=sand; ctx.fillRect(0,H-G,W,G);
    // 모래 질감 (랜덤 점)
    ctx.fillStyle='rgba(200,160,80,0.3)';
    for(let i=0;i<60;i++){
      ctx.beginPath();
      ctx.arc(Math.random()*W, H-G+Math.random()*G, Math.random()*2+0.5, 0, Math.PI*2);
      ctx.fill();
    }
    // 야자수 (왼쪽) — 곡선 줄기 + 타원 잎 5장
    const px=W*0.08, py=H-G;
    ctx.strokeStyle='#8B6914'; ctx.lineWidth=8;
    ctx.beginPath(); ctx.moveTo(px,py); ctx.quadraticCurveTo(px+15,py-80,px+5,py-140); ctx.stroke();
    ctx.fillStyle='#228B22';
    for(let a=-0.8;a<=0.8;a+=0.4){
      ctx.save(); ctx.translate(px+5,py-140); ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(0,-15,8,40,0,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    // 야자수 (오른쪽)
    const px2=W*0.92, py2=H-G;
    ctx.strokeStyle='#8B6914'; ctx.lineWidth=8;
    ctx.beginPath(); ctx.moveTo(px2,py2); ctx.quadraticCurveTo(px2-15,py2-80,px2-5,py2-140); ctx.stroke();
    ctx.fillStyle='#228B22';
    for(let a=-0.8;a<=0.8;a+=0.4){
      ctx.save(); ctx.translate(px2-5,py2-140); ctx.rotate(a);
      ctx.beginPath(); ctx.ellipse(0,-15,8,40,0,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    // 비치 파라솔 — 막대 + 빨간/흰 줄무늬 반원
    const ux=W*0.65, uy=H-G;
    ctx.strokeStyle='#999'; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(ux,uy); ctx.lineTo(ux,uy-80); ctx.stroke();
    ctx.fillStyle='#e74c3c';
    ctx.beginPath(); ctx.arc(ux,uy-80,40,Math.PI,0); ctx.fill();
    ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.moveTo(ux-40,uy-80); ctx.arc(ux,uy-80,40,Math.PI,Math.PI+Math.PI/4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(ux-40+53,uy-80); ctx.arc(ux,uy-80,40,Math.PI+Math.PI/2,Math.PI+Math.PI*3/4); ctx.closePath(); ctx.fill();
   }
  },
```

---

## 작업 4: `applyTheme()` 함수 수정 — 해변 복장 분기

**위치**: `index.html` line 685~701

### 현재 코드 (전체):
```js
function applyTheme(){
  const th=THEMES[currentTheme];
  bgCtx.clearRect(0,0,SW,SH); th.draw(bgCtx);
  profTorso.style.background=th.prof.torso;
  profTorso.style.setProperty('--tie-color',th.prof.tie);
  profLA.style.background=th.prof.torso;
  profRA.style.background=th.prof.torso;
  document.querySelectorAll('.leg').forEach(l=>{ l.style.background=th.prof.leg; l.style.setProperty('--shoe-color',th.prof.shoe); });
  stopBtn.style.background=th.stopBtn.bg; stopBtn.style.boxShadow=th.stopBtn.shadow;
  resultPanel.style.background=th.result.bg; resultPanel.style.border=th.result.border;
  document.getElementById('result-name').style.background=th.result.nameGrad;
  document.getElementById('result-name').style.webkitBackgroundClip='text';
  document.getElementById('result-name').style.webkitTextFillColor='transparent';
  document.getElementById('result-sub').style.color=th.result.text;
  document.getElementById('result-label').style.color=th.result.text;
}
```

### 변경 후 코드 (전체 교체):
```js
function applyTheme(){
  const th=THEMES[currentTheme];
  bgCtx.clearRect(0,0,SW,SH); th.draw(bgCtx);

  // ── 교수 복장 리셋 (테마 전환 시 이전 스타일 잔존 방지) ──
  profTorso.style.backgroundImage='';
  profTorso.style.borderRadius='8px 8px 4px 4px';
  document.querySelectorAll('.leg').forEach(l=>{
    l.style.height='28px';
    l.style.borderRadius='5px';
  });

  if(th.prof.torsoStyle==='hawaiian-shirt'){
    // ── 해변 복장: 하와이안 셔츠 + 반바지 ──
    profTorso.style.background='#2196F3';
    profTorso.style.backgroundImage=
      'radial-gradient(circle 4px at 30% 30%, #ff6b6b 2px, transparent 3px),'+
      'radial-gradient(circle 4px at 70% 60%, #ffd32a 2px, transparent 3px),'+
      'radial-gradient(circle 4px at 50% 85%, #ff6b6b 2px, transparent 3px),'+
      'radial-gradient(circle 3px at 15% 70%, #fff 1.5px, transparent 2px),'+
      'radial-gradient(circle 3px at 85% 25%, #ffd32a 1.5px, transparent 2px)';
    profTorso.style.borderRadius='6px 6px 2px 2px';
    profTorso.style.setProperty('--tie-color','transparent');
    profLA.style.background='#2196F3';
    profRA.style.background='#2196F3';
    document.querySelectorAll('.leg').forEach(l=>{
      l.style.background=th.prof.shortsColor||'#f0d090';
      l.style.height='20px';
      l.style.setProperty('--shoe-color',th.prof.shoe);
    });
  } else {
    // ── 기본 복장 (교실, 비행기 등) ──
    profTorso.style.background=th.prof.torso;
    profTorso.style.setProperty('--tie-color',th.prof.tie);
    profLA.style.background=th.prof.torso;
    profRA.style.background=th.prof.torso;
    document.querySelectorAll('.leg').forEach(l=>{
      l.style.background=th.prof.leg;
      l.style.setProperty('--shoe-color',th.prof.shoe);
    });
  }

  stopBtn.style.background=th.stopBtn.bg; stopBtn.style.boxShadow=th.stopBtn.shadow;
  resultPanel.style.background=th.result.bg; resultPanel.style.border=th.result.border;
  document.getElementById('result-name').style.background=th.result.nameGrad;
  document.getElementById('result-name').style.webkitBackgroundClip='text';
  document.getElementById('result-name').style.webkitTextFillColor='transparent';
  document.getElementById('result-sub').style.color=th.result.text;
  document.getElementById('result-label').style.color=th.result.text;
}
```

### 변경 상세 (diff 수준):
- `bgCtx.clearRect` 뒤에 **리셋 블록** 4줄 삽입
- 기존 `profTorso.style.background=th.prof.torso;` ~ `forEach` 까지 4줄을 **if/else 블록**으로 교체
- 하위 (`stopBtn` 이후) 코드는 동일

---

## 작업 5: `doEntrance()` 함수 수정 — 비행기 입장 분기

**위치**: `index.html` line 837

### 현재 코드 (첫 3줄):
```js
function doEntrance(){
  phase='entering';
  stopBtn.disabled=true;
```

### 변경 후 (첫 부분에 분기 추가):
```js
function doEntrance(){
  const th=THEMES[currentTheme];
  if(th.entranceMode==='airplane'){
    doAirplaneEntrance();
    return;
  }

  phase='entering';
  stopBtn.disabled=true;
```

---

## 작업 6: `doAirplaneEntrance()` 새 함수 추가

**위치**: `doEntrance()` 함수 바로 위 (line 837 직전)에 삽입

```js
// ════════════════════════════════════
//  비행기 테마 전용 입장
// ════════════════════════════════════
function doAirplaneEntrance(){
  phase='entering';
  stopBtn.disabled=true;

  const airplane=document.getElementById('airplane');
  const canopy=document.getElementById('paraglide-canopy');

  // ── 1단계: 비행기가 오른쪽 바깥에서 날아와 오른쪽 상단에 멈춤 ──
  airplane.style.display='block';
  airplane.style.transition='none';
  airplane.style.left=(SW+80)+'px';
  airplane.style.top='40px';

  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    airplane.style.transition='left 2s cubic-bezier(0.25,0.46,0.45,0.94)';
    airplane.style.left=(SW-160)+'px';
  }));

  playEntrance();

  // 교수를 일단 화면 밖에 숨김
  prof.style.left='-200px';
  prof.classList.add('stopped');
  profBody.classList.remove('walk-right','walk-left');

  // ── 2단계 (2.2초 후): 교수가 비행기 위치에서 패러글라이딩 시작 ──
  setTimeout(()=>{
    const dropStartX=SW-180;
    const dropStartY=60;

    // 교수를 비행기 위치에 배치 (top 기준)
    profX=dropStartX;
    prof.style.left=profX+'px';
    prof.style.bottom='auto';
    prof.style.top=dropStartY+'px';
    profDir=-1;
    updateProfVisual();

    // 캐노피 표시
    canopy.classList.add('visible');

    // ── 3단계: 대각선 하강 (왼쪽 아래로) ──
    const targetX=SW*0.3;
    const targetTop=SH-GROUND_OFFSET-140;

    prof.style.transition='left 2.8s cubic-bezier(0.3,0,0.2,1), top 2.8s cubic-bezier(0.4,0,0.6,1)';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      prof.style.left=targetX+'px';
      prof.style.top=targetTop+'px';
    }));

    // 비행기는 0.8초 뒤 왼쪽으로 퇴장
    setTimeout(()=>{
      airplane.style.transition='left 3s linear';
      airplane.style.left='-150px';
    },800);

    // ── 4단계 (3초 후): 착지 완료 ──
    setTimeout(()=>{
      prof.style.transition='';
      prof.style.top='';
      prof.style.bottom=(GROUND_OFFSET-2)+'px';
      profX=targetX;
      prof.style.left=profX+'px';

      canopy.classList.remove('visible');
      airplane.style.display='none';
      prof.classList.remove('stopped');

      profDir=1;
      updateProfVisual();

      phase='ready';
      stopBtn.disabled=false;
      stopBtn.style.display='block';
      resetBtn.style.display='none';
    },3000);
  },2200);
}
```

### 타이밍 상세:
| 시점 | 동작 |
|------|------|
| 0ms | 비행기 화면 밖(SW+80)에서 출발, transition 시작 |
| 0~2000ms | 비행기가 오른쪽 상단(SW-160, 40)으로 이동 |
| 2200ms | 교수가 비행기 위치(SW-180, 60)에 나타남 + 캐노피 표시 |
| 2200~5000ms | 교수 대각선 하강 (left:SW*0.3, top:바닥) |
| 3000ms | 비행기 왼쪽(-150)으로 퇴장 시작 |
| 5200ms | 착지 완료 → `phase='ready'`, 버튼 활성화 |

---

## 작업 7: 리셋 핸들러에 비행기/캐노피 정리 코드 추가

**위치**: `index.html` line 1145~1147 (resetBtn 핸들러 내부, `prof.classList.remove(...)` 뒤)

### 현재 코드 (line 1143~1148):
```js
  prof.classList.remove('stopped','jumping','superman-right','superman-left');
  profBody.classList.remove('reach-fwd','superman-arm','walk-right','walk-left');

  hideBubble();
```

### 변경 후:
```js
  prof.classList.remove('stopped','jumping','superman-right','superman-left');
  profBody.classList.remove('reach-fwd','superman-arm','walk-right','walk-left');

  // 비행기 테마 정리
  document.getElementById('airplane').style.display='none';
  document.getElementById('paraglide-canopy').classList.remove('visible');
  // top 포지셔닝 리셋 (비행기 테마에서 top을 사용하므로)
  prof.style.top='';
  prof.style.bottom=(GROUND_OFFSET-2)+'px';

  hideBubble();
```

---

## 수정 파일 요약 (총 7개 작업, 모두 index.html)

| 작업 | 위치 (라인) | 변경 종류 | 설명 |
|------|------------|----------|------|
| 1 | ~line 202 (CSS) | 삽입 | `#airplane`, `#paraglide-canopy` 스타일 |
| 2-1 | line 327 (HTML) | 삽입 | `<div id="airplane">✈️</div>` |
| 2-2 | line 329 (HTML) | 삽입 | `<div id="paraglide-canopy"></div>` |
| 3-1 | line 577~629 (JS) | 주석 처리 | 도심 테마 전체를 `/* ... */`로 감쌈 |
| 3-2 | line 656 뒤 (JS) | 삽입 | 비행기 테마 객체 |
| 3-3 | 비행기 뒤 (JS) | 삽입 | 해변 테마 객체 |
| 4 | line 685~701 (JS) | 전체 교체 | `applyTheme()` — 해변 복장 분기 추가 |
| 5 | line 837 (JS) | 삽입 | `doEntrance()` 상단에 비행기 분기 3줄 |
| 6 | line 837 앞 (JS) | 삽입 | `doAirplaneEntrance()` 새 함수 (약 60줄) |
| 7 | line 1145 (JS) | 삽입 | 리셋 시 비행기/캐노피 정리 4줄 |

---

## 고려 사항 & 트레이드오프

1. **비행기 표현**: 이모지(✈️) + `scaleX(-1)` 반전 → 왼쪽을 향해 날아오는 모습. 캔버스 드로잉보다 간결하고 기존 코드 스타일(이모지 ✊ 사용)과 일관됨.
2. **패러글라이딩**: CSS transition(left + top 동시)으로 대각선 하강 구현. `@keyframes` 대신 JS setTimeout 체인으로 단계별 제어 — 기존 코드의 `doJumpAndCatch()`와 동일한 패턴.
3. **하와이안 셔츠**: CSS `radial-gradient` 5겹으로 꽃무늬 표현. 몸통이 50×44px로 작으므로 큰 점 5개면 충분한 시각적 차별화.
4. **반바지**: `.leg` 높이를 28px → 20px로 줄여 표현. 신발(`::after`)은 유지.
5. **넥타이 숨김**: `--tie-color: transparent` → `::after`의 clip-path는 유지되지만 투명하여 안 보임.
6. **배경음악**: 둘 다 `musicKey:'city'` 사용. 추후 `'beach'`, `'airplane'` 키 추가 가능하지만 현재 스코프 밖.
7. **비행기 입장 총 시간 ~5.2초**: 기존 입장(2.5초)보다 길지만, 비행기 등장 → 패러글라이딩 → 착지의 3단계 연출에 필요한 최소 시간.
8. **스타일 리셋**: `applyTheme()`에 리셋 블록 추가 → 해변→교실 등 테마 전환 시 하와이안 셔츠 스타일이 잔존하지 않도록 보장.
