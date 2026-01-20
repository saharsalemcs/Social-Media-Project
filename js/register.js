import { CONFIG } from "./config.js";

const registerationForm = document.getElementById("registerationForm");
const profilePicInput = document.getElementById("profilePicture");
const profilePreview = document.getElementById("profilePreview");
const fullNameInput = document.getElementById("fullName");
const usernameInput = document.getElementById("userName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const termsCheckbox = document.getElementById("terms");
const createAccBtn = document.getElementById("createAccBtn");

// Profile picture preview
function previewPicture() {
  profilePicInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      profilePreview.style.backgroundImage = `url(${e.target.result})`;
      profilePreview.style.backgroundSize = "cover";
      profilePreview.style.backgroundPosition = "center";
      profilePreview.innerHTML = "";
    };
    reader.readAsDataURL(file);
  });
}

// password toggle
function passwordToggle() {
  const togglePasswordBtns = document.querySelectorAll(".toggle-password");
  togglePasswordBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const passwordInput = btn.previousElementSibling;
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      btn.classList.toggle("active");
    });
  });
}

// Registration Function
async function handleRegister(event) {
  if (event) event.preventDefault();

  const fullName = fullNameInput.value.trim();
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();
  const profilePicture = profilePicInput.files[0];

  // Validate all fields
  if (!fullName || !username || !email || !password || !confirmPassword) {
    alert("please fill in all fields!");
    return;
  }

  if (fullName.length < 3) {
    alert("full name must be at least 3 characters!");
  }

  if (username.length < 3) {
    alert("full name must be at least 3 characters!");
  }

  if (password.length < 6) {
    alert("password must be at leat 6 characters");
    return;
  }

  if (password !== confirmPassword) {
    alert("passwords do not match!");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    alert("please enter a valid email address!");
    return;
  }

  if (!termsCheckbox.checked) {
    alert("You must agree with Term & Conditions!");
    return;
  }

  // formData >> required for images
  const formData = new FormData();
  formData.append("name", fullName);
  formData.append("username", username);
  formData.append("password", password);
  formData.append("email", email);
  if (profilePicture) {
    formData.append("image", profilePicture);
  }

  if (createAccBtn) {
    createAccBtn.disabled = true;
    createAccBtn.textContent = "Creating Account...";
  }

  try {
    const response = await axios.post(`${CONFIG.API_URL}/register`, formData);
    console.log("successful registration ", response.data);

    const { token, user } = response.data;
    localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    alert("Account created successfully! Welcome");

    window.location.href = "index.html";
  } catch (error) {
    console.error("Registration error:", error);
  } finally {
    createAccBtn.disabled = false;
    createAccBtn.textContent = "Create Account";
  }
}

registerationForm.addEventListener("submit", handleRegister);

previewPicture();
passwordToggle();
