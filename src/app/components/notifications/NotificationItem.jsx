"use client"

import React, { useState } from 'react'

export default function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleMarkAsRead = async () => {
    if (notification.read || isProcessing) return
    
    try {
      setIsProcessing(true)
      await onMarkAsRead(notification._id)
    } catch (error) {
      console.error('Failed to mark as read:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (isProcessing) return
    
    try {
      setIsProcessing(true)
      await onDelete(notification._id)
    } catch (error) {
      console.error('Failed to delete notification:', error)
      setIsProcessing(false)
    }
  }

  //  UPDATED: Match backend notification types
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'group_invite':
      case 'group_joined':
      case 'group_join_request':
      case 'group_request_accepted':
      case 'group_request_rejected':
      case 'group_removed':
        return 'bi-people'
      case 'like':
        return 'bi-heart'
      case 'comment':
        return 'bi-chat'
      case 'friend_request':
      case 'friend_accepted':
        return 'bi-person-plus'
      case 'group_watchlist_add':
        return 'bi-list-stars'
      case 'new_private_message':
        return 'bi-envelope'
      case 'post_mentioned':
        return 'bi-at'
      case 'shared_movie_recommendation':
        return 'bi-film'
      case 'admin_message':
        return 'bi-shield'
      default:
        return 'bi-bell'
    }
  }

  // ✅ UPDATED: Match backend notification types  
  const getNotificationColor = (type) => {
    switch (type) {
      case 'group_invite':
      case 'group_joined':
      case 'group_join_request':
      case 'group_request_accepted':
        return 'text-info'
      case 'group_request_rejected':
      case 'group_removed':
        return 'text-danger'
      case 'like':
        return 'text-danger'
      case 'comment':
        return 'text-primary'
      case 'friend_request':
      case 'friend_accepted':
        return 'text-success'
      case 'group_watchlist_add':
        return 'text-warning'
      case 'new_private_message':
        return 'text-info'
      case 'post_mentioned':
        return 'text-secondary'
      case 'shared_movie_recommendation':
        return 'text-warning'
      case 'admin_message':
        return 'text-danger'
      default:
        return 'text-muted'
    }
  }

  //  UPDATED: Generate notification title based on type
  const getNotificationTitle = (notification) => {
    const senderName = notification.sender?.username || 'Someone'
    
    switch (notification.type) {
      case 'like':
        return `${senderName} liked your post`
      case 'comment':
        return `${senderName} commented on your post`
      case 'friend_request':
        return `${senderName} sent you a friend request`
      case 'friend_accepted':
        return `${senderName} accepted your friend request`
      case 'group_invite':
        return `${senderName} invited you to a group`
      case 'group_joined':
        return `${senderName} joined your group`
      case 'group_join_request':
        return `${senderName} wants to join your group`
      case 'group_request_accepted':
        return 'Your group request was accepted'
      case 'group_request_rejected':
        return 'Your group request was rejected'
      case 'group_removed':
        return 'You were removed from a group'
      case 'group_watchlist_add':
        return `${senderName} added a movie to the group watchlist`
      case 'new_private_message':
        return `${senderName} sent you a message`
      case 'post_mentioned':
        return `${senderName} mentioned you in a post`
      case 'shared_movie_recommendation':
        return `${senderName} shared a movie recommendation`
      case 'admin_message':
        return 'Admin Message'
      default:
        return 'New Notification'
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now - date
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return 'just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div 
      className={`glass-card mb-3 ${!notification.read ? 'border-warning' : ''}`}
      style={{ 
        opacity: notification.read ? 0.8 : 1,
        borderLeft: !notification.read ? '4px solid #f59e0b' : '4px solid transparent'
      }}
    >
      <div className="card-body p-3">
        <div className="d-flex align-items-start">
          {/* Notification Icon */}
          <div 
            className={`flex-shrink-0 me-3 rounded-circle d-flex align-items-center justify-content-center ${getNotificationColor(notification.type)}`}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '2px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <i className={`${getNotificationIcon(notification.type)} fs-5`}></i>
          </div>

          {/* Notification Content */}
          <div className="flex-grow-1 min-width-0">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <h6 className="text-white mb-0 fw-semibold">
                {/*  UPDATED: Use generated title or custom message */}
                {notification.message || getNotificationTitle(notification)}
                {!notification.read && (
                  <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.6rem' }}>
                    New
                  </span>
                )}
              </h6>
              
              {/* Actions */}
              <div className="d-flex gap-1">
                {!notification.read && (
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={handleMarkAsRead}
                    disabled={isProcessing}
                    title="Mark as read"
                    style={{ fontSize: '0.7rem' }}
                  >
                    {isProcessing ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <i className="bi bi-check"></i>
                    )}
                  </button>
                )}
                
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleDelete}
                  disabled={isProcessing}
                  title="Delete notification"
                  style={{ fontSize: '0.7rem' }}
                >
                  {isProcessing ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <i className="bi bi-x"></i>
                  )}
                </button>
              </div>
            </div>
            
            {/* UPDATED: Show custom message if available, otherwise show default */}
            {notification.message && (
              <p className="text-light mb-2" style={{ fontSize: '0.9rem' }}>
                {notification.message}
              </p>
            )}
            
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted d-flex align-items-center">
                <i className="bi bi-clock me-1"></i>
                {formatTimeAgo(notification.createdAt)}
              </small>
              
              {notification.sender && (
                <small className="text-muted">
                  from <span className="text-warning">{notification.sender.username}</span>
                </small>
              )}
            </div>

            {/* Show entity type and ID if available for debugging */}
            {notification.entityType && notification.entityId && (
              <div className="mt-2">
                <small className="text-muted">
                  Related to: {notification.entityType}
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}