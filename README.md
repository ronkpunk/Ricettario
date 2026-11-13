# 🍳 Il Ricettario

Web app mobile-first con le 37 ricette del ricettario di famiglia: indice, ricerca (per titolo, ingrediente, testo),
ingredienti **scalabili per numero di persone**, procedimento a passi spuntabili, funzionamento offline (PWA).
Le ricette sono salvate su **Cloud Firestore** e l'app è ospitata su **Firebase Hosting**.

## Struttura
- `public/` – app statica (HTML/CSS/JS, nessun build step) → Firebase Hosting
- `scripts/recipes.src.mjs` – trascrizione delle ricette dal PDF; `npm run build:data` produce `public/data/recipes.json`
- `scripts/seed.mjs` – carica le ricette su Firestore (`recipes/{id}` + `meta/categories`)
- `firestore.rules` – lettura pubblica, scrittura vietata ai client

## Pubblicazione (una tantum)
1. Console Firebase → **Crea progetto** → *Build → Firestore Database → Crea database*.
2. *Impostazioni progetto → Le tue app → Web (</>)* → copia la config in `public/firebase-config.js`
   e imposta il project id in `.firebaserc`.
3. *Impostazioni progetto → Account di servizio → Genera nuova chiave privata* → salva come `serviceAccount.json` (è già in `.gitignore`).
4. Da terminale:
   ```bash
   npm install
   npx firebase login
   GOOGLE_APPLICATION_CREDENTIALS=serviceAccount.json npm run seed   # scrive le ricette su Firestore
   npm run deploy                                                    # regole Firestore + Hosting
   ```
L'app sarà su `https://<project-id>.web.app`.

Se `firebase-config.js` non è configurato (o Firestore non risponde) l'app usa automaticamente `public/data/recipes.json`.

## Modificare una ricetta
Edita `scripts/recipes.src.mjs` → `npm run build:data && npm run seed && npm run deploy`.
Formato ingrediente: `"250 g farina|nota"` (la parte dopo `|` è una nota non scalata; le righe senza numero, es. "q.b.", restano fisse).

## Note sulla trascrizione
- Dove il PDF non indica le porzioni la dose base è stimata (segnalato nell'app come «dose originale stimata»).
- Pasta frolla: nel PDF il procedimento era «n.d.». Pasta con speck: mancava l'elenco ingredienti, ricavato dal procedimento (quantità q.b.).
- Torta di rose (Manitoba) e Danubio: nel testo compaiono ingredienti senza dose (farcitura, crema pasticcera): elencati come «quantità non indicate».
- Le foto del PDF non sono incluse.
