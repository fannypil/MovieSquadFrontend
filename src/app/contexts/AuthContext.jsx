"use client"

import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  const updateUser = useCallback((updatedUserData) => {
    const finalUser = {
      ...user,
      ...updatedUserData,
      id: updatedUserData.id || updatedUserData._id || user?.id,
      _id: updatedUserData._id || updatedUserData.id || user?._id
    };
    
    setUser(finalUser);
    localStorage.setItem('user', JSON.stringify(finalUser)); // ✅ AuthContext manages localStorage
  }, [user]);

  // Decode JWT and extract user data
  const decodeToken = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      return {
         id: decoded.id || decoded._id || decoded.user?.id || decoded.user?._id,
        _id: decoded.id || decoded._id || decoded.user?.id || decoded.user?._id,
        username: decoded.username || decoded.user?.username,
        email: decoded.email || decoded.user?.email,
        role: decoded.role || decoded.user?.role || 'user',
        groups: decoded.groups || decoded.user?.groups || [],
        adminGroups: decoded.adminGroups || decoded.user?.adminGroups || [],
        exp: decoded.exp
      };
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }, []);

  // Check if token is expired
  const isTokenExpired = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('=== AuthContext Init ===');
        console.log('Stored token:', storedToken);
        console.log('Stored user:', storedUser);
        
        if  (storedToken && !isTokenExpired(storedToken)) {
          // First try to get user from localStorage
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              console.log('Parsed user from localStorage:', parsedUser);
              
              // Ensure user has ID field
              const userWithId = {
                ...parsedUser,
                id: parsedUser.id || parsedUser._id,
                _id: parsedUser._id || parsedUser.id
              };
              
              setUser(userWithId);
              setToken(storedToken);
              axios.defaults.headers.common['x-auth-token'] = storedToken;
              
              console.log('User set from localStorage:', userWithId);
            } catch (error) {
              console.error('Error parsing user from localStorage:', error);
            }
          }
          
          // Then try to decode from token
          const tokenUser = decodeToken(storedToken);
          if (tokenUser) {
            console.log('User from token:', tokenUser);
            setUser(prevUser => ({
              ...prevUser,
              ...tokenUser
            }));
          }
          
          // Finally, refresh from API
          try {
            const response = await axios.get('http://localhost:3001/api/user/me', {
              headers: { 'x-auth-token': storedToken }
            });
            
            const apiUser = response.data;
            console.log('User from API:', apiUser);
            
            const finalUser = {
              ...apiUser,
              id: apiUser.id || apiUser._id,
              _id: apiUser._id || apiUser.id
            };
            
            setUser(finalUser);
            localStorage.setItem('user', JSON.stringify(finalUser));
            console.log('Final user set:', finalUser);
            
          } catch (error) {
            console.error('Failed to fetch user from API:', error);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [decodeToken, isTokenExpired]);

  // Refresh user data from backend
  const refreshUserData = async () => {
    try {
      const response = await axios.get('/api/user/me');
      const userData = response.data;
      
      setUser(prevUser => ({
        ...prevUser,
        ...userData,
        groups: userData.groups || [],
        adminGroups: userData.groups?.filter(group => 
          group.admin === prevUser.id || group.admin?._id === prevUser.id
        ) || []
      }));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      const decodedUser = decodeToken(newToken);
      
      setToken(newToken);
      setUser({ ...userData, ...decodedUser });
      
      axios.defaults.headers.common['x-auth-token'] = newToken;
      
      return { success: true, user: userData,redirectTo: '/home' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['x-auth-token'];
    
    setToken(null);
    setUser(null);
    setPermissions([]);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is admin of specific group
  const isGroupAdmin = (groupId) => {
    if (!user || !groupId) return false;
    
    return user.adminGroups?.some(group => 
      group._id === groupId || group.id === groupId
    ) || user.role === 'admin';
  };

  // Check if user is member of specific group
  const isGroupMember = (groupId) => {
    if (!user || !groupId) return false;
    
    return user.groups?.some(group => 
      group._id === groupId || group.id === groupId
    ) || isGroupAdmin(groupId);
  };

  // Check if user can perform action
  const canPerformAction = (action, context = {}) => {
    if (!user) return false;
    
    switch (action) {
      case 'DELETE_POST':
        return (
          user.id === context.authorId || 
          (context.groupId && isGroupAdmin(context.groupId)) ||
          user.role === 'admin'
        );
      
      case 'EDIT_POST':
        return user.id === context.authorId;
      
      case 'DELETE_COMMENT':
        return (
          user.id === context.commentAuthorId ||
          user.id === context.postAuthorId ||
          (context.groupId && isGroupAdmin(context.groupId)) ||
          user.role === 'admin'
        );
      
      case 'MANAGE_GROUP':
        return isGroupAdmin(context.groupId) || user.role === 'admin';
      
      case 'ACCESS_ADMIN':
        return user.role === 'admin';
      
      default:
        return false;
    }
  };

  const value = {
    user,
    token,
    loading,
    permissions,
    login,
    logout,
    updateUser,
    refreshUserData,
    hasRole,
    isGroupAdmin,
    isGroupMember,
    canPerformAction,
    isAuthenticated: !!token && !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };