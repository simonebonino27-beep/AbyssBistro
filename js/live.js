/* Abyss Bistro: PvP in diretta.
   Arena (stile Clash Royale): un campo solo con due corsie. Il mio gestore è in basso e quello dell'avversario in alto;
     sul suo telefono è il contrario. Ognuno simula i mostri che scendono verso di lui (nella sua metà ci sono i suoi dipendenti)
     e vede quelli che lui manda all'altro grazie allo stato che arriva 6 volte al secondo, ribaltato di 180 gradi.
   Affiancata: due colonne, io a sinistra e lui a destra, stesse ondate a piani per tutti e due, chi sopravvive di più vince. */
const GD={hp:40,regen:1/2.8,perle:3,time:180,bossBite:8};
let OPP=null;
const IMGC={};const imgOf=src=>{let i=IMGC[src];if(!i){i=new Image();i.src=src;IMGC[src]=i}return i};
function liveDeck(){const d=(save.deck||[]).filter(k=>save.emp[k]);return d.length>=5?d:TOWER_KEYS.filter(k=>save.emp[k]).slice(0,8)}
function liveMDeck(){const d=(save.monDeck||[]).filter(k=>save.mon[k]);return d.length>=4?d:MONSTER_KEYS.filter(k=>save.mon[k]&&k!=='stellina').slice(0,8)}

/* ---------- campi ---------- */
const AR_L=[[165,92],[78,122],[78,212],[138,238],[138,322],[78,348],[78,438],[165,468]];
const AR_R=AR_L.map(([x,y])=>[360-x,560-y]).reverse();
const mirror=(x,y)=>[360-x,560-y];
function layArena(){return{floor:Object.assign({},FLOORS[0],{paths:[AR_L,AR_R],kelp:[],vents:[],dark:0}),xmin:16,xmax:344,ymin:292,ymax:452,kit:[[180,490],[180,70]],max:16,noCaves:1,arena:1,
  decks:c=>{drawDeck(c);c.save();c.translate(0,-436);drawDeck(c);c.restore()},
  baseFn:c=>{drawBase0(c);if(!OPP)return;const keep=S.mgr;S.mgr=OPP.mgr||'polpo';c.save();c.translate(0,-436);drawBase0(c);c.restore();S.mgr=keep;
    const o=OPP.st,hp=o?Math.max(0,o.hp)/o.hm:1;c.fillStyle=INK;c.fillRect(118,8,124,10);c.fillStyle='#ff4f5e';c.fillRect(120,10,120*hp,6);
    c.font='13px Bangers,Impact,sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle=INK;const t=OPP.name+(o?' · '+Math.max(0,Math.ceil(o.hp)):'');c.strokeText(t,180,32);c.fillStyle='#ffb0b0';c.fillText(t,180,32)}}}
const SD_P=[[90,-6],[90,66],[40,104],[40,226],[140,264],[140,386],[90,424],[90,480]];
const SD_O=SD_P.map(([x,y])=>[x+180,y]);
function laySide(fi){return{floor:Object.assign({},FLOORS[fi],{paths:[SD_P],kelp:[],vents:[],dark:0}),bgPaths:[SD_O],xmin:14,xmax:166,ymin:24,ymax:448,kit:[[90,494],[270,494]],max:12,side:1,
  decks:c=>{for(const x of[90,270]){c.save();c.translate(x,509);c.scale(.82,.82);c.translate(-180,-509);drawDeck(c);c.restore()}},
  baseFn:c=>{c.save();c.translate(90,509);c.scale(.82,.82);c.translate(-180,-509);drawBase0(c);c.restore();if(!OPP)return;
    const keep=S.mgr;S.mgr=OPP.mgr||'polpo';c.save();c.translate(270,509);c.scale(.82,.82);c.translate(-180,-509);drawBase0(c);c.restore();S.mgr=keep;
    L(c,180,0,180,560,'rgba(5,13,15,.55)',3);
    const o=OPP.st,hp=o?Math.max(0,o.hp)/o.hm:1;c.fillStyle=INK;c.fillRect(214,8,112,9);c.fillStyle='#ff4f5e';c.fillRect(216,10,108*hp,5);
    c.font='12px Bangers,Impact,sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle=INK;const t=OPP.name+(o?' · ondata '+o.w:'');c.strokeText(t,270,30);c.fillStyle='#ffb0b0';c.fillText(t,270,30)}}}

function liveStart(o){hideAll();closePanel();shopKey='';rnd=Math.random;const mgr=save.mgr[save.mgrSel]?save.mgrSel:'polpo',deck=liveDeck();
  OPP={name:ROOM&&ROOM.peer?ROOM.peer.name:'Avversario',id:ROOM&&ROOM.peer?ROOM.peer.id:null,mgr:'polpo',st:null,en:{},tw:{},lastAt:Date.now(),left:false};
  const mode=o.mode==='race'?'side':o.mode==='gduel'?'arena':o.mode;
  if(mode==='side'){S=newRun('def','inf',{mgr,deck});S.wseed=o.seed;S.floors=[0];S.live='side'}
  else{S=newRun('def','arena',{mgr,deck});S.live='arena';S.wseed=o.seed;S.floors=[0];S.hp=GD.hp;S.perle=200;S.fame=5;S.mdeck=liveMDeck();S.mpile=shuffle(S.mdeck.slice());for(let i=0;i<HAND_N;i++)S.mhand[i]=drawMon();S.liveT=GD.time;S.trT=3;S.trN=0;S.el=0;S.armed=-1}
  S.hpMax=S.hp;S.liveSendT=0;S.speed=1;S.pile=shuffle(deck.slice());for(let i=0;i<HAND_N;i++)S.hand[i]=drawCard();
  if(mode==='arena'){S.fi=0;S.depth=0;loadFloor(0,layArena());for(const s of WORLD.slots)s.tower=null;S.towers=[];S.enemies=[];S.traps=S.mgr==='polpo'?8:0;S.mode='wave';S.queue=[];
    toast('Difendi il tuo gestore in basso, manda mostri su a '+OPP.name+'!')}
  else enterFloor(0);
  sendKey='';lobbyStatus('game');liveHUD(true);sendHello()}

/* stesse ondate nell'Affiancata: ogni ondata ha il suo seme; i piani usano il campo a colonne */
const _genWave=genWave;genWave=function(){if(!S||!S.wseed||S.live!=='side')return _genWave();const o=rnd;rnd=rng(S.wseed+S.total*7919);try{return _genWave()}finally{rnd=o}};
const _loadFloor=loadFloor;loadFloor=function(fi,lay){if(!lay&&S&&S.live==='side')lay=laySide(fi);return _loadFloor(fi,lay)};
function sendHello(){roomSend({t:'hi2',mg:S.mgr})}

/* stato: torri e mostri con un numero per riconoscerli e farli scorrere fluidi */
let NID=0;
function sendState(){roomSend({t:'st',hp:Math.max(0,S.hp),hm:S.hpMax,w:S.total+1,lt:Math.ceil(S.liveT||0),f:Math.floor(S.fame||0),mg:S.mgr,
  tw:S.towers.map(t=>[WORLD.slots.indexOf(t.slot),TOWER_KEYS.indexOf(t.key),t.lv]),
  en:S.enemies.slice(0,50).map(e=>{if(!e.nid)e.nid=++NID;return[e.nid,Math.round(e.x),Math.round(e.y),MONSTER_KEYS.indexOf(e.type),Math.round(e.hp/e.max*20)]})})}

function liveTick(dt){if(S.mode==='end')return;
  S.liveSendT-=dt;if(S.liveSendT<=0){S.liveSendT=.16;sendState()}
  const gone=(ROOM&&ROOM.gone&&Date.now()-ROOM.gone>10000)||Date.now()-OPP.lastAt>15000||!ROOM;
  if(gone){OPP.left=true;roomSend({t:'gone'});toast(OPP.name+' si è scollegato: vinci tu!');endRun(true);return}
  if(S.live==='arena'){S.el+=dt;S.liveT-=dt;const sd=S.liveT<=0;S.hpMul=1+S.el/150;
    S.fame=Math.min(10,S.fame+GD.regen*(sd?2:1)*dt);S.pf=(S.pf||0)+GD.perle*dt;if(S.pf>=1){const g=Math.floor(S.pf);S.pf-=g;S.perle+=g;S.earned+=g}
    /* neutri per tutta la partita, uguali per tutti e due (stesso seme) */
    S.trT-=dt;if(S.trT<=0){S.trT=8;S.trN++;const R=rng(S.wseed+S.trN*131),n=1+Math.floor(S.el/50),pool=S.el<60?['ghiozzo','aringa']:S.el<120?['ghiozzo','aringa','lumaca','ladro']:['lumaca','isopode','murena','riccio'];
      for(let i=0;i<n;i++)for(let lane=0;lane<2;lane++)spawnEnemy(pool[Math.floor(R()*pool.length)],{path:lane,pd:-i*16,hpMul:.8*S.hpMul})}
    if(sd&&!S.sdSaid){S.sdSaid=1;toast('Supplementari: la fame si ricarica il doppio!');sfx('boss')}}
  if(S.giftQ>0&&S.mode==='wave'){S.giftQ--;const pool=poolFor(Math.min(5,S.depth+1)).filter(k=>!ENEMIES[k].boss&&k!=='stellina');for(let i=0;i<3;i++)S.queue.push([pick(pool),.5]);toast('Regalo di '+OPP.name+': 3 mostri in più!');sfx('spawn')}}

function liveMsg(m){if(!S||!S.live||!OPP)return;OPP.lastAt=Date.now();
  switch(m.t){case'st':OPP.st=m;if(m.mg)OPP.mgr=m.mg;syncOpp(m);break;case'hi2':if(m.mg)OPP.mgr=m.mg;break;
    case'send':if(S.live==='arena'&&S.mode!=='end')spawnSent(m);break;
    case'gift':S.giftQ=(S.giftQ||0)+1;break;
    case'dead':if(S.mode!=='end'){OPP.dead=true;toast(OPP.name+' è caduto!');endRun(true)}break;
    case'emo':emote(m.e,false);break;
    case'gone':if(S.mode!=='end'){OPP.left=true;toast('Ti sei scollegato troppo a lungo');endRun(false)}break}}
/* mostri mandati dall'avversario: partono dalla sua cucina (in alto) sulla corsia scelta */
function spawnSent(m){const d=ENEMIES[m.k];if(!d)return;const lvl=Math.max(1,Math.min(LVL_MAX,m.lv||1));
  const hpMul=2.2*MM_HP*(1+.12*(lvl-1))*(1+S.el/150)*(d.boss?d.mcost*380/(d.hp*2.2*MM_HP):1)*(MON_TUNE[m.k]||1);
  for(let g=0;g<(d.group||1);g++){const e=spawnEnemy(m.k,{path:m.lane||0,pd:-g*14,hpMul});e.sent=1}
  const p=WORLD.paths[m.lane||0].pts[0];text(p[0],p[1]+20,d.name.split(' ')[0]+' da '+OPP.name+'!','#ff4f5e',1.2);sfx('spawn')}
function liveArm(i){if(S.live!=='arena'||S.mode==='end')return;const k=S.mhand[i];if(!k)return;
  if(S.armed===i){S.armed=-1;sendKey='';return}const c=monCost(k);if(S.fame<c){sfx('nope');toast('Serve più fame: '+c);return}
  if(ENEMIES[k].boss&&(Date.now()<(S.bossCd||0)||(OPP.st&&OPP.st.en.some(e=>ENEMIES[MONSTER_KEYS[e[3]]]&&ENEMIES[MONSTER_KEYS[e[3]]].boss&&e[2]>280)))){sfx('nope');toast('Un boss alla volta: il tuo è ancora in campo');return}
  S.armed=i;S.tool=null;closePanel();sfx('click');toast('Tocca la corsia: sinistra o destra');sendKey=''}
function liveSend(lane){const i=S.armed;S.armed=-1;sendKey='';const k=S.mhand[i];if(!k)return;const c=monCost(k);if(S.fame<c){sfx('nope');return}
  S.fame-=c;S.mhand[i]=null;S.mpile.push(k);S.mhand[i]=drawMon();if(ENEMIES[k].boss)S.bossCd=Date.now()+4000;
  roomSend({t:'send',k,lv:save.mon[k]||1,lane:1-lane});sfx('spawn');
  const p=WORLD.paths[lane].pts[WORLD.paths[lane].pts.length-1];fx({k:'ring',x:p[0],y:p[1]-30,r:26,dur:.4,col:'#ff4f5e'});text(p[0],p[1]-40,ENEMIES[k].name.split(' ')[0]+' → '+OPP.name,'#ffb0b0',1)}
/* tocco sul campo con un mostro pronto: sceglie la corsia */
cv.addEventListener('pointerdown',ev=>{if(!S||S.live!=='arena'||S.armed<0)return;ev.stopImmediatePropagation();const p=toLogical(ev);liveSend(p.x<180?0:1)},true);

/* nell'arena il gestore prende i morsi, niente ondate da ripulire */
const _reachBase=reachBase;reachBase=function(e){if(S.live==='arena'){const d=e.d.boss?GD.bossBite:e.dmg*2;S.hp-=d;S.shake=.3;sfx('hurt');text(180,462,'-'+d,'#ff4f5e',1);if(e===S.boss){S.boss=null;musicMode=0}return}_reachBase(e)};
const _waveClear=waveClear;waveClear=function(){if(S.live==='arena')return;const boss=isBossWave();_waveClear();if(S.live==='side'&&boss){roomSend({t:'gift'});toast('Boss battuto: 3 mostri in regalo a '+OPP.name+'!')}};
/* nell'arena i boss dell'avversario non hanno la barra in alto, quella è per il gestore */
const _spawnEnemy=spawnEnemy;spawnEnemy=function(type,o){const e=_spawnEnemy(type,o);if(S.live==='arena'&&e.d.boss){S.boss=null}return e};

/* ---------- l'avversario sul mio campo ---------- */
function syncOpp(m){const now=performance.now(),seen=new Set();
  for(const[id,x,y,ei,hf]of m.en){seen.add(id);let[tx,ty]=S.live==='arena'?mirror(x,y):[x+180,y];const o=OPP.en[id];
    if(o){o.px=o.x;o.py=o.y;o.tx=tx;o.ty=ty;o.t0=now;o.hf=hf}else OPP.en[id]={id,type:MONSTER_KEYS[ei],x:tx,y:ty,px:tx,py:ty,tx,ty,t0:now,hf,face:1}}
  for(const id in OPP.en)if(!seen.has(+id))delete OPP.en[id];
  const tw={};for(const[si,ti,lv]of m.tw){const key=TOWER_KEYS[ti];if(!key)continue;const s=WORLD.slots[si];if(!s)continue;tw[si]={key,lv,x:S.live==='arena'?360-s.x:s.x+180,y:S.live==='arena'?560-s.y:s.y}}OPP.tw=tw}
const PSEUDO={};
function pseudoTower(si,o){let t=PSEUDO[si];if(!t||t.key!==o.key){t=PSEUDO[si]={key:o.key,d:TOWERS[o.key],x:o.x,y:o.y,lv:o.lv,cd:0,anim:0,atk:0,face:S.live==='arena'?-1:1,disabled:0,nausea:0,shield:0,doused:0,mode:0,pa:0,mx:o.x,my:o.y};
    if(o.key==='sardine')t.fish=Array.from({length:7},(_,i)=>({x:o.x+Math.cos(i)*9,y:o.y-8+Math.sin(i)*6,a:i}))}
  t.lv=o.lv;t.x=o.x;t.y=o.y;if(o.key==='manta'){t.pa+=.03;t.mx=t.x+Math.cos(t.pa)*46;t.my=t.y+Math.sin(t.pa)*30}return t}
function drawOppField(c){const now=performance.now(),slotsOpp=S.live==='arena'?WORLD.slots.map(s=>mirror(s.x,s.y)):WORLD.slots.map(s=>[s.x+180,s.y]);
  for(const[x,y]of slotsOpp){E(c,x,y+1.5,17,8.5);c.fillStyle='rgba(60,58,48,.75)';c.fill()}
  const items=[];for(const si in OPP.tw){const o=OPP.tw[si];items.push({y:o.y,f:()=>drawTower(c,pseudoTower(si,o))})}
  for(const id in OPP.en){const e=OPP.en[id],k=Math.min(1,(now-e.t0)/170);e.x=e.px+(e.tx-e.px)*k;e.y=e.py+(e.ty-e.py)*k;const d=ENEMIES[e.type];if(!d)continue;
    const dx=e.tx-e.px;if(Math.abs(dx)>.5)e.face=dx>0?1:-1;
    items.push({y:e.y,f:()=>{const pe={type:e.type,d,x:e.x,y:e.y,r:d.r,pd:e.id*7,face:e.face,hitT:0,slow:0,stun:0,conf:0,hp:e.hf,max:20,disg:false,grow:1,dash:0,rage:0,lureOff:0};drawEnemy(c,pe)}})}
  items.sort((a,b)=>a.y-b.y);for(const it of items)it.f()}
const _render=render;render=function(){_render();if(!S||!S.live||!OPP||S.mode==='end')return;const c=ctx;c.setTransform(SC*DPR,0,0,SC*DPR,OX*DPR,OY*DPR);drawOppField(c);
  if(S.live==='arena'&&S.armed>=0){const a=.35+.25*Math.sin(T*6);for(const lane of[0,1]){const P=WORLD.paths[lane];c.beginPath();P.pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle='rgba(255,79,94,'+a+')';c.lineWidth=26;c.lineCap='round';c.lineJoin='round';c.stroke()}
    c.font='16px Bangers,Impact,sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle=INK;for(const[x,s]of[[70,'◀ SINISTRA'],[290,'DESTRA ▶']]){c.strokeText(s,x,282);c.fillStyle='#ffd0d0';c.fillText(s,x,282)}}};

function liveEnd(win){if(!OPP)return;if(!win&&!OPP.left)roomSend({t:'dead'});
  const d=win?30:-20;save.trophies=Math.max(0,(save.trophies||0)+d);if(win)save.liveWins=(save.liveWins||0)+1;
  if(OPP.id){addFriendId(OPP.id,OPP.name);const f=Object.values(save.friends).find(f=>f.id===OPP.id);if(f){(f.duels=f.duels||[]).push({t:S.live,me:win?1:0,them:win?0:1,ts:Date.now()});if(f.duels.length>30)f.duels.shift()}}
  if(win){save.perle+=60;awardPack('comune','vittoria in diretta')}
  S.liveRes={win,d};writeSave();lobbyStatus('menu');syncProfile()}
const _endRun=endRun;endRun=function(win){if(S&&S.live&&S.mode!=='end')liveEnd(win);_endRun(win)};
const _showEnd=ui.showEnd;ui.showEnd=function(win,earned){_showEnd(win,earned);if(!S.live)return;liveHUD(false);const r=S.liveRes||{win,d:0};
  $('endEyebrow').textContent=LIVE_NAMES[S.live]+' · in diretta';$('endTitle').textContent=r.win?'Hai battuto '+OPP.name+'!':'Ha vinto '+OPP.name;
  $('endText').textContent=r.win?(OPP.left?'Il tuo avversario è scappato dalla cucina.':S.live==='arena'?'Il suo gestore è finito nel menu.':'Hai resistito più di lui negli abissi.'):(S.live==='arena'?'Il tuo gestore è stato mangiato.':'Sei caduto all\'ondata '+(S.total+1)+'.');
  $('endShare').innerHTML='<div class="share liveRes"><b>'+(r.d>=0?'+':'')+r.d+' 🏆</b><span>Trofei: '+save.trophies+(r.win?' · +60 perle e un Sacchetto d\'alghe':'')+'</span>'+(ROOM&&ROOM.peer?'<button class="big sm" id="rematch">Rivincita</button><span class="bkM" id="rmMsg"></span>':'')+'</div>';
  $('againBtn').hidden=true;$('endHubBtn').hidden=true;if($('rematch'))$('rematch').onclick=rematch;liveEndRefresh()};
function rematch(){if(!ROOM||!ROOM.peer){toast('L\'avversario è uscito');return}sfx('click');ROOM.rq.me=1;roomSend({t:'rq'});if(ROOM.host&&ROOM.rq.peer){ROOM.rq={};hostStart()}liveEndRefresh()}
function liveEndRefresh(){const m=$('rmMsg');if(!m||!ROOM)return;m.textContent=ROOM.rq.me&&ROOM.rq.peer?'Si riparte!':ROOM.rq.me?'Aspetto '+(ROOM.peer?ROOM.peer.name:'l\'avversario')+'…':ROOM.rq.peer?(ROOM.peer?ROOM.peer.name:'')+' vuole la rivincita!':''}
$('endMenuBtn').addEventListener('click',()=>{if(ROOM)leaveRoom();$('againBtn').hidden=false;$('endHubBtn').hidden=false});

/* niente pausa vera in diretta: l'avversario continua a giocare */
const _openPause=openPause;openPause=function(fromMenu){if(!fromMenu&&S&&S.live&&S.mode!=='end'){pauseFromMenu=false;S.prev=S.mode;$('pauseTitle').textContent='La partita continua!';$('pauseRun').hidden=false;$('restartBtn').hidden=true;$('resumeBtn').textContent='Torna a giocare';$('saveMsg').textContent='';show('pause');return}
  $('restartBtn').hidden=false;_openPause(fromMenu)};
const _quitRun=quitRun;quitRun=function(){if(S&&S.live&&S.mode!=='end'){roomSend({t:'dead'});save.trophies=Math.max(0,(save.trophies||0)-20);writeSave();leaveRoom();lobbyStatus('menu');liveHUD(false)}_quitRun()};
const _showMenu=showMenu;showMenu=function(t){liveHUD(false);_showMenu(t)};

/* ---------- HUD della diretta ---------- */
function liveHUD(on){document.body.classList.toggle('arena',!!(on&&S&&S.live==='arena'));$('oppView').hidden=true;$('emoBar').hidden=!on;$('sendRow').hidden=!(on&&S&&S.live==='arena');$('speedBtn').hidden=!!on;if(on)$('sendTo').textContent=OPP.name}
let sendKey='';
function liveUI(){if(S.mode==='end')return;const a=S.live==='arena';
  if(a){const t=Math.max(0,Math.ceil(S.liveT));setT('waveLbl',S.liveT>0?'Arena · '+Math.floor(t/60)+':'+String(t%60).padStart(2,'0'):'Supplementari!');setT('hpLbl',String(Math.max(0,Math.ceil(S.hp))));
    $('startBtn').hidden=true;$('handBtn').hidden=true;
    $('fameFill').style.width=(S.fame*10)+'%';setT('fameLbl',Math.floor(S.fame)+'/10 fame');
    const nx=S.mpile[0];const key=S.mhand.join(',')+'|'+S.armed+'|'+nx;
    if(key!==sendKey){sendKey=key;$('sendBtns').innerHTML='<div class="nextC"><span>Dopo</span>'+(nx?'<img alt="" src="'+ICONS.e[nx]+'">':'')+'</div>'+S.mhand.map((k,i)=>k?'<button class="snd'+(S.armed===i?' armed':'')+'" data-i="'+i+'"><img alt="" src="'+ICONS.e[k]+'"><span>'+ENEMIES[k].name.split(' ')[0]+(ENEMIES[k].group?' x'+ENEMIES[k].group:'')+'</span><b><span class="fang"></span>'+monCost(k)+'</b></button>':'<button class="snd" disabled></button>').join('')}
    $('sendBtns').querySelectorAll('.snd').forEach(b=>{const k=S.mhand[b.dataset.i];b.classList.toggle('poor',!k||S.fame<monCost(k))})}
  else setT('waveLbl','Ondata '+(S.total+1)+(isBossWave()?' · Boss':''))}
$('sendBtns').addEventListener('click',ev=>{const b=ev.target.closest('.snd');if(b&&!b.disabled)liveArm(+b.dataset.i)});
const _syncUI=syncUI;syncUI=function(){_syncUI();if(S&&S.live)liveUI()};

/* faccine veloci */
let emoT1=0,emoT2=0;
function emote(e,mine){const el=$(mine?'myEmo':'oppEmo');el.textContent=e;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(mine?emoT1:emoT2);const t=setTimeout(()=>el.classList.remove('on'),1800);if(mine)emoT1=t;else emoT2=t;if(!mine)sfx('click')}
let emoCd=0;$('emoBar').addEventListener('click',ev=>{const b=ev.target.closest('button[data-e]');if(!b||Date.now()<emoCd)return;emoCd=Date.now()+1500;roomSend({t:'emo',e:b.dataset.e});emote(b.dataset.e,true)});

/* aggancio al ciclo di gioco */
const _update=update;update=function(dt){_update(dt);if(S&&S.live&&(S.mode==='wave'||S.mode==='build'||S.mode==='cards'||S.mode==='intro'))liveTick(dt)};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S&&S.live)sendState()});
$('lvI1').src=ICONS.m.polpo;$('lvI2').src=ICONS.e.reAragosta;
