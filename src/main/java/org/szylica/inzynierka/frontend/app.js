const mockVenues = Array.isArray(window.VENUES) ? window.VENUES : [];
let mainLocals = [];

let userLocation = null;
let geoStatus = "unknown"; // unknown | granted | denied | unsupported

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
  apiFetch,
} =
  window.UIUtils ?? {};

function storePrefetchedLocalData(localId, data) {
  try {
    const idNum = Number(localId);
    if (!Number.isFinite(idNum)) return;
    window.sessionStorage?.setItem(
      `booking.prefetch.local.${idNum}`,
      JSON.stringify({ localId: idNum, data })
    );
  } catch {
    // ignore
  }
}

async function prefetchLocalDataForBooking(localId) {
  const idNum = Number(localId);
  if (!Number.isFinite(idNum)) return null;

  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/main/get-local-data`;

  const res = await (apiFetch?.(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: idNum }),
  }) ?? fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: idNum }),
    credentials: "include",
  }));

  if (!res.ok) return null;
  return res.json().catch(() => null);
}

function showFlashIfPresent() {
  if (!els.flashNotice) return;
  try {
    const msg = window.localStorage?.getItem("ui.flash");
    if (!msg) return;
    els.flashNotice.textContent = msg;
    els.flashNotice.hidden = false;
    els.flashNotice.dataset.kind = "app";
    window.localStorage?.removeItem("ui.flash");
  } catch {
    // ignore
  }
}

function showGeoFlashIfNeeded() {
  if (!els.flashNotice) return;
  // Do not override explicit app flash messages.
  if (els.flashNotice.dataset.kind === "app" && !els.flashNotice.hidden) return;

  const localsLoadedAndNonEmpty = Array.isArray(mainLocals) && mainLocals.length > 0;
  const needsGeoHint = geoStatus === "denied" || geoStatus === "unsupported";

  if (localsLoadedAndNonEmpty && needsGeoHint) {
    els.flashNotice.textContent = "Aby zobaczyć lokale blisko ciebie, włącz lokalizację w przeglądarce.";
    els.flashNotice.hidden = false;
    els.flashNotice.dataset.kind = "geo";
  } else if (els.flashNotice.dataset.kind === "geo") {
    // Only hide geo hint if we were the one showing it.
    els.flashNotice.hidden = true;
    els.flashNotice.textContent = "";
    delete els.flashNotice.dataset.kind;
  }
}

function matchesQuery(venue, query) {
  if (!query) return true;
  const haystack = normalize(
    [
      venue.name,
      venue.category,
      venue.companyName,
      venue.city,
      venue.address,
      venue.phone,
    ].join(" ")
  );
  const needles = normalize(query).split(/\s+/).filter(Boolean);
  return needles.every((n) => haystack.includes(n));
}

function renderCard(venue) {
  const bookingVenueId = venue?.mockVenueId ?? venue?.venueId ?? venue?.id ?? null;
  const isLink = !!bookingVenueId;
  const card = document.createElement(isLink ? "a" : "div");
  card.className = isLink ? "card card--link" : "card";
  if (isLink) {
    card.setAttribute("data-id", String(venue?.id ?? ""));

    const params = new URLSearchParams();
    params.set("venue", String(bookingVenueId));
    if (venue?.name) params.set("name", String(venue.name));
    if (venue?.city) params.set("city", String(venue.city));
    if (venue?.address) params.set("address", String(venue.address));
    if (venue?.phone) params.set("phone", String(venue.phone));
    if (venue?.companyName) params.set("companyName", String(venue.companyName));
    const localIdNum = Number(venue?.id);
    if (Number.isFinite(localIdNum)) params.set("localId", String(localIdNum));

    card.href = `./booking.html?${params.toString()}`;
    card.setAttribute(
      "aria-label",
      `Przejdź do umawiania wizyty: ${venue.name}`
    );
  }

  const subtitleLeft = venue.companyName ? venue.companyName : venue.category;
  const subtitle = [subtitleLeft, venue.city].filter(Boolean).join(" • ");
  const phone = venue.phone ? venue.phone : "";

  card.innerHTML = `
    <div class="card__top">
      <div>
        <h2 class="card__name">${escapeHtml(venue.name)}</h2>
        <p class="card__category">${escapeHtml(subtitle)}</p>
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
        <span class="card__label">Telefon</span>
        <span class="card__value">${escapeHtml(phone)}</span>
      </div>
      <div class="card__row">
        <span class="card__label">Najbliższy termin</span>
        <span class="card__value">${escapeHtml(venue.nextSlot)}</span>
      </div>
    </div>
  `;

  // Requirement: when clicking a local card on home, call /api/main/get-local-data
  // and show it on the booking page. We prefetch and pass via sessionStorage.
  if (isLink) {
    card.addEventListener("click", async (e) => {
      const localId = Number(venue?.id);
      if (!Number.isFinite(localId)) return; // fallback to normal navigation
      if (!card.href) return;

      e.preventDefault?.();

      try {
        const data = await prefetchLocalDataForBooking(localId);
        if (data) storePrefetchedLocalData(localId, data);
      } catch {
        // ignore prefetch errors, still navigate
      }

      window.location.href = card.href;
    });
  }

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
  const filtered = mainLocals.filter((v) => matchesQuery(v, query));

  els.grid.replaceChildren(...filtered.map(renderCard));

  // Keep layout stable when backend returns no locals:
  // - don't show the dashed empty-state box (it changes page spacing)
  // - just render an empty grid area (CSS provides min-height)
  if (mainLocals.length === 0) {
    els.empty.hidden = true;
  } else {
    els.empty.hidden = filtered.length !== 0;
  }

  if (els.searchHint) {
    if (!query) {
      els.searchHint.textContent = `Pokazuję: ${mainLocals.length} lokali`;
    } else {
      els.searchHint.textContent = `Wyniki: ${filtered.length} / ${mainLocals.length}`;
    }
  }
}

function renderNearby(query) {
  if (!els.nearbySection || !els.nearbyGrid) return;
  // Requirement: if user denied location OR backend returned an empty locals list,
  // do not display the "Lokale blisko ciebie" segment at all.
  if (mainLocals.length === 0 || !userLocation) {
    els.nearbyGrid.replaceChildren();
    els.nearbySection.hidden = true;
    return;
  }

  const ranked = mockVenues
    .filter((v) => hasCoords(v))
    .filter((v) => matchesQuery(v, query))
    .map((v) => ({ venue: v, distanceKm: haversineKm(userLocation, v) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 3)
    .map((x) => x.venue);

  els.nearbyGrid.replaceChildren(...ranked.map(renderCard));
  // Keep the section visible even when no nearby results.
  els.nearbySection.hidden = false;
}

function renderAll() {
  const query = els.searchInput?.value ?? "";
  renderNearby(query);
  renderRecommended(query);
  showGeoFlashIfNeeded();
}

function getMockMetaByIndex(idx) {
  const pool = mockVenues.length > 0 ? mockVenues : null;
  if (pool) {
    const src = pool[idx % pool.length];
    return {
      rating: Number.isFinite(src?.rating) ? src.rating : 4.7,
      reviews: Number.isFinite(src?.reviews) ? src.reviews : 120,
    };
  }
  return { rating: 4.7, reviews: 120 };
}

function parseBackendZonedDateTimeToUserDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);

  const raw = (value ?? "").toString().trim();
  if (!raw) return new Date(NaN);

  // Jackson can serialize ZonedDateTime as e.g.
  // - 2026-01-12T10:00:00Z
  // - 2026-01-12T10:00:00+00:00
  // - 2026-01-12T10:00:00+0000
  // - 2026-01-12T10:00:00+00:00[UTC]
  // Sometimes it may come without offset (still representing UTC).
  // NOTE: Per backend contract in this project, times are stored as UTC and should be
  // shown in the user's local timezone. We therefore treat the *clock time* as UTC
  // even if an offset is present in the string.
  let s = raw.replace(/\[[^\]]+\]$/, "");

  // Normalize +HHMM / -HHMM into +HH:MM / -HH:MM
  s = s.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");

  // Treat the provided local date-time as UTC (ignore any explicit offset).
  // Example: 2026-01-12T15:40:00+01:00 => 2026-01-12T15:40:00Z
  s = s.replace(/(Z|[+-]\d{2}:\d{2})$/, "");
  s = s.replace(" ", "T") + "Z";

  return new Date(s);
}

function formatNextSlotFromStartTime(startTime) {
  // Backend stores ZonedDateTime in UTC; show in user's local timezone.
  const dt = parseBackendZonedDateTimeToUserDate(startTime);
  if (!Number.isFinite(dt.getTime())) return "—";

  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");

  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dtMid = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

  const diffDays = Math.floor((dtMid.getTime() - todayMid.getTime()) / 86400000);

  if (diffDays === 0) return `Dzisiaj ${hh}:${mm}`;
  if (diffDays === 1) return `Jutro ${hh}:${mm}`;
  if (diffDays === 2) return `Pojutrze ${hh}:${mm}`;

  // Requirement: for other days show only the date.
  return dt.toLocaleDateString("pl-PL");
}

async function loadMainLocals() {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/main/get-locals`;

  if (els.searchHint) els.searchHint.textContent = "Ładowanie lokali…";

  try {
    const res = await (apiFetch?.(url, { method: "GET" }) ?? fetch(url, { method: "GET", credentials: "include" }));
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }

    const data = await res.json().catch(() => null);
    const items = Array.isArray(data) ? data : [];

    mainLocals = items.slice(0, 9).map((x, idx) => {
      // Backend shape: { local: {...}, availability: { startTime } }
      const local = x?.local ?? x?.venue ?? x?.localDto ?? x?.serviceLocal ?? null;
      const term =
        x?.availability ??
        x?.nearestFreeTerm ??
        x?.nearestSlot ??
        x?.nextFreeTerm ??
        x?.freeTerm ??
        null;

      const meta = getMockMetaByIndex(idx);
      const mockVenueId = mockVenues?.[idx % (mockVenues.length || 1)]?.id ?? null;
      const startTime = term?.startTime ?? term?.start_time ?? null;

      return {
        id: local?.id ?? x?.id ?? null,
        name: local?.name ?? "",
        city: local?.city ?? "",
        address: local?.address ?? "",
        phone: local?.phone ?? "",
        companyName: local?.serviceProvider?.companyName ?? "",
        mockVenueId,
        category: "",
        rating: meta.rating,
        reviews: meta.reviews,
        nextSlot: startTime ? formatNextSlotFromStartTime(startTime) : "—",
      };
    });

    // If backend returns nothing, show no locals.
    if (mainLocals.length === 0 && els.searchHint) {
      els.searchHint.textContent = "Brak lokali.";
    }
  } catch {
    // If API is unavailable, show no locals.
    mainLocals = [];
    if (els.searchHint) els.searchHint.textContent = "Nie udało się wczytać lokali.";
  } finally {
    renderAll();
  }
}

function initGeolocation() {
  if (!els.nearbySection || !els.nearbyGrid) return;
  if (!("geolocation" in navigator)) {
    geoStatus = "unsupported";
    userLocation = null;
    renderAll();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      geoStatus = "granted";
      userLocation = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      };
      renderAll();
    },
    () => {
      // User denied / unavailable — keep the section hidden.
      geoStatus = "denied";
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

// Start empty; list will be loaded from backend.
mainLocals = [];
initGeolocation();
renderAll();
loadMainLocals();
