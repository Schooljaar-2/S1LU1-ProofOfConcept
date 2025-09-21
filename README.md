# S1LU1-ProofOfConcept

Een Node.js/Express webapplicatie voor een filmverhuurzaak. Ontwikkeld voor zowel het gebruikersperspectief van een klant als een medewerker. Gebruikt de relatioenele MySQL Sakila database.

## Features

### Klant (Customer)
- **Authenticatie:** Registratie, login, logout met sessies (bcrypt + express-session).
- **Klantprofiel:** Aanmaken, bekijken en updaten van klantgegevens (adres, winkelkoppeling).
- **Verhuur inzien:** Actieve verhuur en historie met overdues-indicatie.
- **Films ontdekken:** Filteren/sorteren/pagineren en detailpagina met beschikbaarheid per winkel.

### Staff (Beheerder)
- **Persoonlijke info:** Overzicht voor ingelogde medewerker (`/staff`).
- **Dashboard:** Startpunt voor beheer (`/dashboard`).
- **Films beheren:** Zoeken/filteren/sorteren, film aanmaken/bewerken, categorieën/actors selecteren.
- **Voorraad per winkel:** Exemplaren per film beheren: uitlenen (Rent), innemen (Take In), buiten gebruik (Retire), exemplaar toevoegen (Add Copy).
- **Klanten beheren:** Zoeken/filteren, profiel bewerken, actief/inactief zetten, verwijderen.
- **Store-dashboard:** Statistieken per winkel (`/dashboard/manageStores`).
- **Autorisatie:** Alle staff-routes vereisen rol `STAFF` (sessiecheck via service).

De volledige user-stories en acceptatiecriteria staan op de About-pagina (`/about`).

## Snel starten

### Vereisten
- Node.js 18+ 
- MySQL met Sakila-schema 

### Installatie
```cmd
npm install
```

### Omgevingsvariabelen (`.env` in projectroot)
Minimaal nodig voor sessies en database-connectie.

```env
# Sessies
COOKIE_SECRET=eenLangRandomGeheim

# Kies omgeving (anything anders dan 'online' = lokaal)
DEV_ENVIRONMENT=local

# Lokaal DB-profiel
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=...
DB_NAME=sakila
DB_PORT=3306

# Online DB-profiel (indien gebruikt)
DB_ONLINE_HOST=...
DB_ONLINE_USER=...
DB_ONLINE_PASSWORD=...
DB_ONLINE_NAME=...
DB_ONLINE_PORT=...

### Runnen
Ontwikkelmodus (met live reload):
```cmd
npm run dev
```

Productiemodus:
```cmd
npm start
```

Applicatie draait op http://localhost:3000 (tenzij `PORT` gezet is). De server luistert op `0.0.0.0` voor compatibiliteit met hosting.

## Belangrijkste routes

### Authenticatie
- `GET /login`, `POST /login`
- `GET /register`, `POST /register`
- `GET /logout`

### Customer
- `GET /customer` – Profiel + verhuur (alleen ingelogde klant)
- `GET /customer/createProfile` – Profiel aanmaken
- `POST /customer/createProfile` – Profiel opslaan
- `GET /customer/updateProfile/:userId` – Profiel bewerken (eigen + door staff)
- `POST /customer/updateProfile` – Profiel updaten (customer)
- `POST /customer/updateProfile/:userId` – Profiel updaten (door staff)
- `GET /movies` – Lijst met filters/sortering/paginering
- `GET /movies/:movieID` – Detail + beschikbaarheid per winkel

### Staff
- `GET /staff` – Persoonlijke info medewerker
- `GET /dashboard` – Staff-dashboard
- `GET /dashboard/manageStores` – Store-dashboard met statistieken

Beheer films en voorraad:
- `GET /dashboard/manageOrCreateMovies` – Keuzepagina (manage/create)
- `GET /dashboard/manageOrCreateMovies/create` – Nieuwe film formulier
- `POST /dashboard/manageOrCreateMovies/create` – ↑↑↑ Film aanmaken
- `GET /dashboard/manageOrCreateMovies/manage` – Zoeken/filteren films
- `GET /dashboard/manageOrCreateMovies/manage/edit/:movieID` – Film bewerken
- `POST /dashboard/manageOrCreateMovies/manage/edit` – ↑↑↑ Film updaten
- `GET /dashboard/manageOrCreateMovies/manage/inventory/:movieID` – Voorraad per winkel
- `POST /dashboard/manageOrCreateMovies/manage/inventory/addCopy` – ↑↑↑ Voorraad-exemplaar toevoegen
- `POST /dashboard/manageOrCreateMovies/manage/inventory/retire` – ↑↑↑ Exemplaar (de)activeren
- `POST /dashboard/manageOrCreateMovies/manage/inventory/takeInRental` – ↑↑↑ Verhuur innemen (return)
- `GET /dashboard/manageOrCreateMovies/manage/inventory/rentCopy` – Klant kiezen voor verhuur
- `POST /dashboard/manageOrCreateMovies/manage/inventory/rentCopy/makeRental` – ↑↑↑ Verhuur aanmaken

Beheer klanten:
- `GET /dashboard/manageCustomers` – Zoeken/filteren klanten
- `POST /dashboard/manageCustomers/edit` – ↑↑↑ Naar profiel-bewerken
- `POST /dashboard/manageCustomers/active` – ↑↑↑ Actief/inactief togglen
- `POST /dashboard/manageCustomers/delete` – ↑↑↑ Verwijderen

## Testen (Cypress E2E)

BaseUrl is ingesteld op `http://localhost:3000` (zie `cypress.config.js`).

### Omgeving voor tests
Maak lokaal een `cypress.env.json` (staat in `.gitignore`) met je testaccount:

```json
{
  "test_email": "test@voorbeeld.nl",
  "test_password": "SterkWachtwoord123!"
}
```

### Scripts
- Interactief openen (start server + Cypress GUI):
```cmd
npm run cy:open
```
- Headless run (start server + run tests):
```cmd
npm run cy:run
```

In `cypress/support/commands.js` is een `loginAsCustomer`-command aanwezig dat sessies cached voor snelle en stabiele tests.

## Projectstructuur

```
app.js                        # Express app entrypoint
package.json                  # Scripts en dependencies
src/
  controllers/                # Route controllers
    authController.js         # Login/registratie/logout
    customerController.js     # Customer-profiel, films, verhuur
    staffController.js        # Staff: films, voorraad, klanten, stores
  database/
    db.js                     # MySQL pool + env-profielen (lokaal/online)
    dao/
      customer/              # DAO's voor klant/movies
      staff/                 # DAO's voor staff (movies, inventory, stores, etc.)
      auth.js                # User/credentials queries
  public/                     # Statische assets (css, images)
  routes/                     # Express routes
    index.js                  # Home/About
    auth.js                   # /login /register /logout
    customer.js               # Customer-routes
    staff.js                  # Staff-routes
  services/                   # Businesslogica bovenop DAO's
  views/                      # Handlebars templates (customer, staff)
cypress/                      # E2E tests en config
```

## Overig
- Autorisatie via `checkAuthorisation(req, role)` in `src/services/auth.service.js`.
- Wachtwoorden gehasht met bcrypt; valideerfouten worden netjes getoond.
- Foutafhandeling met Express error middleware; views voor lege staten.
- About-pagina (`/about`) bevat uitgebreide user-stories voor Customer en Staff.

## Troubleshooting
- DB-verbinding: controleer `DEV_ENVIRONMENT` en DB-variabelen; check console (“USING LOCAL DB/ONLINE DB”).
- Staff-accounts: zorg dat de gebruiker rol `STAFF` heeft in de database om staff-routes te gebruiken.
