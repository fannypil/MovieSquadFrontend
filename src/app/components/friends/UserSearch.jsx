"use client";

import { useState } from "react";
import axios from "axios";
import AddFriendButton from "./AddFriendButton";
import { useAuth } from "@/app/hooks/useAuth";

export default function UserSearch({
  onUserSelect,
  selectedUsers = [],
  excludeUserIds = [],
  variant = "default", // "default" | "invite" | "friend"
  placeholder = " Search users...",
  showSelectedBadge = false,
}) {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim() || !token) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await axios.get(
        `http://localhost:3001/api/user/search?q=${encodeURIComponent(
          searchTerm
        )}`,
        { headers: { "x-auth-token": token } }
      );

      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
      alert("Failed to search users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim().length >= 2 && token) {
      // Debounce search
      clearTimeout(window.userSearchTimeout);
      window.userSearchTimeout = setTimeout(() => {
        handleSearch({ preventDefault: () => {} });
      }, 500);
    } else {
      setSearchResults([]);
      setHasSearched(false);
    }
  };

  const handleFriendStatusChange = (userId, newStatus) => {
    // update the friend status in the search results
    setSearchResults((prev) =>
      prev.map((user) =>
        user._id === userId ? { ...user, friendStatus: newStatus } : user
      )
    );
  };

  // Render user avatar
  const renderUserAvatar = (user) => {
    if (user.profilePicture) {
      return (
        <img
          src={user.profilePicture}
          alt={`${user.username}'s avatar`}
          className="rounded-circle"
          style={{
            width: "40px",
            height: "40px",
            objectFit: "cover",
          }}
        />
      );
    }

    // Fallback to person icon if no profile picture
    return (
      <div
        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
        style={{
          width: "40px",
          height: "40px",
          fontSize: "1rem",
          backgroundColor: "#6c757d",
        }}
      >
        <i className="bi bi-person"></i>
      </div>
    );
  };

  const filteredUsers = searchResults.filter(
    (user) => !excludeUserIds.includes(user._id || user.id)
  );

  const isUserSelected = (user) => {
    return selectedUsers.some(
      (selected) => (selected._id || selected.id) === (user._id || user.id)
    );
  };

  return (
    <div>
      {/* Search Input */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          style={{
            backgroundColor: "#3c3c3c",
            color: "white",
            border: "1px solid #555",
          }}
        />
      </div>

      {/* Search Results */}
      <div style={{ maxHeight: "350px", overflowY: "auto" }}>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted">
              {searchTerm
                ? "No users found matching your search."
                : "Start typing to search for users..."}
            </p>
          </div>
        ) : (
          <div className="row">
            {filteredUsers.map((user) => (
              <div key={user._id || user.id} className="col-md-6 mb-3">
                <div
                  className={`card h-100 ${
                    isUserSelected(user) ? "border-success" : ""
                  }`}
                  style={{
                    backgroundColor: isUserSelected(user)
                      ? "#1a472a"
                      : "#3c3c3c",
                    border: "1px solid #555",
                    cursor: "pointer",
                  }}
                  onClick={() => onUserSelect(user)}
                >
                  <div className="card-body p-3">
                    <div className="d-flex align-items-center">
                      <div className="me-3">{renderUserAvatar(user)}</div>

                      <div className="flex-grow-1">
                        <h6 className="text-white mb-0">
                          {user.username || user.name}
                          {showSelectedBadge && isUserSelected(user) && (
                            <span className="badge bg-success ms-2">
                              <i className="bi bi-check"></i> Selected
                            </span>
                          )}
                        </h6>
                        <small className="text-muted">{user.email}</small>
                      </div>

                      {/* Action Button Based on Variant */}
                      <div className="ms-2">
                        {variant === "invite" ? (
                          <button
                            className={`btn btn-sm ${
                              isUserSelected(user)
                                ? "btn-success"
                                : "btn-outline-primary"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onUserSelect(user);
                            }}
                          >
                            {isUserSelected(user) ? "✓" : "+"}
                          </button>
                        ) : (
                          // Use existing AddFriendButton for friend requests
                          <AddFriendButton
                            targetUserId={user._id || user.id}
                            targetUsername={user.username}
                            onStatusChange={(status) =>
                              handleFriendStatusChange(user._id, status)
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
