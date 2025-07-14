"use client"

import React from "react"
import EntityHeader from "../EntityHeader"

export default function ProfileHeader({ 
  user, 
  onUserUpdated, 
  onPostCreated, 
  isOwnProfile = true, 
  currentUser, 
  isGroupView = false, 
  groupId = null,
  onGroupJoined,
  onGroupLeft,
  onManageGroup
}) {
  
  // If this is a group view, pass the group data appropriately
  if (isGroupView) {
    return (
      <EntityHeader
        entity={user}
        type="group"
        currentUser={currentUser}
        onEntityUpdated={onUserUpdated}
        onPostCreated={onPostCreated}
        isOwnEntity={isOwnProfile}
        groupId={groupId}
        onGroupJoined={onGroupJoined}
        onGroupLeft={onGroupLeft}
        onManageGroup={onManageGroup}
      />
    )
  }

  // For regular profile view
  return (
    <EntityHeader
      entity={user}
      type="profile"
      currentUser={currentUser}
      onEntityUpdated={onUserUpdated}
      onPostCreated={onPostCreated}
      isOwnEntity={isOwnProfile}
    />
  )
}