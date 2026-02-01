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

function initMobileMenu() {
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".nav-buttons");
  const menuOverlay = document.querySelector(".menu-overlay");

  if (!mobileMenuToggle || !navMenu) {
    console.warn("Mobile menu elements not found");
    return;
  }

  mobileMenuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  if (menuOverlay) {
    menuOverlay.addEventListener("click", () => {
      closeMobileMenu();
    });
  }

  navMenu.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (!el.classList.contains("theme-toggle")) {
        setTimeout(() => {
          closeMobileMenu();
        }, 200);
      }
    });
  });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      }
    }, 200);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("active")) {
      closeMobileMenu();
    }
  });
}

function toggleMobileMenu() {
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".nav-buttons");
  const menuOverlay = document.querySelector(".menu-overlay");

  if (!mobileMenuToggle || !navMenu) return;

  const isActive = navMenu.classList.contains("active");

  mobileMenuToggle.classList.toggle("active");
  navMenu.classList.toggle("active");

  if (menuOverlay) {
    if (!isActive) {
      menuOverlay.classList.add("active");
    } else {
      menuOverlay.classList.remove("active");
    }
  }

  // منع السكرول في الخلفية عند فتح القائمة
  document.body.style.overflow = isActive ? "" : "hidden";
}

function closeMobileMenu() {
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navMenu = document.querySelector(".nav-buttons");
  const menuOverlay = document.querySelector(".menu-overlay");

  if (!mobileMenuToggle || !navMenu) return;

  mobileMenuToggle.classList.remove("active");
  navMenu.classList.remove("active");
  document.body.style.overflow = "";

  if (menuOverlay) {
    menuOverlay.classList.remove("active");
  }
}

export { initMobileMenu, toggleMobileMenu, closeMobileMenu };
