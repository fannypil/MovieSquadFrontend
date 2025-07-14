"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "@/app/hooks/useAuth"
import TMDBSearch from "../TMDBSearch"
import TMDBContentCard from "../TMDBContentCard"
import EmptyState from "../EmptyState"


export default function GroupSharedWatchlist({ groupId, isGroupMember, isGroupAdmin }) {
  const { token, user } = useAuth()
  const [watchlist, setWatchlist] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (groupId && token) {
      fetchWatchlist()
    }
  }, [groupId, token])

  const fetchWatchlist = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await axios.get(
        `http://localhost:3001/api/groups/${groupId}/watchlist`,
        { headers: { 'x-auth-token': token } }
      )
      
      setWatchlist(response.data || [])
    } catch (error) {
      console.error('Error fetching watchlist:', error)
      setError('Failed to load watchlist')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToWatchlist = async (item) => {
    if (!isGroupMember || !token) return

    try {
      setIsAdding(true)
      
      const watchlistItem = {
        tmdbId: item.id,
        tmdbType: item.media_type || (item.title ? 'movie' : 'tv'),
        tmdbTitle: item.title || item.name,
        tmdbPosterPath: item.poster_path
      }

      await axios.post(
        `http://localhost:3001/api/groups/${groupId}/watchlist`,
        watchlistItem,
        { headers: { 'x-auth-token': token } }
      )

      // Add to local state immediately for better UX
      setWatchlist(prev => [...prev, {
        ...watchlistItem,
        addedBy: {
          _id: user._id,
          username: user.username
        },
        addedAt: new Date().toISOString()
      }])

      setShowAddForm(false)
      alert('Added to group watchlist!')
    } catch (error) {
      console.error('Error adding to watchlist:', error)
      if (error.response?.status === 400) {
        alert('This item is already in the watchlist!')
      } else {
        alert('Failed to add to watchlist. Please try again.')
      }
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveFromWatchlist = async (tmdbId, tmdbType) => {
    if (!isGroupMember || !token) return

    if (!confirm('Remove this item from the group watchlist?')) return

    try {
      await axios.delete(
        `http://localhost:3001/api/groups/${groupId}/watchlist/${tmdbId}/${tmdbType}`,
        { headers: { 'x-auth-token': token } }
      )

      // Remove from local state immediately
      setWatchlist(prev => prev.filter(item => 
        !(item.tmdbId === tmdbId && item.tmdbType === tmdbType)
      ))

      alert('Removed from watchlist!')
    } catch (error) {
      console.error('Error removing from watchlist:', error)
      alert('Failed to remove from watchlist. Please try again.')
    }
  }

  if (!isGroupMember) {
    return (
      <EmptyState
        icon="lock"
        title="Private Group Content"
        description="This is a private group. Join the group to view shared watchlist."
        showButton={false}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning mb-3" role="status">
          <span className="visually-hidden">Loading watchlist...</span>
        </div>
        <p className="text-white">Loading shared watchlist...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button 
          className="btn btn-warning btn-sm"
          onClick={fetchWatchlist}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="text-white mb-1">
            <i className="bi bi-list-stars me-2 text-warning"></i>
            Shared Watchlist ({watchlist.length})
          </h5>
          <p className="text-light small mb-0">
            Movies and shows recommended by group members
          </p>
        </div>
        
        <button 
          className="btn btn-gold d-flex align-items-center gap-2"
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={isAdding}
        >
          <i className="bi bi-plus-circle"></i>
          Add Content
        </button>
      </div>

      {/* Add Content Form */}
      {showAddForm && (
        <div className="glass-card mb-4"  style={{ position: 'relative', zIndex: 999 }}>
          <div className="card-body">
            <h6 className="text-white mb-3">
              <i className="bi bi-search me-2"></i>
              Add to Watchlist
            </h6>
            <TMDBSearch
              onSelectItem={handleAddToWatchlist}
              placeholder="Search for movies or TV shows to add..."
              searchType="multi"
              disabled={isAdding}
            />
            {isAdding && (
              <div className="text-center mt-3">
                <div className="spinner-border spinner-border-sm text-warning me-2" role="status"></div>
                <span className="text-light">Adding to watchlist...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Watchlist Content */}
      {watchlist.length === 0 ? (
        <EmptyState
          icon="list-stars"
          title="Empty Watchlist"
          description="Be the first to add movies or shows to your group's shared watchlist!"
          showButton={true}
          buttonText="Add First Item"
          buttonAction={() => setShowAddForm(true)}
        />
      ) : (
        <div className="row g-4">
          {watchlist.map((item) => (
            <div key={`${item.tmdbId}-${item.tmdbType}`} className="col-md-6 col-lg-4">
              <div className="position-relative">
                <TMDBContentCard
                  content={{
                    id: item.tmdbId,
                    title: item.tmdbTitle,
                    poster_path: item.tmdbPosterPath?.replace('https://image.tmdb.org/t/p/w500', ''),
                    media_type: item.tmdbType,
                    tmdbType: item.tmdbType,
                    overview: '',
                    release_date: '',
                    vote_average: 0
                  }}
                  variant="watchlist"
                  currentUser={user}
                  onRemove={() => handleRemoveFromWatchlist(item.tmdbId, item.tmdbType)}
                  showRemoveButton={true}
                />
                
                {/* Added by info */}
                <div className="position-absolute top-0 start-0 m-2">
                  <span 
                    className="badge bg-dark bg-opacity-75 text-light d-flex align-items-center gap-1"
                    style={{ fontSize: '0.7rem' }}
                    title={`Added by ${item.addedBy?.username} on ${new Date(item.addedAt).toLocaleDateString()}`}
                  >
                    <i className="bi bi-person-plus"></i>
                    {item.addedBy?.username}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}