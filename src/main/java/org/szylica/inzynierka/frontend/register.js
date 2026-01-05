const els = {
  themeToggle: document.getElementById("themeToggle"),
  year: document.getElementById("year"),
  form: document.getElementById("registerForm"),
  phone: document.getElementById("phone"),
  firstName: document.getElementById("firstName"),
  lastName: document.getElementById("lastName"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  submitBtn: document.querySelector("#registerForm button[type=submit]"),
};

const { setCurrentYear, attachThemeToggle } = window.UIUtils ?? {};

setCurrentYear?.(els.year);
attachThemeToggle?.(els.themeToggle);

if (els.phone) {
  els.phone.addEventListener("input", () => {
    const digitsOnly = (els.phone.value ?? "").toString().replace(/\D+/g, "");
    if (els.phone.value !== digitsOnly) els.phone.value = digitsOnly;
  });
}

async function registerCustomer(payload) {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const res = await fetch(`${apiBase}/api/auth/customer/register`, {
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
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

els.form?.addEventListener("submit", (e) => {
  e.preventDefault();

  // Rejestracja z flow "Zaloguj się" w topbarze = konto CUSTOMER.
  const role = "ROLE_CUSTOMER";

  const payload = {
    name: (els.firstName?.value ?? "").trim(),
    surname: (els.lastName?.value ?? "").trim(),
    email: (els.email?.value ?? "").trim(),
    password: (els.password?.value ?? "").toString(),
    phone: (els.phone?.value ?? "").trim(),
    role,
  };

  // HTML required attributes handle basic empties; this is just a safety net.
  if (!payload.name || !payload.email || !payload.password || !payload.phone) {
    window.alert("Uzupełnij wymagane pola.");
    return;
  }

  const prevText = els.submitBtn?.textContent;
  if (els.submitBtn) {
    els.submitBtn.disabled = true;
    els.submitBtn.textContent = "Rejestruję…";
  }

  registerCustomer(payload)
    .then(() => {
      window.UIUtils?.setAuthLoggedIn?.(true);
      window.UIUtils?.setAuthRole?.("ROLE_CUSTOMER");
      window.location.href = "./index.html";
    })
    .catch((err) => {
      window.alert(`Nie udało się zarejestrować: ${err?.message ?? err}`);
    })
    .finally(() => {
      if (els.submitBtn) {
        els.submitBtn.disabled = false;
        if (prevText) els.submitBtn.textContent = prevText;
      }
    });
});
