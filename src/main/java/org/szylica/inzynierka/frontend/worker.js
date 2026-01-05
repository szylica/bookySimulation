const els = {
  themeToggle: document.getElementById("themeToggle"),
  loginBtn: document.getElementById("loginBtn"),
  year: document.getElementById("year"),
};

const { setCurrentYear, attachThemeToggle, attachLoginAlert } = window.UIUtils ?? {};

setCurrentYear?.(els.year);
attachThemeToggle?.(els.themeToggle);
attachLoginAlert?.(els.loginBtn);
