"use client"

import React, { useState } from "react";
import PostsTabContent from "../tabs/PostsTabContent";
import FriendsTabContent from "../tabs/FriendsTabContent";
import GroupsTabContent from "../tabs/GroupsTabContent";
import WatchlistContent from "./WatchlistContent";
import TabsWrapper from "../TabsWrapper";

export default function ProfileTabs({ 
  activeTab, 
  onTabChange, 
  userPosts = [], 
  onLikePost, 
  currentUser, 
  onViewProfile, 
  onViewGroup,
  onPostDeleted,
  onPostUpdated 
}) {
  const [friendsCount, setFriendsCount] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);
  
  const safePosts = Array.isArray(userPosts) ? userPosts : [];

  const tabs = [
    {
      id: "posts",
      label: "Posts",
      icon: "📝",
      count: safePosts.length
    },
    {
      id: "friends",
      label: "Friends",
      icon: "👥",
      count: currentUser?.friendsCount || 0
    },
    {
      id: "groups",
      label: "Groups",
      icon: "👥",
      count: groupsCount
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: "❤️",
      count: currentUser?.favoriteMovies?.length || 0
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return (
          <PostsTabContent
            posts={safePosts}
            currentUser={currentUser}
            onLikePost={onLikePost}
            onViewProfile={onViewProfile}
            onPostDeleted={onPostDeleted}
            onPostUpdated={onPostUpdated}
          />
        );
        
      case "friends":
        return (
          <FriendsTabContent
            currentUser={currentUser}
            onViewProfile={onViewProfile}
          />
        );
        
      case "groups":
        return (
          <GroupsTabContent
            currentUser={currentUser}
            onViewGroup={onViewGroup}
          />
        );
        
      case "favorites":
        return (
          <WatchlistContent 
            currentUser={currentUser} 
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <TabsWrapper
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      variant="profile"
    >
      {renderTabContent()}
    </TabsWrapper>
  );
}