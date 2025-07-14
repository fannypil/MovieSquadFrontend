"use client"

import { useAuth } from '@/app/hooks/useAuth';
import React from 'react';
import { Link } from 'react-router-dom';
import ConditionalRender from '../auth/ConditionalRender';
import AuthorizedButton from '../auth/AuthorizedButton';

const FriendCard = ({ friend, onRemoveFriend, variant = "friend", groupData = null, showActions = true }) => {
  const { user } = useAuth();

  const handleRemove = () => {
    if (variant === "friend") {
      if (window.confirm(`Remove ${friend.username} from your friends?`)) {
        onRemoveFriend(friend._id);
      }
    } else if (variant === "member" && groupData) {
      if (window.confirm(`Remove ${friend.username} from ${groupData.groupName}?`)) {
        onRemoveFriend(friend._id);
      }
    }
  };

  const isGroupAdmin = groupData?.isCurrentUserAdmin;
  const isMemberAdmin = (friend._id === groupData?.adminId || friend.id === groupData?.adminId);

  // Avatar display component
  const renderAvatar = () => {
    if (friend.profilePicture) {
      return (
        <img 
          src={friend.profilePicture}
          alt={`${friend.username}'s avatar`}
          className="rounded-circle"
          style={{ 
            width: '60px', 
            height: '60px',
            objectFit: 'cover'
          }}
        />
      );
    }

    // Fallback to initial if no profile picture
    return (
      <div 
        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
        style={{ 
          width: '60px', 
          height: '60px', 
          fontSize: '1.5rem',
          backgroundColor: '#6c757d' // Default gray color
        }}
      >
        <i className="bi bi-person"></i>
      </div>
    );
  };

  return (
    <div className="card h-100" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
      <div className="card-body d-flex flex-column">
        {/* Avatar and Info */}
        <div className="text-center mb-3">
          <div className="mx-auto mb-2">
            {renderAvatar()}
          </div>
          
          <h6 className="text-white mb-1">
            {friend.username || friend.name || 'Unknown User'}
            {/* Show admin badge for members */}
            {variant === "member" && isMemberAdmin && (
              <span className="badge bg-warning ms-2">Admin</span>
            )}
          </h6>
          
          <p className="text-white small">
            {variant === "friend" 
              ? friend.email 
              : `Joined ${new Date(friend.joinedAt || groupData?.createdAt).toLocaleDateString()}`
            }
          </p>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="mt-auto">
            <div className="d-grid gap-2">
              <Link
                to={`/profile/${friend._id || friend.id}`}
                className="btn btn-outline-info btn-sm"
              >
                <i className="bi bi-person me-2"></i>
                View Profile
              </Link>
              
              {/* Friend-specific actions */}
              {variant === "friend" && (
                <ConditionalRender
                  permission="SEND_FRIEND_REQUEST"
                  context={{ targetUserId: friend._id }}
                >
                  <AuthorizedButton
                    permission="SEND_FRIEND_REQUEST"
                    context={{ targetUserId: friend._id }}
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleRemove}
                  >
                    <i className="bi bi-person-dash me-2"></i>
                    Remove Friend
                  </AuthorizedButton>
                </ConditionalRender>
              )}

              {/* Member-specific actions - only for group admins */}
              {variant === "member" && isGroupAdmin && !isMemberAdmin && (
                <ConditionalRender
                  permission="MANAGE_GROUP_MEMBERS"
                  context={{ groupId: groupData?.groupId }}
                >
                  <AuthorizedButton
                    permission="MANAGE_GROUP_MEMBERS"
                    context={{ groupId: groupData?.groupId }}
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleRemove}
                  >
                    <i className="bi bi-person-x me-2"></i>
                    Remove from Group
                  </AuthorizedButton>
                </ConditionalRender>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendCard;