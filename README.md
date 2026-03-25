# System rezerwacji wizyt (Spring Boot)

Aplikacja webowa typu **BookMe** do zarządzania lokalami/usługami oraz umawiania wizyt.
Backend jest zbudowany w **Spring Boot 4**, wykorzystuje **PostgreSQL** (dane) oraz **Redis** (sesje użytkowników przez Spring Session).

## Spis treści

- [Funkcje](#funkcje)
- [Architektura w skrócie](#architektura-w-skrócie)
- [Stack technologiczny](#stack-technologiczny)
- [Wymagania](#wymagania)
- [Konfiguracja](#konfiguracja)
- [Uruchomienie](#uruchomienie)
  - [Docker Compose (Postgres + Redis)](#docker-compose-postgres--redis)
  - [Backend (Spring Boot)](#backend-spring-boot)
- [Autoryzacja i role](#autoryzacja-i-role)
- [API](#api)
  - [Auth](#auth)
  - [Strona główna / wyszukiwanie](#strona-główna--wyszukiwanie)
  - [Użytkownik (Customer/Provider/Worker)](#użytkownik-customerproviderworker)
  - [Wizyty](#wizyty)
- [Harmonogram generowania terminów](#harmonogram-generowania-terminów)
- [Testy](#testy)
- [Struktura repozytorium](#struktura-repozytorium)
- [Roadmap / TODO](#roadmap--todo)

## Funkcje

- Rejestracja i logowanie użytkowników z podziałem na role:
  - **Customer** – umawianie wizyt i przegląd własnych rezerwacji
  - **Provider** – zarządzanie lokalami, usługami i przypisywanie pracowników
  - **Worker** – podgląd przypisanych wizyt
- Zarządzanie lokalami (provider): tworzenie i aktualizacja danych lokalu
- Zarządzanie usługami (provider): dodawanie/usuwanie usług, przypisywanie usług do lokalu
- Generowanie dostępnych slotów czasowych (availability) dla lokalu:
  - inicjalnie przy tworzeniu lokalu
  - cyklicznie (scheduler) – dokładanie terminów na kolejne dni
- Umawianie wizyty przez klienta na konkretny slot
- Przeliczanie strefy czasowej lokalu na podstawie miasta (OSM Nominatim + Timeshape)

## Architektura w skrócie

- **Spring MVC** (REST) jako warstwa API
- **Spring Security** (sesja) + adnotacje `@PreAuthorize` dla endpointów per-rola
- **Spring Session Redis** – przechowywanie sesji w Redis
- **Spring Data JPA** + PostgreSQL – trwałość danych
- **MapStruct** – mapowanie DTO ↔ encje
- Scheduler (`@Scheduled`) generujący terminy

## Stack technologiczny

- Java 17
- Spring Boot 4.0.x
- Spring Security
- Spring Session (Redis)
- PostgreSQL
- Redis
- Maven (`mvnw`, `mvnw.cmd`)
- Lombok, MapStruct

## Wymagania

- **JDK 17**
- **Docker** (zalecane) – do uruchomienia Postgresa i Redisa
- (opcjonalnie) lokalne PostgreSQL/Redis zamiast Dockera

## Konfiguracja

Podstawowa konfiguracja jest w `src/main/resources/application.properties`:

Uwagi:
- Domyślny port aplikacji Spring Boot: **8080**
- CORS jest ustawiony na `http://localhost:3000` i wymaga `credentials` (sesja/cookie)

## Uruchomienie

### Docker Compose (Postgres + Redis)

W katalogu głównym repozytorium:

```bash
docker compose up -d
```

Usługi:
- PostgreSQL: `localhost:5433` (kontener mapuje `5433 -> 5432`)
- Redis: `localhost:6379`

Zatrzymanie:

```bash
docker compose down
```

### Backend (Spring Boot)

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
./mvnw spring-boot:run
```

Build JAR:

```bash
./mvnw clean package
```

Uruchomienie z JAR:

```bash
java -jar target/inzynierka-0.0.1-SNAPSHOT.jar
```

## Autoryzacja i role

- Aplikacja używa **sesji HTTP** (Spring Security + Spring Session Redis).
- Logowanie zapisuje `SecurityContext` do sesji.
- Endpointy publiczne: `/api/auth/**` oraz `/api/main/**`.
- Reszta endpointów wymaga zalogowania; część dodatkowo wymaga roli przez `@PreAuthorize`.

Role w systemie:
- `ROLE_CUSTOMER`
- `ROLE_PROVIDER`
- `ROLE_WORKER`

### Przykładowy flow (curl + cookie jar)

Logowanie (customer):

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d '{"username":"email@domain.com","password":"haslo"}' \
  http://localhost:8080/api/auth/customer/login
```

Wywołanie endpointu wymagającego sesji:

```bash
curl -i -b cookies.txt http://localhost:8080/api/user/my-reservations
```

Wylogowanie:

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:8080/api/auth/logout
```

## API

Poniżej skrót najważniejszych endpointów (prefiks: `http://localhost:8080`).

### Auth

- `POST /api/auth/customer/register`
- `POST /api/auth/customer/login`
- `POST /api/auth/provider/register`
- `POST /api/auth/provider/login`
- `POST /api/auth/worker/register`
- `POST /api/auth/worker/login`
- `POST /api/auth/logout`

### Strona główna / wyszukiwanie

- `GET /api/main/get-locals` – zwraca losową listę lokali + najbliższy wolny termin
- `POST /api/main/get-availabilities` – dostępne terminy dla lokalu w danym dniu
- `POST /api/main/get-local-data` – podstawowe dane lokalu
- `POST /api/main/get-full-local-data` – dane lokalu + lista pracowników + lista usług

### Użytkownik (Customer/Provider/Worker)

Customer:
- `PATCH /api/user/change-settings`
- `GET /api/user/my-reservations`
- `DELETE /api/user/delete-user`

Provider (wymaga roli `PROVIDER`):
- `GET /api/user/my-locals`
- `POST /api/user/add-local`
- `POST /api/user/info-local`
- `PATCH /api/user/update-local`
- `POST /api/user/add-worker`
- `GET /api/user/get-services`
- `POST /api/user/add-service`
- `DELETE /api/user/delete-service`
- `POST /api/user/set-local-services`

Worker (wymaga roli `WORKER`):
- `GET /api/user/get-worker-id`
- `GET /api/user/get-worker-visits`

### Wizyty

- `POST /api/visit/set-up-visit` – zapis wizyty i oznaczenie slotu jako zajęty

## Harmonogram generowania terminów

Scheduler generuje sloty codziennie o **01:00** (strefa `Europe/Warsaw`).
Dla każdego lokalu tworzy sloty dla dnia:

- `LocalDate.now() + schedulingLimitInDays`

Dodatkowo, przy tworzeniu lokalu (`add-local`) generowane są sloty na pierwsze `schedulingLimitInDays` dni.

## Testy

```bash
./mvnw test
```

Windows:

```powershell
.\mvnw.cmd test
```

## Struktura repozytorium

- `src/main/java/org/szylica/inzynierka/backend` – backend (kontrolery, serwisy, security, scheduler)
- `src/main/resources/application.properties` – konfiguracja aplikacji
- `docker-compose.yml` – Postgres + Redis

Frontend (statyczny HTML/CSS/JS) znajduje się w `src/main/java/org/szylica/inzynierka/frontend`.

## Roadmap / TODO

- Uporządkowanie i dopięcie modułu geo (`/api/geo` jest szkieletem)
- Rozbudowa operacji na wizytach (np. anulowanie, zmiana terminu)
- Doprecyzowanie CORS/CSRF pod docelowy sposób integracji frontendu
- Stabilizacja scheduler-a (oznaczony TODO: „one thread only”)
