"use client";
import React, { useState, useEffect } from "react";
import BaseModal from "../BaseModal";
import { SaveCancelFooter } from "../ModalFooters";

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
    <BaseModal
      isOpen={true}
      onClose={onCancel}
      title="Edit User"
      isLoading={isLoading}
      theme="dark"
      footer={
        <SaveCancelFooter
          onCancel={onCancel}
          onSave={handleSubmit}
          isLoading={isLoading}
        />
      }
    >
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
    </BaseModal>
  );
}