"use client"

import React from 'react'
import NotificationItem from './NotificationItem'
import EmptyState from '../EmptyState'

export default function NotificationsList({ 
  notifications, 
  isLoading, 
  error, 
  onMarkAsRead, 
  onDelete, 
  onRetry 
}) {
  
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading notifications...</span>
        </div>
        <h5 className="text-white">Loading your notifications...</h5>
        <p className="text-muted">Please wait while we fetch your latest updates</p>
      </div>
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
        />
      ))}
    </div>
  )
}