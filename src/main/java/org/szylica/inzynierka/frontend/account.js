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
  setCurrentYear,
  attachThemeToggle,
  attachLoginAlert,
  isLoggedIn,
  getAuthRole,
  setAuthLoggedIn,
  setAuthRole,
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
  ],
  ROLE_WORKER: [
    { id: "profile", label: "Profil" },
    { id: "schedule", label: "Grafik" },
  ],
};

const tabs = TABS_BY_ROLE[role] ?? TABS_BY_ROLE.ROLE_CUSTOMER;

function renderContent(tabId) {
  const tab = tabs.find((t) => t.id === tabId) ?? tabs[0];
  if (els.subtitle) els.subtitle.textContent = tab.label;

  if (!els.content) return;

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
renderContent(tabs[0]?.id);

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
