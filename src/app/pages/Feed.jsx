"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import PostList from '../components/posts/PostList';
import AddPostModal from '../components/posts/AddPostModal';
import EmptyState from '../components/EmptyState';
import CanvasLoader from '../components/CanvasLoader';


export default function Feed() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch feed posts from backend
  const fetchFeedPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get('http://localhost:3001/api/activity/feed', {
        headers: { 'x-auth-token': token }
      });

      const feedPosts = response.data || [];
      setPosts(feedPosts);
      setFilteredPosts(feedPosts);
    } catch (error) {
      console.error('Error fetching feed posts:', error);
      setError('Failed to load feed. Please try again.');
      setPosts([]);
      setFilteredPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter posts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => {
        const content = post.content?.toLowerCase() || '';
        const tmdbTitle = post.tmdbTitle?.toLowerCase() || '';
        const authorName = post.author?.username?.toLowerCase() || post.author?.name?.toLowerCase() || '';
        const categories = post.categories?.join(' ').toLowerCase() || '';
        
        const query = searchQuery.toLowerCase();
        
        return content.includes(query) || 
               tmdbTitle.includes(query) || 
               authorName.includes(query) ||
               categories.includes(query);
      });
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);

  // Fetch posts on component mount
  useEffect(() => {
    if (token) {
      fetchFeedPosts();
    }
  }, [token]);

  // Handle post creation
  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setShowCreatePost(false);
    
    // Refresh feed to get latest data
    fetchFeedPosts();
  };

  // Handle post deletion
  const handlePostDeleted = (deletedPostId) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
  };

  // Handle post update
  const handlePostUpdated = (updatedPost) => {
    setPosts(prevPosts => 
      prevPosts.map(post => post._id === updatedPost._id ? updatedPost : post)
    );
  };

  // Handle like post
  const handleLikePost = (postId) => {
    // This will be handled by the PostCard component internally
    console.log(`Liked post ${postId}`);
  };

  if (!user || !token) {
    return (
      <div className="moviesquad-bg d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading"> Authentication Required</h4>
            <p>Please log in to view your feed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="moviesquad-bg" style={{ minHeight: '100vh' }}>
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="display-5 fw-bold text-white mb-2">
                  Feed
                </h1>
                <p className="text-light mb-0">See what your friends are watching</p>
              </div>
              
              {/* Create Post Button */}
              <button
                className="btn btn-primary"
                onClick={() => setShowCreatePost(true)}
              >
                <i className="bi bi-pencil-square me-2"></i>
                Create Post
              </button>
            </div>

            {/* Search Bar */}
            <div className=" glass-card mb-4 rounded">
              <div className="card-body p-3">
                <div className="position-relative">
                  <i className="bi bi-search position-absolute start-0 top-50 translate-middle-y ms-3 text-muted"></i>
                  <input
                    type="text"
                    className="form-control ps-5"
                    placeholder="Search posts by content, movie, author, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white'
                    }}
                  />
                  {searchQuery && (
                    <button
                      className="btn btn-sm position-absolute end-0 top-50 translate-middle-y me-2"
                      onClick={() => setSearchQuery('')}
                      style={{ border: 'none', background: 'none', color: '#9ca3af' }}
                    >
                      <i className="bi bi-x-circle"></i>
                    </button>
                  )}
                </div>
                
                {/* Search Results Info */}
                {searchQuery && (
                  <div className="mt-2">
                    <small className="text-light">
                      <i className="bi bi-info-circle me-1"></i>
                      {filteredPosts.length === 0 
                        ? 'No posts found' 
                        : `${filteredPosts.length} post${filteredPosts.length !== 1 ? 's' : ''} found`
                      }
                      {searchQuery && ` for "${searchQuery}"`}
                    </small>
                  </div>
                )}
              </div>
            </div>

            {isLoading && <CanvasLoader fullscreen={true} text="Loading your feed..."/>}

            {/* Error State */}
            {error && !isLoading && (
              <div className="card glass-card mb-4">
                <div className="card-body text-center p-4">
                  <div className="text-danger mb-3" style={{ fontSize: '3rem' }}>
                    <i className="bi bi-exclamation-triangle"></i>
                  </div>
                  <h5 className="text-danger mb-2">Oops! Something went wrong</h5>
                  <p className="text-light mb-3">{error}</p>
                  <button 
                    onClick={fetchFeedPosts}
                    className="btn btn-outline-warning"
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Posts Feed */}
            {!isLoading && !error && (
              <>
                {filteredPosts.length === 0 ? (
                  // Empty State
                  searchQuery ? (
                    // No search results
                    <EmptyState
                        icon="search"
                        title="No posts found"
                        description={`No posts match your search for "${searchQuery}". Try different keywords or clear the search.`}
                        showButton={false}
                        />
                  ) : (
                    // Empty feed
                    <EmptyState
                        icon="people"
                        title="No friends yet"
                        description="Start connecting with other movie enthusiasts to see their posts here!"
                        showButton={true}
                        buttonText="Find Friends"
                        buttonAction={() => window.location.href = '/profile?tab=friends'}
                        />
                  )
                ) : (
                  // Posts List
                  <div className="mb-4">
                    {/* Posts Count */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <p className="text-light mb-0">
                        <i className="bi bi-collection me-2"></i>
                        {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} in your feed
                      </p>
                      
                      {/* Refresh Button */}
                      <button
                        onClick={fetchFeedPosts}
                        className="btn btn-outline-secondary btn-sm"
                        disabled={isLoading}
                      >
                        <i className={`bi bi-arrow-clockwise ${isLoading ? 'spin' : ''} me-1`}></i>
                        Refresh
                      </button>
                    </div>

                    {/* Render Posts */}
                    <PostList
                      posts={filteredPosts}
                      currentUser={user}
                      isGroupAdmin={false}
                      onPostDeleted={handlePostDeleted}
                      onPostUpdated={handlePostUpdated}
                      onLikePost={handleLikePost}
                    />
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <AddPostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handlePostCreated}
        groupId={undefined} 
      />
    </div>
  );
}