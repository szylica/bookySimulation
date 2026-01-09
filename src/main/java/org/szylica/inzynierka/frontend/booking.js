const venues = Array.isArray(window.VENUES) ? window.VENUES : [];
const availability = Array.isArray(window.MOCK_AVAILABILITY)
  ? window.MOCK_AVAILABILITY
  : [];

const els = {
  bookingRoot: document.getElementById("bookingRoot"),
  bookingMissing: document.getElementById("bookingMissing"),
  themeToggle: document.getElementById("themeToggle"),
  loginBtn: document.getElementById("loginBtn"),
  year: document.getElementById("year"),

  venueName: document.getElementById("venueName"),
  venueMeta: document.getElementById("venueMeta"),
  venueRating: document.getElementById("venueRating"),
  venueAddress: document.getElementById("venueAddress"),

  dateInput: document.getElementById("dateInput"),
  timesSubtitle: document.getElementById("timesSubtitle"),
  timeGrid: document.getElementById("timeGrid"),
  timeEmpty: document.getElementById("timeEmpty"),
  slotIdInput: document.getElementById("slotIdInput"),

  employeeSelect: document.getElementById("employeeSelect"),
  serviceSelect: document.getElementById("serviceSelect"),
  bookingForm: document.getElementById("bookingForm"),
};

const {
  escapeHtml,
  setCurrentYear,
  attachLoginAlert,
  attachThemeToggle,
  isLoggedIn,
  apiFetch,
} =
  window.UIUtils ?? {};

let selectedSlot = null;
let selectedLocalId = null;

function getVenueId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("venue");
}

function getLocalId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("localId") ?? params.get("local") ?? null;
}

function getVenueOverridesFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  const city = params.get("city");
  const address = params.get("address");
  const phone = params.get("phone");
  const companyName = params.get("companyName");

  return {
    name: name ? String(name) : null,
    city: city ? String(city) : null,
    address: address ? String(address) : null,
    phone: phone ? String(phone) : null,
    companyName: companyName ? String(companyName) : null,
  };
}

function toLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatTimeRange(start, end) {
  return `${pad2(start.getHours())}:${pad2(start.getMinutes())}–${pad2(
    end.getHours()
  )}:${pad2(end.getMinutes())}`;
}

function parseSlot(slot) {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  return {
    ...slot,
    start,
    end,
    dateKey: toLocalDateKey(start),
  };
}

function parseBackendSlot(slot, dateKey) {
  const start = new Date(slot.startTime);
  const end = new Date(slot.endTime);
  return {
    ...slot,
    start,
    end,
    dateKey: String(dateKey ?? ""),
  };
}

function getEmployeeLabel(emp) {
  const name = (emp?.name ?? emp?.firstName ?? emp?.givenName ?? "").toString().trim();
  const surname = (emp?.surname ?? emp?.lastName ?? emp?.familyName ?? "").toString().trim();
  const fullName = (emp?.fullName ?? emp?.displayName ?? "").toString().trim();
  const composed = [name, surname].filter(Boolean).join(" ").trim();
  return composed || fullName || (emp?.email ?? "").toString() || "Pracownik";
}

function getServiceLabel(service) {
  return (
    service?.name ??
    service?.serviceName ??
    service?.title ??
    service?.label ??
    "Usługa"
  )
    .toString()
    .trim();
}

function applyEmployeesToSelect(employees) {
  const list = Array.isArray(employees) ? employees : [];
  els.employeeSelect.replaceChildren(
    ...list.map((e) => {
      const opt = document.createElement("option");
      opt.value = String(e?.id ?? e?.employeeId ?? e?.userId ?? getEmployeeLabel(e));
      opt.textContent = getEmployeeLabel(e);
      return opt;
    })
  );
}

function applyServicesToSelect(services) {
  const list = Array.isArray(services) ? services : [];
  if (!list.length) return;

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Wybierz usługę";

  const opts = list.map((s) => {
    const opt = document.createElement("option");
    opt.value = String(s?.id ?? s?.serviceId ?? getServiceLabel(s));
    opt.textContent = getServiceLabel(s);
    return opt;
  });

  els.serviceSelect.replaceChildren(placeholder, ...opts);
}

async function loadLocalData(localId) {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/main/get-local-data`;

  const res = await apiFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: Number(localId) }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json().catch(() => null);
}

async function loadAvailabilitiesForDate(dateKey) {
  if (!selectedLocalId) return [];
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/main/get-availabilities`;

  const payload = {
    localDto: { id: Number(selectedLocalId) },
    date: String(dateKey),
  };

  const res = await apiFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = await res.json().catch(() => []);
  const items = Array.isArray(data) ? data : [];
  return items
    .filter((s) => s && s.startTime && s.endTime)
    .map((s) => parseBackendSlot(s, dateKey))
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

function getSlotsByDate() {
  const parsed = availability
    .filter((s) => s && s.startTime && s.endTime)
    .map(parseSlot)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  /** @type {Record<string, any[]>} */
  const grouped = {};
  for (const slot of parsed) {
    (grouped[slot.dateKey] ??= []).push(slot);
  }
  return grouped;
}

function setSelectedSlot(slot) {
  selectedSlot = slot;
  if (els.slotIdInput) {
    els.slotIdInput.value = slot ? String(slot.id) : "";
  }
  if (els.timesSubtitle) {
    if (!slot) {
      els.timesSubtitle.textContent = "Wybierz godzinę z listy.";
    } else {
      els.timesSubtitle.textContent = `Wybrano: ${formatTimeRange(
        slot.start,
        slot.end
      )}`;
    }
  }

  const buttons = els.timeGrid?.querySelectorAll?.("button[data-slot-id]");
  buttons?.forEach((btn) => {
    const id = btn.getAttribute("data-slot-id");
    const isSelected = slot && id === String(slot.id);
    btn.classList.toggle("timeBtn--selected", Boolean(isSelected));
    btn.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });
}

function renderTimeGrid(slotsForDay) {
  setSelectedSlot(null);

  const slots = Array.isArray(slotsForDay) ? slotsForDay : [];
  if (!els.timeGrid) return;

  const availableCount = slots.filter((s) => !s.taken).length;
  els.timeEmpty.hidden = availableCount !== 0;

  const nodes = slots.map((slot) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "timeBtn";
    btn.setAttribute("role", "listitem");
    btn.setAttribute("data-slot-id", String(slot.id));
    btn.textContent = formatTimeRange(slot.start, slot.end);

    if (slot.taken) {
      btn.disabled = true;
      btn.title = "Termin zajęty";
      btn.setAttribute("aria-disabled", "true");
    } else {
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", () => setSelectedSlot(slot));
    }

    return btn;
  });

  els.timeGrid.replaceChildren(...nodes);
}

function renderVenue(venue) {
  els.venueName.textContent = venue.name;
  els.venueMeta.textContent = `${venue.category} • ${venue.city}`;
  els.venueRating.textContent = `${venue.rating.toFixed(1)} (${venue.reviews})`;
  els.venueAddress.textContent = venue.address;

  applyEmployeesToSelect(Array.isArray(venue.employees) ? venue.employees : []);
  applyServicesToSelect(Array.isArray(venue.services) ? venue.services : []);

  // If user arrived from home page with a real backend localId,
  // load availabilities from backend on date selection.
  if (selectedLocalId && els.dateInput) {
    const todayKey = toLocalDateKey(new Date());
    els.dateInput.min = todayKey;
    els.dateInput.value = els.dateInput.value || todayKey;

    const refresh = async () => {
      const key = els.dateInput.value;
      try {
        els.timesSubtitle.textContent = "Ładowanie terminów…";
        renderTimeGrid([]);
        const slots = await loadAvailabilitiesForDate(key);
        renderTimeGrid(slots);
        if (slots.length === 0) {
          els.timesSubtitle.textContent = "Brak dostępnych terminów w tym dniu.";
        } else {
          els.timesSubtitle.textContent = "Wybierz godzinę z listy.";
        }
      } catch (e) {
        console.error("Nie udało się pobrać terminów", e);
        const msg = (e?.message ?? "").toString().trim();
        els.timesSubtitle.textContent = msg
          ? `Nie udało się pobrać terminów: ${msg}`
          : "Nie udało się pobrać terminów.";
        renderTimeGrid([]);
      }
    };

    els.dateInput.addEventListener("change", refresh);
    // Initial load for the default date
    refresh();
    return;
  }

  // Fallback: mocked availability grouping
  const slotsByDate = getSlotsByDate();
  const dates = Object.keys(slotsByDate).sort();

  if (els.dateInput) {
    els.dateInput.min = dates[0] ?? "";
    els.dateInput.value = els.dateInput.value || dates[0] || "";

    els.dateInput.addEventListener("change", () => {
      const key = els.dateInput.value;
      renderTimeGrid(slotsByDate[key] ?? []);
    });
  }

  const initialKey = els.dateInput?.value;
  renderTimeGrid(slotsByDate[initialKey] ?? []);
}

function setupForm(venue) {
  const submitBtn = els.bookingForm?.querySelector?.('button[type="submit"]') ?? null;
  const applyAuthGate = () => {
    if (!submitBtn) return;
    const loggedIn = typeof isLoggedIn === "function" ? isLoggedIn() : false;
    submitBtn.disabled = !loggedIn;
    submitBtn.setAttribute("aria-disabled", loggedIn ? "false" : "true");
    submitBtn.title = loggedIn
      ? ""
      : "Aby się umówić, musisz posiadać konto i być zalogowany.";
  };

  applyAuthGate();
  // Keep state in sync if user logs in/out in another tab.
  window.addEventListener("storage", (e) => {
    if (e.key !== "auth.loggedIn") return;
    applyAuthGate();
  });

  els.bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const loggedIn = typeof isLoggedIn === "function" ? isLoggedIn() : false;
    if (!loggedIn) {
      window.alert("Aby się umówić, musisz posiadać konto i być zalogowany.");
      return;
    }

    const slot = selectedSlot;
    const employeeId = els.employeeSelect.value;
    const service = els.serviceSelect.value;

    if (!slot) {
      window.alert("Wybierz godzinę wizyty.");
      return;
    }

    if (!employeeId || !service) return;

    const employeeName =
      (Array.isArray(venue.employees) ? venue.employees : []).find(
        (x) => String(x?.id ?? x?.employeeId ?? x?.userId ?? "") === String(employeeId)
      )
        ?.
        name ??
      (Array.isArray(venue.employees) ? venue.employees : []).find(
        (x) => String(x?.id ?? x?.employeeId ?? x?.userId ?? "") === String(employeeId)
      )
        ?.
        fullName ??
      getEmployeeLabel(
        (Array.isArray(venue.employees) ? venue.employees : []).find(
          (x) => String(x?.id ?? x?.employeeId ?? x?.userId ?? "") === String(employeeId)
        )
      );

    const serviceLabel =
      els.serviceSelect?.selectedOptions?.[0]?.textContent?.toString?.() ??
      service;

    window.alert(
      `Potwierdzenie (symulacja)\n\nLokal: ${escapeHtml(
        venue.name
      )}\nPracownik: ${escapeHtml(employeeName)}\nUsługa: ${escapeHtml(
        serviceLabel
      )}\nTermin: ${escapeHtml(formatTimeRange(slot.start, slot.end))} (${escapeHtml(
        slot.dateKey
      )})\nId terminu: ${escapeHtml(String(slot.id))}`
    );
  });
}

async function init() {
  setCurrentYear?.(els.year);
  attachLoginAlert?.(els.loginBtn);
  attachThemeToggle?.(els.themeToggle);

  const localIdRaw = getLocalId();
  const localIdNum = Number(localIdRaw);
  selectedLocalId = Number.isFinite(localIdNum) ? localIdNum : null;
  const venueId = getVenueId();
  const baseVenue = venues.find((v) => v.id === venueId);

  const overrides = getVenueOverridesFromUrl();
  const venue = baseVenue
    ? {
        ...baseVenue,
        name: overrides.name ?? baseVenue.name,
        city: overrides.city ?? baseVenue.city,
        address: overrides.address ?? baseVenue.address,
        phone: overrides.phone ?? baseVenue.phone,
        companyName: overrides.companyName ?? baseVenue.companyName,
      }
    : null;

  if (!venue) {
    els.bookingRoot.hidden = true;
    els.bookingMissing.hidden = false;
    return;
  }

  els.bookingMissing.hidden = true;
  els.bookingRoot.hidden = false;

  if (selectedLocalId) {
    try {
      const data = await loadLocalData(selectedLocalId);
      const employees =
        data?.employees ??
        data?.workers ??
        data?.staff ??
        data?.employeeList ??
        data?.workerList ??
        [];
      const services =
        data?.services ??
        data?.serviceList ??
        data?.serviceDtos ??
        data?.providedServices ??
        [];

      if (Array.isArray(employees)) venue.employees = employees;
      if (Array.isArray(services)) venue.services = services;
    } catch (e) {
      console.error("Nie udało się pobrać danych lokalu", e);
    }
  }

  renderVenue(venue);
  setupForm(venue);
}

init();
