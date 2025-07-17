"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileTabs from "../components/profile/ProfileTabs";
import { useAuth } from "../hooks/useAuth";

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token } = useAuth();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [userFriends, setUserFriends] = useState([]);
  const [userCollections, setUserCollections] = useState({
    favoriteMovies: [],
    watchedContent: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    if (
      currentUser &&
      (currentUser._id === userId || currentUser.id === userId)
    ) {
      navigate("/profile");
      return;
    }
    if (token && userId) {
      fetchUserProfile();
    }
  }, [userId, navigate, currentUser, token]);

  const fetchUserProfile = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      console.log(`Fetching profile for user ID: ${userId}`);

      const [userResponse, postsResponse, groupsResponse] = await Promise.all([
        axios.get(`http://localhost:3001/api/user/profile/${userId}`, {
          headers: { "x-auth-token": token },
        }),
        axios.get(`http://localhost:3001/api/activity/user/${userId}`, {
          headers: { "x-auth-token": token },
        }),
        axios.get("http://localhost:3001/api/groups", {
          headers: { "x-auth-token": token },
        }),
      ]);

      const userData = userResponse.data;
      setUser(userData);
      setUserPosts(postsResponse.data || []);

      const myGroups = groupsResponse.data.filter((group) =>
        group.members?.some(
          (member) => (member._id || member.id || member) === userId
        )
      );
      setUserGroups(myGroups);

      if (userData.friends) {
        setUserFriends(userData.friends);
      }

      setUserCollections({
        favoriteMovies: userData.favoriteMovies || [],
        watchedContent: userData.watchedContent || [],
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);

      if (error.response?.status === 404) {
        alert("User not found");
      } else if (error.response?.status === 403) {
        alert("This profile is private");
      } else {
        alert("Failed to load user profile");
      }
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleViewGroup = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  const handleLikePost = (postId) => {
    console.log(`Liked post ${postId}`);
  };

  if (isLoading) {
    return (
      <div
        className="moviesquad-bg d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-warning mb-3"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-white">
            Loading {user?.username || "user"}'s profile...
          </h5>
          <p className="text-muted">Please wait while we fetch their data</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="moviesquad-bg d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <div className="text-danger mb-3" style={{ fontSize: "3rem" }}>
            <i className="bi bi-person-x"></i>
          </div>
          <h4 className="text-white mb-3">Profile Not Found</h4>
          <p className="text-light mb-4">
            The user you're looking for doesn't exist or their profile is
            private.
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <button
              className="btn btn-outline-light"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left me-2"></i>Go Back
            </button>
            <button className="btn btn-gold" onClick={() => navigate("/")}>
              <i className="bi bi-house me-2"></i>Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="moviesquad-bg" style={{ minHeight: "100vh" }}>
      <div className="container py-4">
        <div className="d-flex align-items-center mb-4">
          <button
            className="btn btn-outline-light btn-sm me-3 hover-lift"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left me-2"></i>Back
          </button>
          <h3 className="text-white mb-0">
            <i className="bi bi-person me-2 text-warning"></i>
            {user.username}'s Profile
          </h3>
        </div>

        {/* Use simplified ProfileHeader */}
        <ProfileHeader
          user={user}
          isOwnProfile={false}
          currentUser={currentUser}
          onUserUpdated={setUser}
          onPostCreated={null} // No post creation for other users
        />

        <div className="mt-4">
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userPosts={userPosts}
            userGroups={userGroups}
            userFriends={userFriends}
            userCollections={userCollections}
            currentUser={currentUser}
            viewedUser={user}
            onViewProfile={handleViewProfile}
            onViewGroup={handleViewGroup}
            onLikePost={handleLikePost}
            isOwnProfile={false}
            isViewingOtherUser={true}
            onPostDeleted={null}
            onPostUpdated={null}
          />
        </div>
      </div>
    </div>
  );
}
