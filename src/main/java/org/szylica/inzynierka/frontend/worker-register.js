const els = {
  themeToggle: document.getElementById("themeToggle"),
  year: document.getElementById("year"),
  form: document.getElementById("workerRegisterForm"),
  firstName: document.getElementById("firstName"),
  lastName: document.getElementById("lastName"),
  phone: document.getElementById("phone"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  msg: document.getElementById("workerRegisterMsg"),
  submitBtn: document.querySelector("#workerRegisterForm button[type=submit]"),
};

const { setCurrentYear, attachThemeToggle } = window.UIUtils ?? {};

setCurrentYear?.(els.year);
attachThemeToggle?.(els.themeToggle);

function digitsOnly(value) {
  return (value ?? "").toString().replace(/\D+/g, "");
}

async function registerWorker(payload) {
  const apiBase = (window.API_BASE ?? "http://localhost:8080").replace(/\/$/, "");
  const res = await fetch(`${apiBase}/api/auth/worker/register`, {
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

if (els.phone) {
  els.phone.addEventListener("input", () => {
    const next = digitsOnly(els.phone.value);
    if (els.phone.value !== next) els.phone.value = next;
  });
}

els.form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const payload = {
    name: (els.firstName?.value ?? "").trim(),
    surname: (els.lastName?.value ?? "").trim(),
    phone: digitsOnly(els.phone?.value),
    email: (els.email?.value ?? "").trim(),
    password: (els.password?.value ?? "").toString(),
    role: "ROLE_WORKER",
  };

  if (!payload.name || !payload.surname || !payload.phone || !payload.email || !payload.password) {
    if (els.msg) els.msg.textContent = "Uzupełnij wszystkie pola.";
    return;
  }

  if (els.msg) els.msg.textContent = "";

  const prevText = els.submitBtn?.textContent;
  if (els.submitBtn) {
    els.submitBtn.disabled = true;
    els.submitBtn.textContent = "Rejestruję…";
  }

  registerWorker(payload)
    .then(() => {
      window.UIUtils?.setAuthLoggedIn?.(true);
      window.location.href = "./index.html";
    })
    .catch((err) => {
      if (els.msg) {
        els.msg.textContent = `Nie udało się zarejestrować: ${err?.message ?? err}`;
      } else {
        window.alert(`Nie udało się zarejestrować: ${err?.message ?? err}`);
      }
    })
    .finally(() => {
      if (els.submitBtn) {
        els.submitBtn.disabled = false;
        if (prevText) els.submitBtn.textContent = prevText;
      }
    });
});
