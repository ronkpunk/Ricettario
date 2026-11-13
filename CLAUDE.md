# Il Ricettario

Web app statica mobile-first (stile Material) con le ricette di famiglia: `public/` (Hosting), dati in Firestore.
Vedi `README.md` per struttura e comandi.

## Obiettivo in corso: pubblicare su Firebase + Firestore
1. Verifica il login: `firebase login:list` (altrimenti `firebase login --no-localhost`).
2. Crea il progetto Firebase (nome suggerito: `ricettario-famiglia`, id univoco) o usa quello che l'utente indica, tramite il server MCP `firebase` (`.mcp.json`).
3. Esegui `npm run setup -- <project-id>`: crea Firestore (eur3), registra l'app web, scrive `public/firebase-config.js`, pubblica regole e Hosting.
4. Ricorda all'utente i due passi manuali: abilitare **Google** in Authentication e toccare «Importa le ricette su Firestore» nell'app.

## Regole
- Ruoli in `users/{uid}` (user / editor / admin, status active / disabled): lettura ricette pubblica; scrivono ricette editor e admin; suggeriscono solo i registrati attivi; solo l'admin gestisce gli utenti. `ronkpunk@gmail.com` (email verificata) è sempre admin (`firestore.rules`, funzione `bootAdmin()`). Progetto completo in `docs/gestione-utenti.md`; test delle regole: `npm run test:rules`.
- `.firebaserc` parte vuoto: lo scrive `npm run setup -- <project-id>`. Se il CLI lamenta un project id non valido, controlla quel file.
- Non committare `serviceAccount*.json` né chiavi. `public/firebase-config.js` può essere committato (è config pubblica).
- Dopo modifiche a `public/app.js` o `public/style.css` rigenera la demo: `python3 scripts/build-demo.py`.
