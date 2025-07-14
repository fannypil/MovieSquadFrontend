"use client"

import React from "react";
import PostList from "../posts/PostList";
import EmptyState from "../EmptyState";

export default function PostsTabContent({ 
  posts = [], 
  currentUser, 
  viewedUser = null,
  onLikePost, 
  onViewProfile, 
  onPostDeleted, 
  onPostUpdated,
  isViewingOtherUser = false,
  isGroupContext = false,
  groupData = null,
  isGroupMember = false,
  isGroupAdmin = false
}) {
  const safePosts = Array.isArray(posts) ? posts : [];
  const displayUser = viewedUser || currentUser;

  const canViewGroupPosts = !isGroupContext || !groupData?.isPrivate || isGroupMember || isGroupAdmin;

  if (isGroupContext && groupData?.isPrivate && !canViewGroupPosts) {
    return (
      <EmptyState
        icon="lock"
        title="Private Group Content"
        description="This is a private group. Join the group to view posts and participate in discussions."
        showButton={false}
      />
    );
  }

  if (safePosts.length === 0) {
    if (isGroupContext) {
      return (
        <EmptyState
          icon="chat-text"
          title="No posts in this group yet"
          description={
            isGroupMember 
              ? "Be the first to share something with your group members!"
              : `No posts have been shared in ${groupData?.name || 'this group'} yet.`
          }
          showButton={false}
        />
      );
    } else {
      return (
        <EmptyState
          icon="chat-text"
          title="No posts yet"
          description={
            isViewingOtherUser 
              ? `${displayUser?.username || 'This user'} hasn't shared any posts yet.`
              : "Share your thoughts about movies to see them here!"
          }
          showButton={false}
        />
      );
    }
  }
  const getHeaderInfo = () => {
    if (isGroupContext) {
      return {
        title: `${groupData?.name || 'Group'} Posts`,
        description: `Posts shared in ${groupData?.name || 'this group'} by members`,
        icon: "chat-dots"
      };
    } else if (isViewingOtherUser) {
      return {
        title: `${displayUser?.username || 'User'}'s Posts`,
        description: `Posts shared by ${displayUser?.username || 'this user'}`,
        icon: "person-lines-fill"
      };
    } else {
      return {
        title: "Your Posts",
        description: "Your personal posts and thoughts",
        icon: "pencil-square"
      };
    }
  };
  const headerInfo = getHeaderInfo();
  return (
    <div>
      <div className="mb-4">
        <h5 className="text-white mb-1">
          <i className={`bi bi-${headerInfo.icon} me-2 text-warning`}></i>
          {headerInfo.title} ({safePosts.length})
        </h5>
        <p className="text-light small mb-0">
          {headerInfo.description}
        </p>
        
        {/* Group-specific info */}
        {isGroupContext && groupData && (
          <div className="d-flex align-items-center gap-3 mt-2">
            <small className="text-muted">
              <i className="bi bi-people me-1"></i>
              {groupData.members?.length || 0} members
            </small>
            {groupData.isPrivate && (
              <small className="text-warning">
                <i className="bi bi-lock-fill me-1"></i>
                Private Group
              </small>
            )}
            {isGroupMember && (
              <small className="text-success">
                <i className="bi bi-check-circle me-1"></i>
                You're a member
              </small>
            )}
          </div>
        )}
      </div>

      <PostList
        posts={safePosts}
        currentUser={currentUser}
        isGroupAdmin={isGroupAdmin}
        onPostDeleted={onPostDeleted}
        onPostUpdated={onPostUpdated}
        onLikePost={onLikePost}
        isGroupContext={isGroupContext}
        groupData={groupData}
      />
    </div>
  );
}