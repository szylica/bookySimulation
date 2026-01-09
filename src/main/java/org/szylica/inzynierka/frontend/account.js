const els = {
  themeToggle: document.getElementById("themeToggle"),
  loginBtn: document.getElementById("loginBtn"),
  year: document.getElementById("year"),
  tabs: document.getElementById("accountTabs"),
  content: document.getElementById("accountContent"),
  subtitle: document.getElementById("accountSubtitle"),
  logoutBtn: document.getElementById("logoutBtn"),
  logoutMsg: document.getElementById("logoutMsg"),
};

const {
  escapeHtml,
  setCurrentYear,
  attachThemeToggle,
  attachLoginAlert,
  isLoggedIn,
  getAuthRole,
  setAuthLoggedIn,
  setAuthRole,
  apiFetch,
  logout,
} = window.UIUtils ?? {};

setCurrentYear?.(els.year);
attachThemeToggle?.(els.themeToggle);
attachLoginAlert?.(els.loginBtn);

if (!isLoggedIn?.()) {
  window.location.href = "./login.html";
}

const role = getAuthRole?.() ?? "ROLE_CUSTOMER";

const TABS_BY_ROLE = {
  ROLE_CUSTOMER: [
    { id: "account", label: "Ustawienia konta" },
    { id: "bookings", label: "Moje rezerwacje" },
  ],
  ROLE_PROVIDER: [
    { id: "company", label: "Ustawienia firmy" },
    { id: "services", label: "Usługi" },
    { id: "myVenues", label: "Moje lokale" },
  ],
  ROLE_WORKER: [
    { id: "profile", label: "Profil" },
    { id: "schedule", label: "Grafik" },
  ],
};

const tabs = TABS_BY_ROLE[role] ?? TABS_BY_ROLE.ROLE_CUSTOMER;

async function fetchMyLocals() {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/provider/my-locals`;

  const res = await apiFetch?.(url, { method: "GET" }) ?? await fetch(url, { method: "GET", credentials: "include" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = await res.json().catch(() => null);
  return Array.isArray(data) ? data : [];
}

function renderLocalCard(local) {
  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("data-id", local?.id ?? "");

  const name = escapeHtml?.(local?.name ?? "") ?? (local?.name ?? "");
  const city = escapeHtml?.(local?.city ?? "") ?? (local?.city ?? "");
  const address = escapeHtml?.(local?.address ?? "") ?? (local?.address ?? "");
  const phone = escapeHtml?.(local?.phone ?? "") ?? (local?.phone ?? "");

  card.innerHTML = `
    <div class="card__top">
      <div>
        <h2 class="card__name">${name || "Lokal"}</h2>
        <p class="card__category">${city}</p>
      </div>
    </div>

    <div class="card__meta">
      <div class="card__row">
        <span class="card__label">Adres</span>
        <span class="card__value">${address}</span>
      </div>
      <div class="card__row">
        <span class="card__label">Telefon</span>
        <span class="card__value">${phone}</span>
      </div>
    </div>
  `;

  return card;
}

function renderAddVenueCard() {
  const card = document.createElement("a");
  card.className = "card card--link card--add";
  card.href = "./venue-create.html";
  card.setAttribute("aria-label", "Dodaj nowy lokal");
  card.textContent = "+";
  return card;
}

function renderMyVenues() {
  if (!els.content) return;

  const title = document.createElement("h2");
  title.className = "form__title";
  title.textContent = "Moje lokale";

  const note = document.createElement("p");
  note.className = "form__note";
  note.textContent = "Ładowanie lokali…";

  const grid = document.createElement("div");
  grid.className = "grid";
  grid.replaceChildren(renderAddVenueCard());

  els.content.replaceChildren(title, note, grid);

  Promise.resolve()
    .then(() => fetchMyLocals())
    .then((locals) => {
      note.textContent = "";
      const cards = [renderAddVenueCard(), ...locals.map(renderLocalCard)];
      grid.replaceChildren(...cards);
    })
    .catch((err) => {
      note.textContent = `Nie udało się pobrać lokali: ${err?.message ?? err}`;
    });
}

function buildOptionalPayloadFromForm(formEl, fields) {
  const payload = {};
  for (const f of fields) {
    const el = formEl?.querySelector?.(`[name="${CSS.escape(f)}"]`);
    if (!el) continue;
    const raw = (el.value ?? "").toString().trim();
    if (raw.length === 0) continue; // pola nieobowiązkowe
    payload[f] = raw;
  }
  return payload;
}

async function updateCustomerAccount(payload) {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/customer/change-settings`;

  const res = await (apiFetch?.(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  }) ?? fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
    credentials: "include",
  }));

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  // backend może nie zwracać body
  return res.json().catch(() => null);
}

function renderCustomerAccountSettings() {
  if (!els.content) return;

  const title = document.createElement("h2");
  title.className = "form__title";
  title.textContent = "Ustawienia konta";

  const note = document.createElement("p");
  note.className = "form__note";
  note.textContent = "Możesz zmienić wybrane dane.";

  const wrapper = document.createElement("div");
  wrapper.className = "auth__card account__customerSettings";

  wrapper.innerHTML = `
    <form class="form form--inlineRows" id="customerAccountForm">
      <div class="formRow">
        <label class="form__label" for="customerFirstName">Imię</label>
        <input class="form__control" id="customerFirstName" type="text" name="name" autocomplete="given-name" placeholder="np. Jan" />
      </div>

      <div class="formRow">
        <label class="form__label" for="customerLastName">Nazwisko</label>
        <input class="form__control" id="customerLastName" type="text" name="surname" autocomplete="family-name" placeholder="np. Kowalski" />
      </div>

      <div class="formRow">
        <label class="form__label" for="customerEmail">E-mail</label>
        <input class="form__control" id="customerEmail" type="email" name="email" autocomplete="email" placeholder="np. jan@example.com" />
      </div>

      <div class="formRow">
        <label class="form__label" for="customerPhone">Telefon</label>
        <input class="form__control" id="customerPhone" type="tel" name="phone" autocomplete="tel" placeholder="np. 500 600 700" />
      </div>

      <button class="primary" type="submit" id="customerAccountSaveBtn">Zapisz zmiany</button>
      <p class="form__note" id="customerAccountMsg" aria-live="polite"></p>
    </form>
  `;

  els.content.replaceChildren(title, note, wrapper);

  const form = wrapper.querySelector("#customerAccountForm");
  const msg = wrapper.querySelector("#customerAccountMsg");
  const btn = wrapper.querySelector("#customerAccountSaveBtn");

  form?.addEventListener("submit", (e) => {
    e.preventDefault?.();
    if (msg) msg.textContent = "";

    const payload = buildOptionalPayloadFromForm(form, [
      "name",
      "surname",
      "email",
      "phone",
    ]);

    if (Object.keys(payload).length === 0) {
      if (msg) msg.textContent = "Uzupełnij przynajmniej jedno pole, żeby wysłać zmiany.";
      return;
    }

    const prevDisabled = btn?.disabled;
    if (btn) btn.disabled = true;

    Promise.resolve()
      .then(() => updateCustomerAccount(payload))
      .then(() => {
        if (msg) msg.textContent = "Zapisano.";
        form?.reset?.();
      })
      .catch((err) => {
        if (msg) msg.textContent = `Nie udało się zapisać: ${err?.message ?? err}`;
      })
      .finally(() => {
        if (btn) btn.disabled = !!prevDisabled;
      });
  });
}

function renderContent(tabId) {
  const tab = tabs.find((t) => t.id === tabId) ?? tabs[0];
  if (els.subtitle) els.subtitle.textContent = tab.label;

  if (!els.content) return;

  if (tab.id === "myVenues") {
    renderMyVenues();

    for (const btn of els.tabs?.querySelectorAll?.("button[data-tab]") ?? []) {
      btn.setAttribute(
        "aria-current",
        btn.getAttribute("data-tab") === tab.id ? "page" : "false"
      );
    }
    return;
  }

  if (tab.id === "account" && role === "ROLE_CUSTOMER") {
    renderCustomerAccountSettings();

    for (const btn of els.tabs?.querySelectorAll?.("button[data-tab]") ?? []) {
      btn.setAttribute(
        "aria-current",
        btn.getAttribute("data-tab") === tab.id ? "page" : "false"
      );
    }
    return;
  }

  const title = document.createElement("h2");
  title.className = "form__title";
  title.textContent = tab.label;

  const note = document.createElement("p");
  note.className = "form__note";

  switch (tab.id) {
    case "bookings":
      note.textContent = "Tutaj pojawi się lista Twoich rezerwacji.";
      break;
    case "company":
      note.textContent = "Tutaj pojawią się ustawienia konta firmowego.";
      break;
    case "services":
      note.textContent = "Tutaj pojawi się zarządzanie usługami.";
      break;
    case "schedule":
      note.textContent = "Tutaj pojawi się grafik i dostępność.";
      break;
    case "profile":
      note.textContent = "Tutaj pojawią się dane profilu pracownika.";
      break;
    default:
      note.textContent = "Tutaj pojawią się ustawienia konta.";
  }

  els.content.replaceChildren(title, note);

  for (const btn of els.tabs?.querySelectorAll?.("button[data-tab]") ?? []) {
    btn.setAttribute("aria-current", btn.getAttribute("data-tab") === tab.id ? "page" : "false");
  }
}

function renderTabs() {
  if (!els.tabs) return;

  const items = tabs.map((t, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "account__tab";
    btn.textContent = t.label;
    btn.setAttribute("data-tab", t.id);
    btn.setAttribute("aria-current", idx === 0 ? "page" : "false");
    btn.addEventListener("click", () => renderContent(t.id));
    return btn;
  });

  els.tabs.replaceChildren(...items);
}

renderTabs();

const tabFromUrl = new URLSearchParams(window.location.search).get("tab");
const initialTab = tabs.some((t) => t.id === tabFromUrl) ? tabFromUrl : tabs[0]?.id;
renderContent(initialTab);

els.logoutBtn?.addEventListener("click", () => {
  if (els.logoutMsg) els.logoutMsg.textContent = "";

  const prevDisabled = els.logoutBtn.disabled;
  els.logoutBtn.disabled = true;

  Promise.resolve()
    .then(() => logout?.())
    .then(() => {
      setAuthLoggedIn?.(false);
      setAuthRole?.(null);
      window.location.href = "./index.html";
    })
    .catch((err) => {
      if (els.logoutMsg) {
        els.logoutMsg.textContent = `Nie udało się wylogować: ${err?.message ?? err}`;
      } else {
        window.alert(`Nie udało się wylogować: ${err?.message ?? err}`);
      }
    })
    .finally(() => {
      els.logoutBtn.disabled = prevDisabled;
    });
});
