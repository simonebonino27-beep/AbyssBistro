'use strict';
/* ===== Abyss Bistro: tutorial nella prima partita + introduzioni alle modalità ===== */
let tutStep=-1,tutT=0;
const coach=$('coach');
const tutSlotNear=()=>{const free=WORLD.slots.filter(s=>!s.tower);return free.sort((a,b)=>a.y-b.y)[Math.min(2,free.length-1)]||null};
const TUT=[
  {text:'Benvenuto all\'Abyss Bistro! Io sono il Polpo Chef. I mostri degli abissi escono da quella grotta e seguono il sentiero fino al mio bancone. Noi li fermiamo prima.',btn:'Avanti',pos:'mid'},
  {text:'Questo cuore è la vita del bancone. Ogni mostro che arriva al sushi bar te ne toglie un po\'. A zero la run è finita.',btn:'Avanti',pos:'mid',hi:'#hpPill'},
  {text:'Queste sono le perle: servono per assumere e potenziare. Le guadagni facendo fuori i mostri e finendo le ondate.',btn:'Avanti',pos:'mid',hi:'#perlePill'},
  {text:'In basso c\'è la tua mano: 4 dipendenti pescati a caso dal tuo mazzo. Tocca il Granchio per vedere cosa sa fare.',pos:'mid',hi:()=>handBtn('granchio'),wait:()=>S.tool==='granchio'},
  {text:'In alto c\'è la sua scheda: cosa fa, quanto fa male, fin dove arriva e quanto costa. Ora tocca la piazzola indicata dalla freccia.',pos:'bottom',slot:1,wait:()=>S.towers.length>=1},
  {text:'Il Granchio è in servizio! Ora assumi lo Squalo: morde forte ma solo da vicino, mettilo attaccato al sentiero.',pos:'mid',hi:()=>handBtn('squalo'),slot:1,wait:()=>S.towers.some(t=>t.key==='squalo')},
  {text:'Sopra la mano vedi chi sta arrivando. Quando sei pronto premi Inizia ondata.',pos:'mid',hi:'#startBtn',allowStart:1,wait:()=>S.mode==='wave'},
  {text:'I dipendenti attaccano da soli. Se vuoi accelerare premi x2 qui in alto.',pos:'top',auto:7,hi:'#speedBtn',wait:()=>S.mode!=='wave'},
  {text:'Ondata superata! Dopo ogni ondata scegli una carta: potenziamenti, piatti speciali, dipendenti nuovi o maledizioni, fortissime ma con un prezzo. Toccane una.',pos:'top',cards:1,wait:()=>$('cards').hidden&&S.mode==='build'},
  {text:'Ti regalo 100 perle. Tocca il Granchio che hai piazzato: puoi potenziarlo fino al livello 3, oppure licenziarlo e riprenderti il 60%.',pos:'top',enter:()=>{S.perle+=100},wait:()=>!!S.sel,towerArrow:1},
  {text:'Ora premi Potenzia nel riquadro.',pos:'top',hi:'#upBtn',wait:()=>S.towers.some(t=>t.lv>=2),keepSel:1},
  {text:'Il mio asso nella manica: i piatti trappola. Tocca il pulsante con il piatto, poi tocca un punto del sentiero.',pos:'mid',hi:'#abilityBtn',wait:()=>S.plates.length>=1},
  {text:'Chi ci passa sopra si ferma a mangiare e prende danni. Ora sai tutto: dopo un paio di ondate arriva il boss del piano, il Re Aragosta. Batti lui e scendi al piano di sotto. Il resto lo scopri giocando!',btn:'Ci penso io!',pos:'mid',allowStart:1},
  {text:null}];
function handBtn(k){const i=S.hand.indexOf(k);return i>=0?$('shop').children[i]:null}
function clearHi(){document.querySelectorAll('.tutHi').forEach(e=>e.classList.remove('tutHi'))}
function showStep(){clearHi();const st=TUT[tutStep];S.tutSlot=null;S.tutTower=0;S.tutAllowStart=!!st.allowStart||!!st.auto;
  if(!st.text){stopCoach(true);return}
  if(st.enter)st.enter();
  coach.className='pos-'+(st.pos||'mid');coach.style.zIndex='';
  coach.innerHTML='<img alt="" src="'+ICONS.m.polpo+'"><div class="cb"><span class="cn">Polpo Chef · '+(tutStep+1)+'/'+(TUT.length-1)+'</span><span class="ct">'+st.text+'</span><div class="crow">'+(st.btn?'<button class="big sm" id="coachNext">'+st.btn+'</button>':'')+'<button class="ghost sm" id="coachSkip">Salta tutorial</button></div></div>';coach.hidden=false;
  if(st.btn)$('coachNext').onclick=()=>{sfx('click');nextStep()};$('coachSkip').onclick=()=>{sfx('click');stopCoach(false)};tutT=0}
function nextStep(){tutStep++;if(tutStep>=TUT.length)return;showStep()}
function tutTick(dt){if(!S||!S.tutorial||tutStep<0||tutStep>=TUT.length)return;const st=TUT[tutStep];if(!st.text)return;tutT+=dt;
  coach.style.zIndex=st.cards&&!$('cards').hidden?'7':'';
  if(st.slot)S.tutSlot=(S.tool&&S.tool!=='trap')||tutStep===4?tutSlotNear():null;S.tutTower=st.towerArrow?1:0;
  const tg=S.tutSlot||(st.towerArrow||st.keepSel?S.towers[0]:null);if(tg){const sy=OY+tg.y*SC;coach.className='pos-'+(sy<VH*.5?'bottom':'top')}
  const h=typeof st.hi==='function'?st.hi():st.hi?document.querySelector(st.hi):null;if(h&&!h.classList.contains('tutHi')){clearHi();h.classList.add('tutHi')}
  if(st.keepSel&&!S.sel&&S.towers[0]&&!S.towers.some(t=>t.lv>=2))openTower(S.towers[0]);
  if(st.wait&&st.wait())nextStep();else if(st.auto&&tutT>st.auto)nextStep()}
/* la prima run corta, con il Polpo Chef come guida */
function startTutorial(){save.asked=1;save.novice=1;writeSave();hideAll();shopKey='';tutStep=-1;
  const deck=['granchio','squalo','rana','sardine','polipetto'].filter(k=>save.emp[k]);
  startDefense('short','polpo',deck);S.tutorial=true;S.floors[0]=0;S.depth=0;loadFloor(0);for(const s of WORLD.slots)s.tower=null;
  S.hand=['granchio','squalo','rana','sardine'];S.pile=shuffle(deck.slice());floorIntro()}
function stopCoach(done){clearHi();coach.hidden=true;tutStep=-1;if(S){S.tutorial=false;S.tutSlot=null;S.tutTower=0}
  save.asked=1;if(done&&!save.tutDone){save.tutDone=1;save.perle+=100;toast('Tutorial completato: +100 perle nel Bistrot')}else if(!done)save.tutDone=1;writeSave()}
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
    ['e:ghiozzo','In basso hai 4 mostri. Toccane uno per mandarlo all\'attacco: costa fame, la barra verde che si ricarica da sola.'],
    ['e:lumaca','Conviene accumulare fame e mandarne tanti insieme: uno alla volta vengono fatti fuori.'],
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
