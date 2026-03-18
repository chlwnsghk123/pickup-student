// ════════════════════════════════════
//  오디오 시스템 (Web Audio API)
// ════════════════════════════════════
import { state } from './state.js';
import { THEMES } from './themes.js';

let AC;
let bgMusicNode=null, bgMusicGain=null, bgMusicActive=false;
let stepInterval=null, stepPhase=0;

export function resumeAC(){
  if(!AC) AC=new(window.AudioContext||window.webkitAudioContext)();
  if(AC.state==='suspended') AC.resume();
}

export function playTone(freq, type='sine', dur=0.3, vol=0.18, delay=0){
  const o=AC.createOscillator(), g=AC.createGain();
  o.connect(g); g.connect(AC.destination);
  o.type=type; o.frequency.value=freq;
  const t=AC.currentTime+delay;
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(vol,t+0.02);
  g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.start(t); o.stop(t+dur+0.05);
}

export function startSteps(){
  stopSteps();
  stepInterval=setInterval(()=>{
    stepPhase=(stepPhase+1)%2;
    const freq=stepPhase===0?220:200;
    playTone(freq,'sine',0.12,0.06);
  },420);
}
export function stopSteps(){ clearInterval(stepInterval); stepInterval=null; }

export function playEntrance(){
  const notes=[523,659,784,1047];
  notes.forEach((f,i)=>playTone(f,'triangle',0.25,0.18,i*0.18));
}

export function playStop(){
  playTone(440,'sawtooth',0.15,0.12);
  playTone(330,'sawtooth',0.1,0.12,0.12);
}

export function playJump(){
  const o=AC.createOscillator(), g=AC.createGain();
  o.connect(g); g.connect(AC.destination);
  o.type='sine';
  o.frequency.setValueAtTime(300,AC.currentTime);
  o.frequency.exponentialRampToValueAtTime(800,AC.currentTime+0.3);
  g.gain.setValueAtTime(0.15,AC.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+0.35);
  o.start(AC.currentTime); o.stop(AC.currentTime+0.4);
}

export function playSuperman(){
  // whoosh
  const buf=AC.createBuffer(1,AC.sampleRate*0.5,AC.sampleRate);
  const data=buf.getChannelData(0);
  for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,1.5);
  const src=AC.createBufferSource(), g=AC.createGain();
  const filt=AC.createBiquadFilter(); filt.type='bandpass'; filt.frequency.value=800;
  src.buffer=buf; src.connect(filt); filt.connect(g); g.connect(AC.destination);
  g.gain.setValueAtTime(0.3,AC.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+0.5);
  src.start(); src.stop(AC.currentTime+0.55);
  // 상승 음
  const o=AC.createOscillator(), g2=AC.createGain();
  o.connect(g2); g2.connect(AC.destination);
  o.type='sawtooth';
  o.frequency.setValueAtTime(200,AC.currentTime);
  o.frequency.exponentialRampToValueAtTime(1200,AC.currentTime+0.6);
  g2.gain.setValueAtTime(0.1,AC.currentTime);
  g2.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+0.6);
  o.start(AC.currentTime); o.stop(AC.currentTime+0.65);
}

export function playCatch(){
  [523,659,784,1047,1319].forEach((f,i)=>playTone(f,'triangle',0.22,0.2,i*0.08));
}

// 도심: 재즈 느낌 스윙 화음
function startBgMusicCity(masterGain){
  const chords=[[196,247,294,370],[220,277,330,415],[175,220,261,329],[196,247,294,370]];
  let ci=0;
  function playBar(){
    if(!bgMusicActive) return;
    const chord=chords[ci%chords.length]; ci++;
    chord.forEach((f,i)=>{
      const o=AC.createOscillator(), g=AC.createGain();
      o.connect(g); g.connect(masterGain);
      o.type='triangle'; o.frequency.value=f;
      const t=AC.currentTime+i*0.04;
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(0.35,t+0.06);
      g.gain.exponentialRampToValueAtTime(0.001,t+1.6);
      o.start(t); o.stop(t+1.7);
    });
    // 베이스
    const ob=AC.createOscillator(), gb=AC.createGain();
    ob.connect(gb); gb.connect(masterGain);
    ob.type='sine'; ob.frequency.value=chord[0]/2;
    gb.gain.setValueAtTime(0.5,AC.currentTime); gb.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+1.9);
    ob.start(AC.currentTime); ob.stop(AC.currentTime+2.0);
    setTimeout(playBar,1900);
  }
  playBar();
}

// 교실: 조용한 피아노 멜로디
function startBgMusicClassroom(masterGain){
  const melody=[392,330,440,392, 349,294,392,349, 392,440,523,494, 440,392,330,294];
  let mi=0;
  function playNote(){
    if(!bgMusicActive) return;
    const f=melody[mi%melody.length]; mi++;
    const o=AC.createOscillator(), g=AC.createGain();
    o.connect(g); g.connect(masterGain);
    o.type='sine';
    o.frequency.setValueAtTime(f,AC.currentTime);
    g.gain.setValueAtTime(0,AC.currentTime);
    g.gain.linearRampToValueAtTime(0.8,AC.currentTime+0.04);
    g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+0.55);
    o.start(AC.currentTime); o.stop(AC.currentTime+0.6);
    // 화음
    const o2=AC.createOscillator(), g2=AC.createGain();
    o2.connect(g2); g2.connect(masterGain);
    o2.type='triangle'; o2.frequency.value=f*1.5;
    g2.gain.setValueAtTime(0,AC.currentTime); g2.gain.linearRampToValueAtTime(0.15,AC.currentTime+0.04);
    g2.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+0.4);
    o2.start(AC.currentTime); o2.stop(AC.currentTime+0.45);
    setTimeout(playNote, mi%4===0?700:360);
  }
  playNote();
}

export function startBgMusic(){
  resumeAC();
  stopBgMusic();
  bgMusicActive=true;
  bgMusicGain=AC.createGain(); bgMusicGain.gain.value=0.07;
  bgMusicGain.connect(AC.destination);
  const key=THEMES[state.currentTheme].musicKey||'city';
  if(key==='classroom') startBgMusicClassroom(bgMusicGain);
  else startBgMusicCity(bgMusicGain);
}

export function stopBgMusic(){
  bgMusicActive=false;
  if(bgMusicGain){
    try{ bgMusicGain.gain.setValueAtTime(bgMusicGain.gain.value,AC.currentTime); bgMusicGain.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+0.3); }catch(e){}
    bgMusicGain=null;
  }
}
