import React from "react";
import { useState } from "react"

import AddPostModal from "../posts/AddPostModal";

export default function ProfileHeader({ user, onEdit, onSettings, onPostCreated }) {
    const [showCreatePost, setShowCreatePost] = useState(false);
    const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  const handleCloseCreatePost = () => {
    setShowCreatePost(false);
  };

  const handlePostCreated = (newPost) => {
    setShowCreatePost(false);
    
    if (onPostCreated) {
      onPostCreated(newPost);
    }
  };


  return (
    <>
    <div className="card mb-4">
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-auto">
            <img
              src={user.profilePicture}
              alt="Profile"
              className="rounded-circle"
              width="100"
              height="100"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="col">
            <h2 className="mb-1">{user.username}</h2>
            <p className="text-muted mb-2">{user.email}</p>
            <div className="row text-center">
              <div className="col-4">
                <strong>{user.postsCount}</strong>
                <div className="small text-muted">Posts</div>
              </div>
              <div className="col-4">
                <strong>{user.friendsCount}</strong>
                <div className="small text-muted">Friends</div>
              </div>
              <div className="col-4">
                <strong>{user.watchedCount}</strong>
                <div className="small text-muted">Watched</div>
              </div>
            </div>
          </div>
          <div className="col-auto">
            <div className="d-flex flex-column gap-2">
              {/* Create Post Button */}
              <button 
                className="btn btn-primary"
                onClick={handleCreatePost}
              >
                📝 Create Post
              </button>
              
              {/* Edit Profile Button */}
              <button 
                className="btn btn-outline-primary"
                onClick={onEdit}
              >
                ✏️ Edit Profile
              </button>
              
              {/* Settings Button */}
              <button 
                className="btn btn-outline-secondary"
                onClick={onSettings}
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>
        
        {/* Favorite Genres */}
        <div className="mt-3">
          <h6>Favorite Genres:</h6>
          <div className="d-flex flex-wrap gap-1">
            {user.favoriteGenres.map((genre, index) => (
              <span key={index} className="badge bg-secondary">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
      <AddPostModal
      isOpen={showCreatePost}
      onClose={handleCloseCreatePost}
      onPostCreated={handlePostCreated}
      />
      </>    
  );
}