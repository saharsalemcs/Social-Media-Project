import { CONFIG } from "./config.js";
import { initScrollToTop, showErrorMessage } from "./ui.js";
const defaultProfileImage = "images/profile.jpg";

let currentPage = 1;
let lastPage = 1;
let isLoading = false;

export function resetPagination() {
  currentPage = 0;
  lastPage = 1;
  const container = document.getElementById("postsWrapper");
  if (container) container.innerHTML = "";
}

export async function loadPosts(page = 1) {
  if (isLoading) return; // prevent duplicate loading..

  isLoading = true;

  try {
    const response = await axios.get(
      `${CONFIG.API_URL}/posts?limit=15&page=${page}`,
    );

    let posts = response.data.data;
    let meta = response.data.meta;

    currentPage = meta.current_page;
    lastPage = meta.last_page;

    let postHTML = "";
    for (let post of posts) {
      const postImage = getPostImage(post);

      // 🥰 لقد أتمم المحارب مهمته
      let profile_image = post.author.profile_image;
      if (typeof profile_image === "object" || !profile_image)
        profile_image = defaultProfileImage; // ✅✅

      postHTML += `
        <article class="post-card" data-id="${post.id}">
          <div class="post-header">
              <img class="profile-image" src=${profile_image} alt="profile-image" onerror="this.src='${defaultProfileImage}'"
              >
              <div>
                  <h2 class="user-name">${
                    post.author.username || "Unknown User"
                  }</h2>
                  <span class="post-time">${post.created_at}</span>
              </div>
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
    }
    const container = document.getElementById("postsWrapper");
    if (!container) return;
    container.insertAdjacentHTML("beforeend", postHTML);

    document.querySelectorAll(".post-card").forEach((card) => {
      card.addEventListener("click", () => {
        const postId = card.dataset.id;
        window.location.href = `post-details.html?id=${postId}`;
      });
    });

    console.log(`Page ${currentPage} loaded`);
  } catch (error) {
    console.log("Error loading posts:", error);
    showErrorMessage("Failed to load posts. Please try again later");
  } finally {
    isLoading = false;
  }
}

export function getPostImage(post) {
  if (post.image && typeof post.image === "string") {
    return `<img src="${post.image}" class="post-img" alt="post image">`;
  } else if (post.image && post.image.url) {
    return `<img src="${post.image.url}" class="post-img" alt="post image">`;
  }
  return "";
}
// infinite scroll >>
window.addEventListener("scroll", () => {
  const nearPageBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
  if (nearPageBottom && currentPage < lastPage) {
    loadPosts(currentPage + 1);
  }
});
document.addEventListener("DOMContentLoaded", () => {
  loadPosts(1);
  initScrollToTop();
});
