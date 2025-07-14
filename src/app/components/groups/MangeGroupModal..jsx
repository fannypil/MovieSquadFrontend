"use client"

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/app/hooks/useAuth";

export default function MangeGroupModal({ group, isOpen, onClose, onGroupUpdated, onGroupDeleted }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    name: group?.name || "",
    description: group?.description || "",
    isPrivate: group?.isPrivate || false,
  });
  const [members, setMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("details");

  // Fetch group data on open
  useEffect(() => {
    if (!isOpen || !group?._id) return;
    setForm({
      name: group.name,
      description: group.description,
      isPrivate: group.isPrivate,
    });
    fetchMembers();
    fetchPendingRequests();
    fetchWatchlist();
  // eslint-disable-next-line
  }, [isOpen, group?._id]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3001/api/groups/${group._id}`);
      setMembers(res.data.members || []);
    } catch (e) {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3001/api/groups/${group._id}/requests`, {
        headers: { "x-auth-token": token },
      });
      setPendingRequests(res.data || []);
    } catch (e) {
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3001/api/groups/${group._id}/watchlist`, {
        headers: { "x-auth-token": token },
      });
      setWatchlist(res.data || []);
    } catch (e) {
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(
        `http://localhost:3001/api/groups/${group._id}`,
        form,
        { headers: { "x-auth-token": token } }
      );
      onGroupUpdated?.(res.data);
      alert("Group updated!");
      onClose();
    } catch (e) {
      alert("Failed to update group.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    setLoading(true);
    try {
      await axios.delete(`http://localhost:3001/api/groups/${group._id}`, {
        headers: { "x-auth-token": token },
      });
      onGroupDeleted?.(group._id);
      alert("Group deleted.");
      onClose();
    } catch (e) {
      alert("Failed to delete group.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (userId) => {
    await axios.put(`http://localhost:3001/api/groups/${group._id}/requests/${userId}/accept`, {}, {
      headers: { "x-auth-token": token },
    });
    fetchPendingRequests();
    fetchMembers();
  };

  const handleRejectRequest = async (userId) => {
    await axios.put(`http://localhost:3001/api/groups/${group._id}/requests/${userId}/reject`, {}, {
      headers: { "x-auth-token": token },
    });
    fetchPendingRequests();
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Remove this member from the group?")) return;
    await axios.delete(`http://localhost:3001/api/groups/${group._id}/members/${userId}`, {
      headers: { "x-auth-token": token },
    });
    fetchMembers();
  };

  const handleRemoveWatchlistItem = async (tmdbId, tmdbType) => {
    await axios.delete(`http://localhost:3001/api/groups/${group._id}/watchlist/${tmdbId}/${tmdbType}`, {
      headers: { "x-auth-token": token },
    });
    fetchWatchlist();
  };

  if (!isOpen) return null;

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={{ background: "#23272b", color: "#fff" }}>
          <div className="modal-header">
            <h5 className="modal-title">Manage Group</h5>
            <button className="btn-close btn-close-white" onClick={onClose} disabled={loading}></button>
          </div>
          <div className="modal-body">
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button className={`nav-link ${tab === "details" ? "active" : ""}`} onClick={() => setTab("details")}>Details</button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${tab === "members" ? "active" : ""}`} onClick={() => setTab("members")}>Members</button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${tab === "requests" ? "active" : ""}`} onClick={() => setTab("requests")}>Join Requests</button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${tab === "watchlist" ? "active" : ""}`} onClick={() => setTab("watchlist")}>Watchlist</button>
              </li>
            </ul>

            {tab === "details" && (
              <form onSubmit={handleUpdateGroup}>
                <div className="mb-3">
                  <label className="form-label">Group Name</label>
                  <input className="form-control" name="name" value={form.name} onChange={handleFormChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" name="description" value={form.description} onChange={handleFormChange} rows={3} />
                </div>
                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" name="isPrivate" checked={form.isPrivate} onChange={handleFormChange} id="isPrivateCheck" />
                  <label className="form-check-label" htmlFor="isPrivateCheck">
                    Private Group
                  </label>
                </div>
                <button className="btn btn-primary me-2" type="submit" disabled={loading}>Save Changes</button>
                <button className="btn btn-danger" type="button" onClick={handleDeleteGroup} disabled={loading}>Delete Group</button>
              </form>
            )}

            {tab === "members" && (
              <div>
                <h6>Members</h6>
                {members.length === 0 && <div className="text-muted">No members.</div>}
                <ul className="list-group">
                  {members.map((member) => (
                    <li key={member._id} className="list-group-item d-flex align-items-center justify-content-between" style={{ background: "#23272b", color: "#fff" }}>
                      <div>
                        {member.profilePicture ? (
                          <img src={member.profilePicture} alt={member.username} className="rounded-circle me-2" style={{ width: 32, height: 32, objectFit: "cover" }} />
                        ) : (
                          <span className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32 }}>
                            <i className="bi bi-person text-white"></i>
                          </span>
                        )}
                        {member.username}
                      </div>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveMember(member._id)} disabled={loading}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === "requests" && (
              <div>
                <h6>Pending Join Requests</h6>
                {pendingRequests.length === 0 && <div className="text-muted">No pending requests.</div>}
                <ul className="list-group">
                  {pendingRequests.map((user) => (
                    <li key={user._id} className="list-group-item d-flex align-items-center justify-content-between" style={{ background: "#23272b", color: "#fff" }}>
                      <div>
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt={user.username} className="rounded-circle me-2" style={{ width: 32, height: 32, objectFit: "cover" }} />
                        ) : (
                          <span className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32 }}>
                            <i className="bi bi-person text-white"></i>
                          </span>
                        )}
                        {user.username}
                      </div>
                      <div>
                        <button className="btn btn-success btn-sm me-2" onClick={() => handleAcceptRequest(user._id)} disabled={loading}>Accept</button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleRejectRequest(user._id)} disabled={loading}>Reject</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tab === "watchlist" && (
              <div>
                <h6>Shared Watchlist</h6>
                {watchlist.length === 0 && <div className="text-muted">No items in watchlist.</div>}
                <ul className="list-group">
                  {watchlist.map((item) => (
                    <li key={item.tmdbId + item.tmdbType} className="list-group-item d-flex align-items-center justify-content-between" style={{ background: "#23272b", color: "#fff" }}>
                      <div>
                        {item.tmdbPosterPath ? (
                          <img src={item.tmdbPosterPath} alt={item.tmdbTitle} className="me-2" style={{ width: 32, height: 48, objectFit: "cover" }} />
                        ) : (
                          <span className="rounded bg-secondary d-inline-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 48 }}>
                            <i className="bi bi-film text-white"></i>
                          </span>
                        )}
                        {item.tmdbTitle}
                      </div>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemoveWatchlistItem(item.tmdbId, item.tmdbType)} disabled={loading}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}