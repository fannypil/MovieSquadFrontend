"use client"

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import NotificationsList from '../components/notifications/NotificationsList '

export default function Notifications() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch
  } = useNotifications()
  
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)

  // Redirect if not authenticated
  if (!user || !token) {
    return (
      <div className="moviesquad-bg d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">
              <i className="bi bi-lock me-2"></i>
              Authentication Required
            </h4>
            <p>Please log in to view your notifications.</p>
            <hr />
            <button className="btn btn-warning" onClick={() => navigate('/login')}>
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Filter notifications based on current filter
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read
      case 'read':
        return notification.read
      default:
        return true
    }
  })

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return
    
    try {
      setIsMarkingAllRead(true)
      await markAllAsRead()
      console.log(' All notifications marked as read successfully!')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    } finally {
      setIsMarkingAllRead(false)
    }
  }

  const getFilterCounts = () => {
    const total = notifications.length
    const unread = notifications.filter(n => !n.read).length
    const read = notifications.filter(n => n.read).length
    return { total, unread, read }
  }

  const counts = getFilterCounts()

  return (
    <div className="moviesquad-bg" style={{ minHeight: '100vh' }}>
      <div className="container py-4">
        
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="text-white mb-1">
              <i className="bi bi-bell me-3 text-warning"></i>
              Notifications
            </h1>
            <p className="text-light mb-0">Stay updated with your movie squad</p>
          </div>
          
          <div className="d-flex gap-2 align-items-center">
            {unreadCount > 0 && (
              <>
                {/* Mark All Read Button */}
                <button
                  className="btn btn-warning d-flex align-items-center gap-2"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllRead}
                  style={{ 
                    minWidth: '160px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isMarkingAllRead ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Marking...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle"></i>
                      <span>Mark All Read</span>
                    </>
                  )}
                </button>

                {/* Refresh Button */}
                <button
                  className="btn btn-outline-warning"
                  onClick={refetch}
                  title="Refresh notifications"
                  disabled={isLoading}
                >
                  <i className={`bi bi-arrow-clockwise ${isLoading ? 'spin' : ''}`}></i>
                </button>
              </>
            )}
            
            {unreadCount === 0 && !isLoading && (
              <div className="d-flex align-items-center gap-2">
                <span className="text-success d-flex align-items-center gap-1">
                  <i className="bi bi-check-circle-fill"></i>
                  All caught up!
                </span>
                
                {/* Refresh Button */}
                <button
                  className="btn btn-outline-warning"
                  onClick={refetch}
                  title="Refresh notifications"
                  disabled={isLoading}
                >
                  <i className={`bi bi-arrow-clockwise ${isLoading ? 'spin' : ''}`}></i>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="glass-card text-center">
              <div className="card-body py-3">
                <div className="text-info" style={{ fontSize: '1.8rem' }}>
                  <i className="bi bi-list-ul"></i>
                </div>
                <h4 className="text-white mb-0">{counts.total}</h4>
                <small className="text-light">Total</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card text-center">
              <div className="card-body py-3">
                <div className="text-warning" style={{ fontSize: '1.8rem' }}>
                  <i className="bi bi-bell"></i>
                </div>
                <h4 className="text-white mb-0">{counts.unread}</h4>
                <small className="text-light">Unread</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-card text-center">
              <div className="card-body py-3">
                <div className="text-success" style={{ fontSize: '1.8rem' }}>
                  <i className="bi bi-check-circle"></i>
                </div>
                <h4 className="text-white mb-0">{counts.read}</h4>
                <small className="text-light">Read</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-4">
          <ul className="nav nav-pills justify-content-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '50px', padding: '5px' }}>
            <li className="nav-item">
              <button
                className={`nav-link ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
                style={{
                  backgroundColor: filter === 'all' ? '#f59e0b' : 'transparent',
                  borderColor: filter === 'all' ? '#f59e0b' : 'transparent',
                  color: filter === 'all' ? 'white' : '#ccc',
                  borderRadius: '25px',
                  transition: 'all 0.3s ease'
                }}
              >
                All
                {counts.total > 0 && (
                  <span className="badge bg-secondary ms-2">{counts.total}</span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => setFilter('unread')}
                style={{
                  backgroundColor: filter === 'unread' ? '#f59e0b' : 'transparent',
                  borderColor: filter === 'unread' ? '#f59e0b' : 'transparent',
                  color: filter === 'unread' ? 'white' : '#ccc',
                  borderRadius: '25px',
                  transition: 'all 0.3s ease'
                }}
              >
                Unread
                {counts.unread > 0 && (
                  <span className="badge bg-warning text-dark ms-2">{counts.unread}</span>
                )}
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${filter === 'read' ? 'active' : ''}`}
                onClick={() => setFilter('read')}
                style={{
                  backgroundColor: filter === 'read' ? '#f59e0b' : 'transparent',
                  borderColor: filter === 'read' ? '#f59e0b' : 'transparent',
                  color: filter === 'read' ? 'white' : '#ccc',
                  borderRadius: '25px',
                  transition: 'all 0.3s ease'
                }}
              >
                Read
                {counts.read > 0 && (
                  <span className="badge bg-secondary ms-2">{counts.read}</span>
                )}
              </button>
            </li>
          </ul>
        </div>

        {/* Notifications List */}
        <NotificationsList
          notifications={filteredNotifications}
          isLoading={isLoading}
          error={error}
          onMarkAsRead={markAsRead}
          onDelete={deleteNotification}
          onRetry={refetch}
        />
      </div>
    </div>
  )
}