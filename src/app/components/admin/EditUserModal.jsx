"use client";
import React, { useState, useEffect } from "react";

export default function EditUserModal({ user, onSave, onCancel, isLoading }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "",
    bio: "",
    profilePicture: "",
  });

  // Initialize form when user changes
  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        email: user.email || "",
        role: user.role || "user",
        bio: user.bio || "",
        profilePicture: user.profilePicture || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user._id, form);
  };

  if (!user) return null;

  return (
    <div className="modal show d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content glass-card">
          <div className="modal-header">
            <h5 className="modal-title">Edit User</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancel}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Role</label>
                <select
                  name="role"
                  className="form-select"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="user">User</option>
                  <option value="groupAdmin">Group Admin</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="form-label">Bio</label>
                <textarea
                  name="bio"
                  className="form-control"
                  value={form.bio}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Profile Picture URL</label>
                <input
                  type="text"
                  name="profilePicture"
                  className="form-control"
                  value={form.profilePicture}
                  onChange={handleChange}
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
