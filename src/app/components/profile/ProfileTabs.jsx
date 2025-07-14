"use client"

import React, { useState } from "react";
import GroupMembersContent from "../groups/GroupMembersContent";
import PostsTabContent from "../tabs/PostsTabContent";
import FriendsTabContent from "../tabs/FriendsTabContent";
import WatchlistContent from "./WatchlistContent";
import TabsWrapper from "../TabsWrapper";
import GroupListPage from "@/app/pages/GroupListPage";

export default function ProfileTabs({ 
  activeTab, 
  onTabChange, 
  userPosts = [], 
  userGroups = [], 
  userFriends = [],
  userCollections = { favoriteMovies: [], watchedContent: [] },
  onLikePost, 
  currentUser, 
  viewedUser = null, // The user whose profile is being viewed
  onViewProfile, 
  onViewGroup,
  onGroupJoined, 
  onPostDeleted,
  onPostUpdated,
  isGroupView = false, 
  groupData = null,
  isOwnProfile = true,
  isViewingOtherUser = false // Flag to indicate viewing another user's profile
}) {
  const [friendsCount, setFriendsCount] = useState(0);

  const safePosts = Array.isArray(userPosts) ? userPosts : [];
  const safeGroups = Array.isArray(userGroups) ? userGroups : [];
  const safeFriends = Array.isArray(userFriends) ? userFriends : [];

  // Use viewedUser data if viewing another user, otherwise use currentUser
  const profileUser = viewedUser || currentUser;
  const collectionsData = isViewingOtherUser ? userCollections : {
    favoriteMovies: currentUser?.favoriteMovies || [],
    watchedContent: currentUser?.watchedContent || []
  };

  // Different tabs for group view vs profile view
  const tabs = isGroupView ? [
    {
      id: "posts",
      label: "Posts",
      icon: <i className="bi bi-pencil-square"></i>,
      count: safePosts.length
    },
    {
      id: "members",
      label: "Members",
      icon: <i className="bi bi-people-fill"></i>,
      count: groupData?.members?.length || 0
    },
    {
      id: "watchlist",
      label: "Shared Watchlist",
      icon: <i className="bi bi-camera-reels"></i>,
      count: 0 // TODO: Implement shared watchlist
    }
  ] : [
    {
      id: "posts",
      label: "Posts",
      icon: <i className="bi bi-pencil-square"></i>,
      count: safePosts.length
    },
    {
      id: "friends",
      label: "Friends",
      icon: <i className="bi bi-people"></i>, 
      count: isViewingOtherUser ? safeFriends.length : (currentUser?.friends?.length || 0)
    },
    {
      id: "groups",
      label: "Groups",
      icon: <i className="bi bi-collection"></i>,
      count: safeGroups.length
    },
    {
      id: "favorites",
      label: "Collections",
      icon: <i className="bi bi-heart-fill"></i>,
      count: (collectionsData.favoriteMovies?.length || 0) + (collectionsData.watchedContent?.length || 0)
    }
  ];

  const renderTabContent = () => {
    if (isGroupView) {
      // Group view tabs (unchanged)
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
              isGroupContext={true}
              groupData={groupData}
              isGroupMember={groupData?.isGroupMember || false}
              isGroupAdmin={groupData?.isGroupAdmin || false}
            />
          );
        case "members":
          return (
            <GroupMembersContent
              group={groupData?.group}
              members={groupData?.members || []}
              currentUser={currentUser}
            />
          );
        case "watchlist":
          return (
            <div className="text-center py-5">
              <div className="text-muted">
                <i className="bi bi-camera-reels display-4 mb-3"></i>
                <p className="text-white">Shared Watchlist coming soon!</p>
              </div>
            </div>
          );
        default:
          return null;
      }
    } else { 
      // Profile view tabs 
      switch (activeTab) {
        case "posts":
          return (
            <PostsTabContent
              posts={safePosts}
              currentUser={currentUser}
              viewedUser={profileUser}
              onLikePost={onLikePost}
              onViewProfile={onViewProfile}
              onPostDeleted={isOwnProfile ? onPostDeleted : null}
              onPostUpdated={isOwnProfile ? onPostUpdated : null}
              isViewingOtherUser={isViewingOtherUser}
            />
          );
        case "friends":
          return (
            <FriendsTabContent
              currentUser={currentUser}
              onViewProfile={onViewProfile}
              userId={isViewingOtherUser ? profileUser?._id : null} // Pass userId for other users
            />
          );
        case "groups":
          return isViewingOtherUser ? (
            // Simple group list for other users
            <div>
              {safeGroups.length === 0 ? (
                <div className="glass-card text-center py-5 my-4">
                  <div className="text-warning mb-3" style={{ fontSize: '3rem' }}>
                    <i className="bi bi-people"></i>
                  </div>
                  <h5 className="text-white mb-2">No groups yet</h5>
                  <p className="text-light mb-0">
                    {profileUser?.username || 'This user'} hasn't joined any groups yet.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <h5 className="text-white mb-0">
                      <i className="bi bi-people me-2 text-warning"></i>
                      {profileUser?.username || 'User'}'s Groups ({safeGroups.length})
                    </h5>
                    <p className="text-light small mt-1">Groups this user belongs to</p>
                  </div>
                  
                  <div className="row g-3">
                    {safeGroups.map(group => (
                      <div key={group._id} className="col-md-6 col-lg-4">
                        <div className="glass-card hover-lift h-100">
                          <div className="card-body">
                            <div className="d-flex align-items-center mb-3">
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)',
                                  color: '#fff',
                                  fontWeight: 'bold'
                                }}
                              >
                                {group.name?.[0]?.toUpperCase() || 'G'}
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="text-white mb-1">{group.name}</h6>
                                <small className="text-light opacity-75">
                                  {group.members?.length || 0} members
                                </small>
                              </div>
                            </div>
                            
                            {group.description && (
                              <p className="text-light small mb-3 opacity-75">
                                {group.description.length > 100 
                                  ? `${group.description.substring(0, 100)}...` 
                                  : group.description}
                              </p>
                            )}
                            
                            <button
                              className="btn btn-outline-warning btn-sm w-100"
                              onClick={() => onViewGroup && onViewGroup(group._id)}
                            >
                              <i className="bi bi-eye me-2"></i>
                              View Group
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Full GroupListPage for own profile
            <GroupListPage
              key="profile-groups-tab"
              defaultTab="my-groups" 
              isEmbedded={true}
              currentUser={currentUser}
              onViewGroup={onViewGroup}
              initialGroups={safeGroups}
              onGroupJoined={onGroupJoined}            
            />
          );
        case "favorites":
          return (
            <WatchlistContent 
              currentUser={currentUser}
              userId={isViewingOtherUser ? profileUser?._id : null} // Pass userId for other users
            />
          );
        default:
          return null;
      }
    }
  };

  return (
    <TabsWrapper
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      variant={isGroupView ? "group" : (isViewingOtherUser ? "user-profile" : "profile")}
    >
      {renderTabContent()}
    </TabsWrapper>
  );
}