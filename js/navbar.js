import { CONFIG } from "./config.js";
import { showSuccessMessage, logoutConfimation, initMobileMenu } from "./ui.js";
import { initThemeToggle } from "./theme.js";

// Update navbar fuction
export function updateNavbar() {
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  const userData = JSON.parse(
    localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA),
  );
  const guestLinks = document.getElementById("guestLinks");
  const authLinks = document.getElementById("authLinks");

  if (token && userData) {
    // user is logged in
    if (authLinks) authLinks.style.display = "flex";
    if (guestLinks) guestLinks.style.display = "none";

    // display user data
    const navUsername = document.getElementById("navUsername");
    const navAvatar = document.getElementById("navAvatar");

    if (navUsername) {
      navUsername.textContent = userData.username || userData.name || "User";
    }
    if (navAvatar) {
      if (
        userData.profile_image &&
        typeof userData.profile_image === "string"
      ) {
        navAvatar.src = userData.profile_image;
      } else if (userData.profile_image && userData.profile_image.url) {
        navAvatar.src = userData.profile_image.url;
      } else {
        navAvatar.src = "images/profile.jpg";
      }
      navAvatar.alt = userData.username || "User Avatar";
    }
    console.log("Navbar updated - User logged in", userData.username);
  } else {
    // user not logged in
    if (authLinks) authLinks.style.display = "none";
    if (guestLinks) guestLinks.style.display = "flex";

    console.log("Navbar updated - Guest User");
  }

  // toggleAddPostButton();
}

// Load Navbar
export async function loadNavbar() {
  const navContainer = document.getElementById("navbarContainer");
  if (!navContainer) {
    console.warn("Navbar container not found");
    return;
  }

  try {
    const response = await fetch("navbar.html");
    if (!response.ok) throw new Error("Failed to load navbar");

    const navHTML = await response.text();
    navContainer.innerHTML = navHTML;
    console.log("Navbar loaded successfully");

    initThemeToggle();

    // Update Navabar Data after loading Nav conten
    updateNavbar();

    initMobileMenu();

    const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
    if (confirmLogoutBtn) {
      confirmLogoutBtn.addEventListener("click", handleLogout);
    }
    const cancelLogoutBtn = document.getElementById("cancelBtn");
    if (cancelLogoutBtn) {
      cancelLogoutBtn.addEventListener("click", logoutConfimation);
    }
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logout);
    }

    const userInfo = document.getElementById("userInfo");
    if (userInfo) {
      userInfo.addEventListener("click", () => {
        window.location.href = "profile.html";
      });
    }
  } catch (error) {
    console.log("Error loading navbar:", error);
  }
}
export function logout() {
  document.getElementById("cofirmLogout").classList.add("show");
  document.body.style.overflow = "hidden"; // lock background scroll (focus only on the modal)
}

export function handleLogout() {
  localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
  showSuccessMessage("logged out successfully!");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 2000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadNavbar);
} else {
  loadNavbar();
}
