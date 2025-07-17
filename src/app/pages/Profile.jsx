import React, { useState, useEffect } from "react";
import axios from "axios";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileTabs from "../components/profile/ProfileTabs";
import { useAuth } from "../hooks/useAuth";
import CanvasLoader from "../components/CanvasLoader";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuth();

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/posts", {
        headers: { "x-auth-token": token },
      });

      const currentUserId = user._id || user.id;
      const filteredPosts = response.data.filter((post) => {
        const isUserPost =
          post.author._id === currentUserId || post.author.id === currentUserId;
        const isNotGroupPost = !post.group;
        return isUserPost && isNotGroupPost;
      });
      setUserPosts(filteredPosts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/groups", {
        headers: { "x-auth-token": token },
      });

      const myGroups = response.data.filter((group) =>
        group.members?.some(
          (member) =>
            (member._id || member.id || member) === (user._id || user.id)
        )
      );
      setUserGroups(myGroups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      setUserGroups([]);
    }
  };

  const fetchUserData = async () => {
    if (!user || !token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      await Promise.all([fetchUserPosts(), fetchUserGroups()]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user, token]);

  const handlePostCreated = async (newPost) => {
    console.log("New post created:", newPost);
    setUserPosts((prevPosts) => [newPost, ...prevPosts]);
    await fetchUserPosts();
  };

  const handleUserUpdated = () => {
    // Refresh user data when profile is updated
    fetchUserData();
  };

  const handleGroupJoined = () => {
    fetchUserGroups();
  };

  const handleLikePost = (postId) => {
    alert(`Liked post ${postId}`);
  };

  if (!user || !token) {
    return (
      <div
        className="moviesquad-bg d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading"> Authentication Required</h4>
            <p>Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <CanvasLoader fullscreen={true} text="Loading your profile..." />;
  }

  return (
    <div className="moviesquad-bg" style={{ minHeight: "100vh" }}>
      <div className="container py-4">
        <ProfileHeader
          user={user}
          isOwnProfile={true}
          currentUser={user}
          onUserUpdated={handleUserUpdated}
          onPostCreated={handlePostCreated}
        />

        <div className="mt-4">
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userPosts={userPosts}
            userGroups={userGroups}
            onLikePost={handleLikePost}
            currentUser={user}
            onGroupJoined={handleGroupJoined}
            onPostDeleted={(deletedPostId) => {
              setUserPosts((prevPosts) =>
                prevPosts.filter((post) => post._id !== deletedPostId)
              );
            }}
            onPostUpdated={(updatedPost) => {
              setUserPosts((prevPosts) =>
                prevPosts.map((post) =>
                  post._id === updatedPost._id ? updatedPost : post
                )
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
