const els = {
  themeToggle: document.getElementById("themeToggle"),
  year: document.getElementById("year"),
  form: document.getElementById("companyRegisterForm"),
  companyName: document.getElementById("companyName"),
  email: document.getElementById("email"),
  nip: document.getElementById("nip"),
  password: document.getElementById("password"),
  phone: document.getElementById("phone"),
  msg: document.getElementById("companyRegisterMsg"),
  submitBtn: document.querySelector("#companyRegisterForm button[type=submit]"),
};

const { setCurrentYear, attachThemeToggle } = window.UIUtils ?? {};

setCurrentYear?.(els.year);
attachThemeToggle?.(els.themeToggle);

function digitsOnly(value) {
  return (value ?? "").toString().replace(/\D+/g, "");
}

async function registerProvider(payload) {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const res = await fetch(`${apiBase}/api/auth/provider/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  return res.text();
}

if (els.nip) {
  els.nip.addEventListener("input", () => {
    const next = digitsOnly(els.nip.value);
    if (els.nip.value !== next) els.nip.value = next;
  });
}

if (els.phone) {
  els.phone.addEventListener("input", () => {
    const next = digitsOnly(els.phone.value);
    if (els.phone.value !== next) els.phone.value = next;
  });
}

els.form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const payload = {
    companyName: (els.companyName?.value ?? "").trim(),
    email: (els.email?.value ?? "").trim(),
    nip: digitsOnly(els.nip?.value),
    password: (els.password?.value ?? "").toString(),
    phone: digitsOnly(els.phone?.value),
    role: "ROLE_PROVIDER",
  };

  if (!payload.companyName || !payload.email || !payload.nip || !payload.password || !payload.phone) {
    if (els.msg) els.msg.textContent = "Uzupełnij wszystkie pola.";
    return;
  }

  if (els.msg) els.msg.textContent = "";

  const prevText = els.submitBtn?.textContent;
  if (els.submitBtn) {
    els.submitBtn.disabled = true;
    els.submitBtn.textContent = "Rejestruję…";
  }

  registerProvider(payload)
    .then(() => {
      window.UIUtils?.setAuthLoggedIn?.(true);
      window.UIUtils?.setAuthRole?.("ROLE_PROVIDER");
      window.location.href = "./index.html";
    })
    .catch((err) => {
      if (els.msg) {
        els.msg.textContent = `Nie udało się zarejestrować firmy: ${err?.message ?? err}`;
      } else {
        window.alert(`Nie udało się zarejestrować firmy: ${err?.message ?? err}`);
      }
    })
    .finally(() => {
      if (els.submitBtn) {
        els.submitBtn.disabled = false;
        if (prevText) els.submitBtn.textContent = prevText;
      }
    });
});
