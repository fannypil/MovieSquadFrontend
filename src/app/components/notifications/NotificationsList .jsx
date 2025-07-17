"use client"

import React from 'react'
import NotificationItem from './NotificationItem'
import EmptyState from '../EmptyState'
import CanvasLoader from '../CanvasLoader'

export default function NotificationsList({ 
  notifications, 
  isLoading, 
  error, 
  onMarkAsRead, 
  onDelete, 
  onRetry,
  onInvitationAction
}) {
  
  if (isLoading) {
    return (
      <CanvasLoader fullscreen={true} text="Loading your notifications..." />
    )
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <div className="text-danger mb-3" style={{ fontSize: '3rem' }}>
          <i className="bi bi-exclamation-triangle"></i>
        </div>
        <h5 className="text-white mb-3">Failed to Load Notifications</h5>
        <p className="text-light mb-4">{error}</p>
        <button className="btn btn-warning" onClick={onRetry}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Try Again
        </button>
      </div>
    )
  }

  if (!notifications || notifications.length === 0) {
    return (
      <EmptyState
        icon="bell"
        title="All caught up!"
        description="No new notifications at the moment."
        showButton={false}
      />
    )
  }

  return (
    <div className="notifications-list">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification._id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
          onInvitationAction={onInvitationAction}
        />
      ))}
    </div>
  )
}