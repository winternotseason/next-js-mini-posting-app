"use client";

import { togglePostLikeStatus } from "@/actions/posts";
import { formatDate } from "@/lib/format";
import LikeButton from "./like-icon";
import { useOptimistic } from "react";

function Post({ post, action }) {
  return (
    <article className="post">
      <div className="post-image">
        <img src={post.image} alt={post.title} />
      </div>
      <div className="post-content">
        <header>
          <div>
            <h2>{post.title}</h2>
            <p>
              Shared by {post.userFirstName} on{" "}
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </p>
          </div>
          <div>
            <form
              action={action.bind(null, post.id)}
              className={post.isLiked ? "liked" : ""}
            >
              <LikeButton />
            </form>
          </div>
        </header>
        <p>{post.content}</p>
      </div>
    </article>
  );
}

export default function Posts({ posts }) {
  if (!posts || posts.length === 0) {
    return <p>There are no posts yet. Maybe start sharing some?</p>;
  }
  const [optimisticPosts, updateOptimisticPosts] = useOptimistic(
    posts,
    (prevPosts, updatedPostId) => {
      const updatedPostIndex = prevPosts.findIndex(
        (post) => post.id === updatedPostId
      );
      if (updatedPostIndex === -1) {
        return prevPosts;
      }
      const updatedPost = { ...prevPosts[updatedPostIndex] };
      
      updatedPost.likes = updatedPost.likes + (updatedPost.isLiked ? -1 : 1);
      
      // 이미 좋아요가 눌러있다면 취소시키고, 아니라면 좋아요 눌러지게
      updatedPost.isLiked = !updatedPost.isLiked;

      // 업데이트
      const newPosts = [...prevPosts];
      newPosts[updatedPostIndex] = updatedPost;

      // optimisticPosts 반환
      return newPosts;
    }
  );
  async function updatePost(postId) {
    updateOptimisticPosts(postId);
    await togglePostLikeStatus(postId);
  }
  return (
    <ul className="posts">
      {optimisticPosts.map((post) => (
        <li key={post.id}>
          <Post post={post} action={updatePost} />
        </li>
      ))}
    </ul>
  );
}
