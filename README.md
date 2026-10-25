# Abyss Bistro

Tower defense roguelike in 2D. Il Polpo Chef difende il suo sushi bar in fondo all'oceano dai mostri affamati degli abissi, assumendo pesci instabili come dipendenti.

**Gioca:** https://simonebonino27-beep.github.io/AbyssBistro/ *(attivo dopo aver acceso GitHub Pages, vedi sotto)*

## Cosa c'è in questa versione (prototipo v3)

- **Modalità**: Run corta (piano 1, 3 ondate + boss Re Aragosta) e Infinita (boss ogni 5 ondate). Run lunga e Mostro affamato in arrivo.
- **Dipendenti**: Granchio sushiman, Squalo buttafuori, Medusa cameriera, Pesce palla lavapiatti, su 18 piazzole fisse. Si potenziano fino al livello 3.
- **Nemici**: Ghiozzo scroccone, Banco di aringhe, Lumaca di mare golosa, boss Re Aragosta critico gastronomico.
- **Carte roguelike** dopo ogni ondata, con rarità (comune, non comune, raro, epico, leggendario), battuta ed effetto in numeri.
- **Polpo Chef**: piatti trappola sul sentiero. Bomba di wasabi come piatto speciale.
- **Pausa, volume** di musica ed effetti, velocità x2.
- **Salvataggio** automatico su ogni dispositivo (perle, record, volume) + codice di backup per spostarlo su un altro.
- **Installabile come app** (PWA): funziona anche offline.

## Come pubblicarlo su GitHub Pages

1. Vai su **Settings → Pages** del repository.
2. In **Build and deployment** scegli *Deploy from a branch*, branch `main`, cartella `/ (root)`, poi **Save**.
3. Dopo un minuto il gioco è online all'indirizzo qui sopra.

## Installarlo sul telefono

- **Android (Chrome)**: apri il link, menu ⋮ → *Installa app*.
- **iPhone (Safari)**: apri il link, Condividi → *Aggiungi alla schermata Home*.

## Salvataggi

I progressi restano nel browser del dispositivo (localStorage). Per non perderli cambiando telefono o browser: **Pausa o Impostazioni → Copia codice**, poi sull'altro dispositivo **Incolla → Carica codice**.

Cancellare i dati del sito dal browser cancella anche i salvataggi: copia prima il codice.

## Struttura

```
index.html          il gioco completo (grafica, audio e logica in un solo file)
manifest.json       dati dell'app installabile
sw.js               service worker per il funzionamento offline
icons/              icone dell'app
```

Nessuna dipendenza e nessuna build: basta aprire `index.html` o servirlo da GitHub Pages.

## Game design

Documento completo di game design: dipendenti, gestori, nemici, boss, rarità, progressione e modalità.
