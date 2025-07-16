import { useAuth } from "./useAuth";

export const usePermissions = () => {
  const { user, hasRole, isGroupAdmin, isGroupMember, canPerformAction } = useAuth();

  const checkPermission = (permission, context = {}) => {
    if (!user) return false;

    switch (permission) {
      case 'CREATE_POST':
        return !!user;
      
      case 'EDIT_POST':
        const canEdit = user.id === context.authorId || user._id === context.authorId;
        return canEdit;

      case 'DELETE_POST':
        const isAuthor = user.id === context.authorId || user._id === context.authorId;
        const isGroupAdminForPost = context.groupId && isGroupAdmin(context.groupId);
        const isGlobalAdmin = user.role === 'admin';
        const canDelete = isAuthor || isGroupAdminForPost || isGlobalAdmin;
        
        return canDelete;

    case 'EDIT_PROFILE':
        const isProfileOwner = (user.id === context.profileOwnerId || user._id === context.profileOwnerId);
        const isAdmin = user.role === 'admin';
        return isProfileOwner || isAdmin;

    case 'MANAGE_PROFILE_SETTINGS':
        const isSettingsOwner = (user.id === context.profileOwnerId || user._id === context.profileOwnerId);
        const isGlobalAdminForSettings = user.role === 'admin';
        return isSettingsOwner || isGlobalAdminForSettings;

    case 'VIEW_PROFILE':
        return !!user;
      
      case 'MANAGE_GROUP':
        const isGroupAdminUser = context.admin === user._id || context.groupAdminId === user.id;
        return isGroupAdminUser || user.role === 'admin';
      
      case 'ACCESS_ADMIN_PANEL':
        return hasRole('admin');
      
      case 'VIEW_USER_PROFILE':
        return !!user;
      
      case 'SEND_FRIEND_REQUEST':
        return !!user && user.id !== context.targetUserId;
      
      default:
        console.warn(`Unknown permission: ${permission}`);
        return false;
    }
  };

  return {
    checkPermission,
    hasRole,
    isGroupAdmin,
    isGroupMember,
    canPerformAction
  };
};