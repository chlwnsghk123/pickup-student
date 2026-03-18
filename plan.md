# 구현 계획: 비행기 테마 + 해변 테마 추가

## 개요
- 기존 도심 테마(인덱스 0)를 **주석 처리**하여 비활성화
- 새 테마 2개 추가: **✈️ 비행기** (특수 입장), **🏖️ 해변** (일반 입장 + 복장 변경)
- 기존 교실 테마는 유지

---

## 변경 1: 비행기 테마 — 배경 그리기

**파일**: `index.html` (THEMES 배열 내)

하늘 + 구름 + 활주로 바닥의 배경. 오른쪽 상단에 작은 비행기가 멈춰있는 모습은 **별도의 DOM 요소**로 처리 (draw에서는 배경만).

```js
// 2: 비행기
{name:'✈️ 비행기',
 musicKey:'city',  // 도심 음악 재사용
 entranceMode:'airplane', // 커스텀 입장 플래그
 card:{bg:'rgba(10,20,50,0.90)',border:'2px solid rgba(100,200,255,0.7)',color:'#e0f0ff',shadow:'0 3px 16px rgba(0,30,80,0.5)'},
 prof:{torso:'#1a3a5c',tie:'#e74c3c',leg:'#0f2840',shoe:'#0a0a0a'},
 stopBtn:{bg:'linear-gradient(135deg,#2980b9,#1a5276)',shadow:'0 5px 18px rgba(40,120,180,0.55)'},
 result:{bg:'rgba(5,15,40,0.96)',border:'2px solid rgba(100,200,255,0.6)',nameGrad:'linear-gradient(135deg,#74b9ff,#0984e3)',text:'#e0f0ff'},
 modal:{bg:'#051028'},modalSave:'#2980b9',
 draw(ctx){
   const W=SW,H=SH,G=GROUND_OFFSET;
   // 하늘 (높은 고도 느낌)
   const sky=ctx.createLinearGradient(0,0,0,H-G);
   sky.addColorStop(0,'#1a3a6c'); sky.addColorStop(0.4,'#4a8abf'); sky.addColorStop(1,'#87ceeb');
   ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
   // 구름 (많이)
   const cloud=cloudFn(ctx);
   cloud(W*0.08,80,28); cloud(W*0.22,45,35); cloud(W*0.4,65,40);
   cloud(W*0.58,35,30); cloud(W*0.75,55,45); cloud(W*0.92,70,25);
   cloud(W*0.15,140,22); cloud(W*0.5,160,28); cloud(W*0.82,130,32);
   // 바닥 — 활주로
   ctx.fillStyle='#555'; ctx.fillRect(0,H-G,W,G);
   ctx.fillStyle='#777'; ctx.fillRect(0,H-G,W,5);
   // 활주로 중앙선
   ctx.setLineDash([50,30]); ctx.strokeStyle='#fff'; ctx.lineWidth=3;
   ctx.beginPath(); ctx.moveTo(0,H-G/2); ctx.lineTo(W,H-G/2); ctx.stroke(); ctx.setLineDash([]);
   // 활주로 가장자리선
   ctx.strokeStyle='rgba(255,255,100,0.6)'; ctx.lineWidth=2;
   ctx.beginPath(); ctx.moveTo(0,H-G+8); ctx.lineTo(W,H-G+8); ctx.stroke();
   ctx.beginPath(); ctx.moveTo(0,H-4); ctx.lineTo(W,H-4); ctx.stroke();
   // 활주로 조명 (양쪽)
   for(let lx=30; lx<W; lx+=80){
     ctx.fillStyle='rgba(100,200,255,0.7)';
     ctx.beginPath(); ctx.arc(lx,H-G+4,3,0,Math.PI*2); ctx.fill();
     ctx.beginPath(); ctx.arc(lx,H-6,3,0,Math.PI*2); ctx.fill();
   }
 }
},
```

---

## 변경 2: 비행기 테마 — 비행기 DOM 요소 + 패러글라이딩 입장

### 2-1. HTML 추가 (stage 내부)
```html
<div id="airplane" style="display:none;">✈️</div>
```

### 2-2. CSS 추가
```css
#airplane {
  position:absolute;
  font-size:60px;
  z-index:4;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
  transition: left 2s cubic-bezier(0.25,0.46,0.45,0.94), top 1.5s ease-out;
}

/* 패러글라이딩 낙하 */
@keyframes paraglide {
  0%   { transform:translateY(0) rotate(0deg); opacity:1; }
  15%  { transform:translateY(20px) rotate(5deg); }
  50%  { transform:translateY(var(--drop-height)) rotate(-3deg); }
  85%  { transform:translateY(var(--drop-height)) rotate(2deg); }
  100% { transform:translateY(var(--drop-height)) rotate(0deg); opacity:1; }
}
#professor.paragliding {
  animation: paraglide 2.5s cubic-bezier(0.4,0,0.2,1) forwards;
}

/* 패러글라이딩 캐노피 (교수 위에 표시) */
#paraglide-canopy {
  position:absolute;
  bottom:calc(100% + 5px);
  left:50%; transform:translateX(-50%);
  width:80px; height:35px;
  background: radial-gradient(ellipse at center, #ff6b6b 0%, #ee5a24 50%, #c44569 100%);
  border-radius:50% 50% 10% 10%;
  opacity:0;
  transition:opacity 0.3s;
  z-index:6;
}
#paraglide-canopy.visible { opacity:1; }
/* 줄 (canopy → 교수 연결선 느낌) */
#paraglide-canopy::before {
  content:'';
  position:absolute;
  bottom:-10px; left:20%;
  width:1px; height:12px;
  background:rgba(0,0,0,0.4);
}
#paraglide-canopy::after {
  content:'';
  position:absolute;
  bottom:-10px; right:20%;
  width:1px; height:12px;
  background:rgba(0,0,0,0.4);
}
```

### 2-3. `doEntrance()` 수정 — 테마별 분기
```js
function doEntrance(){
  const th = THEMES[currentTheme];

  if(th.entranceMode === 'airplane'){
    doAirplaneEntrance();
    return;
  }

  // ... 기존 좌우 입장 코드 그대로 ...
}
```

### 2-4. 새 함수 `doAirplaneEntrance()`
```js
function doAirplaneEntrance(){
  phase='entering';
  stopBtn.disabled=true;

  const airplane = document.getElementById('airplane');
  const canopy = document.getElementById('paraglide-canopy');
  airplane.style.display='block';

  // 1단계: 비행기가 화면 바깥 오른쪽에서 등장 → 오른쪽 상단에 멈춤
  airplane.style.transition='none';
  airplane.style.left=(SW+80)+'px';
  airplane.style.top='40px';

  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    airplane.style.transition='left 2s cubic-bezier(0.25,0.46,0.45,0.94)';
    airplane.style.left=(SW-160)+'px'; // 오른쪽 상단에 멈춤
  }));

  playEntrance();

  // 2단계 (2.2초 후): 교수가 비행기 위치에서 패러글라이딩 시작
  setTimeout(()=>{
    const dropStartX = SW - 180;
    const dropStartY = 60;
    const groundY = SH - GROUND_OFFSET - 140; // 교수 발 위치

    profX = dropStartX;
    prof.style.left = profX + 'px';
    prof.style.bottom = 'auto';
    prof.style.top = dropStartY + 'px';
    profDir = -1; // 왼쪽을 보며 내려옴
    updateProfVisual();
    prof.classList.add('stopped');

    // 캐노피 표시
    canopy.classList.add('visible');

    // 3단계: 패러글라이딩으로 대각선 하강
    const targetX = SW * 0.3; // 왼쪽 중간쯤 착지
    const targetBottom = GROUND_OFFSET - 2;

    prof.style.transition = 'left 2.8s cubic-bezier(0.3,0,0.2,1), top 2.8s cubic-bezier(0.4,0,0.6,1)';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      prof.style.left = targetX + 'px';
      prof.style.top = (SH - GROUND_OFFSET - 140) + 'px';
    }));

    // 비행기는 계속 지나감 (왼쪽으로 퇴장)
    setTimeout(()=>{
      airplane.style.transition='left 3s linear';
      airplane.style.left='-150px';
    }, 800);

    // 4단계 (3초 후): 착지 완료
    setTimeout(()=>{
      prof.style.transition='';
      prof.style.top='';
      prof.style.bottom = targetBottom + 'px';
      profX = targetX;
      prof.style.left = profX + 'px';

      canopy.classList.remove('visible');
      airplane.style.display='none';
      prof.classList.remove('stopped');

      profDir = 1;
      updateProfVisual();

      phase='ready';
      stopBtn.disabled=false;
      stopBtn.style.display='block';
      resetBtn.style.display='none';
    }, 3000);
  }, 2200);
}
```

---

## 변경 3: 해변 테마 — 배경 그리기

```js
// 3: 해변
{name:'🏖️ 해변',
 musicKey:'city',  // 재즈 음악 재사용 (서핑 느낌)
 card:{bg:'rgba(255,240,200,0.92)',border:'2px solid rgba(255,160,60,0.7)',color:'#3a2a10',shadow:'0 3px 16px rgba(120,80,20,0.4)'},
 prof:{torso:'hawaiian',tie:'none',leg:'#c8a870',shoe:'#d4a050',
       // 해변 전용 추가 프로퍼티
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
   // 태양
   ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.arc(W*0.82,60,35,0,Math.PI*2); ctx.fill();
   ctx.fillStyle='rgba(255,215,0,0.2)'; ctx.beginPath(); ctx.arc(W*0.82,60,55,0,Math.PI*2); ctx.fill();
   // 구름
   const cloud=cloudFn(ctx);
   cloud(W*0.15,50,30); cloud(W*0.45,40,36); cloud(W*0.7,55,28);
   // 바다
   const sea=ctx.createLinearGradient(0,H*0.4,0,H-G);
   sea.addColorStop(0,'#1e90ff'); sea.addColorStop(0.5,'#4db8ff'); sea.addColorStop(1,'#87ceeb');
   ctx.fillStyle=sea; ctx.fillRect(0,H*0.4,W,H-G-H*0.4);
   // 파도 (물결)
   ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=2;
   for(let wy=H*0.45; wy<H-G; wy+=30){
     ctx.beginPath();
     for(let wx=0; wx<W; wx+=5){
       ctx.lineTo(wx, wy + Math.sin(wx*0.03 + wy*0.1)*6);
     }
     ctx.stroke();
   }
   // 모래사장
   const sand=ctx.createLinearGradient(0,H-G-15,0,H);
   sand.addColorStop(0,'#f4d68c'); sand.addColorStop(1,'#e8c06a');
   ctx.fillStyle=sand; ctx.fillRect(0,H-G,W,G);
   // 모래 질감
   ctx.fillStyle='rgba(200,160,80,0.3)';
   for(let i=0;i<60;i++){
     ctx.beginPath();
     ctx.arc(Math.random()*W, H-G+Math.random()*G, Math.random()*2+0.5, 0, Math.PI*2);
     ctx.fill();
   }
   // 야자수 (왼쪽)
   const px=W*0.08, py=H-G;
   // 줄기
   ctx.strokeStyle='#8B6914'; ctx.lineWidth=8;
   ctx.beginPath(); ctx.moveTo(px,py); ctx.quadraticCurveTo(px+15,py-80,px+5,py-140); ctx.stroke();
   // 잎
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
   // 비치 파라솔
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

## 변경 4: 해변 테마 — 교수 복장 (하와이안 셔츠 + 반바지)

### 4-1. `applyTheme()` 수정

기존 `applyTheme()`에 해변 전용 복장 로직 추가:

```js
function applyTheme(){
  const th=THEMES[currentTheme];
  bgCtx.clearRect(0,0,SW,SH); th.draw(bgCtx);

  // 기본 스타일 리셋
  profTorso.style.borderRadius = '8px 8px 4px 4px';
  profTorso.style.backgroundImage = '';
  profTorso.className = '';  // 추가 클래스 제거
  document.querySelectorAll('.leg').forEach(l=>{
    l.style.height = '28px';
    l.style.borderRadius = '5px';
  });

  if(th.prof.torsoStyle === 'hawaiian-shirt'){
    // 하와이안 셔츠: 밝은 꽃무늬 배경
    profTorso.style.background = '#2196F3'; // 밝은 파란색 베이스
    profTorso.style.backgroundImage =
      'radial-gradient(circle 4px at 30% 30%, #ff6b6b 2px, transparent 3px),' +
      'radial-gradient(circle 4px at 70% 60%, #ffd32a 2px, transparent 3px),' +
      'radial-gradient(circle 4px at 50% 85%, #ff6b6b 2px, transparent 3px),' +
      'radial-gradient(circle 3px at 15% 70%, #fff 1.5px, transparent 2px),' +
      'radial-gradient(circle 3px at 85% 25%, #ffd32a 1.5px, transparent 2px)';
    profTorso.style.borderRadius = '6px 6px 2px 2px';
    profTorso.style.setProperty('--tie-color', 'transparent'); // 넥타이 숨김
    profLA.style.background = '#2196F3';
    profRA.style.background = '#2196F3';
    // 반바지 (다리를 짧고 밝게)
    document.querySelectorAll('.leg').forEach(l=>{
      l.style.background = th.prof.shortsColor || '#f0d090';
      l.style.height = '20px'; // 반바지이므로 짧게
      l.style.setProperty('--shoe-color', th.prof.shoe);
    });
  } else {
    // 기본 복장
    profTorso.style.background = th.prof.torso;
    profTorso.style.setProperty('--tie-color', th.prof.tie);
    profLA.style.background = th.prof.torso;
    profRA.style.background = th.prof.torso;
    document.querySelectorAll('.leg').forEach(l=>{
      l.style.background = th.prof.leg;
      l.style.setProperty('--shoe-color', th.prof.shoe);
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

---

## 변경 5: 도심 테마 비활성화

THEMES 배열에서 도심 테마 객체를 주석 처리:
```js
const THEMES=[
  // // 0: 도심 낮 (비활성화)
  // {name:'🌆 도심', ... },

  // 0: 교실
  {name:'🏫 교실', ...},
  // 1: 비행기
  {name:'✈️ 비행기', ...},
  // 2: 해변
  {name:'🏖️ 해변', ...},
];
```

---

## 변경 6: HTML 추가 요소

`#professor` 내부에 패러글라이딩 캐노피 추가, `#stage` 내부에 비행기 요소 추가:

```html
<!-- #prof-body 안, #speech-bubble 바로 뒤 -->
<div id="paraglide-canopy"></div>

<!-- #stage 안, #scene 뒤 -->
<div id="airplane">✈️</div>
```

---

## 변경 7: 리셋 시 비행기/캐노피 정리

`resetBtn` 이벤트 핸들러에 추가:
```js
// 비행기 테마 정리
document.getElementById('airplane').style.display='none';
document.getElementById('paraglide-canopy').classList.remove('visible');
```

---

## 수정 파일 요약

| 파일 | 변경 내용 |
|------|----------|
| `index.html` (CSS) | `#airplane`, `#paraglide-canopy`, `@keyframes paraglide` 스타일 추가 |
| `index.html` (HTML) | `#airplane`, `#paraglide-canopy` 요소 추가 |
| `index.html` (JS-THEMES) | 도심 주석 처리, 비행기/해변 테마 객체 추가 |
| `index.html` (JS-applyTheme) | 해변 복장 분기 로직 추가 |
| `index.html` (JS-doEntrance) | 비행기 테마 분기 + `doAirplaneEntrance()` 함수 추가 |
| `index.html` (JS-reset) | 비행기/캐노피 정리 코드 추가 |

---

## 고려 사항 & 트레이드오프

1. **비행기 표현**: 이모지(✈️) vs 캔버스 드로잉 → **이모지 채택** (간결하고 재미있음, 기존 코드 스타일과 일관)
2. **패러글라이딩 캐노피**: CSS만으로 반원 형태 표현 → `radial-gradient` + `border-radius`로 충분
3. **하와이안 셔츠**: CSS `radial-gradient` 다중 배경으로 꽃무늬 패턴 표현 → 실제 이미지 없이도 시각적 차별화 가능
4. **배경음악**: 새 테마 전용 음악을 만들지 않고 기존 `city` 음악 재사용 → 구현 범위 최소화. 추후 원하면 `beach` 등 새 음악 키 추가 가능
5. **비행기 입장 타이밍**: 비행기 등장(2초) → 교수 점프(0.2초 대기) → 패러글라이딩 하강(2.8초) → 착지 정리(0.2초) = **총 약 5.2초** (기존 입장 2.5초보다 길지만 연출 상 적절)
6. **도심 테마 비활성화**: 완전 삭제가 아닌 주석 처리 → 나중에 다시 활성화 가능
