'use strict';
/* ===== Abyss Bistro: tutorial graduale nella prima partita + introduzioni alle modalità =====
   Ogni passo introduce UNA meccanica e aspetta che il giocatore la usi davvero. */
let tutStep=-1,tutT=0,tutShown=false;
const coach=$('coach');
const tutSlotNear=()=>{const free=WORLD.slots.filter(s=>!s.tower);return free.sort((a,b)=>a.y-b.y)[Math.min(2,free.length-1)]||null};
const tutCurveSlot=()=>{const free=WORLD.slots.filter(s=>!s.tower);let best=null,bd=1e9;for(const s of free){for(const q of WORLD.paths[0].pts.slice(1,-1)){const d=Math.hypot(s.x-q[0],s.y-q[1]);if(d<bd){bd=d;best=s}}}return best||tutSlotNear()};
const caveP=()=>{const p=WORLD.paths[0].pts[0];return{x:Math.max(16,Math.min(W-16,p[0])),y:Math.max(16,p[1])}};
const crab=()=>S.towers.find(t=>t.key==='granchio');
const TUT=[
  /* --- prima dell'ondata 1: il minimo indispensabile --- */
  {text:'Benvenuto all\'Abyss Bistro! Io sono il Polpo Chef. Vedi la freccia? Da quella grotta escono i mostri degli abissi.',btn:'Avanti',pos:'mid',point:caveP},
  {text:'Seguono il sentiero fino al mio sushi bar. Se ci arrivano, mangiano il bancone: il cuore in alto è la sua vita. A zero, si chiude.',btn:'Avanti',pos:'mid',hi:'#hpPill'},
  {text:'Per fermarli assumo dipendenti. In basso hai 4 carte del tuo mazzo, come in Clash Royale. Tocca il Granchio sushiman.',pos:'mid',only:'granchio',hi:()=>handBtn('granchio'),wait:()=>S.tool==='granchio'},
  {text:'In alto c\'è la sua scheda: cosa fa, quanto fa male, fin dove arriva e quanto costa. Ora tocca la piazzola con la freccia.',pos:'bottom',only:'granchio',slot:tutSlotNear,wait:()=>S.towers.length>=1},
  {text:'Assunto! Guarda la mano: la carta usata è andata in fondo al mazzo ed è entrata la prossima in fila: la vedi sempre nel riquadrino a sinistra.',btn:'Avanti',pos:'mid',hi:'#shop'},
  {text:'Sopra la mano c\'è l\'anteprima: arrivano solo pochi ghiozzi scrocconi. Premi Inizia ondata e guarda cosa succede.',pos:'mid',hi:'#startBtn',start:1,wait:()=>S.mode==='wave'},
  /* --- ondata 1: osservare --- */
  {text:'Il Granchio lancia nigiri da solo a chi entra nel suo raggio. Tu non devi mirare: devi scegliere dove metterli.',pos:'top',auto:6,wait:()=>S.earned>0&&tutT>3},
  {text:'Ogni mostro eliminato ti dà perle, le vedi salire in alto. Servono per assumere e potenziare.',pos:'top',hi:'#perlePill',auto:6,wait:()=>S.mode!=='wave'&&tutT>1},
  /* --- dopo l'ondata 1: carte --- */
  {text:'Ondata superata! Dopo ogni ondata scegli una carta. Ce ne sono di quattro tipi: potenziamenti, piatti speciali, dipendenti nuovi e maledizioni. Toccane una.',pos:'top',z:1,wait:()=>$('cards').hidden&&S.mode==='build'},
  /* --- prima dell'ondata 2: secondo dipendente e potenziamento --- */
  {text:'Arrivano le aringhe: velocissime. Serve rinforzo. Assumi lo Squalo buttafuori: morde forte ma solo da vicino, quindi mettilo vicino a una curva.',pos:'mid',only:'squalo',hi:()=>handBtn('squalo'),slot:tutCurveSlot,enter:()=>{S.perle=Math.max(S.perle,90);if(!S.hand.includes('squalo'))S.hand[0]='squalo'},wait:()=>S.towers.some(t=>t.key==='squalo')},
  {text:'Ti regalo 60 perle. Tocca il Granchio che hai piazzato.',pos:'top',enter:()=>{S.perle+=60},towerArrow:crab,wait:()=>S.sel&&S.sel.key==='granchio'},
  {text:'Qui lo potenzi fino al livello 3, oppure lo licenzi e ti riprendi il 60%. Premi Potenzia.',pos:'top',hi:'#upBtn',keep:crab,wait:()=>crab()&&crab().lv>=2},
  {text:'Più danno e più gittata. Ora premi Inizia ondata. Se ti sembra lento, durante l\'ondata puoi premere x2 in alto.',pos:'mid',hi:'#startBtn',start:1,wait:()=>S.mode==='wave'},
  {text:'x2 accelera tutto, toccalo di nuovo per tornare normale. Come vuoi tu.',pos:'top',hi:'#speedBtn',auto:7,wait:()=>S.mode!=='wave'&&tutT>1},
  {text:'Altra carta! Occhio a quelle con scritto Maledizione: sono fortissime, ma ti fanno pagare un prezzo. Scegline una.',pos:'top',z:1,wait:()=>$('cards').hidden&&S.mode==='build'},
  /* --- prima del boss: trappole, rimescolo, boss --- */
  {text:'Il mio asso nella manica: i piatti trappola. Tocca il pulsante col piatto, poi tocca un punto del sentiero.',pos:'mid',hi:'#abilityBtn',wait:()=>S.plates.length>=1},
  {text:'Chi ci passa sopra si ferma a mangiare e prende 45 danni. Ne hai 8 per piano, usali nei punti caldi.',btn:'Avanti',pos:'mid'},
  {text:'Se la mano non ti piace, questo tasto la cambia per 15 perle. Ricordatelo per dopo.',btn:'Avanti',pos:'mid',hi:'#handBtn'},
  {text:'Guarda l\'anteprima: arriva il boss del piano, il Re Aragosta. Ogni tanto "boccia" un dipendente e lo blocca per qualche secondo. Ti lascio 80 perle: assumi chi vuoi dalla mano e poi premi Inizia.',pos:'mid',free:1,enter:()=>{S.perle+=80},hi:'#startBtn',start:1,wait:()=>S.mode==='wave'},
  {text:'Visto lo zzz? Quel dipendente è stato bocciato. Si riprende da solo dopo qualche secondo. Tieni duro!',pos:'top',free:1,trigger:()=>S.towers.some(t=>t.disabled>0)&&!!S.boss,auto:6,wait:()=>S.mode!=='wave'},
  {text:'BOSS BATTUTO! Hai vinto stelle Michelin e un pacchetto di carte: lo apri dal menu, in Le mie carte. Scegli la carta e scendiamo.',pos:'top',z:1,free:1,wait:()=>$('cards').hidden&&S.mode!=='cards'},
  {text:'Ogni piano ha regole sue, le leggi qui prima di scendere. Da adesso sei tu lo chef: più piani, buio, boss più cattivi. Buon servizio!',btn:'Ci penso io!',pos:'top',z:1,free:1},
  {text:null}];
function handBtn(k){const i=S.hand.indexOf(k);return i>=0?$('shop').children[i+1]:null}
function clearHi(){document.querySelectorAll('.tutHi').forEach(e=>e.classList.remove('tutHi'))}
function coachBox(st){coach.className='pos-'+(st.pos||'mid');coach.style.zIndex=st.z?'7':'';
  coach.innerHTML='<img alt="" src="'+ICONS.m.polpo+'"><div class="cb"><span class="cn">Polpo Chef · '+(tutStep+1)+'/'+(TUT.length-1)+'</span><span class="ct">'+st.text+'</span><div class="crow">'+(st.btn?'<button class="big sm" id="coachNext">'+st.btn+'</button>':'')+'<button class="ghost sm" id="coachSkip">Salta tutorial</button></div></div>';coach.hidden=false;
  if(st.btn)$('coachNext').onclick=()=>{sfx('click');nextStep()};$('coachSkip').onclick=()=>{sfx('click');stopCoach(false)}}
function showStep(){clearHi();const st=TUT[tutStep];S.tutSlot=null;S.tutTower=null;S.tutPoint=null;tutT=0;tutShown=false;
  if(!st.text){stopCoach(true);return}
  S.tutAllowStart=!!st.start||!!st.auto||!!st.trigger;S.tutOnly=st.free?null:(st.only||'-');
  if(st.enter)st.enter();if(!st.trigger){coachBox(st);tutShown=true}else coach.hidden=true}
function nextStep(){tutStep++;if(tutStep>=TUT.length)return;showStep()}
function tutTick(dt){if(!S||!S.tutorial||tutStep<0||tutStep>=TUT.length)return;const st=TUT[tutStep];if(!st.text)return;
  if(st.trigger&&!tutShown){if(st.trigger()){coachBox(st);tutShown=true;tutT=0}else{if(st.wait&&st.wait())nextStep();return}}
  tutT+=dt;
  S.tutSlot=st.slot&&(S.tool&&S.tool!=='trap'||!st.only)?st.slot():null;S.tutTower=st.towerArrow&&!S.sel?st.towerArrow():null;S.tutPoint=st.point?st.point():null;
  const tg=S.tutSlot||S.tutTower||(st.keep&&st.keep());if(tg&&!st.z){const sy=OY+tg.y*SC;coach.className='pos-'+(sy<VH*.5?'bottom':'top')}
  const h=typeof st.hi==='function'?st.hi():st.hi?document.querySelector(st.hi):null;if(h&&!h.classList.contains('tutHi')){clearHi();h.classList.add('tutHi')}
  if(st.keep){const t=st.keep();if(t&&!S.sel&&t.lv<2)openTower(t)}
  if(st.wait&&st.wait())nextStep();else if(st.auto&&tutT>st.auto&&!st.wait)nextStep()}
/* la prima run corta, con il Polpo Chef come guida */
function startTutorial(){save.asked=1;save.novice=1;writeSave();hideAll();shopKey='';tutStep=-1;
  const deck=['granchio','squalo','rana','sardine','polipetto'].filter(k=>save.emp[k]);
  startDefense('short','polpo',deck);S.tutorial=true;S.floors[0]=0;S.depth=0;loadFloor(0);for(const s of WORLD.slots)s.tower=null;
  S.hand=['granchio','squalo','rana','sardine'];S.pile=deck.filter(k=>!S.hand.includes(k));floorIntro()}
function stopCoach(done){clearHi();coach.hidden=true;tutStep=-1;if(S){S.tutorial=false;S.tutSlot=null;S.tutTower=null;S.tutPoint=null;S.tutOnly=null}
  save.asked=1;if(done==='lost'){writeSave();return}if(done&&!save.tutDone){save.tutDone=1;save.perle+=100;toast('Tutorial completato: +100 perle nel Bistrot')}else if(!done)save.tutDone=1;writeSave()}
/* domanda alla prima apertura */
function maybeAsk(){if(save.asked)return;show('askOv')}
$('askYes').onclick=()=>{sfx('click');save.asked=1;save.tutDone=1;writeSave();show('askOv',false);toast('Allora buon servizio! Il tutorial resta in Come si gioca')};
$('askNo').onclick=()=>{sfx('click');show('askOv',false);startTutorial()};
$('tutBtn').onclick=()=>{sfx('click');startTutorial()};

/* introduzione la prima volta che apri una modalità */
const MODE_INTRO={
  long:{title:'Run lunga',items:[['e:megalodonte','Sei piani uno dopo l\'altro, dalla Barriera corallina all\'Abisso. In fondo ti aspetta il Megalodonte.'],
    ['e:ghiozzo','Cinque ondate e un boss per piano. Più scendi, più i nemici sono tosti e nuovi.'],
    ['t:rana','Dal piano 4 è buio: senza la Rana faro i dipendenti vedono solo vicino a sé. Mettila nel mazzo.'],
    ['m:polpo','Scendendo il personale viene rimborsato del tutto: ripiazzi tutto sul piano nuovo.']]},
  inf:{title:'Infinita',items:[['t:balena','Ondate senza fine: conta quante ne superi. È la modalità per i record.'],
    ['e:reAragosta','Ogni 5 ondate arriva un boss e si cambia piano. Dopo il sesto si ricomincia, ma più forte.'],
    ['e:martello','I nemici diventano più resistenti a ogni ondata. Potenzia presto e scegli carte che durano.']]},
  monster:{title:'Mostro affamato',items:[['e:kraken','Ruoli invertiti: qui sei tu l\'orda. La cucina è difesa dal computer, che assume dipendenti a caso.'],
    ['e:ghiozzo','In basso hai 4 mostri, a sinistra vedi il prossimo. Toccane uno per mandarlo all\'attacco: costa fame, la barra rossa che si ricarica da sola (1 ogni 2 secondi, massimo 10).'],
    ['e:lumaca','Conviene accumulare fame e mandarne tanti insieme: uno alla volta vengono fatti fuori. I boss: uno alla volta.'],
    ['e:ladro','Hai 2:30 per distruggere il bancone. Vinci 3 round di fila. Dove ci sono due sentieri, scegli la corsia col pulsante.'],
    ['e:megalodonte','I boss che batti in difesa diventano mostri leggendari da usare qui.']]},
  daily:{title:'Sfida del giorno',items:[['m:gamberi','Ogni giorno una run corta diversa, uguale per tutti: sfida i tuoi amici sullo stesso menu.'],
    ['t:palla','Gestore e mazzo sono decisi dalla sfida, anche se non li hai ancora sbloccati.'],
    ['e:vipera','Parti con una maledizione già attiva: un vantaggio forte e un prezzo da pagare.'],
    ['t:ostrica','Vinci e prendi perle doppie e 3 stelle. Il premio vale una volta al giorno.']]}};
let miNext=null;
function withIntro(m,fn){const I=MODE_INTRO[m];if(!I||save.intro[m]){fn();return}miNext=fn;hideAll();
  const ic=x=>{const[t,k]=x.split(':');return t==='t'?ICONS.t[k]:t==='e'?ICONS.e[k]:ICONS.m[k]};
  $('miTitle').textContent=I.title;$('miList').innerHTML=I.items.map(([i,t])=>'<li><img alt="" src="'+ic(i)+'"><span>'+t+'</span></li>').join('');
  save.intro[m]=1;writeSave();show('modeIntro')}
$('miGo').onclick=()=>{sfx('click');show('modeIntro',false);const f=miNext;miNext=null;if(f)f()};
if(!$('menu').hidden)maybeAsk();
