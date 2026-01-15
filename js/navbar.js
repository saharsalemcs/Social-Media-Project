// Update navbar fuction
function updateNavbar() {
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  const userData = JSON.parse(
    localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA)
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
}

// Load Navbar
async function loadNavbar() {
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

    // Update Navabar Data after loading Nav conten
    updateNavbar();
  } catch (error) {
    console.log("Error loading navbar:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadNavbar);
} else {
  loadNavbar();
}
window.updateNavbar = updateNavbar;
