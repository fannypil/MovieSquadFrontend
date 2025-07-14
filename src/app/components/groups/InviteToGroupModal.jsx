"use client"

import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@/app/hooks/useAuth";
import UserSearch from "../friends/UserSearch";

export default function InviteToGroupModal({ isOpen, onClose, group, currentMembers, onInviteSent }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const { token } = useAuth();

  // Get current member IDs to exclude from search
  const memberIds = currentMembers.map(m => m._id || m.id);

  const handleUserSelect = (user) => {
    // Check if user is already a member
    if (memberIds.includes(user._id || user.id)) {
      alert(`${user.username} is already a member of this group.`);
      return;
    }

    // Check if user is already selected
    const isSelected = selectedUsers.some(u => (u._id || u.id) === (user._id || user.id));
    
    if (isSelected) {
      // Remove from selection
      setSelectedUsers(prev => prev.filter(u => (u._id || u.id) !== (user._id || user.id)));
    } else {
      // Add to selection
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleSendInvites = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to invite.');
      return;
    }

    try {
      setIsSending(true);
      
      // Send invites using your existing backend endpoint
      const invitePromises = selectedUsers.map(user =>
        axios.post(`http://localhost:3001/api/groups/${group._id}/invite`, 
          { inviteeId: user._id || user.id },
          { headers: { 'x-auth-token': token } }
        )
      );

      await Promise.all(invitePromises);
      
      alert(`Successfully sent ${selectedUsers.length} invitation(s) to ${group.name}!`);
      
      // Reset and close
      setSelectedUsers([]);
      onInviteSent?.();
      
    } catch (error) {
      console.error('Error sending invites:', error);
      const errorMsg = error.response?.data?.msg || 'Failed to send invitations';
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
          <div className="modal-header border-bottom border-secondary">
            <h5 className="modal-title text-white">
               Invite Users to "{group.name}"
              {group.isPrivate && <span className="badge bg-warning ms-2">
                <i class="bi bi-lock-fill"></i> Private </span>}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Selected Users Display */}
            {selectedUsers.length > 0 && (
              <div className="mb-3">
                <h6 className="text-white">Selected Users ({selectedUsers.length}):</h6>
                <div className="d-flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <span 
                      key={user._id || user.id} 
                      className="badge bg-primary d-flex align-items-center gap-1"
                      style={{ fontSize: '0.9rem', padding: '0.5rem' }}
                    >
                      {user.username}
                      <button 
                        className="btn-close btn-close-white btn-sm"
                        style={{ fontSize: '0.6rem' }}
                        onClick={() => handleUserSelect(user)}
                      ></button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* User Search Component */}
            <div style={{ minHeight: '400px' }}>
              <UserSearch 
                onUserSelect={handleUserSelect}
                selectedUsers={selectedUsers}
                excludeUserIds={memberIds} 
                variant="invite"
                placeholder="Search users to invite..."
                showSelectedBadge={true}
              />
            </div>
          </div>
          
          <div className="modal-footer border-top border-secondary">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
              disabled={isSending}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSendInvites}
              disabled={selectedUsers.length === 0 || isSending}
            >
              {isSending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Sending Invites...
                </>
              ) : (
                ` Send ${selectedUsers.length} Invitation${selectedUsers.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}