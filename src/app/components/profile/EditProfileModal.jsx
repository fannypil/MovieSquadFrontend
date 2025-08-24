"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/app/hooks/useAuth";
import AvatarSelector from "./AvatarSelector";
import BaseModal from "../BaseModal";
import { SaveCancelFooter } from "../ModalFooters";

const GENRES = [
  "Drama",
  "Comedy",
  "Action",
  "Romance",
  "Thriller",
  "Animation",
  "Mystery",
  "Sci-Fi",
  "Fantasy",
  "Documentary",
];

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
}) {
  const { token, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    profilePicture: null,
  });
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Initialize form with current user data
  useEffect(() => {
    if (isOpen && currentUser) {
      setFormData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        bio: currentUser.bio || "",
        profilePicture: currentUser.profilePicture || null,
      });
      setSelectedGenres(currentUser.favoriteGenres || []);
      setErrors({});
      setShowAvatarSelector(false);
    }
  }, [isOpen, currentUser]);

  // Handle genre selection
  const handleGenreToggle = async (genre) => {
    if (selectedGenres.includes(genre)) {
      // Remove genre
      setIsLoading(true);
      try {
        await axios.delete(
          `http://localhost:3001/api/user/me/genres/${encodeURIComponent(
            genre
          )}`,
          { headers: { "x-auth-token": token } }
        );
        setSelectedGenres((prev) => prev.filter((g) => g !== genre));
      } catch (err) {
        alert("Failed to remove genre");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Add genre
      setIsLoading(true);
      try {
        await axios.put(
          "http://localhost:3001/api/user/me/genres",
          { genre },
          { headers: { "x-auth-token": token } }
        );
        setSelectedGenres((prev) => [...prev, genre]);
      } catch (err) {
        alert("Failed to add genre");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAvatarSelect = (avatarUrl) => {
    setFormData((prev) => ({
      ...prev,
      profilePicture: avatarUrl,
    }));
    // Clear any avatar-related errors
    if (errors.profilePicture) {
      setErrors((prev) => ({
        ...prev,
        profilePicture: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put(
        "http://localhost:3001/api/user/me",
        formData,
        { headers: { "x-auth-token": token } }
      );

      // Handle both old and new response formats
      const updatedUserData = response.data.data || response.data;
      const updatedUser = {
        ...currentUser,
        ...updatedUserData,
      };
      updateUser(updatedUser);

      // Call parent callback to update UI
      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      }

      alert("Profile updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error.response?.data?.msg) {
        alert(error.response.data.msg);
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      isLoading={isLoading}
      size="lg"
      theme="dark"
      footer={
        <SaveCancelFooter
          onCancel={onClose}
          onSave={handleSubmit}
          isLoading={isLoading}
        />
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="row">
            {/* Avatar Section */}
            <div className="col-md-4">
              <div className="text-center mb-3">
                <h6 className="text-white mb-3">Profile Picture</h6>

                {/* Current Avatar Display */}
                <div
                  className="rounded-circle border border-2 border-warning mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "100px",
                    height: "100px",
                    backgroundColor: "#3c3c3c",
                  }}
                >
                  {formData.profilePicture ? (
                    <img
                      src={formData.profilePicture}
                      alt="Profile preview"
                      className="rounded-circle"
                      style={{ width: "96px", height: "96px" }}
                    />
                  ) : (
                    <i
                      className="bi bi-person text-muted"
                      style={{ fontSize: "2.5rem" }}
                    ></i>
                  )}
                </div>

                {/* Avatar Actions */}
                <div className="d-flex flex-column gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                    disabled={isLoading}
                  >
                    <i className="bi bi-image me-2"></i>
                    {showAvatarSelector ? "Hide Avatars" : "Choose Avatar"}
                  </button>

                  {formData.profilePicture && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleAvatarSelect(null)}
                      disabled={isLoading}
                    >
                      <i className="bi bi-trash me-2"></i>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="col-md-8">
              {/* Username */}
              <div className="mb-3">
                <label htmlFor="username" className="form-label text-white">
                  Username *
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    errors.username ? "is-invalid" : ""
                  }`}
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  style={{
                    backgroundColor: "#3c3c3c",
                    border: "1px solid #555",
                    color: "white",
                  }}
                  disabled={isLoading}
                />
                {errors.username && (
                  <div className="invalid-feedback">{errors.username}</div>
                )}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label text-white">
                  Email *
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    backgroundColor: "#3c3c3c",
                    border: "1px solid #555",
                    color: "white",
                  }}
                  disabled={isLoading}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>
            </div>
          </div>

          {/* Avatar Selector (Full Width) */}
          {showAvatarSelector && (
            <div className="mb-3">
              <AvatarSelector
                currentAvatar={formData.profilePicture}
                onAvatarSelect={handleAvatarSelect}
                isVisible={showAvatarSelector}
              />
            </div>
          )}

          {/* Bio */}
          <div className="mb-3">
            <label htmlFor="bio" className="form-label text-white">
              Bio
            </label>
            <textarea
              className={`form-control ${errors.bio ? "is-invalid" : ""}`}
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              placeholder="Tell us about yourself..."
              style={{
                backgroundColor: "#3c3c3c",
                border: "1px solid #555",
                color: "white",
              }}
              disabled={isLoading}
            />
            {errors.bio && <div className="invalid-feedback">{errors.bio}</div>}
            <small className="text-muted">
              {formData.bio.length}/500 characters
            </small>
          </div>
          {/* Favorite Genres */}
          <div className="mb-3">
            <label className="form-label text-white">Favorite Genres</label>
            <div className="d-flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  className={`btn btn-sm ${
                    selectedGenres.includes(genre)
                      ? "btn-warning"
                      : "btn-outline-secondary"
                  }`}
                  onClick={() => handleGenreToggle(genre)}
                  disabled={isLoading}
                >
                  {genre}
                  {selectedGenres.includes(genre) && (
                    <i className="bi bi-check-lg ms-1"></i>
                  )}
                </button>
              ))}
            </div>
            <small className="text-muted">
              Click to add/remove genres. Changes are saved instantly.
            </small>
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: "1px solid #444" }}>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
}
