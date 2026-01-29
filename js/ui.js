// scroll to top button
export function initScrollToTop() {
  const scrollBtn = document.getElementById("scrollToTopBtn");

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      scrollBtn.classList.add("show");
    } else {
      scrollBtn.classList.remove("show");
    }
  });

  scrollBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

export function showSuccessMessage(message) {
  const notification = document.getElementById("notification");

  notification.textContent = message;
  notification.classList.remove("hidden", "error");
  notification.classList.add("success");

  setTimeout(() => {
    notification.classList.add("hidden");
  }, 3000);
}

export function showErrorMessage(message) {
  const notification = document.getElementById("notification");

  notification.textContent = message;
  notification.classList.remove("hidden", "success");
  notification.classList.add("error");

  setTimeout(() => {
    notification.classList.add("hidden");
  }, 3000);
}
export function logoutConfimation() {
  document.getElementById("cofirmLogout").classList.remove("show");
  document.body.style.overflow = "auto"; //  restore scrolling
}
