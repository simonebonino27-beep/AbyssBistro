'use strict';
/* ===== Abyss Bistro: PvP a codice, amici, classifica giornaliera, casella di posta =====
   Niente server: ogni sfida è un codice da mandare su WhatsApp/Telegram. Il seme rende uguale il menu per tutti. */
if(!save.name)save.name='Chef'+(100+Math.floor(Math.random()*900));
for(const k of['friends','dailyScore'])if(!save[k])save[k]={};if(!save.inbox)save.inbox=[];writeSave();

/* ---------- codici ---------- */
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16).slice(-5)}
function encodeCode(o){const j=JSON.stringify(o),b=btoa(unescape(encodeURIComponent(j))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');return'ABX-'+b+'-'+hashStr(j)}
function decodeCode(c){c=(c||'').trim().replace(/\s+/g,'');const m=/^ABX-([A-Za-z0-9_-]+)-([0-9a-f]+)$/.exec(c);if(!m)return null;
  try{let b=m[1].replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';const j=decodeURIComponent(escape(atob(b)));if(hashStr(j)!==m[2])return null;return JSON.parse(j)}catch(e){return null}}
const newSeed=()=>1+Math.floor(Math.random()*2e9);
function addFriend(name,patch){if(!name||name===save.name)return;const f=save.friends[name]||(save.friends[name]={name});Object.assign(f,patch||{});f.seen=Date.now();writeSave()}

/* ---------- avvio delle partite PvP ---------- */
function seededPicks(R,pool,n){const p=pool.slice(),out=[];while(out.length<n&&p.length)out.push(p.splice(Math.floor(R()*p.length),1)[0]);return out}
function startDuelChef(seed,vs){rnd=rng(seed);const R=rng(seed+77),f=[0,0,1,2][Math.floor(R()*4)],deck=['granchio','squalo',...seededPicks(R,TOWER_KEYS.filter(k=>!['granchio','squalo','balena'].includes(k)),4)];
  hideAll();shopKey='';S=newRun('def','duel',{mgr:'polpo',deck});S.duel={t:'cc',seed,vs:vs||null};S.floors=[f];S.perle+=100;S.pile=shuffle(deck.slice());S.hand[0]='granchio';S.pile.splice(S.pile.indexOf('granchio'),1);S.pile.push('granchio');for(let i=1;i<3;i++)S.hand[i]=drawCard();enterFloor(0)}
function startDuelMonster(seed,vs){rnd=rng(seed);const R=rng(seed+91),f=Math.floor(R()*6),mdeck=seededPicks(R,MONSTER_KEYS.filter(k=>!ENEMIES[k].boss),6);
  hideAll();shopKey='';S=newRun('mon','mduel',{mdeck});S.duel={t:'mm',seed,vs:vs||null};S.floors=[f];S.mpile=shuffle(mdeck.slice());for(let i=0;i<3;i++)S.mhand[i]=drawMon();enterMonsterFloor(0)}
function startKitBuilder(f){rnd=Math.random;hideAll();shopKey='';S=newRun('def','kit',{deck:TOWER_KEYS.filter(k=>save.emp[k])});S.kitBuild=true;S.floors=[f];S.perle=1000;enterFloor(0)}
function startKitAttack(kit){rnd=Math.random;const mdeck=(save.monDeck&&save.monDeck.length>=3?save.monDeck:MONSTER_KEYS.filter(k=>save.mon[k]).slice(0,8));hideAll();shopKey='';
  S=newRun('mon','kitatk',{mdeck});S.kitAtk=kit;S.floors=[kit.f];S.mpile=shuffle(mdeck.slice());for(let i=0;i<3;i++)S.mhand[i]=drawMon();enterMonsterFloor(0)}
function placeKit(kit){for(const s of WORLD.slots)s.tower=null;S.towers=[];for(const[si,k,lv]of kit.tw){const sl=WORLD.slots[si];if(!sl||!TOWERS[k])continue;const t=makeTower(k,sl);t.lv=Math.max(1,Math.min(3,lv||1));t.spent=TOWERS[k].cost}
  S.noAI=true;S.ai.budget=0;S.ai.income=0;S.ai.dmg=1.15;S.baseMax=S.baseHp=30}
function startArmyDefense(army){rnd=Math.random;const deck=save.deck&&save.deck.length>=4?save.deck:TOWER_KEYS.filter(k=>save.emp[k]).slice(0,8);const mgr=save.mgr[save.mgrSel]?save.mgrSel:'polpo';
  hideAll();shopKey='';S=newRun('def','armydef',{mgr,deck});S.army=army;S.floors=[army.f];S.perle=200;S.pile=shuffle(deck.slice());for(let i=0;i<3;i++)S.hand[i]=drawCard();enterFloor(0)}
function armyWave(w){const seq=[];for(const[k,n]of S.army.a)for(let i=0;i<n;i++)seq.push(k);const per=Math.ceil(seq.length/3),part=seq.slice(w*per,(w+1)*per);
  const q=[];for(const k of part){const e=ENEMIES[k];if(e.group)for(let g=0;g<e.group;g++)q.push([k,g<e.group-1?.28:.7]);else q.push([k,e.boss?2.5:e.hp>=140?1.4:.8])}return q}
/* punteggi */
const duelScoreDef=()=>Math.round(S.total*1000+Math.max(0,S.hp)*25+S.earned);
const duelScoreMon=win=>Math.round(S.dealt*100+(win?2000+Math.max(0,S.timer)*15:0));
function socialEnd(win){let r=null;
  if(S.daily){const sc=duelScoreDef();const k=S.daily;save.dailyScore[k]=Math.max(save.dailyScore[k]||0,sc);writeSave();
    r={title:'Sfida del giorno: '+sc+' punti',text:'Manda il codice agli amici: lo incollano in PvP e finisci nella loro classifica di oggi.',code:encodeCode({t:'day',k,s:save.dailyScore[k],n:save.name})}}
  else if(S.duel){const sc=S.duel.t==='cc'?duelScoreDef():duelScoreMon(win);let text;
    if(S.duel.vs){const v=S.duel.vs;const w=sc>v.s;text=(w?'Hai battuto ':sc===v.s?'Pareggio con ':'Ha vinto ')+v.n+': '+sc+' contro '+v.s+'.';addFriend(v.n,{});(save.friends[v.n].duels=save.friends[v.n].duels||[]).push({t:S.duel.t,me:sc,them:v.s,ts:Date.now()});writeSave()}
    else text='Manda il codice: il tuo amico giocherà esattamente lo stesso menu e proverà a batterti.';
    r={title:(S.duel.t==='cc'?'Duello chef':'Duello mostri')+': '+sc+' punti',text,code:encodeCode({t:S.duel.t,seed:S.duel.seed,s:sc,n:save.name})}}
  else if(S.kitAtk){const sc=duelScoreMon(win);const k=S.kitAtk;addFriend(k.n,{});
    r={title:win?'Cucina di '+k.n+' divorata!':'La cucina di '+k.n+' ha resistito',text:'Punteggio '+sc+'. Manda il risultato a '+k.n+' così vede come è andata.',code:encodeCode({t:'kitres',n:save.name,to:k.n,s:sc,w:win?1:0})}}
  else if(S.army){const sc=duelScoreDef();const a=S.army;addFriend(a.n,{});const held=S.hp>0;
    r={title:held?'Orda di '+a.n+' respinta!':'L\'orda di '+a.n+' ti ha mangiato',text:'Punteggio '+sc+'. Manda il risultato a '+a.n+'.',code:encodeCode({t:'armyres',n:save.name,to:a.n,s:sc,w:held?1:0})}}
  S.share=r;rnd=Math.random}
function shareHTML(r){if(!r)return'';return'<div class="share"><b>'+r.title+'</b><span>'+r.text+'</span><input readonly class="codeBox" value="'+r.code+'"><button class="big sm copyBtn">Copia codice</button><span class="bkM copyMsg"></span></div>'}
function wireCopy(root){root.querySelectorAll('.copyBtn').forEach(b=>b.onclick=()=>{const inp=b.parentNode.querySelector('.codeBox'),msg=b.parentNode.querySelector('.copyMsg');inp.select();
  try{navigator.clipboard.writeText(inp.value).then(()=>msg.textContent='Copiato! Incollalo nella chat',()=>msg.textContent='Selezionato: copialo a mano')}catch(e){msg.textContent='Selezionato: copialo a mano'}sfx('click')})}

/* ---------- schermata PvP ---------- */
let pvpFloor=0;
function openPvp(){showMenu('social')}
function renderPvp(){$('pvpName').value=save.name;$('pvpMsg').textContent='';
  $('pvpFloors').innerHTML=FLOORS.map((f,i)=>'<button class="fchip'+(i===pvpFloor?' on':'')+'" data-f="'+i+'">'+(i+1)+'. '+f.name+'</button>').join('');
  $('pvpFloors').querySelectorAll('.fchip').forEach(b=>b.onclick=()=>{sfx('click');pvpFloor=+b.dataset.f;renderPvp()});
  renderBoard()}
function renderBoard(){const dy=dailyInfo(),k=dy.key;const rows=[{n:save.name+' (tu)',s:save.dailyScore[k]||0,me:1}];
  for(const f of Object.values(save.friends))if(f.day&&f.day.k===k)rows.push({n:f.name,s:f.day.s});rows.sort((a,b)=>b.s-a.s);
  $('boardDate').textContent='Sfida del giorno · '+dy.label;
  $('board').innerHTML=rows.map((r,i)=>'<div class="brow'+(r.me?' me':'')+'"><span class="pos">'+(i+1)+'</span><span class="bn">'+r.n+'</span><span class="bs">'+(r.s?r.s.toLocaleString('it-IT'):'—')+'</span></div>').join('')+
    (rows.length<2?'<p class="hint">Nessun amico in classifica oggi. Gioca la sfida del giorno e scambiatevi i codici.</p>':'');
  const fr=Object.values(save.friends);$('friendList').innerHTML=fr.length?fr.map(f=>{const d=f.duels||[];const w=d.filter(x=>x.me>x.them).length,l=d.filter(x=>x.me<x.them).length;return'<div class="brow"><span class="bn">'+f.name+'</span><span class="bs">'+(d.length?w+' vinte · '+l+' perse':'nessun duello')+'</span></div>'}).join(''):'<p class="hint">Gli amici compaiono qui quando incolli un loro codice.</p>'}
$('pvpName').addEventListener('change',()=>{const v=$('pvpName').value.trim().slice(0,16);if(v){save.name=v;writeSave();toast('Nome salvato: '+v)}});
function pvpPaste(){const o=decodeCode($('pvpCode').value);const msg=t=>{$('pvpMsg').textContent=t};if(!o){sfx('nope');msg('Codice non valido. Deve iniziare con ABX-');return}
  sfx('click');$('pvpCode').value='';
  switch(o.t){
    case'cc':addFriend(o.n,{});startDuelChef(o.seed,{n:o.n,s:o.s});toast('Duello chef contro '+o.n+': da battere '+o.s);break;
    case'mm':addFriend(o.n,{});startDuelMonster(o.seed,{n:o.n,s:o.s});toast('Duello mostri contro '+o.n+': da battere '+o.s);break;
    case'kit':addFriend(o.n,{});startKitAttack(o);toast('Attacchi la cucina di '+o.n);break;
    case'army':addFriend(o.n,{});startArmyDefense(o);toast('L\'orda di '+o.n+' sta arrivando');break;
    case'day':addFriend(o.n,{day:{k:o.k,s:o.s}});renderBoard();msg(o.n+' aggiunto alla classifica: '+o.s+' punti'+(o.k!==dailyInfo().key?' (sfida di un altro giorno)':''));break;
    case'kitres':addFriend(o.n,{});msg(o.n+(o.w?' ha divorato la tua cucina':' non è riuscito a mangiare la tua cucina')+' · punteggio '+o.s);break;
    case'armyres':addFriend(o.n,{});msg(o.n+(o.w?' ha respinto la tua orda':' è stato mangiato dalla tua orda')+' · punteggio '+o.s);break;
    default:msg('Codice di un tipo che questa versione non conosce.')}}
$('pvpGo').onclick=pvpPaste;
$('pvpCC').onclick=()=>{sfx('click');withIntro('pvpcc',()=>{startDuelChef(newSeed(),null);toast('Duello chef: fai il punteggio più alto, poi manda il codice')})};
$('pvpMM').onclick=()=>{sfx('click');withIntro('pvpmm',()=>{startDuelMonster(newSeed(),null);toast('Duello mostri: fai più danni possibile, poi manda il codice')})};
$('pvpCM').onclick=()=>{sfx('click');withIntro('pvpcm',()=>{startKitBuilder(pvpFloor);toast('Hai 1000 perle: costruisci la cucina, poi crea il codice')})};
$('pvpMC').onclick=()=>{sfx('click');withIntro('pvpmc',()=>openArmy())};
Object.assign(MODE_INTRO,{
  pvpcc:{title:'Chef contro Chef',items:[['m:polpo','Giochi un piano con 4 ondate e il boss, con un mazzo deciso dal codice.'],['t:granchio','Il tuo amico riceve lo stesso piano, le stesse ondate e le stesse carte. Vince chi fa più punti.'],['e:ghiozzo','Punti: 1000 per ondata superata, più vita rimasta e perle guadagnate.']]},
  pvpmm:{title:'Mostro contro Mostro',items:[['e:kraken','Un round di Mostro affamato con mostri e piano decisi dal codice.'],['e:ghiozzo','L\'amico attacca la stessa cucina con gli stessi mostri. Vince chi fa più danni e mangia il bancone più in fretta.']]},
  pvpcm:{title:'Chef contro Mostro',items:[['t:balena','Costruisci la tua cucina con 1000 perle su un piano a scelta: dipendenti e livelli.'],['m:polpo','Crei il codice e lo mandi. Il tuo amico, da mostro, prova a divorarla in 2:30.'],['e:ladro','Lui ti rimanda il risultato: lo incolli qui e vedi com\'è andata.']]},
  pvpmc:{title:'Mostro contro Chef',items:[['e:megalodonte','Prepari un\'orda di mostri con 600 di fame, boss compresi se li hai sbloccati.'],['t:squalo','Il tuo amico la affronta con il suo mazzo di dipendenti, in 3 ondate.'],['e:ghiozzo','Se lo mangi vinci tu. Lui ti rimanda il codice del risultato.']]}});

/* ---------- costruttore dell'orda ---------- */
let army={};const ARMY_BUDGET=600;
const armyCost=()=>Object.entries(army).reduce((a,[k,n])=>a+ENEMIES[k].mcost*n,0);
function openArmy(){hideAll();army={};renderArmy();show('armyOv')}
function renderArmy(){$('armyFloor').textContent='Piano: '+FLOORS[pvpFloor].name;const used=armyCost();$('armyBudget').textContent=used+'/'+ARMY_BUDGET+' fame';$('armyFill').style.width=Math.min(100,used/ARMY_BUDGET*100)+'%';
  $('armyList').innerHTML=MONSTER_KEYS.filter(k=>save.mon[k]).map(k=>{const d=ENEMIES[k],n=army[k]||0;return'<div class="item"><img alt="" src="'+ICONS.e[k]+'"><div class="grow"><span class="nm">'+d.name+'</span><span class="md">'+d.mcost+' fame'+(d.boss?' · boss, max 1':'')+(d.group?' · gruppo da '+d.group:'')+' · '+d.info+'</span></div><div class="stepper"><button data-a="-" data-k="'+k+'">−</button><b>'+n+'</b><button data-a="+" data-k="'+k+'"'+(used+d.mcost>ARMY_BUDGET||(d.boss&&n>=1)?' disabled':'')+'>+</button></div></div>'}).join('');
  $('armyGo').disabled=used<100}
$('armyList').addEventListener('click',ev=>{const b=ev.target.closest('button[data-a]');if(!b||b.disabled)return;const k=b.dataset.k;army[k]=Math.max(0,(army[k]||0)+(b.dataset.a==='+'?1:-1));if(!army[k])delete army[k];sfx('click');renderArmy()});
$('armyGo').onclick=()=>{const a=Object.entries(army);if(!a.length)return;sfx('unlock');showShare({title:'Orda pronta: '+armyCost()+' fame',text:'Manda il codice al tuo amico: lo incolla in PvP e deve difendersi sul piano '+FLOORS[pvpFloor].name+'.',code:encodeCode({t:'army',f:pvpFloor,a,n:save.name})})};
$('armyBack').onclick=()=>{sfx('click');openPvp()};
function exportKit(){const tw=S.towers.map(t=>[WORLD.slots.indexOf(t.slot),t.key,t.lv]).filter(x=>x[0]>=0);if(!tw.length){toast('Assumi almeno un dipendente');return}
  sfx('unlock');const code=encodeCode({t:'kit',f:WORLD.fi,tw,n:save.name});S.mode='end';showShare({title:'Cucina pronta: '+tw.length+' dipendenti',text:'Manda il codice: il tuo amico la attacca da mostro. Quando ti rimanda il risultato, incollalo in PvP.',code})}
function showShare(r){hideAll();$('shareBody').innerHTML=shareHTML(r);wireCopy($('shareBody'));show('shareOv')}
$('shareBack').onclick=()=>{sfx('click');openPvp()};

/* ---------- casella di posta ---------- */
const LOGIN_REWARDS=[{perle:100},{perle:150},{pack:'comune'},{perle:250},{stars:1},{pack:'raro'},{pack:'epico',stars:2}];
const dayKey=d=>d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();
function mail(title,body,rw){save.inbox.unshift({id:Date.now()+Math.random(),ts:Date.now(),title,body,rw:rw||null,claimed:!rw});if(save.inbox.length>40)save.inbox.length=40;writeSave()}
function checkLogin(){const now=new Date(),today=dayKey(now),y=new Date(now);y.setDate(now.getDate()-1);
  if(!save.welcomed){save.welcomed=1;mail('Benvenuto all\'Abyss Bistro!','Il Polpo Chef ti regala un Sacchetto d\'alghe e 200 perle per iniziare. Torna ogni giorno: c\'è un premio di accesso, e il settimo giorno è un Forziere.',{perle:200,pack:'comune'})}
  if(save.lastLogin===today)return;save.streak=save.lastLogin===dayKey(y)?(save.streak||0)+1:1;save.lastLogin=today;
  const d=(save.streak-1)%7,rw=LOGIN_REWARDS[d];
  mail('Premio di accesso · giorno '+(d+1)+' di 7','Serie di '+save.streak+' giorn'+(save.streak===1?'o':'i')+' di fila. '+(d===6?'Settimo giorno: Forziere abissale e stelle!':'Domani il premio è ancora più grosso.'),rw);
  if(save.streak===1&&!save.pvpNews){save.pvpNews=1;mail('Novità: PvP a codice','Sfida gli amici in 4 modi: chef contro chef, mostro contro mostro, la tua cucina contro i loro mostri, la tua orda contro i loro chef. E c\'è la classifica della sfida del giorno.',null)}}
function rwHTML(rw){if(!rw)return'';let h='';if(rw.perle)h+='<span class="rw"><span class="pearl"></span>'+rw.perle+'</span>';if(rw.stars)h+='<span class="rw"><span class="starI"></span>'+rw.stars+'</span>';if(rw.pack)h+='<span class="rw"><img alt="" src="'+ICONS.pack[rw.pack]+'">'+PACKS[rw.pack].name+'</span>';return h}
function claim(m){if(m.claimed||!m.rw)return;const r=m.rw;if(r.perle)save.perle+=r.perle;if(r.stars)save.stars+=r.stars;if(r.pack)save.packs[r.pack]=(save.packs[r.pack]||0)+1;m.claimed=true}
function openInbox(){hideAll();renderInbox();show('inbox')}
function renderInbox(){const list=save.inbox;$('mailStreak').textContent='Serie di accesso: '+(save.streak||0)+((save.streak||0)===1?' giorno':' giorni');
  $('mailDays').innerHTML=LOGIN_REWARDS.map((r,i)=>'<span class="dday'+(((save.streak||1)-1)%7>=i?' got':'')+'"><i>G'+(i+1)+'</i>'+rwHTML(r)+'</span>').join('');
  $('mailList').innerHTML=list.length?list.map((m,i)=>'<div class="mail'+(m.claimed?' done':'')+'"><div class="grow"><b>'+m.title+'</b><span>'+m.body+'</span><div class="rws">'+rwHTML(m.rw)+'</div></div>'+(m.rw?(m.claimed?'<span class="req">Riscosso</span>':'<button class="buy" data-i="'+i+'">Riscuoti</button>'):'')+'</div>').join(''):'<p class="hint">Nessun messaggio.</p>';
  $('mailAll').hidden=!list.some(m=>!m.claimed)}
$('mailList').addEventListener('click',ev=>{const b=ev.target.closest('button[data-i]');if(!b)return;claim(save.inbox[+b.dataset.i]);writeSave();sfx('unlock');renderInbox()});
$('mailAll').onclick=()=>{save.inbox.forEach(claim);writeSave();sfx('unlock');renderInbox()};
$('mailBtn').onclick=()=>{sfx('click');openInbox()};$('mailBack').onclick=()=>{sfx('click');showMenu()};
function mailBadge(){const n=save.inbox.filter(m=>!m.claimed).length;$('mailBadge').hidden=!n;$('mailBadge').textContent=n}
checkLogin();
$('pvpI1').src=ICONS.m.polpo;$('pvpI2').src=ICONS.e.kraken;$('pvpI3').src=ICONS.t.balena;$('pvpI4').src=ICONS.e.megalodonte;
if(!$('menu').hidden){mailBadge()}
