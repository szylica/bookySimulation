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

const { escapeHtml, setCurrentYear, attachLoginAlert, attachThemeToggle } =
  window.UIUtils ?? {};

let selectedSlot = null;

function getVenueId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("venue");
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

  const employees = Array.isArray(venue.employees) ? venue.employees : [];
  els.employeeSelect.replaceChildren(
    ...employees.map((e) => {
      const opt = document.createElement("option");
      opt.value = e.id;
      opt.textContent = e.name;
      return opt;
    })
  );

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
  els.bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

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
        (x) => x.id === employeeId
      )?.name ?? "";

    window.alert(
      `Potwierdzenie (symulacja)\n\nLokal: ${escapeHtml(
        venue.name
      )}\nPracownik: ${escapeHtml(employeeName)}\nUsługa: ${escapeHtml(
        service
      )}\nTermin: ${escapeHtml(formatTimeRange(slot.start, slot.end))} (${escapeHtml(
        slot.dateKey
      )})\nId terminu: ${escapeHtml(String(slot.id))}`
    );
  });
}

function init() {
  setCurrentYear?.(els.year);
  attachLoginAlert?.(els.loginBtn);
  attachThemeToggle?.(els.themeToggle);

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

  renderVenue(venue);
  setupForm(venue);
}

init();
