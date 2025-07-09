import React from "react";
import EmptyState from "../EmptyState";
import PostList from "../posts/PostList";
import TabsWrapper from "../TabsWrapper";

export default function ProfileTabs({ activeTab, onTabChange, userPosts }) {
  const tabs = [
    { value: "posts", label: `Posts (${userPosts.length})` },
    { value: "reviews", label: "Reviews" },
    { value: "watchlist", label: "Watchlist" },
    { value: "favorites", label: "Favorites" },
  ];

  return (
    <TabsWrapper tabs={tabs} activeTab={activeTab} onTabChange={onTabChange}>
      {activeTab === "posts" && (
        userPosts.length > 0 ? <PostList posts={userPosts} /> : <EmptyState text="No posts yet" />
      )}

      {activeTab === "reviews" && (
        <EmptyState text="No reviews yet" />
      )}

      {activeTab === "watchlist" && (
        <EmptyState text="Watchlist is empty" />
      )}

      {activeTab === "favorites" && (
        <EmptyState text="No favorites yet" />
      )}
    </TabsWrapper>
  );
}
