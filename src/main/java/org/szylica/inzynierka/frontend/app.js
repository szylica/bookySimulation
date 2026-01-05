const venues = Array.isArray(window.VENUES) ? window.VENUES : [];

const els = {
  searchInput: document.getElementById("searchInput"),
  searchHint: document.getElementById("searchHint"),
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

function render(query) {
  const filtered = venues.filter((v) => matchesQuery(v, query));

  els.grid.replaceChildren(...filtered.map(renderCard));

  els.empty.hidden = filtered.length !== 0;

  if (!query) {
    els.searchHint.textContent = `Pokazuję: ${venues.length} lokali`;
  } else {
    els.searchHint.textContent = `Wyniki: ${filtered.length} / ${venues.length}`;
  }
}

els.searchInput.addEventListener("input", () => {
  render(els.searchInput.value);
});

attachLoginAlert?.(els.loginBtn);
attachThemeToggle?.(els.themeToggle);

if (els.supportLink) {
  els.supportLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.alert("Kontakt z supportem jest niedostępny w tej wersji demo.");
  });
}

if (els.year) {
  setCurrentYear?.(els.year);
}

render("");
