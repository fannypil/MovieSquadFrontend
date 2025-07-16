"use client"

import React, { useState } from "react";
import FriendCard from "../friends/FriendCard";
import InviteToGroupModal from "./InviteToGroupModal";

export default function GroupMembersContent({ group, members, currentUser }) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const isAdmin = group?.admin?._id === currentUser?._id || group?.admin?.id === currentUser?.id;
  const isMember = members.some(m => (m._id || m.id) === currentUser._id);

  const handleRemoveMember = async (memberId) => {
    try {
      // TODO: Implement remove member API call
      console.log('Removing member:', memberId, 'from group:', group._id);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };
    const handleInviteSent = () => {
    setShowInviteModal(false);
    // Optionally show success message or refresh data
    console.log('Invitations sent successfully!');
  };
    return (
    <>
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="text-white mb-0">
              <i className="bi bi-people-fill me-2"></i>Members ({members.length})
            </h5>          
          {/* Invite Button - Show for admins and members */}
          {(isAdmin || isMember) && (
            <button 
              className="btn btn-warning btn-sm"
              onClick={() => setShowInviteModal(true)}
            >
            <i className="bi bi-envelope-plus me-2"></i>Invite Members
            </button>
          )}
        </div>

        {/* Existing member cards */}
        <div className="row">
          {members.map(member => (
            <div key={member._id || member.id} className="col-md-6 col-lg-4 mb-3">
              <FriendCard
                friend={member}
                variant="member"
                groupData={{
                  groupId: group._id,
                  groupName: group.name,
                  adminId: group.admin?._id || group.admin?.id,
                  isCurrentUserAdmin: isAdmin,
                  createdAt: group.createdAt
                }}
                onRemoveFriend={handleRemoveMember}
                showActions={true}
              />
            </div>
          ))}
        </div>

        {members.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">No members found.</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <InviteToGroupModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        group={group}
        currentMembers={members}
        onInviteSent={handleInviteSent}
      />
    </>
  );
}