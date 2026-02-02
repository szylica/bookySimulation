# Frontend (symulacja BookMe)

To jest statyczny frontend (HTML/CSS/JS) bez backendu.

## Uruchomienie lokalne

Jeśli chcesz uruchomić statycznie (bez bundlera), w katalogu z plikami uruchom prosty serwer HTTP:

```powershell
py -m http.server 5173
```

Następnie otwórz:
- `http://localhost:5173/index.html`

Jeśli uruchamiasz frontend przez osobny dev-serwer (np. na porcie `3000`), a backend Spring Boot działa na `8080`, to rejestracja wysyła requesty na `http://localhost:8080/...`.

## Struktura

- `index.html` — lista lokali + wyszukiwarka
- `booking.html` — strona umawiania wizyty (mock)
- `data.js` — dane mock lokali (`window.VENUES`)
- `utils.js` — wspólne helpery UI
- `app.js` — logika strony głównej
- `booking.js` — logika strony umawiania
- `styles.css` — wspólne style
