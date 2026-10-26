/* Abyss Bistro: menu principale a 5 schede (Negozio, Carte, Gioca, Amici, Ristorante), si scorre col dito o dalla barra in basso */
const PAGES=['shop','coll','play','social','resto'];let menuTab='play';
const pagesEl=$('mPages');
const todayKey=()=>dayKey(new Date());
function navOn(p){$('mNav').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.p===p));if(p==='shop')seenShop()}
function goTab(p,instant){if(!PAGES.includes(p))p='play';menuTab=p;navOn(p);const go=()=>pagesEl.scrollTo({left:PAGES.indexOf(p)*pagesEl.clientWidth,behavior:instant?'auto':'smooth'});go();if(instant)requestAnimationFrame(go)}
$('mNav').querySelectorAll('button').forEach(b=>b.onclick=()=>{sfx('click');goTab(b.dataset.p)});
pagesEl.addEventListener('scroll',()=>{const i=Math.round(pagesEl.scrollLeft/Math.max(1,pagesEl.clientWidth)),p=PAGES[i];if(p&&p!==menuTab){menuTab=p;navOn(p)}},{passive:true});
window.addEventListener('resize',()=>{if(!$('menu').hidden)goTab(menuTab,true)});
document.addEventListener('keydown',e=>{if($('menu').hidden||/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;const i=PAGES.indexOf(menuTab);
  if(e.key==='ArrowLeft'&&i>0)goTab(PAGES[i-1]);if(e.key==='ArrowRight'&&i<4)goTab(PAGES[i+1])});

/* offerte del giorno: uguali per tutto il giorno, una volta ciascuna */
function todayDeals(){const k=todayKey();if(!save.deals||save.deals.k!==k)save.deals={k,b:[]};const R=rng(k*7+3);
  const emp=TOWER_KEYS.filter(x=>TOWERS[x].rar!=='leggendario'),mon=MONSTER_KEYS.filter(x=>!ENEMIES[x].boss);
  const e=emp[Math.floor(R()*emp.length)],m=mon[Math.floor(R()*mon.length)],pk=R()<.7?'raro':'epico';
  const cp=(kind,key)=>{const d=kind==='emp'?TOWERS[key]:ENEMIES[key],own=(kind==='emp'?save.emp:save.mon)[key];return own?Math.round(RAR[d.rar].price*.35):Math.round(RAR[d.rar].price*(kind==='mon'?.45:.75))};
  return[{id:'f',kind:'free',price:0},{id:'e',kind:'emp',key:e,price:cp('emp',e)},{id:'m',kind:'mon',key:m,price:cp('mon',m)},{id:'p',kind:'pack',key:pk,price:Math.round(PACKS[pk].price*.7)}]}
function seenShop(){if(save.shopSeen!==todayKey()){save.shopSeen=todayKey();writeSave();badges()}}
function renderDeals(){const ds=todayDeals(),now=new Date(),mid=new Date(now);mid.setHours(24,0,0,0);const left=mid-now;
  $('dealTimer').textContent='· nuove tra '+Math.floor(left/36e5)+'h '+Math.floor(left/6e4)%60+'m';
  $('dealList').innerHTML=ds.map(d=>{const got=save.deals.b.includes(d.id);let img,name,sub,rar;
    if(d.kind==='emp'){const t=TOWERS[d.key];img=ICONS.t[d.key];name=t.name;rar=t.rar;sub=save.emp[d.key]?'1 copia':'Sblocco'}
    else if(d.kind==='mon'){const t=ENEMIES[d.key];img=ICONS.e[d.key];name=t.name;rar=t.rar;sub=save.mon[d.key]?'1 copia':'Sblocco'}
    else if(d.kind==='pack'){img=ICONS.pack[d.key];name=PACKS[d.key].name;rar=d.key;sub='-30%'}
    else{img=ICONS.resto.cash;name='Mancia del giorno';rar='comune';sub='+40 perle'}
    return'<button class="deal'+(got?' got':'')+'" data-d="'+d.id+'" style="--rc:var('+RAR[rar].c+')"'+(got?' disabled':'')+'><span class="dsub">'+sub+'</span><img alt="" src="'+img+'"><span class="dn">'+name+'</span><span class="dp">'+(got?'Preso':d.price?'<span class="pearl"></span>'+d.price:'Gratis')+'</span></button>'}).join('')}
$('dealList').addEventListener('click',ev=>{const b=ev.target.closest('button[data-d]');if(!b||b.disabled)return;const d=todayDeals().find(x=>x.id===b.dataset.d);
  if(!d||save.deals.b.includes(d.id))return;if(save.perle<d.price){sfx('nope');toast('Servono '+d.price+' perle');return}
  save.perle-=d.price;save.deals.b.push(d.id);
  if(d.kind==='pack'){save.packs[d.key]=(save.packs[d.key]||0)+1;toast(PACKS[d.key].name+' preso: lo apri in Carte')}
  else if(d.kind==='free'){save.perle+=40;toast('+40 perle di mancia')}
  else{const r=grantChar(d.kind,d.key);toast(r.status==='new'?'Sbloccato! Ora è nella tua collezione':r.status==='max'?'Già al massimo: +'+r.amount+' perle':r.status==='ready'?'Copia presa: puoi potenziarlo in Carte!':'Copia aggiunta: '+r.have+'/'+r.need)}
  sfx('unlock');writeSave();menuRender()});

/* pacchetti da aprire nella scheda Carte */
function renderPackOpen(){const ks=PACK_KEYS.filter(k=>save.packs[k]);
  $('packOpenList').innerHTML=ks.map(k=>'<div class="pk" style="--rc:'+PACKS[k].col+'"><img alt="" src="'+ICONS.pack[k]+'"><div class="grow"><span class="nm">'+PACKS[k].name+'</span><span class="md">'+save.packs[k]+' da aprire</span></div><div class="pkb"><button class="buy" data-open="'+k+'">Apri</button></div></div>').join('')}
$('packOpenList').addEventListener('click',ev=>{const b=ev.target.closest('button[data-open]');if(b)openPack(b.dataset.open)});

/* pallini rossi sulla barra */
function badges(){const np=Object.values(save.packs||{}).reduce((a,b)=>a+b,0),lv=TOWER_KEYS.filter(k=>canLevel('emp',k)).length+MONSTER_KEYS.filter(k=>canLevel('mon',k)).length;
  const set=(id,n)=>{const el=$(id);el.hidden=!n;el.textContent=n===true?'!':n};
  set('packBadge',np+lv);set('navB0',save.shopSeen!==todayKey()?true:0);
  set('navB4',Object.keys(RESTO).some(k=>save.resto[k]<RESTO[k].max&&save.stars>=RESTO[k].cost(save.resto[k]))?true:0)}

function menuRender(tab){updWallet();renderHub();renderResto();renderColl();renderPackOpen();renderDeals();if(typeof renderPvp==='function')renderPvp();badges();if(tab!==undefined||!$('menu').hidden)goTab(tab||menuTab,true)}

$('tut2Btn').onclick=()=>$('tutBtn').click();
const navIcons=[ICONS.pack.epico,ICONS.t.granchio,ICONS.m.polpo,ICONS.e.megalodonte,ICONS.resto.hp];navIcons.forEach((s,i)=>$('navI'+i).src=s);
$('tileTut').src=ICONS.m.polpo;
if(!$('menu').hidden)menuRender('play');
