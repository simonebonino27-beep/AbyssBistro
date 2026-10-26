/* Abyss Bistro online: Supabase Realtime per il PvP in diretta (Presence per chi è online, Broadcast per le partite)
   e database per profilo, classifica della sfida del giorno e brigate. Senza internet il gioco resta tutto offline.
   Prova in locale senza server: apri due schede con ?localnet=1&slot=a e ?localnet=1&slot=b */
const SB_URL='https://pwktajnezftpsxkmbngs.supabase.co',SB_KEY='sb_publishable_Q57yxMhuBDjrpx3_NTDByw_GVRhk2pH';
const LOCALNET=/[?&]localnet=1/.test(location.search);
let sb=null;try{if(!LOCALNET&&window.supabase&&window.supabase.createClient)sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}})}catch(e){sb=null}
const ID_AB='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const randId=n=>{let s='';const a=new Uint32Array(n);crypto.getRandomValues(a);for(const x of a)s+=ID_AB[x%ID_AB.length];return s};
if(!save.pid){save.pid=randId(8);save.psec=randId(24);writeSave()}
save.trophies=save.trophies||0;save.friends=save.friends||{};

/* ---------- trasporto: Supabase oppure BroadcastChannel tra schede (per le prove) ---------- */
class LocalCh{constructor(name,key){this.key=key;this.h=[];this.pres={};this.me=null;this.bc=new BroadcastChannel('abnet-'+name);
    this.bc.onmessage=ev=>{const m=ev.data;if(m.k==='b'){for(const x of this.h)if(x.type==='broadcast'&&x.event===m.event)x.cb({event:m.event,payload:m.payload})}
      else if(m.k==='p'){const isNew=!this.pres[m.key];if(m.meta)this.pres[m.key]=[m.meta];else delete this.pres[m.key];this.fire();if(isNew&&m.meta&&this.me)this.post({k:'p',key:this.key,meta:this.me})}};
    this.bye=()=>this.unsubscribe();addEventListener('pagehide',this.bye)}
  post(m){try{this.bc.postMessage(m)}catch(e){}}
  on(type,f,cb){this.h.push({type,event:f.event,cb});return this}
  fire(){for(const x of this.h)if(x.type==='presence'&&x.event==='sync')x.cb()}
  subscribe(cb){setTimeout(()=>cb&&cb('SUBSCRIBED'),20);return this}
  track(meta){this.me=meta;this.pres[this.key]=[meta];this.post({k:'p',key:this.key,meta});this.fire();return Promise.resolve('ok')}
  presenceState(){return JSON.parse(JSON.stringify(this.pres))}
  send(m){this.post({k:'b',event:m.event,payload:m.payload});return Promise.resolve('ok')}
  unsubscribe(){if(this.me)this.post({k:'p',key:this.key,meta:null});this.me=null;try{this.bc.close()}catch(e){}removeEventListener('pagehide',this.bye);return Promise.resolve('ok')}}
const NET={get on(){return LOCALNET||!!sb},
  ch(name){return LOCALNET?new LocalCh(name,save.pid):sb.channel(name,{config:{broadcast:{self:false},presence:{key:save.pid}}})},
  drop(ch){if(!ch)return;try{LOCALNET?ch.unsubscribe():sb.removeChannel(ch)}catch(e){}}};

/* ---------- database (in locale: finto database condiviso tra le schede) ---------- */
const FDB={get(){try{return JSON.parse(localStorage.getItem('abnetdb'))||{p:{},d:{},c:{},m:[],n:1}}catch(e){return{p:{},d:{},c:{},m:[],n:1}}},put(d){localStorage.setItem('abnetdb',JSON.stringify(d))}};
async function rpc(fn,args){const{data,error}=await sb.rpc(fn,args);if(error)throw new Error(error.message||'errore');return data}
const me=()=>({p_id:save.pid,p_secret:save.psec});
const DB={
  async sync(){if(LOCALNET){const d=FDB.get();const o=d.p[save.pid]||{};d.p[save.pid]=Object.assign(o,{id:save.pid,name:save.name,lvl:save.lvl||1,trophies:save.trophies,wins:save.wins,last_seen:Date.now()});FDB.put(d);return o.clan_id||null}
    return rpc('ab_sync',Object.assign(me(),{p_name:save.name,p_lvl:save.lvl||1,p_trophies:save.trophies,p_wins:save.wins||0}))},
  async daily(day,score){if(LOCALNET){const d=FDB.get();d.d[day]=d.d[day]||{};d.d[day][save.pid]=Math.max(d.d[day][save.pid]||0,score);FDB.put(d);return}
    return rpc('ab_daily',Object.assign(me(),{p_day:day,p_score:Math.round(score)}))},
  async board(day){if(LOCALNET){const d=FDB.get(),r=d.d[day]||{};return Object.entries(r).map(([id,s])=>({id,n:(d.p[id]||{}).name||'?',s})).sort((a,b)=>b.s-a.s)}
    const{data,error}=await sb.from('daily_scores').select('score,player_id,players(name)').eq('day',day).order('score',{ascending:false}).limit(50);if(error)throw error;
    return data.map(r=>({id:r.player_id,n:(r.players&&r.players.name)||'?',s:r.score}))},
  async players(ids){if(!ids.length)return[];if(LOCALNET){const d=FDB.get();return ids.map(i=>d.p[i]).filter(Boolean)}
    const{data,error}=await sb.from('players').select('id,name,lvl,trophies,clan_id,last_seen').in('id',ids);if(error)throw error;return data},
  async byName(q){if(LOCALNET){const d=FDB.get();return Object.values(d.p).filter(p=>p.name.toLowerCase()===q.toLowerCase())}
    const{data,error}=await sb.from('players').select('id,name,lvl,trophies').ilike('name',q.replace(/[%_]/g,'')).limit(5);if(error)throw error;return data},
  async clanCreate(name){if(LOCALNET){const d=FDB.get();const id=d.n++,tag=randId(5);d.c[id]={id,tag,name,owner:save.pid};d.p[save.pid].clan_id=id;FDB.put(d);return id}return rpc('ab_clan_create',Object.assign(me(),{p_name:name}))},
  async clanJoin(tag){if(LOCALNET){const d=FDB.get();const c=Object.values(d.c).find(c=>c.tag===tag.toUpperCase());if(!c)throw new Error('brigata non trovata');d.p[save.pid].clan_id=c.id;FDB.put(d);return c.id}return rpc('ab_clan_join',Object.assign(me(),{p_tag:tag}))},
  async clanLeave(){if(LOCALNET){const d=FDB.get();const cid=d.p[save.pid].clan_id;d.p[save.pid].clan_id=null;if(!Object.values(d.p).some(p=>p.clan_id===cid))delete d.c[cid];FDB.put(d);return}return rpc('ab_clan_leave',me())},
  async clan(id){if(LOCALNET){const d=FDB.get();return{c:d.c[id],m:Object.values(d.p).filter(p=>p.clan_id===id).sort((a,b)=>b.trophies-a.trophies)}}
    const[a,b]=await Promise.all([sb.from('clans').select('id,tag,name,owner').eq('id',id).maybeSingle(),sb.from('players').select('id,name,lvl,trophies,last_seen').eq('clan_id',id).order('trophies',{ascending:false})]);
    if(a.error)throw a.error;if(b.error)throw b.error;return{c:a.data,m:b.data}},
  async clanTop(){if(LOCALNET){const d=FDB.get();return Object.values(d.c).map(c=>{const m=Object.values(d.p).filter(p=>p.clan_id===c.id);return{id:c.id,tag:c.tag,name:c.name,members:m.length,trophies:m.reduce((a,p)=>a+p.trophies,0)}}).sort((a,b)=>b.trophies-a.trophies)}
    const{data,error}=await sb.from('clan_board').select('*').order('trophies',{ascending:false}).limit(15);if(error)throw error;return data},
  async msgs(id){if(LOCALNET)return FDB.get().m.filter(m=>m.c===id).slice(-30);
    const{data,error}=await sb.from('clan_msgs').select('name,body,at').eq('clan_id',id).order('id',{ascending:false}).limit(30);if(error)throw error;return data.reverse()},
  async say(body){if(LOCALNET){const d=FDB.get();d.m.push({c:d.p[save.pid].clan_id,name:save.name,body,at:new Date().toISOString()});FDB.put(d);return}return rpc('ab_clan_say',Object.assign(me(),{p_body:body}))}};
const dbErr=e=>{const m=String(e&&e.message||e);toast(/brigata non trovata/.test(m)?'Brigata non trovata: controlla il codice':/piena/.test(m)?'Brigata piena (30 chef)':/fetch|network|Failed/i.test(m)?'Niente connessione al server':'Errore online: '+m.slice(0,60))};

/* ---------- lobby: chi è online e inviti ---------- */
let LOBBY=null,ONLINE={},netOK=false,rtOK=false,dbOK=false,rtErr='',dbE='';
function lobbyMeta(st){return{id:save.pid,name:save.name,lvl:save.lvl||1,tr:save.trophies,st:st||(S&&S.live?'game':'menu')}}
function lobbyJoin(){if(!NET.on||LOBBY)return;const ch=NET.ch('ab-lobby');LOBBY=ch;
  ch.on('presence',{event:'sync'},()=>{const st=ch.presenceState();ONLINE={};for(const[k,v]of Object.entries(st))if(k!==save.pid&&v[0])ONLINE[k]=v[0];onlineChanged()});
  ch.on('broadcast',{event:'inv'},({payload:p})=>{if(p.to===save.pid)gotInvite(p)});
  ch.on('broadcast',{event:'dec'},({payload:p})=>{if(p.to===save.pid&&ROOM&&ROOM.code===p.room)toast(p.name+' non può giocare ora')});
  ch.subscribe((s,err)=>{if(s==='SUBSCRIBED'){rtOK=true;rtErr='';netOK=true;ch.track(lobbyMeta());onlineChanged()}else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT'||s==='CLOSED'){rtOK=false;if(!(s==='CLOSED'&&rtErr))rtErr=s+(err&&err.message?': '+err.message:'');netOK=dbOK;onlineChanged();if(s!=='CLOSED')setTimeout(()=>{if(!rtOK){NET.drop(LOBBY);LOBBY=null;lobbyJoin()}},8000)}})}
function lobbyStatus(st){if(LOBBY&&netOK)LOBBY.track(lobbyMeta(st))}
async function syncProfile(){if(!NET.on)return;try{const cid=await DB.sync();dbOK=true;dbE='';netOK=true;save.clanId=cid||null;writeSave();onlineChanged()}catch(e){dbOK=false;dbE=String(e&&e.message||e).slice(0,120);netOK=rtOK;onlineChanged()}}
function onlineChanged(){if(typeof renderOnline==='function'&&!$('menu').hidden)renderOnline()}

/* amici: si aggiungono col codice amico o col nome, e in automatico dopo una partita in diretta */
function addFriendId(id,name){if(!id||id===save.pid)return;let f=Object.values(save.friends).find(f=>f.id===id);if(!f){f=save.friends[name]&&!save.friends[name].id?save.friends[name]:(save.friends[name]={name});}f.id=id;if(name&&f.name!==name){delete save.friends[f.name];f.name=name;save.friends[name]=f}f.seen=Date.now();writeSave()}
async function friendAdd(q){q=(q||'').trim();if(!q)return;if(!NET.on){toast('Serve internet per aggiungere amici');return}
  try{const code=q.toUpperCase().replace(/[^A-Z0-9]/g,'');let found=null;
    if(code.length===8){const r=await DB.players([code]);found=r[0]}
    if(!found){const r=await DB.byName(q);if(r.length>1){toast('Più chef con questo nome: usa il codice amico');return}found=r[0]}
    if(!found){toast('Nessuno chef trovato: chiedigli il codice amico');return}
    if(found.id===save.pid){toast('Quello sei tu 😄');return}
    addFriendId(found.id,found.name);sfx('unlock');toast(found.name+' aggiunto agli amici');renderOnline()}catch(e){dbErr(e)}}

/* ---------- stanze per giocare in diretta ---------- */
let ROOM=null;
const LIVE_NAMES={arena:'Arena',side:'Affiancata',gduel:'Arena',race:'Affiancata'};
const roomCode=()=>randId(4).replace(/[0-9]/g,c=>'ABCDEFGHJK'[+c]);
function roomSend(o){if(!ROOM||!ROOM.ch)return;const R=ROOM;try{const p=R.ch.send({type:'broadcast',event:'m',payload:o});if(o.t!=='st'&&p&&p.then)p.then(r=>{R.dbg.sent=o.t+':'+r;roomDbg()},e=>{R.dbg.sent=o.t+':errore';roomDbg()})}catch(e){R.dbg.sent=o.t+':'+e.message;roomDbg()}}
function roomDbg(){if(ROOM&&$('roomDbg'))$('roomDbg').textContent=(ROOM.host?'casa':'ospite')+' · '+ROOM.dbg.st+' · avversario '+(ROOM.peer?'sì':'no')+' · inviato '+(ROOM.dbg.sent||'-')+' · ricevuto '+(ROOM.dbg.got||'-')}
function openRoom(code,host,mode){leaveRoom();code=code.toUpperCase();const ch=NET.ch('ab-room-'+code);ROOM={code,ch,host,mode:mode||null,peer:null,started:false,gone:0,rq:{},dbg:{st:'collego…',sent:'',got:''},t0:Date.now()};
  const R0=ROOM;R0.hi=setInterval(()=>{if(ROOM!==R0){clearInterval(R0.hi);return}if(!R0.started&&!R0.host)roomSend({t:'hi',id:save.pid,name:save.name});if(!R0.started&&R0.peer&&Date.now()-R0.t0>15000&&$('roomStatus'))$('roomStatus').innerHTML='<b>'+esc(R0.peer.name)+'</b> c\'è ma la partita non parte. Uscite tutti e due e riprovate.'},1500);
  ch.on('presence',{event:'sync'},()=>{if(!ROOM||ROOM.ch!==ch)return;const st=ch.presenceState();const ks=Object.keys(st).filter(k=>k!==save.pid);
    const peer=ks.length?st[ks[0]][0]:null;
    if(!ROOM.host&&peer&&peer.host)ROOM.mode=peer.mode;
    if(peer&&!ROOM.peer){sfx('unlock');addFriendId(peer.id,peer.name)}
    if(ks.length>1&&!ROOM.started&&!ROOM.host){toast('Stanza piena');leaveRoom();hideRoom();return}
    ROOM.peer=peer;if(!peer&&ROOM.started)ROOM.gone=Date.now();if(peer)ROOM.gone=0;
    if(!ROOM.host&&peer&&!peer.host&&!ROOM.started){toast('Questa stanza non ha un padrone di casa');}
    roomUI();
    if(ROOM.host&&peer&&!ROOM.started)setTimeout(()=>{if(ROOM&&ROOM.ch===ch&&ROOM.peer&&!ROOM.started)hostStart()},700)});
  ch.on('broadcast',{event:'m'},({payload})=>{if(ROOM&&ROOM.ch===ch){if(payload.t!=='st'){ROOM.dbg.got=payload.t;roomDbg()}roomMsg(payload)}});
  ch.subscribe(s=>{if(ROOM&&ROOM.ch===ch){ROOM.dbg.st=s;roomDbg()}if(s==='SUBSCRIBED')ch.track({id:save.pid,name:save.name,lvl:save.lvl||1,tr:save.trophies,host,mode:mode||null});else if(s==='CHANNEL_ERROR'||s==='TIMED_OUT'){toast('Non riesco a collegarmi al server');}});
  showRoom();roomDbg()}
function leaveRoom(){if(ROOM){clearInterval(ROOM.hi);NET.drop(ROOM.ch);ROOM=null}}
function hostStart(){const seed=1+Math.floor(Math.random()*2e9),floor=[0,1,2][Math.floor(Math.random()*3)];const o={t:'start',mode:ROOM.mode,seed,floor};ROOM.lastStart=o;ROOM.lastStartAt=Date.now();roomSend(o);beginCountdown(o)}
function roomMsg(m){switch(m.t){
  case'start':if(!ROOM.started||(S&&S.mode==='end'&&ROOM.lastSeed!==m.seed)){ROOM.lastSeed=m.seed;beginCountdown(m)}break;
  case'hi':if(ROOM.host){if(!ROOM.peer&&m.id){ROOM.peer={id:m.id,name:m.name};addFriendId(m.id,m.name);roomUI()}if(!ROOM.started){hostStart()}else if(ROOM.lastStart&&Date.now()-ROOM.lastStartAt<15000)roomSend(ROOM.lastStart)}break;
  case'rq':ROOM.rq.peer=1;toast(ROOM.peer?ROOM.peer.name+' vuole la rivincita!':'Rivincita!');if(ROOM.host&&ROOM.rq.me){ROOM.rq={};hostStart()}if(typeof liveEndRefresh==='function')liveEndRefresh();break;
  default:if(typeof liveMsg==='function')liveMsg(m)}}
let cdTimer=null;
function beginCountdown(o){ROOM.started=true;ROOM.rq={};hideAll();show('roomOv');$('roomCode').textContent=ROOM.code;$('roomTitle').textContent=LIVE_NAMES[o.mode];
  let n=3;const tick=()=>{$('roomStatus').innerHTML='<span class="cd">'+n+'</span>Contro '+(ROOM.peer?ROOM.peer.name:'?');sfx('click');if(n--<=0){clearInterval(cdTimer);show('roomOv',false);liveStart(o)}};
  clearInterval(cdTimer);tick();cdTimer=setInterval(tick,800)}
function showRoom(){hideAll();show('roomOv');roomUI()}
function hideRoom(){show('roomOv',false);showMenu('social')}
function roomUI(){if(!ROOM)return;$('roomTitle').textContent=ROOM.mode?LIVE_NAMES[ROOM.mode]:'Stanza';$('roomCode').textContent=ROOM.code;
  $('roomStatus').innerHTML=ROOM.peer?'<b>'+esc(ROOM.peer.name)+'</b> è entrato! Si parte…':ROOM.host?'Di\' questo codice al tuo amico: lo scrive in Amici → Entra.<br>Oppure invita un amico online:':'Entro nella stanza…';
  const fr=onlineFriends();$('roomInv').innerHTML=ROOM.host&&!ROOM.peer?(fr.length?fr.map(f=>'<button class="ghost slim" data-inv="'+f.id+'">Invita '+esc(f.name)+'</button>').join(''):'<p class="hint">Nessun amico online adesso.</p>'):''}
$('roomInv').addEventListener('click',ev=>{const b=ev.target.closest('button[data-inv]');if(!b||!ROOM)return;sendInvite(b.dataset.inv);b.disabled=true;b.textContent='Invito mandato'});
$('roomCancel').onclick=()=>{sfx('click');clearInterval(cdTimer);leaveRoom();hideRoom()};
function sendInvite(to){if(!LOBBY||!ROOM)return;LOBBY.send({type:'broadcast',event:'inv',payload:{to,from:save.pid,name:save.name,mode:ROOM.mode,room:ROOM.code}})}
function createRoom(mode){if(!NET.on||!rtOK){toast(rtErr?'La diretta non si collega ('+rtErr+')':'Mi sto ancora collegando alla diretta, riprova tra un attimo');return}openRoom(roomCode(),true,mode)}
function joinRoom(code){code=(code||'').trim().toUpperCase();if(!/^[A-Z]{4}$/.test(code)){toast('Il codice stanza è di 4 lettere');return}if(!NET.on||!rtOK){toast(rtErr?'La diretta non si collega ('+rtErr+')':'Mi sto ancora collegando alla diretta, riprova tra un attimo');return}openRoom(code,false,null)}
let pendingInv=null;
function gotInvite(p){if(S&&S.live&&S.mode!=='end'){LOBBY.send({type:'broadcast',event:'dec',payload:{to:p.from,name:save.name,room:p.room}});return}
  pendingInv=p;sfx('unlock');$('invText').innerHTML='<b>'+esc(p.name)+'</b> ti sfida a<br><span class="invMode">'+LIVE_NAMES[p.mode]+'</span>';show('inviteOv');addFriendId(p.from,p.name)}
$('invYes').onclick=()=>{sfx('click');show('inviteOv',false);if(!pendingInv)return;if(S&&S.mode!=='menu'&&S.mode!=='end'){quitRun()}openRoom(pendingInv.room,false,pendingInv.mode);pendingInv=null};
$('invNo').onclick=()=>{sfx('click');show('inviteOv',false);if(pendingInv&&LOBBY)LOBBY.send({type:'broadcast',event:'dec',payload:{to:pendingInv.from,name:save.name,room:pendingInv.room}});pendingInv=null};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function onlineFriends(){return Object.values(save.friends).filter(f=>f.id&&ONLINE[f.id]).map(f=>Object.assign({},f,{st:ONLINE[f.id].st,lvl:ONLINE[f.id].lvl,tr:ONLINE[f.id].tr}))}

/* ---------- scheda Amici: parte online ---------- */
let boardTab='fr',clanView=null,clanCh=null;
function renderOnline(){const on=NET.on&&netOK;$('onlDot').classList.toggle('on',rtOK&&dbOK);$('onlDiag').textContent=!NET.on?'':(dbOK?'Server ✓':'Server ✗'+(dbE?' ('+dbE+')':' (in attesa)'))+' · '+(rtOK?'Diretta ✓':'Diretta ✗'+(rtErr?' ('+rtErr+')':' (in attesa)'))+' · v9';$('onlTxt').textContent=on?'Online · '+(Object.keys(ONLINE).length)+' chef collegati':NET.on?'Mi collego al server…':'Offline: niente internet';
  $('myCode').textContent=save.pid;$('myTr').textContent=save.trophies;
  const fr=Object.values(save.friends).filter(f=>f.id).sort((a,b)=>(ONLINE[b.id]?1:0)-(ONLINE[a.id]?1:0));
  $('onlineList').innerHTML=fr.length?fr.map(f=>{const o=ONLINE[f.id];return'<div class="brow fr"><span class="odot'+(o?' on':'')+'"></span><span class="bn">'+esc(f.name)+(o&&o.st==='game'?' <i>in partita</i>':'')+'</span>'+(o&&o.st!=='game'?'<span class="frb"><button class="buy" data-ch="arena" data-id="'+f.id+'">Arena</button><button class="buy alt" data-ch="side" data-id="'+f.id+'">Affiancata</button></span>':'<span class="bs">'+(o?'':'offline')+'</span>')+'</div>'}).join(''):'<p class="hint">Aggiungi un amico col suo codice amico (lo trova qui sopra, nella sua scheda Amici).</p>';
  renderClan()}
$('onlineList').addEventListener('click',ev=>{const b=ev.target.closest('button[data-ch]');if(!b)return;sfx('click');createRoom(b.dataset.ch);setTimeout(()=>{sendInvite(b.dataset.id);toast('Invito mandato, aspetto la risposta')},400)});
$('liveGD').onclick=()=>{sfx('click');withIntro('livear',()=>createRoom('arena'))};
$('liveRC').onclick=()=>{sfx('click');withIntro('liveside',()=>createRoom('side'))};
$('roomJoin').onclick=()=>{sfx('click');joinRoom($('roomIn').value);$('roomIn').value=''};
$('friendAdd').onclick=()=>{sfx('click');friendAdd($('friendIn').value);$('friendIn').value=''};
$('copyCode').onclick=()=>{try{navigator.clipboard.writeText(save.pid);toast('Codice amico copiato: '+save.pid)}catch(e){toast('Il tuo codice amico: '+save.pid)}};
document.querySelectorAll('.btab').forEach(b=>b.onclick=()=>{sfx('click');boardTab=b.dataset.b;renderBoard()});
/* classifica: amici o mondo, presa dal server se c'è, altrimenti dai codici */
const _renderBoard=renderBoard;
renderBoard=function(){document.querySelectorAll('.btab').forEach(b=>b.classList.toggle('on',b.dataset.b===boardTab));
  if(!(NET.on&&netOK)){_renderBoard();return}
  const dy=dailyInfo();$('boardDate').textContent='Sfida del giorno · '+dy.label;
  DB.board(dy.key).then(rows=>{const ids=new Set(Object.values(save.friends).map(f=>f.id).filter(Boolean));ids.add(save.pid);
    let list=boardTab==='fr'?rows.filter(r=>ids.has(r.id)):rows;
    if(boardTab==='fr')for(const f of Object.values(save.friends))if(!f.id&&f.day&&f.day.k===dy.key)list.push({id:'x'+f.name,n:f.name,s:f.day.s});
    if(!list.some(r=>r.id===save.pid))list.push({id:save.pid,n:save.name,s:save.dailyScore[dy.key]||0});
    list.sort((a,b)=>b.s-a.s);
    $('board').innerHTML=list.slice(0,30).map((r,i)=>'<div class="brow'+(r.id===save.pid?' me':'')+'"><span class="pos">'+(i+1)+'</span><span class="bn">'+esc(r.n)+(r.id===save.pid?' (tu)':'')+'</span><span class="bs">'+(r.s?r.s.toLocaleString('it-IT'):'—')+'</span></div>').join('')+(list.length<2?'<p class="hint">'+(boardTab==='fr'?'Nessun amico in classifica oggi: sfidatevi alla sfida del giorno.':'Ancora nessuno oggi: fai tu il primo punteggio!')+'</p>':'')}).catch(()=>_renderBoard())};
/* punteggio della sfida del giorno: va anche sul server */
const _socialEnd=socialEnd;socialEnd=function(win){_socialEnd(win);if(S.daily&&NET.on&&netOK){const k=S.daily;DB.daily(k,save.dailyScore[k]||0).catch(()=>{})}};

/* ---------- brigate ---------- */
async function renderClan(){const box=$('clanBox');if(!(NET.on&&netOK)){box.innerHTML='<p class="hint">Le brigate funzionano online: collegati a internet.</p>';return}
  if(!save.clanId){if(clanCh){NET.drop(clanCh);clanCh=null}
    box.innerHTML='<p class="hint">Una brigata è il tuo clan: fino a 30 chef, classifica e chat.</p><div class="pasteBox"><input id="clanName" maxlength="20" placeholder="Nome della nuova brigata"><button class="big sm" id="clanNew">Crea</button></div><div class="pasteBox"><input id="clanTag" maxlength="5" placeholder="Codice brigata (5 lettere)"><button class="big sm" id="clanIn">Entra</button></div><div class="sectT sm">Brigate migliori</div><div class="board" id="clanTop"><p class="hint">Carico…</p></div>';
    $('clanNew').onclick=async()=>{const n=$('clanName').value.trim();if(n.length<2){toast('Nome troppo corto');return}try{save.clanId=await DB.clanCreate(n);writeSave();sfx('unlock');toast('Brigata creata!');renderClan()}catch(e){dbErr(e)}};
    $('clanIn').onclick=async()=>{const t=$('clanTag').value.trim();if(t.length<4){toast('Il codice brigata è di 5 caratteri');return}try{save.clanId=await DB.clanJoin(t);writeSave();sfx('unlock');renderClan()}catch(e){dbErr(e)}};
    try{const top=await DB.clanTop();$('clanTop').innerHTML=top.length?top.map((c,i)=>'<div class="brow"><span class="pos">'+(i+1)+'</span><span class="bn">'+esc(c.name)+' <i>'+c.members+' chef · '+c.tag+'</i></span><span class="bs">🏆 '+c.trophies+'</span></div>').join(''):'<p class="hint">Ancora nessuna brigata: fondala tu.</p>'}catch(e){$('clanTop').innerHTML='<p class="hint">Server non raggiungibile.</p>'}
    return}
  try{const{c,m}=await DB.clan(save.clanId);if(!c){save.clanId=null;writeSave();renderClan();return}clanView=c;
    box.innerHTML='<div class="clanHead"><b>'+esc(c.name)+'</b><span>Codice <button class="ghost slim" id="clanCopy">'+c.tag+'</button> · '+m.length+'/30 chef · 🏆 '+m.reduce((a,p)=>a+p.trophies,0)+'</span></div>'+
      '<div class="board">'+m.map((p,i)=>'<div class="brow"><span class="pos">'+(i+1)+'</span><span class="bn"><span class="odot'+(ONLINE[p.id]||p.id===save.pid?' on':'')+'"></span>'+esc(p.name)+(p.id===c.owner?' <i>capo</i>':'')+'</span><span class="bs">🏆 '+p.trophies+'</span></div>').join('')+'</div>'+
      '<div class="chat" id="clanChat"></div><div class="pasteBox"><input id="clanMsg" maxlength="200" placeholder="Scrivi alla brigata…"><button class="big sm" id="clanSend">Invia</button></div><button class="ghost slim" id="clanLeave">Esci dalla brigata</button>';
    $('clanCopy').onclick=()=>{try{navigator.clipboard.writeText(c.tag)}catch(e){}toast('Codice brigata: '+c.tag)};
    $('clanSend').onclick=clanSay;$('clanMsg').onkeydown=e=>{if(e.key==='Enter')clanSay()};
    $('clanLeave').onclick=async()=>{try{await DB.clanLeave();save.clanId=null;writeSave();toast('Sei uscito dalla brigata');renderClan()}catch(e){dbErr(e)}};
    if(!clanCh||clanCh.cid!==c.id){if(clanCh)NET.drop(clanCh);clanCh=NET.ch('ab-clan-'+c.id);clanCh.cid=c.id;clanCh.on('broadcast',{event:'m'},({payload})=>{chatAdd(payload);sfx('click')});clanCh.subscribe()}
    const ms=await DB.msgs(c.id);$('clanChat').innerHTML='';ms.forEach(chatAdd);if(!ms.length)$('clanChat').innerHTML='<p class="hint">Nessun messaggio. Saluta la brigata!</p>'}catch(e){box.innerHTML='<p class="hint">Server non raggiungibile.</p>'}}
function chatAdd(m){const el=$('clanChat');if(!el)return;const h=el.querySelector('.hint');if(h)h.remove();const d=document.createElement('div');d.className='cmsg'+(m.name===save.name?' me':'');d.innerHTML='<b>'+esc(m.name)+'</b>'+esc(m.body);el.appendChild(d);el.scrollTop=el.scrollHeight}
async function clanSay(){const inp=$('clanMsg'),body=inp.value.trim();if(!body)return;inp.value='';try{await DB.say(body);const m={name:save.name,body};chatAdd(m);if(clanCh)clanCh.send({type:'broadcast',event:'m',payload:m})}catch(e){dbErr(e)}}

Object.assign(MODE_INTRO,{
  livear:{title:'Arena',items:[['m:polpo','Come Clash Royale: il tuo gestore è in basso, quello dell\'amico in alto. Ha 40 di vita.'],['t:granchio','Metti i dipendenti nella tua metà del campo: fermano i mostri che scendono verso di te.'],['e:aringa','Tocca un mostro in basso, poi la corsia sinistra o destra: parte dalla tua cucina e sale verso la sua. La fame si ricarica da sola, massimo 10.'],['e:ghiozzo','Arrivano anche mostri neutri a tutti e due: ogni mostro fatto fuori ti dà perle.'],['e:megalodonte','Vince chi mangia per primo il gestore dell\'altro. Dopo 3 minuti la fame si ricarica il doppio.']]},
  liveside:{title:'Affiancata',items:[['m:polpo','Il tuo gestore a sinistra, quello dell\'amico a destra, ognuno col suo sentiero.'],['e:ghiozzo','Dai due sentieri escono gli stessi mostri, a piani, sempre più forti.'],['e:reAragosta','Ogni boss che batti manda 3 mostri in regalo all\'altro.'],['t:squalo','Chi sopravvive di più vince.']]}});

/* avvio: profilo sul server e lobby */
if(NET.on){lobbyJoin();syncProfile();setInterval(()=>{if(netOK)syncProfile()},120000)}
