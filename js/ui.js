'use strict';
/* ===== Abyss Bistro: interfaccia, menu, Bistrot, ciclo principale ===== */
const cv=$('game'),ctx=cv.getContext('2d');
const toastEl=$('toast');let toastTimer;
function toast(m){toastEl.textContent=m;toastEl.classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('on'),2000)}
const show=(id,on=true)=>{$(id).hidden=!on};
const OVERLAYS=['menu','setup','msetup','pause','cards','floorOv','end','codex','howto','askOv','modeIntro','packOv','cinfo','roomOv','inviteOv','inbox','shareOv','armyOv'];
const hideAll=()=>OVERLAYS.forEach(id=>show(id,false));
const rarChip=r=>'<span class="chip" style="background:var('+RAR[r].c+')">'+RAR[r].n+'</span>';
const mgrShort={polpo:'Trappole',pagliaccio:'+50% perle',narvalo:'Maledizioni+',gamberi:'Doppia mano',nonno:'Siluri',squalo:'Critici'};

/* ---------- vista ---------- */
function fit(){const a=$('app').getBoundingClientRect();VW=Math.max(1,a.width);VH=Math.max(1,a.height);DPR=Math.min(2,window.devicePixelRatio||1);
  const hudH=$('hud').offsetHeight,barH=Math.max(0,$('bar').offsetHeight-14+($('preview').hidden?32:0)),avail=Math.max(200,VH-hudH-barH);
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
  S.perle-=cost;const t=makeTower(key,slot);t.spent=cost;const i=S.hand.indexOf(key);if(i>=0&&!S.kitBuild)useCard(i);
  sfx('place');fx({k:'ring',x:slot.x,y:slot.y,r:24,dur:.35,col:'#f1dca2'});closePanel();return true}
const panel=$('panel');
const pStyle=()=>save.panelStyle||'mini';
function placePanel(x,y,h){panel.className='p-'+pStyle();panel.hidden=false;h=panel.offsetHeight||h;const w=panel.offsetWidth||230,px=OX+x*SC,py=OY+y*SC,bottom=VH-$('bar').offsetHeight+10;let left=px-w/2,top=pStyle()==='mini'?py-h-30*SC:py+22;if(pStyle()==='mini'&&top<$('hud').offsetHeight)top=py+18*SC;if(top+h>bottom)top=py-h-26;
  panel.style.left=Math.max(8,Math.min(VW-w-8,left))+'px';panel.style.top=Math.max($('hud').offsetHeight,top)+'px';panel.hidden=false}
function openTower(t){S.sel=t;S.selSlot=t.slot;sfx('click');const d=t.d,max=t.lv>=3,cost=upCost(t),refund=Math.round(t.spent*.6);
  const stat=d.dmg>0?'danno '+fmt(tDmg(t))+' · gittata '+Math.round(tRange(t)):d.info;
  if(pStyle()==='mini')panel.innerHTML='<div class="mh"><b>'+d.name+'</b><span>'+'★'.repeat(t.lv)+'</span></div><div class="ms">'+(d.dmg>0?'<span title="Danno">⚔ '+fmt(tDmg(t))+'</span>':'<span>✚ '+({light:'luce',buff:'+30% velocità',heal:'cura',bank:'+perle'}[d.kind]||d.kind)+'</span>')+'<span title="Gittata">◎ '+Math.round(tRange(t))+'</span></div><div class="row"><button class="up" id="upBtn" aria-label="Potenzia"'+(max||S.perle<cost?' disabled':'')+'>'+(max?'MAX':'⬆ '+cost)+'</button><button id="sellBtn" aria-label="Licenzia">💰 +'+refund+'</button></div>';
  else panel.innerHTML='<h4>'+d.full+'</h4><p>Livello '+t.lv+'/3 · '+RAR[d.rar].n+'<br>'+stat+'</p><div class="row"><button class="up" id="upBtn"'+(max||S.perle<cost?' disabled':'')+'>'+(max?'Livello max':'Potenzia '+cost)+'</button><button id="sellBtn">Licenzia +'+refund+'</button></div>';
  placePanel(t.x,t.y,110);
  $('upBtn').onclick=()=>{if(t.lv>=3||S.perle<cost)return;S.perle-=cost;t.spent+=cost;t.lv++;sfx('card');fx({k:'ring',x:t.x,y:t.y,r:26,dur:.4,col:'#e8c14a'});openTower(t)};
  $('sellBtn').onclick=()=>{S.perle+=refund;t.slot.tower=null;S.towers=S.towers.filter(x=>x!==t);sfx('nope');closePanel()}}
function openHire(slot){if(S.tutorial&&S.tutOnly==='-'){toast('Segui il Polpo Chef');return}S.sel=null;S.selSlot=slot;sfx('click');const keys=(S.kitBuild?TOWER_KEYS.filter(k=>save.emp[k]):[...new Set(S.hand.filter(Boolean))]).filter(k=>!(S.tutorial&&S.tutOnly)||k===S.tutOnly);
  if(pStyle()==='mini')panel.innerHTML='<div class="mhire">'+keys.map(k=>{const c=hireCost(k);return'<button class="hire" data-k="'+k+'" aria-label="Assumi '+TOWERS[k].name+'"'+(S.perle<c?' disabled':'')+'><img alt="" src="'+ICONS.t[k]+'"><span class="cs"><span class="pearl"></span>'+c+'</span></button>'}).join('')+'</div>';else
  panel.innerHTML='<h4>Assumi qui</h4>'+keys.map(k=>{const d=TOWERS[k],c=hireCost(k);return'<button class="hire" data-k="'+k+'"'+(S.perle<c?' disabled':'')+'><img alt="" src="'+ICONS.t[k]+'"><span class="grow">'+d.full+'<small>'+d.info+'</small></span><span class="cs"><span class="pearl"></span>'+c+'</span></button>'}).join('')+'<p>In mano hai 3 dipendenti pescati a caso dal mazzo: quello che usi torna in fondo e ne entra un altro.</p>';
  placePanel(slot.x,slot.y,60+keys.length*50);panel.querySelectorAll('.hire').forEach(b=>b.onclick=()=>hire(slot,b.dataset.k))}
function closePanel(){if(S){S.sel=null;S.selSlot=null}panel.hidden=true}

/* ---------- barra in basso ---------- */
const shop=$('shop');let shopKey='';
function renderShop(){const mon=S.kind==='mon';const hand=mon?S.mhand:S.hand;const key=(mon?'m':'d')+hand.join(',');if(key===shopKey)return;shopKey=key;shop.innerHTML='';
  hand.forEach((k,i)=>{const b=document.createElement('button');b.className='emp';b.dataset.i=i;if(!k){b.disabled=true;shop.appendChild(b);return}
    const d=mon?ENEMIES[k]:TOWERS[k];b.innerHTML='<span class="rar" style="background:var('+RAR[d.rar].c+')"></span><img alt="" src="'+(mon?ICONS.e[k]:ICONS.t[k])+'"><span class="ntx"><span class="nm">'+(mon?d.name.split(' ')[0]+(d.group?' x3':''):d.name)+'</span><span class="cs"></span></span>';
    b.onclick=()=>{if(mon){const ok=S.hunger>=monCost(k);playMon(i);if(ok)toast(d.name+': '+d.info);return}if(S.tutorial&&S.tutOnly&&S.tutOnly!==k){sfx('nope');toast(S.tutOnly==='-'?'Segui il Polpo Chef':'Il Polpo Chef dice: prima '+TOWERS[S.tutOnly].name);return}sfx('click');closePanel();S.tool=S.tool===k?null:k};shop.appendChild(b)})}
const cache={};function setT(id,v){if(cache[id]!==v){cache[id]=v;$(id).textContent=v}}
function syncUI(){if(!S||S.mode==='menu')return;const mon=S.kind==='mon';renderShop();
  if(mon){setT('hpLbl',String(Math.max(0,Math.ceil(S.baseHp))));$('perlePill').hidden=true;const m=Math.max(0,Math.ceil(S.timer));setT('waveLbl','Round '+(S.fi+1)+'/3 · '+Math.floor(m/60)+':'+String(m%60).padStart(2,'0'));
    $('hungerWrap').hidden=false;$('hungerFill').style.width=(S.hunger/S.hungerMax*100)+'%';setT('hungerLbl',Math.floor(S.hunger)+'/'+S.hungerMax);
    for(const b of shop.children){const k=S.mhand[b.dataset.i];if(!k)continue;const c=monCost(k);b.classList.toggle('poor',S.hunger<c);const cs=b.querySelector('.cs');const h='<span class="fang"></span>'+c;if(cs.dataset.h!==h){cs.dataset.h=h;cs.innerHTML=h}}
    $('abilityBtn').hidden=true;$('handBtn').hidden=S.mode!=='mplay';$('handBtn').classList.toggle('poor',S.hunger<10);setT('handCost','10 fame');$('wasabiBtn').hidden=true;$('freezeBtn').hidden=true;$('startBtn').hidden=true;
    $('laneBtn').hidden=WORLD.paths.length<2;setT('laneLbl',S.lane?'Corsia destra':'Corsia sinistra')}
  else{setT('hpLbl',String(S.hp));$('perlePill').hidden=false;setT('perleLbl',String(S.perle));$('hungerWrap').hidden=true;$('laneBtn').hidden=true;
    const boss=isBossWave();setT('waveLbl',S.run==='inf'?'Ondata '+(S.total+1)+(boss?' · Boss':''):'Piano '+(S.fi+1)+' · '+(boss?'Boss':(S.wave+1)+'/'+wavesPer()));
    for(const b of shop.children){const k=S.hand[b.dataset.i];if(!k)continue;const c=hireCost(k);b.classList.toggle('poor',S.perle<c);b.classList.toggle('sel',S.tool===k);const cs=b.querySelector('.cs');const h='<span class="pearl"></span>'+c;if(cs.dataset.h!==h){cs.dataset.h=h;cs.innerHTML=h}}
    const ab=$('abilityBtn');ab.hidden=false;ab.classList.toggle('passive',S.mgr!=='polpo');ab.classList.toggle('sel',S.tool==='trap');
    if(ab.dataset.m!==S.mgr){ab.dataset.m=S.mgr;$('abilityIco').src=S.mgr==='polpo'?ICONS.plate:ICONS.m[S.mgr]}
    setT('abilityLbl',S.mgr==='polpo'?String(S.traps):mgrShort[S.mgr]);
    $('wasabiBtn').hidden=S.wasabi<=0;setT('wasabiCnt',String(S.wasabi));$('freezeBtn').hidden=S.freeze<=0;setT('freezeCnt',String(S.freeze));
    $('startBtn').hidden=S.mode!=='build';$('shop').hidden=!!S.kitBuild;$('abilityBtn').hidden=!!S.kitBuild;$('handBtn').hidden=S.mode!=='build'||!!S.kitBuild;$('handBtn').classList.toggle('poor',S.perle<15);setT('handCost','15 perle');setT('startBtn',S.kitBuild?'Crea il codice della cucina':boss?'Arriva il boss':'Inizia ondata '+(S.run==='inf'?S.total+1:S.wave+1))}
  syncToolInfo();syncPreview();setT('speedBtn','x'+S.speed)}
function statLine(k){const d=TOWERS[k],meta=1+.1*((save.emp[k]||1)-1),dm=d.dmg*(S&&S.kind==='def'?S.mods.dmg[k]*S.mods.all:1)*meta,rg=Math.round(d.range*(S&&S.kind==='def'?S.mods.range:1));
  switch(d.kind){case'light':return'Raggio di luce '+rg+' · i nemici illuminati prendono +15% danni';case'buff':return'Raggio '+rg+' · +30% velocità d\'attacco ai vicini';
    case'heal':return'Raggio '+rg+' · toglie blocchi e nausea ogni '+d.rate+'s, poi protegge';case'bank':return'+30 perle a fine ondata (+12 per livello)';
    case'swarm':return'Danno '+fmt(dm)+' ogni '+d.rate+'s · gittata '+rg;case'gulp':return'Danno '+Math.round(dm)+' a tutti davanti · ogni '+d.rate+'s · gittata '+rg;
    case'patrol':return'Danno '+fmt(dm)+' a chi tocca · gira attorno alla piazzola';case'ink':return'Nube per 3s: i nemici tornano indietro · gittata '+rg;
    default:return'Danno '+fmt(dm)+' · gittata '+rg+' · 1 colpo ogni '+d.rate+'s'}}
let tiKey='';function syncToolInfo(){const el=$('toolInfo');const k=S.kind==='def'&&(S.mode==='build'||S.mode==='wave')?S.tool:null;const key=k?k+S.perle+':'+S.traps:'';if(key===tiKey)return;tiKey=key;if(!k){el.hidden=true;return}
  if(k==='trap'){el.style.setProperty('--rc','var(--pearl)');el.innerHTML='<img alt="" src="'+ICONS.plate+'"><div class="ti"><div class="tt"><span class="tn">Piatto trappola</span></div><span class="tinfo">Il primo nemico che ci passa sopra si ferma a mangiare e prende 45 danni. Chi vola ci passa sopra.</span><span class="thint">Tocca il sentiero per servirlo · tocca di nuovo il pulsante per annullare</span></div><span class="tcost">'+S.traps+'</span>';el.hidden=false;placeInfo(el);return}
  toastEl.classList.remove('on');
  const d=TOWERS[k],c=hireCost(k);el.style.setProperty('--rc','var('+RAR[d.rar].c+')');
  el.innerHTML='<img alt="" src="'+ICONS.t[k]+'"><div class="ti"><div class="tt"><span class="tn">'+d.full+'</span><span class="chip" style="background:var('+RAR[d.rar].c+')">'+RAR[d.rar].n+'</span></div><span class="tinfo">'+d.info+'</span><span class="tstat">'+statLine(k)+'</span><span class="tjoke">'+d.joke+'</span><span class="thint">'+(S.perle>=c?'Tocca una piazzola che brilla per assumerlo':'Ti mancano '+(c-S.perle)+' perle')+' · tocca di nuovo la carta per annullare</span></div><span class="tcost"><span class="pearl"></span>'+c+'</span>';el.hidden=false;placeInfo(el)}
/* la scheda va dove copre meno: in alto o subito sopra la mano, evitando l'ingresso dei mostri e le piazzole libere */
function placeInfo(el){el.style.top='';el.style.bottom='';const h=el.offsetHeight,barTop=$('bar').getBoundingClientRect().top,hud=54;
  const cand=[{top:hud},{top:Math.max(hud,barTop-h-6)}];const pts=[];
  for(const pa of WORLD.paths)for(let d=0;d<=pa.len;d+=12){const q=pa.at(d);pts.push({x:OX+q.x*SC,y:OY+q.y*SC,w:d<pa.len*.3?4:1})}
  for(const sl of WORLD.slots)if(!sl.tower)pts.push({x:OX+sl.x*SC,y:OY+sl.y*SC,w:2});
  let best=cand[1],bs=1e9;for(const c of cand){const y0=c.top,y1=c.top+h;let sc=0;for(const q of pts)if(q.y>y0-6&&q.y<y1+6)sc+=q.w;if(sc<bs-.5||(Math.abs(sc-bs)<.5&&c===cand[1])){bs=sc;best=c}}
  el.style.top=best.top+'px'}
let pvKey='';function syncPreview(){const el=$('preview');const q=S.kind==='def'&&S.mode==='build'&&!S.tool?S.nextQ:null;const key=q?q.length+':'+q.map(x=>x[0][0]).join(''):'';if(key===pvKey)return;pvKey=key;if(!q){el.hidden=true;return}
  const cnt={};for(const[t]of q)cnt[t]=(cnt[t]||0)+1;el.innerHTML='<span>In arrivo:</span>'+Object.keys(cnt).map(t=>'<span class="pc'+(ENEMIES[t].boss?' boss':'')+'" title="'+ENEMIES[t].name+'"><img alt="" src="'+ICONS.e[t]+'">'+(ENEMIES[t].boss?'BOSS':'x'+cnt[t])+'</span>').join('');el.hidden=false}
$('abilityBtn').onclick=()=>{if(!S||S.kind!=='def')return;if(S.mgr!=='polpo'){toast(MANAGERS[S.mgr].name+': '+MANAGERS[S.mgr].info);return}sfx('click');if(S.traps<=0){toast('Piatti trappola finiti');return}closePanel();S.tool=S.tool==='trap'?null:'trap';if(S.tool)toast('Tocca il sentiero per servire un piatto trappola')};
$('wasabiBtn').onclick=()=>{if(S.mode!=='wave'||S.wasabi<=0){toast('Usala quando arrivano i nemici');return}S.wasabi--;sfx('boom');S.shake=.4;fx({k:'flash',dur:.5});for(const e of[...S.enemies])hurt(e,60,{boom:1});toast('WASABI INDUSTRIALE!')};
$('freezeBtn').onclick=()=>{if(S.mode!=='wave'||S.freeze<=0){toast('Usalo quando arrivano i nemici');return}S.freeze--;S.freezeT=4;sfx('zap');fx({k:'flash',dur:.5,col:'#bfe9ff'});toast('Cervelli congelati per 4 secondi')};
$('laneBtn').onclick=()=>{S.lane=S.lane?0:1;sfx('click')};
$('handBtn').onclick=()=>{if(!S)return;
  if(S.kind==='mon'){if(S.mode!=='mplay')return;if(S.hunger<10){sfx('nope');toast('Servono 10 di fame');return}S.hunger-=10;const old=S.mhand.slice();for(let i=0;i<3;i++)S.mhand[i]=null;for(let i=0;i<3;i++)S.mhand[i]=drawMon();S.mpile.push(...old.filter(Boolean));sfx('card');return}
  if(S.mode!=='build'){sfx('nope');toast('La mano si cambia tra un\'ondata e l\'altra');return}if(S.tutorial&&S.tutOnly){sfx('nope');toast('Segui il Polpo Chef');return}if(S.perle<15){sfx('nope');toast('Servono 15 perle');return}
  S.perle-=15;S.tool=null;closePanel();const old=S.hand.slice();for(let i=0;i<3;i++)S.hand[i]=null;for(let i=0;i<3;i++)S.hand[i]=drawCard();S.pile.push(...old.filter(Boolean));sfx('card');toast('Mano nuova dal mazzo')};
$('speedBtn').onclick=()=>{if(!S)return;sfx('click');S.speed=S.speed===1?2:1};
$('startBtn').onclick=()=>{sfx('click');closePanel();if(S.kitBuild){exportKit();return}startWave()};

/* ---------- carte ---------- */
let cardHands=[],cardPicked=[];
function cardHTML(c){return'<div class="top"><span class="ty">'+c.type+'</span><span class="chip">'+RAR[c.rar].n+'</span></div><span class="cn">'+c.name+'</span><span class="joke">'+c.joke+'</span><span class="eff">'+c.eff(S)+'</span>'}
function renderCards(){const list=$('cardList');list.innerHTML='';
  cardHands.forEach((hand,hi)=>{if(cardHands.length>1){const h=document.createElement('div');h.className='handT';h.textContent=hi?'Mano del secondo gambero':'Mano del primo gambero';list.appendChild(h)}
    for(const c of hand){const b=document.createElement('button');b.className='card'+(cardPicked[hi]?' taken':'');b.style.setProperty('--rc','var('+RAR[c.rar].c+')');
      const img=c.icon?'<img alt="" src="'+(c.mon?ICONS.e[c.icon]:ICONS.t[c.icon])+'">':'';b.innerHTML=img+'<div class="cb">'+cardHTML(c)+'</div>';
      b.onclick=()=>{if(cardPicked[hi])return;c.apply(S);cardPicked[hi]=1;sfx(c.id&&c.id.startsWith('new_')&&S.found.length?'unlock':'card');
        if(cardPicked.every(Boolean)){show('cards',false);afterCards();if(S.mode==='build')toast(isBossWave()?'Ultima preparazione: arriva il boss':'Assumi qualcuno, poi inizia l\'ondata')}else renderCards()};list.appendChild(b)}});
  const rb=$('rerollBtn');rb.hidden=S.kind!=='def';if(S.rerolls>0){rb.innerHTML='Rimescola gratis ('+S.rerolls+')';rb.disabled=false}else{const c=rerollCost();rb.innerHTML='Rimescola · <span class="pearl"></span> '+c+' perle (ne hai '+S.perle+')';rb.disabled=S.perle<c}}
const rerollCost=()=>30+20*(S.paidRerolls||0);
function showCards(bonus,boss){closePanel();S.tool=null;const mon=S.kind==='mon';
  $('cardsEyebrow').textContent=mon?'Bancone divorato · round '+(S.fi+1)+' vinto':boss?'Boss battuto · +'+bonus+' perle':'Ondata superata · +'+bonus+' perle';
  const two=!mon&&S.mgr==='gamberi';$('cardsTitle').textContent=two?'Scegli una carta per mano':'Scegli una carta';
  cardHands=mon?[pickMCards(S,3)]:two?[pickCards(S,S.cardN),pickCards(S,S.cardN)]:[pickCards(S,S.cardN)];cardPicked=cardHands.map(()=>0);renderCards();show('cards')}
$('rerollBtn').onclick=()=>{if(S.rerolls>0)S.rerolls--;else{const c=rerollCost();if(S.perle<c){sfx('nope');return}S.perle-=c;S.paidRerolls=(S.paidRerolls||0)+1;sfx('coin')}sfx('click');cardHands=cardHands.map((h,i)=>cardPicked[i]?h:pickCards(S,S.cardN));renderCards()};

/* ---------- piani e fine run ---------- */
function floorIntro(){closePanel();if(S.kitBuild){S.mode='build';return}const F=WORLD.floor,mon=S.kind==='mon';
  $('floorEyebrow').textContent=mon?'Round '+(S.fi+1)+' di '+S.floors.length:S.run==='inf'?'Infinita · da ondata '+(S.total+1):'Piano '+(S.fi+1)+' di '+S.floors.length;
  $('floorName').textContent=F.name;
  $('floorRule').textContent=mon?F.rule+' Hai 2:30 per mangiarti un bancone da '+S.baseMax+' vita. La cucina assume a caso e si rinforza col tempo.':F.rule;
  if(mon){$('floorBossImg').src=ICONS.m.polpo;$('floorBossLbl').textContent='Difende il bancone';$('floorBoss').textContent='Il Polpo Chef';$('floorBossInfo').textContent='Budget iniziale '+Math.round(S.ai.budget)+' perle, cresce di '+Math.round(S.ai.income)+' al secondo.'}
  else{const b=ENEMIES[F.boss];$('floorBossImg').src=ICONS.e[F.boss];$('floorBossLbl').textContent='Boss del piano';$('floorBoss').textContent=b.name+' · '+b.title;$('floorBossInfo').textContent=b.info}
  $('floorGo').textContent=mon?'All\'attacco':'Scendi';show('floorOv')}
$('floorGo').onclick=()=>{sfx('click');show('floorOv',false);if(S.kind==='mon'){S.mode='mplay';toast('Tocca un mostro in basso per mandarlo all\'attacco')}else{S.mode='build';prepWave();if(S.tutorial&&tutStep<0)nextStep();else toast('Tocca un dipendente in basso per vedere cosa fa')}};
function foundHTML(list){return list.map(f=>{if(f.startsWith('mgr:')){const k=f.slice(4);return'<span><img alt="" src="'+ICONS.m[k]+'">'+MANAGERS[k].name+'</span>'}
  if(TOWERS[f])return'<span><img alt="" src="'+ICONS.t[f]+'">'+TOWERS[f].full+'</span>';return'<span><img alt="" src="'+ICONS.e[f]+'">'+ENEMIES[f].name+'</span>'}).join('')}
function showEnd(win,earned){closePanel();hideAll();const mon=S.kind==='mon';
  if(mon){$('endEyebrow').textContent='Mostro affamato';$('endTitle').textContent=win?'Bistrot divorato!':'Tempo scaduto';$('endText').textContent=win?'Tre banconi mangiati. Il Polpo Chef sta valutando una carriera in banca.':'Round '+(S.fi+1)+': la cucina ha retto. Prova altri mostri o altre mutazioni.'}
  else if(S.run==='inf'){$('endEyebrow').textContent='Modalità infinita';$('endTitle').textContent='Divorato all\'ondata '+(S.total+1);$('endText').textContent='Ondate superate: '+S.total+'. Record: '+save.best.inf+'.'}
  else{$('endEyebrow').textContent=win?(S.run==='long'?'Run lunga completata':'Run corta completata'):'Caduto al piano '+(S.fi+1)+', '+WORLD.floor.name;
    $('endTitle').textContent=win?'Il bistrot è salvo!':'Ti hanno mangiato il bancone';
    $('endText').textContent=win?'Il Megalodonte se ne va con il conto pagato. Il Polpo Chef non dorme da una settimana.':'Il Polpo Chef raccoglie i pezzi del bancone. Domani riapre, con altre carte e altro personale.'}
  $('endStats').innerHTML='<div><b>+'+earned+'</b>perle</div><div><b>'+save.perle+'</b>perle totali</div>'+(mon?'':'<div><b>+'+S.stars+'</b>stelle</div>');
  if(S.dailyWon)$('endText').textContent+=' Sfida del giorno vinta: perle doppie e 3 stelle!';
  $('endFound').innerHTML=(S.found.length?foundHTML(S.found):'')+(typeof rewardsHTML==='function'?rewardsHTML():'');$('endShare').innerHTML=typeof shareHTML==='function'?shareHTML(S.share):'';if(S.share)wireCopy($('endShare'));show('end')}
const ui={floorIntro,showCards,showEnd,nearSlot};

/* ---------- menu e preparazione ---------- */
let pending=null;
function idleScene(){S=newRun('def','short',{});S.mode='menu';loadFloor(Math.floor(Math.random()*6));S.lights=[]}
const MODES=[{id:'short',name:'Run corta',desc:'3 piani: uno facile, uno difficile, poi l\'Abisso. 3 ondate e un boss per piano.',icon:()=>ICONS.e.reAragosta,rec:()=>save.best.short?'Record: '+save.best.short+'/3 piani':'Mai completata'},
  {id:'long',name:'Run lunga',desc:'Tutti e 6 i piani fino al Megalodonte. 5 ondate per piano.',icon:()=>ICONS.e.megalodonte,rec:()=>save.best.long?'Record: '+save.best.long+'/6 piani':'Mai completata'},
  {id:'inf',name:'Infinita',desc:'Ondate senza fine, un boss ogni 5. I piani girano.',icon:()=>ICONS.t.balena,rec:()=>save.best.inf?'Record: '+save.best.inf+' ondate':'Nessun record'},
  {id:'monster',name:'Mostro affamato',desc:'Ruoli invertiti: guidi tu i mostri contro la cucina.',icon:()=>ICONS.e.kraken,rec:()=>save.best.monster?'Record: '+save.best.monster+'/3 round':'Nessun record'}];
function showMenu(tab){rnd=Math.random;musicMode=0;pausedAudio=false;applyVol();closePanel();hideAll();idleScene();shopKey='';
  $('mPerle').textContent=save.perle;$('mStars').textContent=save.stars;
  const seen=MONSTER_KEYS.filter(k=>save.seen[k]).length;
  $('menuStats').innerHTML='<div><b>'+(save.lvl||1)+'</b>livello</div><div><b>'+save.wins+'</b>vittorie</div><div><b>'+Object.keys(save.emp).length+'/'+TOWER_KEYS.length+'</b>dipendenti</div><div><b>'+seen+'/'+MONSTER_KEYS.length+'</b>mostri visti</div>';
  const dy=dailyInfo(),done=save.dailyDone===dy.key;
  $('dailyBtn').innerHTML='<span class="dTag">Sfida del giorno · '+dy.label+'</span><span class="dName">'+MANAGERS[dy.mgr].name+' + '+dy.curse.name+'</span><span class="dRule">Run corta con gestore e mazzo fissi, uguali per tutti. Maledizione già attiva: '+dy.curse.eff(newRun('def','short',{}))+'</span><span class="dDeck">'+dy.deck.map(k=>'<img alt="" title="'+TOWERS[k].full+'" src="'+ICONS.t[k]+'">').join('')+'</span><span class="dRew">'+(done?'Completata oggi. Domani ne arriva una nuova.':'Premio alla vittoria: perle x2 e 3 stelle')+'</span>'+(done?'<span class="dDone">Fatta</span>':'');
  $('modeList').innerHTML=MODES.map(m=>'<button class="mode" data-mode="'+m.id+'"><img alt="" src="'+m.icon()+'"><span class="mb"><span class="mn">'+m.name+'</span><span class="md">'+m.desc+'</span><span class="rec">'+m.rec()+'</span></span></button>').join('');
  $('modeList').querySelectorAll('.mode').forEach(b=>b.onclick=()=>{sfx('click');const m=b.dataset.mode;withIntro(m,()=>{if(m==='monster')openMSetup();else if(m==='short'&&!save.tutDone&&save.novice)startTutorial();else openSetup(m)})});
  $('codexCount').textContent=seen+' mostri visti su '+MONSTER_KEYS.length;
  if(typeof mailBadge==='function')mailBadge();
  if(save.packs){const np=Object.values(save.packs).reduce((a,b)=>a+b,0);}show('menu');if(typeof menuRender==='function')menuRender(tab);if(typeof maybeAsk==='function')maybeAsk()}
$('dailyBtn').onclick=()=>{sfx('click');withIntro('daily',()=>{const dy=dailyInfo();hideAll();shopKey='';startDefense('short',dy.mgr,dy.deck,dy);toast('Sfida del giorno: '+dy.curse.name)})};
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
const HUB_HINT={emp:'I dipendenti si comprano qui, si trovano nei pacchetti o nelle carte durante le run. Per salire di livello servono le copie dai pacchetti, poi paghi in perle. Ogni livello dà +10% danni.',mgr:'I gestori cambiano le regole della run. Alcuni si comprano, altri si sbloccano con gli obiettivi.',
  mon:'I mostri servono nella modalità Mostro affamato. Per salire di livello servono copie dai pacchetti e perle. Ogni livello dà +12% vita. I boss si sbloccano battendoli in difesa.',resto:'Le stelle Michelin si guadagnano battendo i boss: 1 per boss, 2 se il bancone non ha preso danni in quel piano.'};
function openHub(tab){if(tab&&tab!=='resto')hubTab=tab;showMenu(tab==='resto'?'resto':'shop')}
function itemRow(img,name,rar,info,right,locked){return'<div class="item'+(locked?' locked':'')+'"><img alt="" src="'+img+'"><div class="grow"><span class="nm">'+name+'</span>'+(rar?'<span class="chip" style="background:var('+RAR[rar].c+')">'+RAR[rar].n+'</span>':'')+'<span class="md">'+info+'</span></div>'+right+'</div>'}
function updWallet(){$('mPerle').textContent=save.perle;$('mStars').textContent=save.stars;$('mLvl').textContent=save.lvl||1}
function renderHub(){updWallet();$('hubHint').textContent=HUB_HINT[hubTab];
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.dataset.tab===hubTab));let h='';
  if(hubTab==='emp')for(const k of TOWER_KEYS){const d=TOWERS[k],l=save.emp[k];let r;
    if(!l){const p=RAR[d.rar].price;r='<button class="buy" data-a="buyEmp" data-k="'+k+'"'+(save.perle<p?' disabled':'')+'>Compra<br>'+p+'</button>'}
    else if(l>=LVL_MAX)r='<button class="buy done" disabled>Lv MAX</button>';else{const c=empLvlCost(k,l),hv=copiesOf('emp',k),nd=COPIES_FOR[l];r=hv<nd?'<span class="req">Lv '+l+' · copie '+hv+'/'+nd+'<br>dai pacchetti</span>':'<button class="buy" data-a="lvlEmp" data-k="'+k+'"'+(save.perle<c?' disabled':'')+'>Lv '+l+'→'+(l+1)+'<br>'+c+'</button>'}
    h+=itemRow(ICONS.t[k],d.full,d.rar,d.info+' · '+d.cost+' perle in partita',r,!l)}
  else if(hubTab==='mgr')for(const k of MANAGER_KEYS){const m=MANAGERS[k],own=save.mgr[k];let r;
    if(own)r='<button class="buy done" disabled>Tuo</button>';else if(m.unlock.type==='buy')r='<button class="buy" data-a="buyMgr" data-k="'+k+'"'+(save.perle<m.unlock.price?' disabled':'')+'>Compra<br>'+m.unlock.price+'</button>';else r='<span class="req">'+m.unlock.text+'</span>';
    h+=itemRow(ICONS.m[k],m.name,m.rar,m.info,r,!own)}
  else if(hubTab==='mon')for(const k of MONSTER_KEYS){const d=ENEMIES[k],l=save.mon[k];let r;
    if(!l){if(d.boss)r='<span class="req">Batti il boss in difesa</span>';else{const p=Math.round(RAR[d.rar].price*.6);r='<button class="buy" data-a="buyMon" data-k="'+k+'"'+(save.perle<p?' disabled':'')+'>Compra<br>'+p+'</button>'}}
    else if(l>=LVL_MAX)r='<button class="buy done" disabled>Lv MAX</button>';else{const c=monLvlCost(k,l),hv=copiesOf('mon',k),nd=COPIES_FOR[l];r=hv<nd?'<span class="req">Lv '+l+' · copie '+hv+'/'+nd+'<br>dai pacchetti</span>':'<button class="buy" data-a="lvlMon" data-k="'+k+'"'+(save.perle<c?' disabled':'')+'>Lv '+l+'→'+(l+1)+'<br>'+c+'</button>'}
    h+=itemRow(ICONS.e[k],d.name,d.rar,d.info+' · '+d.mcost+' fame',r,!l)}
  $('hubList').innerHTML=h}
function renderResto(){let h='';$('restoHint').textContent=HUB_HINT.resto;{for(const k of Object.keys(RESTO)){const R=RESTO[k],l=save.resto[k];const r=l>=R.max?'<button class="buy done" disabled>MAX</button>':'<button class="buy" data-a="resto" data-k="'+k+'"'+(save.stars<R.cost(l)?' disabled':'')+'>Lv '+l+'→'+(l+1)+'<br>'+R.cost(l)+' ★</button>';
      h+=itemRow(ICONS.resto[k],R.name,null,R.info+' · livello '+l+'/'+R.max,r,false)}
    DECOS.forEach((dc,i)=>{const own=i<=save.resto.deco;const r=!own?'<span class="req">Arredamento Lv '+i+'</span>':save.deco===i?'<button class="buy done" disabled>In uso</button>':'<button class="buy" data-a="deco" data-k="'+i+'">Usa</button>';
      h+=itemRow(ICONS.deco[i],'Insegna: '+dc.name,null,'Colore dell\'insegna del sushi bar',r,!own)})}
  $('restoList').innerHTML=h}
function hubClick(ev){const b=ev.target.closest('button[data-a]');if(!b||b.disabled)return;const k=b.dataset.k,a=b.dataset.a;let ok=false;
  if(a==='buyEmp'){const p=RAR[TOWERS[k].rar].price;if(save.perle>=p){save.perle-=p;save.emp[k]=1;ok=true}}
  else if(a==='lvlEmp'){ok=doLevel('emp',k)}
  else if(a==='buyMgr'){const p=MANAGERS[k].unlock.price;if(save.perle>=p){save.perle-=p;save.mgr[k]=1;ok=true}}
  else if(a==='buyMon'){const p=Math.round(RAR[ENEMIES[k].rar].price*.6);if(save.perle>=p){save.perle-=p;save.mon[k]=1;ok=true}}
  else if(a==='lvlMon'){ok=doLevel('mon',k)}
  else if(a==='resto'){const R=RESTO[k],c=R.cost(save.resto[k]);if(save.stars>=c&&save.resto[k]<R.max){save.stars-=c;save.resto[k]++;ok=true}}
  else if(a==='deco'){save.deco=+k;ok=true}
  if(ok){sfx(a.startsWith('buy')?'unlock':'card');writeSave();menuRender()}else sfx('nope')}
$('hubList').addEventListener('click',hubClick);$('restoList').addEventListener('click',hubClick);
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{sfx('click');hubTab=b.dataset.tab;renderHub()});

/* ---------- bestiario ---------- */
let codexTab='emp';const CODEX_HINT={emp:'Tutti i 17 dipendenti. Quelli bloccati si comprano nel Bistrot o si trovano nelle carte.',en:'I nemici che non hai ancora incontrato restano in ombra.',boss:'Un boss per piano. Battuto, diventa un mostro leggendario per Mostro affamato.',mgr:'Il gestore cambia le regole della run.'};
function openCodex(){hideAll();renderCodex();show('codex')}
function renderCodex(){document.querySelectorAll('.ctab').forEach(b=>b.classList.toggle('on',b.dataset.tab===codexTab));$('codexHint').textContent=CODEX_HINT[codexTab];let h='';
  const chip=r=>'<span class="chip" style="background:var('+RAR[r].c+')">'+RAR[r].n+'</span>';
  if(codexTab==='emp')for(const k of TOWER_KEYS){const d=TOWERS[k];h+='<div class="cc"><img alt="" src="'+ICONS.t[k]+'"><span class="nm">'+d.full+'</span>'+chip(d.rar)+'<span class="md">'+d.info+'</span><span class="st">'+d.cost+' perle · '+statLine(k)+'</span><span class="jk">'+d.joke+(save.emp[k]?'':' · Bloccato')+'</span></div>'}
  else if(codexTab==='mgr')for(const k of MANAGER_KEYS){const m=MANAGERS[k];h+='<div class="cc'+(save.mgr[k]?'':' unk')+'"><img alt="" src="'+ICONS.m[k]+'"><span class="nm">'+m.name+'</span>'+chip(m.rar)+'<span class="md">'+m.info+'</span><span class="jk">'+(save.mgr[k]?'Sbloccato':m.unlock.type==='buy'?'Si compra: '+m.unlock.price+' perle':m.unlock.text)+'</span></div>'}
  else{const keys=MONSTER_KEYS.filter(k=>codexTab==='boss'?ENEMIES[k].boss:!ENEMIES[k].boss);for(const k of keys){const d=ENEMIES[k],known=save.seen[k]||save.bossBeat[k];
    const fl=d.boss?FLOORS.find(f=>f.boss===k):null;h+='<div class="cc'+(known?'':' unk')+'"><img alt="" src="'+ICONS.e[k]+'"><span class="nm">'+(known?d.name:'???')+'</span>'+chip(d.rar)+'<span class="md">'+(known?d.info:'Incontralo in una run per scoprirlo')+'</span>'+(known?'<span class="st">Vita '+d.hp+' · velocità '+d.speed+' · '+d.dmg+' danni al bancone</span>':'')+(fl?'<span class="jk">Boss di: '+fl.name+(save.bossBeat[k]?' · Battuto':'')+'</span>':'')+'</div>'}}
  $('codexList').innerHTML=h}
document.querySelectorAll('.ctab').forEach(b=>b.onclick=()=>{sfx('click');codexTab=b.dataset.tab;renderCodex()});
$('codexBtn').onclick=()=>{sfx('click');openCodex()};$('codexBack').onclick=()=>{sfx('click');showMenu()};
const HOW=[['t:granchio','Assumi','Tocca un dipendente in basso: vedi cosa fa, quanto fa male e quanto costa. Poi tocca una piazzola che brilla.'],
  ['e:ghiozzo','Guarda chi arriva','Sopra la mano c\'è l\'anteprima dell\'ondata. Poi premi Inizia ondata.'],
  ['t:squalo','Potenzia o licenzia','Tocca un dipendente già piazzato: sale fino al livello 3, oppure lo licenzi e ti riprendi il 60%.'],
  ['m:polpo','Usa il gestore','Il Polpo Chef serve piatti trappola sul sentiero. Gli altri gestori hanno poteri automatici.'],
  ['t:balena','Scegli una carta','Dopo ogni ondata: potenziamenti, maledizioni (forti ma con un prezzo), piatti speciali o dipendenti nuovi.'],
  ['e:reAragosta','Batti il boss e scendi','Ogni piano finisce con un boss. Scendendo, tutto il personale viene rimborsato.'],
  ['t:rana','Porta la luce','Nella Fossa buia e nell\'Abisso i dipendenti vedono solo vicino a sé o nella luce della Rana faro.'],
  ['m:pagliaccio','Cresci nel Bistrot','Perle e stelle restano: sblocca personale, alza i livelli e migliora il ristorante.']];
function openHow(){hideAll();const ic=x=>{const[t,k]=x.split(':');return t==='t'?ICONS.t[k]:t==='e'?ICONS.e[k]:ICONS.m[k]};
  $('howSteps').innerHTML=HOW.map(([i,t,d])=>'<li><img alt="" src="'+ic(i)+'"><div><b>'+t+'</b><span>'+d+'</span></div></li>').join('');
  $('howFloors').innerHTML=FLOORS.map((f,i)=>itemRow(ICONS.e[f.boss],(i+1)+'. '+f.name,null,f.rule+' Boss: '+ENEMIES[f.boss].name+'.','',false)).join('');show('howto')}
$('howBtn').onclick=()=>{sfx('click');openHow()};$('howBack').onclick=()=>{sfx('click');showMenu()};

/* ---------- pausa, impostazioni, salvataggio ---------- */
let pauseFromMenu=false;
function openPause(fromMenu){pauseFromMenu=fromMenu;if(!fromMenu){if(!S||!['build','wave','mplay'].includes(S.mode))return;S.prev=S.mode;S.mode='pause';closePanel()}
  $('pauseTitle').textContent=fromMenu?'Impostazioni':'Pausa';$('pauseRun').hidden=fromMenu;$('resumeBtn').textContent=fromMenu?'Chiudi':'Riprendi';$('saveMsg').textContent='';
  if(fromMenu)hideAll();show('pause');pausedAudio=!fromMenu;applyVol()}
function syncSeg(){document.querySelectorAll('#panelSeg button').forEach(b=>b.classList.toggle('on',b.dataset.v===pStyle()))}
document.querySelectorAll('#panelSeg button').forEach(b=>b.onclick=()=>{save.panelStyle=b.dataset.v;writeSave();syncSeg();sfx('click');toast('Pannello: '+b.textContent)});syncSeg();
$('pauseBtn').onclick=()=>{sfx('click');openPause(false)};
$('settingsBtn').onclick=$('settings2Btn').onclick=()=>{sfx('click');openPause(true)};
$('resumeBtn').onclick=()=>{sfx('click');show('pause',false);pausedAudio=false;applyVol();if(pauseFromMenu)showMenu();else S.mode=S.prev||'build'};
$('restartBtn').onclick=()=>{sfx('click');if(S.tutorial)stopCoach();quitRun();restartSame()};
$('quitBtn').onclick=()=>{sfx('click');if(S.tutorial)stopCoach();quitRun();showMenu('play')};
function restartSame(){hideAll();shopKey='';pausedAudio=false;applyVol();if(S.duel){S.duel.t==='cc'?startDuelChef(S.duel.seed,S.duel.vs):startDuelMonster(S.duel.seed,S.duel.vs);return}if(S.kitAtk){startKitAttack(S.kitAtk);return}if(S.army){startArmyDefense(S.army);return}if(S.kitBuild){startKitBuilder(WORLD.fi);return}if(S.kind==='mon')startMonster(save.monDeck||ownedMon().slice(0,8));else startDefense(S.run,S.mgr,save.deck&&save.deck.length>=4?save.deck:ownedEmp().slice(0,8))}
$('againBtn').onclick=()=>{sfx('click');restartSame()};
$('endMenuBtn').onclick=()=>{sfx('click');showMenu('play')};
$('endHubBtn').onclick=()=>{sfx('click');openColl()};
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
function drawMenuArt(){ma.setTransform(1,0,0,1,0,0);ma.clearRect(0,0,680,300);ma.setTransform(2,0,0,2,0,0);drawMegaMenu()}
function drawMegaMenu(){const c=ma;
  glowAt(c,170,90,120,'rgba(255,170,80,A)',.18);
  drawLobster(c,300,70+Math.sin(T*1.2)*3,1.05,T);drawEel(c,34,40+Math.sin(T*2)*4,1.3,1,T);
  drawOcto(c,170,78,1.6,T);
  c.beginPath();c.roundRect(96,112,148,30,6);FS(c,'#5e3d27',2.2);c.beginPath();c.roundRect(90,105,160,12,5);FS(c,'#8f5f3d',2.2);for(let k=0;k<5;k++)drawNigiri(c,118+k*26,102,1);
  c.font='16px Bangers,Impact,sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle=INK;c.strokeText('SUSHI BAR',170,134);c.fillStyle='#f1dca2';c.fillText('SUSHI BAR',170,134);
  drawCrab(c,62,118,1,1,T);drawShark(c,272,124,1,-1,T,Math.max(0,Math.sin(T*2.2))*.6);drawJelly(c,112,34+Math.sin(T*1.5)*4,.8,T);drawPuffer(c,232,30,.8,T,Math.max(0,Math.sin(T*1.7)));
  for(let k=0;k<8;k++){const b=((T*20+k*23)%150);E(c,20+k*42+Math.sin(T+k)*4,150-b,1.5+k%3,1.5+k%3);c.strokeStyle='rgba(220,250,255,.5)';c.lineWidth=1;c.stroke()}}
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;
  if(S&&typeof tutTick==='function')tutTick(dt);
  if(S){if(S.mode!=='pause')update(dt*((S.mode==='wave'||S.mode==='mplay')?S.speed:1));render();syncUI()}
  if(!$('menu').hidden)drawMenuArt();if(!$('askOv').hidden){const a=$('askArt').getContext('2d');a.setTransform(1,0,0,1,0,0);a.clearRect(0,0,240,200);a.setTransform(2,0,0,2,0,0);drawOcto(a,60,62,1.5,T)}requestAnimationFrame(frame)}
buildIcons();ICONS.plate=icon(c=>drawPlate(c,24,25,1.5));ICONS.wasabi=icon(c=>drawWasabi(c,24,26,1.6));ICONS.freeze=icon(c=>drawSorbet(c,24,22,1.6));
ICONS.resto={hp:icon(c=>{c.beginPath();c.roundRect(6,22,36,14,4);FS(c,'#5e3d27',2);c.beginPath();c.roundRect(4,17,40,7,3);FS(c,'#8f5f3d',2);for(let k=0;k<3;k++)drawNigiri(c,14+k*10,15,.9)}),
  cash:icon(c=>{for(let k=0;k<6;k++){E(c,12+k*5,34-k*3,6,6);FS(c,'#f1dca2',1.4)}}),cards:icon(c=>{for(let k=0;k<3;k++){c.save();c.translate(24,26);c.rotate((k-1)*.3);c.beginPath();c.roundRect(-9,-13,18,26,3);FS(c,['#46aee8','#ff7a59','#f2c94c'][k],1.8);c.restore()}}),
  deco:icon(c=>{c.beginPath();c.roundRect(4,16,40,16,4);FS(c,'#3a2a3e',2);c.font='11px Bangers,Impact';c.textAlign='center';c.fillStyle='#ff6ad5';c.fillText('SUSHI',24,28)})};
ICONS.deco=DECOS.map(dc=>icon(c=>{c.beginPath();c.roundRect(4,16,40,16,4);FS(c,dc.wood,2);c.font='11px Bangers,Impact';c.textAlign='center';c.fillStyle=dc.sign;c.fillText('SUSHI',24,28)}));
$('tileCodex').src=ICONS.e.granchioReale;$('tileHow').src=ICONS.t.cavalluccio;$('tileSet').src=ICONS.t.lanterna;$('wasabiIco').src=ICONS.wasabi;$('freezeIco').src=ICONS.freeze;$('abilityIco').src=ICONS.plate;
window.abyssView=()=>({OX,OY,SC});window.abyssState=()=>S;
window.abyssIcon=(n,pad)=>{const c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d');const g=x.createRadialGradient(n/2,n*.42,n*.05,n/2,n/2,n*.7);g.addColorStop(0,'#2f6a62');g.addColorStop(1,'#0b1a1c');x.fillStyle=g;x.fillRect(0,0,n,n);const k=n/100*(pad?.78:.9);x.translate(n/2,n/2+n*.06);x.scale(k,k);drawOcto(x,0,0,1.55,.6);return c.toDataURL('image/png')};
try{if('serviceWorker' in navigator&&location.protocol==='https:'&&!/claude\.ai|claudeusercontent/.test(location.hostname))navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}
fit();showMenu();requestAnimationFrame(frame);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{buildIcons();shopKey='';fit()});
