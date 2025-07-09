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
        // קבל נתוני משתמש מ-localStorage
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          
          // הגדר נתוני משתמש
          setUser({
            id: parsedUser._id || parsedUser.id,
            username: parsedUser.username,
            email: parsedUser.email,
            profilePicture: parsedUser.profilePicture || "https://via.placeholder.com/100",
            postsCount: parsedUser.postsCount || 0,
            friendsCount: parsedUser.friendsCount || 0,
            watchedCount: parsedUser.watchedCount || 0,
            favoriteGenres: parsedUser.favoriteGenres || ["Drama", "Comedy", "Action"]
          });

          // טען את הפוסטים של המשתמש מהשרת
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

  // פונקציה לטעינת פוסטים של המשתמש
  const fetchUserPosts = async (parsedUser) => {
    try {
      const response = await axios.get('http://localhost:3001/api/posts');

      // סנן פוסטים לפי המשתמש הנוכחי
      const currentUserId = parsedUser._id || parsedUser.id;
      const filteredPosts = response.data.filter(post => 
        post.author._id === currentUserId || post.author.id === currentUserId
      );
      
      setUserPosts(filteredPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  // פונקציה לטיפול בפוסט חדש
  const handlePostCreated = async (newPost) => {
    console.log('New post created:', newPost);
    
    // הוסף את הפוסט החדש לתחילת הרשימה
    setUserPosts(prevPosts => [newPost, ...prevPosts]);
    
    // אופציונלי: טען מחדש את כל הפוסטים כדי להבטיח עקביות
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
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-4">
      <ProfileHeader
        user={user}
        onEdit={handleEdit}
        onSettings={handleSettings}
        onPostCreated={handlePostCreated}
      />
      <div className="mt-6">
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userPosts={userPosts}
          onLikePost={handleLikePost}
          currentUser={user}
        />
      </div>
    </div>
  );
}
