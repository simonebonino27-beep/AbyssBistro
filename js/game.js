'use strict';
/* ===== Abyss Bistro: simulazione e disegno della partita ===== */
let S=null;
function newRun(kind,run,o={}){const r=save.resto;
  const s={kind,run,mode:'build',hp:20+3*r.hp,perle:120+25*r.cash,earned:0,stars:0,found:[],
    floors:[],fi:0,depth:0,wave:0,total:0,hpMul:1,
    mgr:o.mgr||'polpo',deck:(o.deck||[]).slice(),pile:[],hand:[null,null,null,null],
    towers:[],enemies:[],shots:[],fx:[],plates:[],clouds:[],traps:0,wasabi:0,freeze:0,freezeT:0,
    mods:{dmg:{},all:1,range:1,rate:1,chain:0,perle:1,enemySpeed:1,upDisc:1,hireDisc:1,drain:0,count:1,light:1,curse:1},
    rerolls:[0,1,1,2][r.cards],cardN:r.cards>=2?4:3,
    queue:[],spawnT:0,spawnAlt:0,speed:1,tool:null,sel:null,selSlot:null,hover:null,boss:null,shake:0,blackout:0,floorHit:false,torpT:3,lights:[],
    mdeck:(o.mdeck||[]).slice(),mpile:[],mhand:[null,null,null,null],hunger:50,hungerMax:100,lane:0,timer:0,round:0,baseHp:0,baseMax:0,dealt:0,
    mm:{regen:1,hp:1,speed:1,cost:1,bite:1},ai:{rate:1,budget:0,income:0,t:0,startCut:1,dmg:1}};
  for(const k of TOWER_KEYS)s.mods.dmg[k]=1;
  if(s.mgr==='narvalo')s.mods.curse=1.5;
  if(s.mgr==='pagliaccio'){s.mods.perle=1.5;s.mods.count=1.25}
  return s}

/* ---------- difesa: flusso della run ---------- */
const wavesPer=()=>S.run==='short'?3:S.run==='long'?5:4;
const isBossWave=()=>S.run==='inf'?(S.total+1)%5===0:S.wave>=wavesPer();
const curFloorIdx=()=>S.run==='inf'?Math.floor(S.total/5)%6:S.floors[S.fi];
function drawCard(){if(!S.pile.length)S.pile=shuffle(S.deck.slice());return S.pile.shift()}
function startDefense(run,mgr,deck,daily){S=newRun('def',run,{mgr,deck});if(daily){S.daily=daily.key;daily.curse.apply(S)}
  if(run==='short'){S.floors=[pick([0,0,1]),pick([2,3,4]),5]}else if(run==='long')S.floors=[0,1,2,3,4,5];else S.floors=[0];
  S.pile=shuffle(S.deck.slice());for(let i=0;i<4;i++)S.hand[i]=drawCard();enterFloor(0)}
function enterFloor(i){S.fi=i;const fi=curFloorIdx();S.depth=S.run==='inf'?Math.min(5,Math.floor(S.total/5)):fi;loadFloor(fi);
  for(const s of WORLD.slots)s.tower=null;S.towers=[];S.enemies=[];S.shots=[];S.plates=[];S.clouds=[];S.traps=S.mgr==='polpo'?8:0;
  S.wave=0;S.floorHit=false;S.boss=null;S.blackout=0;S.mode='intro';musicMode=0;ui.floorIntro()}
function genWave(){const boss=isBossWave(),depth=S.depth,w=S.run==='inf'?S.total:S.wave,q=[];
  let pool=poolFor(depth);if(depth===0&&w===0)pool=['ghiozzo'];else if(depth===0&&w===1)pool=['ghiozzo','aringa'];
  const fresh=POOL[Math.min(depth,4)].filter(k=>pool.includes(k));
  const diff=S.run==='short'?S.fi*1.8:S.run==='long'?S.fi:depth;let n=Math.round((7+w*2.2+diff*2.3)*S.mods.count);if(boss)n=Math.round(n*.6);
  for(let k=0;k<n;k++){let t=null;if(fresh.length&&depth>0&&Math.random()<.35)t=pick(fresh);
    else{const tot=pool.reduce((a,p)=>a+RAR[ENEMIES[p].rar].w,0);let x=Math.random()*tot;for(const p of pool){x-=RAR[ENEMIES[p].rar].w;if(x<=0){t=p;break}}}
    t=t||'ghiozzo';const e=ENEMIES[t];if(e.group)for(let g=0;g<e.group;g++)q.push([t,g<e.group-1?.28:.7]);else q.push([t,e.hp>=140?1.5:Math.max(.5,1.05-w*.03)])}
  if(boss)q.splice(Math.min(4,q.length),0,[WORLD.floor.boss,3]);return q}
const bossMul=()=>(S.run==='short'?(S.fi===0?.65:.85):1)*(S.run==='inf'?1+Math.floor(S.total/6)*.6:1);
function prepWave(){S.nextQ=genWave()}
function startWave(){if(S.mode!=='build')return;S.queue=S.nextQ||genWave();S.nextQ=null;if(S.mgr==='polpo'||Math.random()<.5)toast(pick(isBossWave()?BOSS_LINES:CHEF_LINES));const w=S.run==='inf'?S.total:S.wave;
  const diff=S.run==='short'?S.fi*1.8:S.run==='long'?S.fi:S.depth;S.hpMul=(1+.13*w)*(1+.3*diff)*(S.run==='inf'?1+Math.max(0,S.total-8)*.06:1);S.spawnT=.3;S.spawnAlt=0;S.mode='wave';
  if(S.mods.drain){S.hp=Math.max(1,S.hp-S.mods.drain);text(180,455,'-'+S.mods.drain+' chef posseduto','#ff4f5e',1.4)}}
function waveClear(){const boss=isBossWave();
  for(const t of S.towers)if(t.key==='ostrica'){if(t.robbed){t.robbed=0;text(t.x,t.y-24,'Derubata!','#ff4f5e',1.2)}else{const g=30+12*(t.lv-1);S.perle+=g;S.earned+=g;text(t.x,t.y-24,'+'+g,'#f1dca2',1.2);t.anim=1}}
  const bonus=25+Math.min(S.total,12)*8;S.perle+=bonus;S.earned+=bonus;S.total++;
  if(boss){const st=1+(S.floorHit?0:1);S.stars+=st;save.stars+=st;const bk=WORLD.floor.boss;
    if(!save.bossBeat[bk]){save.bossBeat[bk]=1;if(!save.mon[bk])save.mon[bk]=1;S.found.push(bk)}save.maxFloor=Math.max(save.maxFloor,WORLD.fi);
    for(const m of MANAGER_KEYS){const u=MANAGERS[m].unlock;if(save.mgr[m])continue;if((u.type==='boss'&&save.bossBeat[u.boss])||(u.type==='floor'&&save.maxFloor>=u.floor)){save.mgr[m]=1;S.found.push('mgr:'+m)}}
    writeSave();
    if(S.run!=='inf'&&S.fi>=S.floors.length-1){endRun(true);return}
    S.pendingFloor=st}else S.wave++;
  S.mode='cards';ui.showCards(bonus,boss)}
function afterCards(){if(S.kind==='mon'){enterMonsterFloor(S.fi+1);return}
  if(S.pendingFloor){const st=S.pendingFloor;S.pendingFloor=0;let refund=0;for(const t of S.towers)refund+=t.spent;S.perle+=refund;
    if(refund)toast('Personale riassunto al piano di sotto: +'+refund+' perle');enterFloor(S.run==='inf'?0:S.fi+1);return}
  S.mode='build';prepWave()}

/* ---------- mostro affamato ---------- */
function drawMon(){if(!S.mpile.length)S.mpile=shuffle(S.mdeck.slice());return S.mpile.shift()}
function startMonster(mdeck){S=newRun('mon','monster',{mdeck});S.floors=shuffle([0,1,2,3,4,5]).slice(0,3);S.mpile=shuffle(S.mdeck.slice());for(let i=0;i<4;i++)S.mhand[i]=drawMon();enterMonsterFloor(0)}
function enterMonsterFloor(i){if(i>=S.floors.length){endRun(true);return}S.fi=i;S.round=i;const fi=S.floors[i];S.depth=fi;loadFloor(fi);
  for(const s of WORLD.slots)s.tower=null;S.towers=[];S.enemies=[];S.shots=[];S.clouds=[];S.plates=[];S.boss=null;S.blackout=0;
  S.baseMax=S.baseHp=20+i*10;S.hunger=Math.min(S.hungerMax,50);S.timer=150;S.lane=0;
  S.ai.budget=Math.round((130+i*110+fi*25)*S.ai.startCut);S.ai.income=3.2+i*1.8+fi*.6;S.ai.dmg=.75+i*.2+fi*.08;S.ai.t=4;
  aiThink(true);S.mode='intro';musicMode=0;ui.floorIntro()}
const monCost=k=>Math.round(ENEMIES[k].mcost*S.mm.cost);
function playMon(i){const k=S.mhand[i];if(!k||S.mode!=='mplay')return;const c=monCost(k);if(S.hunger<c){sfx('nope');toast('Serve più fame: '+c);return}
  S.hunger-=c;const d=ENEMIES[k],lvl=save.mon[k]||1,hpMul=2.2*S.mm.hp*(1+.12*(lvl-1))*(1+S.round*.18);
  for(let g=0;g<(d.group||1);g++)spawnEnemy(k,{path:S.lane,pd:-g*14,hpMul,spMul:1.3,bite:S.mm.bite});sfx('spawn');S.mhand[i]=drawMon()}
function aiThink(force){const free=WORLD.slots.filter(s=>!s.tower),dk=WORLD.floor.dark,hasRana=S.towers.some(t=>t.key==='rana');
  if(free.length&&(force||!S.towers.length||Math.random()<.62)){
    let keys=TOWER_KEYS.filter(k=>TOWERS[k].cost<=S.ai.budget&&k!=='ostrica');if(!keys.length)return;
    if(dk>=.3&&!hasRana&&keys.includes('rana'))keys=['rana'];else keys=keys.filter(k=>TOWERS[k].dmg>0).concat(keys);
    const k=pick(keys),slot=pick(free.slice(0,Math.max(3,Math.ceil(free.length*.7))));
    S.ai.budget-=TOWERS[k].cost;const t=makeTower(k,slot);t.spent=TOWERS[k].cost;fx({k:'ring',x:t.x,y:t.y,r:24,dur:.35,col:'#f1dca2'})}
  else{const up=S.towers.filter(t=>t.lv<3&&TOWERS[t.key].cost*.75*t.lv<=S.ai.budget);if(up.length){const t=pick(up);S.ai.budget-=TOWERS[t.key].cost*.75*t.lv;t.lv++;fx({k:'ring',x:t.x,y:t.y,r:26,dur:.4,col:'#e8c14a'})}}}
function updMonster(dt){S.hunger=Math.min(S.hungerMax,S.hunger+9*S.mm.regen*dt);S.timer-=dt;S.ai.budget+=S.ai.income*dt;S.ai.t-=dt;
  if(S.ai.t<=0){S.ai.t=Math.max(2.4,3.8-S.round*.5);aiThink()}
  if(S.baseHp<=0){S.baseHp=0;S.mode='cards';sfx('win');S.earned+=80;if(S.fi>=S.floors.length-1){endRun(true);return}ui.showCards(80,false);return}
  if(S.timer<=0){S.timer=0;endRun(false)}}

/* ---------- entità ---------- */
function spawnEnemy(type,o={}){const d=ENEMIES[type];const np=WORLD.paths.length;const pi=o.path!=null?o.path%np:(S.spawnAlt++)%np;const path=WORLD.paths[pi];
  const hp=d.hp*(o.hpMul||1);const e={type,d,hp,max:hp,speed:d.speed*(o.spMul||1),reward:d.reward,dmg:d.dmg,r:d.r,path,pd:o.pd||0,x:0,y:0,face:1,dirx:1,diry:0,slow:0,stun:0,hitT:0,conf:0,
    abT:d.boss?4:5,dash:0,dashT:3+Math.random()*2,grow:1,disg:type==='rivale',stole:0,seen:new Set(),bite:o.bite||1};
  const p=path.at(e.pd);e.x=p.x;e.y=p.y;S.enemies.push(e);if(S.kind==='def'&&!save.seen[type])save.seen[type]=1;
  if(d.boss){S.boss=e;sfx('boss');musicMode=1;S.shake=.4;toast(d.name+' · '+d.title)}return e}
function makeTower(key,slot){const t={key,d:TOWERS[key],x:slot.x,y:slot.y,lv:1,cd:.3,spent:0,disabled:0,nausea:0,doused:0,shield:0,face:1,anim:0,slot,mode:0,moveT:16,pa:Math.random()*TAU,hitCd:0,robbed:0};
  if(key==='sardine')t.fish=Array.from({length:7},(_,i)=>({x:slot.x,y:slot.y-8,a:i}));slot.tower=t;S.towers.push(t);return t}
const tLvlMeta=k=>S.kind==='def'?1+.1*((save.emp[k]||1)-1):1;
const tRange=t=>t.d.range*(1+.08*(t.lv-1))*(S.kind==='def'?S.mods.range*(t.key==='rana'?S.mods.light:1):1);
const tDmg=t=>t.d.dmg*(1+.45*(t.lv-1))*(S.kind==='def'?S.mods.dmg[t.key]*S.mods.all*tLvlMeta(t.key):S.ai.dmg);
function tRateMul(t){let m=S.kind==='def'?S.mods.rate:S.ai.rate;
  for(const o of S.towers)if(o.key==='lanterna'&&o!==t&&!(o.disabled>0)&&Math.hypot(o.x-t.x,o.y-t.y)<tRange(o)){m*=1.3;break}
  if(t.nausea>0)m*=.5;for(const e of S.enemies)if(e.type==='chirurgo'&&Math.hypot(e.x-t.x,e.y-t.y)<62){m*=.6;break}return m}
const hireCost=k=>Math.round(TOWERS[k].cost*S.mods.hireDisc);
const upCost=t=>Math.round(TOWERS[t.key].cost*.75*t.lv*S.mods.upDisc);

/* ---------- luce e visibilità ---------- */
function computeLights(){const Ls=[{x:180,y:478,r:95}],lm=S.kind==='def'?S.mods.light:1;
  for(const t of S.towers){if(t.key==='rana'&&!(t.doused>0)&&!(t.disabled>0))Ls.push({x:t.x+12*t.face,y:t.y-30,r:tRange(t),lure:1});if(t.key==='lanterna'&&!(t.doused>0))Ls.push({x:t.x,y:t.y,r:50*lm})}
  for(const g of WORLD.glows)Ls.push({x:g.x,y:g.y,r:g.r*.8,a:.7});
  WORLD.vents.forEach((v,i)=>Ls.push({x:v[0],y:v[1],r:WORLD.ventT[i]>7?75:45,a:.8}));
  for(const e of S.enemies){if(e.type==='vipera')Ls.push({x:e.x+10*e.face,y:e.y-14,r:28,a:.8});if(e.type==='lanternaGigante'&&!e.lureOff)Ls.push({x:e.x+30*e.face,y:e.y-46,r:85})}
  for(const f of S.fx)if(f.light)Ls.push({x:f.x,y:f.y,r:f.r*1.5,a:1-f.t/f.dur});S.lights=Ls}
const darkLvl=()=>Math.max(WORLD.floor.dark,S.blackout>0?.9:0);
function inLight(x,y,lureOnly){for(const l of S.lights){if(lureOnly&&!l.lure)continue;if(Math.hypot(l.x-x,l.y-y)<l.r*.8)return true}return false}
function inKelp(e){for(const k of WORLD.kelp)if(Math.hypot(k[0]-e.x,k[1]-e.y)<k[2])return true;return false}
function canSee(t,e,aoe){if(e.dead||e.disg)return false;if(!aoe&&inKelp(e))return false;const dk=darkLvl(),dd=Math.hypot(t.x-e.x,t.y-e.y);
  if(e.d.stealth)return dd<(dk<.3?70:45)||inLight(e.x,e.y,true);
  if(e.d.stealthBoss&&e.lureOff)return dd<55||inLight(e.x,e.y,true);
  if(dk<.3)return true;return dd<58||inLight(e.x,e.y)}
const prog=e=>e.pd/e.path.len;
function targets(t,R,aoe){return S.enemies.filter(e=>!e.dead&&Math.hypot(e.x-t.x,e.y-t.y)<=R+e.r*.5&&canSee(t,e,aoe)).sort((a,b)=>prog(b)-prog(a))}

/* ---------- danni ---------- */
function fx(o){S.fx.push(Object.assign({t:0},o))}
function text(x,y,s,col,dur=1){fx({k:'text',x,y,s,col,dur})}
function hurt(e,dmg,o={}){if(e.dead)return;let d=dmg;
  if(e.d.armor&&!o.boom)d*=.35;
  if(e.type==='riccio'&&o.src){const vx=o.src.x-e.x,vy=o.src.y-e.y,l=Math.hypot(vx,vy)||1;if((e.dirx*vx+e.diry*vy)/l>.35)d*=.3}
  if(S.lights.length&&inLight(e.x,e.y,true))d*=1.15;
  if(S.kind==='def'&&S.mgr==='squalo'&&o.src&&Math.random()<.15){d*=2.5;text(e.x,e.y-e.r-14,'CRIT!','#e8c14a',.7)}
  e.hp-=d;e.hitT=.12;
  if(o.src&&o.src.key&&T-(e.lastFx||0)>.09){e.lastFx=T;const col=HITCOL[o.src.key]||'#fff';fx({k:'hit',x:e.x+(Math.random()-.5)*6,y:e.y-4+(Math.random()-.5)*6,dur:.22,col,big:d>=20});
    if(d>=24&&Math.random()<.35)fx({k:'pow',x:e.x,y:e.y-e.r-6,dur:.5,s:pick(POW),col})}
  if(e.hp<=0)kill(e)}
const HITCOL={granchio:'#ff8a5c',squalo:'#ffffff',spada:'#d8ecff',medusa:'#f7e35a',gamberetto:'#9ef7ff',palla:'#f2d54a',calamaro:'#b48ad8',tartaruga:'#b8e04a',sardine:'#c3d2d8',polipetto:'#ffb04a',manta:'#8fc6ea',paguro:'#f1dca2',balena:'#9fd6e8'};
const POW=['POW!','SBAM!','CRUNCH!','ZAC!','GNAM!','BONK!','SPLAT!'];
function kill(e){e.dead=true;
  if(S.kind==='def'){const g=Math.round(e.reward*S.mods.perle);S.perle+=g;S.earned+=g;sfx('coin');text(e.x,e.y-12,'+'+g,'#f1dca2',.9)}else S.ai.budget+=e.reward*.5;
  fx({k:'splat',x:e.x,y:e.y,dur:.45,r:e.r});
  if(e.type==='stella'){const pi=WORLD.paths.indexOf(e.path);for(let k=0;k<5;k++)spawnEnemy('stellina',{path:pi,pd:Math.max(0,e.pd-8+k*4),hpMul:S.kind==='def'?S.hpMul:S.mm.hp})}
  if(e===S.boss){S.boss=null;musicMode=0;sfx('boom');S.shake=.5;fx({k:'ring',x:e.x,y:e.y,r:70,dur:.6,col:'#e8c14a',light:1});
    if(S.kind==='def')text(e.x,e.y-30,pick(['Recensione: 5 stelle!','Servito!','Fuori dal menu!','Conto pagato!']),'#e8c14a',1.8)}}
function reachBase(e){if(S.kind==='def'){S.hp-=e.dmg;S.floorHit=true;S.shake=.3;sfx('hurt');text(180,462,'-'+e.dmg,'#ff4f5e',1)}
  else{const d=Math.round((e.d.boss?12:e.dmg*3)*S.mm.bite);S.baseHp-=d;S.dealt+=d;S.shake=.25;sfx('bite');text(180,462,'-'+d,'#b8e04a',1)}
  if(e===S.boss){S.boss=null;musicMode=0}}
function disableT(t,s,msg,col){if(t.shield>0){text(t.x,t.y-24,'Protetto!','#b8e04a',.8);return}t.disabled=Math.max(t.disabled,s);if(msg)text(t.x,t.y-24,msg,col||'#ff4f5e',1.2)}
const near=(e,r)=>S.towers.filter(t=>Math.hypot(t.x-e.x,t.y-e.y)<r);
function erupt(i){const[x,y]=WORLD.vents[i];sfx('vent');S.shake=.25;fx({k:'ring',x,y,r:50,dur:.6,col:'#ff8a2a',light:1});
  for(const e of S.enemies)if(Math.hypot(e.x-x,e.y-y)<50){e.pd=Math.max(0,e.pd-(e.d.boss?20:55));e.stun=Math.max(e.stun,.5)}
  for(const t of S.towers)if(Math.hypot(t.x-x,t.y-y)<52)disableT(t,1.6,'Scottato!','#ff8a2a')}

/* ---------- abilità dei nemici ---------- */
function abilities(e,dt){switch(e.type){
  case'ladro':if(!e.stole){const o=S.towers.find(t=>t.key==='ostrica'&&Math.hypot(t.x-e.x,t.y-e.y)<58);if(o){e.stole=1;e.speed*=1.5;o.robbed=1;sfx('nope');
    if(S.kind==='def'){const g=Math.min(S.perle,15);S.perle-=g;text(e.x,e.y-16,'-'+g+' perle!','#ff4f5e',1)}else{S.ai.budget=Math.max(0,S.ai.budget-30);text(e.x,e.y-16,'Rubato!','#b8e04a',1)}}}break;
  case'nudi':for(const t of near(e,44))if(!(t.shield>0)){if(!(t.nausea>0))text(t.x,t.y-24,'Nausea','#b8e04a',.8);t.nausea=2}if(Math.random()<dt*5)fx({k:'slime',x:e.x,y:e.y+6,dur:2.5});break;
  case'vipera':e.abT-=dt;if(e.abT<=0){e.abT=5;let hit=0;for(const t of near(e,95))if(t.key==='rana'||t.key==='lanterna'){t.doused=3;hit=1;text(t.x,t.y-24,'Luce spenta!','#7af0ff',1)}if(hit)sfx('zap')}break;
  case'martello':e.dashT-=dt;if(e.dashT<=0){e.dashT=4;e.dash=.8}break;
  case'reAragosta':e.abT-=dt;if(e.abT<=0){e.abT=6;const c=near(e,190).filter(t=>t.disabled<=0);if(c.length){const t=pick(c);disableT(t,3.5,'BOCCIATO!');fx({k:'zap',pts:[[e.x,e.y-20],[t.x,t.y]],dur:.35,col:'#e8c14a'});sfx('nope')}}break;
  case'granchioReale':e.abT-=dt;if(e.abT<=0){e.abT=7;for(const t of near(e,95).slice(0,2))disableT(t,2,'SCHIACCIATO!');S.shake=.3;sfx('boom');fx({k:'ring',x:e.x,y:e.y,r:95,dur:.5,col:'#ff4f5e'})}break;
  case'kraken':e.abT-=dt;if(e.abT<=0){e.abT=6.5;for(const t of shuffle(S.towers.filter(t=>t.disabled<=0)).slice(0,2)){disableT(t,4,'AFFERRATO!');if(!(t.shield>0))fx({k:'tentacle',x:t.x,y:t.y,dur:4})}sfx('bite')}break;
  case'lanternaGigante':e.abT-=dt;if(e.abT<=0){if(e.lureOff){e.lureOff=0;e.abT=7}else{e.lureOff=1;e.abT=4;S.blackout=4;text(e.x,e.y-40,'BUIO!','#7af0ff',1.4);sfx('boss')}}break;
  case'leviatano':{const tail=e.path.at(e.pd-45);for(const t of S.towers){if(t.shield>0)continue;if(Math.hypot(t.x-e.x,t.y-e.y)<54||Math.hypot(t.x-tail.x,t.y-tail.y)<48){if(t.disabled<=0)text(t.x,t.y-24,'Travolto!','#ff4f5e',.8);t.disabled=Math.max(t.disabled,.6)}}}break;
  case'megalodonte':if(!e.rage&&e.hp<e.max*.5){e.rage=1;text(e.x,e.y-34,'FURIA!','#ff4f5e',1.5);sfx('boss');S.shake=.5}
    e.dashT-=dt;if(e.dashT<=0){e.dashT=e.rage?3.5:5;e.dash=1}
    e.abT-=dt;if(e.abT<=0){e.abT=e.rage?2.5:4;const t=near(e,78).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];if(t){disableT(t,5,'MORSO!');sfx('bite');fx({k:'bite',x:t.x,y:t.y,dur:.3})}}break}}
function updEnemy(e,dt){if(e.dead)return;e.hitT=Math.max(0,e.hitT-dt);
  let sp=e.speed*(S.kind==='def'?S.mods.enemySpeed:S.mm.speed);
  if(e.slow>0){e.slow-=dt;if(!e.d.noSlow)sp*=.5}if(e.dash>0){e.dash-=dt;sp*=3}if(e.rage)sp*=1.4;
  if(e.stun>0){e.stun-=dt;sp=0}if(S.freezeT>0)sp=0;
  if(e.conf>0){e.conf-=dt;e.pd=Math.max(0,e.pd-sp*.7*dt)}else e.pd+=sp*dt;
  const p=e.path.at(e.pd);e.x=p.x;e.y=p.y;e.dirx=p.dx;e.diry=p.dy;if(p.dx>.1)e.face=1;else if(p.dx<-.1)e.face=-1;
  if(e.disg&&e.pd>e.path.len-140){e.disg=false;text(e.x,e.y-16,'SORPRESA!','#ff4f5e',1);sfx('nope')}
  if(!e.d.fly)for(let i=S.plates.length-1;i>=0;i--){const pl=S.plates[i];if(Math.hypot(pl.x-e.x,pl.y-e.y)<14){S.plates.splice(i,1);
    if(e.type==='granchioReale'){e.hp=Math.min(e.max*1.5,e.hp+e.max*.08);e.grow=Math.min(1.5,e.grow+.08);text(e.x,e.y-34,'SLURP! Cresce','#ff4f5e',1);sfx('gulp');break}
    e.stun=Math.max(e.stun,e.d.boss?.5:1.3);sfx('trap');fx({k:'ring',x:pl.x,y:pl.y,r:26,dur:.45,col:'#ffffff'});text(pl.x,pl.y-14,'GNAM!','#ffffff',.8);hurt(e,45);break}}
  if(!e.dead)abilities(e,dt);
  if(!e.dead&&e.pd>=e.path.len){e.dead=true;reachBase(e)}}

/* ---------- comportamento dei dipendenti ---------- */
function updTower(t,dt){t.anim=Math.max(0,t.anim-dt);t.atk=Math.max(0,(t.atk||0)-dt);t.shield=Math.max(0,t.shield-dt);t.nausea=Math.max(0,t.nausea-dt);t.doused=Math.max(0,t.doused-dt);
  if(t.key==='manta'){t.pa+=dt*1.7*(t.disabled>0?0:1);t.mx=t.x+Math.cos(t.pa)*46;t.my=t.y+Math.sin(t.pa)*30}
  if(t.fish){const tg=t.tg&&!t.tg.dead?t.tg:null;t.fish.forEach((f,i)=>{const a=T*3+i*.9,hx=tg?tg.x+Math.cos(a)*9:t.x+Math.cos(a)*10,hy=tg?tg.y+Math.sin(a)*7:t.y-8+Math.sin(a)*6;const dx=hx-f.x,dy=hy-f.y;f.x+=dx*Math.min(1,dt*5);f.y+=dy*Math.min(1,dt*5);f.a=Math.atan2(dy,dx)})}
  if(t.disabled>0){t.disabled-=dt;return}
  const k=t.d.kind,R=tRange(t),rm=tRateMul(t);
  if(k==='light'||k==='buff'||k==='bank')return;
  if(k==='heal'){t.cd-=dt*rm;if(t.cd>0)return;t.cd=t.d.rate;let any=0;for(const o of S.towers){if(o===t||Math.hypot(o.x-t.x,o.y-t.y)>R)continue;if(o.disabled>0||o.nausea>0||o.doused>0){o.disabled=0;o.nausea=0;o.doused=0;any=1;text(o.x,o.y-24,'Curato!','#b8e04a',.8)}o.shield=Math.max(o.shield,1.6)}
    if(any){sfx('heal');fx({k:'heal',x:t.x,y:t.y,r:R,dur:.6});t.atk=.3;t.ax=0;t.ay=-1}return}
  if(k==='patrol'){t.hitCd-=dt*rm;if(t.hitCd>0)return;t.hitCd=t.d.rate;const p={x:t.mx,y:t.my,key:'manta'};for(const e of S.enemies)if(!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<16+e.r*.5&&canSee(t,e,true)){hurt(e,tDmg(t),{src:p});t.atk=.3;t.ax=0;t.ay=0}return}
  if(k==='mobile'){t.moveT-=dt;if(t.moveT<=0){t.moveT=16;const free=WORLD.slots.filter(s=>!s.tower);if(free.length){const ns=pick(free.slice(0,6));t.slot.tower=null;ns.tower=t;t.slot=ns;t.x=ns.x;t.y=ns.y;t.mode^=1;text(t.x,t.y-26,'Trasloco!','#f1dca2',1);fx({k:'ring',x:t.x,y:t.y,r:24,dur:.4,col:'#f1dca2'})}}}
  t.cd-=dt*rm;
  if(k==='swarm'){const list=targets(t,R,false);t.tg=list[0]||null;if(t.cd>0||!t.tg)return;t.cd=t.d.rate;hurt(t.tg,tDmg(t),{src:t});if(Math.random()<.3)sfx('bite');return}
  if(t.cd>0)return;
  const aoe=k==='burst'||k==='stun'||k==='gulp';const list=targets(t,R,aoe);if(!list.length)return;
  const tg=list[0];t.face=tg.x<t.x?-1:1;t.cd=t.d.rate;const D=tDmg(t);{const dx=tg.x-t.x,dy=tg.y-t.y,l=Math.hypot(dx,dy)||1;t.ax=dx/l;t.ay=dy/l;t.atk=.3}
  switch(k){
    case'proj':S.shots.push({x:t.x+t.face*14,y:t.y-20,tg,dmg:D,src:t,a:0});sfx('throw');break;
    case'mobile':if(t.mode){beam(t,tg,R,D*1.1)}else S.shots.push({x:t.x,y:t.y-16,tg,dmg:D*1.2,src:t,a:0});sfx('throw');break;
    case'bite':t.anim=.22;hurt(tg,D,{src:t});sfx('bite');fx({k:'bite',x:tg.x,y:tg.y,dur:.25});break;
    case'pierce':t.anim=.25;beam(t,tg,R,D);sfx('pierce');break;
    case'chain':{const hit=[tg];let last=tg;const n=3+(S.kind==='def'?S.mods.chain:0);
      while(hit.length<n){const nx=S.enemies.filter(e=>!e.dead&&!hit.includes(e)&&Math.hypot(e.x-last.x,e.y-last.y)<65&&canSee(t,e,true)).sort((a,b)=>Math.hypot(a.x-last.x,a.y-last.y)-Math.hypot(b.x-last.x,b.y-last.y))[0];if(!nx)break;hit.push(nx);last=nx}
      sfx('zap');fx({k:'zap',pts:[[t.x,t.y-8],...hit.map(e=>[e.x,e.y])],dur:.2,col:'#f7e35a',light:0});for(const e of hit){e.slow=2;hurt(e,D,{src:t})}break}
    case'stun':t.anim=.3;sfx('shot');fx({k:'ring',x:tg.x,y:tg.y,r:42,dur:.35,col:'#9ef7ff',light:1});for(const e of S.enemies)if(!e.dead&&Math.hypot(e.x-tg.x,e.y-tg.y)<42+e.r*.4&&canSee(t,e,true)){e.stun=Math.max(e.stun,e.d.boss?.15:.7);hurt(e,D,{src:t,boom:1})}break;
    case'burst':t.anim=.6;sfx('pop');fx({k:'ring',x:t.x,y:t.y,r:R,dur:.4,col:'#f2d54a'});for(const e of list)hurt(e,D,{src:t,boom:1});break;
    case'ink':sfx('ink');S.clouds.push({x:tg.x,y:tg.y,r:40,t:3.2,id:Math.random()});break;
    case'hold':{const h=list.find(e=>!e.d.fly&&!e.d.boss);if(!h){t.cd=.4;return}h.stun=Math.max(h.stun,1.6);hurt(h,D,{src:t});t.anim=.5;text(h.x,h.y-h.r-10,'Assaggia!','#f1dca2',.7);sfx('bite');break}
    case'gulp':t.anim=.9;sfx('gulp');S.shake=.3;fx({k:'ring',x:t.x,y:t.y,r:R,dur:.6,col:'#9fd6e8'});text(t.x,t.y-34,'GLOM!','#9fd6e8',1);for(const e of list)hurt(e,e.d.boss?D*.3:D,{src:t,boom:1});break;
    case'random':{const r=Math.random();
      if(r<.45){S.shots.push({x:t.x,y:t.y-14,tg,dmg:6+Math.random()*26,src:t,a:0});sfx('throw')}
      else if(r<.6){tg.stun=Math.max(tg.stun,tg.d.boss?.3:1.2);text(tg.x,tg.y-tg.r-10,'Inciampa!','#f1dca2',.8)}
      else if(r<.74){if(S.kind==='def'){S.perle+=4;S.earned+=4}text(t.x,t.y-24,'Mancia +4','#f1dca2',.8)}
      else if(r<.84){tg.hp=Math.min(tg.max,tg.hp+10);text(t.x,t.y-24,'Ops!','#ff4f5e',.8)}
      else{hurt(tg,60,{src:t});text(t.x,t.y-24,'GENIO!','#e8c14a',.9);sfx('pop')}break}}}
function beam(t,tg,R,D){const dx=tg.x-t.x,dy=tg.y-t.y,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,len=R*1.15;
  for(const e of S.enemies){if(e.dead)continue;const px=e.x-t.x,py=e.y-t.y,along=px*ux+py*uy;if(along<0||along>len)continue;if(Math.abs(px*uy-py*ux)<12+e.r*.5&&canSee(t,e,false))hurt(e,D,{src:t})}
  fx({k:'beam',x:t.x,y:t.y-6,x2:t.x+ux*len,y2:t.y-6+uy*len,dur:.18})}
function updShots(dt){for(const s of S.shots){if(s.tg.dead){s.done=true;continue}const dx=s.tg.x-s.x,dy=s.tg.y-s.y,d=Math.hypot(dx,dy);s.a=Math.atan2(dy,dx);
    if(d<9){hurt(s.tg,s.dmg,{src:s.src||s,boom:s.torp});if(s.torp){fx({k:'ring',x:s.x,y:s.y,r:30,dur:.4,col:'#ffb04a',light:1});sfx('boom')}s.done=true}
    else{const sp=s.torp?230:290;s.x+=dx/d*sp*dt;s.y+=dy/d*sp*dt}}S.shots=S.shots.filter(s=>!s.done)}

/* ---------- ciclo ---------- */
const snow=Array.from({length:60},()=>({x:Math.random()*W,y:Math.random()*H,r:.6+Math.random()*1.6,v:4+Math.random()*9,b:Math.random()<.2}));
function update(dt){
  for(const b of snow){b.y+=b.b?-b.v*1.6*dt:b.v*dt;b.x+=Math.sin(T*1.5+b.r*5)*.12;if(b.y>V.y1+5||b.y<V.y0-5||b.x<V.x0-5||b.x>V.x1+5){b.x=V.x0+Math.random()*V.w;b.y=b.b?V.y1+4:V.y0-4}}
  for(const f of S.fx)f.t+=dt;S.fx=S.fx.filter(f=>f.t<f.dur);if(S.shake>0)S.shake-=dt;
  if(S.mode!=='wave'&&S.mode!=='build'&&S.mode!=='mplay')return;
  computeLights();if(S.blackout>0)S.blackout-=dt;if(S.freezeT>0)S.freezeT-=dt;
  if(S.mode!=='build')WORLD.ventT.forEach((v,i)=>{let t=v+dt;if(t>=9){t=0;erupt(i)}WORLD.ventT[i]=t});
  if(S.mode==='wave'){S.spawnT-=dt;while(S.spawnT<=0&&S.queue.length){const[ty,g]=S.queue.shift();spawnEnemy(ty,{hpMul:ENEMIES[ty].boss?bossMul():S.hpMul});S.spawnT+=g}}
  if(S.mode==='mplay'){updMonster(dt);if(S.mode!=='mplay')return}
  for(const e of S.enemies)updEnemy(e,dt);
  for(const c of S.clouds){c.t-=dt;for(const e of S.enemies)if(!e.dead&&Math.hypot(e.x-c.x,e.y-c.y)<c.r){if(!e.d.boss&&!e.seen.has(c.id)){e.seen.add(c.id);e.conf=1.3}hurt(e,4*dt)}}
  S.clouds=S.clouds.filter(c=>c.t>0);S.enemies=S.enemies.filter(e=>!e.dead);
  for(const t of S.towers)updTower(t,dt);updShots(dt);
  if(S.kind==='def'&&S.mgr==='nonno'&&S.mode==='wave'){S.torpT-=dt;if(S.torpT<=0){S.torpT=6;const tg=S.enemies.filter(e=>!e.disg).sort((a,b)=>prog(b)-prog(a))[0];if(tg){S.shots.push({x:292,y:476,tg,dmg:80*(1+.3*S.depth),torp:1,a:0});sfx('shot')}}}
  if(S.kind==='def'){if(S.hp<=0){S.hp=0;endRun(false);return}if(S.mode==='wave'&&!S.queue.length&&!S.enemies.length)waveClear()}}

function endRun(win){if(S.mode==='end')return;S.mode='end';musicMode=0;sfx(win?'win':'lose');
  let earned=S.kind==='mon'?Math.round(S.dealt*3+S.earned+(win?200:0)):Math.round(S.earned*.35+(win?150:0));if(S.daily&&win&&save.dailyDone!==S.daily){earned*=2;save.stars+=3;save.dailyDone=S.daily;S.dailyWon=1}save.perle+=earned;save.runs++;if(win)save.wins++;
  const score=S.kind==='mon'?S.round+(win?1:0):S.run==='inf'?S.total:S.fi+(win?1:0);save.best[S.run]=Math.max(save.best[S.run]||0,score);writeSave();ui.showEnd(win,earned)}
function quitRun(){if(S&&S.mode!=='end'&&S.mode!=='menu'){const earned=S.kind==='mon'?Math.round(S.dealt*3+S.earned):Math.round(S.earned*.35);if(earned>0){save.perle+=earned;writeSave()}}}

/* ---------- disegno ---------- */
function drawSlot(c,s,hi){
  E(c,s.x,s.y+4,18,8);c.fillStyle='rgba(5,15,15,.35)';c.fill();E(c,s.x,s.y+1.5,17,8.5);FS(c,'#4c4a3e',2);E(c,s.x,s.y-1,17,8.5);FS(c,'#6d6956',2);
  E(c,s.x,s.y-1.5,11.5,5);c.strokeStyle='rgba(20,15,10,.45)';c.lineWidth=1.2;c.stroke();L(c,s.x-12,s.y-3,s.x-6,s.y+1,'rgba(20,15,10,.5)',1);L(c,s.x+7,s.y-5,s.x+12,s.y-2,'rgba(20,15,10,.5)',1);
  if(hi){const a=.5+.5*Math.sin(T*6);E(c,s.x,s.y-1,19,10);c.strokeStyle='rgba(241,220,162,'+(.45+a*.5)+')';c.lineWidth=2.2;c.stroke();if(!s.tower){L(c,s.x-4,s.y-1.5,s.x+4,s.y-1.5,'#f1dca2',2.2);L(c,s.x,s.y-5,s.x,s.y+2,'#f1dca2',2.2)}}}
function drawTower(c,t){if(t.disabled>0)c.globalAlpha=.45;
  const a=t.key==='palla'?Math.sin(Math.min(1,t.anim/.6)*Math.PI):t.key==='squalo'?Math.sin(t.anim/.22*Math.PI):t.key==='balena'?Math.sin(Math.min(1,t.anim/.9)*Math.PI):t.key==='spada'?Math.sin(t.anim/.25*Math.PI):t.key==='gamberetto'?t.anim*2:t.key==='ostrica'?.5+t.anim*.5:0;
  if(t.key==='sardine'){for(const f of t.fish)drawSardine(c,f.x,f.y,f.a,1)}
  else if(t.key==='manta'){E(c,t.x,t.y,46,30);c.strokeStyle='rgba(241,220,162,.12)';c.lineWidth=1;c.setLineDash([3,5]);c.stroke();c.setLineDash([]);DRAW_T.manta(c,t.mx||t.x,(t.my||t.y)-6,1,Math.sin(t.pa)>0?-1:1,T,0,t)}
  else{const p=t.atk>0?1-t.atk/.3:0,k=Math.sin(p*Math.PI),off=k*6;c.save();if(k>0){c.translate((t.ax||0)*off,(t.ay||0)*off*.6);c.translate(t.x,t.y);c.scale(1+.14*k,1-.1*k);c.translate(-t.x,-t.y)}
    DRAW_T[t.key](c,t.x,t.y-8,1,t.face,T,Math.max(a,t.key==='gamberetto'||t.key==='squalo'||t.key==='spada'?k:0),t);c.restore();
    if(k>.2&&(t.key==='rana'||t.key==='lanterna'))glowAt(c,t.x,t.y-20,30,'rgba(255,240,150,A)',.4*k)}
  c.globalAlpha=1;
  for(let k=0;k<t.lv;k++){E(c,t.x-(t.lv-1)*5+k*10,t.y+10,3,3);FS(c,'#f1dca2',1.4)}
  const tag=(s,col)=>{c.font='15px Bangers,Impact,sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle=INK;const yy=t.y-30-Math.sin(T*3)*2;c.strokeText(s,t.x+12,yy);c.fillStyle=col;c.fillText(s,t.x+12,yy)};
  if(t.disabled>0)tag('zzz','#fff');else if(t.nausea>0)tag('@','#b8e04a');if(t.shield>0){E(c,t.x,t.y-6,20,20);c.strokeStyle='rgba(184,224,74,'+(.3+.2*Math.sin(T*8))+')';c.lineWidth=2;c.stroke()}}
function drawEnemy(c,e){E(c,e.x,e.y+e.r+1,e.r,3.5);c.fillStyle='rgba(5,15,15,.3)';c.fill();
  const ghost=(e.d.stealth&&!inLight(e.x,e.y,true))||(e.d.stealthBoss&&e.lureOff&&!inLight(e.x,e.y,true));if(ghost)c.globalAlpha=.28;
  if(e.hitT>0)c.filter='brightness(1.9)';const y=e.y+Math.sin(T*6+e.pd*.1)*1.2;
  DRAW_E[e.type](c,e.x,y,1,e.face,T,e);c.filter='none';c.globalAlpha=1;
  if(e.slow>0&&!e.d.noSlow){E(c,e.x,e.y,e.r+4,e.r+4);c.fillStyle='rgba(247,227,90,.13)';c.fill()}
  if(e.stun>0||e.conf>0){c.font='15px Bangers,Impact,sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle=INK;const s=e.conf>0?'???':'?!';c.strokeText(s,e.x,e.y-e.r-8);c.fillStyle='#fff';c.fillText(s,e.x,e.y-e.r-8)}
  if(!e.d.boss&&e.hp<e.max&&!ghost&&!e.disg){const w=e.r*2;c.fillStyle=INK;c.fillRect(e.x-w/2-1,e.y-e.r-7,w+2,5.5);c.fillStyle=S.kind==='mon'?'#ff9a4a':'#b8e04a';c.fillRect(e.x-w/2,e.y-e.r-6,w*Math.max(0,e.hp/e.max),3.5)}}
function drawBase(c){const dc=DECOS[S.kind==='def'?save.deco:0]||DECOS[0];
  drawOcto(c,180,474,1.05,T);
  if(S.kind==='def'&&S.mgr!=='polpo'&&S.mgr!=='nonno')DRAW_M[S.mgr](c,256,480,.75,T);
  if(S.kind==='def'&&S.mgr==='nonno')drawSub(c,292,478,1,-1,T);
  for(const lx of[136,224]){const ax=lx+(lx<180?-9:9),ly=474+Math.sin(T*1.6+lx)*1.5;L(c,lx,500,lx,458,INK,4);L(c,lx,500,lx,458,dc.wood,2.2);L(c,lx,460,ax,458,INK,3.4);L(c,lx,460,ax,458,dc.wood,1.8);
    const fl=.75+.25*Math.sin(T*9+lx)*Math.sin(T*3.7);glowAt(c,ax,ly,40,'rgba(255,170,80,A)',.5*fl);
    L(c,ax,458,ax,ly-8,INK,1);E(c,ax,ly,7,9.5);FS(c,'#c9402a',1.6);for(const o of[2.5,5]){c.beginPath();c.ellipse(ax,ly,o,9.5,0,0,TAU);c.strokeStyle='rgba(60,10,5,.5)';c.lineWidth=.7;c.stroke()}
    E(c,ax,ly,3.5,5);c.fillStyle='rgba(255,220,140,'+(.5*fl)+')';c.fill();c.fillStyle=INK;c.fillRect(ax-4,ly-11,8,2.4);c.fillRect(ax-4,ly+8.6,8,2.4)}
  c.beginPath();c.roundRect(108,500,144,30,6);FS(c,dc.wood,2.2);c.beginPath();c.roundRect(103,493,154,12,5);FS(c,'#8f5f3d',2.2);
  for(let k=0;k<4;k++)L(c,120+k*36,508,128+k*36,526,'rgba(20,10,5,.4)',1);for(let k=0;k<5;k++)drawNigiri(c,128+k*26,490,.9);
  if(save.deco&&S.kind==='def')glowAt(c,180,518,46,hexA(dc.sign),.25+.1*Math.sin(T*4));
  c.font='15px Bangers,Impact,sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle=INK;c.strokeText('SUSHI BAR',180,523);c.fillStyle=dc.sign;c.fillText('SUSHI BAR',180,523);
  if(S.kind==='mon'&&S.mode!=='menu'){const w=120;c.fillStyle=INK;c.fillRect(180-w/2-2,532,w+4,9);c.fillStyle='#ff6a3d';c.fillRect(180-w/2,534,w*Math.max(0,S.baseHp/S.baseMax),5)}}
function render(){const c=ctx;c.setTransform(DPR,0,0,DPR,0,0);
  const sx=S.shake>0?(Math.random()-.5)*6:0,sy=S.shake>0?(Math.random()-.5)*6:0;
  c.drawImage(WORLD.bg,sx,sy,VW,VH);c.setTransform(SC*DPR,0,0,SC*DPR,(OX+sx)*DPR,(OY+sy)*DPR);
  drawAmbient(c);
  for(const f of S.fx)if(f.k==='slime'){E(c,f.x,f.y,6,3);c.fillStyle='rgba(184,224,74,'+(.35*(1-f.t/f.dur))+')';c.fill()}
  const tool=S.tool&&S.tool!=='trap';
  for(const s of WORLD.slots)drawSlot(c,s,(tool&&!s.tower)||s===S.selSlot);
  for(const p of S.plates)drawPlate(c,p.x,p.y,.8);
  for(const cl of S.clouds){c.globalAlpha=Math.min(1,cl.t)*.8;for(let k=0;k<6;k++){E(c,cl.x+Math.cos(k*1.1+T)*cl.r*.45,cl.y+Math.sin(k*1.7+T)*cl.r*.3,cl.r*.45,cl.r*.32);c.fillStyle='#120a14';c.fill()}c.globalAlpha=1}
  const showR=(x,y,r)=>{c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle='rgba(241,220,162,.1)';c.fill();c.setLineDash([5,5]);c.strokeStyle='rgba(241,220,162,.75)';c.lineWidth=1.6;c.stroke();c.setLineDash([])};
  if(S.sel)showR(S.sel.x,S.sel.y,tRange(S.sel));
  let ghost=null;if(tool&&S.hover){ghost=ui.nearSlot(S.hover,30);if(ghost&&ghost.tower)ghost=null;if(ghost)showR(ghost.x,ghost.y,TOWERS[S.tool].range*S.mods.range)}
  if(S.tool==='trap'&&S.hover){c.globalAlpha=.6;drawPlate(c,S.hover.x,S.hover.y,.8);c.globalAlpha=1}
  const things=[...S.towers.map(t=>({y:t.y,f:()=>drawTower(c,t)})),...S.enemies.map(e=>({y:e.y,f:()=>drawEnemy(c,e)}))].sort((a,b)=>a.y-b.y);for(const o of things)o.f();
  for(const k of WORLD.kelp)drawKelpPatch(c,k);
  if(ghost){c.globalAlpha=.55;DRAW_T[S.tool](c,ghost.x,ghost.y-8,1,1,T,0,{});c.globalAlpha=1}
  for(const s of S.shots){if(s.torp)drawTorpedo(c,s.x,s.y,s.a);else{c.save();c.translate(s.x,s.y);c.rotate(T*14);drawNigiri(c,0,0,.9);c.restore()}}
  for(const f of S.fx)if(f.k==='tentacle')drawTentacle(c,f.x+10,f.y+2,1,T);
  drawBase(c);
  for(const b of snow){c.beginPath();c.arc(b.x,b.y,b.r,0,TAU);if(b.b){c.strokeStyle='rgba(230,250,240,.45)';c.lineWidth=1;c.stroke()}else{c.fillStyle=WORLD.floor.dark>.3?'rgba(160,240,255,.5)':'rgba(230,240,220,.4)';c.fill()}}
  drawManta(c);
  if(S.mode!=='menu'){computeLightsIfIdle();drawDarkness(c,darkLvl(),S.lights)}else drawDarkness(c,WORLD.floor.dark*.7,[{x:180,y:478,r:140}]);
  c.setTransform(SC*DPR,0,0,SC*DPR,(OX+sx)*DPR,(OY+sy)*DPR);
  if(S.freezeT>0){c.fillStyle='rgba(190,235,255,'+(.12+.05*Math.sin(T*6))+')';c.fillRect(V.x0,V.y0,V.w,V.h)}
  for(const f of S.fx){const a=1-f.t/f.dur;
    if(f.k==='text'){c.globalAlpha=Math.min(1,a*1.6);c.font='18px Bangers,Impact,sans-serif';c.textAlign='center';c.lineWidth=3.5;c.strokeStyle=INK;c.strokeText(f.s,f.x,f.y-f.t*28);c.fillStyle=f.col;c.fillText(f.s,f.x,f.y-f.t*28)}
    else if(f.k==='ring'){c.globalAlpha=a;c.beginPath();c.arc(f.x,f.y,f.r*(.4+.6*(1-a)),0,TAU);c.strokeStyle=f.col;c.lineWidth=3;c.stroke()}
    else if(f.k==='heal'){c.globalAlpha=a;for(let k=0;k<8;k++){const an=k/8*TAU+f.t*3,r=f.r*.5*(1-a)+10;c.font='14px Bangers,Impact';c.fillStyle='#b8e04a';c.fillText('+',f.x+Math.cos(an)*r,f.y+Math.sin(an)*r)}}
    else if(f.k==='bite'){c.globalAlpha=a;for(const i of[-1,1]){c.beginPath();c.arc(f.x,f.y+i*3,10,i>0?Math.PI*1.15:Math.PI*.15,i>0?Math.PI*1.85:Math.PI*.85);c.strokeStyle=INK;c.lineWidth=4.5;c.stroke();c.strokeStyle='#fff';c.lineWidth=2.2;c.stroke()}}
    else if(f.k==='zap'){c.globalAlpha=a;c.beginPath();f.pts.forEach(([x,y],i)=>{if(!i)c.moveTo(x,y);else{const[px,py]=f.pts[i-1];c.lineTo((px+x)/2+(Math.random()-.5)*12,(py+y)/2+(Math.random()-.5)*12);c.lineTo(x,y)}});c.strokeStyle=INK;c.lineWidth=4.5;c.stroke();c.strokeStyle=f.col;c.lineWidth=2.2;c.stroke()}
    else if(f.k==='hit'){const r=(f.big?11:8)*(.5+1-a);c.globalAlpha=a;for(let k=0;k<7;k++){const an=k/7*TAU+f.x;L(c,f.x+Math.cos(an)*r*.45,f.y+Math.sin(an)*r*.45,f.x+Math.cos(an)*r,f.y+Math.sin(an)*r,INK,3.4);L(c,f.x+Math.cos(an)*r*.45,f.y+Math.sin(an)*r*.45,f.x+Math.cos(an)*r,f.y+Math.sin(an)*r,f.col,1.8)}E(c,f.x,f.y,r*.3,r*.3);c.fillStyle='#fff';c.fill()}
    else if(f.k==='pow'){const sc=1+Math.sin(Math.min(1,f.t/.12)*Math.PI/2)*.3-f.t*.4;c.globalAlpha=Math.min(1,a*2);c.save();c.translate(f.x,f.y-f.t*16);c.rotate(-.15);c.scale(sc,sc);c.font='17px Bangers,Impact,sans-serif';c.textAlign='center';c.lineWidth=4;c.strokeStyle=INK;c.strokeText(f.s,0,0);c.fillStyle=f.col;c.fillText(f.s,0,0);c.restore()}
    else if(f.k==='beam'){c.globalAlpha=a;L(c,f.x,f.y,f.x2,f.y2,INK,6);L(c,f.x,f.y,f.x2,f.y2,'#e8f4ff',3)}
    else if(f.k==='splat'){c.globalAlpha=a;for(let k=0;k<6;k++){const an=k/6*TAU+f.x,d=f.r*(.6+1.2*(1-a));E(c,f.x+Math.cos(an)*d,f.y+Math.sin(an)*d,2.4*a+.5,2.4*a+.5);c.fillStyle='#d9e8c9';c.fill()}}
    else if(f.k==='flash'){c.globalAlpha=a*.5;c.fillStyle=f.col||'#8fcf4f';c.fillRect(V.x0,V.y0,V.w,V.h)}
    c.globalAlpha=1}
  if(S.boss){const b=S.boss;c.beginPath();c.roundRect(36,6,288,28,8);FS(c,'rgba(10,5,7,.85)',2);c.fillStyle='#ff4f5e';c.beginPath();c.roundRect(42,23,276*Math.max(0,b.hp/b.max),6,3);c.fill();
    c.fillStyle='#e8c14a';c.font='14px Bangers,Impact,sans-serif';c.textAlign='center';c.fillText((b.d.name+' · '+b.d.title).toUpperCase(),180,19)}}
function computeLightsIfIdle(){if(S.mode!=='wave'&&S.mode!=='build'&&S.mode!=='mplay')computeLights()}
