const els = {
  themeToggle: document.getElementById("themeToggle"),
  year: document.getElementById("year"),
  form: document.getElementById("loginForm"),
};

const { setCurrentYear, attachThemeToggle } = window.UIUtils ?? {};

setCurrentYear?.(els.year);
attachThemeToggle?.(els.themeToggle);

els.form?.addEventListener("submit", (e) => {
  e.preventDefault();
  window.alert("Logowanie (symulacja) — backend będzie podpięty później.");
});
