import { CONFIG } from "./config.js";
import { loadPosts } from "./main.js";
import { showSuccessMessage, showErrorMessage } from "./ui.js";
// import { initThemeToggle } from "./theme.js";

let addPostBtn;
let addPostModal;
let closeModalBtn;
let cancelAddPostBtn;
let submitBtn;
let addPostForm;
let postImageInput;
let imagePreview;

// Load Modal HTML
async function loadPostModal() {
  const modalContainer = document.getElementById("addPostModalContainer");
  if (!modalContainer) {
    console.warn("Modal container not found!");
    return;
  }
  try {
    const response = await fetch("create-post.html");
    if (!response.ok) throw new Error(`error! status: ${response.status}`);

    const modalHTML = await response.text();
    modalContainer.innerHTML = modalHTML;
    console.log("Post Modal loaded successfully!");

    // after loading بقا
    initializeModalElements();
    attachEventListeners();
  } catch (error) {
    console.error("error loading post modal!");
    showErrorMessage("error loading post modal!");
  }
}

function initializeModalElements() {
  addPostBtn = document.querySelector(".add-post-btn");
  addPostModal = document.getElementById("addPostModal");
  closeModalBtn = document.getElementById("closeModal");
  cancelAddPostBtn = document.getElementById("cancelAddPostBtn");
  submitBtn = document.getElementById("submitBtn");
  addPostForm = document.getElementById("addPostForm");
  postImageInput = document.getElementById("postImage");
  imagePreview = document.getElementById("imagePreview");
}

function attachEventListeners() {
  if (addPostBtn) addPostBtn.addEventListener("click", openModal);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (cancelAddPostBtn) cancelAddPostBtn.addEventListener("click", closeModal);
  if (addPostForm) addPostForm.addEventListener("submit", handleCreatePost);
  if (postImageInput)
    postImageInput.addEventListener("change", handlePostImagePreview);
  if (addPostModal)
    addPostModal.addEventListener("click", function (event) {
      if (event.target === addPostModal) closeModal();
    });
  document.addEventListener("keydown", function (event) {
    if (
      event.key === "Escape" &&
      addPostModal &&
      addPostModal.classList.contains("show")
    ) {
      closeModal();
    }
  });
}

// Check if the user logged in or not to show/hide add post button
export function toggleAddPostBtn() {
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  const addPostContainer = document.querySelector(".add-post-container");

  // check for the display/UI not for security
  if (token) {
    if (addPostContainer) addPostContainer.style.display = "block";
  } else {
    if (addPostContainer) addPostContainer.style.display = "none";
  }
}

// Open new post modal
function openModal() {
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  // check for security and login if any synario happened in login but the btn still exist
  if (!token) {
    showErrorMessage("please login first!");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
    return;
  }

  addPostModal.classList.add("show");
  document.body.style.overflow = "hidden"; // stop scrolling on the backgorund (focus only on the modal)
}

// close post modal
function closeModal() {
  if (!addPostModal) return;

  addPostModal.classList.add("closing");

  setTimeout(() => {
    addPostModal.classList.remove("show");
    addPostModal.classList.remove("closing");
    document.body.style.overflow = "auto"; // allow scrolling againn

    // reset the form
    addPostForm.reset();
    removePostImage();
  }, 300);
}

// Image Preview
function handlePostImagePreview(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    if (imagePreview) {
      imagePreview.innerHTML = `
        <div class="image-wrapper">
          <img src="${e.target.result}" alt="Preview">
          <button type="button" class="remove-image-btn" id="removeImageBtn">×</button>
        </div>
      `;
      imagePreview.classList.add("has-image");
      // after adding photo => disable input
      if (postImageInput) {
        postImageInput.style.pointerEvents = "none";
      }
      const removeImageBtn = document.getElementById("removeImageBtn");
      if (removeImageBtn) {
        removeImageBtn.addEventListener("click", removePostImage);
      }
    }
  };
  reader.readAsDataURL(file);
}

function removePostImage() {
  if (!imagePreview || !postImageInput) return;

  postImageInput.value = "";
  postImageInput.style.pointerEvents = "auto";
  imagePreview.innerHTML = `
  <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Upload icon">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
    </path>
  </svg>
  <span class="upload-text">Click to upload image</span>
  `;

  imagePreview.classList.remove("has-image");
}

// Create POst
async function handleCreatePost(event) {
  if (event) event.preventDefault();

  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  if (!token) {
    showErrorMessage("please login first!");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
    return;
  }

  // fetch form data
  const title = document.getElementById("postTitle").value.trim();
  const body = document.getElementById("postBody").value.trim();
  const image = postImageInput ? postImageInput.files[0] : null;

  // validation
  if (!body || body.trim() === "") {
    showErrorMessage("please write something in post body!");
    return;
  }

  // prepare data
  const formData = new FormData();
  if (title) formData.append("title", title);
  formData.append("body", body);
  if (image) formData.append("image", image);

  // prevent duplicate requests
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Posting...";
  }

  // send post data to server
  try {
    const response = await axios.post(`${CONFIG.API_URL}/posts`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("post created", response.data.data);
    showSuccessMessage("post created successfully!");

    closeModal();

    loadPosts();
  } catch (error) {
    console.error("Error creating post:", error);
    showErrorMessage("Error creating post");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Post";
    }
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  await loadPostModal();
  // initThemeToggle();
  toggleAddPostBtn();
});
