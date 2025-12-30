// Small shared utilities (no backend, no bundler).
// Exposed as a global so multiple pages can reuse logic.

(function () {
  const THEME_KEY = "ui.theme";

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
    loginButton.addEventListener("click", () => {
      window.location.href = "./login.html";
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
  };
})();
