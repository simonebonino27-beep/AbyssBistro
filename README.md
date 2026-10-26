# Abyss Bistro

Tower defense roguelike in 2D. Il Polpo Chef difende il suo sushi bar in fondo all'oceano dai mostri affamati degli abissi, assumendo pesci instabili come dipendenti.

**Gioca:** https://simonebonino27-beep.github.io/AbyssBistro/

## Cosa c'è (v7)

### Menu
Cinque schede da scorrere col dito o dalla barra in basso, si parte da Gioca:
1. **Negozio**: offerte del giorno (mancia gratis, un dipendente, un mostro, un pacchetto scontato), pacchetti, sblocchi di dipendenti, gestori e mostri.
2. **Carte**: livello giocatore, pacchetti da aprire, collezione con copie e potenziamenti.
3. **Gioca**: sfida del giorno e modalità.
4. **Amici**: PvP a codice, classifica amici, lista amici, brigate (in arrivo col gioco online).
5. **Ristorante**: miglioramenti con le stelle, insegne, bestiario, come si gioca, tutorial, impostazioni.


### Modalità
- **Run corta**: 3 piani (2 a caso + l'Abisso), 3 ondate e un boss per piano.
- **Run lunga**: tutti e 6 i piani fino al Megalodonte, 5 ondate e un boss per piano.
- **Infinita**: ondate senza fine, un boss ogni 5, i piani cambiano ciclicamente.
- **Mostro affamato**: ruoli invertiti. Guidi i mostri contro una cucina difesa dall'IA, spendendo fame. 3 round, 2:30 ciascuno.

### Contenuti
- **17 dipendenti** con attacchi diversi: proiettili, morsi, colpi perforanti, catene elettriche, stordimenti, esplosioni, inchiostro che confonde, blocco, luce, buff, cure, perle, pattuglia, trasloco, sciame, balena che inghiotte e stagista casuale.
- **6 gestori**: Polpo Chef (trappole), Pesce Pagliaccio (+perle, +nemici), Capitan Narvalo (maledizioni potenziate), Fratelli Gamberi (due mani di carte), Nonno Capitano (siluri), Squalo Squalo (critici).
- **14 nemici** con abilità: corazza, volo, furti, divisione, invisibilità, aura che rallenta, corazza frontale, nausea, spegni-luce, carica, travestimento.
- **6 boss**: Re Aragosta, Granchio reale, Kraken, Pesce lanterna gigante, Leviatano, Megalodonte. Battuti diventano mostri leggendari per la modalità Mostro affamato.
- **6 piani** con regole proprie: Barriera corallina, Foresta di kelp (le alghe nascondono i nemici), Relitto (due corsie che si incrociano), Fossa buia (buio: serve la Rana faro), Camini vulcanici (eruzioni), Abisso (buio quasi totale).
- **Mazzo**: scegli 4-8 dipendenti, in partita ne hai 3 in mano: quella che usi torna in fondo al mazzo e ne entra un'altra a caso. Puoi cambiare la mano pagando perle (o fame, da mostro). Le carte dopo ogni ondata possono farti trovare dipendenti nuovi.
- **Carte** con rarità (comune → leggendario), battuta ed effetto in numeri: potenziamenti, maledizioni, piatti speciali.

### Progressione (Il Bistrot)
- **Perle**: comprano dipendenti, gestori e mostri, e ne alzano il livello (fino al 5).
- **Stelle Michelin**: 1 per boss battuto, 2 se il bancone non ha preso danni in quel piano. Migliorano il ristorante: vita del bancone, perle iniziali, carte migliori, insegne.

### Le mie carte e pacchetti
- Collezione di dipendenti, mostri e gestori con livello e copie.
- 4 pacchetti (Sacchetto d'alghe, Cassa del relitto, Forziere abissale, Scrigno del Megalodonte): si comprano con le perle o si vincono battendo i boss (più raro più è profondo il piano), vincendo round nel Mostro affamato e salendo di livello giocatore.
- I doppioni diventano copie: raggiunte quelle richieste puoi pagare il potenziamento in perle.
- Rimescolo a pagamento delle carte dopo le ondate e della mano di dipendenti.

### Online (Supabase)
- **Duello dei gestori** in diretta: ognuno difende il suo gestore (40 vita), con la fame manda mostri nella cucina dell'altro, in alto si vede la partita dell'avversario. 3 minuti, poi supplementari con fame doppia.
- **Scalata** in diretta: stesse ondate per tutti e due, ogni boss battuto regala 3 mostri all'altro, chi cade per primo perde.
- Stanze con codice di 4 lettere, inviti agli amici online, faccine, rivincita, trofei.
- Amici col codice amico, classifica della sfida del giorno (amici e mondo), brigate (clan) fino a 30 chef con chat.
- Database: `supabase.sql` da incollare una volta nello SQL Editor di Supabase. Il PvP in diretta usa Realtime e non ha tabelle.
- Prova in locale senza server: apri due schede con `?localnet=1&slot=a` e `?localnet=1&slot=b`.

### PvP a codice (anche senza internet)
Ogni sfida è un codice `ABX-...` da mandare in chat; l'amico lo incolla in **PvP** e gioca.
- **Chef contro Chef**: stesso piano, stesse ondate e stesse carte decisi dal codice. Vince chi fa più punti.
- **Mostro contro Mostro**: stessa cucina da divorare con gli stessi mostri. Vince chi fa più danni.
- **Chef contro Mostro**: costruisci una cucina con 1000 perle, l'amico la attacca da mostro.
- **Mostro contro Chef**: prepari un'orda con 600 di fame, l'amico si difende in 3 ondate.
- **Classifica amici** della sfida del giorno: a fine sfida esce un codice col punteggio, chi lo incolla ti vede in classifica.
- Lista amici con duelli vinti e persi.

### Posta
- Premi di accesso giornaliero su 7 giorni (perle, stelle, pacchetti; il settimo giorno un Forziere), con serie di accessi.
- Regalo di benvenuto e novità.

### Tutorial
- Alla prima apertura il gioco chiede se conosci già i tower defense: se rispondi no, il Polpo Chef ti guida passo per passo nella tua prima run vera.
- La prima volta che apri Run lunga, Infinita, Mostro affamato o la Sfida del giorno compare una scheda che spiega la modalità.
- Il tutorial è graduale: fa fare a te ogni mossa (assumere, potenziare, scegliere carte, trappole, cambiare mano) e si può rifare da Come si gioca.

### Altro
- Pausa, volume separato di musica ed effetti, velocità x2.
- Salvataggio automatico sul dispositivo + codice di backup per spostarlo su un altro.
- Installabile come app (PWA), funziona anche offline.

## Installarlo sul telefono
- **Android (Chrome)**: apri il link, menu ⋮ → *Installa app*.
- **iPhone (Safari)**: apri il link, Condividi → *Aggiungi alla schermata Home*.

## Salvataggi
I progressi restano nel browser del dispositivo (localStorage). Per non perderli cambiando telefono o browser: **Impostazioni o Pausa → Copia codice**, poi sull'altro dispositivo incolla e premi **Carica codice**. Cancellare i dati del sito dal browser cancella anche i salvataggi: copia prima il codice.

## Struttura
```
index.html        pagina del gioco
css/style.css     grafica dell'interfaccia
js/core.js        costanti, salvataggio, audio
js/data.js        dipendenti, nemici, boss, gestori, piani, carte, prezzi
js/art.js         disegni di tutti i personaggi
js/world.js       piani, percorsi, fondali, luce e buio
js/game.js        simulazione della partita e disegno
js/ui.js          menu, Bistrot, schermate, ciclo principale
js/cards.js       collezione, copie, pacchetti, livello giocatore
js/tutorial.js    tutorial guidato e intro delle modalità
js/social.js      PvP a codice, classifica amici, posta
js/menu.js        menu a 5 schede, offerte del giorno
js/online.js      Supabase: amici, stanze, inviti, classifica, brigate
js/live.js        PvP in diretta: Duello dei gestori e Scalata
js/vendor/        supabase-js (licenza MIT)
supabase.sql      tabelle e funzioni del database
manifest.json     dati dell'app installabile
sw.js             funzionamento offline
icons/            icone dell'app
```
Nessuna build: basta servire la cartella (GitHub Pages lo fa da solo).
