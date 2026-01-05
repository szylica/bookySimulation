const els = {
  themeToggle: document.getElementById("themeToggle"),
  year: document.getElementById("year"),
  form: document.getElementById("companyLoginForm"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  msg: document.getElementById("companyLoginMsg"),
  submitBtn: document.querySelector("#companyLoginForm button[type=submit]"),
};

const { setCurrentYear, attachThemeToggle } = window.UIUtils ?? {};

setCurrentYear?.(els.year);
attachThemeToggle?.(els.themeToggle);

async function loginProvider(payload) {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const res = await fetch(`${apiBase}/api/auth/provider/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json().catch(() => null);
      const msg = data?.message || data?.error || "";
      throw new Error(msg || `HTTP ${res.status}`);
    }

    const text = await res.text().catch(() => "");
    try {
      const maybe = JSON.parse(text);
      const msg = maybe?.message || maybe?.error;
      throw new Error(msg || text || `HTTP ${res.status}`);
    } catch {
      throw new Error(text || `HTTP ${res.status}`);
    }
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

els.form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const payload = {
    username: (els.email?.value ?? "").trim(),
    password: (els.password?.value ?? "").toString(),
  };

  if (!payload.username || !payload.password) {
    if (els.msg) els.msg.textContent = "Uzupełnij e-mail i hasło.";
    return;
  }

  if (els.msg) els.msg.textContent = "";

  const prevText = els.submitBtn?.textContent;
  if (els.submitBtn) {
    els.submitBtn.disabled = true;
    els.submitBtn.textContent = "Loguję…";
  }

  loginProvider(payload)
    .then(() => {
      window.UIUtils?.setAuthLoggedIn?.(true);
      window.UIUtils?.setAuthRole?.("ROLE_PROVIDER");
      if (els.msg) els.msg.textContent = "Zalogowano. Przekierowuję…";
      window.location.href = "./business.html";
    })
    .catch((err) => {
      if (els.msg) {
        els.msg.textContent = `Nie udało się zalogować: ${err?.message ?? err}`;
      } else {
        window.alert(`Nie udało się zalogować: ${err?.message ?? err}`);
      }
    })
    .finally(() => {
      if (els.submitBtn) {
        els.submitBtn.disabled = false;
        if (prevText) els.submitBtn.textContent = prevText;
      }
    });
});
