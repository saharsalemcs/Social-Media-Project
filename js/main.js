axios.get("https://tarmeezacademy.com/api/v1/posts").then((response) => {
  let posts = response.data.data;
  let postHTML = "";
  for (post of posts) {
    console.log(post);

    postHTML += `
            <div class="post-card">
            <div class="post-header">
                <img class="profile-image" src="${post.author.profile_image}" alt="profile-image">
                <div>
                    <h2 class="user-name">${post.author.username}</h2>
                    <span class="post-time">${post.created_at}</span>
                </div>
            </div>
            <div class="post-content">
                <p class="post-text">${post.body}</p>
                <img src="${post.image}" alt="" class="post-img">
            </div>
            <div class="post-comments">
                <i class="fa-regular fa-comment comments-icon"></i>
                <span class="comment-count">${post.comments_count}</span>
                <span class="comment-word">comments</span>
            </div>
        </div>
    `;
  }
  document.querySelector(".posts-container").innerHTML = postHTML;
});
