import { CONFIG } from "./config.js";
import { showSuccessMessage, showErrorMessage } from "./ui.js";

let currentEditPostId = null;
let currentDeletePostId = null;

let editPostModal;
let editImageInput;
let editImagePreview;
let hasOriginalImage = false; // ✅ عشان نعرف لو البوست كان فيه صورة أصلاً
// Open Edit Modal
function openEditModal(postId, title, body, imageUrl = null) {
  currentEditPostId = postId;
  hasOriginalImage = !!imageUrl; // ✅ حفظ حالة الصورة الأصلية

  // Initialize elements
  editPostModal = document.getElementById("editModal");
  editImageInput = document.getElementById("editPostImage");
  editImagePreview = document.getElementById("editImagePreview");

  // fill fields with current data
  document.getElementById("editTitle").value = title || "";
  document.getElementById("editBody").value = body || "";

  // ✅ Handle image preview
  if (imageUrl && editImagePreview) {
    // لو فيه صورة أصلاً - اعرضها
    editImagePreview.innerHTML = `
      <div class="image-wrapper">
        <img src="${imageUrl}" alt="Post image">
        <button type="button" class="remove-image-btn" id="removeEditImageBtn">×</button>
      </div>
    `;
    editImagePreview.classList.add("has-image");

    // Disable input while image is showing
    if (editImageInput) {
      editImageInput.style.pointerEvents = "none";
    }

    // Add remove button listener
    const removeBtn = document.getElementById("removeEditImageBtn");
    if (removeBtn) {
      removeBtn.addEventListener("click", removeEditImage);
    }
  } else {
    // لو مفيش صورة - اعرض upload placeholder
    resetEditImagePreview();
  }

  // Attach image change listener
  if (editImageInput) {
    editImageInput.removeEventListener("change", handleEditImagePreview);
    editImageInput.addEventListener("change", handleEditImagePreview);
  }

  editPostModal.classList.add("show");
  document.body.style.overflow = "hidden"; // stop scrolling on the backgorund (focus only on the modal)
}

// Open Delete Modal
function openDeleteModal(postId) {
  currentDeletePostId = postId;
  const deleteModal = document.getElementById("deleteModal");
  if (deleteModal) {
    deleteModal.classList.add("show");
    document.body.style.overflow = "hidden"; // stop scrolling on the backgorund (focus only on the modal)
  }
}
// Close Edit Modal
function closeEditModal() {
  if (!editPostModal) return;

  editPostModal.classList.add("closing");

  setTimeout(() => {
    editPostModal.classList.remove("show");
    editPostModal.classList.remove("closing");
    document.body.style.overflow = "auto";

    // Reset form
    const editForm = document.getElementById("editPostForm");
    if (editForm) editForm.reset();

    resetEditImagePreview();
    currentEditPostId = null;
    hasOriginalImage = false;
  }, 300);
}
// ✅ Handle Image Preview for Edit Modal
function handleEditImagePreview(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    if (editImagePreview) {
      editImagePreview.innerHTML = `
        <div class="image-wrapper">
          <img src="${e.target.result}" alt="Preview">
          <button type="button" class="remove-image-btn" id="removeEditImageBtn">×</button>
        </div>
      `;
      editImagePreview.classList.add("has-image");

      // Disable input after adding photo
      if (editImageInput) {
        editImageInput.style.pointerEvents = "none";
      }

      const removeImageBtn = document.getElementById("removeEditImageBtn");
      if (removeImageBtn) {
        removeImageBtn.addEventListener("click", removeEditImage);
      }
    }
  };
  reader.readAsDataURL(file);
}
// ✅ Remove Image from Edit Modal
function removeEditImage() {
  if (!editImagePreview || !editImageInput) return;

  editImageInput.value = "";
  editImageInput.style.pointerEvents = "auto";

  resetEditImagePreview();
}

// ✅ Reset Image Preview to Default State
function resetEditImagePreview() {
  if (!editImagePreview) return;

  // ✅ لو البوست كان فيه صورة أصلاً - اعرض "Change image"
  // ✅ لو مكنش فيه صورة - اعرض "Click to upload image"
  const uploadText = hasOriginalImage
    ? "Change image"
    : "Click to upload image";

  editImagePreview.innerHTML = `
    <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Upload icon">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
      </path>
    </svg>
    <span class="upload-text">${uploadText}</span>
  `;
  editImagePreview.classList.remove("has-image");
}

// Close Delete Modal
function closeDeleteModal() {
  const deleteModal = document.getElementById("deleteModal");
  if (!deleteModal) return;

  deleteModal.classList.add("closing");

  setTimeout(() => {
    deleteModal.classList.remove("show");
    deleteModal.classList.remove("closing");
    document.body.style.overflow = "auto"; //  restore scrolling
    currentDeletePostId = null;
  }, 300);
}
// Save Changes
async function saveEditedPost(e, reloadCallback) {
  e.preventDefault();

  const title = document.getElementById("editTitle").value.trim();
  const body = document.getElementById("editBody").value.trim();
  if (!body) {
    showErrorMessage("Please write something!");
    return;
  }
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  if (!token) return;

  // ✅ عرّفي الـ submitBtn صح
  const submitBtn = document.querySelector(
    "#editPostForm button[type='submit']",
  );

  // Prevent duplicate requests
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
  }

  try {
    // ✅ Prepare FormData (للصور والنصوص)
    const formData = new FormData();
    formData.append("_method", "put"); // ✅ مهم جداً! عشان الـ API يفهم إنه PUT request
    if (title) formData.append("title", title);
    formData.append("body", body);

    // ✅ لو اليوزر اختار صورة جديدة
    const image = editImageInput ? editImageInput.files[0] : null;
    if (image) {
      formData.append("image", image);
    }

    await axios.post(`${CONFIG.API_URL}/posts/${currentEditPostId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // لا تضيف Content-Type - axios هيحددها تلقائياً للـ FormData
      },
    });

    showSuccessMessage("Post updated successfully!");

    closeEditModal();

    if (reloadCallback) await reloadCallback();
  } catch (error) {
    showErrorMessage("Failed to update post!");
    console.log("Failed to update post!", error);
    // ✅ اطبعي الـ error عشان نشوف المشكلة
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Save Changes";
    }
  }
}
// Confirm Delete
async function confirmDelete(reloadCallback) {
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  if (!token) return;

  const deleteBtn = document.querySelector("#deleteModal .btn-delete");

  if (deleteBtn) {
    deleteBtn.disabled = true;
    deleteBtn.textContent = "Deleting...";
  }

  try {
    await axios.delete(`${CONFIG.API_URL}/posts/${currentDeletePostId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    showSuccessMessage("Post deleted successfully!");
    closeDeleteModal();

    if (reloadCallback) await reloadCallback();
  } catch (error) {
    console.error("Failed to delete post!", error);
    showErrorMessage("Failed to delete post!");
  } finally {
    if (deleteBtn) {
      deleteBtn.disabled = false;
      deleteBtn.textContent = "Delete";
    }
  }
}
// Initialize Modal Event Listeners
function initModalListeners(reloadCallback) {
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

  // Close on backdrop click
  document.addEventListener("click", (e) => {
    if (e.target.id === "editModal") {
      closeEditModal();
    }
    if (e.target.id === "deleteModal") {
      closeDeleteModal();
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeEditModal();
      closeDeleteModal();
    }
  });
}
export {
  openEditModal,
  openDeleteModal,
  closeEditModal,
  closeDeleteModal,
  saveEditedPost,
  confirmDelete,
  initModalListeners,
};
