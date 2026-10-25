# Abyss Bistro

Tower defense roguelike in 2D. Il Polpo Chef difende il suo sushi bar in fondo all'oceano dai mostri affamati degli abissi, assumendo pesci instabili come dipendenti.

**Gioca:** https://simonebonino27-beep.github.io/AbyssBistro/

## Cosa c'è (v4, gioco completo da bilanciare)

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
- **Mazzo**: scegli 4-8 dipendenti, in partita ne hai 4 in mano in ordine casuale. Le carte dopo ogni ondata possono farti trovare dipendenti nuovi.
- **Carte** con rarità (comune → leggendario), battuta ed effetto in numeri: potenziamenti, maledizioni, piatti speciali.

### Progressione (Il Bistrot)
- **Perle**: comprano dipendenti, gestori e mostri, e ne alzano il livello (fino al 5).
- **Stelle Michelin**: 1 per boss battuto, 2 se il bancone non ha preso danni in quel piano. Migliorano il ristorante: vita del bancone, perle iniziali, carte migliori, insegne.

### Tutorial
- Alla prima apertura il gioco chiede se conosci già i tower defense: se rispondi no, il Polpo Chef ti guida passo per passo nella tua prima run vera.
- La prima volta che apri Run lunga, Infinita, Mostro affamato o la Sfida del giorno compare una scheda che spiega la modalità.
- Il tutorial si può rifare da Come si gioca.

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
manifest.json     dati dell'app installabile
sw.js             funzionamento offline
icons/            icone dell'app
```
Nessuna dipendenza e nessuna build: basta servire la cartella (GitHub Pages lo fa da solo).
