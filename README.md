

# S1LU1-ProofOfConcept

Een Node.js/Express webapplicatie voor het beheren van klantprofielen, filmverhuur en (in de toekomst) staff-functionaliteit, met authenticatie, dashboards en een relationele database (MySQL).

## Features

### Klant (Customer)
- **Authenticatie:** Registratie, login en logout met sessies.
- **Klantprofiel:** Aanmaken, bekijken en updaten van klantgegevens.
- **Filmverhuur:** Overzicht van actieve en historische huurtransacties.
- **Winkelbeheer:** Koppeling van klanten aan verschillende winkels.
- **Responsieve UI:** Handlebars-views met Bootstrap-styling.
- **DRY-backend:** Herbruikbare DAO-methodes voor database interactie.

### Staff (Beheerder) — [In ontwikkeling]
- **Filmverhuur aan klanten:** Snel films uitlenen en innemen.
- **Klantenbeheer:** Klanten zoeken, blokkeren, verwijderen, etc.
- **Voorraadbeheer:** Films toevoegen, voorraad aanpassen.

## Projectstructuur

```
app.js                        # Express app entrypoint
package.json                  # Project metadata en dependencies
src/
	controllers/                # Route controllers (business logic)
		customerController.js     # Klantfunctionaliteit
		staffController.js        # (Toekomstig) staff-functionaliteit
	database/
		dao/Customer/             # Data Access Objects voor klant, adres, stad, land
		dao/Staff/                # (Toekomstig) DAO's voor staff/voorraad
	public/                     # Statische assets (css, images)
	routes/                     # Express route-definities
		customer.js               # Klant-routes
		staff.js                  # (Toekomstig) staff-routes
	services/                   # Service-laag (business logica)
	views/                      # Handlebars templates
		customer/                 # Klant-views
		staff/                    # (Toekomstig) staff-views
```

## Belangrijkste routes

### Klant
- `/login`, `/register`, `/logout` – Authenticatie
- `/customer` – Klantdashboard (profiel, verhuur)
- `/customer/createProfile` – Profiel aanmaken
- `/customer/updateProfile` – Profiel bewerken
- `/movies` – Filmoverzicht
- `/movies/:movieID` – Detailpagina film

### Staff (in ontwikkeling)
- `/staff` – Staff-dashboard
- `/staff/rent` – Film uitlenen
- `/staff/return` – Film innemen
- `/staff/customers` – Klantenbeheer
- `/staff/inventory` – Voorraadbeheer

## Database

- MySQL, Sakila database (relationele database)
- DAO-laag (`src/database/dao/`) voor alle CRUD-operaties.

## Belangrijkste dependencies

- express
- express-handlebars
- express-session
- mysql2
- bcrypt
- dotenv

## Opmerkingen

- Alle klant- en verhuurfunctionaliteit is alleen toegankelijk voor ingelogde gebruikers met de rol "CUSTOMER".
- Staff-functionaliteit wordt ontwikkeld en zal alleen toegankelijk zijn voor gebruikers met de rol "STAFF".
- Landing page en /movie/# is bereikbaar voor alle gebruikers (dus ook niet ingelogde)
- De code volgt DRY-principes waar mogelijk; zie de DAO- en service-laag voor hergebruikte logica.
- Styling en views zijn te vinden in `src/views` en `src/public/stylesheets/style.css`.
