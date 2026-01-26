import { CONFIG } from "./config.js";

// Load Saved Theme
function loadSavedTheme() {
  const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);

  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    document.documentElement.setAttribute(
      "data-theme",
      prefersDark ? "dark" : "light",
    );
  }

  updateThemeIcon();
}

// Toggle Theme
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  if (newTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);

  updateThemeIcon();
}

// Update Theme Icon
function updateThemeIcon() {
  const themeToggle = document.querySelector(".theme-toggle");
  if (!themeToggle) return;

  const currentTheme = document.documentElement.getAttribute("data-theme");
  if (currentTheme === "dark") {
    themeToggle.innerHTML = `
              <svg class="icon moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
    `;
    themeToggle.setAttribute("aria-label", "Switch to light mode");
  } else {
    themeToggle.innerHTML = `
      <svg class="icon sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    `;
    themeToggle.setAttribute("aria-label", "Switch to dark mode");
  }
}

// Initialize theme Toggle button
function initThemeToggle() {
  // loadSavedTheme();

  const themeToggle = document.querySelector(".theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      console.log("fdfljsdlf;");
      toggleTheme();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadSavedTheme();
  initThemeToggle();
});

export { toggleTheme, loadSavedTheme };
