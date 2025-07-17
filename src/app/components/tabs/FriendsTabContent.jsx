"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/app/hooks/useAuth";
import FriendsList from "../friends/FriendsList";
import FriendRequests from "../friends/FriendRequests";
import UserSearch from "../friends/UserSearch";
import TabsWrapper from "../TabsWrapper";
import EmptyState from "../EmptyState";

export default function FriendsTabContent({
  currentUser,
  onViewProfile,
  userId = null, // If userId is provided, we're viewing another user's friends
}) {
  const { token } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState("friends");
  const [friendsCount, setFriendsCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [userFriends, setUserFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if we're viewing another user's profile
  const isViewingOtherUser =
    userId && userId !== currentUser?._id && userId !== currentUser?.id;

  useEffect(() => {
    if (isViewingOtherUser) {
      fetchUserFriends();
    }
  }, [userId, isViewingOtherUser]);

  const fetchUserFriends = async () => {
    if (!token || !userId) return;

    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://localhost:3001/api/user/profile/${userId}`,
        {
          headers: { "x-auth-token": token },
        }
      );

      setUserFriends(response.data.friends || []);
    } catch (error) {
      console.error("Error fetching user friends:", error);
      setUserFriends([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple tabs for other users (no subtabs)
  const otherUserTabs = [
    {
      id: "friends",
      label: "Friends",
      icon: <i className="bi bi-people"></i>,
      count: userFriends.length,
    },
  ];

  // Full tabs for own profile
  const ownProfileTabs = [
    {
      id: "friends",
      label: "Friends",
      icon: <i className="bi bi-people"></i>,
      count: currentUser?.friends?.length || 0,
    },
    {
      id: "requests",
      label: "Requests",
      icon: <i className="bi bi-person-fill-add"></i>,
      count: currentUser?.friendRequests?.length || 0,
      showBadge: requestsCount > 0,
    },
    {
      id: "search",
      label: "Find Friends",
      icon: <i className="bi bi-search"></i>,
    },
  ];

  const handleFriendsCountUpdate = (count) => {
    setFriendsCount(count);
  };

  const handleRequestsCountUpdate = (count) => {
    setRequestsCount(count);
  };
  const handleUserSelect = async (user) => {
    if (!user?._id || !token) return;
    try {
      // Send friend request to backend
      await axios.post(
        "http://localhost:3001/api/user/friends/request",
        { recipientId: user._id },
        { headers: { "x-auth-token": token } }
      );
      alert(`Friend request sent to ${user.username}!`);
    } catch (error) {
      const msg =
        error.response?.data?.message || "Failed to send friend request.";
      alert(msg);
    }
  };

  const renderContent = () => {
    // For other users, only show their friends list
    if (isViewingOtherUser) {
      if (isLoading) {
        return (
          <div className="text-center py-5">
            <div className="spinner-border text-warning mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-white">Loading friends...</p>
          </div>
        );
      }

      if (userFriends.length === 0) {
        return (
          <EmptyState
            icon="people"
            title="No friends to show"
            description="This user hasn't connected with anyone yet or their friends list is private."
            showButton={false}
          />
        );
      }

      return (
        <div>
          <div className="mb-4">
            <h5 className="text-white mb-1">
              <i className="bi bi-people me-2 text-warning"></i>
              Friends ({userFriends.length})
            </h5>
            <p className="text-light small mb-0">
              People connected with this user
            </p>
          </div>

          <div className="row g-3">
            {userFriends.map((friend) => (
              <div key={friend._id} className="col-md-6 col-lg-4">
                <div className="glass-card hover-lift h-100">
                  <div className="card-body text-center">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{
                        width: "60px",
                        height: "60px",
                        background: "linear-gradient(45deg, #f59e0b, #d97706)",
                        color: "#000",
                        fontWeight: "bold",
                        fontSize: "24px",
                      }}
                    >
                      {friend.username?.[0]?.toUpperCase() || "U"}
                    </div>

                    <h6 className="text-white mb-2">{friend.username}</h6>
                    <p className="text-light small mb-3 opacity-75">
                      {friend.email}
                    </p>

                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => onViewProfile && onViewProfile(friend._id)}
                    >
                      <i className="bi bi-person me-1"></i>
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // For own profile, show full functionality with subtabs
    switch (activeSubTab) {
      case "friends":
        return (
          <FriendsList
            currentUser={currentUser}
            onViewProfile={onViewProfile}
            onFriendsCountUpdate={handleFriendsCountUpdate}
          />
        );
      case "requests":
        return (
          <FriendRequests
            currentUser={currentUser}
            onRequestsCountUpdate={handleRequestsCountUpdate}
          />
        );
      case "search":
        return (
          <UserSearch
            currentUser={currentUser}
            onUserSelect={handleUserSelect}
          />
        );
      default:
        return null;
    }
  };

  // If viewing another user, don't show TabsWrapper (no subtabs)
  if (isViewingOtherUser) {
    return renderContent();
  }

  // For own profile, show full TabsWrapper with subtabs
  return (
    <TabsWrapper
      tabs={ownProfileTabs}
      activeTab={activeSubTab}
      onTabChange={setActiveSubTab}
      variant="profile"
    >
      {renderContent()}
    </TabsWrapper>
  );
}
