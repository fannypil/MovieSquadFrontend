"use client"

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from './useAuth'

export const useNotifications = () => {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    if (!token) return

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await axios.get('http://localhost:3001/api/notifications/me', {
        headers: { 'x-auth-token': token }
      })
      
      setNotifications(response.data)
      
      // Calculate unread count and dispatch update
      const unreadNotifications = response.data.filter(notification => !notification.read)
      const newUnreadCount = unreadNotifications.length
      setUnreadCount(newUnreadCount)
      
      // Dispatch update event
      window.dispatchEvent(new CustomEvent('unreadCountUpdate', { 
        detail: { unreadCount: newUnreadCount } 
      }))
      
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setError('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return

    try {
      const response = await axios.get('http://localhost:3001/api/notifications/me/unread-count', {
        headers: { 'x-auth-token': token }
      })
      
      setUnreadCount(response.data.unreadCount)
      
      // Dispatch update event
      window.dispatchEvent(new CustomEvent('unreadCountUpdate', { 
        detail: { unreadCount: response.data.unreadCount } 
      }))
      
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }, [token])

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!token) return

    try {
      await axios.put(`http://localhost:3001/api/notifications/${notificationId}/read`, {}, {
        headers: { 'x-auth-token': token }
      })
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
      
      // Update unread count and dispatch event
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1)
        
        // Dispatch update event
        window.dispatchEvent(new CustomEvent('unreadCountUpdate', { 
          detail: { unreadCount: newCount } 
        }))
        
        return newCount
      })

      // Double-check with server after a delay
      setTimeout(() => fetchUnreadCount(), 500)
      
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return

    try {
      await axios.put('http://localhost:3001/api/notifications/me/read-all', {}, {
        headers: { 'x-auth-token': token }
      })
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
      
      setUnreadCount(0)

      // Dispatch update event
      window.dispatchEvent(new CustomEvent('unreadCountUpdate', { 
        detail: { unreadCount: 0 } 
      }))

      // Double-check with server after a delay
      setTimeout(() => fetchUnreadCount(), 500)
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      throw error
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!token) return

    try {
      await axios.delete(`http://localhost:3001/api/notifications/${notificationId}`, {
        headers: { 'x-auth-token': token }
      })
      
      // Update local state
      const deletedNotification = notifications.find(n => n._id === notificationId)
      setNotifications(prev => prev.filter(notification => notification._id !== notificationId))
      
      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => {
          const newCount = Math.max(0, prev - 1)
          
          // Dispatch update event
          window.dispatchEvent(new CustomEvent('unreadCountUpdate', { 
            detail: { unreadCount: newCount } 
          }))
          
          return newCount
        })
      }

      // Double-check with server
      setTimeout(() => fetchUnreadCount(), 500)
      
    } catch (error) {
      console.error('Error deleting notification:', error)
      throw error
    }
  }

  // Listen for external unread count updates
  useEffect(() => {
    const handleUnreadCountUpdate = (event) => {
      const { unreadCount: newCount } = event.detail
      setUnreadCount(newCount)
    }

    window.addEventListener('unreadCountUpdate', handleUnreadCountUpdate)
    
    return () => {
      window.removeEventListener('unreadCountUpdate', handleUnreadCountUpdate)
    }
  }, [])

  // Auto-refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && token) {
        fetchUnreadCount()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [token, fetchUnreadCount])

  // Periodic refresh every 30 seconds
  useEffect(() => {
    if (!token) return

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [token, fetchUnreadCount])

  // Initialize on mount
  useEffect(() => {
    if (token) {
      fetchNotifications()
      fetchUnreadCount()
    }
  }, [token, fetchNotifications, fetchUnreadCount])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications
  }
}