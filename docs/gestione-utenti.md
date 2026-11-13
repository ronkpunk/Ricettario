# Gestione utenti e ruoli — progetto

Stato: **bozza di progettazione**, nulla di questo è ancora nel codice o nelle regole pubblicate.
Le regole attuali (`firestore.rules`, un solo editor per email) restano valide finché non si implementa il piano.

## 1. Requisiti

| Chi | Cosa può fare |
|---|---|
| **Anonimo** (non registrato) | Vedere ricette, ricerca, indice, focus. **Suggerire modifiche** a una ricetta. |
| **Utente standard** (registrato) | Come l'anonimo, con nome e storico dei propri suggerimenti. |
| **Editor** | Tutto quanto sopra + modificare, aggiungere, eliminare ricette + esaminare i suggerimenti (approva/rifiuta). |
| **Admin** | Tutto quanto sopra + vedere la lista utenti, **disabilitarli/riabilitarli**, **cambiare il ruolo** (utente / editor / admin). |

Chiunque può registrarsi. L'admin iniziale è `ronkpunk@gmail.com`.

## 2. Decisioni di progetto

1. **Ruoli in Firestore, non in custom claims.** I custom claims richiedono Cloud Functions, quindi il piano Blaze (a pagamento).
   Con un documento `users/{uid}` le regole leggono il ruolo con `get()` e tutto resta nel piano gratuito (Spark).
   Costo: una lettura in più per ogni scrittura autorizzata. Irrilevante a questi volumi.
2. **Admin di emergenza nelle regole.** `ronkpunk@gmail.com` (email verificata) è sempre admin, anche se il suo documento fosse
   cancellato o modificato: non ci si può chiudere fuori. Gli altri admin esistono solo come `role: 'admin'` nel documento.
3. **Nessuno può promuovere se stesso.** Alla registrazione un utente può creare solo il proprio documento con `role: 'user'`;
   `role` e `status` sono modificabili solo da un admin.
4. **«Disabilitare» = togliere ogni privilegio.** Un utente `disabled` non può più suggerire né modificare, e l'app lo tratta come anonimo.
   Non si può bloccare l'accesso Firebase Authentication vero e proprio senza Cloud Functions/Admin SDK (piano Blaze):
   resta un possibile passo successivo, non necessario.
5. **Accesso con Google** (già presente). Opzionale in seguito: email e password. Per gli anonimi che suggeriscono si usa l'
   **Autenticazione anonima** di Firebase, così ogni suggerimento ha un `uid` e si può limitare l'abuso.
6. **Lettura delle ricette sempre pubblica.** Nessun login per consultare.

## 3. Modello dati (Firestore)

```
users/{uid}
  email, displayName, photoURL
  role:      'user' | 'editor' | 'admin'     (solo admin lo modifica)
  status:    'active' | 'disabled'           (solo admin lo modifica)
  createdAt, lastLoginAt

recipes/{id}            (invariato) + updatedBy: uid, updatedAt

suggestions/{id}
  recipeId:   string | null                  (null = proposta di nuova ricetta)
  proposed:   { ...campi ricetta modificati }   (stesso formato della ricetta)
  comment:    string (max 500)               (motivo/nota dell'autore)
  authorUid, authorName, authorIsAnonymous
  status:     'pending' | 'approved' | 'rejected'
  createdAt, reviewedBy, reviewedAt, reviewNote

meta/categories         (invariato)
```

Perché i suggerimenti sono documenti separati: l'autore non tocca mai la ricetta vera, e l'editor vede una **differenza** (prima/dopo)
campo per campo prima di approvare. Approvando, l'app scrive la ricetta e marca il suggerimento `approved` in un'unica `writeBatch`.

## 4. Regole Firestore (bozza)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    function signedIn()   { return request.auth != null; }
    function me()         { return get(/databases/$(db)/documents/users/$(request.auth.uid)).data; }
    function hasDoc()     { return signedIn() && exists(/databases/$(db)/documents/users/$(request.auth.uid)); }
    function bootAdmin()  { return signedIn() && request.auth.token.email_verified == true
                                   && request.auth.token.email == 'ronkpunk@gmail.com'; }
    function isActive()   { return bootAdmin() || (hasDoc() && me().status == 'active'); }
    function isAdmin()    { return bootAdmin() || (isActive() && me().role == 'admin'); }
    function isEditor()   { return isAdmin() || (isActive() && me().role == 'editor'); }

    // Ricette: lettura pubblica, scrittura editor/admin
    match /recipes/{id} { allow read: if true; allow write: if isEditor(); }
    match /meta/{id}    { allow read: if true; allow write: if isEditor(); }

    // Utenti
    match /users/{uid} {
      allow read:   if signedIn() && (request.auth.uid == uid || isAdmin());
      // registrazione: solo il proprio documento, sempre come utente standard attivo
      allow create: if signedIn() && request.auth.uid == uid
                    && !request.auth.token.firebase.sign_in_provider.matches('anonymous')
                    && request.resource.data.role == 'user' && request.resource.data.status == 'active'
                    && request.resource.data.keys().hasOnly(['email','displayName','photoURL','role','status','createdAt','lastLoginAt']);
      // l'utente aggiorna solo i propri dati anagrafici, mai ruolo/stato
      allow update: if (request.auth.uid == uid && isActive()
                        && request.resource.data.role == resource.data.role
                        && request.resource.data.status == resource.data.status)
                    || isAdmin();
      allow delete: if isAdmin();
    }

    // Suggerimenti
    match /suggestions/{id} {
      allow create: if signedIn()
                    && (bootAdmin() || !hasDoc() || me().status == 'active')   // anonimi e utenti attivi
                    && request.resource.data.authorUid == request.auth.uid
                    && request.resource.data.status == 'pending'
                    && request.resource.data.comment.size() <= 500
                    && request.resource.data.keys().hasOnly(['recipeId','proposed','comment','authorUid','authorName','authorIsAnonymous','status','createdAt']);
      allow read:   if isEditor() || (signedIn() && resource.data.authorUid == request.auth.uid);
      allow update: if isEditor()
                    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status','reviewedBy','reviewedAt','reviewNote']);
      allow delete: if isEditor();
    }
  }
}
```

Da verificare con test sull'**emulatore Firestore** (`@firebase/rules-unit-testing`) prima della pubblicazione:
utente che si auto-promuove (deve fallire), utente disabilitato che scrive (fallire), editor che cambia un ruolo (fallire),
admin che cambia un ruolo (riuscire), anonimo che suggerisce (riuscire), anonimo che modifica una ricetta (fallire).

## 5. Interfaccia

- **Intestazione:** pulsante «Accedi» (Google) oppure avatar con menu: nome, ruolo, «I miei suggerimenti», «Esci».
- **Registrazione:** al primo accesso con Google l'app crea `users/{uid}` con ruolo `user`. Nessun modulo separato.
- **Ricetta, utente standard/anonimo:** al posto della matita compare **«Suggerisci modifica»**: apre lo stesso editor di oggi, ma «Invia»
  crea un suggerimento (con campo «Perché?») invece di scrivere la ricetta. Anche «Nuova ricetta» diventa «Suggerisci una ricetta».
  Il primo invio da anonimo esegue in silenzio l'accesso anonimo.
- **Ricetta, editor/admin:** matita, «Nuova ricetta», «Elimina» come oggi.
- **Suggerimenti (editor/admin):** nuova voce nella barra di navigazione con contatore dei «da esaminare».
  Elenco ordinato per data; la scheda mostra la ricetta **prima / dopo** (campi cambiati evidenziati), commento dell'autore e pulsanti
  *Approva* (applica e chiude), *Modifica e approva*, *Rifiuta* (con nota facoltativa).
- **Utenti (solo admin):** nuova voce «Utenti». Lista con ricerca, per ciascuno: avatar, nome, email, data di registrazione,
  **selettore ruolo** (utente / editor / admin) e **interruttore attivo/disabilitato**. Protezioni nell'interfaccia: non si può
  togliere il ruolo o disabilitare se stessi, e l'admin di emergenza non è modificabile.
- **Stato disabilitato:** l'utente vede un avviso «Account disabilitato» e l'app lo tratta come anonimo.
- La barra di navigazione passa da 3 a 4 voci per editor (con «Suggerimenti») e a 5 per admin (con «Utenti»); per tutti gli altri resta com'è.

## 6. Piano di realizzazione

1. **Fondamenta:** `users/{uid}` creato al primo accesso, lettura del ruolo, `can('edit'|'review'|'admin')` nell'app, nuove regole + test su emulatore. Sostituisce l'attuale `isOwner()`.
2. **Suggerimenti:** modulo «Suggerisci modifica», collezione `suggestions`, accesso anonimo, «I miei suggerimenti».
3. **Revisione:** schermata Suggerimenti con confronto prima/dopo e approvazione in `writeBatch`.
4. **Utenti:** schermata admin, cambio ruolo, disabilitazione, protezioni.
5. **Rifinitura:** limiti anti-abuso (App Check, tetto di suggerimenti in attesa per autore), eventuale accesso email/password.

Dopo ogni fase: `npm run deploy` e prova con tre account (admin, editor, utente) più una finestra anonima.

## 7. Punti da confermare

1. **«Approvare utenti»**: ho assunto che la registrazione sia aperta e l'utente sia subito attivo come standard (può solo suggerire),
   e che l'admin possa poi disabilitarlo o promuoverlo. Se invece i nuovi account devono restare **in attesa finché l'admin li approva**,
   basta creare `users/{uid}` con `status: 'pending'` e un filtro «Da approvare» nella schermata Utenti: la modifica è minima.
2. **Gli editor esaminano i suggerimenti?** Ho assunto di sì (approvano e rifiutano); in alternativa solo l'admin.
3. **Anonimi che suggeriscono:** richiedono l'autenticazione anonima di Firebase (da abilitare in *Authentication → Metodo di accesso*).
   Se preferisci evitare spam, si può richiedere l'accesso con Google anche per suggerire.
