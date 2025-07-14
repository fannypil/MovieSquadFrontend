"use client"

import { usePermissions } from '@/app/hooks/usePermissions';
import React from 'react';

const RoleGuard = ({ 
  children, 
  permission, 
  context = {}, 
  fallback = null,
  hideWhenUnauthorized = false 
}) => {
  const { checkPermission } = usePermissions();

  const hasPermission = checkPermission(permission, context);

  if (!hasPermission) {
    if (hideWhenUnauthorized) {
      return null;
    }
    return fallback || (
      <div className="text-muted">
        <small>You don't have permission to view this content.</small>
      </div>
    );
  }

  return children;
};

export default RoleGuard;