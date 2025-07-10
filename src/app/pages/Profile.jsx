import React, { useState, useEffect } from "react";
import axios from "axios";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileTabs from "../components/profile/ProfileTabs";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          
          setUser({
            id: parsedUser._id || parsedUser.id,
            username: parsedUser.username,
            email: parsedUser.email,
            bio: parsedUser.bio || '',
            profilePicture: parsedUser.profilePicture || "https://via.placeholder.com/100",
            postsCount: parsedUser.postsCount || 0,
            friendsCount: parsedUser.friendsCount || 0,
            watchedCount: parsedUser.watchedCount || 0,
            favoriteGenres: parsedUser.favoriteGenres || ["Drama", "Comedy", "Action"],
            favoriteMovies: parsedUser.favoriteMovies || []
          });

          if (token) {
            await fetchUserPosts(parsedUser);
          }
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndPosts();
  }, []);

  const fetchUserPosts = async (parsedUser) => {
    try {
      const response = await axios.get('http://localhost:3001/api/posts');
      const currentUserId = parsedUser._id || parsedUser.id;
      const filteredPosts = response.data.filter(post => 
        post.author._id === currentUserId || post.author.id === currentUserId
      );
      setUserPosts(filteredPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handlePostCreated = async (newPost) => {
    console.log('New post created:', newPost);
    setUserPosts(prevPosts => [newPost, ...prevPosts]);
    
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      await fetchUserPosts(parsedUser);
    }
  };

  const handleEdit = () => {
    alert("Edit profile clicked");
  };

  const handleSettings = () => {
    alert("Settings clicked");
  };

  const handleLikePost = (postId) => {
    alert(`Liked post ${postId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-white">Loading your profile...</h5>
          <p className="text-muted">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">⚠️ Profile Not Found</h4>
            <p>Unable to load profile data. Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container py-4">
        <ProfileHeader
          user={user}
          onUserUpdated={(updatedUser) => setUser(updatedUser)}
          onPostCreated={handlePostCreated}
        />
        
        <div className="mt-4">
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userPosts={userPosts}
            onLikePost={handleLikePost}
            currentUser={user}
            onPostDeleted={(deletedPostId) => {
              setUserPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
            }}
            onPostUpdated={(updatedPost) => {
              setUserPosts(prevPosts => 
                prevPosts.map(post => post._id === updatedPost._id ? updatedPost : post)
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}