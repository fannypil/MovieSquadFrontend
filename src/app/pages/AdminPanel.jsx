"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import TopGenresChart from "../components/TopGenresChart ";
import AppStatsChart from "../components/AppStatsChart";
import CanvasLoader from "../components/CanvasLoader";

export default function AdminPanel() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch users and stats
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      axios.get("http://localhost:3001/api/admin/users", {
        headers: { "x-auth-token": token },
      }),
      axios.get("http://localhost:3001/api/stats/summary", {
        headers: { "x-auth-token": token },
      }),
    ])
      .then(([usersRes, statsRes]) => {
        setUsers(usersRes.data);
        setStats(statsRes.data);
      })
      .catch((err) => setError("Failed to load admin data"))
      .finally(() => setLoading(false));
  }, [token]);

  // Edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
      bio: user.bio || "",
      profilePicture: user.profilePicture || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await axios.put(
        `http://localhost:3001/api/admin/users/${selectedUser._id}`,
        editForm,
        { headers: { "x-auth-token": token } }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === res.data._id ? res.data : u))
      );
      setSelectedUser(null);
    } catch (err) {
      alert("Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setActionLoading(true);
    try {
      await axios.delete(
        `http://localhost:3001/api/admin/users/${userId}`,
        { headers: { "x-auth-token": token } }
      );
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      alert("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">Access denied. Admins only.</div>
      </div>
    );
  }

 if (loading) {
  return (
    <CanvasLoader fullscreen={true} text="Loading admin panel..." />
  );
}

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Users List */}
        <div className="col-lg-7 mb-4">
          <div className="card glass-card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h3 className="h5 fw-bold text-white mb-0">
                  <i class="bi bi-people me-2 text-warning"></i> Users</h3>
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
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <img
                          src={u.profilePicture || "https://www.w3schools.com/howto/img_avatar.png"}
                          alt={u.username}
                          className="rounded-circle"
                          style={{ width: 40, height: 40, objectFit: "cover" }}
                        />
                      </td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge bg-${u.role === "admin" ? "warning" : u.role === "groupAdmin" ? "info" : "secondary"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-info btn-sm me-2"
                          onClick={() => handleEditUser(u)}
                          disabled={actionLoading}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={actionLoading}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Edit Modal */}
          {selectedUser && (
            <div className="modal show d-block" tabIndex="-1">
              <div className="modal-dialog">
                <div className="modal-content glass-card">
                  <div className="modal-header">
                    <h5 className="modal-title">Edit User</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSelectedUser(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form>
                      <div className="mb-2">
                        <label className="form-label">Username</label>
                        <input
                          type="text"
                          name="username"
                          className="form-control"
                          value={editForm.username}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          value={editForm.email}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Role</label>
                        <select
                          name="role"
                          className="form-select"
                          value={editForm.role}
                          onChange={handleEditChange}
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
                          value={editForm.bio}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Profile Picture URL</label>
                        <input
                          type="text"
                          name="profilePicture"
                          className="form-control"
                          value={editForm.profilePicture}
                          onChange={handleEditChange}
                        />
                      </div>
                    </form>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedUser(null)}
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleUpdateUser}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Statistics */}
        <div className="col-lg-5">
          <div className="card glass-card mb-4">
            <div className="card-header">
             <h3 className="h5 fw-bold text-white mb-0">
                    <i className="bi bi-bar-chart-line me-2 text-warning"></i> App Statistics
                </h3>
            </div>
            <div className="card-body">
              {stats && <AppStatsChart stats={stats} />}
                    <TopGenresChart />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}