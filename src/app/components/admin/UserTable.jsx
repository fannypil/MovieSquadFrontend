"use client";
import React from "react";
import UserRow from "./UserRow";

export default function UserTable({ users, onEdit, onDelete, isLoading }) {
  return (
    <div className="card glass-card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="h5 fw-bold text-white mb-0">
          <i className="bi bi-people me-2 text-warning"></i> Users
        </h3>
        <span className="badge bg-info">{users.length} total</span>
      </div>
      <div className="card-body p-0">
        <table className="table table-dark table-hover mb-0">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow
                key={user._id}
                user={user}
                onEdit={onEdit}
                onDelete={onDelete}
                isLoading={isLoading}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
