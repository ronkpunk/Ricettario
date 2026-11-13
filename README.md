# 🍳 Il Ricettario

Web app mobile-first con le 37 ricette del ricettario di famiglia: indice, ricerca (per titolo, ingrediente, testo),
ingredienti **scalabili per numero di persone**, procedimento a passi spuntabili, funzionamento offline (PWA).
Le ricette sono salvate su **Cloud Firestore** e l'app è ospitata su **Firebase Hosting**.

## Struttura
- `public/` – app statica (HTML/CSS/JS, nessun build step) → Firebase Hosting
- `scripts/recipes.src.mjs` – trascrizione delle ricette dal PDF; `npm run build:data` produce `public/data/recipes.json`
- `scripts/setup-firebase.mjs` – configura e pubblica su Firebase; i dati stanno in Firestore (`recipes/{id}` + `meta/categories`)
- `firestore.rules` – lettura pubblica, scrittura vietata ai client

## Pubblicazione su Firebase (una tantum)
1. Console Firebase → **Aggiungi progetto** (anche senza Google Analytics) e annota il *project id*.
2. Dal terminale, nella cartella del repository:
   ```bash
   npm install
   npx firebase login
   npm run setup -- <project-id>
   ```
   `setup` crea il database Firestore (regione eur3), registra l'app web, scrive `public/firebase-config.js` e pubblica
   le regole Firestore e l'app su Hosting → `https://<project-id>.web.app`.
3. Console → *Build → Authentication → Inizia → Metodo di accesso* → abilita **Google**.
4. Apri l'app, in fondo alla home tocca **«Importa le ricette su Firestore»** e accedi con Google: le 37 ricette vengono salvate nel database.

Le regole (`firestore.rules`) permettono la lettura a tutti e la scrittura solo all'account Google indicato nella funzione `isOwner()`;
per aggiungere altri editor aggiungi le loro email all'elenco e rilancia `npm run deploy`.
Finché Firebase non è configurato (o Firestore non risponde) l'app usa i dati locali e salva le modifiche nel browser.

## Modificare, aggiungere, eliminare ricette
Direttamente nell'app: tocca la matita in una ricetta, oppure «Nuova ricetta». Con Firestore configurato l'app chiede l'accesso con Google
e salva su Firestore; senza Firebase le modifiche restano nel browser (con «Ripristina il ricettario originale» in fondo all'elenco).
Le ricette originali vivono in `scripts/recipes.src.mjs` (`npm run build:data` rigenera `public/data/recipes.json`, usato per l'importazione iniziale e come ripiego offline).

## Modalità focus
«Cucina passo passo» mostra prima gli ingredienti (con le dosi per le persone scelte), poi un passaggio alla volta con «Avanti»,
etichetta del passaggio (es. «Procedimento 3/9»), barra di avanzamento, carattere ingrandibile/riducibile (A− / A+) e schermo sempre acceso.
Funziona anche scorrendo a destra/sinistra.

Formato ingrediente: `"250 g farina|nota"` (la parte dopo `|` è una nota non scalata; le righe senza numero, es. "q.b.", restano fisse).

## Note sulla trascrizione
- Dove il PDF non indica le porzioni la dose base è stimata (segnalato nell'app come «dose originale stimata»).
- Pasta frolla: nel PDF il procedimento era «n.d.». Pasta con speck: mancava l'elenco ingredienti, ricavato dal procedimento (quantità q.b.).
- Torta di rose (Manitoba) e Danubio: nel testo compaiono ingredienti senza dose (farcitura, crema pasticcera): elencati come «quantità non indicate».
- Le foto del PDF non sono incluse.
