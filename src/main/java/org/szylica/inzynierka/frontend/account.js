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

let myLocalsPrefetch = null;
let selectedLocalId = null;
let myLocalsCache = [];
let myVenuesUi = {
  grid: null,
  detailsMount: null,
  note: null,
};

function setActiveLocalCard(localId) {
  const grid = myVenuesUi.grid;
  if (!grid) return;
  for (const el of grid.querySelectorAll?.(".account__localBtn[data-id]") ?? []) {
    el.classList.toggle(
      "account__localBtn--active",
      String(el.getAttribute("data-id")) === String(localId)
    );
  }
}

function attachLocalDetailsHandlers(shell, localId) {
  const msg = shell.querySelector("#localDetailsMsg");
  const body = shell.querySelector("#localDetailsBody");

  const editLocalForm = shell.querySelector("#editLocalForm");
  const saveLocalMsg = shell.querySelector("#saveLocalMsg");
  const saveLocalBtn = shell.querySelector("#saveLocalBtn");
  const editLocalPhone = shell.querySelector("#editLocalPhone");
  editLocalPhone?.addEventListener?.("input", () => {
    const next = digitsOnly(editLocalPhone.value);
    if (editLocalPhone.value !== next) editLocalPhone.value = next;
  });

  const addWorkerForm = shell.querySelector("#addWorkerForm");
  const addWorkerMsg = shell.querySelector("#addWorkerMsg");
  const addWorkerBtn = shell.querySelector("#addWorkerBtn");
  const workerIdInput = shell.querySelector("#workerId");
  workerIdInput?.addEventListener?.("input", () => {
    const next = digitsOnly(workerIdInput.value);
    if (workerIdInput.value !== next) workerIdInput.value = next;
  });

  // Remove worker (trash icon) handlers
  for (const btn of shell.querySelectorAll?.('button[data-action="remove-worker"][data-worker-id]') ?? []) {
    btn.addEventListener("click", () => {
      const wid = Number(btn.getAttribute("data-worker-id"));
      if (!Number.isFinite(wid) || wid <= 0) return;

      const ok = window.confirm("Usunąć pracownika z lokalu?");
      if (!ok) return;

      Promise.resolve()
        .then(() => removeWorkerFromLocal(localId, wid))
        .then(() => {
          if (addWorkerMsg) addWorkerMsg.textContent = "Usunięto pracownika.";
        })
        .then(() => refreshDetails())
        .catch((err) => {
          if (addWorkerMsg) addWorkerMsg.textContent = `Nie udało się usunąć pracownika: ${err?.message ?? err}`;
        });
    });
  }

  const openAssignServicesBtn = shell.querySelector("#openAssignServicesBtn");
  const assignPanel = shell.querySelector("#assignServicesPanel");
  const assignList = shell.querySelector("#providerServicesList");

  const servicesForm = shell.querySelector("#assignServicesForm");
  const saveServicesMsg = shell.querySelector("#saveServicesMsg");
  const saveServicesBtn = shell.querySelector("#saveServicesBtn");

  const getAssignedServiceIdsFromShell = () =>
    Array.from(shell.querySelectorAll?.('button[data-action="remove-service"][data-service-id]') ?? [])
      .map((b) => Number(b.getAttribute("data-service-id")))
      .filter((n) => Number.isFinite(n));

  const renderProviderServicesChecklist = (services) => {
    if (!assignList) return;
    const arr = Array.isArray(services) ? services : [];
    if (arr.length === 0) {
      assignList.innerHTML = '<p class="form__note">Brak usług providera do wyboru.</p>';
      return;
    }

    const alreadyAssigned = new Set(getAssignedServiceIdsFromShell());

    const formatDuration = (value) => {
      if (value == null) return "—";
      const num = Number(value);
      if (!Number.isFinite(num) || num <= 0) return "—";
      if (num >= 1_000_000_000) {
        const seconds = num / 1_000_000_000;
        if (seconds < 60) return `${Math.round(seconds)} s`;
        const minutes = seconds / 60;
        if (minutes < 120) return `${Math.round(minutes)} min`;
        const hours = minutes / 60;
        return `${hours.toFixed(1)} h`;
      }
      return `${Math.round(num)} min`;
    };

    const formatPrice = (value) => {
      const num = Number(value);
      if (!Number.isFinite(num)) return "—";
      try {
        return `${num.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
      } catch {
        return `${num.toFixed(2)} zł`;
      }
    };

    const rows = arr
      .map((s, idx) => {
        const id = Number(s?.id ?? s?.serviceId);
        if (!Number.isFinite(id)) return "";

        const name = s?.name ?? s?.serviceName ?? s?.title ?? `Usługa ${idx + 1}`;
        const safeName = escapeHtml?.(String(name)) ?? String(name);

        const meta = `${formatDuration(s?.duration)}  •  ${formatPrice(s?.price)}`;
        const safeMeta = escapeHtml?.(meta) ?? meta;

        const safeId = escapeHtml?.(String(id)) ?? String(id);
        const isAssigned = alreadyAssigned.has(id);
        return `
          <label class="account__checkRow account__serviceRow">
            <input type="checkbox" name="serviceId" value="${safeId}" ${isAssigned ? "checked disabled" : ""} />
            <span>${safeName}</span>
            <span class="auth__muted">${safeMeta}</span>
          </label>
        `;
      })
      .filter(Boolean)
      .join("");

    if (!rows) {
      assignList.innerHTML = '<p class="form__note">Nie udało się wyświetlić usług (brak ID w danych).</p>';
      return;
    }

    assignList.innerHTML = `<div class="account__checks">${rows}</div>`;
  };

  const refreshDetails = () =>
    Promise.resolve()
      .then(() => {
        if (msg) msg.textContent = "Ładowanie…";
        return fetchLocalData(localId);
      })
      .then((fresh) => {
        if (msg) msg.textContent = "";
        const refreshed = renderLocalDetails(fresh, null);
        body?.replaceChildren(refreshed);
        // Re-bind handlers after DOM replacement.
        attachLocalDetailsHandlers(shell, localId);
      })
      .catch((err) => {
        if (msg) msg.textContent = `Nie udało się odświeżyć danych lokalu: ${err?.message ?? err}`;
      });

  // Remove assigned service handlers
  for (const btn of shell.querySelectorAll?.('button[data-action="remove-service"][data-service-id]') ?? []) {
    btn.addEventListener("click", () => {
      const sid = Number(btn.getAttribute("data-service-id"));
      if (!Number.isFinite(sid) || sid <= 0) return;

      const ok = window.confirm("Usunąć usługę z lokalu?");
      if (!ok) return;

      const remaining = getAssignedServiceIdsFromShell().filter((id) => id !== sid);

      Promise.resolve()
        .then(() => setLocalServices(localId, remaining))
        .then(() => {
          if (saveServicesMsg) saveServicesMsg.textContent = "Usunięto usługę.";
        })
        .then(() => refreshDetails())
        .catch((err) => {
          if (saveServicesMsg) saveServicesMsg.textContent = `Nie udało się usunąć usługi: ${err?.message ?? err}`;
        });
    });
  }

  openAssignServicesBtn?.addEventListener?.("click", () => {
    if (!assignPanel) return;
    assignPanel.hidden = !assignPanel.hidden;
    if (assignPanel.hidden) return;

    // Load provider services when user opens the panel.
    // (We re-render each time so disabled/checked states reflect current assignments.)

    Promise.resolve()
      .then(() => {
        if (saveServicesMsg) saveServicesMsg.textContent = "Ładowanie usług…";
        return fetchProviderServices();
      })
      .then((services) => {
        if (saveServicesMsg) saveServicesMsg.textContent = "";
        renderProviderServicesChecklist(services);
      })
      .catch((err) => {
        if (saveServicesMsg) saveServicesMsg.textContent = `Nie udało się pobrać usług providera: ${err?.message ?? err}`;
        if (assignList) assignList.innerHTML = "";
      });
  });

  const updateLocalCardDom = (updates) => {
    const card = myVenuesUi.grid?.querySelector?.(`.account__localBtn[data-id="${CSS.escape(String(localId))}"]`);
    if (!card) return;

    const nameEl = card.querySelector?.(".card__name");
    const cityEl = card.querySelector?.(".card__category");
    const addressEl = card.querySelector?.(".card__row:nth-child(1) .card__value");
    const phoneEl = card.querySelector?.(".card__row:nth-child(2) .card__value");

    if (nameEl && updates?.name != null) nameEl.textContent = String(updates.name);
    if (cityEl && updates?.city != null) cityEl.textContent = String(updates.city);
    if (addressEl && updates?.address != null) addressEl.textContent = String(updates.address);
    if (phoneEl && updates?.phone != null) phoneEl.textContent = String(updates.phone);
  };

  editLocalForm?.addEventListener("submit", (e) => {
    e.preventDefault?.();
    if (saveLocalMsg) saveLocalMsg.textContent = "";

    const fd = new FormData(editLocalForm);
    const updates = {
      name: (fd.get("name") ?? "").toString().trim(),
      city: (fd.get("city") ?? "").toString().trim(),
      address: (fd.get("address") ?? "").toString().trim(),
      phone: digitsOnly((fd.get("phone") ?? "").toString()),
    };

    if (!updates.name || !updates.city || !updates.address || !updates.phone) {
      if (saveLocalMsg) saveLocalMsg.textContent = "Uzupełnij wszystkie pola.";
      return;
    }

    const prevDisabled = saveLocalBtn?.disabled;
    if (saveLocalBtn) saveLocalBtn.disabled = true;

    Promise.resolve()
      .then(() => updateLocalData(localId, updates))
      .then(() => {
        if (saveLocalMsg) saveLocalMsg.textContent = "Zapisano dane lokalu.";
        updateLocalCardDom(updates);
      })
      .then(() => refreshDetails())
      .catch((err) => {
        if (saveLocalMsg) saveLocalMsg.textContent = `Nie udało się zapisać: ${err?.message ?? err}`;
      })
      .finally(() => {
        if (saveLocalBtn) saveLocalBtn.disabled = !!prevDisabled;
      });
  });

  addWorkerForm?.addEventListener("submit", (e) => {
    e.preventDefault?.();
    if (addWorkerMsg) addWorkerMsg.textContent = "";

    const fd = new FormData(addWorkerForm);
    const workerIdRaw = digitsOnly((fd.get("workerId") ?? "").toString());
    const workerId = Number(workerIdRaw);
    if (!Number.isFinite(workerId) || workerId <= 0) {
      if (addWorkerMsg) addWorkerMsg.textContent = "Podaj poprawne ID pracownika.";
      return;
    }

    const prevDisabled = addWorkerBtn?.disabled;
    if (addWorkerBtn) addWorkerBtn.disabled = true;

    Promise.resolve()
      .then(() => addWorkerToLocal(localId, workerId))
      .then(() => {
        if (addWorkerMsg) addWorkerMsg.textContent = "Dodano pracownika.";
        addWorkerForm?.reset?.();
      })
      .then(() => refreshDetails())
      .catch((err) => {
        if (addWorkerMsg) addWorkerMsg.textContent = `Nie udało się dodać pracownika: ${err?.message ?? err}`;
      })
      .finally(() => {
        if (addWorkerBtn) addWorkerBtn.disabled = !!prevDisabled;
      });
  });

  servicesForm?.addEventListener("submit", (e) => {
    e.preventDefault?.();
    if (saveServicesMsg) saveServicesMsg.textContent = "";

    const already = new Set(getAssignedServiceIdsFromShell());
    const selected = Array.from(servicesForm.querySelectorAll('input[name="serviceId"]:checked:not(:disabled)'))
      .map((el) => Number(el.value))
      .filter((n) => Number.isFinite(n));

    const next = Array.from(new Set([...already, ...selected]));

    console.log("[assign-services] localId ->", localId);
    console.log("[assign-services] selected serviceIds ->", selected);
    console.log("[assign-services] merged serviceIds ->", next);

    if (next.length === 0) {
      if (saveServicesMsg) saveServicesMsg.textContent = "Wybierz przynajmniej jedną usługę.";
      return;
    }

    const prevDisabled = saveServicesBtn?.disabled;
    if (saveServicesBtn) saveServicesBtn.disabled = true;

    Promise.resolve()
      .then(() => setLocalServices(localId, next))
      .then(() => {
        if (saveServicesMsg) saveServicesMsg.textContent = "Zapisano usługi.";
      })
      .then(() => refreshDetails())
      .catch((err) => {
        if (saveServicesMsg) saveServicesMsg.textContent = `Nie udało się zapisać usług: ${err?.message ?? err}`;
      })
      .finally(() => {
        if (saveServicesBtn) saveServicesBtn.disabled = !!prevDisabled;
      });
  });
}

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
    { id: "employment", label: "Zatrudnij się" },
  ],
};

const tabs = TABS_BY_ROLE[role] ?? TABS_BY_ROLE.ROLE_CUSTOMER;

async function fetchMyLocals() {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/user/my-locals`;

  const res = await apiFetch?.(url, { method: "GET" }) ?? await fetch(url, { method: "GET", credentials: "include" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = await res.json().catch(() => null);
  return Array.isArray(data) ? data : [];
}

function validateSessionOnEnter() {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");

  // Best-effort generic endpoint (if backend exposes it). 404 is ignored.
  const authMeUrl = `${apiBase}/api/auth/me`;
  Promise.resolve()
    .then(() => apiFetch?.(authMeUrl, { method: "GET", headers: { Accept: "application/json" } }))
    .then((res) => {
      if (!res || res.status === 404) return;
      // For non-2xx, apiFetch doesn't throw (except 401/403). Ignore.
    })
    .catch(() => {
      // SESSION_EXPIRED is handled by apiFetch (redirect + flash).
    });

  // Role-based check for provider: validates session immediately on panel entry.
  if (role === "ROLE_PROVIDER") {
    myLocalsPrefetch = fetchMyLocals();
    myLocalsPrefetch.catch(() => {
      // Any 401/403 triggers auto-logout via apiFetch.
    });
  }
}

function renderLocalCard(local) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "card card--link account__localBtn";
  btn.setAttribute("data-id", local?.id ?? "");
  btn.setAttribute("aria-label", `Otwórz szczegóły lokalu: ${local?.name ?? "Lokal"}`);

  const name = escapeHtml?.(local?.name ?? "") ?? (local?.name ?? "");
  const city = escapeHtml?.(local?.city ?? "") ?? (local?.city ?? "");
  const address = escapeHtml?.(local?.address ?? "") ?? (local?.address ?? "");
  const phone = escapeHtml?.(local?.phone ?? "") ?? (local?.phone ?? "");

  btn.innerHTML = `
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

  btn.addEventListener("click", () => {
    const idNum = Number(local?.id);
    if (!Number.isFinite(idNum)) return;

    // Toggle: clicking the same selected local closes details.
    if (Number(selectedLocalId) === idNum) {
      selectedLocalId = null;
      setActiveLocalCard(null);
      myVenuesUi.detailsMount?.replaceChildren?.();
      return;
    }

    openLocalDetails(idNum);
  });

  return btn;
}

function renderAddVenueCard() {
  const card = document.createElement("a");
  card.className = "card card--link card--add";
  card.href = "./venue-create.html";
  card.setAttribute("aria-label", "Dodaj nowy lokal");
  card.textContent = "+";
  return card;
}

async function fetchLocalData(localId) {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/user/info-local`;

  const res = await (apiFetch?.(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: Number(localId) }),
  }) ?? fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: Number(localId) }),
    credentials: "include",
  }));

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json().catch(() => null);
}

async function addWorkerToLocal(localId, workerPayload) {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/user/add-worker`;

  const payload = {
    workerId: Number(workerPayload),
    localId: Number(localId),
  };

  const res = await (apiFetch?.(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }) ?? fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  }));

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json().catch(() => null);
}

async function removeWorkerFromLocal(localId, workerId) {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/user/remove-worker`;

  const payload = {
    workerId: Number(workerId),
    localId: Number(localId),
  };

  const res = await (apiFetch?.(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }) ?? fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  }));

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json().catch(() => null);
}

async function setLocalServices(localId, serviceIds) {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/user/set-local-services`;

  const ids = Array.isArray(serviceIds)
    ? serviceIds.map((x) => Number(x)).filter((n) => Number.isFinite(n))
    : [];

  const payload = {
    localId: Number(localId),
    servicesIds: ids,
  };

  console.log("[set-local-services] payload ->", payload);

  const res = await (apiFetch?.(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }) ?? fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  }));

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json().catch(() => null);
}

async function updateLocalData(localId, updates) {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/user/update-local`;

  const payload = { id: Number(localId), ...(updates ?? {}) };

  const res = await (apiFetch?.(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }) ?? fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  }));

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json().catch(() => null);
}

function digitsOnly(value) {
  return (value ?? "").toString().replace(/\D+/g, "");
}

function renderLocalDetailsShell(localId) {
  const box = document.createElement("div");
  box.className = "card account__localDetails";
  box.setAttribute("data-local-id", String(localId));

  box.innerHTML = `
    <div class="account__localDetailsHead">
      <h3 class="account__localDetailsTitle">Szczegóły lokalu</h3>
      <button type="button" class="account__localDetailsClose" aria-label="Zamknij szczegóły">×</button>
    </div>
    <div class="form__note" id="localDetailsMsg">Ładowanie…</div>
    <div id="localDetailsBody"></div>
  `;

  box.querySelector(".account__localDetailsClose")?.addEventListener("click", () => {
    selectedLocalId = null;
    setActiveLocalCard(null);
    myVenuesUi.detailsMount?.replaceChildren();
  });

  return box;
}

function openLocalDetails(localId) {
  selectedLocalId = Number(localId);
  if (!Number.isFinite(selectedLocalId)) return;
  if (!myVenuesUi.detailsMount) return;

  setActiveLocalCard(selectedLocalId);

  const shell = renderLocalDetailsShell(selectedLocalId);
  myVenuesUi.detailsMount.replaceChildren(shell);

  const msg = shell.querySelector("#localDetailsMsg");
  const body = shell.querySelector("#localDetailsBody");
  if (msg) msg.textContent = "Ładowanie…";

  Promise.resolve()
    .then(() => fetchLocalData(selectedLocalId))
    .then((data) => {
      if (msg) msg.textContent = "";
      const content = renderLocalDetails(data, null);
      body?.replaceChildren(content);
      attachLocalDetailsHandlers(shell, selectedLocalId);
    })
    .catch((err) => {
      if (msg) msg.textContent = `Nie udało się pobrać danych lokalu: ${err?.message ?? err}`;
    });
}

function renderLocalDetails(localDto, extras) {
  const container = document.createElement("div");
  container.className = "account__localDetailsBody";

  // New shape from backend (2026-01): { localDto: {...}, services: [...] }
  // Backward-compatible: accept older shapes too.
  const local = localDto?.local ?? localDto?.localDto ?? localDto ?? {};

  const name = escapeHtml?.(local?.name ?? "") ?? (local?.name ?? "");
  const city = escapeHtml?.(local?.city ?? "") ?? (local?.city ?? "");
  const address = escapeHtml?.(local?.address ?? "") ?? (local?.address ?? "");
  const phone = escapeHtml?.(local?.phone ?? "") ?? (local?.phone ?? "");
  const rawName = (local?.name ?? "").toString();
  const rawCity = (local?.city ?? "").toString();
  const rawAddress = (local?.address ?? "").toString();
  const rawPhone = (local?.phone ?? "").toString();

  const employees =
    extras?.employees ??
    local?.workers ??
    localDto?.employees ??
    localDto?.workers ??
    localDto?.staff ??
    [];

  const servicesAssigned =
    extras?.servicesAssigned ??
    local?.serviceList ??
    localDto?.services ??
    localDto?.assignedServices ??
    [];

  const servicesAll =
    extras?.servicesAll ??
    localDto?.allServices ??
    localDto?.providerServices ??
    localDto?.servicesCatalog ??
    // New response can contain "services" at the top-level of the wrapper object.
    localDto?.services ??
    servicesAssigned;

  const assignedIds = new Set(
    (Array.isArray(servicesAssigned) ? servicesAssigned : [])
      .map((s) => Number(s?.id ?? s?.serviceId))
      .filter((n) => Number.isFinite(n))
  );

  const servicesAssignedArr = Array.isArray(servicesAssigned) ? servicesAssigned : [];
  const noAssignedServices = servicesAssignedArr.length === 0;

  const formatServiceDurationShort = (value) => {
    if (value == null) return "—";

    if (typeof value === "number") {
      if (!Number.isFinite(value) || value <= 0) return "—";
      // Heuristic: large numbers are likely nanoseconds (java.time.Duration#getNano style).
      if (value >= 1_000_000_000) {
        const seconds = value / 1_000_000_000;
        if (seconds < 60) return `${Math.round(seconds)} s`;
        const minutes = seconds / 60;
        if (minutes < 120) return `${Math.round(minutes)} min`;
        const hours = minutes / 60;
        return `${hours.toFixed(1)} h`;
      }
      // Small numbers: assume minutes.
      return `${Math.round(value)} min`;
    }

    const raw = (value ?? "").toString().trim();
    if (!raw) return "—";

    // ISO-8601 Duration like PT10S / PT20M / PT1H30M
    const m = raw.match(/^P(T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)$/i);
    if (!m) return raw;

    const h = Number(m[2] ?? 0);
    const min = Number(m[3] ?? 0);
    const s = Number(m[4] ?? 0);
    const parts = [];
    if (Number.isFinite(h) && h > 0) parts.push(`${h}h`);
    if (Number.isFinite(min) && min > 0) parts.push(`${min}m`);
    if (Number.isFinite(s) && s > 0) parts.push(`${s}s`);
    return parts.length ? parts.join(" ") : raw;
  };

  const formatPriceShort = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "—";
    try {
      return `${num.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
    } catch {
      return `${num.toFixed(2)} zł`;
    }
  };

  // NOTE: formatPriceShort defined above.

  const employeeRows = (Array.isArray(employees) ? employees : []).map((e) => {
    const workerId = e?.id ?? e?.workerId ?? e?.worker_id ?? e?.workerDto?.id ?? null;
    const wid = Number(workerId);

    const label = [e?.name, e?.surname].filter(Boolean).join(" ") || e?.fullName || e?.email || "Pracownik";
    const safeLabel = escapeHtml?.(label) ?? label;

    const canRemove = Number.isFinite(wid) && wid > 0;
    const safeWorkerId = escapeHtml?.(String(wid)) ?? String(wid);

    return `
      <li class="account__pillRow">
        <span class="account__pillText">${safeLabel}</span>
        ${canRemove ? `
          <button
            type="button"
            class="account__iconBtn"
            data-action="remove-worker"
            data-worker-id="${safeWorkerId}"
            aria-label="Usuń pracownika"
            title="Usuń pracownika"
          >
            <svg class="account__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z"/>
            </svg>
          </button>
        ` : ""}
      </li>
    `;
  });

  const allServicesArr = Array.isArray(servicesAll) ? servicesAll : [];
  const hasServiceIds = allServicesArr.some((s) => {
    const id = Number(s?.id ?? s?.serviceId);
    return Number.isFinite(id);
  });

  const assignedServiceRows = servicesAssignedArr
    .map((s, idx) => {
      const id = Number(s?.id ?? s?.serviceId);
      const hasId = Number.isFinite(id) && id > 0;

      const label = s?.name ?? s?.serviceName ?? s?.title ?? `Usługa ${idx + 1}`;
      const safeLabel = escapeHtml?.(label) ?? label;

      const duration = s?.duration ?? s?.durationInMinutes ?? s?.durationMinutes ?? null;
      const price = s?.price ?? null;
      const meta = `${formatServiceDurationShort(duration)}  • ${formatPriceShort(price)}`;
      const safeMeta = escapeHtml?.(meta) ?? meta;

      const safeId = escapeHtml?.(String(id)) ?? String(id);

      return `
        <div class="account__checkRow account__serviceAssignedRow">
          <div class="account__serviceAssignedMain">
            <span class="account__serviceAssignedName">${safeLabel}</span>
            <span class="auth__muted account__serviceAssignedMeta">${safeMeta}</span>
          </div>
          ${hasId ? `
            <button
              type="button"
              class="account__iconBtn"
              data-action="remove-service"
              data-service-id="${safeId}"
              aria-label="Usuń usługę"
              title="Usuń usługę"
            >
              <svg class="account__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z"/>
              </svg>
            </button>
          ` : ""}
        </div>
      `;
    })
    .join("");

  const serviceRows = allServicesArr.map((s, idx) => {
    const id = s?.id ?? s?.serviceId;
    const label = s?.name ?? s?.serviceName ?? s?.title ?? `Usługa ${idx + 1}`;
    const safeLabel = escapeHtml?.(label) ?? label;
    const duration = s?.duration ?? s?.durationInMinutes ?? s?.durationMinutes ?? null;
    const price = s?.price ?? null;

    if (!hasServiceIds) {
      const meta = `${formatServiceDurationShort(duration)}  • ${formatPriceShort(price)}`;
      const safeMeta = escapeHtml?.(meta) ?? meta;
      return `
        <div class="account__checkRow account__serviceRow">
          <span>${safeLabel}</span>
          <span class="auth__muted">${safeMeta}</span>
        </div>
      `;
    }

    const safeId = escapeHtml?.(String(id ?? "")) ?? String(id ?? "");
    const checked = Number.isFinite(Number(id)) && assignedIds.has(Number(id)) ? "checked" : "";
    const disabled = id == null ? "disabled" : "";
    return `
      <label class="account__checkRow">
        <input type="checkbox" name="serviceId" value="${safeId}" ${checked} ${disabled} />
        <span>${safeLabel}</span>
      </label>
    `;
  });

  container.innerHTML = `
    <div class="card__meta">
      <div class="card__row"><span class="card__label">Nazwa</span><span class="card__value">${name}</span></div>
      <div class="card__row"><span class="card__label">Miasto</span><span class="card__value">${city}</span></div>
      <div class="card__row"><span class="card__label">Adres</span><span class="card__value">${address}</span></div>
      <div class="card__row"><span class="card__label">Telefon</span><span class="card__value">${phone}</span></div>
    </div>

    <hr class="account__divider" />

    <h4 class="account__subTitle">Dane lokalu</h4>
    <form class="form form--inlineRows account__form" id="editLocalForm">
      <div class="formRow">
        <label class="form__label" for="editLocalName">Nazwa</label>
        <input class="form__control" id="editLocalName" name="name" type="text" value="${escapeHtml?.(rawName) ?? rawName}" required />
      </div>
      <div class="formRow">
        <label class="form__label" for="editLocalCity">Miasto</label>
        <input class="form__control" id="editLocalCity" name="city" type="text" value="${escapeHtml?.(rawCity) ?? rawCity}" required />
      </div>
      <div class="formRow">
        <label class="form__label" for="editLocalAddress">Adres</label>
        <input class="form__control" id="editLocalAddress" name="address" type="text" value="${escapeHtml?.(rawAddress) ?? rawAddress}" required />
      </div>
      <div class="formRow">
        <label class="form__label" for="editLocalPhone">Telefon</label>
        <input class="form__control" id="editLocalPhone" name="phone" type="tel" inputmode="numeric" pattern="[0-9]*" value="${escapeHtml?.(rawPhone) ?? rawPhone}" required />
      </div>
      <button class="primary primary--subtle" type="submit" id="saveLocalBtn">Zapisz dane lokalu</button>
      <p class="form__note" id="saveLocalMsg" aria-live="polite"></p>
    </form>

    <hr class="account__divider" />

    <h4 class="account__subTitle">Pracownicy</h4>
    <ul class="account__pillList">${employeeRows.length ? employeeRows.join("") : "<li class=\"form__note\">Brak przypisanych pracowników.</li>"}</ul>

    <form class="form form--inlineRows account__form" id="addWorkerForm">
      <div class="formRow">
        <label class="form__label" for="workerId">ID pracownika</label>
        <input class="form__control" id="workerId" name="workerId" type="text" inputmode="numeric" pattern="[0-9]*" required />
      </div>
      <button class="primary primary--subtle" type="submit" id="addWorkerBtn">Dodaj pracownika</button>
      <p class="form__note account__hint">Poproś pracownika o jego ID (znajdzie je w swoim panelu użytkownika w zakładce „Zatrudnij się”).</p>
      <p class="form__note" id="addWorkerMsg" aria-live="polite"></p>
    </form>

    <hr class="account__divider" />

    <h4 class="account__subTitle">Usługi w lokalu</h4>
    ${noAssignedServices ? '<p class="form__note">Żadne usługi nie zostały jeszcze przypisane do lokalu.</p>' : ''}
    <div class="account__checks">${assignedServiceRows || '<p class="form__note">Brak usług do wyświetlenia.</p>'}</div>

    <button class="primary primary--subtle" type="button" id="openAssignServicesBtn">Dodaj usługi</button>
    <div id="assignServicesPanel" class="account__details" hidden>
      <form class="account__form" id="assignServicesForm">
        <div id="providerServicesList"></div>
        <button class="primary primary--subtle" type="submit" id="saveServicesBtn">Dodaj wybrane</button>
        <p class="form__note" id="saveServicesMsg" aria-live="polite"></p>
      </form>
    </div>
  `;

  return container;
}

function renderMyVenues(options) {
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

  const detailsMount = document.createElement("div");
  detailsMount.id = "localDetailsMount";

  myVenuesUi = { grid, detailsMount, note };

  els.content.replaceChildren(title, note, grid, detailsMount);

  Promise.resolve()
    .then(() => {
      const p = myLocalsPrefetch ?? fetchMyLocals();
      myLocalsPrefetch = null;
      return p;
    })
    .then((locals) => {
      note.textContent = "";
      myLocalsCache = Array.isArray(locals) ? locals : [];
      const cards = [renderAddVenueCard(), ...myLocalsCache.map(renderLocalCard)];
      grid.replaceChildren(...cards);

      // Requirement: only send info-local request after explicit click on a card.
      const idToOpen = Number(options?.selectedLocalId);
      if (!Number.isFinite(idToOpen)) return;
      openLocalDetails(idToOpen);
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
  const url = `${apiBase}/api/user/change-settings`;

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

async function fetchWorkerId() {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/user/get-worker-id`;

  const res = await (apiFetch?.(url, { method: "GET" }) ?? fetch(url, { method: "GET", credentials: "include" }));
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
  if (contentType.includes("application/json")) {
    const data = await res.json().catch(() => null);
    const id = typeof data === "number" ? data : data?.id ?? data?.workerId ?? data?.worker_id;
    const num = Number(id);
    if (!Number.isFinite(num)) throw new Error("Nieprawidłowa odpowiedź z serwera.");
    return num;
  }

  const text = await res.text().catch(() => "");
  const num = Number((text ?? "").toString().trim());
  if (!Number.isFinite(num)) throw new Error("Nieprawidłowa odpowiedź z serwera.");
  return num;
}

async function fetchProviderServices() {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/user/get-services`;

  const res = await (apiFetch?.(url, { method: "GET" }) ?? fetch(url, { method: "GET", credentials: "include" }));
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = await res.json().catch(() => null);
  return Array.isArray(data) ? data : [];
}

async function addProviderService(payload) {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  // Best-effort endpoint name; adjust if backend uses a different route.
  const url = `${apiBase}/api/user/add-service`;

  const res = await (apiFetch?.(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  }) ?? fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
    credentials: "include",
  }));

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  // Expected response shape (example):
  // { id: 2, name: "...", description: "...", price: 10.0, duration: 20 }
  const created = await res.json().catch(() => null);

  // Ensure id is present on returned object (needed later for delete by id).
  if (!created || typeof created !== "object" || created.id == null) {
    // keep the raw object for debugging, but signal missing identifier
    return created;
  }

  return created;
}

async function deleteProviderService(serviceId) {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/user/delete-service`;

  // Backend expects: { "id": <serviceId> }
  const payload = { id: Number(serviceId) };

  const res = await (apiFetch?.(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }) ?? fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  }));

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  // backend may return empty body
  return res.json().catch(() => null);
}

function renderProviderServices() {
  if (!els.content) return;

  const title = document.createElement("h2");
  title.className = "form__title";
  title.textContent = "Moje usługi";

  const note = document.createElement("p");
  note.className = "form__note";
  note.textContent = "Ładowanie usług…";

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <div class="account__localDetailsHead account__servicesHead">
      <h3 class="account__localDetailsTitle">Lista usług</h3>
      <button type="button" class="primary" id="addServiceToggle">Dodaj usługę</button>
    </div>

    <div id="addServicePanel" class="account__servicesPanel" hidden>
      <form class="form account__serviceForm" id="addServiceForm">
        <div class="formRow">
          <label class="form__label" for="serviceName">Nazwa</label>
          <input class="form__control" id="serviceName" name="name" type="text" required />
        </div>
        <div class="formRow">
          <label class="form__label" for="serviceDesc">Opis</label>
          <input class="form__control" id="serviceDesc" name="description" type="text" required />
        </div>
        <div class="account__serviceFormRow2">
          <div class="formRow">
            <label class="form__label" for="serviceDuration">Czas (min)</label>
            <input class="form__control" id="serviceDuration" name="duration" type="number" min="1" step="1" required />
          </div>
          <div class="formRow">
            <label class="form__label" for="servicePrice">Cena (zł)</label>
            <input class="form__control" id="servicePrice" name="price" type="number" min="0" step="0.01" required />
          </div>
        </div>
        <div class="account__serviceFormActions">
          <button class="primary" type="submit" id="addServiceBtn">Zapisz usługę</button>
          <p class="form__note" id="addServiceMsg" aria-live="polite"></p>
        </div>
      </form>
    </div>

    <div id="servicesList"></div>
    <p class="form__note" id="servicesMsg" aria-live="polite"></p>
  `;

  els.content.replaceChildren(title, note, card);

  const listEl = card.querySelector("#servicesList");
  const msgEl = card.querySelector("#servicesMsg");
  const toggleBtn = card.querySelector("#addServiceToggle");
  const panelEl = card.querySelector("#addServicePanel");
  const formEl = card.querySelector("#addServiceForm");
  const addBtn = card.querySelector("#addServiceBtn");
  const addMsg = card.querySelector("#addServiceMsg");

  const renderList = (services) => {
    const arr = Array.isArray(services) ? services : [];
    if (!listEl) return;

    if (arr.length === 0) {
      listEl.innerHTML = '<p class="form__note">Brak usług. Dodaj pierwszą usługę.</p>';
      return;
    }

    const formatPrice = (value) => {
      const num = Number(value);
      if (!Number.isFinite(num)) return "—";
      try {
        return `${num.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
      } catch {
        return `${num.toFixed(2)} zł`;
      }
    };

    const formatDuration = (value) => {
      if (value == null) return "—";
      const num = Number(value);
      if (!Number.isFinite(num) || num <= 0) return "—";
      // Heuristic: large numbers are likely nanoseconds.
      if (num >= 1_000_000_000) {
        const seconds = num / 1_000_000_000;
        if (seconds < 60) return `${Math.round(seconds)} s`;
        const minutes = seconds / 60;
        if (minutes < 120) return `${Math.round(minutes)} min`;
        const hours = minutes / 60;
        return `${hours.toFixed(1)} h`;
      }
      return `${Math.round(num)} min`;
    };

    const cards = arr
      .map((s, idx) => {
        const id = s?.id ?? null;
        const name = s?.name ?? `Usługa ${idx + 1}`;
        const description = (s?.description ?? "").toString();
        const duration = s?.duration ?? null;
        const price = s?.price ?? null;

        const safeName = escapeHtml?.(String(name)) ?? String(name);
        const safeId = escapeHtml?.(String(id ?? "")) ?? String(id ?? "");
        const safeDesc = (escapeHtml?.(description) ?? description).trim();
        const meta = `${formatDuration(duration)} • ${formatPrice(price)}`;

        const canDelete = Number.isFinite(Number(id)) && Number(id) > 0;

        return `
          <div class="account__serviceCard">
            <div class="account__serviceCardTop">
              <div class="account__serviceMain">
                <div class="account__serviceName">${safeName}</div>
                <div class="account__serviceMeta">${meta}</div>
              </div>
              <div class="account__serviceId">#${safeId}</div>
            </div>
            ${safeDesc ? `<div class="account__serviceDesc">${safeDesc}</div>` : ""}
            ${canDelete ? `
              <button
                type="button"
                class="account__iconBtn"
                data-action="delete-service"
                data-id="${safeId}"
                aria-label="Usuń usługę"
                title="Usuń usługę"
              >
                <svg class="account__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z"/>
                </svg>
              </button>
            ` : ""}
          </div>
        `;
      })
      .join("");

    listEl.innerHTML = `<div class="account__servicesGrid">${cards}</div>`;

    // Bind delete handlers after render
    for (const btn of listEl.querySelectorAll?.('button[data-action="delete-service"][data-id]') ?? []) {
      btn.addEventListener("click", () => {
        const sid = Number(btn.getAttribute("data-id"));
        if (!Number.isFinite(sid) || sid <= 0) return;

        const ok = window.confirm("Usunąć usługę? Tej operacji nie można cofnąć.");
        if (!ok) return;

        const prevDisabled = btn.disabled;
        btn.disabled = true;

        Promise.resolve()
          .then(() => deleteProviderService(sid))
          .then(() => {
            if (msgEl) msgEl.textContent = "Usunięto usługę.";
          })
          .then(() => refresh())
          .catch((err) => {
            if (msgEl) msgEl.textContent = `Nie udało się usunąć usługi: ${err?.message ?? err}`;
          })
          .finally(() => {
            btn.disabled = prevDisabled;
          });
      });
    }
  };

  const refresh = () =>
    Promise.resolve()
      .then(() => {
        if (msgEl) msgEl.textContent = "";
        return fetchProviderServices();
      })
      .then((services) => {
        note.textContent = "";
        renderList(services);
      })
      .catch((err) => {
        note.textContent = "";
        if (msgEl) msgEl.textContent = `Nie udało się pobrać usług: ${err?.message ?? err}`;
        renderList([]);
      });

  toggleBtn?.addEventListener?.("click", () => {
    if (!panelEl) return;
    panelEl.hidden = !panelEl.hidden;
  });

  formEl?.addEventListener?.("submit", (e) => {
    e.preventDefault?.();
    if (addMsg) addMsg.textContent = "";

    const fd = new FormData(formEl);
    const name = (fd.get("name") ?? "").toString().trim();
    const description = (fd.get("description") ?? "").toString().trim();
    const durationRaw = (fd.get("duration") ?? "").toString().trim();
    const priceRaw = (fd.get("price") ?? "").toString().trim();

    const duration = Number.parseInt(durationRaw, 10);
    const price = Number.parseFloat(priceRaw);

    if (!name || !description) {
      if (addMsg) addMsg.textContent = "Uzupełnij nazwę i opis.";
      return;
    }
    if (!Number.isFinite(duration) || duration <= 0) {
      if (addMsg) addMsg.textContent = "Podaj poprawny czas trwania w minutach.";
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      if (addMsg) addMsg.textContent = "Podaj poprawną cenę.";
      return;
    }

    const prevDisabled = addBtn?.disabled;
    if (addBtn) addBtn.disabled = true;

    Promise.resolve()
      .then(() => addProviderService({ name, description, duration, price }))
      .then((created) => {
        const id = created?.id;
        if (id == null) {
          if (addMsg) addMsg.textContent = "Dodano usługę, ale backend nie zwrócił ID.";
        } else {
          if (addMsg) addMsg.textContent = `Dodano usługę (#${id}).`;
        }

        formEl?.reset?.();
        if (panelEl) panelEl.hidden = true;
      })
      .then(() => refresh())
      .catch((err) => {
        if (addMsg) addMsg.textContent = `Nie udało się dodać usługi: ${err?.message ?? err}`;
      })
      .finally(() => {
        if (addBtn) addBtn.disabled = !!prevDisabled;
      });
  });

  refresh();
}

function renderWorkerEmployment() {
  if (!els.content) return;

  const title = document.createElement("h2");
  title.className = "form__title";
  title.textContent = "Zatrudnij się";

  const note = document.createElement("p");
  note.className = "form__note";
  note.textContent = "Pobieranie Twojego ID pracownika…";

  const box = document.createElement("div");
  box.className = "card";
  box.innerHTML = `
    <div class="card__meta">
      <div class="card__row">
        <span class="card__label">Twoje ID pracownika</span>
        <span class="card__value" id="workerIdValue">—</span>
      </div>
    </div>
    <p class="form__note" id="workerIdMsg" aria-live="polite"></p>
  `;

  const idEl = box.querySelector("#workerIdValue");
  const msgEl = box.querySelector("#workerIdMsg");

  els.content.replaceChildren(title, note, box);

  Promise.resolve()
    .then(() => fetchWorkerId())
    .then((id) => {
      note.textContent = "";
      if (idEl) idEl.textContent = String(id);
      if (msgEl) msgEl.textContent = "";
    })
    .catch((err) => {
      note.textContent = "";
      if (msgEl) msgEl.textContent = `Nie udało się pobrać ID pracownika: ${err?.message ?? err}`;
    });
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
        <input class="form__control" id="customerPhone" type="tel" name="phone" inputmode="numeric" pattern="[0-9]*" autocomplete="tel" placeholder="np. 500600700" />
      </div>

      <button class="primary" type="submit" id="customerAccountSaveBtn">Zapisz zmiany</button>
      <p class="form__note" id="customerAccountMsg" aria-live="polite"></p>
    </form>
  `;

  els.content.replaceChildren(title, note, wrapper);

  const form = wrapper.querySelector("#customerAccountForm");
  const msg = wrapper.querySelector("#customerAccountMsg");
  const btn = wrapper.querySelector("#customerAccountSaveBtn");
  const phone = wrapper.querySelector("#customerPhone");

  phone?.addEventListener?.("input", () => {
    const digitsOnly = (phone.value ?? "").toString().replace(/\D+/g, "");
    if (phone.value !== digitsOnly) phone.value = digitsOnly;
  });

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

  if (tab.id === "employment" && role === "ROLE_WORKER") {
    renderWorkerEmployment();

    for (const btn of els.tabs?.querySelectorAll?.("button[data-tab]") ?? []) {
      btn.setAttribute(
        "aria-current",
        btn.getAttribute("data-tab") === tab.id ? "page" : "false"
      );
    }
    return;
  }

  if (tab.id === "services" && role === "ROLE_PROVIDER") {
    renderProviderServices();

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

validateSessionOnEnter();

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
