# Endpoint dell'API

Legenda della colonna **Stato**: ✅ implementato, ⏳ da fare.

## Registrazione e autenticazione

| Metodo | URL                    | Che cosa fa                                       | Successo | Stato |
| ------ | ---------------------- | ------------------------------------------------- | -------- | ----- |
| POST   | `/api/utenti/register` | Registra un nuovo utente (sempre come Dipendente) | 201      | ✅    |
| POST   | `/api/utenti/login`    | Autentica l'utente e restituisce un token JWT     | 200      | ✅    |
| GET    | `/api/utenti/me`       | Restituisce i dati dell'utente collegato          | 200      | ✅    |

## Categorie (tutti gli utenti autenticati)

| Metodo | URL              | Che cosa fa                        | Successo | Stato |
| ------ | ---------------- | ---------------------------------- | -------- | ----- |
| GET    | `/api/categorie` | Elenco delle categorie di permesso | 200      | ✅    |

## Richieste (tutti gli utenti autenticati)

| Metodo | URL                  | Che cosa fa                                    | Successo | Stato |
| ------ | -------------------- | ---------------------------------------------- | -------- | ----- |
| GET    | `/api/richieste`     | Elenco richieste (dipendente: solo le proprie) | 200      | ✅    |
| GET    | `/api/richieste/:id` | Dettaglio di una richiesta                     | 200      | ✅    |
| POST   | `/api/richieste`     | Crea una nuova richiesta                       | 201      | ✅    |
| PUT    | `/api/richieste/:id` | Modifica una richiesta "In attesa"             | 200      | ⏳    |
| DELETE | `/api/richieste/:id` | Elimina una richiesta                          | 200      | ⏳    |

## Richieste (solo responsabili)

| Metodo | URL                           | Che cosa fa                  | Successo | Stato |
| ------ | ----------------------------- | ---------------------------- | -------- | ----- |
| GET    | `/api/richieste/da-approvare` | Elenco richieste "In attesa" | 200      | ✅    |
| PUT    | `/api/richieste/:id/approva`  | Approva una richiesta        | 200      | ⏳    |
| PUT    | `/api/richieste/:id/rifiuta`  | Rifiuta una richiesta        | 200      | ⏳    |

## Statistiche (requisito avanzato, solo responsabili)

| Metodo | URL                | Che cosa fa                                        | Successo | Stato |
| ------ | ------------------ | -------------------------------------------------- | -------- | ----- |
| GET    | `/api/statistiche` | Giorni approvati per dipendente e mese, con filtri | 200      | ⏳    |
