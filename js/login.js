const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("userName");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const rememberMeCheckbox = document.getElementById("rememberMe");

// Check if username is saved when page loads
loadSavedUsername();

// Toggle password visibility
setupPasswordToggle();

// Login Function
function setupLogin() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // Validation
  if (!username || !password) {
    alert("Please fill in all fields!");
    return;
  }

  const params = {
    username: username,
    password: password,
  };

  axios
    .post("https://tarmeezacademy.com/api/v1/login", params)
    .then((response) => {
      console.log(response.data);

      // Handle Remember Me after successful login
      handleRememberMe();

      // Save authentication token
      const token = response.data.token;
      localStorage.setItem("authToken", token);
      console.log(token);

      // Show success message
      alert("Login successful!");

      // Redirect to home page
      // window.location.href = "index.html";
    })
    .catch((error) => {
      alert("Login Error: ", error);
    });
}

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  setupLogin();
});

// Handle Remeber Me checkbox change (if user unchecheked it)
rememberMeCheckbox.addEventListener("change", function () {
  if (!this.checked) {
    localStorage.removeItem("savedUsername");
    localStorage.removeItem("rememberMe");
    console.log("Remember Me disabled - data cleared");
  }
});

function handleRememberMe() {
  if (rememberMeCheckbox.checked) {
    localStorage.setItem("savedUsername", usernameInput.value);
    localStorage.setItem("rememberMe", "true");
    console.log("Username saved!");
  } else {
    localStorage.removeItem("savedUsername");
    localStorage.removeItem("rememberMe");
    console.log("Username cleared from storage");
  }
}

function loadSavedUsername() {
  const savedUsername = localStorage.getItem("savedUsername");
  const rememberMeStatus = localStorage.getItem("rememberMe");

  // if the username was saved, fill it in and check the checkbox
  if (savedUsername && rememberMeStatus === "true") {
    usernameInput.value = savedUsername;
    rememberMeCheckbox.checked = true;
  }
}

function setupPasswordToggle() {
  if (!passwordInput || !togglePasswordBtn) return;

  togglePasswordBtn.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
  });
}
