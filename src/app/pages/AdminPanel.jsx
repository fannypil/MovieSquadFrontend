"use client";
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import UserTable from "../components/admin/UserTable";
import EditUserModal from "../components/admin/EditUserModal";
import StatsAdmin from "../components/admin/StatsAdmin";
import UserData, { useUserData } from "../components/admin/UserData";

// AdminPanel Container
export default function AdminPanel() {
  const { user } = useAuth();

  // Access denied if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">Access denied. Admins only.</div>
      </div>
    );
  }

  return (
    <UserData>
      <AdminPanelContent />
    </UserData>
  );
}

// Content component that uses the context
function AdminPanelContent() {
  const { users, stats, updateUser, deleteUser } = useUserData();
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Handler for edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
  };

  // Handler for update user
  const handleUpdateUser = async (userId, userData) => {
    setActionLoading(true);
    const result = await updateUser(userId, userData);
    if (result.success) {
      setSelectedUser(null);
    } else {
      alert(`Failed to update user: ${result.error}`);
    }
    setActionLoading(false);
  };

  // Handler for delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setActionLoading(true);
    const result = await deleteUser(userId);
    if (!result.success) {
      alert(`Failed to delete user: ${result.error}`);
    }
    setActionLoading(false);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Users List */}
        <div className="col-lg-7 mb-4">
          <UserTable
            users={users}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            isLoading={actionLoading}
          />

          {/* Edit Modal */}
          <EditUserModal
            user={selectedUser}
            onSave={handleUpdateUser}
            onCancel={() => setSelectedUser(null)}
            isLoading={actionLoading}
          />
        </div>

        {/* Statistics */}
        <div className="col-lg-5">
          <StatsAdmin stats={stats} />
        </div>
      </div>
    </div>
  );
}
