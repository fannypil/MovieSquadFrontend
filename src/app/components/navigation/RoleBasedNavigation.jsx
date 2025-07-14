"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation,useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/hooks/useAuth';
import { usePermissions } from '@/app/hooks/usePermissions';
import { useNotifications } from '@/app/hooks/useNotifications';

const RoleBasedNavigation = () => {
  const { user, logout } = useAuth()
  const { hasRole } = usePermissions()
  const { unreadCount } = useNotifications()
  const location = useLocation()
  const navigate = useNavigate()

  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

   useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navigationItems = [
    {
      path: '/home',
      label: 'Home',
      show: !!user
    },
    {
      path: '/feed',
      label: 'Feed',
      show: !!user
    },
    {
      path: '/profile',
      label: 'Profile',
      show: !!user
    },
    {
      path: '/groups',
      label: 'Groups',
      show: !!user
    },
    {
      path: '/discovery',
      label: 'Discovery',
      show: !!user
    },
    {
      path: '/chat',
      label: 'Chat',
      show: !!user
    },
    {
      path: '/admin',
      label: 'Admin Panel',
      show: hasRole('admin')
    }
  ];

  const visibleItems = navigationItems.filter(item => item.show)

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    navigate('/login', { replace: true })
  }

  const handleHomeClick = () => {
    if (user) {
      navigate('/home')
    } else {
      navigate('/login')
    }
  }

  const getUserInitials = (username) => {
    return username?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  // Render user avatar
  const renderUserAvatar = () => {
    if (user?.profilePicture) {
      return (
        <img 
          src={user.profilePicture}
          alt={`${user.username}'s avatar`}
          className="rounded-circle"
          style={{ 
            width: '28px', 
            height: '28px',
            objectFit: 'cover'
          }}
        />
      );
    }

    // Fallback to initials if no profile picture
    return (
      <div 
        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
        style={{
          width: '28px',
          height: '28px',
          backgroundColor: '#6c757d',
          fontSize: '0.8rem'
        }}
      >
        {getUserInitials(user?.username)}
      </div>
    );
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <button 
          className="navbar-brand btn btn-link text-decoration-none"
          onClick={handleHomeClick}
          style={{ border: 'none', background: 'none', color: 'inherit' }}
        >
          MovieSquad
        </button>
        
        <div className="navbar-nav me-auto">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="me-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="navbar-nav">
          {user ? (
            <div className="dropdown" ref={dropdownRef}>
              <button
                className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2"
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ 
                  border: '1px solid #6c757d',
                  borderRadius: '6px',
                  padding: '6px 12px'
                }}
              >
                {renderUserAvatar()}
                
                <span>{user.username}</span>
                
                {unreadCount > 0 && (
                  <span 
                    className="badge bg-danger rounded-pill"
                    style={{ 
                      fontSize: '0.6rem',
                      minWidth: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {showDropdown && (
                <ul 
                  className="dropdown-menu dropdown-menu-end show"
                  style={{
                    backgroundColor: '#343a40',
                    border: '1px solid #495057',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                    minWidth: '200px',
                    marginTop: '8px',
                    position: 'absolute',
                    right: '0',
                    top: '100%',
                    zIndex: 1000
                  }}
                >
                  <li>
                    <div className="dropdown-header text-light fw-bold">
                      <i className="bi bi-person-circle me-2"></i>
                      {user.username}
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" style={{ borderColor: '#495057' }} /></li>
                  
                  <li>
                    <Link 
                      className="dropdown-item text-light d-flex align-items-center justify-content-between" 
                      to="/notifications"
                      onClick={() => setShowDropdown(false)}
                      style={{ 
                        transition: 'background-color 0.2s ease',
                        borderRadius: '4px',
                        margin: '2px 6px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#495057'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-bell"></i>
                        Notifications
                      </div>
                      {unreadCount > 0 && (
                        <span 
                          className="badge bg-danger rounded-pill" 
                          style={{ fontSize: '0.6rem' }}
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                  
                  <li><hr className="dropdown-divider" style={{ borderColor: '#495057' }} /></li>
                  
                  <li>
                    <button 
                      className="dropdown-item text-danger d-flex align-items-center gap-2" 
                      onClick={handleLogout}
                      style={{ 
                        transition: 'background-color 0.2s ease',
                        borderRadius: '4px',
                        margin: '2px 6px',
                        border: 'none',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(220, 53, 69, 0.2)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <i className="bi bi-box-arrow-right"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <Link className="btn btn-outline-light" to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;