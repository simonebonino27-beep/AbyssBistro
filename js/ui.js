'use strict';
/* ===== Abyss Bistro: interfaccia, menu, Bistrot, ciclo principale ===== */
const cv=$('game'),ctx=cv.getContext('2d');
const toastEl=$('toast');let toastTimer;
function toast(m){toastEl.textContent=m;toastEl.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('on'),2000)}
const show=(id,on=true)=>{$(id).hidden=!on};
const OVERLAYS=['menu','setup','msetup','hub','pause','cards','floorOv','end'];
const hideAll=()=>OVERLAYS.forEach(id=>show(id,false));
const rarChip=r=>'<span class="chip" style="background:var('+RAR[r].c+')">'+RAR[r].n+'</span>';
const mgrShort={polpo:'Trappole',pagliaccio:'+50% perle',narvalo:'Maledizioni+',gamberi:'Doppia mano',nonno:'Siluri',squalo:'Critici'};

/* ---------- vista ---------- */
function fit(){const a=$('app').getBoundingClientRect();VW=Math.max(1,a.width);VH=Math.max(1,a.height);DPR=Math.min(2,window.devicePixelRatio||1);
  const hudH=$('hud').offsetHeight,barH=Math.max(0,$('bar').offsetHeight-14),avail=Math.max(200,VH-hudH-barH);
  SC=Math.min(VW/W,avail/H);OX=(VW-W*SC)/2;OY=hudH+(avail-H*SC)/2;
  V={x0:-OX/SC,y0:-OY/SC,x1:(VW-OX)/SC,y1:(VH-OY)/SC};V.w=V.x1-V.x0;V.h=V.y1-V.y0;
  cv.style.width=VW+'px';cv.style.height=VH+'px';cv.width=Math.ceil(VW*DPR);cv.height=Math.ceil(VH*DPR);
  CAU.width=110;CAU.height=Math.max(20,Math.round(110*V.h/V.w));
  for(const b of snow){b.x=V.x0+Math.random()*V.w;b.y=V.y0+Math.random()*V.h}
  if(WORLD.floor)buildBG();if(S&&S.sel)openTower(S.sel);else closePanel()}
let rsz;window.addEventListener('resize',()=>{clearTimeout(rsz);rsz=setTimeout(fit,120)});

/* ---------- input sul campo ---------- */
function toLogical(ev){const r=cv.getBoundingClientRect();return{x:(ev.clientX-r.left-OX)/SC,y:(ev.clientY-r.top-OY)/SC}}
function nearSlot(p,r=26){let best=null,bd=r;for(const s of WORLD.slots){const d=Math.hypot(s.x-p.x,s.y-p.y);if(d<bd){bd=d;best=s}}return best}
cv.addEventListener('pointermove',ev=>{if(S)S.hover=ev.pointerType==='mouse'?toLogical(ev):null});
cv.addEventListener('pointerleave',()=>{if(S)S.hover=null});
cv.addEventListener('pointerdown',ev=>{if(!S||S.kind!=='def'||(S.mode!=='build'&&S.mode!=='wave'))return;const p=toLogical(ev);
  if(S.tool==='trap'){if(distToPaths(p.x,p.y)<18&&p.y<470){S.plates.push({x:p.x,y:p.y});S.traps--;S.tool=null;sfx('place');fx({k:'ring',x:p.x,y:p.y,r:18,dur:.3,col:'#ffffff'})}else{sfx('nope');toast('Il piatto va messo sul sentiero')}return}
  const slot=nearSlot(p);
  if(S.tool){if(!slot||slot.tower){sfx('nope');toast('Tocca una piazzola libera');return}if(hire(slot,S.tool))S.tool=null;return}
  if(slot&&slot.tower)openTower(slot.tower);else if(slot)openHire(slot);else closePanel()});
function hire(slot,key){const cost=hireCost(key);if(S.perle<cost){sfx('nope');toast('Servono '+cost+' perle');return false}
  S.perle-=cost;const t=makeTower(key,slot);t.spent=cost;const i=S.hand.indexOf(key);if(i>=0)S.hand[i]=drawCard();
  sfx('place');fx({k:'ring',x:slot.x,y:slot.y,r:24,dur:.35,col:'#f1dca2'});closePanel();return true}
const panel=$('panel');
function placePanel(x,y,h){const px=OX+x*SC,py=OY+y*SC,bottom=VH-$('bar').offsetHeight+10;let left=px-115,top=py+22;if(top+h>bottom)top=py-h-26;
  panel.style.left=Math.max(8,Math.min(VW-238,left))+'px';panel.style.top=Math.max($('hud').offsetHeight,top)+'px';panel.hidden=false}
function openTower(t){S.sel=t;S.selSlot=t.slot;sfx('click');const d=t.d,max=t.lv>=3,cost=upCost(t),refund=Math.round(t.spent*.6);
  const stat=d.dmg>0?'danno '+fmt(tDmg(t))+' · gittata '+Math.round(tRange(t)):d.info;
  panel.innerHTML='<h4>'+d.full+'</h4><p>Livello '+t.lv+'/3 · '+RAR[d.rar].n+'<br>'+stat+'</p><div class="row"><button class="up" id="upBtn"'+(max||S.perle<cost?' disabled':'')+'>'+(max?'Livello max':'Potenzia '+cost)+'</button><button id="sellBtn">Licenzia +'+refund+'</button></div>';
  placePanel(t.x,t.y,110);
  $('upBtn').onclick=()=>{if(t.lv>=3||S.perle<cost)return;S.perle-=cost;t.spent+=cost;t.lv++;sfx('card');fx({k:'ring',x:t.x,y:t.y,r:26,dur:.4,col:'#e8c14a'});openTower(t)};
  $('sellBtn').onclick=()=>{S.perle+=refund;t.slot.tower=null;S.towers=S.towers.filter(x=>x!==t);sfx('nope');closePanel()}}
function openHire(slot){S.sel=null;S.selSlot=slot;sfx('click');const keys=[...new Set(S.hand.filter(Boolean))];
  panel.innerHTML='<h4>Assumi qui</h4>'+keys.map(k=>{const d=TOWERS[k],c=hireCost(k);return'<button class="hire" data-k="'+k+'"'+(S.perle<c?' disabled':'')+'><img alt="" src="'+ICONS.t[k]+'"><span class="grow">'+d.full+'<small>'+d.info+'</small></span><span class="cs"><span class="pearl"></span>'+c+'</span></button>'}).join('')+'<p>In mano hai 4 dipendenti pescati a caso dal mazzo.</p>';
  placePanel(slot.x,slot.y,60+keys.length*50);panel.querySelectorAll('.hire').forEach(b=>b.onclick=()=>hire(slot,b.dataset.k))}
function closePanel(){if(S){S.sel=null;S.selSlot=null}panel.hidden=true}

/* ---------- barra in basso ---------- */
const shop=$('shop');let shopKey='';
function renderShop(){const mon=S.kind==='mon';const hand=mon?S.mhand:S.hand;const key=(mon?'m':'d')+hand.join(',');if(key===shopKey)return;shopKey=key;shop.innerHTML='';
  hand.forEach((k,i)=>{const b=document.createElement('button');b.className='emp';b.dataset.i=i;if(!k){b.disabled=true;shop.appendChild(b);return}
    const d=mon?ENEMIES[k]:TOWERS[k];b.innerHTML='<span class="rar" style="background:var('+RAR[d.rar].c+')"></span><img alt="" src="'+(mon?ICONS.e[k]:ICONS.t[k])+'"><span class="nm">'+(mon?d.name.split(' ')[0]+(d.group?' x3':''):d.name)+'</span><span class="cs"></span>';
    b.onclick=()=>{if(mon){playMon(i);return}sfx('click');closePanel();S.tool=S.tool===k?null:k;if(S.tool)toast(d.full+': tocca una piazzola libera')};shop.appendChild(b)})}
const cache={};function setT(id,v){if(cache[id]!==v){cache[id]=v;$(id).textContent=v}}
function syncUI(){if(!S||S.mode==='menu')return;const mon=S.kind==='mon';renderShop();
  if(mon){setT('hpLbl',String(Math.max(0,Math.ceil(S.baseHp))));$('perlePill').hidden=true;const m=Math.max(0,Math.ceil(S.timer));setT('waveLbl','Round '+(S.fi+1)+'/3 · '+Math.floor(m/60)+':'+String(m%60).padStart(2,'0'));
    $('hungerWrap').hidden=false;$('hungerFill').style.width=(S.hunger/S.hungerMax*100)+'%';setT('hungerLbl',Math.floor(S.hunger)+'/'+S.hungerMax);
    for(const b of shop.children){const k=S.mhand[b.dataset.i];if(!k)continue;const c=monCost(k);b.classList.toggle('poor',S.hunger<c);const cs=b.querySelector('.cs');const h='<span class="fang"></span>'+c;if(cs.dataset.h!==h){cs.dataset.h=h;cs.innerHTML=h}}
    $('abilityBtn').hidden=true;$('wasabiBtn').hidden=true;$('freezeBtn').hidden=true;$('startBtn').hidden=true;
    $('laneBtn').hidden=WORLD.paths.length<2;setT('laneLbl',S.lane?'Corsia destra':'Corsia sinistra')}
  else{setT('hpLbl',String(S.hp));$('perlePill').hidden=false;setT('perleLbl',String(S.perle));$('hungerWrap').hidden=true;$('laneBtn').hidden=true;
    const boss=isBossWave();setT('waveLbl',S.run==='inf'?'Ondata '+(S.total+1)+(boss?' · Boss':''):'Piano '+(S.fi+1)+' · '+(boss?'Boss':(S.wave+1)+'/'+wavesPer()));
    for(const b of shop.children){const k=S.hand[b.dataset.i];if(!k)continue;const c=hireCost(k);b.classList.toggle('poor',S.perle<c);b.classList.toggle('sel',S.tool===k);const cs=b.querySelector('.cs');const h='<span class="pearl"></span>'+c;if(cs.dataset.h!==h){cs.dataset.h=h;cs.innerHTML=h}}
    const ab=$('abilityBtn');ab.hidden=false;ab.classList.toggle('passive',S.mgr!=='polpo');ab.classList.toggle('sel',S.tool==='trap');
    if(ab.dataset.m!==S.mgr){ab.dataset.m=S.mgr;$('abilityIco').src=S.mgr==='polpo'?ICONS.plate:ICONS.m[S.mgr]}
    setT('abilityLbl',S.mgr==='polpo'?String(S.traps):mgrShort[S.mgr]);
    $('wasabiBtn').hidden=S.wasabi<=0;setT('wasabiCnt',String(S.wasabi));$('freezeBtn').hidden=S.freeze<=0;setT('freezeCnt',String(S.freeze));
    $('startBtn').hidden=S.mode!=='build';setT('startBtn',boss?'Arriva il boss':'Inizia ondata '+(S.run==='inf'?S.total+1:S.wave+1))}
  setT('speedBtn','x'+S.speed)}
$('abilityBtn').onclick=()=>{if(!S||S.kind!=='def')return;if(S.mgr!=='polpo'){toast(MANAGERS[S.mgr].name+': '+MANAGERS[S.mgr].info);return}sfx('click');if(S.traps<=0){toast('Piatti trappola finiti');return}closePanel();S.tool=S.tool==='trap'?null:'trap';if(S.tool)toast('Tocca il sentiero per servire un piatto trappola')};
$('wasabiBtn').onclick=()=>{if(S.mode!=='wave'||S.wasabi<=0){toast('Usala quando arrivano i nemici');return}S.wasabi--;sfx('boom');S.shake=.4;fx({k:'flash',dur:.5});for(const e of[...S.enemies])hurt(e,60,{boom:1});toast('WASABI INDUSTRIALE!')};
$('freezeBtn').onclick=()=>{if(S.mode!=='wave'||S.freeze<=0){toast('Usalo quando arrivano i nemici');return}S.freeze--;S.freezeT=4;sfx('zap');fx({k:'flash',dur:.5,col:'#bfe9ff'});toast('Cervelli congelati per 4 secondi')};
$('laneBtn').onclick=()=>{S.lane=S.lane?0:1;sfx('click')};
$('speedBtn').onclick=()=>{if(!S)return;sfx('click');S.speed=S.speed===1?2:1};
$('startBtn').onclick=()=>{sfx('click');closePanel();startWave()};

/* ---------- carte ---------- */
let cardHands=[],cardPicked=[];
function cardHTML(c){return'<div class="top"><span class="ty">'+c.type+'</span><span class="chip">'+RAR[c.rar].n+'</span></div><span class="cn">'+c.name+'</span><span class="joke">'+c.joke+'</span><span class="eff">'+c.eff(S)+'</span>'}
function renderCards(){const list=$('cardList');list.innerHTML='';
  cardHands.forEach((hand,hi)=>{if(cardHands.length>1){const h=document.createElement('div');h.className='handT';h.textContent=hi?'Mano del secondo gambero':'Mano del primo gambero';list.appendChild(h)}
    for(const c of hand){const b=document.createElement('button');b.className='card'+(cardPicked[hi]?' taken':'');b.style.setProperty('--rc','var('+RAR[c.rar].c+')');
      const img=c.icon?'<img alt="" src="'+(c.mon?ICONS.e[c.icon]:ICONS.t[c.icon])+'">':'';b.innerHTML=img+'<div class="cb">'+cardHTML(c)+'</div>';
      b.onclick=()=>{if(cardPicked[hi])return;c.apply(S);cardPicked[hi]=1;sfx(c.id&&c.id.startsWith('new_')&&S.found.length?'unlock':'card');
        if(cardPicked.every(Boolean)){show('cards',false);afterCards();if(S.mode==='build')toast(isBossWave()?'Ultima preparazione: arriva il boss':'Assumi qualcuno, poi inizia l\'ondata')}else renderCards()};list.appendChild(b)}});
  $('rerollBtn').hidden=!(S.kind==='def'&&S.rerolls>0);$('rerollBtn').textContent='Rimescola ('+S.rerolls+')'}
function showCards(bonus,boss){closePanel();S.tool=null;const mon=S.kind==='mon';
  $('cardsEyebrow').textContent=mon?'Bancone divorato · round '+(S.fi+1)+' vinto':boss?'Boss battuto · +'+bonus+' perle':'Ondata superata · +'+bonus+' perle';
  const two=!mon&&S.mgr==='gamberi';$('cardsTitle').textContent=two?'Scegli una carta per mano':'Scegli una carta';
  cardHands=mon?[pickMCards(S,3)]:two?[pickCards(S,S.cardN),pickCards(S,S.cardN)]:[pickCards(S,S.cardN)];cardPicked=cardHands.map(()=>0);renderCards();show('cards')}
$('rerollBtn').onclick=()=>{if(S.rerolls<=0)return;S.rerolls--;sfx('click');cardHands=cardHands.map((h,i)=>cardPicked[i]?h:pickCards(S,S.cardN));renderCards()};

/* ---------- piani e fine run ---------- */
function floorIntro(){closePanel();const F=WORLD.floor,mon=S.kind==='mon';
  $('floorEyebrow').textContent=mon?'Round '+(S.fi+1)+' di '+S.floors.length:S.run==='inf'?'Infinita · da ondata '+(S.total+1):'Piano '+(S.fi+1)+' di '+S.floors.length;
  $('floorName').textContent=F.name;
  $('floorRule').textContent=mon?F.rule+' Hai 2:30 per mangiarti un bancone da '+S.baseMax+' vita. La cucina assume a caso e si rinforza col tempo.':F.rule;
  if(mon){$('floorBossImg').src=ICONS.m.polpo;$('floorBossLbl').textContent='Difende il bancone';$('floorBoss').textContent='Il Polpo Chef';$('floorBossInfo').textContent='Budget iniziale '+Math.round(S.ai.budget)+' perle, cresce di '+Math.round(S.ai.income)+' al secondo.'}
  else{const b=ENEMIES[F.boss];$('floorBossImg').src=ICONS.e[F.boss];$('floorBossLbl').textContent='Boss del piano';$('floorBoss').textContent=b.name+' · '+b.title;$('floorBossInfo').textContent=b.info}
  $('floorGo').textContent=mon?'All\'attacco':'Scendi';show('floorOv')}
$('floorGo').onclick=()=>{sfx('click');show('floorOv',false);if(S.kind==='mon'){S.mode='mplay';toast('Tocca un mostro in basso per mandarlo all\'attacco')}else{S.mode='build';toast('Tocca una piazzola per assumere un dipendente')}};
function foundHTML(list){return list.map(f=>{if(f.startsWith('mgr:')){const k=f.slice(4);return'<span><img alt="" src="'+ICONS.m[k]+'">'+MANAGERS[k].name+'</span>'}
  if(TOWERS[f])return'<span><img alt="" src="'+ICONS.t[f]+'">'+TOWERS[f].full+'</span>';return'<span><img alt="" src="'+ICONS.e[f]+'">'+ENEMIES[f].name+'</span>'}).join('')}
function showEnd(win,earned){closePanel();hideAll();const mon=S.kind==='mon';
  if(mon){$('endEyebrow').textContent='Mostro affamato';$('endTitle').textContent=win?'Bistrot divorato!':'Tempo scaduto';$('endText').textContent=win?'Tre banconi mangiati. Il Polpo Chef sta valutando una carriera in banca.':'Round '+(S.fi+1)+': la cucina ha retto. Prova altri mostri o altre mutazioni.'}
  else if(S.run==='inf'){$('endEyebrow').textContent='Modalità infinita';$('endTitle').textContent='Divorato all\'ondata '+(S.total+1);$('endText').textContent='Ondate superate: '+S.total+'. Record: '+save.best.inf+'.'}
  else{$('endEyebrow').textContent=win?(S.run==='long'?'Run lunga completata':'Run corta completata'):'Caduto al piano '+(S.fi+1)+', '+WORLD.floor.name;
    $('endTitle').textContent=win?'Il bistrot è salvo!':'Ti hanno mangiato il bancone';
    $('endText').textContent=win?'Il Megalodonte se ne va con il conto pagato. Il Polpo Chef non dorme da una settimana.':'Il Polpo Chef raccoglie i pezzi del bancone. Domani riapre, con altre carte e altro personale.'}
  $('endStats').innerHTML='<div><b>+'+earned+'</b>perle</div><div><b>'+save.perle+'</b>perle totali</div>'+(mon?'':'<div><b>+'+S.stars+'</b>stelle</div>');
  $('endFound').innerHTML=S.found.length?foundHTML(S.found):'';show('end')}
const ui={floorIntro,showCards,showEnd,nearSlot};

/* ---------- menu e preparazione ---------- */
let pending=null;
function idleScene(){S=newRun('def','short',{});S.mode='menu';loadFloor(Math.floor(Math.random()*6));S.lights=[]}
function showMenu(){musicMode=0;pausedAudio=false;applyVol();closePanel();hideAll();idleScene();shopKey='';
  const bs=save.best;$('menuStats').innerHTML='<div><b>'+save.perle+'</b>perle</div><div><b>'+save.stars+'</b>stelle</div><div><b>'+(bs.short?bs.short+'/3':'—')+'</b>corta</div><div><b>'+(bs.long?bs.long+'/6':'—')+'</b>lunga</div><div><b>'+(bs.inf||'—')+'</b>infinita</div>';show('menu')}
document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>{sfx('click');const m=b.dataset.mode;if(m==='monster')openMSetup();else openSetup(m)});
const MODE_NAMES={short:'Run corta',long:'Run lunga',inf:'Infinita'};
function ownedEmp(){return TOWER_KEYS.filter(k=>save.emp[k])}
function openSetup(mode){pending={mode,mgr:save.mgr[save.mgrSel]?save.mgrSel:'polpo',deck:(save.deck||[]).filter(k=>save.emp[k])};
  if(pending.deck.length<4)pending.deck=ownedEmp().slice(0,8);hideAll();$('setupMode').textContent=MODE_NAMES[mode];renderSetup();show('setup')}
function renderSetup(){const ml=$('mgrList');ml.innerHTML='';
  for(const k of MANAGER_KEYS){const m=MANAGERS[k],own=!!save.mgr[k];const b=document.createElement('button');b.className='mgr'+(pending.mgr===k?' sel':'')+(own?'':' locked');
    b.innerHTML='<img alt="" src="'+ICONS.m[k]+'"><span class="mn">'+m.name+'</span><span class="md">'+(own?m.info:'Bloccato: '+(m.unlock.type==='buy'?'si compra nel Bistrot ('+m.unlock.price+' perle)':m.unlock.text))+'</span>';
    b.onclick=()=>{if(!own){sfx('nope');toast('Gestore bloccato');return}sfx('click');pending.mgr=k;renderSetup()};ml.appendChild(b)}
  const dl=$('deckList');dl.innerHTML='';for(const k of ownedEmp()){const d=TOWERS[k],on=pending.deck.includes(k);const b=document.createElement('button');b.className='dk'+(on?' on':'');
    b.innerHTML='<span class="rar" style="background:var('+RAR[d.rar].c+')"></span><span class="lv">Lv'+save.emp[k]+'</span><img alt="" src="'+ICONS.t[k]+'"><span class="nm">'+d.name+'</span>';
    b.onclick=()=>{sfx('click');if(on)pending.deck=pending.deck.filter(x=>x!==k);else if(pending.deck.length<8)pending.deck.push(k);else{toast('Massimo 8 nel mazzo');return}renderSetup()};dl.appendChild(b)}
  $('deckCount').textContent='('+pending.deck.length+'/8)';$('setupGo').disabled=pending.deck.length<4}
$('setupBack').onclick=()=>{sfx('click');showMenu()};
$('setupGo').onclick=()=>{if(pending.deck.length<4){toast('Servono almeno 4 dipendenti');return}sfx('click');save.deck=pending.deck.slice();save.mgrSel=pending.mgr;writeSave();hideAll();shopKey='';startDefense(pending.mode,pending.mgr,pending.deck)};
function ownedMon(){return MONSTER_KEYS.filter(k=>save.mon[k])}
function openMSetup(){pending={mode:'monster',mdeck:(save.monDeck||[]).filter(k=>save.mon[k])};if(pending.mdeck.length<3)pending.mdeck=ownedMon().slice(0,8);hideAll();renderMSetup();show('msetup')}
function renderMSetup(){const dl=$('mdeckList');dl.innerHTML='';for(const k of ownedMon()){const d=ENEMIES[k],on=pending.mdeck.includes(k);const b=document.createElement('button');b.className='dk'+(on?' on':'');
    b.innerHTML='<span class="rar" style="background:var('+RAR[d.rar].c+')"></span><span class="lv">Lv'+save.mon[k]+'</span><img alt="" src="'+ICONS.e[k]+'"><span class="nm">'+d.name.split(' ')[0]+'</span>';
    b.onclick=()=>{sfx('click');if(on)pending.mdeck=pending.mdeck.filter(x=>x!==k);else if(pending.mdeck.length<8)pending.mdeck.push(k);else{toast('Massimo 8 nel mazzo');return}renderMSetup()};dl.appendChild(b)}
  $('mdeckCount').textContent='('+pending.mdeck.length+'/8)';$('msetupGo').disabled=pending.mdeck.length<3}
$('msetupBack').onclick=()=>{sfx('click');showMenu()};
$('msetupGo').onclick=()=>{if(pending.mdeck.length<3){toast('Servono almeno 3 mostri');return}sfx('click');save.monDeck=pending.mdeck.slice();writeSave();hideAll();shopKey='';startMonster(pending.mdeck)};

/* ---------- il Bistrot (progressione) ---------- */
let hubTab='emp';
const HUB_HINT={emp:'I dipendenti si comprano qui o si trovano nelle carte durante le run. Ogni livello dà +10% danni.',mgr:'I gestori cambiano le regole della run. Alcuni si comprano, altri si sbloccano con gli obiettivi.',
  mon:'I mostri servono nella modalità Mostro affamato. Ogni livello dà +12% vita. I boss si sbloccano battendoli in difesa.',resto:'Le stelle Michelin si guadagnano battendo i boss: 1 per boss, 2 se il bancone non ha preso danni in quel piano.'};
function openHub(tab){hubTab=tab||hubTab;hideAll();renderHub();show('hub')}
function itemRow(img,name,rar,info,right,locked){return'<div class="item'+(locked?' locked':'')+'"><img alt="" src="'+img+'"><div class="grow"><span class="nm">'+name+'</span>'+(rar?'<span class="chip" style="background:var('+RAR[rar].c+')">'+RAR[rar].n+'</span>':'')+'<span class="md">'+info+'</span></div>'+right+'</div>'}
function renderHub(){$('hubPerle').textContent=save.perle;$('hubStars').textContent=save.stars;$('hubHint').textContent=HUB_HINT[hubTab];
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.tab===hubTab));let h='';
  if(hubTab==='emp')for(const k of TOWER_KEYS){const d=TOWERS[k],l=save.emp[k];let r;
    if(!l){const p=RAR[d.rar].price;r='<button class="buy" data-a="buyEmp" data-k="'+k+'"'+(save.perle<p?' disabled':'')+'>Compra<br>'+p+'</button>'}
    else if(l>=LVL_MAX)r='<button class="buy done" disabled>Lv MAX</button>';else{const c=empLvlCost(k,l);r='<button class="buy" data-a="lvlEmp" data-k="'+k+'"'+(save.perle<c?' disabled':'')+'>Lv '+l+'→'+(l+1)+'<br>'+c+'</button>'}
    h+=itemRow(ICONS.t[k],d.full,d.rar,d.info+' · '+d.cost+' perle in partita',r,!l)}
  else if(hubTab==='mgr')for(const k of MANAGER_KEYS){const m=MANAGERS[k],own=save.mgr[k];let r;
    if(own)r='<button class="buy done" disabled>Tuo</button>';else if(m.unlock.type==='buy')r='<button class="buy" data-a="buyMgr" data-k="'+k+'"'+(save.perle<m.unlock.price?' disabled':'')+'>Compra<br>'+m.unlock.price+'</button>';else r='<span class="req">'+m.unlock.text+'</span>';
    h+=itemRow(ICONS.m[k],m.name,m.rar,m.info,r,!own)}
  else if(hubTab==='mon')for(const k of MONSTER_KEYS){const d=ENEMIES[k],l=save.mon[k];let r;
    if(!l){if(d.boss)r='<span class="req">Batti il boss in difesa</span>';else{const p=Math.round(RAR[d.rar].price*.6);r='<button class="buy" data-a="buyMon" data-k="'+k+'"'+(save.perle<p?' disabled':'')+'>Compra<br>'+p+'</button>'}}
    else if(l>=LVL_MAX)r='<button class="buy done" disabled>Lv MAX</button>';else{const c=monLvlCost(k,l);r='<button class="buy" data-a="lvlMon" data-k="'+k+'"'+(save.perle<c?' disabled':'')+'>Lv '+l+'→'+(l+1)+'<br>'+c+'</button>'}
    h+=itemRow(ICONS.e[k],d.name,d.rar,d.info+' · '+d.mcost+' fame',r,!l)}
  else{for(const k of Object.keys(RESTO)){const R=RESTO[k],l=save.resto[k];const r=l>=R.max?'<button class="buy done" disabled>MAX</button>':'<button class="buy" data-a="resto" data-k="'+k+'"'+(save.stars<R.cost(l)?' disabled':'')+'>Lv '+l+'→'+(l+1)+'<br>'+R.cost(l)+' ★</button>';
      h+=itemRow(ICONS.resto[k],R.name,null,R.info+' · livello '+l+'/'+R.max,r,false)}
    DECOS.forEach((dc,i)=>{const own=i<=save.resto.deco;const r=!own?'<span class="req">Arredamento Lv '+i+'</span>':save.deco===i?'<button class="buy done" disabled>In uso</button>':'<button class="buy" data-a="deco" data-k="'+i+'">Usa</button>';
      h+=itemRow(ICONS.deco[i],'Insegna: '+dc.name,null,'Colore dell\'insegna del sushi bar',r,!own)})}
  $('hubList').innerHTML=h}
$('hubList').addEventListener('click',ev=>{const b=ev.target.closest('button[data-a]');if(!b||b.disabled)return;const k=b.dataset.k,a=b.dataset.a;let ok=false;
  if(a==='buyEmp'){const p=RAR[TOWERS[k].rar].price;if(save.perle>=p){save.perle-=p;save.emp[k]=1;ok=true}}
  else if(a==='lvlEmp'){const c=empLvlCost(k,save.emp[k]);if(save.perle>=c){save.perle-=c;save.emp[k]++;ok=true}}
  else if(a==='buyMgr'){const p=MANAGERS[k].unlock.price;if(save.perle>=p){save.perle-=p;save.mgr[k]=1;ok=true}}
  else if(a==='buyMon'){const p=Math.round(RAR[ENEMIES[k].rar].price*.6);if(save.perle>=p){save.perle-=p;save.mon[k]=1;ok=true}}
  else if(a==='lvlMon'){const c=monLvlCost(k,save.mon[k]);if(save.perle>=c){save.perle-=c;save.mon[k]++;ok=true}}
  else if(a==='resto'){const R=RESTO[k],c=R.cost(save.resto[k]);if(save.stars>=c&&save.resto[k]<R.max){save.stars-=c;save.resto[k]++;ok=true}}
  else if(a==='deco'){save.deco=+k;ok=true}
  if(ok){sfx(a.startsWith('buy')?'unlock':'card');writeSave();renderHub()}else sfx('nope')});
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{sfx('click');hubTab=b.dataset.tab;renderHub()});
$('hubBtn').onclick=()=>{sfx('click');openHub('emp')};$('hubBack').onclick=()=>{sfx('click');showMenu()};

/* ---------- pausa, impostazioni, salvataggio ---------- */
let pauseFromMenu=false;
function openPause(fromMenu){pauseFromMenu=fromMenu;if(!fromMenu){if(!S||!['build','wave','mplay'].includes(S.mode))return;S.prev=S.mode;S.mode='pause';closePanel()}
  $('pauseTitle').textContent=fromMenu?'Impostazioni':'Pausa';$('pauseRun').hidden=fromMenu;$('resumeBtn').textContent=fromMenu?'Chiudi':'Riprendi';$('saveMsg').textContent='';
  if(fromMenu)hideAll();show('pause');pausedAudio=!fromMenu;applyVol()}
$('pauseBtn').onclick=()=>{sfx('click');openPause(false)};
$('settingsBtn').onclick=()=>{sfx('click');openPause(true)};
$('resumeBtn').onclick=()=>{sfx('click');show('pause',false);pausedAudio=false;applyVol();if(pauseFromMenu)showMenu();else S.mode=S.prev||'build'};
$('restartBtn').onclick=()=>{sfx('click');quitRun();restartSame()};
$('quitBtn').onclick=()=>{sfx('click');quitRun();showMenu()};
function restartSame(){hideAll();shopKey='';pausedAudio=false;applyVol();if(S.kind==='mon')startMonster(save.monDeck||ownedMon().slice(0,8));else startDefense(S.run,S.mgr,save.deck&&save.deck.length>=4?save.deck:ownedEmp().slice(0,8))}
$('againBtn').onclick=()=>{sfx('click');restartSame()};
$('endMenuBtn').onclick=()=>{sfx('click');showMenu()};
$('endHubBtn').onclick=()=>{sfx('click');openHub('emp')};
for(const[id,k]of[['volMusic','music'],['volSfx','sfx']]){const el=$(id);el.value=save.vol[k];$(id+'Out').textContent=save.vol[k];
  el.addEventListener('input',()=>{save.vol[k]=+el.value;$(id+'Out').textContent=el.value;applyVol();writeSave();if(k==='sfx')sfx('coin')})}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S&&['build','wave','mplay'].includes(S.mode))openPause(false)});
const saveMsg=m=>{$('saveMsg').textContent=m};
$('copySave').onclick=()=>{const code='AB2.'+btoa(unescape(encodeURIComponent(JSON.stringify(save))));const inp=$('saveCode');inp.value=code;
  const fb=()=>{inp.select();saveMsg('Codice pronto: selezionalo e copialo.')};
  try{navigator.clipboard.writeText(code).then(()=>saveMsg('Codice copiato. Incollalo sull\'altro dispositivo.'),fb)}catch(e){fb()}};
$('loadSave').onclick=()=>{const v=$('saveCode').value.trim();if(!/^AB[12]\./.test(v)){saveMsg('Codice non valido: deve iniziare con AB2.');return}
  try{const o=JSON.parse(decodeURIComponent(escape(atob(v.slice(4)))));if(typeof o.perle!=='number')throw 0;
    if(v.startsWith('AB1.')){const n=DEF_SAVE();n.perle=o.perle;n.runs=o.runs||0;n.wins=o.wins||0;if(o.vol)n.vol=Object.assign(n.vol,o.vol);save=n}else save=mergeSave(o);writeSave();
    for(const[id,k]of[['volMusic','music'],['volSfx','sfx']]){$(id).value=save.vol[k];$(id+'Out').textContent=save.vol[k]}applyVol();saveMsg('Salvataggio caricato: '+save.perle+' perle, '+save.stars+' stelle.')}
  catch(e){saveMsg('Codice non valido o rovinato.')}};
$('saveCode').addEventListener('input',()=>saveMsg(''));

/* ---------- avvio e ciclo ---------- */
const ma=$('menuArt').getContext('2d');
function drawMenuArt(){ma.setTransform(1,0,0,1,0,0);ma.clearRect(0,0,340,260);ma.setTransform(2,0,0,2,0,0);drawMegaMenu();}
function drawMegaMenu(){drawOcto(ma,85,78,1.55,T);drawShark(ma,140,96,.9,-1,T,0);drawCrab(ma,30,100,.85,1,T);drawJelly(ma,150,40,.75,T)}
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;
  if(S){if(S.mode!=='pause')update(dt*((S.mode==='wave'||S.mode==='mplay')?S.speed:1));render();syncUI()}
  if(!$('menu').hidden)drawMenuArt();requestAnimationFrame(frame)}
buildIcons();ICONS.plate=icon(c=>drawPlate(c,24,25,1.5));ICONS.wasabi=icon(c=>drawWasabi(c,24,26,1.6));ICONS.freeze=icon(c=>drawSorbet(c,24,22,1.6));
ICONS.resto={hp:icon(c=>{c.beginPath();c.roundRect(6,22,36,14,4);FS(c,'#5e3d27',2);c.beginPath();c.roundRect(4,17,40,7,3);FS(c,'#8f5f3d',2);for(let k=0;k<3;k++)drawNigiri(c,14+k*10,15,.9)}),
  cash:icon(c=>{for(let k=0;k<6;k++){E(c,12+k*5,34-k*3,6,6);FS(c,'#f1dca2',1.4)}}),cards:icon(c=>{for(let k=0;k<3;k++){c.save();c.translate(24,26);c.rotate((k-1)*.3);c.beginPath();c.roundRect(-9,-13,18,26,3);FS(c,['#46aee8','#ff7a59','#f2c94c'][k],1.8);c.restore()}}),
  deco:icon(c=>{c.beginPath();c.roundRect(4,16,40,16,4);FS(c,'#3a2a3e',2);c.font='11px Bangers,Impact';c.textAlign='center';c.fillStyle='#ff6ad5';c.fillText('SUSHI',24,28)})};
ICONS.deco=DECOS.map(dc=>icon(c=>{c.beginPath();c.roundRect(4,16,40,16,4);FS(c,dc.wood,2);c.font='11px Bangers,Impact';c.textAlign='center';c.fillStyle=dc.sign;c.fillText('SUSHI',24,28)}));
$('wasabiIco').src=ICONS.wasabi;$('freezeIco').src=ICONS.freeze;$('abilityIco').src=ICONS.plate;
window.abyssView=()=>({OX,OY,SC});window.abyssState=()=>S;
window.abyssIcon=(n,pad)=>{const c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d');const g=x.createRadialGradient(n/2,n*.42,n*.05,n/2,n/2,n*.7);g.addColorStop(0,'#2f6a62');g.addColorStop(1,'#0b1a1c');x.fillStyle=g;x.fillRect(0,0,n,n);const k=n/100*(pad?.78:.9);x.translate(n/2,n/2+n*.06);x.scale(k,k);drawOcto(x,0,0,1.55,.6);return c.toDataURL('image/png')};
try{if('serviceWorker' in navigator&&location.protocol==='https:'&&!/claude\.ai|claudeusercontent/.test(location.hostname))navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}
fit();showMenu();requestAnimationFrame(frame);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{buildIcons();shopKey='';fit()});
