"use client"

import React from "react";
import EmptyState from "../EmptyState";
import PostList from "../posts/PostList";


export default function PostsTabContent({ 
  posts, 
  currentUser, 
  onLikePost, 
  onViewProfile,
  onPostDeleted,
  onPostUpdated 
}) {
  const safePosts = Array.isArray(posts) ? posts : [];

  if (safePosts.length === 0) {
    return (
      <EmptyState
        icon="📝"
        title="No posts yet"
        description="Share your thoughts about movies to see them here!"
        showButton={false}
      />
    );
  }

  return (
    <PostList
      posts={safePosts}
      currentUser={currentUser}
      isGroupAdmin={false}
      onLikePost={onLikePost}
      onViewProfile={onViewProfile}
      onPostDeleted={onPostDeleted}
      onPostUpdated={onPostUpdated}
    />
  );
}