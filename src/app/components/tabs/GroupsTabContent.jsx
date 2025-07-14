"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateGroupForm from "../groups/CreateGroupForm";
import EmptyState from "../EmptyState";
import GroupList from "../groups/GroupList";


export default function GroupsTabContent({ currentUser, onViewGroup }) {
  const [userGroups, setUserGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/groups", {
        headers: { "x-auth-token": token },
      });
      
      const allGroups = response.data;
      const currentUserId = currentUser?.id || currentUser?._id;
      
      const filteredGroups = allGroups.filter(group => {
        const isCreator = (group.admin?._id || group.admin?.id || group.admin) === currentUserId;
        const isMember = group.members && group.members.some(member => {
          const memberId = member._id || member.id || member;
          return memberId === currentUserId;
        });
        return isCreator || isMember;
      });
      
      setUserGroups(filteredGroups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      setUserGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupCreated = (newGroup) => {
    setUserGroups(prev => [newGroup, ...prev]);
    setShowCreateGroup(false);
  };

  const handleGroupJoined = (groupId) => {
    fetchUserGroups();
  };

  const handleGroupLeft = (groupId) => {
    setUserGroups(prev => prev.filter(group => group._id !== groupId));
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="text-white mb-0">👥 My Groups ({userGroups.length})</h5>
        <button
          className="btn btn-warning btn-sm"
          onClick={() => setShowCreateGroup(!showCreateGroup)}
        >
          {showCreateGroup ? '❌ Cancel' : '➕ Create Group'}
        </button>
      </div>

      {/* Create Group Form */}
      {showCreateGroup && (
        <div className="card mb-4" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
          <div className="card-body">
            <h6 className="text-white mb-3">✨ Create New Group</h6>
            <CreateGroupForm
              currentUser={currentUser}
              onGroupCreated={handleGroupCreated}
              onCancel={() => setShowCreateGroup(false)}
            />
          </div>
        </div>
      )}

      {/* Groups List */}
      {userGroups.length === 0 ? (
        <EmptyState 
          icon="people"
          title="No groups found"
          description="Create or join some groups to see them here!"
          showButton={false}
        />
      ) : (
        <GroupList
          groups={userGroups}
          currentUser={currentUser}
          onGroupJoined={handleGroupJoined}
          onGroupLeft={handleGroupLeft}
          onViewGroup={onViewGroup}
        />
      )}
    </div>
  );
}