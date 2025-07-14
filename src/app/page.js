
"use client"
import './globals.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import RoleBasedNavigation from './components/navigation/RoleBasedNavigation';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './components/Dashboard';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import GroupListPage from './pages/GroupListPage';
import GroupDetailPage from './components/groups/GroupDetailPage';
import Chat from './pages/Chat';
import ViewGroup from './pages/ViewGroup';
import DiscoveryPage from './pages/DiscoveryPage';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Notifications from './pages/Notifications';


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
          <RoleBasedNavigation />
          
          <Routes>
            {/* Root Route - Redirect authenticated users to home, unauthenticated to login */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute 
                  requireAuth={true}
                  redirectTo="/login"
                >
                  <Home />
                </ProtectedRoute>
              } 
            />
            
            {/* Public Authentication Routes - No protection needed */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute 
                  requireAuth={false}
                  fallback={<Navigate to="/home" replace />}
                >
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/signup" 
              element={
                <ProtectedRoute 
                  requireAuth={false}
                  fallback={<Navigate to="/home" replace />}
                >
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Main Application Routes-All require authentication * */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            
             <Route 
              path="/feed" 
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            
             <Route 
              path="/discovery" 
              element={
                <ProtectedRoute>
                  <DiscoveryPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile/:userId" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/groups" 
              element={
                <ProtectedRoute>
                  <GroupListPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/groups/:groupId" 
              element={
                <ProtectedRoute>
                  <ViewGroup />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes - Require admin role */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <div>Admin Panel Component</div>
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback Routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}