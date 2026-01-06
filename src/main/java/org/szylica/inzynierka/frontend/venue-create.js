const els = {
  themeToggle: document.getElementById("themeToggle"),
  loginBtn: document.getElementById("loginBtn"),
  year: document.getElementById("year"),
  form: document.getElementById("venueCreateForm"),
  msg: document.getElementById("venueCreateMsg"),
  name: document.getElementById("name"),
  city: document.getElementById("city"),
  address: document.getElementById("address"),
  postalCode: document.getElementById("postalCode"),
  phone: document.getElementById("phone"),
  openTime: document.getElementById("openTime"),
  closeTime: document.getElementById("closeTime"),
  visitLength: document.getElementById("visitLength"),
  planningWindow: document.getElementById("planningWindow"),
};

const {
  setCurrentYear,
  attachThemeToggle,
  attachLoginAlert,
  isLoggedIn,
  getAuthRole,
  apiFetch,
} = window.UIUtils ?? {};

setCurrentYear?.(els.year);
attachThemeToggle?.(els.themeToggle);
attachLoginAlert?.(els.loginBtn);

if (!isLoggedIn?.()) {
  window.location.href = "./login.html";
}

const role = getAuthRole?.() ?? "ROLE_CUSTOMER";
if (role !== "ROLE_PROVIDER") {
  window.location.href = "./account.html";
}

function setMsg(text) {
  if (els.msg) els.msg.textContent = text ?? "";
}

function toLocalTimeString(value) {
  const v = (value ?? "").toString().trim();
  if (!v) return "";
  // HTML <input type="time"> typically returns HH:mm (seconds optional).
  // Java LocalTime (ISO_LOCAL_TIME) accepts HH:mm or HH:mm:ss; send seconds to be safe.
  if (/^\d{2}:\d{2}$/.test(v)) return `${v}:00`;
  return v;
}

async function createLocal(payload) {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const url = `${apiBase}/api/provider/add-local`;

  const res = await (apiFetch?.(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  }) ?? fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload ?? {}),
  }));

  if (res.ok) {
    // Backend may return created object or empty body.
    return await res.json().catch(() => null);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = await res.json().catch(() => null);
    const msg = data?.message ?? data?.error ?? null;
    throw new Error(msg ? String(msg) : `HTTP ${res.status}`);
  }

  const text = await res.text().catch(() => "");
  throw new Error(text || `HTTP ${res.status}`);
}

els.form?.addEventListener("submit", (e) => {
  e.preventDefault();
  setMsg("");

  const submitBtn = els.form?.querySelector?.('button[type="submit"]');
  const prevDisabled = submitBtn?.disabled;
  if (submitBtn) submitBtn.disabled = true;

  const visitDurationInMinutes = Number.parseInt(els.visitLength?.value ?? "", 10);
  const schedulingLimitInDays = Number.parseInt(els.planningWindow?.value ?? "", 10);

  const payload = {
    name: (els.name?.value ?? "").trim(),
    address: (els.address?.value ?? "").trim(),
    city: (els.city?.value ?? "").trim(),
    postalCode: (els.postalCode?.value ?? "").trim(),
    phone: (els.phone?.value ?? "").trim(),
    openingTime: toLocalTimeString(els.openTime?.value),
    closingTime: toLocalTimeString(els.closeTime?.value),
    visitDurationInMinutes,
    schedulingLimitInDays,
  };

  if (
    !payload.name ||
    !payload.address ||
    !payload.city ||
    !payload.postalCode ||
    !payload.phone ||
    !payload.openingTime ||
    !payload.closingTime ||
    !Number.isFinite(payload.visitDurationInMinutes) ||
    payload.visitDurationInMinutes <= 0 ||
    !Number.isFinite(payload.schedulingLimitInDays) ||
    payload.schedulingLimitInDays <= 0
  ) {
    setMsg("Uzupełnij wszystkie pola.");
    if (submitBtn) submitBtn.disabled = prevDisabled;
    return;
  }

  Promise.resolve()
    .then(() => createLocal(payload))
    .then(() => {
      window.location.href = "./account.html?tab=myVenues";
    })
    .catch((err) => {
      setMsg(`Nie udało się utworzyć lokalu: ${err?.message ?? err}`);
    })
    .finally(() => {
      if (submitBtn) submitBtn.disabled = prevDisabled;
    });
});
