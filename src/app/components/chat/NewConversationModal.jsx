"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";

export default function NewConversationModal({
  isOpen,
  onClose,
  onConversationCreated,
  currentUser,
}) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useAuth();

  // Demo users - for testing purposes
  const demoUsers = [
    {
      _id: "demo1",
      username: "alice_demo",
      email: "alice@demo.com",
      profilePicture: "/images/no-avatar.jpg",
    },
    {
      _id: "demo2",
      username: "bob_demo",
      email: "bob@demo.com",
      profilePicture: "/images/no-avatar.jpg",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching users with token:", !!token);

      if (!token) {
        console.log("No token found");
        setUsers(demoUsers);
        setFilteredUsers(demoUsers);
        return;
      }

      // Try to get users from posts
      const response = await axios.get("http://localhost:3001/api/posts", {
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      });

      console.log("Posts response:", response.data);

      // Extract unique users from posts
      const uniqueUsers = [];
      const userIds = new Set();

      response.data.forEach((post) => {
        if (
          post.author &&
          post.author._id !== currentUser._id &&
          !userIds.has(post.author._id)
        ) {
          userIds.add(post.author._id);
          uniqueUsers.push(post.author);
        }
      });

      console.log("Unique users found:", uniqueUsers.length);

      if (uniqueUsers.length === 0) {
        // If no users found in posts, use demo users
        console.log("No users found in posts, using demo users");
        setUsers(demoUsers);
        setFilteredUsers(demoUsers);
      } else {
        setUsers(uniqueUsers);
        setFilteredUsers(uniqueUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);

      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Failed to load users.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async () => {
    if (!selectedUser || isCreating) return;

    setIsCreating(true);
    try {
      // Create consistent chatIdentifier (same as backend)
      const chatIdentifier = [currentUser._id, selectedUser._id]
        .sort()
        .join("_");

      // Create conversation object
      const newConversation = {
        chatIdentifier,
        otherParticipant: selectedUser,
        lastMessage: null,
        participants: [currentUser, selectedUser],
      };

      console.log("Creating conversation:", newConversation);
      onConversationCreated(newConversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to create conversation. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content"
          style={{ backgroundColor: "#2c2c2c", border: "1px solid #444" }}
        >
          <div
            className="modal-header"
            style={{ borderBottom: "1px solid #444" }}
          >
            <h5 className="modal-title text-white">
              <i class="bi bi-chat"></i> Start New Conversation
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              style={{ filter: "invert(1)" }}
            ></button>
          </div>
          <div className="modal-body">
            {/* Error Message */}
            {error && (
              <div
                className="alert alert-warning alert-dismissible fade show"
                role="alert"
              >
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                ></button>
              </div>
            )}

            {/* Search Input */}
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: "#3c3c3c",
                  border: "1px solid #555",
                  color: "white",
                }}
              />
            </div>

            {/* Users List */}
            <div
              className="users-list"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              {isLoading ? (
                <div className="text-center p-3">
                  <div
                    className="spinner-border spinner-border-sm text-primary"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center p-3 text-muted">
                  {searchTerm ? "No users found" : "No users available"}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className={`d-flex align-items-center p-2 rounded mb-2 ${
                      selectedUser?._id === user._id
                        ? "bg-primary text-white"
                        : ""
                    }`}
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        selectedUser?._id === user._id ? "#8b5cf6" : "#3c3c3c",
                      border: "1px solid #555",
                    }}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div>
                      <div className="fw-semibold text-white">
                        {user.username}
                      </div>
                      <small
                        className={
                          selectedUser?._id === user._id
                            ? "text-white-50"
                            : "text-muted"
                        }
                      >
                        {user.email}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="modal-footer" style={{ borderTop: "1px solid #444" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={createConversation}
              disabled={!selectedUser || isCreating}
              style={{ backgroundColor: "#8b5cf6", borderColor: "#8b5cf6" }}
            >
              {isCreating ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Creating...
                </>
              ) : (
                "Start Chat"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
