import { CONFIG } from "./config.js";
import { initScrollToTop, showSuccessMessage, showErrorMessage } from "./ui.js";
const defaultProfileImage = "images/profile.jpg";

let currentEditPostId = null;
let currentDeletePostId = null;

// get user's id
function getUserId() {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id");
  if (userId) {
    return userId;
  }

  const userData = JSON.parse(
    localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA),
  );
  if (!userData) {
    console.log("No user logged in, login first!");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    return null;
  }

  return userData.id;
}

// Load user profile info
async function loadUserProfile() {
  const userId = getUserId();

  if (!userId) return;

  try {
    const response = await axios.get(`${CONFIG.API_URL}/users/${userId}`);
    const user = response.data.data;

    document.title = `${user.username} - Profile`;

    // Update user info
    document.getElementById("profileName").textContent =
      user.name || user.username;
    document.getElementById("profileUsername").textContent =
      `@${user.username}`;
    if (user.email) {
      document.getElementById("profileEmail").textContent = user.email;
    } else {
      document.getElementById("profileEmail").textContent = "No email provided";
    }

    // Update user avatar
    const profileAvatar = document.getElementById("profileAvatar");
    if (user.profile_image) {
      if (typeof user.profile_image === "string") {
        profileAvatar.src = user.profile_image;
      } else if (user.profile_image.url) {
        profileAvatar.src = user.profile_image.url;
      } else {
        profileAvatar.src = defaultProfileImage;
      }
    } else {
      profileAvatar.src = defaultProfileImage;
    }

    // Update user stats
    document.getElementById("postsCount").textContent = user.posts_count || 0;
    document.getElementById("commentsCount").textContent =
      user.comments_count || 0;

    console.log("Profile loaded successfully");
  } catch (error) {
    console.error("Error loading profile info: ", error);
    showErrorMessage("Failed to load profile. Please try again later");
  }
}

// Load user posts
async function loadUserPosts() {
  const userId = getUserId();
  if (!userId) return;

  // if user logged in
  const currentUserData = JSON.parse(
    localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA),
  );
  const isOwnProfile = currentUserData && currentUserData.id == userId;

  try {
    const response = await axios.get(`${CONFIG.API_URL}/users/${userId}/posts`);
    const userPosts = response.data.data;
    // console.log("User posts:", userPosts);

    if (userPosts.length === 0) {
      document.getElementById("userPostsContainer").innerHTML = `
      <div class="emptyposts-container">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label="empty-icon">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="9" y1="9" x2="15" y2="15"></line>
        <line x1="15" y1="9" x2="9" y2="15"></line>
      </svg>
      <p class="empty-text">No posts yet</p>
      <p class="empty-subtext">Start sharing your thoughts</p>
    </div>
    `;
      return;
    }

    let postHTML = "";
    for (let post of userPosts) {
      console.log(post);
      let profileImage;
      if (
        post.author.profile_image &&
        typeof post.author.profile_image === "string"
      ) {
        profileImage = post.author.profile_image;
      } else if (post.author.profile_image && post.author.profile_image.url) {
        profileImage = post.author.profile_image.url;
      } else {
        profileImage = defaultProfileImage;
      }

      let postImage = "";
      if (post.image && typeof post.image === "string") {
        postImage = `<img src="${post.image}" class="post-img" alt="post image">`;
      } else if (post.image && post.image.url) {
        postImage = `<img src="${post.image.url}" class="post-img" alt="post image">`;
      }

      const actionButtons = isOwnProfile
        ? `

      <div class="post-actions">
        <button class="action-btn edit-btn" data-id="${post.id}" data-title="${post.title || ""}" data-body="${post.body || ""}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete-btn" id="deleteBtn" data-id="${post.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      `
        : "";

      postHTML += `
      <article class="post-card" data-id="${post.id}">
        <div class="post-header">
            <img class="profile-image" src="${profileImage}" alt="profile-image">
            <div>
                <h2 class="user-name">${post.author.username || "Unknown User"}</h2>
                <span class="post-time">${post.created_at}</span>
            </div>
            ${actionButtons}
        </div>
        <div class="post-content">
        ${post.title ? `<h3 class="post-title">${post.title}</h3>` : ""}
        <p class="post-text">${post.body || ""}</p>
        ${postImage}
        </div>
        <div class="post-comments">
            <i class="fa-regular fa-comment comments-icon"></i>
            <span class="comment-count">${post.comments_count}</span>
            <span class="comment-word">comments</span>
        </div>
      </article>
      `;
    }

    const userPostsContainer = document.getElementById("userPostsContainer");
    if (!userPostsContainer) return;
    userPostsContainer.innerHTML = postHTML;

    attachPostEventListeners();

    console.log(`${userPosts.length} Posts loaded`);
  } catch (error) {
    console.error("Error loading posts", error);
    showErrorMessage("Error loading posts");
  }
}
function attachPostEventListeners() {
  document.querySelectorAll(".post-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      const postId = card.dataset.id;
      window.location.href = `post-details.html?id=${postId}`;
    });
  });
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const postId = this.dataset.id;
      const title = this.dataset.title;
      const body = this.dataset.body;
      openEditModal(postId, title, body);
    });
  });
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const postId = this.dataset.id;
      openDeleteModal(postId);
    });
  });
}

// Open Edit Modal
export function openEditModal(postId, title, body) {
  currentEditPostId = postId;
  // fill fields with current data
  document.getElementById("editTitle").value = title || "";
  document.getElementById("editBody").value = body || "";

  document.getElementById("editModal").classList.add("show");
  document.body.style.overflow = "hidden"; // stop scrolling on the backgorund (focus only on the modal)
}
// Close Edit Modal
export function closeEditModal() {
  document.getElementById("editModal").classList.remove("show");
  currentEditPostId = null;
  document.body.style.overflow = "auto"; // allow scrolling againn
}

// Save Changes
async function saveEditedPost(e) {
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

    await loadUserPosts();
  } catch (error) {
    showErrorMessage("Failed to update post!");
    console.log("Failed to update post!", error);
  }
}

// Open Delete Modal
export function openDeleteModal(postId) {
  currentDeletePostId = postId;
  document.getElementById("deleteModal").classList.add("show");
  document.body.style.overflow = "hidden"; // stop scrolling on the backgorund (focus only on the modal)
}
// Close Delete Modal
export function closeDeleteModal() {
  document.getElementById("deleteModal").classList.remove("show");
  currentDeletePostId = null;
  document.body.style.overflow = "auto"; //  restore scrolling
}
// Confirm Delete
async function confirmDelete() {
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  if (!token) return;

  try {
    await axios.delete(`${CONFIG.API_URL}/posts/${currentDeletePostId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    showSuccessMessage("Post deleted successfully!");
    closeDeleteModal();

    await loadUserPosts();
    await loadUserProfile();
  } catch (error) {
    console.log("Failed to delete post!", error);
    showErrorMessage("Failed to delete post!");
  }
}
function attachModalEventListeners() {
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
    editForm.addEventListener("submit", saveEditedPost);
  }

  const deleteConfirmBtn = document.querySelector("#deleteModal .btn-delete");
  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener("click", confirmDelete);
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
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  loadUserPosts();
  attachModalEventListeners();
  initScrollToTop();
});
