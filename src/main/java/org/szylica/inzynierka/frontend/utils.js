// Small shared utilities (no backend, no bundler).
// Exposed as a global so multiple pages can reuse logic.

(function () {
  // Backend base URL used by auth requests. Can be overridden before this file loads.
  if (typeof window.API_BASE !== "string" || !window.API_BASE.trim()) {
    window.API_BASE = "http://localhost:8080";
  }

  const THEME_KEY = "ui.theme";
  const AUTH_KEY = "auth.loggedIn";

  function getCookieValue(name) {
    const cookieStr = document?.cookie ?? "";
    if (!cookieStr) return null;

    const pairs = cookieStr.split(";");
    for (const pair of pairs) {
      const trimmed = pair.trim();
      if (!trimmed) continue;
      if (!trimmed.startsWith(`${name}=`)) continue;
      return trimmed.slice(name.length + 1);
    }
    return null;
  }

  function isLoggedIn() {
    // Prefer real session indicator from backend.
    // Note: if the cookie is HttpOnly, JS won't see it; then we fall back to localStorage.
    const session = getCookieValue("SESSION");
    if (session && session.length > 0) return true;

    try {
      return window.localStorage?.getItem(AUTH_KEY) === "1";
    } catch {
      return false;
    }
  }

  function setAuthLoggedIn(value) {
    try {
      if (value) window.localStorage?.setItem(AUTH_KEY, "1");
      else window.localStorage?.removeItem(AUTH_KEY);
    } catch {
      // ignore
    }
  }

  function escapeHtml(text) {
    return (text ?? "")
      .toString()
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalize(text) {
    return (text ?? "")
      .toString()
      .trim()
      .toLocaleLowerCase("pl-PL")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  function setCurrentYear(yearElement) {
    if (!yearElement) return;
    yearElement.textContent = new Date().getFullYear().toString();
  }

  function attachLoginAlert(loginButton) {
    if (!loginButton) return;

    const applyLabel = () => {
      if (isLoggedIn()) {
        loginButton.textContent = "Wyloguj się";
        loginButton.setAttribute("aria-label", "Wyloguj się");
      } else {
        loginButton.textContent = "Zaloguj się";
        loginButton.setAttribute("aria-label", "Zaloguj się");
      }
    };

    applyLabel();

    loginButton.addEventListener("click", (e) => {
      if (isLoggedIn()) {
        // No-op for now (no logout endpoint wired yet).
        e.preventDefault?.();
        return;
      }
      window.location.href = "./login.html";
    });

    // Keep label in sync if another tab logs in/out.
    window.addEventListener("storage", (e) => {
      if (e.key !== AUTH_KEY) return;
      applyLabel();
    });
  }

  function getPreferredTheme() {
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
      ? "dark"
      : "light";
  }

  function getStoredTheme() {
    try {
      const value = window.localStorage?.getItem(THEME_KEY);
      return value === "dark" || value === "light" ? value : null;
    } catch {
      return null;
    }
  }

  function getCurrentTheme() {
    const current = document.documentElement?.dataset?.theme;
    return current === "dark" || current === "light"
      ? current
      : getStoredTheme() ?? getPreferredTheme();
  }

  function applyTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
  }

  function setTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    applyTheme(next);
    try {
      window.localStorage?.setItem(THEME_KEY, next);
    } catch {
      // ignore
    }
  }

  function updateThemeToggleLabel(button) {
    const theme = getCurrentTheme();
    const isDark = theme === "dark";
    button.setAttribute("aria-pressed", isDark ? "true" : "false");
    button.textContent = isDark ? "Jasny motyw" : "Ciemny motyw";
    button.title = isDark
      ? "Przełącz na jasny motyw"
      : "Przełącz na ciemny motyw";
  }

  function attachThemeToggle(button) {
    if (!button) return;
    updateThemeToggleLabel(button);
    button.addEventListener("click", () => {
      const current = getCurrentTheme();
      setTheme(current === "dark" ? "light" : "dark");
      updateThemeToggleLabel(button);
    });

    window.addEventListener("storage", (e) => {
      if (e.key !== THEME_KEY) return;
      applyTheme(getStoredTheme() ?? getPreferredTheme());
      updateThemeToggleLabel(button);
    });
  }

  // Apply initial theme as early as possible.
  applyTheme(getStoredTheme() ?? getPreferredTheme());

  window.UIUtils = {
    escapeHtml,
    normalize,
    setCurrentYear,
    attachLoginAlert,
    attachThemeToggle,
    isLoggedIn,
    setAuthLoggedIn,
  };
})();
