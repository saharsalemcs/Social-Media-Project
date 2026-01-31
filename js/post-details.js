import { CONFIG } from "./config.js";
import { getProfileImage, getPostImage } from "./main.js";
import { showSuccessMessage, showErrorMessage, initScrollToTop } from "./ui.js";
import { openEditModal, openDeleteModal } from "./profile.js";
const defaultProfileImage = "images/profile.jpg";

// get post id from url
function getPostIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}
function isMyPost(post) {
  const currentUser = JSON.parse(
    localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA),
  );
  if (!currentUser) return false;
  return post.author.id === currentUser.id;
}

async function loadPostDetails() {
  const postId = getPostIdFromURL();
  if (!postId) {
    console.error("Failed to get post ID from URL");
    return;
  }

  try {
    const response = await axios.get(`${CONFIG.API_URL}/posts/${postId}`);
    const post = response.data.data;
    console.log("Post loaded:", post);

    displayPost(post);

    displayComments(post.comments);

    // Show/hide add comment box (logged in or not)
    toggleAddCommentBox();
  } catch (error) {
    console.error("Error loading post details:", error);
    showErrorMessage("Error loading post details");
  }
}

function displayPost(post) {
  const postCard = document.getElementById("postCard");
  const profileImage = getProfileImage(post);
  const postImage = getPostImage(post);
  const postUsername = document.getElementById("postUsername");
  postUsername.textContent = `${post.author.username}'s`;
  const canEdit = isMyPost(post);
  const postActions = `
      <div class="post-actions">
      <button class="action-btn edit-btn" data-id="${post.id}" data-title="${post.title || ""}" data-body="${post.body || ""}">
        <i class="fas fa-edit"></i>
      </button>
      <button class="action-btn delete-btn" id="deleteBtn" data-id="${post.id}">
        <i class="fas fa-trash"></i>
      </button>
    </div>
    `;

  postCard.innerHTML = `
  <article class="post-card" data-id="${post.id}" data-user-id="${post.author.id}">
    <div class="post-header">
        <img class="profile-image" src="${profileImage}" alt="profile-image">
        <div>
          <h2 class="user-name">${post.author.username || "Unknown User"}</h2>
          <span class="post-time">${post.created_at}</span>
        </div>
        ${canEdit ? postActions : ""}
    </div>
    <div class="post-content" dir="auto">
    ${post.title ? `<h3 class="post-title">${post.title}</h3>` : ""}
        <p class="post-text">${post.body || ""}</p>
        ${postImage}
    </div>
    <div class="post-comments">
        <i class="fa-regular fa-comment comments-icon"></i>
        <span class="comment-count">${post.comments_count}</span>
        <span class="comment-word">${post.comments_count === 1 ? "comment" : "comments"}</span>
    </div>
  </article>
  `;

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const postId = btn.dataset.id;
      const title = btn.dataset.title;
      const body = btn.dataset.body;
      openEditModal(postId, title, body);
    });
  });
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const postId = btn.dataset.id;
      openDeleteModal(postId);
    });
  });
  const img = document.querySelector(".profile-image");
  const userName = document.querySelector(".user-name");
  const card = document.querySelector(".post-card");
  const userId = card.dataset.userId;
  img.addEventListener("click", () => {
    window.location.href = `profile.html?id=${userId}`;
  });
  userName.addEventListener("click", () => {
    window.location.href = `profile.html?id=${userId}`;
  });
}
function displayComments(comments) {
  const commentsList = document.getElementById("commentsList");
  const commentsCount = document.getElementById("commentsCount");
  const noComments = document.getElementById("noComments");

  commentsList.innerHTML = "";

  commentsCount.textContent = comments.length;
  if (comments.length === 0) {
    commentsList.style.display = "none";
    noComments.style.display = "block";
    return;
  }

  commentsList.style.display = "block";
  noComments.style.display = "none";

  // let commentsHTML = "";
  comments.forEach((comment) => {
    const authorImage = getAuthorImage(comment);

    commentsList.innerHTML += `
    <div class="comment-item">
      <img class="comment-avatar" src="${authorImage}" alt="${comment.author.username}">
      <div class="comment-content">
        <div class="comment-author">${comment.author.username}</div>
        <div class="comment-body" dir="auto">${comment.body}</div>
      </div>
    </div>
    `;
  });
  // commentsList.innerHTML = commentsHTML;
}
function toggleAddCommentBox() {
  const addCommentBox = document.getElementById("addCommentBox");
  const userAvatar = document.getElementById("userAvatar");
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  const userData = JSON.parse(
    localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA),
  );

  if (token && userData) {
    addCommentBox.style.display = "flex";

    if (userData.profile_image && typeof userData.profile_image === "string") {
      userAvatar.src = userData.profile_image;
    } else if (userData.profile_image && userData.profile_image.url) {
      userAvatar.src = userData.profile_image.url;
    } else {
      userAvatar.src = defaultProfileImage;
    }
  } else {
    addCommentBox.style.display = "none";
  }
}

// ADD COMMENT
async function handleAddComment(event) {
  event.preventDefault();

  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  const postId = getPostIdFromURL();
  const commentBody = document.getElementById("commentBody").value.trim();
  const sendBtn = document.getElementById("sendCommentBtn");

  if (!token) {
    showErrorMessage("please login to add comment!");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
    return;
  }

  if (!commentBody) {
    showErrorMessage("Please write a something!");
    return;
  }

  sendBtn.disabled = true;
  sendBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending...`;

  try {
    const response = await axios.post(
      `${CONFIG.API_URL}/posts/${postId}/comments`,
      { body: commentBody },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("comment added: ", response.data);
    showSuccessMessage("comment added successfully!");
    document.getElementById("commentBody").value = "";

    // reload post to get updated comments
    await loadPostDetails();
  } catch (error) {
    console.error("Error adding comment:", error);
    const message = error.response?.data?.message || "Failed to add comment";
    showErrorMessage(message);
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i>Comment`;
  }
}

function getAuthorImage(comment) {
  if (
    comment.author.profile_image &&
    typeof comment.author.profile_image === "string"
  ) {
    return comment.author.profile_image;
  } else if (comment.author.profile_image && comment.author.profile_image.url) {
    return comment.author.profile_image.url;
  } else {
    return defaultProfileImage;
  }
}

const addCommentForm = document.getElementById("addCommentForm");
if (addCommentForm) {
  addCommentForm.addEventListener("submit", handleAddComment);
}

document.addEventListener("DOMContentLoaded", function () {
  loadPostDetails();
  initScrollToTop();
});
