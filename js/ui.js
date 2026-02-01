import { CONFIG } from "./config.js";

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
let currentEditPostId = null;
let currentDeletePostId = null;

// Open Edit Modal
export function openEditModal(postId, title, body) {
  currentEditPostId = postId;
  // fill fields with current data
  document.getElementById("editTitle").value = title || "";
  document.getElementById("editBody").value = body || "";

  document.getElementById("editModal").classList.add("show");
  document.body.style.overflow = "hidden"; // stop scrolling on the backgorund (focus only on the modal)
}

// Open Delete Modal
export function openDeleteModal(postId) {
  currentDeletePostId = postId;
  document.getElementById("deleteModal").classList.add("show");
  document.body.style.overflow = "hidden"; // stop scrolling on the backgorund (focus only on the modal)
}
// Close Edit Modal
export function closeEditModal() {
  document.getElementById("editModal").classList.remove("show");
  currentEditPostId = null;
  document.body.style.overflow = "auto"; // allow scrolling againn
}
// Close Delete Modal
export function closeDeleteModal() {
  document.getElementById("deleteModal").classList.remove("show");
  currentDeletePostId = null;
  document.body.style.overflow = "auto"; //  restore scrolling
}
// Save Changes
export async function saveEditedPost(e, reloadCallback) {
  e.preventDefault();

  const title = document.getElementById("editTitle").value.trim();
  const body = document.getElementById("editBody").value.trim();
  if (!body) {
    showErrorMessage("Please write something!");
    return;
  }
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  if (!token) return;

  try {
    await axios.put(
      `${CONFIG.API_URL}/posts/${currentEditPostId}`,
      { title: title || null, body },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    showSuccessMessage("Post updated successfully!");

    closeEditModal();

    if (reloadCallback) await reloadCallback();
  } catch (error) {
    showErrorMessage("Failed to update post!");
    console.log("Failed to update post!", error);
  }
}
// Confirm Delete
export async function confirmDelete(reloadCallback) {
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  if (!token) return;

  try {
    await axios.delete(`${CONFIG.API_URL}/posts/${currentDeletePostId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    showSuccessMessage("Post deleted successfully!");
    closeDeleteModal();

    if (reloadCallback) await reloadCallback();
  } catch (error) {
    console.log("Failed to delete post!", error);
    showErrorMessage("Failed to delete post!");
  }
}
// Initialize Modal Event Listeners
export function initModalListeners(reloadCallback) {
  const closeModalBtn = document.getElementById("closeModal");
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeEditModal);
  }

  const editCancelBtn = document.querySelector("#editModal .cancel-btn");
  if (editCancelBtn) {
    editCancelBtn.addEventListener("click", closeEditModal);
  }

  const editForm = document.getElementById("editPostForm");
  if (editForm) {
    editForm.addEventListener("submit", (e) =>
      saveEditedPost(e, reloadCallback),
    );
  }

  const deleteConfirmBtn = document.querySelector("#deleteModal .btn-delete");
  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener("click", () =>
      confirmDelete(reloadCallback),
    );
  }

  const deleteCancelBtn = document.querySelector("#deleteModal .btn-cancel");
  if (deleteCancelBtn) {
    deleteCancelBtn.addEventListener("click", closeDeleteModal);
  }

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      closeEditModal();
      closeDeleteModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeEditModal();
      closeDeleteModal();
    }
  });
}
export { initMobileMenu, toggleMobileMenu, closeMobileMenu };
