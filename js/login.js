import { CONFIG } from "./config.js";
import { toggleAddPostBtn } from "./posts.js";

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("userName");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const rememberMeCheckbox = document.getElementById("rememberMe");
const loginBtn = document.getElementById("loginBtn");

// Check if username is saved when page loads
window.addEventListener("DOMContentLoaded", loadSavedUsername);

// Toggle password visibility
setupPasswordToggle();

// Login Function
async function setupLogin(event) {
  if (event) event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Validation
  if (!username || !password) {
    alert("Please fill in all fields!");
    return;
  }

  // Loading state - prevent duplicate requests
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";
  }

  const params = {
    username: username,
    password: password,
  };

  try {
    const response = await axios.post(`${CONFIG.API_URL}/login`, params);
    console.log("Login successful:", response.data);

    const { token, user } = response.data;

    // Save authentication token
    localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    console.log("Token saved:", token);

    // Handle Remember Me after successful login
    handleRememberMe();

    passwordInput.value = "";

    // Show success message
    alert("Login successful!");

    toggleAddPostBtn();

    // Redirect to home page
    window.location.href = "index.html";
  } catch (error) {
    console.error("Login error:", error);
    passwordInput.value = "";
  } finally {
    // Remove Loading State
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  }
}

loginForm.addEventListener("submit", setupLogin);

// Handle Remeber Me checkbox change (if user unchecheked it)
rememberMeCheckbox.addEventListener("change", function () {
  if (!this.checked) {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.SAVED_USERNAME);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.REMEMBER_ME);
    console.log("Remember Me disabled - data cleared");
  }
});

function handleRememberMe() {
  if (rememberMeCheckbox.checked) {
    localStorage.setItem(
      CONFIG.STORAGE_KEYS.SAVED_USERNAME,
      usernameInput.value,
    );
    localStorage.setItem(CONFIG.STORAGE_KEYS.REMEMBER_ME, "true");
    console.log("Username saved!");
  } else {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.SAVED_USERNAME);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.REMEMBER_ME);
    console.log("Username cleared from storage");
  }
}

function loadSavedUsername() {
  const savedUsername = localStorage.getItem(
    CONFIG.STORAGE_KEYS.SAVED_USERNAME,
  );
  const rememberMeStatus = localStorage.getItem(
    CONFIG.STORAGE_KEYS.REMEMBER_ME,
  );

  // if the username was saved, fill it in and check the checkbox
  if (savedUsername && rememberMeStatus === "true") {
    usernameInput.value = savedUsername;
    rememberMeCheckbox.checked = true;
    console.log("Username restored from Remember Me");
  }
}

function setupPasswordToggle() {
  if (!passwordInput || !togglePasswordBtn) return;

  togglePasswordBtn.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    togglePasswordBtn.classList.toggle("active");
  });
}
