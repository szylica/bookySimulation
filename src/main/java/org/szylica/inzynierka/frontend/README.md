# Frontend (symulacja Booksy)

To jest statyczny frontend (HTML/CSS/JS) bez backendu.

## Uruchomienie lokalne

W katalogu z plikami uruchom prosty serwer HTTP:

```powershell
py -m http.server 5173
```

Następnie otwórz:
- `http://localhost:5173/index.html`

## Struktura

- `index.html` — lista lokali + wyszukiwarka
- `booking.html` — strona umawiania wizyty (mock)
- `data.js` — dane mock lokali (`window.VENUES`)
- `utils.js` — wspólne helpery UI
- `app.js` — logika strony głównej
- `booking.js` — logika strony umawiania
- `styles.css` — wspólne style
