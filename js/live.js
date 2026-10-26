/* Abyss Bistro: PvP in diretta.
   Duello dei gestori: ognuno difende il suo gestore (vita 40) e con la fame manda mostri nella cucina dell'altro.
   Scalata: stessi abissi e stesse ondate per tutti e due, ogni boss battuto regala 3 mostri all'altro, chi cade per primo perde.
   Ogni giocatore simula la sua partita; tra i due viaggiano solo lo stato (6 volte al secondo) e gli eventi. */
const GD={hp:40,regen:7,perle:3,time:180,bossBite:8};
let OPP=null;
const IMGC={};const imgOf=src=>{let i=IMGC[src];if(!i){i=new Image();i.src=src;IMGC[src]=i}return i};
function liveDeck(){const d=(save.deck||[]).filter(k=>save.emp[k]);return d.length>=4?d:TOWER_KEYS.filter(k=>save.emp[k]).slice(0,8)}
function liveMDeck(){const d=(save.monDeck||[]).filter(k=>save.mon[k]);return d.length>=3?d:MONSTER_KEYS.filter(k=>save.mon[k]&&k!=='stellina').slice(0,8)}

function liveStart(o){hideAll();closePanel();shopKey='';rnd=Math.random;const mgr=save.mgr[save.mgrSel]?save.mgrSel:'polpo',deck=liveDeck();
  OPP={name:ROOM&&ROOM.peer?ROOM.peer.name:'Avversario',id:ROOM&&ROOM.peer?ROOM.peer.id:null,st:null,fl:null,lastAt:Date.now(),left:false};
  if(o.mode==='race'){S=newRun('def','inf',{mgr,deck});S.wseed=o.seed;S.floors=[0]}
  else{S=newRun('def','gduel',{mgr,deck});S.floors=[o.floor];S.hp=GD.hp;S.perle=220;S.fame=40;S.mdeck=liveMDeck();S.mpile=shuffle(S.mdeck.slice());for(let i=0;i<3;i++)S.mhand[i]=drawMon();S.liveT=GD.time;S.trT=4;S.el=0}
  S.live=o.mode;S.hpMax=S.hp;S.liveSendT=0;S.liveFlT=0;S.speed=1;S.pile=shuffle(deck.slice());for(let i=0;i<3;i++)S.hand[i]=drawCard();
  enterFloor(0);
  if(o.mode==='gduel'){show('floorOv',false);S.mode='wave';S.queue=[];toast('Difendi il tuo gestore e manda mostri a '+OPP.name+'!')}
  sendKey='';lobbyStatus('game');liveHUD(true);sendFloor()}

/* stesse ondate per tutti e due nella Scalata: ogni ondata ha il suo seme */
const _genWave=genWave;genWave=function(){if(!S||!S.wseed)return _genWave();const o=rnd;rnd=rng(S.wseed+S.total*7919);try{return _genWave()}finally{rnd=o}};
const _enterFloor=enterFloor;enterFloor=function(i){_enterFloor(i);if(S&&S.live)sendFloor()};

function sendFloor(){if(!S||!S.live)return;roomSend({t:'fl',fi:WORLD.fi,paths:WORLD.paths.map(p=>p.pts.map(([x,y])=>[Math.round(x),Math.round(y)])),slots:WORLD.slots.map(s=>[Math.round(s.x),Math.round(s.y)])})}
function sendState(){roomSend({t:'st',hp:Math.max(0,S.hp),hm:S.hpMax,p:Math.floor(S.perle),w:S.total+1,lt:Math.ceil(S.liveT||0),f:Math.floor(S.fame||0),bs:S.boss?Math.round(S.boss.hp/S.boss.max*100):-1,
  tw:S.towers.map(t=>[WORLD.slots.indexOf(t.slot),TOWER_KEYS.indexOf(t.key),t.lv]),en:S.enemies.slice(0,45).map(e=>[Math.round(e.x),Math.round(e.y),MONSTER_KEYS.indexOf(e.type)])})}

function liveTick(dt){if(S.mode==='end')return;
  S.liveSendT-=dt;if(S.liveSendT<=0){S.liveSendT=.16;sendState()}S.liveFlT-=dt;if(S.liveFlT<=0){S.liveFlT=4;sendFloor()}
  const gone=(ROOM&&ROOM.gone&&Date.now()-ROOM.gone>10000)||Date.now()-OPP.lastAt>15000||!ROOM;
  if(gone){OPP.left=true;roomSend({t:'gone'});toast(OPP.name+' si è scollegato: vinci tu!');endRun(true);return}
  if(S.live==='gduel'){S.el+=dt;S.liveT-=dt;const sd=S.liveT<=0;S.hpMul=1+S.el/150;
    S.fame=Math.min(100,S.fame+GD.regen*(sd?2:1)*dt);S.pf=(S.pf||0)+GD.perle*dt;if(S.pf>=1){const g=Math.floor(S.pf);S.pf-=g;S.perle+=g;S.earned+=g}
    S.trT-=dt;if(S.trT<=0){S.trT=8;const n=2+Math.floor(S.el/45),pool=S.el<60?['ghiozzo','aringa']:S.el<120?['ghiozzo','aringa','lumaca','ladro']:['lumaca','isopode','murena','riccio'];for(let i=0;i<n;i++)S.queue.push([pick(pool),.6])}
    if(sd&&!S.sdSaid){S.sdSaid=1;toast('Supplementari: fame raddoppiata!');sfx('boss')}}
  if(S.giftQ>0&&S.mode==='wave'){S.giftQ--;const pool=poolFor(Math.min(5,S.depth+1)).filter(k=>!ENEMIES[k].boss&&k!=='stellina');for(let i=0;i<3;i++)S.queue.push([pick(pool),.5]);toast('Regalo di '+OPP.name+': 3 mostri in più!');sfx('spawn')}}

function liveMsg(m){if(!S||!S.live||!OPP)return;OPP.lastAt=Date.now();
  switch(m.t){case'st':OPP.st=m;break;case'fl':OPP.fl=m;break;
    case'send':if(S.live==='gduel'&&S.mode!=='end')spawnSent(m);break;
    case'gift':S.giftQ=(S.giftQ||0)+1;break;
    case'dead':if(S.mode!=='end'){OPP.dead=true;toast(OPP.name+' è caduto!');endRun(true)}break;
    case'emo':emote(m.e,false);break;
    case'gone':if(S.mode!=='end'){OPP.left=true;toast('Ti sei scollegato troppo a lungo');endRun(false)}break}}
function spawnSent(m){const d=ENEMIES[m.k];if(!d)return;const lvl=Math.max(1,Math.min(LVL_MAX,m.lv||1));
  const hpMul=1.6*(1+.12*(lvl-1))*(1+S.el/150)*(d.boss?d.mcost*16/(d.hp*1.6):1)*(MON_TUNE[m.k]||1);
  for(let g=0;g<(d.group||1);g++)spawnEnemy(m.k,{pd:-g*14,hpMul});text(180,70,d.name.split(' ')[0]+' da '+OPP.name+'!','#ff4f5e',1.2);sfx('spawn')}
function liveSendMon(i){const k=S.mhand[i];if(!k||S.mode==='end'||S.live!=='gduel')return;const c=ENEMIES[k].mcost;if(S.fame<c){sfx('nope');toast('Serve più fame: '+c);return}
  S.fame-=c;S.mhand[i]=null;S.mpile.push(k);S.mhand[i]=drawMon();roomSend({t:'send',k,lv:save.mon[k]||1});sfx('spawn');toast(ENEMIES[k].name+' → '+OPP.name);sendKey=''}

/* il gestore prende i morsi: nel duello i boss tolgono 8 */
const _reachBase=reachBase;reachBase=function(e){if(S.live==='gduel'){const d=e.d.boss?GD.bossBite:e.dmg*2;S.hp-=d;S.shake=.3;sfx('hurt');text(180,462,'-'+d,'#ff4f5e',1);if(e===S.boss){S.boss=null;musicMode=0}return}_reachBase(e)};
const _waveClear=waveClear;waveClear=function(){if(S.live==='gduel')return;const boss=isBossWave();_waveClear();if(S.live==='race'&&boss){roomSend({t:'gift'});toast('Boss battuto: 3 mostri in regalo a '+OPP.name+'!')}};

function liveEnd(win){if(!OPP)return;if(!win&&!OPP.left)roomSend({t:'dead'});
  const d=win?30:-20;save.trophies=Math.max(0,(save.trophies||0)+d);if(win)save.liveWins=(save.liveWins||0)+1;
  if(OPP.id){addFriendId(OPP.id,OPP.name);const f=Object.values(save.friends).find(f=>f.id===OPP.id);if(f){(f.duels=f.duels||[]).push({t:S.live,me:win?1:0,them:win?0:1,ts:Date.now()});if(f.duels.length>30)f.duels.shift()}}
  if(win){save.perle+=60;awardPack('comune','vittoria in diretta')}
  S.liveRes={win,d};writeSave();lobbyStatus('menu');syncProfile()}
const _endRun=endRun;endRun=function(win){if(S&&S.live&&S.mode!=='end')liveEnd(win);_endRun(win)};
const _showEnd=ui.showEnd;ui.showEnd=function(win,earned){_showEnd(win,earned);if(!S.live)return;liveHUD(false);const r=S.liveRes||{win,d:0};
  $('endEyebrow').textContent=LIVE_NAMES[S.live]+' · in diretta';$('endTitle').textContent=r.win?'Hai battuto '+OPP.name+'!':'Ha vinto '+OPP.name;
  $('endText').textContent=r.win?(OPP.left?'Il tuo avversario è scappato dalla cucina.':S.live==='gduel'?'Il suo gestore è finito nel menu.':'Hai resistito più di lui negli abissi.'):(S.live==='gduel'?'Il tuo gestore è stato mangiato.':'Sei caduto all\'ondata '+(S.total+1)+'.');
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

/* HUD della diretta */
function liveHUD(on){$('oppView').hidden=!on;$('emoBar').hidden=!on;$('sendRow').hidden=!(on&&S&&S.live==='gduel');$('speedBtn').hidden=!!on;if(on){$('oppName').textContent=OPP.name;$('sendTo').textContent=OPP.name}}
let sendKey='';
function liveUI(){if(S.mode==='end')return;const g=S.live==='gduel';
  if(g){const t=Math.max(0,Math.ceil(S.liveT));setT('waveLbl',S.liveT>0?'Duello · '+Math.floor(t/60)+':'+String(t%60).padStart(2,'0'):'Supplementari!');setT('hpLbl',String(Math.max(0,Math.ceil(S.hp))));
    $('startBtn').hidden=true;$('handBtn').hidden=true;
    $('fameFill').style.width=S.fame+'%';setT('fameLbl',Math.floor(S.fame)+'/100 fame');
    const key=S.mhand.join(',');if(key!==sendKey){sendKey=key;$('sendBtns').innerHTML=S.mhand.map((k,i)=>k?'<button class="snd" data-i="'+i+'"><img alt="" src="'+ICONS.e[k]+'"><span>'+ENEMIES[k].name.split(' ')[0]+(ENEMIES[k].group?' x'+ENEMIES[k].group:'')+'</span><b><span class="fang"></span>'+ENEMIES[k].mcost+'</b></button>':'<button class="snd" disabled></button>').join('')}
    $('sendBtns').querySelectorAll('.snd').forEach(b=>{const k=S.mhand[b.dataset.i];b.classList.toggle('poor',!k||S.fame<ENEMIES[k].mcost)})}
  else setT('waveLbl','Ondata '+(S.total+1)+(isBossWave()?' · Boss':''));
  const o=OPP.st;$('oppHpF').style.width=o?Math.max(0,o.hp/o.hm*100)+'%':'100%';
  $('oppInfo').textContent=o?(g?'❤ '+o.hp+' · fame '+o.f:'❤ '+o.hp+' · ondata '+o.w):'collegamento…'}
$('sendBtns').addEventListener('click',ev=>{const b=ev.target.closest('.snd');if(b&&!b.disabled)liveSendMon(+b.dataset.i)});
const _syncUI=syncUI;syncUI=function(){_syncUI();if(S&&S.live)liveUI()};

/* finestrella con la partita dell'avversario */
const OPPC=$('oppCv'),octx=OPPC.getContext('2d');const FLCOL=['#35615a','#2c4e3c','#3c4852','#182128','#3d2622','#0e1316'];
$('oppView').addEventListener('click',()=>$('oppView').classList.toggle('mini'));
function placeOpp(){const el=$('oppView'),right=VW-(OX+360*SC),wide=right>230,mini=el.classList.contains('mini');
  const w=wide?Math.min(320,right-28):Math.round(Math.min(140,VW*.34)*(mini?.6:1)),h=Math.round(w*560/360);
  el.style.width=w+'px';el.style.left=wide?(OX+360*SC+14)+'px':'auto';el.style.right=wide?'auto':'8px';el.style.top=wide?Math.max(12,OY+12)+'px':'58px';
  const cw=Math.round(w*DPR),ch=Math.round(h*DPR);if(OPPC.width!==cw||OPPC.height!==ch){OPPC.width=cw;OPPC.height=ch;OPPC.style.height=h+'px'}}
function drawOpp(){if($('oppView').hidden||!OPP)return;placeOpp();const c=octx,W=OPPC.width,H=OPPC.height,k=W/360,fl=OPP.fl,st=OPP.st;
  c.setTransform(1,0,0,1,0,0);c.fillStyle=fl?FLCOL[fl.fi]||'#1b2a2c':'#1b2a2c';c.fillRect(0,0,W,H);c.setTransform(k,0,0,k,0,0);
  if(fl){c.lineCap='round';c.lineJoin='round';for(const p of fl.paths){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle='rgba(232,214,168,.4)';c.lineWidth=30;c.stroke()}
    for(const[x,y]of fl.slots){c.beginPath();c.ellipse(x,y,13,7,0,0,TAU);c.fillStyle='rgba(0,0,0,.28)';c.fill()}}
  c.fillStyle='#5e3d27';c.beginPath();c.roundRect(110,470,140,46,8);c.fill();
  if(st&&fl){for(const[si,ti,lv]of st.tw){const s=fl.slots[si],key=TOWER_KEYS[ti];if(!s||!key)continue;const im=imgOf(ICONS.t[key]);if(im.complete)c.drawImage(im,s[0]-18,s[1]-28,36,36);if(lv>1){c.fillStyle='#e8c14a';c.font='bold 14px sans-serif';c.fillText('★'.repeat(lv-1),s[0]-10,s[1]+16)}}
    for(const[x,y,ei]of st.en){const key=MONSTER_KEYS[ei];if(!key)continue;const big=ENEMIES[key].boss,r=big?44:26,im=imgOf(ICONS.e[key]);if(im.complete)c.drawImage(im,x-r/2,y-r/2,r,r)}}
  else{c.setTransform(1,0,0,1,0,0);c.fillStyle='rgba(255,255,255,.6)';c.font=Math.round(11*DPR)+'px sans-serif';c.textAlign='center';c.fillText('in attesa…',W/2,H/2);c.textAlign='left'}}
const _render=render;render=function(){_render();if(S&&S.live)drawOpp()};

/* faccine veloci */
let emoT1=0,emoT2=0;
function emote(e,mine){const el=$(mine?'myEmo':'oppEmo');el.textContent=e;el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(mine?emoT1:emoT2);const t=setTimeout(()=>el.classList.remove('on'),1800);if(mine)emoT1=t;else emoT2=t;if(!mine)sfx('click')}
let emoCd=0;$('emoBar').addEventListener('click',ev=>{const b=ev.target.closest('button[data-e]');if(!b||Date.now()<emoCd)return;emoCd=Date.now()+1500;roomSend({t:'emo',e:b.dataset.e});emote(b.dataset.e,true)});

/* aggancio al ciclo di gioco */
const _update=update;update=function(dt){_update(dt);if(S&&S.live&&(S.mode==='wave'||S.mode==='build'||S.mode==='cards'||S.mode==='intro'))liveTick(dt)};
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&S&&S.live)sendState()});
$('lvI1').src=ICONS.m.polpo;$('lvI2').src=ICONS.e.reAragosta;
