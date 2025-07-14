
import { usePermissions } from '@/app/hooks/usePermissions';
import React from 'react';

const AuthorizedButton = ({ 
  permission, 
  context = {}, 
  children, 
  className = 'btn btn-primary', 
  disabled = false,
  onClick,
  ...props 
}) => {
  const { checkPermission } = usePermissions();

  const hasPermission = checkPermission(permission, context);

  if (!hasPermission) {
    return null; // Hide button if no permission
  }

  return (
    <button 
      className={className}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default AuthorizedButton;