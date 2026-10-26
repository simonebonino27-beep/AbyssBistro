'use strict';
/* ===== Abyss Bistro: dati di gioco ===== */
const RAR={comune:{n:'Comune',c:'--r-comune',w:50,price:150},noncomune:{n:'Non comune',c:'--r-noncomune',w:30,price:350},raro:{n:'Raro',c:'--r-raro',w:14,price:700},epico:{n:'Epico',c:'--r-epico',w:5,price:1300},leggendario:{n:'Leggendario',c:'--r-leggendario',w:1.5,price:2600}};

/* kind: come attacca. info: frase breve. joke: didascalia comica */
const TOWERS={
  granchio:{name:'Granchio',full:'Granchio sushiman',cost:50,range:95,dmg:10,rate:.8,rar:'comune',kind:'proj',info:'Lancia nigiri a distanza',joke:'Taglia il salmone da 30 anni. Taglia anche te.'},
  squalo:{name:'Squalo',full:'Squalo buttafuori',cost:70,range:58,dmg:26,rate:.85,rar:'comune',kind:'bite',info:'Morde chi passa troppo vicino',joke:'Lista nera lunga quanto l\'oceano.'},
  rana:{name:'Rana faro',full:'Rana pescatrice faro',cost:60,range:100,dmg:0,rate:1,rar:'comune',kind:'light',info:'Illumina e attira: chi è nella luce prende +15% danni',joke:'L\'unica luce in fondo al tunnel. Ed è affamata.'},
  sardine:{name:'Sardine',full:'Sardine in brigata',cost:65,range:72,dmg:3.8,rate:.25,rar:'comune',kind:'swarm',info:'Sciame che morde a raffica',joke:'Dieci stipendi da fame, un solo cervello.'},
  polipetto:{name:'Stagista',full:'Polipetto stagista',cost:40,range:85,dmg:10,rate:.9,rar:'comune',kind:'random',info:'Effetti casuali, a volte geniali',joke:'Primo giorno. Terzo incendio.'},
  spada:{name:'Pesce spada',full:'Pesce spada cassiere',cost:90,range:125,dmg:22,rate:1.6,rar:'noncomune',kind:'pierce',info:'Colpo perforante in linea retta',joke:'Lo scontrino lo fa a fette.'},
  medusa:{name:'Medusa',full:'Medusa cameriera',cost:85,range:80,dmg:8,rate:1.2,rar:'noncomune',kind:'chain',info:'Fulmina a catena e rallenta',joke:'200 coperti, zero voglia.'},
  gamberetto:{name:'Gamberetto',full:'Gamberetto pistola',cost:80,range:75,dmg:9,rate:2.4,rar:'noncomune',kind:'stun',info:'Bolla sonica: stordisce un\'area',joke:'Piccolo, rumoroso, illegale.'},
  tartaruga:{name:'Tartaruga',full:'Tartaruga sommelier',cost:75,range:52,dmg:18,rate:2.2,rar:'noncomune',kind:'hold',info:'Blocca il nemico più avanti (non chi vola)',joke:'Consiglia il vino. Non ti lascia andare finché non ordini.'},
  palla:{name:'Pesce palla',full:'Pesce palla lavapiatti',cost:110,range:68,dmg:32,rate:3.2,rar:'raro',kind:'burst',info:'Esplode in aculei tutt\'intorno',joke:'Un altro piatto sporco ed esplode.'},
  calamaro:{name:'Calamaro',full:'Calamaro barista',cost:110,range:80,dmg:5,rate:4.5,rar:'raro',kind:'ink',info:'Nube d\'inchiostro: i nemici sbagliano strada',joke:'Il suo espresso è nero. Anche la sua anima.'},
  lanterna:{name:'Lanterna DJ',full:'Pesce lanterna DJ',cost:100,range:78,dmg:0,rate:1,rar:'raro',kind:'buff',info:'+30% velocità d\'attacco ai vicini, un po\' di luce',joke:'Mette solo techno abissale. 24 ore su 24.'},
  cavalluccio:{name:'Cavalluccio',full:'Cavalluccio sous-chef',cost:90,range:88,dmg:0,rate:2.5,rar:'raro',kind:'heal',info:'Rimette in piedi i dipendenti bloccati',joke:'Il suo brodo resuscita i morti. Letteralmente.'},
  ostrica:{name:'Ostrica',full:'Ostrica cassaforte',cost:120,range:50,dmg:0,rate:1,rar:'raro',kind:'bank',info:'Produce perle a fine ondata. Va protetta',joke:'Ha una perla. Non te la dà.'},
  manta:{name:'Manta',full:'Razza manta delivery',cost:140,range:56,dmg:30,rate:.35,rar:'epico',kind:'patrol',info:'Gira in tondo e travolge chi incrocia',joke:'Consegna in 30 secondi o il cliente muore.'},
  paguro:{name:'Paguro',full:'Paguro traslocatore',cost:130,range:100,dmg:24,rate:1,rar:'epico',kind:'mobile',info:'Cambia piazzola e attacco da solo',joke:'Ha cambiato 40 conchiglie. Nessuna era casa.'},
  balena:{name:'Balena',full:'Balena pasticcera',cost:300,range:112,dmg:230,rate:8,rar:'leggendario',kind:'gulp',info:'Inghiotte tutto quello che ha davanti',joke:'Dessert: chiunque sia in sala.'}
};
const TOWER_KEYS=Object.keys(TOWERS);

/* nemici: armor = danni ridotti salvo esplosioni; stealth = visibile solo in luce o da vicino; fly = vola sopra i blocchi */
const ENEMIES={
  ghiozzo:{name:'Ghiozzo scroccone',hp:32,speed:38,reward:6,dmg:1,r:11,rar:'comune',mcost:8,info:'Vuole mangiare gratis. In tanti.'},
  aringa:{name:'Banco di aringhe',hp:14,speed:72,reward:3,dmg:1,r:8,rar:'comune',mcost:20,group:3,info:'Velocissime, in gruppo da 3'},
  lumaca:{name:'Lumaca di mare golosa',hp:150,speed:19,reward:16,dmg:2,r:13,rar:'comune',mcost:24,info:'Lenta e piena di vita'},
  isopode:{name:'Isopode corazzato',hp:90,speed:28,reward:12,dmg:1,r:12,rar:'noncomune',mcost:28,armor:1,info:'Corazza: -65% danni, tranne le esplosioni'},
  volante:{name:'Pesce volante saltafila',hp:40,speed:62,reward:8,dmg:1,r:10,rar:'noncomune',mcost:18,fly:1,info:'Vola sopra chi blocca e sopra le trappole'},
  ladro:{name:'Granchio ladro',hp:60,speed:46,reward:10,dmg:1,r:11,rar:'noncomune',mcost:20,info:'Ruba perle all\'Ostrica e scappa'},
  stella:{name:'Stella marina divisibile',hp:70,speed:32,reward:10,dmg:1,r:12,rar:'noncomune',mcost:30,info:'Morendo si divide in 5 stelline'},
  stellina:{name:'Stellina',hp:12,speed:56,reward:2,dmg:1,r:6,rar:'comune',mcost:0,hidden:1,info:''},
  murena:{name:'Murena sgattaiolante',hp:70,speed:52,reward:12,dmg:1,r:12,rar:'raro',mcost:26,stealth:1,info:'Invisibile: si vede solo in luce o da vicino'},
  chirurgo:{name:'Pesce chirurgo critico',hp:110,speed:30,reward:14,dmg:1,r:12,rar:'raro',mcost:32,info:'Rallenta l\'attacco dei dipendenti vicini'},
  riccio:{name:'Riccio rotolante',hp:130,speed:30,reward:14,dmg:2,r:12,rar:'raro',mcost:36,info:'Corazzato davanti: colpiscilo di lato o da dietro'},
  nudi:{name:'Nudibranco tossico',hp:90,speed:26,reward:12,dmg:1,r:12,rar:'raro',mcost:28,info:'La sua scia dà la nausea ai dipendenti'},
  vipera:{name:'Pesce vipera spegnilampade',hp:100,speed:40,reward:16,dmg:1,r:12,rar:'epico',mcost:32,info:'Spegne le luci vicine per qualche secondo'},
  martello:{name:'Squalo martello affamato',hp:200,speed:34,reward:20,dmg:2,r:14,rar:'epico',mcost:44,noSlow:1,info:'Carica a scatti, ignora i rallentamenti'},
  rivale:{name:'Polpo rivale travestito',hp:130,speed:36,reward:22,dmg:2,r:13,rar:'epico',mcost:40,info:'Travestito da dipendente per metà sentiero, poi si scopre'},
  reAragosta:{name:'Re Aragosta',title:'Critico gastronomico',hp:1900,speed:14,reward:120,dmg:20,r:24,rar:'leggendario',boss:1,mcost:60,info:'Boccia un dipendente ogni 6 secondi'},
  granchioReale:{name:'Granchio reale',title:'Ingordo',hp:2600,speed:13,reward:150,dmg:20,r:26,rar:'leggendario',boss:1,mcost:66,info:'Mangia i piatti trappola e cresce, schiaccia i dipendenti'},
  kraken:{name:'Kraken del relitto',title:'Mille braccia',hp:3300,speed:12,reward:180,dmg:20,r:26,rar:'leggendario',boss:1,mcost:72,info:'Tentacoli che bloccano dipendenti a caso'},
  lanternaGigante:{name:'Pesce lanterna gigante',title:'Signore del buio',hp:3600,speed:15,reward:200,dmg:20,r:24,rar:'leggendario',boss:1,stealthBoss:1,mcost:78,info:'Spegne tutto a ondate: si vede solo la sua esca'},
  leviatano:{name:'Leviatano',title:'Due corsie di serpente',hp:5000,speed:10,reward:240,dmg:20,r:30,rar:'leggendario',boss:1,mcost:85,info:'Travolge i dipendenti accanto al sentiero'},
  megalodonte:{name:'Megalodonte',title:'Fine del menu',hp:6400,speed:18,reward:300,dmg:20,r:28,rar:'leggendario',boss:1,mcost:95,noSlow:1,info:'Carica, morde i dipendenti, sotto il 50% si infuria'}
};
const MONSTER_KEYS=Object.keys(ENEMIES).filter(k=>!ENEMIES[k].hidden);
const BOSS_KEYS=MONSTER_KEYS.filter(k=>ENEMIES[k].boss);

const MANAGERS={
  polpo:{name:'Polpo Chef',rar:'comune',info:'8 piatti trappola per piano: stordiscono e fanno 45 danni',unlock:{type:'base'}},
  pagliaccio:{name:'Pesce Pagliaccio influencer',rar:'noncomune',info:'+50% perle, ma +25% nemici per ondata',unlock:{type:'buy',price:400}},
  narvalo:{name:'Capitan Narvalo',rar:'raro',info:'Le maledizioni escono 3 volte più spesso e danno il 50% in più',unlock:{type:'boss',boss:'kraken',text:'Batti il Kraken del relitto'}},
  gamberi:{name:'Fratelli Gamberi',rar:'epico',info:'Due mani di carte: scegli una carta da ognuna',unlock:{type:'buy',price:1100}},
  nonno:{name:'Nonno Capitano',rar:'raro',info:'Il suo sottomarino lancia un siluro ogni 6 secondi',unlock:{type:'floor',floor:4,text:'Arriva al piano 5, Camini vulcanici'}},
  squalo:{name:'Squalo Squalo',rar:'leggendario',info:'Ogni colpo ha il 15% di critico x2.5',unlock:{type:'boss',boss:'megalodonte',text:'Batti il Megalodonte'}}
};
const MANAGER_KEYS=Object.keys(MANAGERS);

/* piani: depth = difficoltà. dark = livello di buio (0..1) */
const FLOORS=[
  {id:'reef',name:'Barriera corallina',dark:0,boss:'reAragosta',rule:'Piena luce. Il posto più tranquillo degli abissi, per ora.',
   paths:[[[-4,70],[292,70],[292,172],[68,172],[68,282],[292,282],[292,392],[180,392],[180,486]]]},
  {id:'kelp',name:'Foresta di kelp',dark:.12,boss:'granchioReale',rule:'Le macchie di kelp nascondono i nemici: lì dentro li colpiscono solo gli attacchi ad area.',
   paths:[[[180,-4],[180,70],[56,70],[56,190],[304,190],[304,310],[56,310],[56,420],[180,420],[180,486]]],kelp:[[150,190,30],[250,310,30],[56,250,28],[110,420,26]]},
  {id:'wreck',name:'Relitto',dark:.15,boss:'kraken',rule:'Due corsie che si incrociano: i nemici arrivano da sinistra e da destra.',
   paths:[[[-4,80],[290,80],[290,300],[180,300],[180,486]],[[364,190],[70,190],[70,400],[180,400],[180,486]]]},
  {id:'trench',name:'Fossa buia',dark:.62,boss:'lanternaGigante',rule:'Buio: i dipendenti vedono solo vicino a sé o nella luce della Rana faro.',
   paths:[[[-4,60],[300,60],[300,150],[60,150],[60,240],[300,240],[300,330],[60,330],[60,420],[180,420],[180,486]]]},
  {id:'vents',name:'Camini vulcanici',dark:.4,boss:'leviatano',rule:'I camini eruttano: respingono i nemici e scottano i dipendenti vicini.',
   paths:[[[364,80],[70,80],[70,220],[290,220],[290,360],[100,360],[100,440],[180,440],[180,486]]],vents:[[190,80],[200,220],[200,360]]},
  {id:'abyss',name:'Abisso',dark:.85,boss:'megalodonte',rule:'Quasi buio totale. Senza luce i dipendenti sono ciechi.',
   paths:[[[-4,250],[50,250],[50,50],[310,50],[310,330],[130,330],[130,160],[220,160],[220,420],[180,420],[180,486]]]}
];

/* nemici disponibili per profondità */
const POOL=[['ghiozzo','aringa','lumaca'],['isopode','volante','ladro'],['stella','murena','chirurgo'],['riccio','nudi','vipera'],['martello','rivale'],[]];
function poolFor(depth){let p=[];for(let i=0;i<=Math.min(depth,5);i++)p=p.concat(POOL[i]);return p}

/* ===== carte della difesa ===== */
const pct=x=>Math.round((x-1)*100);
function empCardFor(k){const d=TOWERS[k];const owned=!!save.emp[k];
  return{id:'new_'+k,type:'Nuovo dipendente',name:d.full,rar:d.rar,icon:k,joke:d.joke,
    eff:()=>(owned?'Entra nel mazzo: ':'TROVATO! Sbloccato per sempre e nel mazzo: ')+d.info.toLowerCase()+' ('+d.cost+' perle)',
    apply:s=>{if(!save.emp[k]){save.emp[k]=1;writeSave();s.found.push(k)}s.deck.push(k);s.pile.unshift(k)}}}
function dmgCardFor(k){const d=TOWERS[k];const jokes={granchio:'Ha scoperto il wasabi. Non tornerà più quello di prima.',squalo:'Dal dentista è andato con una lima da ferro.',spada:'Ha affilato il naso col cassetto della cassa.',medusa:'Qualcuno l\'ha attaccata alla presa del frigo.',gamberetto:'Ha comprato il silenziatore. Non lo usa.',palla:'Lavora con i guanti di gomma. Ora anche con la rabbia.',sardine:'Hanno assunto altre due cugine.',polipetto:'Gli hanno detto bravo. Una volta.',tartaruga:'Ha aperto la bottiglia buona.',calamaro:'Doppio shot di inchiostro.',manta:'Consegne con la sirena.',paguro:'Conchiglia nuova, attitudine vecchia.',balena:'Ha scoperto il buffet.'};
  return{id:'dmg_'+k,type:'Potenziamento',name:d.name+' arrabbiato',rar:d.rar==='leggendario'?'epico':d.rar==='epico'?'raro':'comune',icon:k,joke:jokes[k]||'Oggi ha litigato con tutti.',
    eff:s=>'Danno '+d.name+': +'+pct(s.mods.dmg[k])+'% → +'+pct(s.mods.dmg[k]*1.35)+'%',apply:s=>{s.mods.dmg[k]*=1.35}}}
const CARDS=[
  {id:'chain',type:'Potenziamento',name:'Alta tensione',rar:'noncomune',joke:'Qualcuno ha attaccato la medusa alla presa del frigo.',ok:s=>s.deck.includes('medusa'),eff:s=>'Bersagli a catena della Medusa: '+(3+s.mods.chain)+' → '+(4+s.mods.chain),apply:s=>{s.mods.chain++}},
  {id:'range',type:'Potenziamento',name:'Occhiali da sub',rar:'noncomune',joke:'Ora vedono benissimo. Anche cose che non dovrebbero.',eff:s=>'Gittata di tutti: +'+pct(s.mods.range)+'% → +'+pct(s.mods.range*1.15)+'%',apply:s=>{s.mods.range*=1.15}},
  {id:'rate',type:'Potenziamento',name:'Caffè doppio',rar:'raro',joke:'Quinto caffè. Nessuno dorme da martedì.',eff:s=>'Velocità d\'attacco: +'+pct(s.mods.rate)+'% → +'+pct(s.mods.rate*1.2)+'%',apply:s=>{s.mods.rate*=1.2}},
  {id:'disc',type:'Potenziamento',name:'Saldi abissali',rar:'raro',joke:'Il sindacato dei pesci ha ceduto. Per ora.',ok:s=>s.mods.upDisc>.4,eff:s=>'Costo potenziamenti: -'+Math.round((1-s.mods.upDisc)*100)+'% → -'+Math.round((1-s.mods.upDisc*.7)*100)+'%',apply:s=>{s.mods.upDisc*=.7}},
  {id:'hire',type:'Potenziamento',name:'Contratti in nero',rar:'noncomune',joke:'Nessuna busta paga. Nessuna domanda.',ok:s=>s.mods.hireDisc>.5,eff:s=>'Costo assunzioni: -'+Math.round((1-s.mods.hireDisc)*100)+'% → -'+Math.round((1-s.mods.hireDisc*.85)*100)+'%',apply:s=>{s.mods.hireDisc*=.85}},
  {id:'omakase',type:'Potenziamento',name:'Omakase',rar:'epico',joke:'Lo chef decide tutto. Anche chi sopravvive.',eff:s=>'Danno di tutti: +'+pct(s.mods.all)+'% → +'+pct(s.mods.all*1.25)+'%',apply:s=>{s.mods.all*=1.25}},
  {id:'light',type:'Potenziamento',name:'Lampadine al neon',rar:'noncomune',joke:'Comprate da un tizio su una barca. Niente scontrino.',eff:s=>'Raggio della luce: +'+pct(s.mods.light)+'% → +'+pct(s.mods.light*1.3)+'%',apply:s=>{s.mods.light*=1.3}},
  {id:'happy',type:'Maledizione',name:'Happy hour',rar:'raro',curse:1,joke:'Cocktail a metà prezzo. Clienti a doppia velocità.',eff:s=>'Perle +'+Math.round(50*s.mods.curse)+'% · velocità nemici +20%',apply:s=>{s.mods.perle*=1+.5*s.mods.curse;s.mods.enemySpeed*=1.2}},
  {id:'overbook',type:'Maledizione',name:'Overbooking',rar:'noncomune',curse:1,joke:'300 prenotazioni per 12 tavoli. Bella mossa.',ok:s=>s.hp>6,eff:s=>'Perle: '+s.perle+' → '+(s.perle+Math.round(150*s.mods.curse))+' · vita: '+s.hp+' → '+(s.hp-5),apply:s=>{s.perle+=Math.round(150*s.mods.curse);s.hp-=5}},
  {id:'possessed',type:'Maledizione',name:'Chef posseduto',rar:'epico',curse:1,joke:'Il Polpo Chef parla lingue antiche. I piatti escono perfetti.',ok:s=>!s.mods.drain,eff:s=>'Danno di tutti +'+Math.round(60*s.mods.curse)+'% · -2 vita a inizio ondata',apply:s=>{s.mods.all*=1+.6*s.mods.curse;s.mods.drain=2}},
  {id:'horde',type:'Maledizione',name:'Pullman di turisti',rar:'raro',curse:1,joke:'Sono arrivati in 80. Vogliono tutti il bagno.',eff:s=>'Nemici per ondata +30% · perle da ogni nemico +'+Math.round(60*s.mods.curse)+'%',apply:s=>{s.mods.count*=1.3;s.mods.perle*=1+.6*s.mods.curse}},
  {id:'glass',type:'Maledizione',name:'Bancone di cristallo',rar:'raro',curse:1,joke:'Elegantissimo. Si rompe se lo guardi.',ok:s=>s.hp>8,eff:s=>'Vita: '+s.hp+' → '+Math.ceil(s.hp/2)+' · velocità d\'attacco +'+Math.round(40*s.mods.curse)+'%',apply:s=>{s.hp=Math.ceil(s.hp/2);s.mods.rate*=1+.4*s.mods.curse}},
  {id:'wasabi',type:'Piatto speciale',name:'Bomba di wasabi',rar:'noncomune',joke:'Wasabi industriale. Illegale in 14 paesi.',eff:s=>'Bombe: '+s.wasabi+' → '+(s.wasabi+1)+' · 60 danni a tutti i nemici',apply:s=>{s.wasabi++}},
  {id:'tip',type:'Piatto speciale',name:'Mancia generosa',rar:'comune',joke:'Un cliente ubriaco ha lasciato il portafoglio. E un dente.',eff:s=>'Perle: '+s.perle+' → '+(s.perle+80),apply:s=>{s.perle+=80}},
  {id:'miso',type:'Piatto speciale',name:'Zuppa di miso',rar:'comune',joke:'Cura tutto. Nessuno sa cosa ci sia dentro.',eff:s=>'Vita bancone: '+s.hp+' → '+(s.hp+6),apply:s=>{s.hp+=6}},
  {id:'plates',type:'Piatto speciale',name:'Piatti dal relitto',rar:'comune',joke:'Trovati in una nave affondata. Meglio non chiedere.',ok:s=>s.mgr==='polpo',eff:s=>'Trappole: '+s.traps+' → '+(s.traps+3),apply:s=>{s.traps+=3}},
  {id:'freeze',type:'Piatto speciale',name:'Sorbetto glaciale',rar:'raro',joke:'Congela il cervello. Anche ai pesci.',eff:s=>'Sorbetti: '+s.freeze+' → '+(s.freeze+1)+' · ferma tutti i nemici per 4 secondi',apply:s=>{s.freeze++}}
];
function pickCards(s,n){
  const pool=CARDS.filter(c=>!c.ok||c.ok(s)).map(c=>Object.assign({},c));
  const notIn=TOWER_KEYS.filter(k=>!s.deck.includes(k));
  for(const k of shuffle(notIn.slice()).slice(0,4))pool.push(empCardFor(k));
  for(const k of shuffle([...new Set(s.deck)]).slice(0,3))if(TOWERS[k].dmg>0)pool.push(dmgCardFor(k));
  const out=[];
  while(out.length<n&&pool.length){const wt=c=>RAR[c.rar].w*(c.curse&&s.mgr==='narvalo'?3:1);const tot=pool.reduce((a,c)=>a+wt(c),0);let r=rnd()*tot,i=0;for(;i<pool.length;i++){r-=wt(pool[i]);if(r<=0)break}
    const c=pool.splice(Math.min(i,pool.length-1),1)[0];if(!out.some(o=>o.id===c.id))out.push(c)}
  return out}

/* ===== carte della modalità Mostro affamato ===== */
const MCARDS=[
  {id:'regen',type:'Mutazione',name:'Fame da lupo',rar:'comune',joke:'Hanno saltato il pranzo. E la cena. E il 1998.',eff:s=>'Ricarica fame: +'+pct(s.mm.regen)+'% → +'+pct(s.mm.regen*1.3)+'%',apply:s=>{s.mm.regen*=1.3}},
  {id:'hp',type:'Mutazione',name:'Scaglie dure',rar:'comune',joke:'Palestra tutti i giorni. Solo petto.',eff:s=>'Vita dei mostri: +'+pct(s.mm.hp)+'% → +'+pct(s.mm.hp*1.25)+'%',apply:s=>{s.mm.hp*=1.25}},
  {id:'spd',type:'Mutazione',name:'Pinne turbo',rar:'noncomune',joke:'Gli hanno montato un fuoribordo. Nessuno sa come.',eff:s=>'Velocità: +'+pct(s.mm.speed)+'% → +'+pct(s.mm.speed*1.15)+'%',apply:s=>{s.mm.speed*=1.15}},
  {id:'cost',type:'Mutazione',name:'Menu fisso',rar:'noncomune',joke:'Tutto a 9,90. Anche i mostri.',ok:s=>s.mm.cost>.5,eff:s=>'Costo dei mostri: -'+Math.round((1-s.mm.cost)*100)+'% → -'+Math.round((1-s.mm.cost*.8)*100)+'%',apply:s=>{s.mm.cost*=.8}},
  {id:'bite',type:'Mutazione',name:'Morso al bancone',rar:'raro',joke:'Il legno è la parte migliore.',eff:s=>'Danno al bancone: +'+pct(s.mm.bite)+'% → +'+pct(s.mm.bite*1.5)+'%',apply:s=>{s.mm.bite*=1.5}},
  {id:'panic',type:'Sabotaggio',name:'Panico in cucina',rar:'raro',joke:'Qualcuno ha urlato "ispezione sanitaria".',eff:s=>'Velocità d\'attacco della difesa: -'+Math.round((1-s.ai.rate)*100)+'% → -'+Math.round((1-s.ai.rate*.85)*100)+'%',apply:s=>{s.ai.rate*=.85}},
  {id:'snack',type:'Mutazione',name:'Antipasto',rar:'comune',joke:'Un aperitivo prima della strage.',eff:s=>'Fame massima: '+s.hungerMax+' → '+(s.hungerMax+25),apply:s=>{s.hungerMax+=25}},
  {id:'strike',type:'Sabotaggio',name:'Sciopero del personale',rar:'epico',joke:'Il sindacato dei granchi incrocia le chele.',eff:s=>'La difesa parte con '+Math.round(s.ai.startCut*100)+'% → '+Math.round(s.ai.startCut*70)+'% del budget',apply:s=>{s.ai.startCut*=.7}}
];
function monCardFor(k){const d=ENEMIES[k];const owned=!!save.mon[k];return{id:'mon_'+k,type:'Nuovo mostro',name:d.name,rar:d.rar,icon:k,mon:1,joke:d.info,
  eff:()=>(owned?'Entra nel mazzo':'TROVATO! Sbloccato per sempre')+' · costo '+d.mcost+' fame',apply:s=>{if(!save.mon[k]){save.mon[k]=1;writeSave();s.found.push(k)}s.mdeck.push(k);s.mpile.unshift(k)}}}
function pickMCards(s,n){const pool=MCARDS.filter(c=>!c.ok||c.ok(s)).map(c=>Object.assign({},c));
  for(const k of shuffle(MONSTER_KEYS.filter(k=>!ENEMIES[k].boss&&!s.mdeck.includes(k))).slice(0,3))pool.push(monCardFor(k));
  const out=[];while(out.length<n&&pool.length){const tot=pool.reduce((a,c)=>a+RAR[c.rar].w,0);let r=rnd()*tot,i=0;for(;i<pool.length;i++){r-=RAR[pool[i].rar].w;if(r<=0)break}out.push(pool.splice(Math.min(i,pool.length-1),1)[0])}return out}

/* ===== ristorante (si migliora con le stelle Michelin) ===== */
const RESTO={
  hp:{name:'Bancone rinforzato',info:'+3 vita al bancone',max:5,cost:l=>l+1},
  cash:{name:'Cassa piena',info:'+25 perle a inizio run',max:5,cost:l=>l+1},
  cards:{name:'Menu degustazione',info:'Lv1: 1 rimescolo carte · Lv2: 4 carte tra cui scegliere · Lv3: 2 rimescoli',max:3,cost:l=>2+l*2},
  deco:{name:'Arredamento',info:'Sblocca nuove insegne per il sushi bar',max:3,cost:l=>1+l}
};
const DECOS=[{name:'Legno classico',sign:'#f1dca2',wood:'#5e3d27'},{name:'Neon rosa',sign:'#ff6ad5',wood:'#3a2a3e'},{name:'Oro del relitto',sign:'#ffd23f',wood:'#4a3416'},{name:'Lava',sign:'#ff6a2a',wood:'#2a1a16'}];
const empLvlCost=(k,l)=>Math.round(RAR[TOWERS[k].rar].price*.35*l);
const monLvlCost=(k,l)=>Math.round(RAR[ENEMIES[k].rar].price*.25*l);
const LVL_MAX=5;
/* sfida del giorno: stessa per tutti nello stesso giorno */
function dailyInfo(){const d=new Date(),key=d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate(),R=rng(key*7+3);
  const mgr=MANAGER_KEYS[Math.floor(R()*MANAGER_KEYS.length)];const pool=TOWER_KEYS.slice();const deck=[];while(deck.length<6){const k=pool.splice(Math.floor(R()*pool.length),1)[0];deck.push(k)}
  const curses=CARDS.filter(c=>c.curse&&c.id!=='overbook');const curse=curses[Math.floor(R()*curses.length)];
  const mesi=['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
  return{key,mgr,deck,curse,label:d.getDate()+' '+mesi[d.getMonth()]}}
const CHEF_LINES=['Chiudete le porte, arrivano!','Coltelli pronti, gente.','Nessuno mangia gratis nel mio locale.','Chi sporca, paga. Con la vita.','Oggi menu degustazione: voi.','Stagista, giù quella padella!','Se muoio, la ricetta del ragù non la saprete mai.','Ricordate: il cliente ha sempre torto.','Ho dormito 12 minuti. Sono carico.'];
const BOSS_LINES=['Quello lì non ha prenotato.','Fategli assaggiare la specialità della casa.','Stavolta lo serviamo noi.','Tutti al bancone. Adesso.'];
