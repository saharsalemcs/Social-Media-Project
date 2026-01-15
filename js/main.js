const defaultProfileImage = "images/profile.jpg";

async function loadPosts() {
  try {
    const response = await axios.get(`${CONFIG.API_URL}/posts`);

    let posts = response.data.data;
    let postHTML = "";
    for (let post of posts) {
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
        <article class="post-card">
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
    const container = document.querySelector(".posts-container");
    if (!container) return;
    container.innerHTML = postHTML;

    console.log(`${posts.length} posts Loaded`);
  } catch (error) {
    console.log("Error loading posts:", error);
    document.querySelector(".posts-container").innerHTML = `
        <div style="padding: 20px; text-align: center; color: #c00;">
          ⚠️ Failed to load posts. Please try again later.
        </div>
      `;
  }
}

document.addEventListener("DOMContentLoaded", loadPosts);
