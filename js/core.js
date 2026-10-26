'use strict';
/* ===== Abyss Bistro: costanti, utilità, salvataggio, audio ===== */
const W=360,H=560,TAU=Math.PI*2,INK='#170e12';
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
/* rnd: casuale di gioco. Nelle sfide a codice diventa un generatore con seme, così tutti ricevono lo stesso menu */
let rnd=Math.random;
const pick=a=>a[Math.floor(rnd()*a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const cpick=a=>a[Math.floor(Math.random()*a.length)];
const fmt=x=>Math.round(x*10)/10;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash2(x,y){let h=(Math.floor(x)*374761393+Math.floor(y)*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296}
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const a=hash2(xi,yi),b=hash2(xi+1,yi),c=hash2(xi,yi+1),d=hash2(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,y,o){let s=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){s+=a*vnoise(x*f,y*f);n+=a;f*=2.03;a*=.5}return s/n}

/* vista: il mondo 360x560 centrato nello schermo intero */
let VW=360,VH=640,SC=1,OX=0,OY=0,DPR=1,V={x0:0,y0:0,x1:W,y1:H,w:W,h:H},T=0;

/* ===== salvataggio ===== */
const KEY='abyssBistro.save.v2'+((location.search.match(/[?&]slot=(\w+)/)||[])[1]||'');
const DEF_SAVE=()=>({v:2,perle:0,stars:0,runs:0,wins:0,
  best:{short:0,long:0,inf:0,monster:0},vol:{music:60,sfx:80},
  emp:{granchio:1,squalo:1,rana:1,sardine:1,polipetto:1},
  mgr:{polpo:1},mon:{ghiozzo:1,aringa:1,lumaca:1},bossBeat:{},
  resto:{hp:0,cash:0,cards:0,deco:0},deco:0,deck:null,monDeck:null,mgrSel:'polpo',maxFloor:0,seen:{},dailyDone:0,asked:0,tutDone:0,novice:0,intro:{}});
let save=DEF_SAVE();
function mergeSave(o){const d=DEF_SAVE();const s=Object.assign(d,o||{});
  for(const k of['best','vol','resto'])s[k]=Object.assign(DEF_SAVE()[k],(o||{})[k]||{});
  for(const k of['emp','mgr','mon'])s[k]=Object.assign(DEF_SAVE()[k],(o||{})[k]||{});
  s.bossBeat=Object.assign({},(o||{}).bossBeat||{});s.seen=Object.assign({},(o||{}).seen||{});s.intro=Object.assign({},(o||{}).intro||{});return s}
function loadSave(){
  try{const raw=localStorage.getItem(KEY);if(raw){save=mergeSave(JSON.parse(raw));return}}catch(e){}
  try{const old=localStorage.getItem('abyssBistro.save.v1');if(old){const o=JSON.parse(old);save=DEF_SAVE();save.perle=o.perle||0;save.runs=o.runs||0;save.wins=o.wins||0;if(o.vol)save.vol=Object.assign(save.vol,o.vol);writeSave()}}catch(e){}}
function writeSave(){try{localStorage.setItem(KEY,JSON.stringify(save))}catch(e){}}
loadSave();

/* ===== audio sintetizzato ===== */
let AC=null,musicG,sfxG,noiseBuf,nextT=0,step=0,musicMode=0;
const SP=60/108/4;
const ROOTS=[0,0,-4,-2],BASS=[0,null,0,12,null,0,3,null,0,null,7,null,5,6,null,3],ARP=[12,15,19,15,22,19,15,24,12,15,19,15,13,19,15,24];
function initAudio(){
  if(AC){if(AC.state==='suspended')AC.resume();return}
  try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null;return}
  musicG=AC.createGain();sfxG=AC.createGain();musicG.connect(AC.destination);sfxG.connect(AC.destination);applyVol();
  noiseBuf=AC.createBuffer(1,AC.sampleRate*.6,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  nextT=AC.currentTime+.1;setInterval(sched,50)}
let pausedAudio=false;
function applyVol(){if(!AC)return;const p=pausedAudio?.35:1;musicG.gain.setTargetAtTime(save.vol.music/100*.28*p,AC.currentTime,.05);sfxG.gain.setTargetAtTime(save.vol.sfx/100*.55,AC.currentTime,.05)}
function tone(t,f,type,dur,vol,dest,o={}){const os=AC.createOscillator(),g=AC.createGain();os.type=type;os.frequency.setValueAtTime(f,t);if(o.f2)os.frequency.exponentialRampToValueAtTime(o.f2,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+(o.a||.005));g.gain.exponentialRampToValueAtTime(.0001,t+dur);let n=os;
  if(o.lp){const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;os.connect(fl);n=fl}n.connect(g);g.connect(dest);os.start(t);os.stop(t+dur+.03)}
function noise(t,dur,vol,dest,fq=2000,type='bandpass'){const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=fq;const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(dest);s.start(t);s.stop(t+dur+.03)}
function sched(){if(!AC||AC.state!=='running')return;if(nextT<AC.currentTime)nextT=AC.currentTime+.05;
  while(nextT<AC.currentTime+.2){const bar=Math.floor(step/16)%4,i=step%16,boss=musicMode===1,base=73.42*Math.pow(2,(ROOTS[bar]+(boss?-1:0))/12),t=nextT;
    if(BASS[i]!==null)tone(t,base*Math.pow(2,BASS[i]/12),boss?'sawtooth':'triangle',SP*1.8,boss?.32:.5,musicG,{lp:boss?700:900});
    if(i%2===0||Math.random()<.3)tone(t,base*2*Math.pow(2,ARP[i]/12)*(Math.random()<.07?1.06:1),'square',SP*.9,.07,musicG,{lp:1700});
    if(i%4===2||(boss&&i%2===1))noise(t,.05,.14,musicG,7000,'highpass');
    if(i%8===0||(boss&&i%4===0))tone(t,58,'sine',.25,.6,musicG,{f2:34});
    if(i===14&&bar===3)noise(t,.18,.25,musicG,1200);
    nextT+=SP*(boss?.82:1);step++}}
const lastS={};
function sfx(n){if(!AC||AC.state!=='running')return;const now=AC.currentTime;if(lastS[n]&&now-lastS[n]<.06)return;lastS[n]=now;const d=sfxG;
  switch(n){
    case'place':tone(now,260,'square',.14,.22,d,{f2:620,lp:2200});noise(now,.06,.2,d,3000);break;
    case'throw':tone(now,760,'triangle',.07,.08,d,{f2:420});break;
    case'bite':noise(now,.12,.45,d,900);tone(now,130,'sawtooth',.1,.18,d,{f2:60,lp:800});break;
    case'zap':tone(now,1500,'sawtooth',.14,.1,d,{f2:280,lp:4500});noise(now,.07,.18,d,5000,'highpass');break;
    case'pop':tone(now,420,'sine',.25,.38,d,{f2:70});noise(now,.15,.3,d,1500);break;
    case'coin':tone(now,1320,'sine',.07,.08,d);tone(now+.045,1760,'sine',.09,.06,d);break;
    case'hurt':tone(now,95,'square',.35,.3,d,{f2:40,lp:600});noise(now,.3,.38,d,300,'lowpass');break;
    case'card':[0,3,7,12].forEach((k,i)=>tone(now+i*.06,440*Math.pow(2,k/12),'square',.15,.11,d,{lp:2500}));break;
    case'boss':tone(now,70,'sawtooth',1.2,.38,d,{f2:42,lp:500});noise(now,1,.25,d,200,'lowpass');break;
    case'trap':tone(now,520,'triangle',.12,.2,d,{f2:980});noise(now,.08,.2,d,2500);break;
    case'click':tone(now,820,'square',.035,.06,d,{lp:3000});break;
    case'boom':noise(now,.7,.6,d,420,'lowpass');tone(now,110,'sawtooth',.5,.3,d,{f2:30,lp:400});break;
    case'nope':tone(now,180,'square',.12,.12,d,{f2:120,lp:1200});break;
    case'shot':tone(now,300,'square',.09,.12,d,{f2:900,lp:2500});noise(now,.05,.25,d,4000,'highpass');break;
    case'pierce':tone(now,2000,'sawtooth',.12,.08,d,{f2:600,lp:5000});break;
    case'ink':noise(now,.3,.3,d,500,'lowpass');break;
    case'gulp':tone(now,90,'sine',.6,.5,d,{f2:40});noise(now,.5,.3,d,250,'lowpass');break;
    case'heal':[0,4,7].forEach((k,i)=>tone(now+i*.05,880*Math.pow(2,k/12),'sine',.2,.07,d));break;
    case'vent':noise(now,1,.4,d,180,'lowpass');tone(now,60,'sawtooth',.8,.2,d,{f2:40,lp:300});break;
    case'spawn':tone(now,200,'square',.1,.1,d,{f2:90,lp:900});break;
    case'unlock':[0,4,7,12,16].forEach((k,i)=>tone(now+i*.07,523*Math.pow(2,k/12),'triangle',.3,.12,d));break;
    case'win':[0,3,7,10,12,15].forEach((k,i)=>tone(now+i*.09,330*Math.pow(2,k/12),'square',.3,.11,d,{lp:3000}));break;
    case'lose':[12,8,5,0,-6].forEach((k,i)=>tone(now+i*.14,220*Math.pow(2,k/12),'sawtooth',.35,.11,d,{lp:1200}));break}}
document.addEventListener('pointerdown',initAudio,{capture:true});
