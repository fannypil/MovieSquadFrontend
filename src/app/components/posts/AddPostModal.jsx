"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/app/hooks/useAuth";
import TMDBSearch from "../TMDBSearch";

export default function AddPostModal({
  isOpen,
  onClose,
  onPostCreated,
  groupId = null,
}) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    content: "",
    tmdbId: "",
    tmdbType: "movie",
    tmdbTitle: "",
    tmdbPosterPath: "",
    categories: ["general"],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategoryClick = (category) => {
    setFormData((prev) => ({ ...prev, categories: [category] }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.content.trim())
      newErrors.content = "Post content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectMovie = (item) => {
    const selectedData = {
      tmdbId: item.id,
      tmdbTitle: item.title || item.name,
      tmdbPosterPath: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : "",
      tmdbType: item.media_type || (item.title ? "movie" : "tv"),
    };

    setFormData((prev) => ({ ...prev, ...selectedData }));
    setSelectedMovie(item);
  };
  const handleClearSelection = () => {
    setFormData((prev) => ({
      ...prev,
      tmdbId: "",
      tmdbTitle: "",
      tmdbPosterPath: "",
      tmdbType: "movie",
    }));
    setSelectedMovie(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const postData = {
        content: formData.content.trim(),
        categories: formData.categories,
      };

      // If a movie/TV show is selected, add those fields
      if (formData.tmdbId && formData.tmdbTitle) {
        postData.tmdbId = parseInt(formData.tmdbId);
        postData.tmdbType = formData.tmdbType;
        postData.tmdbTitle = formData.tmdbTitle.trim();
        postData.tmdbPosterPath = formData.tmdbPosterPath;
      } else {
        // For general posts, use default movie values with special ID
        postData.tmdbId = -1;
        postData.tmdbType = "movie";
        postData.tmdbTitle = "General Discussion";
        postData.tmdbPosterPath = "";
      }

      if (groupId) postData.groupId = groupId;

      const response = await axios.post(
        "http://localhost:3001/api/posts",
        postData,
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      // Reset form
      setFormData({
        content: "",
        tmdbId: "",
        tmdbType: "movie",
        tmdbTitle: "",
        tmdbPosterPath: "",
        categories: ["general"],
      });
      setSelectedMovie(null);
      onClose();
      if (onPostCreated) onPostCreated(response.data);
      alert("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      alert(error.response?.data?.msg || "Failed to create post.");
    } finally {
      setIsLoading(false);
    }
  };
  const categories = [
    {
      id: "review",
      label: "Review",
      icon: <i className="bi bi-star-fill"></i>,
    },
    {
      id: "recommendation",
      label: "Recommendation",
      icon: <i className="bi bi-hand-thumbs-up"></i>,
    },
    {
      id: "discussion",
      label: "Discussion",
      icon: <i className="bi bi-chat-dots"></i>,
    },
    {
      id: "question",
      label: "Question",
      icon: <i className="bi bi-question-circle"></i>,
    },
    { id: "news", label: "News", icon: <i className="bi bi-newspaper"></i> },
    {
      id: "general",
      label: "General",
      icon: <i className="bi bi-pencil-square"></i>,
    },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
    >
      <div className="modal-dialog modal-lg">
        <div
          className="modal-content"
          style={{ backgroundColor: "#2c2c2c", color: "white" }}
        >
          <div className="modal-header border-0">
            <h5 className="modal-title">
              <i className="bi bi-pencil-square me-2"></i>
              {groupId ? "Post in Group" : "Create New Post"}
            </h5>
            <button
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Content Input */}
              <div className="mb-4">
                <label className="form-label">
                  <i className="bi bi-chat-text me-2"></i>
                  What's on your mind?
                </label>
                <textarea
                  className={`form-control ${
                    errors.content ? "is-invalid" : ""
                  }`}
                  name="content"
                  rows="4"
                  value={formData.content}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="Share your thoughts..."
                  style={{
                    backgroundColor: "#3c3c3c",
                    border: "1px solid #555",
                    color: "white",
                  }}
                />
                {errors.content && (
                  <div className="invalid-feedback">{errors.content}</div>
                )}
              </div>

              {/* TMDB Search */}
              <div className="mb-4">
                <label className="form-label">
                  <i className="bi bi-camera-reels me-2"></i>
                  Link to Movie/TV Show (optional)
                </label>
                <TMDBSearch
                  onSelectItem={handleSelectMovie}
                  selectedItem={selectedMovie}
                  onClearSelection={handleClearSelection}
                  disabled={isLoading}
                  placeholder="Search for a movie or TV show..."
                  searchType="multi"
                />
              </div>

              {/* Categories */}
              <div className="mb-4">
                <label className="form-label">
                  <i className="bi bi-tags me-2"></i>
                  Categories (select one)
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={`btn ${
                        formData.categories.includes(category.id)
                          ? "btn-warning"
                          : "btn-outline-warning"
                      }`}
                      onClick={() => handleCategoryClick(category.id)}
                      disabled={isLoading}
                    >
                      <span className="me-1">{category.icon}</span>
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                <i className="bi bi-x-circle me-1"></i>
                Cancel
              </button>
              <button
                type="submit"
                className="btn"
                style={{ backgroundColor: "#ff8c00", color: "white" }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Publishing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-2"></i>
                    Publish Post
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
