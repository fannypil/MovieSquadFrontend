"use client"

import { useAuth } from '@/app/hooks/useAuth';
import { usePermissions } from '@/app/hooks/usePermissions';
import { Navigate, useLocation } from 'react-router-dom';
import React from 'react';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requiredRole = null, 
  requiredPermission = null, 
  permissionContext = {},
  fallback = null,
  redirectTo = '/login' 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const { checkPermission, hasRole } = usePermissions();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <div className="text-center">
          <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-light">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Check authentication - redirect to login if not authenticated
  if (requireAuth && !isAuthenticated) {
    // If custom fallback is provided, use it
    if (fallback) {
      return fallback;
    }
    
    // Otherwise redirect to login with return path
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="container-fluid moviesquad-bg" style={{ minHeight: '100vh' }}>
        <div className="row justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="col-md-6 col-lg-4">
            <div className="glass-card text-center">
              <div className="card-body p-5">
                <div className="mb-4">
                  <i className="bi bi-shield-exclamation text-warning" style={{ fontSize: '4rem' }}></i>
                </div>
                <h3 className="text-white mb-3">Access Denied</h3>
                <p className="text-light mb-4">
                  You need <strong>{requiredRole}</strong> role to access this page.
                </p>
                <button 
                  className="btn btn-warning"
                  onClick={() => window.history.back()}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check specific permission
  if (requiredPermission && !checkPermission(requiredPermission, permissionContext)) {
    return fallback || (
      <div className="container-fluid moviesquad-bg" style={{ minHeight: '100vh' }}>
        <div className="row justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="col-md-6 col-lg-4">
            <div className="glass-card text-center">
              <div className="card-body p-5">
                <div className="mb-4">
                  <i className="bi bi-lock text-danger" style={{ fontSize: '4rem' }}></i>
                </div>
                <h3 className="text-white mb-3">Permission Required</h3>
                <p className="text-light mb-4">
                  You don't have permission to perform this action.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button 
                    className="btn btn-outline-warning"
                    onClick={() => window.history.back()}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Go Back
                  </button>
                  <Navigate to="/home" className="btn btn-warning">
                    <i className="bi bi-house me-2"></i>
                    Home
                  </Navigate>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed, render the protected content
  return children;
};

export default ProtectedRoute;