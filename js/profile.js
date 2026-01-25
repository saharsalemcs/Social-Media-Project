import { CONFIG } from "./config.js";
const defaultProfileImage = "images/profile.jpg";

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
    console.log("User profile data:", user);

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
    document.querySelector(".profile-section").innerHTML = `
        <div style="padding: 20px; text-align: center; color: #c00;">
          ⚠️ Failed to load profile. Please try again later.
        </div>
      `;
  }
}

// Load user posts
async function loadUserPosts() {
  const userId = getUserId();
  if (!userId) return;

  try {
    const response = await axios.get(`${CONFIG.API_URL}/users/${userId}/posts`);
    const userPosts = response.data.data;
    console.log("User posts:", userPosts);

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

      postHTML += `
      <article class="post-card" data-id="${post.id}">
        <div class="post-header">
            <img class="profile-image" src="${profileImage}" alt="profile-image"
            >
            <div>
                <h2 class="user-name">${
                  post.author.username || "Unknown User"
                }</h2>
                <span class="post-time">${post.created_at}</span>
            </div>
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

    document.querySelectorAll(".post-card").forEach((card) => {
      card.addEventListener("click", () => {
        const postId = card.dataset.id;
        window.location.href = `post-details.html?id=${postId}`;
      });
    });

    console.log(`${userPosts.length} Posts loaded`);
  } catch (error) {
    console.error("Error loading posts", error);
    document.querySelector(".posts-section").innerHTML = `
        <div style="padding: 20px; text-align: center; color: #c00;">
          ⚠️ Failed to load posts. Please try again later.
        </div>
      `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  loadUserPosts();
});
