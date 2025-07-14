"use client"

import React, { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import EditProfileModal from "./profile/EditProfileModal"
import ProfileSettingsModal from "./profile/ProfileSettingsModal"
import AddPostModal from "./posts/AddPostModal"
import FavoriteGenres from "./profile/FavoriteGenres"
import ConditionalRender from "./auth/ConditionalRender"
import AuthorizedButton from "./auth/AuthorizedButton"
import ProfileStats from "./profile/ProfileStats"
import JoinGroupButton from "./groups/JoinGroupButton"
import MangeGroupModal from "./groups/MangeGroupModal."


export default function EntityHeader({ 
  entity, 
  type = "profile", // "profile" | "group"
  currentUser,
  onEntityUpdated, 
  onPostCreated, 
  isOwnEntity = true,
  groupId = null,
  onGroupJoined,
  onGroupLeft,
  onManageGroup 
}) {
  const { user: authUser } = useAuth()
  const authenticatedUser = authUser || currentUser

  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showManageGroupModal, setShowManageGroupModal] = useState(false);

  // Entity-specific data extraction
  const isGroup = type === "group"
  const entityName = isGroup ? entity?.name : entity?.username
  const entityEmail = isGroup ? `Created by ${entity?.admin?.username || 'Unknown'}` : entity?.email
  const entityBio = isGroup ? entity?.description : entity?.bio
  const entityAvatar = entity?.profilePicture || entity?.avatar

  // Group-specific data
  const isGroupAdmin = isGroup && (
    entity?.admin?._id === authenticatedUser?._id || 
    entity?.admin?.id === authenticatedUser?.id
  )
  const isGroupMember = isGroup && entity?.members?.some(member => 
    (member._id || member.id || member) === (authenticatedUser._id || authenticatedUser.id)
  )
  const isGroupCreator = isGroupAdmin // For groups, admin is typically the creator

  // Render entity avatar
  const renderEntityAvatar = () => {
    if (entityAvatar) {
      return (
        <div 
          className="rounded-circle position-relative"
          style={{ 
            width: '100px', 
            height: '100px',
            border: '4px solid rgba(245, 158, 11, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden'
          }}
        >
          <img 
            src={entityAvatar}
            alt={`${entityName}'s avatar`}
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {isGroup && (
            <div 
              className="position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#f59e0b',
                border: '3px solid #1a1a1a',
                fontSize: '14px'
              }}
            >
              <i className="bi bi-people-fill text-dark"></i>
            </div>
          )}
        </div>
      );
    }

    // Fallback to initials/icon if no avatar
    return (
      <div 
        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold position-relative"
        style={{ 
          width: '100px', 
          height: '100px', 
          fontSize: '2.5rem',
          backgroundColor: '#6c757d',
          border: '4px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        {isGroup ? (
          <i className="bi bi-people-fill"></i>
        ) : (
          <i className="bi bi-person"></i>
        )}
        {isGroup && (
          <div 
            className="position-absolute bottom-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#f59e0b',
              border: '3px solid #1a1a1a',
              fontSize: '14px'
            }}
          >
            <i className="bi bi-people-fill text-dark"></i>
          </div>
        )}
      </div>
    );
  }

  const getBioText = () => {
    if (entityBio && entityBio.trim()) {
      return isGroup ? entityBio : `"${entityBio}"`
    }
    if (isGroup) {
      return "No description added yet."
    }
    return isOwnEntity ? "No bio added yet. Click \"Edit Profile\" to add one!" : "No bio added yet."
  }

  const getEntityStats = () => {
    if (isGroup) {
      return (
        <div className="d-flex flex-wrap gap-3 text-light small">
          <span>
            <i className="bi bi-people-fill me-1 text-warning"></i>
            {entity?.members?.length || 0} members
          </span>
          <span>
            <i className="bi bi-calendar-date me-1 text-warning"></i>
            Created {new Date(entity?.createdAt || Date.now()).toLocaleDateString()}
          </span>
          <span>
            <i className="bi bi-chat-text me-1 text-warning"></i>
            {entity?.postsCount || 0} posts
          </span>
          {entity?.isPrivate && (
            <span>
              <i className="bi bi-lock-fill me-1 text-warning"></i>
              Private
            </span>
          )}
        </div>
      )
    }
    return <ProfileStats userId={entity?.id || entity?._id} />
  }

  const renderActionButtons = () => {
    const buttons = []

    // Create Post Button
    if (authenticatedUser && onPostCreated) {
      if (isGroup) {
        // For groups: only if user is member or admin
        if (isGroupMember || isGroupAdmin) {
          buttons.push(
            <button 
              key="create-post"
              className="btn btn-gold d-flex align-items-center gap-2"
              onClick={() => setShowCreatePost(true)}
            >
              <i className="bi bi-plus-circle"></i>
              Post in Group
            </button>
          )
        }
      } else {
        // For profiles: only if it's the user's own profile
        if (isOwnEntity) {
          buttons.push(
            <button 
              key="create-post"
              className="btn btn-gold d-flex align-items-center gap-2"
              onClick={() => setShowCreatePost(true)}
            >
              <i className="bi bi-plus-circle"></i>
              Create Post
            </button>
          )
        }
      }
    }

    if (isGroup) {
      // Group-specific buttons
      if (isGroupAdmin) {
        buttons.push(
          <button 
            key="manage-group"
            className="btn btn-outline-warning d-flex align-items-center gap-2"
            onClick={() => setShowManageGroupModal(true)}
          >
            <i className="bi bi-gear-fill"></i>
            Manage Group
          </button>
        )
      }

      if (!isGroupMember && !isGroupAdmin && authenticatedUser) {
        buttons.push(
          <JoinGroupButton
            key="join-group"
            groupId={groupId || entity?._id}
            groupName={entityName}
            isPrivate={entity?.isPrivate}
            isMember={isGroupMember}
            isCreator={isGroupCreator}
            onJoined={onGroupJoined}
            onLeft={onGroupLeft}
          />
        )
      }

      if (isGroupMember && !isGroupAdmin) {
        buttons.push(
          <JoinGroupButton
            key="leave-group"
            groupId={groupId || entity?._id}
            groupName={entityName}
            isPrivate={entity?.isPrivate}
            isMember={true}
            isCreator={false}
            onJoined={onGroupJoined}
            onLeft={onGroupLeft}
          />
        )
      }
    } else {
      // Profile-specific buttons
      if (isOwnEntity) {
        buttons.push(
          <ConditionalRender
            key="edit-profile"
            permission="EDIT_PROFILE"
            context={{ profileOwnerId: entity?.id || entity?._id }}
          >
            <AuthorizedButton
              permission="EDIT_PROFILE"
              context={{ profileOwnerId: entity?.id || entity?._id }}
              className="btn btn-outline-info d-flex align-items-center gap-2"
              onClick={() => setShowEditProfile(true)}
            >
              <i className="bi bi-pencil"></i>
              Edit Profile
            </AuthorizedButton>
          </ConditionalRender>
        )

        buttons.push(
          <ConditionalRender
            key="settings"
            permission="MANAGE_PROFILE_SETTINGS"
            context={{ profileOwnerId: entity?.id || entity?._id }}
          >
            <AuthorizedButton
              permission="MANAGE_PROFILE_SETTINGS"
              context={{ profileOwnerId: entity?.id || entity?._id }}
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={() => setShowSettings(true)}
            >
              <i className="bi bi-gear"></i>
              Settings
            </AuthorizedButton>
          </ConditionalRender>
        )
      }
    }

    return (
      <div className="d-flex flex-column gap-2">
        {buttons}
      </div>
    )
  }

  return (
    <>
      <div className="glass-card mb-4">
        <div className="card-body p-4">
          <div className="row align-items-center">
            {/* Avatar */}
            <div className="col-auto">
              {renderEntityAvatar()}
            </div>

            {/* Entity Info */}
            <div className="col">
              <div className="d-flex align-items-center gap-3 mb-2">
                <h1 className="h2 text-white mb-0 fw-bold">
                  {entityName}
                </h1>
                {isGroup && entity?.isPrivate && (
                  <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                    <i className="bi bi-lock-fill"></i>
                    Private
                  </span>
                )}
                {isGroup && isGroupAdmin && (
                  <span className="badge bg-success d-flex align-items-center gap-1">
                    <i className="bi bi-crown-fill"></i>
                    Admin
                  </span>
                )}
              </div>

              <p className="text-light mb-3 opacity-75">{entityEmail}</p>

              {/* Bio/Description */}
              <div className="mb-3">
                <p className={`mb-0 ${entityBio && entityBio.trim() ? 'text-light' : 'text-muted'}`} 
                   style={{ fontStyle: !isGroup && entityBio ? 'italic' : 'normal' }}>
                  {getBioText()}
                </p>
              </div>

              {/* Stats */}
              <div className="mb-3">
                {getEntityStats()}
              </div>

              {/* Favorite Genres - Only for profiles */}
              {!isGroup && (
                <div className="d-flex align-items-center gap-3">
                  <h6 className="text-white mb-0 small">
                    <i className="bi bi-heart-fill me-2 text-warning"></i>
                    Favorite Genres:
                  </h6>
                  <FavoriteGenres />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="col-auto">
              {renderActionButtons()}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {!isGroup && (
        <>
          <EditProfileModal
            isOpen={showEditProfile}
            onClose={() => setShowEditProfile(false)}
            currentUser={entity}
            onUserUpdated={onEntityUpdated}
          />
          
          <ProfileSettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            currentUser={entity}
          />
        </>
      )}

      <AddPostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={onPostCreated}
        groupId={isGroup ? (groupId || entity?._id) : undefined}
      />
      {isGroup && (
        <MangeGroupModal
          group={entity}
          isOpen={showManageGroupModal}
          onClose={() => setShowManageGroupModal(false)}
          onGroupUpdated={(updatedGroup) => {
            // Optionally update group info in parent or refetch
            setShowManageGroupModal(false);
          }}
          onGroupDeleted={() => {
            setShowManageGroupModal(false);
            // Optionally redirect or update parent state
          }}
        />
      )}
    </>
  )
}