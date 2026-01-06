const venues = Array.isArray(window.VENUES) ? window.VENUES : [];

let userLocation = null;

const els = {
  searchInput: document.getElementById("searchInput"),
  searchHint: document.getElementById("searchHint"),
  flashNotice: document.getElementById("flashNotice"),
  nearbySection: document.getElementById("nearbySection"),
  nearbyGrid: document.getElementById("nearbyGrid"),
  grid: document.getElementById("venuesGrid"),
  empty: document.getElementById("emptyState"),
  themeToggle: document.getElementById("themeToggle"),
  loginBtn: document.getElementById("loginBtn"),
  supportLink: document.getElementById("supportLink"),
  year: document.getElementById("year"),
};

const {
  escapeHtml,
  normalize,
  setCurrentYear,
  attachLoginAlert,
  attachThemeToggle,
} =
  window.UIUtils ?? {};

function showFlashIfPresent() {
  if (!els.flashNotice) return;
  try {
    const msg = window.localStorage?.getItem("ui.flash");
    if (!msg) return;
    els.flashNotice.textContent = msg;
    els.flashNotice.hidden = false;
    window.localStorage?.removeItem("ui.flash");
  } catch {
    // ignore
  }
}

function matchesQuery(venue, query) {
  if (!query) return true;
  const haystack = normalize(
    [venue.name, venue.category, venue.city, venue.address].join(" ")
  );
  const needles = normalize(query).split(/\s+/).filter(Boolean);
  return needles.every((n) => haystack.includes(n));
}

function renderCard(venue) {
  const card = document.createElement("a");
  card.className = "card card--link";
  card.setAttribute("data-id", venue.id);
  card.href = `./booking.html?venue=${encodeURIComponent(venue.id)}`;
  card.setAttribute(
    "aria-label",
    `Przejdź do umawiania wizyty: ${venue.name}`
  );

  card.innerHTML = `
    <div class="card__top">
      <div>
        <h2 class="card__name">${escapeHtml(venue.name)}</h2>
        <p class="card__category">${escapeHtml(venue.category)} • ${escapeHtml(
    venue.city
  )}</p>
      </div>
      <div class="badge" aria-label="Ocena">
        <span class="badge__dot" aria-hidden="true"></span>
        ${venue.rating.toFixed(1)} (${venue.reviews})
      </div>
    </div>

    <div class="card__meta">
      <div class="card__row">
        <span class="card__label">Adres</span>
        <span class="card__value">${escapeHtml(venue.address)}</span>
      </div>
      <div class="card__row">
        <span class="card__label">Najbliższy termin</span>
        <span class="card__value">${escapeHtml(venue.nextSlot)}</span>
      </div>
    </div>
  `;

  return card;
}

function hasCoords(venue) {
  return Number.isFinite(venue?.lat) && Number.isFinite(venue?.lng);
}

function haversineKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function renderRecommended(query) {
  const filtered = venues.filter((v) => matchesQuery(v, query));

  els.grid.replaceChildren(...filtered.map(renderCard));

  els.empty.hidden = filtered.length !== 0;

  if (!query) {
    els.searchHint.textContent = `Pokazuję: ${venues.length} lokali`;
  } else {
    els.searchHint.textContent = `Wyniki: ${filtered.length} / ${venues.length}`;
  }
}

function renderNearby(query) {
  if (!els.nearbySection || !els.nearbyGrid) return;
  if (!userLocation) {
    els.nearbySection.hidden = true;
    return;
  }

  const ranked = venues
    .filter((v) => hasCoords(v))
    .filter((v) => matchesQuery(v, query))
    .map((v) => ({ venue: v, distanceKm: haversineKm(userLocation, v) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 3)
    .map((x) => x.venue);

  els.nearbyGrid.replaceChildren(...ranked.map(renderCard));
  els.nearbySection.hidden = ranked.length === 0;
}

function renderAll() {
  const query = els.searchInput?.value ?? "";
  renderNearby(query);
  renderRecommended(query);
}

function initGeolocation() {
  if (!els.nearbySection || !els.nearbyGrid) return;
  if (!("geolocation" in navigator)) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      renderAll();
    },
    () => {
      // User denied / unavailable — keep the section hidden.
      userLocation = null;
      renderAll();
    },
    {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 5 * 60 * 1000,
    }
  );
}

els.searchInput.addEventListener("input", () => {
  renderAll();
});

attachLoginAlert?.(els.loginBtn);
attachThemeToggle?.(els.themeToggle);
showFlashIfPresent();

if (els.supportLink) {
  els.supportLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.alert("Kontakt z supportem jest niedostępny w tej wersji demo.");
  });
}

if (els.year) {
  setCurrentYear?.(els.year);
}

initGeolocation();
renderAll();
