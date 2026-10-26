'use strict';
/* ===== Abyss Bistro: pacchetti, copie, livello giocatore e Le mie carte ===== */
const PACK_KEYS=['comune','raro','epico','leggendario'];
const PACKS={
  comune:{name:'Sacchetto d\'alghe',price:300,n:3,odds:{comune:.72,noncomune:.24,raro:.04},min:'comune',col:'#6fc27a',info:'3 carte · soprattutto comuni'},
  raro:{name:'Cassa del relitto',price:800,n:4,odds:{comune:.35,noncomune:.4,raro:.2,epico:.05},min:'raro',col:'#46aee8',info:'4 carte · almeno 1 rara'},
  epico:{name:'Forziere abissale',price:1800,n:5,odds:{noncomune:.35,raro:.38,epico:.22,leggendario:.05},min:'epico',col:'#ff7a59',info:'5 carte · almeno 1 epica · stelle'},
  leggendario:{name:'Scrigno del Megalodonte',price:4000,n:6,odds:{raro:.45,epico:.4,leggendario:.15},min:'leggendario',col:'#f2c94c',info:'6 carte · almeno 1 leggendaria · gestori'}};
const RAR_ORDER=['comune','noncomune','raro','epico','leggendario'];
const COPIES_FOR=[0,2,4,6,10];/* copie per passare dal livello l al l+1 */
for(const k of['packs','copies'])if(!save[k])save[k]={};for(const k of PACK_KEYS)save.packs[k]=save.packs[k]||0;if(!save.xp)save.xp=0;if(!save.lvl)save.lvl=1;
const xpNeed=l=>100+l*50;
function pickRar(odds){let r=Math.random(),acc=0;for(const k of RAR_ORDER){if(!odds[k])continue;acc+=odds[k];if(r<=acc)return k}return Object.keys(odds).pop()}
function grantChar(kind,key){const own=kind==='emp'?save.emp:kind==='mon'?save.mon:save.mgr,def=kind==='emp'?TOWERS[key]:kind==='mon'?ENEMIES[key]:MANAGERS[key];
  if(!own[key]){own[key]=1;return{kind,key,rar:def.rar,status:'new'}}
  if(kind==='mgr'){save.perle+=250;return{kind,key,rar:def.rar,status:'max',amount:250}}
  const ck=(kind==='mon'?'m:':'')+key;if(own[key]>=LVL_MAX){const p=Math.round(RAR[def.rar].price*.2);save.perle+=p;return{kind,key,rar:def.rar,status:'max',amount:p}}
  save.copies[ck]=(save.copies[ck]||0)+1;const need=COPIES_FOR[own[key]];
  return{kind,key,rar:def.rar,status:save.copies[ck]>=need?'ready':'copy',have:save.copies[ck],need}}
const copiesOf=(kind,key)=>save.copies[(kind==='mon'?'m:':'')+key]||0;
const lvlCost=(kind,key)=>kind==='mon'?monLvlCost(key,save.mon[key]):empLvlCost(key,save.emp[key]);
function canLevel(kind,key){const l=(kind==='mon'?save.mon:save.emp)[key];return l&&l<LVL_MAX&&copiesOf(kind,key)>=COPIES_FOR[l]}
function doLevel(kind,key){const own=kind==='mon'?save.mon:save.emp,l=own[key],c=lvlCost(kind,key);if(!canLevel(kind,key)||save.perle<c)return false;
  save.perle-=c;save.copies[(kind==='mon'?'m:':'')+key]-=COPIES_FOR[l];own[key]++;writeSave();return true}
function rollPack(tier){const P=PACKS[tier],out=[];
  for(let i=0;i<P.n;i++){let rar=pickRar(P.odds);if(i===P.n-1&&!out.some(o=>RAR_ORDER.indexOf(o.rar)>=RAR_ORDER.indexOf(P.min)))rar=P.min;
    const r=Math.random();let kind=r<.22?'mon':'emp';if((tier==='epico'&&r>.94)||(tier==='leggendario'&&r>.85))kind='mgr';
    let pool=kind==='emp'?TOWER_KEYS.filter(k=>TOWERS[k].rar===rar):kind==='mon'?MONSTER_KEYS.filter(k=>!ENEMIES[k].boss&&ENEMIES[k].rar===rar):MANAGER_KEYS.filter(k=>!save.mgr[k]);
    if(!pool.length){kind='emp';pool=TOWER_KEYS.filter(k=>TOWERS[k].rar===rar)}
    if(!pool.length){const p=Math.round(RAR[rar].price*.3);save.perle+=p;out.push({kind:'perle',rar,amount:p,status:'bonus'});continue}
    const locked=pool.filter(k=>!(kind==='emp'?save.emp:kind==='mon'?save.mon:save.mgr)[k]);const key=locked.length&&Math.random()<.55?pick(locked):pick(pool);out.push(grantChar(kind,key))}
  const pr=40*P.n*(PACK_KEYS.indexOf(tier)+1);save.perle+=pr;out.push({kind:'perle',rar:'comune',amount:pr,status:'bonus'});
  if(tier==='epico'||tier==='leggendario'){const st=tier==='epico'?1:3;save.stars+=st;out.push({kind:'stars',rar:'epico',amount:st,status:'bonus'})}
  writeSave();return out}
/* premi durante le run */
const FLOOR_PACK=['comune','comune','raro','raro','epico','leggendario'];
function awardPack(tier,why){save.packs[tier]=(save.packs[tier]||0)+1;writeSave();if(S){(S.packsWon=S.packsWon||[]).push(tier);toast('Pacchetto vinto: '+PACKS[tier].name+(why?' · '+why:''))}}
function addXP(n){save.xp+=n;while(save.xp>=xpNeed(save.lvl)){save.xp-=xpNeed(save.lvl);save.lvl++;const tier=save.lvl%10===0?'epico':save.lvl%5===0?'raro':'comune';if(!save.packs)save.packs={};save.packs[tier]=(save.packs[tier]||0)+1;if(S){(S.lvlUps=S.lvlUps||[]).push(save.lvl);(S.packsWon=S.packsWon||[]).push(tier)}sfx('unlock')}writeSave()}

/* icone dei pacchetti */
function drawPack(c,tier,x,y,s){c.save();c.translate(x,y);c.scale(s,s);const col=PACKS[tier].col;
  if(tier==='comune'){c.beginPath();c.moveTo(-14,-6);c.quadraticCurveTo(-18,16,0,17);c.quadraticCurveTo(18,16,14,-6);c.closePath();FS(c,'#4f7a3a',2.2);c.beginPath();c.moveTo(-12,-6);c.lineTo(-6,-16);c.lineTo(0,-8);c.lineTo(6,-17);c.lineTo(12,-6);FS(c,'#6a944a',2);L(c,-10,-5,10,-5,'#e8c14a',2.4);for(let k=0;k<4;k++){E(c,-6+k*4,6+(k%2)*3,1.5,1.5);c.fillStyle='#8fcf4f';c.fill()}}
  else if(tier==='raro'){c.beginPath();c.rect(-16,-10,32,24);FS(c,'#6b4a2b',2.2);for(const yy of[-2,6])L(c,-16,yy,16,yy,'#3a2414',1.4);for(const xx of[-16,16])L(c,xx,-10,xx,14,'#3a3e40',3);L(c,-16,-10,16,-10,'#3a3e40',3);c.beginPath();c.rect(-4,-2,8,8);FS(c,col,1.4)}
  else if(tier==='epico'){c.beginPath();c.rect(-17,-2,34,17);FS(c,'#5a3c22',2.2);c.beginPath();c.moveTo(-17,-2);c.quadraticCurveTo(0,-22,17,-2);c.closePath();FS(c,'#6b4a2b',2.2);L(c,-17,-2,17,-2,col,2.6);L(c,0,-14,0,15,col,2.6);E(c,0,4,3.5,3.5);FS(c,'#e8c14a',1.2);glowAt(c,0,-4,26,'rgba(255,122,89,A)',.35)}
  else{glowAt(c,0,0,32,'rgba(255,210,63,A)',.5);c.beginPath();c.moveTo(-18,4);c.quadraticCurveTo(-16,-20,0,-20);c.quadraticCurveTo(16,-20,18,4);c.closePath();FS(c,'#e8c14a',2.2);for(let k=-3;k<=3;k++)L(c,k*4,-18,k*5,3,'rgba(120,80,10,.6)',1.2);c.beginPath();c.rect(-18,2,36,14);FS(c,'#c99a2a',2.2);E(c,0,9,4,4);FS(c,'#46aee8',1.4);
    for(let k=0;k<3;k++)P(c,[-20+k*20,-22,-18+k*20,-26,-16+k*20,-22]),FS(c,'#f1dca2',.8)}
  c.restore()}
ICONS.pack={};for(const k of PACK_KEYS)ICONS.pack[k]=icon(c=>drawPack(c,k,24,26,1.05),48,48);
ICONS.packBig={};for(const k of PACK_KEYS)ICONS.packBig[k]=icon(c=>drawPack(c,k,48,54,2.1),96,100);

/* ---------- Le mie carte ---------- */
let collTab='emp';
function openColl(){showMenu('coll')}
function charCard(kind,key){const own=kind==='emp'?save.emp:kind==='mon'?save.mon:save.mgr,d=kind==='emp'?TOWERS[key]:kind==='mon'?ENEMIES[key]:MANAGERS[key],l=own[key];
  const img=kind==='emp'?ICONS.t[key]:kind==='mon'?ICONS.e[key]:ICONS.m[key],name=kind==='emp'?d.full:d.name;
  let foot='';if(!l)foot='<span class="cl">Da trovare</span>';else if(kind==='mgr')foot='<span class="cl">Sbloccato</span>';else if(l>=LVL_MAX)foot='<span class="cl">Livello MAX</span>';
  else{const have=copiesOf(kind,key),need=COPIES_FOR[l],ready=have>=need,c=lvlCost(kind,key);foot='<span class="cl">Lv '+l+' · copie '+have+'/'+need+'</span><span class="cbar'+(ready?' full':'')+'"><i style="width:'+Math.min(100,have/need*100)+'%"></i></span>'+
    (ready?'<button class="buy" data-lv="'+kind+':'+key+'"'+(save.perle<c?' disabled':'')+'>Potenzia · '+c+'</button>':'')}
  return'<div class="mc'+(l?'':' unk')+'" data-k="'+key+'" role="button" tabindex="0" style="--rc:var('+RAR[d.rar].c+')"><span class="rr">'+RAR[d.rar].n+'</span><img alt="" src="'+img+'"><span class="nm">'+name+'</span>'+foot+'</div>'}
function renderColl(){updWallet();$('collLvl').textContent='Livello '+save.lvl;$('collXp').style.width=(save.xp/xpNeed(save.lvl)*100)+'%';$('collXpLbl').textContent=save.xp+'/'+xpNeed(save.lvl)+' esperienza';
  $('packList').innerHTML=PACK_KEYS.map(k=>{const P=PACKS[k],n=save.packs[k]||0;return'<div class="pk" style="--rc:'+P.col+'"><img alt="" src="'+ICONS.pack[k]+'"><div class="grow"><span class="nm">'+P.name+'</span><span class="md">'+P.info+'</span></div><div class="pkb">'+
    (n?'<button class="buy" data-open="'+k+'">Apri ('+n+')</button>':'')+'<button class="buy alt" data-buy="'+k+'"'+(save.perle<P.price?' disabled':'')+'><span class="pearl"></span>'+P.price+'</button></div></div>'}).join('');
  document.querySelectorAll('.coltab').forEach(b=>b.classList.toggle('on',b.dataset.tab===collTab));
  const keys=collTab==='emp'?TOWER_KEYS:collTab==='mon'?MONSTER_KEYS:MANAGER_KEYS;const own=collTab==='emp'?save.emp:collTab==='mon'?save.mon:save.mgr;
  $('collCount').textContent=keys.filter(k=>own[k]).length+'/'+keys.length+' trovate';
  const sorted=keys.slice().sort((a,b)=>(own[b]?1:0)-(own[a]?1:0)||RAR_ORDER.indexOf((collTab==='emp'?TOWERS:collTab==='mon'?ENEMIES:MANAGERS)[a].rar)-RAR_ORDER.indexOf((collTab==='emp'?TOWERS:collTab==='mon'?ENEMIES:MANAGERS)[b].rar));
  $('collGrid').innerHTML=sorted.map(k=>charCard(collTab,k)).join('')}
$('packList').addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.buy){const k=b.dataset.buy;if(save.perle<PACKS[k].price){sfx('nope');return}save.perle-=PACKS[k].price;save.packs[k]++;writeSave();sfx('coin');menuRender();toast(PACKS[k].name+' comprato: lo apri in Carte');return}
  if(b.dataset.open)openPack(b.dataset.open)});
/* scheda del personaggio: statistiche da 1 a 100 */
const st100=(v,max)=>Math.max(1,Math.min(100,Math.round(v/max*100)));
const DPS=k=>{const d=TOWERS[k];return d.dmg?d.dmg/d.rate:0};
const MAXDPS=Math.max(...EMP_KEYS.map(DPS)),MAXRANGE=Math.max(...EMP_KEYS.map(k=>TOWERS[k].range)),MAXCOST=Math.max(...EMP_KEYS.map(k=>TOWERS[k].cost));
const NB=MONSTER_KEYS.filter(k=>!ENEMIES[k].boss),BS=MONSTER_KEYS.filter(k=>ENEMIES[k].boss);
const mmax=(ks,f)=>Math.max(...ks.map(k=>f(ENEMIES[k])));
function statsFor(kind,key){const lv=(kind==='emp'?save.emp:save.mon)[key]||1;
  if(kind==='emp'&&isSpell(key)){const d=TOWERS[key],m=1+.1*(lv-1);return[['Raggio',st100(d.range||40,70),d.range?String(d.range):'tutto il campo'],['Potenza',st100((d.dmg||40)*m,90),d.dmg?Math.round(d.dmg*m)+' danni':'+60% velocità'],['Prezzo in partita',st100(d.cost,MAXCOST),d.cost+' perle']]}
  if(kind==='emp'){const d=TOWERS[key],m=1+.1*(lv-1),sup=!d.dmg;
    return[[sup?'Danno (supporto)':'Danno',sup?1:st100(DPS(key)*m,MAXDPS),sup?'non attacca':fmt(d.dmg*m)+' a colpo'],['Gittata',st100(d.range,MAXRANGE),String(d.range)],['Velocità d\'attacco',st100(1/d.rate,1/.25),'1 ogni '+d.rate+'s'],['Prezzo in partita',st100(d.cost,MAXCOST),d.cost+' perle']]}
  const d=ENEMIES[key],ks=d.boss?BS:NB,m=1+.12*(lv-1);
  return[['Vita',st100(d.hp*m,mmax(ks,e=>e.hp)),Math.round(d.hp*m)+(d.boss?' (in difesa)':'')],['Velocità',st100(d.speed,mmax(MONSTER_KEYS,e=>e.speed)),String(d.speed)],['Morso al bancone',st100(d.dmg,mmax(ks,e=>e.dmg)),String(d.dmg)],['Fame',st100(d.mcost,10),d.mcost+' su 10'+(d.group?' · gruppo da '+d.group:'')]]}
function openCInfo(kind,key){const own=kind==='emp'?save.emp:kind==='mon'?save.mon:save.mgr,d=kind==='emp'?TOWERS[key]:kind==='mon'?ENEMIES[key]:MANAGERS[key],l=own[key];
  const img=kind==='emp'?ICONS.t[key]:kind==='mon'?ICONS.e[key]:ICONS.m[key],name=kind==='emp'?d.full:d.name+(d.title?' · '+d.title:'');
  let h='<div class="ciHead" style="--rc:var('+RAR[d.rar].c+')"><img alt="" src="'+img+'"><div><span class="chip" style="background:var('+RAR[d.rar].c+')">'+RAR[d.rar].n+'</span><b>'+name+'</b><span class="ciLv">'+(l?(kind==='mgr'?'Sbloccato':'Livello '+l+' di '+LVL_MAX):'Da trovare')+'</span></div></div><p class="ciInfo">'+d.info+'</p>';
  if(kind!=='mgr')h+='<div class="ciStats">'+statsFor(kind,key).map(([n,v,r])=>'<div class="ciS"><span class="ciN">'+n+'</span><span class="ciBar"><i style="width:'+v+'%"></i></span><b>'+v+'</b><span class="ciR">'+r+'</span></div>').join('')+'</div>';
  if(kind!=='mgr'&&l&&l<LVL_MAX)h+='<p class="hint">Al livello '+(l+1)+': '+(kind==='emp'?'+10% danni':'+12% vita')+' · copie '+copiesOf(kind,key)+'/'+COPIES_FOR[l]+'</p>';
  if(d.joke)h+='<p class="ciJoke">'+d.joke+'</p>';
  $('cinfoBody').innerHTML=h;show('cinfo');sfx('click')}
$('cinfo').addEventListener('click',ev=>{if(ev.target.id==='cinfo'||ev.target.closest('#cinfoClose')){sfx('click');show('cinfo',false)}});
let lpT=0;$('collGrid').addEventListener('pointerdown',ev=>{const c=ev.target.closest('.mc');if(!c||ev.target.closest('button'))return;clearTimeout(lpT);lpT=setTimeout(()=>{lpT='done';openCInfo(collTab,c.dataset.k)},450)});
['pointerup','pointerleave','pointercancel'].forEach(t=>$('collGrid').addEventListener(t,()=>{if(lpT!=='done')clearTimeout(lpT)}));
$('collGrid').addEventListener('click',ev=>{const c=ev.target.closest('.mc');if(c&&!ev.target.closest('button')){if(lpT==='done'){lpT=0;return}openCInfo(collTab,c.dataset.k);return}const b=ev.target.closest('button[data-lv]');if(!b||b.disabled)return;const[kind,key]=b.dataset.lv.split(':');if(doLevel(kind,key)){sfx('unlock');renderColl()}else sfx('nope')});
document.querySelectorAll('.coltab').forEach(b=>b.onclick=()=>{sfx('click');collTab=b.dataset.tab;renderColl()});

/* ---------- apertura pacchetto ---------- */
let packItems=[],packShown=0;
function itemHTML(it){if(it.kind==='perle')return'<div class="pi bonus" style="--rc:var(--pearl)"><span class="big3"><span class="pearl"></span>+'+it.amount+'</span><span class="nm">Perle</span></div>';
  if(it.kind==='stars')return'<div class="pi bonus" style="--rc:var(--star)"><span class="big3"><span class="starI"></span>+'+it.amount+'</span><span class="nm">Stelle</span></div>';
  const d=it.kind==='emp'?TOWERS[it.key]:it.kind==='mon'?ENEMIES[it.key]:MANAGERS[it.key],img=it.kind==='emp'?ICONS.t[it.key]:it.kind==='mon'?ICONS.e[it.key]:ICONS.m[it.key];
  const tag=it.status==='new'?'<span class="tag new">NUOVO!</span>':it.status==='ready'?'<span class="tag lvl">Copie '+it.have+'/'+it.need+' · potenziabile!</span>':it.status==='max'?'<span class="tag">+'+it.amount+' perle</span>':'<span class="tag">Copia '+it.have+'/'+it.need+'</span>';
  const what=it.kind==='emp'?'Dipendente':it.kind==='mon'?'Mostro':'Gestore';
  return'<div class="pi" style="--rc:var('+RAR[it.rar].c+')">'+tag+'<img alt="" src="'+img+'"><span class="nm">'+(it.kind==='emp'?d.full:d.name)+'</span><span class="ty">'+what+' · '+RAR[it.rar].n+'</span></div>'}
function openPack(tier){if(!save.packs[tier])return;save.packs[tier]--;packItems=rollPack(tier);packShown=0;hideAll();
  $('packTitle').textContent=PACKS[tier].name;$('packImg').src=ICONS.packBig[tier];$('packImg').hidden=false;$('packImg').classList.remove('burst');$('packGrid').innerHTML='';$('packHint').textContent='Tocca il pacchetto per aprirlo';$('packDone').hidden=true;$('packAgain').hidden=true;$('packSkip').hidden=true;$('packTier').value=tier;show('packOv');sfx('card')}
$('packImg').onclick=()=>{const img=$('packImg');if(img.classList.contains('burst'))return;img.classList.add('burst');sfx('boom');setTimeout(()=>{img.hidden=true;revealNext()},380)};
function packEnd(){$('packHint').textContent='';$('packSkip').hidden=true;$('packDone').hidden=false;const t=$('packTier').value;$('packAgain').hidden=!save.packs[t];$('packAgain').textContent='Apri un altro ('+(save.packs[t]||0)+')'}
function revealNext(){const g=$('packGrid');if(packShown>=packItems.length){packEnd();const t=$('packTier').value;$('packAgain').hidden=!save.packs[t];$('packAgain').textContent='Apri un altro ('+(save.packs[t]||0)+')';return}
  const it=packItems[packShown++];const w=document.createElement('div');w.className='flip';w.innerHTML=itemHTML(it);g.appendChild(w);
  sfx(it.status==='new'||it.rar==='leggendario'||it.rar==='epico'?'unlock':it.kind==='perle'||it.kind==='stars'?'coin':'card');
  if(packShown>=packItems.length){packEnd();return}$('packHint').textContent='Tocca per la prossima carta';$('packSkip').hidden=false}
$('packOv').addEventListener('click',ev=>{if(ev.target.closest('button')||ev.target.id==='packImg')return;if($('packImg').hidden)revealNext()});
$('packSkip').onclick=()=>{sfx('click');while(packShown<packItems.length)revealNext()};
$('packDone').onclick=()=>{sfx('click');openColl()};$('packAgain').onclick=()=>{sfx('click');openPack($('packTier').value)};
/* riepilogo dei premi in fondo alla run */
function rewardsHTML(){if(!S)return'';let h='';if(S.lvlUps&&S.lvlUps.length)h+='<span class="lvlup">Livello '+S.lvlUps[S.lvlUps.length-1]+' raggiunto!</span>';
  if(S.packsWon&&S.packsWon.length)h+=S.packsWon.map(t=>'<span><img alt="" src="'+ICONS.pack[t]+'">'+PACKS[t].name+'</span>').join('');return h}
