# CLAUDE.md

Monorepo dell'app d'esame **"Richiesta e approvazione di permessi lavorativi"**.
Rispondi sempre in **italiano**.

La traccia completa è in `traccia-esame.md`. Prima di modificare qualcosa leggi anche `README.md`, `api/server.js`, `db/schema.sql` e `db/seed.sql`.

## Struttura

- `docker-compose.yml` (root): `postgres:17` (container `app-permessi-postgres`, porta 5432) e `pgadmin4:9` (container `app-permessi-pgadmin`, http://localhost:5050, senza login, server "permessi (Docker)" già configurato da `db/pgadmin/servers.json`).
  - Database `permessi`, utente `utente_app`. I dati stanno nel volume Docker `pgdata`, non sul disco.
  - `db/schema.sql` (montato come `01_schema.sql`) e `db/seed.sql` (`02_seed.sql`) vengono eseguiti solo quando il volume è vuoto.
  - Per ripartire da zero: `docker compose down -v && docker compose up -d`.
- `api/`: backend Express 5 in ESM, Node 24, con `pg`, `bcryptjs` (costo 12) e `jsonwebtoken`. Si avvia con `cd api && npm run dev` (`node --watch --env-file=.env`), porta 3000.
  - In `api/.env` ci sono `DATABASE_URL` (…/permessi), `PORT`, `ESEMPI_VULNERABILI`, `JWT_SECRET` (minimo 32 caratteri, altrimenti il server non parte) e `JWT_EXPIRES_IN=1h`. `api/.env.example` è allineato.
- `api/mock/mock.http`: richieste per l'estensione REST Client di VS Code (`humao.rest-client`).
  - Variabili (`@baseUrl`, `@email`, `@password`, `@token`) tutte in testa: niente righe tra il corpo di una richiesta e il `###` successivo, perché REST Client le spedirebbe nel corpo.
  - Contiene health, register (email con `{{$timestamp}}`), login (`# @name login`, poi `@token = {{login.response.body.token}}`), `/utenti/me` con e senza token, hash e verifica bcrypt (`# @name hashEsempio`).
- `frontend/`: React 19 (JS) con Vite 8, Tailwind CSS v4, shadcn/ui (button, input, label, card, table, badge, select) e `react-router` 8.5 in modalità dichiarativa. Si usa **pnpm**. Si avvia con `cd frontend && pnpm dev`, porta 5173.
  - Alias `@` → `src` (`vite.config.js` e `jsconfig.json`). Proxy `/api` → `http://localhost:3000`, quindi le `fetch` usano percorsi relativi (`/api/...`).
  - `main.jsx` avvolge `<App />` in `BrowserRouter`. `App.jsx` contiene `Routes`: `/` → `Navigate` a `/login`, `/login`, `/registrazione` e una rotta genitore senza `path` con `element={<RottaProtetta><Layout /></RottaProtetta>}`, che contiene `/home` → `pages/Home.jsx` e `/richieste/nuova` → `pages/NuovaRichiesta.jsx`.
  - `components/RottaProtetta.jsx`: riceve `children`; se in `localStorage` non c'è `token` restituisce `<Navigate to="/login" replace />`, altrimenti `children`. Non verifica la validità del token (lo fa il `Layout`).
  - `components/Layout.jsx`: in un `useEffect` (`[navigate]`) chiama `GET /api/utenti/me` con `Authorization: Bearer`. Con 200 salva l'utente nello stato `utente`, con 401 cancella il token e fa `navigate("/login", { replace: true })`, con altri errori mostra `dati.errore`. Header (`border-b px-6 py-3`) con titolo, `<nav>` con `<Link to="/home">`, nome e cognome, pulsante Esci `variant="outline"` (stessa logica del 401). Sotto, `<main className="mx-auto max-w-5xl p-6">` con l'eventuale errore e `{utente ? <Outlet context={utente} /> : <p>Caricamento...</p>}`: le pagine figlie ricevono sempre un utente valido con `useOutletContext()`.
  - `pages/Home.jsx`: legge l'utente con `useOutletContext()` e restituisce `components/DashboardResponsabile.jsx` o `components/DashboardDipendente.jsx` in base a `utente.ruolo`. `DashboardResponsabile` mostra solo un `<h2>`.
  - `lib/fetchConToken.js`: `fetchConToken(percorso, opzioni = {})` fa la `fetch` con `Content-Type: application/json` e `Authorization: Bearer`; con 401 cancella il token e fa `window.location.replace("/login")`. Restituisce la `response`. Non va usata in login e registrazione.
  - `components/DashboardDipendente.jsx`: carica `GET /api/richieste` con `fetchConToken` in un `useEffect`. Se c'è `errore` restituisce solo il messaggio, se l'elenco è vuoto "Nessuna Richiesta", altrimenti titolo e pulsante "Nuova richiesta" (`navigate("/richieste/nuova")`) sempre visibili, e sotto, con un ternario, "Nessuna richiesta" oppure una `Card` con la `Table` di shadcn (Dal, Al, Categoria, Motivazione, Stato) con `richieste.map` e `key={r.richiesta_id}`. Lo stato è un `Badge` colorato con l'oggetto `coloriStato` (mancano le varianti `dark:`).
  - `pages/NuovaRichiesta.jsx`: in un `useEffect` carica `GET /api/categorie` nello stato `categorie`. Form in una `Card` con due `Input type="date"` (`required`, la data di fine ha `min={dataInizio}`), la `Select` di shadcn (Base UI) e la motivazione.
    - La `Select` è controllata: `value={categoria}` (parte da `null`, così compare il `placeholder` di `SelectValue`), `onValueChange={setCategoria}`, `required` e `items={categorieFormattate}` (array `{ value, label }` ricavato da `categorie`, serve a mostrare la descrizione invece dell'id). Un `SelectItem` per categoria con `key` e `value` = `categoria_id`.
    - `POST /api/richieste` con `fetchConToken` e corpo `{ data_inizio, data_fine, categoria_id: Number(categoria), motivazione }`. Con il successo imposta `successo` e, con un `return` anticipato, mostra una card con l'icona `CircleCheckBig` di lucide e due pulsanti: "Torna alla home" (`navigate("/home")`) e "Nuova richiesta" (`ricomincia`, che azzera i campi e `successo`, non `categorie`).
  - Componenti shadcn installati: button, input, label, card, table, badge, select. Il pacchetto `cn` usato dai componenti in `components/ui/` è quello ufficiale di shadcn.
  - `pages/Login.jsx`: `POST /api/utenti/login`, salva il token in `localStorage` (chiave `token`) e poi `navigate("/home")` con `useNavigate`.
  - `pages/Registrazione.jsx`: `POST /api/utenti/register`. Controlli lato client: `required`, `maxLength`, password di almeno 8 caratteri, conferma password. In caso di successo mostra una card con un pulsante che usa `useNavigate` per andare a `/login`.
  - Gli errori dell'API si mostrano con `dati.errore`. ESLint segnala 4 errori nei file generati da shadcn in `components/ui/`: non vanno toccati.
- `docs/`: spiegazioni per gli studenti, che conoscono le basi dei database.
  - `query-seed-richieste.md` spiega passo per passo l'`INSERT ... SELECT` delle richieste in `db/seed.sql`. Se cambi quella query, aggiorna anche questo file.
- `.gitignore` in root: `node_modules/`, `.env`.

## Database (`db/schema.sql`)

- `utenti`: `utente_id`, `nome`, `cognome`, `email` (`UNIQUE`, distingue maiuscole e minuscole), `password_hash`, `ruolo` (`Dipendente` | `Responsabile`, default `Dipendente`), `data_creazione`.
- `categorie_permesso`: `categoria_id`, `descrizione` (unica).
- `richieste_permesso`: `richiesta_id`, `data_richiesta`, `data_inizio`, `data_fine`, `categoria_id`, `motivazione`, `stato` (`In attesa` | `Approvato` | `Rifiutato`), `utente_id`, `data_valutazione`, `utente_valutazione_id`.
  - Vincoli CHECK: `data_fine >= data_inizio`; "In attesa" ⇔ nessuna valutazione; Approvato/Rifiutato ⇒ `data_valutazione` presente.
- Seed: 8 utenti, tutti con password `Password123!`.
  - Responsabili: `laura.bianchi@azienda.example`, `marco.ferri@azienda.example`.
  - Dipendenti: `mario.rossi`, `giulia.verdi`, `luca.esposito`, `sara.colombo`, `paolo.ricci`, `elena.marino` (quest'ultima senza richieste), tutti `@azienda.example`.
  - 5 categorie; 19 richieste da settembre a dicembre 2026 (11 approvate, 5 in attesa, 3 rifiutate), tra cui una dal 29/10 al 03/11, a cavallo di due mesi.

## API già presenti (`api/server.js`)

- In testa, `pg.types.setTypeParser(pg.types.builtins.DATE, (valore) => valore)`: le colonne `DATE` (`data_inizio`, `data_fine`, `data_valutazione`) arrivano come stringhe `"AAAA-MM-GG"`. I `TIMESTAMPTZ` (`data_richiesta`, `data_creazione`) restano `Date` e vengono serializzati in UTC (`"2026-11-02T16:45:00.000Z"`): nel frontend vanno formattati, ad esempio con `toLocaleDateString("it-IT")`.
- Middleware `logChiamate`, registrato prima di `express.json()`: una riga per chiamata con data, metodo, percorso, stato, durata e utente. Non registra mai query string, corpo o header.
- Middleware `autentica`: legge `Authorization: Bearer`, verifica il token (solo HS256) e imposta `req.utente = { id, ruolo }`. Altrimenti 401 ("Token mancante" / "Token scaduto" / "Token non valido") con `WWW-Authenticate`.
- `richiediRuolo(...ruoli)` e `soloResponsabili`: da usare dopo `autentica`; 403 se il ruolo non è ammesso, 401 se manca `req.utente`.
- `POST /api/utenti/register`: `{ nome, cognome, email, password }`, validati. Il ruolo non viene mai preso dal client. Risponde 201 `{ id, nome, cognome, email, ruolo }`, 409 se l'email esiste già.
- `POST /api/utenti/login`: cerca con `lower(email) = lower($1)`. Risponde 200 `{ token, utente: { id, email, ruolo } }`, 401 "Credenziali non valide". Il payload JWT è `{ sub, ruolo }`.
- `GET /api/utenti/me` (autenticata): `{ id, nome, cognome, email, ruolo }`.
- `GET /api/categorie` (autenticata): array `[{ categoria_id, descrizione }]` ordinato per `descrizione`.
- `GET /api/richieste` (dipendente: solo le proprie), `GET /api/richieste/:id`, `GET /api/richieste/da-approvare` (`autentica` + `soloResponsabili`).
- `POST /api/richieste` (autenticata), scritta dall'utente passo per passo: `{ data_inizio, data_fine, categoria_id, motivazione }`.
  - Valida motivazione (stringa, `trim()` non vuoto), `categoria_id` (intero > 0), date (stringhe `AAAA-MM-GG`, `data_fine >= data_inizio`).
  - Nel `catch`: `23503` (categoria inesistente) e `22008` (data inesistente) → 400, il resto `throw err`.
  - `utente_id` preso dal token. Risponde 201 `{ richiesta_id, data_inizio, data_fine, motivazione, stato }`.
- `PUT /api/richieste/:id` (autenticata): stesso corpo e stesse validazioni del POST.
  - Prima legge la richiesta: 404 se non esiste, 403 se non è dell'utente collegato (vale anche per i responsabili), 400 se non è "In attesa".
  - Risponde 200 con la riga aggiornata `{ richiesta_id, data_inizio, data_fine, motivazione, stato }`. `23503` e `22008` → 400.
- `DELETE /api/richieste/:id` (autenticata): 404 se non esiste.
  - Dipendente: solo le proprie (altrimenti 403) e solo "In attesa" (altrimenti 400).
  - Responsabile: qualsiasi richiesta "In attesa" o "Approvata". 400 se è "Rifiutata".
  - Risponde 200 `{ Successo: "Richiesta eliminata correttamente" }`.
- `PUT /api/richieste/:id/approva` e `PUT /api/richieste/:id/rifiuta` (`autentica` + `soloResponsabili`): 404 se non esiste, 400 se non è "In attesa". Altrimenti impostano `stato`, `data_valutazione = CURRENT_DATE` e `utente_valutazione_id` (dal token), e rispondono 200 `{ Successo: "Richiesta approvata" }` / `{ Successo: "Richiesta rifiutata" }`.
- `GET /api/statistiche` (`autentica` + `soloResponsabili`): richieste approvate raggruppate per dipendente e mese.
  - Filtri facoltativi in query string: `utente_id` e `mese` (`AAAA-MM`). Le query restano parametrizzate: la stringa SQL viene costruita con `$1`, `$2`… in base a quanti filtri ci sono.
  - Risponde `[{ richiedente, giorni, mese }]`, dove `richiedente` è "nome cognome" e `giorni` arriva come stringa (`SUM` restituisce un `bigint`).
  - Scelte fatte: si contano i **giorni di calendario** (`data_fine - data_inizio + 1`). Una richiesta a cavallo di due mesi viene contata tutta nel **mese di `data_inizio`**.
- `GET /api/esempi/hash?testo=` restituisce md5, sha256 e bcrypt. `POST /api/esempi/hash/verifica` riceve `{ testo, hash }` e risponde `{ valido }`.
- Resti del vecchio playground ancora presenti:
  - `/api/esempi/ricerca-sicura` e `/ricerca-vulnerabile` usano le colonne `id` e `attivo`, che non esistono più, quindi sono rotte rotte;
  - ESERCIZI 1, 2 e 5 sono stub che rispondono 501;
  - `/api/utenti/conteggio` è dichiarata dopo `/api/utenti/:id`.

## Regole di lavoro

- Niente `HASH_FITTIZIO`: il login risponde subito 401 se l'email non esiste. È una scelta dell'utente, non riproporla.
- Query sempre parametrizzate, mai `SELECT *`, mai password, hash o token nei log o nelle risposte.
- Validazione server-side di ogni input.
- Le rotte con un percorso fisso (es. `/da-approvare`, `/me`) vanno dichiarate prima di quelle con parametro (`/:id`).
- Quando fai test, non fermare il `npm run dev` dell'utente: usa un'istanza temporanea con `PORT=3001` e poi chiudila. Se crei dati di prova nel database, cancellali alla fine.
- Quando aggiungi endpoint, aggiorna `api/mock/mock.http` e la sezione "Stato del progetto" del `README.md`. Tieni aggiornato anche questo file.
- Se trovi problemi fuori dal compito, segnalali senza correggerli.
- App didattica per la simulazione dell'esame di Stato: usa solo ciò che è stato fatto a lezione. Niente `CREATE INDEX` nello schema (scelta dell'utente); va bene che l'app non sia perfetta.
- Non fare commit se l'utente non lo chiede.
- **Frontend: il codice lo scrive l'utente.** Spiega i passi, al massimo con frammenti brevi, e rileggi il codice quando te lo chiede. Non creare né modificare file in `frontend/`.

## Problemi aperti (segnalati, non ancora corretti)

- `/api/salute` restituisce `"raggiungibileee"`: chiedi all'utente se è un refuso.
- Il gestore degli errori fa `console.error(err)`: un errore di PostgreSQL può contenere l'email nel campo `detail`.
- `/api/esempi/hash` con `?testo=a&testo=b` va in 500.
- bcrypt usa solo i primi 72 byte della password e non c'è un limite massimo di lunghezza.
- Il commento in testa a `server.js` descrive ancora la vecchia tabella `utenti` del playground (colonne `id` e `attivo`).
- `:id` non viene validato in `PUT`, `DELETE`, `approva` e `rifiuta`: con `/api/richieste/abc` PostgreSQL dà `22P02` e l'API risponde 500. Lo stesso succede in `/api/statistiche?utente_id=abc`.
- `/api/statistiche` raggruppa per `nome, cognome`: due dipendenti omonimi verrebbero sommati insieme. Inoltre non restituisce l'`utente_id` e non ha un `ORDER BY`.
- Le risposte di successo usano la chiave `Successo` con la maiuscola, mentre gli errori usano `errore`. Nel codice ci sono anche variabili assegnate e mai usate (`risposta`, `risultato`).
- `api/mock/mock.http` non ha ancora le richieste per `approva` e `rifiuta`.
- In `server.js` ci sono due import inutilizzati: `error` da `node:console` e `type` da `node:os`.

## Prossimi passi (dalla traccia)

1. ~~`GET /api/categorie`~~ (fatto).
2. ~~CRUD su `/api/richieste`~~ (fatto).
3. ~~`da-approvare`, `approva`, `rifiuta`~~ (fatto).
4. ~~Endpoint delle statistiche~~ (fatto: giorni di calendario, richieste a cavallo di due mesi contate nel mese di inizio).
5. Frontend CSR: login, registrazione, `RottaProtetta`, `Layout`, `Home` divisa per ruolo e form di `NuovaRichiesta.jsx` fatti. Prossimo: in `DashboardDipendente` elimina e modifica (solo richieste "In attesa"), poi `DashboardResponsabile` (da approvare, approva/rifiuta) e la pagina delle statistiche (solo responsabili).
6. Poi: eventuale Swagger e deployment. Con React Router, il server di produzione deve rispondere con `index.html` anche per percorsi come `/registrazione`.
