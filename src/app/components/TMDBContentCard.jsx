"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import TrailerSection from "./TMDB/TrailerSection";

export default function TMDBContentCard({
  content,
  variant = "discovery", // "discovery" | "favorite" | "watched"
  onRemove,
  onAddToFavorites,
  onAddToWatched,
}) {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  const title = content.title || content.name;
  const releaseDate = content.release_date || content.first_air_date;
  const mediaType =
    content.media_type ||
    content.tmdbType ||
    (content.title && !content.name ? "movie" : "tv");

  const posterUrl =
    content.poster_path || content.posterPath
      ? `https://image.tmdb.org/t/p/w500${
          content.poster_path || content.posterPath
        }`
      : null;

  useEffect(() => {
    checkUserStatus();
  }, [content.id, user]);

  const checkUserStatus = async () => {
    if (!user || !token) return;

    try {
      const response = await axios.get("http://localhost:3001/api/user/me", {
        headers: { "x-auth-token": token },
      });

      const userFavorites = response.data.favoriteMovies || [];
      const userWatched = response.data.watchedContent || [];

      // Check if current content is in favorites
      setIsFavorited(userFavorites.some((fav) => fav.tmdbId === content.id));

      // Check if current content is in watched list
      setIsWatched(
        userWatched.some((watched) => watched.tmdbId === content.id)
      );
    } catch (error) {
      console.error("Error checking user status:", error);
    }
  };

  const handleAddToFavorites = async () => {
    if (isLoading || isFavorited) return;
    setIsLoading(true);
    console.log("Adding to favorites:", {
      tmdbId: content.id,
      title: title,
      tmdbType: mediaType,
      posterPath: content.poster_path || "",
    });

    try {
      await axios.put(
        "http://localhost:3001/api/user/me/favorite-movies",
        {
          tmdbId: content.id,
          title: title,
          tmdbType: mediaType,
          posterPath: content.poster_path || "",
        },
        {
          headers: {
            "x-auth-token": token,
            "Content-Type": "application/json",
          },
        }
      );

      setIsFavorited(true);
      if (onAddToFavorites) onAddToFavorites(content);
      alert(` ${title} added to favorites!`);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      alert(
        error.response?.data?.message ||
          error.response?.data?.msg ||
          "Failed to add to favorites"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWatched = async () => {
    console.log("=== handleAddToWatched START ===");

    console.log("Adding to watched:", {
      tmdbId: content.id,
      title: title,
      tmdbType: mediaType,
      posterPath: content.poster_path || "",
    });
    if (isLoading || isWatched) return;
    setIsLoading(true);

    try {
      await axios.put(
        "http://localhost:3001/api/user/me/watched",
        {
          tmdbId: content.id,
          tmdbType: mediaType,
          title: title,
          posterPath: content.poster_path || "",
        },
        { headers: { "x-auth-token": token } }
      );

      setIsWatched(true);

      if (onAddToWatched) onAddToWatched(content);
      alert(`${title} marked as watched!`);
    } catch (error) {
      console.error("Error adding to watched:", error);
      alert(error.response?.data?.msg || "Failed to mark as watched");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async () => {
    if (!window.confirm(`Remove "${title}" from your favorites?`)) return;

    if (isLoading) return;
    setIsLoading(true);

    try {
      await axios.delete(
        `http://localhost:3001/api/user/me/favorite-movies/${
          content.tmdbId || content.id
        }`,
        { headers: { "x-auth-token": token } }
      );
      setIsFavorited(false);

      if (onRemove) onRemove(content.tmdbId || content.id);
      alert(`${title} removed from favorites!`);
    } catch (error) {
      console.error("Error removing from favorites:", error);
      alert("Failed to remove from favorites");
    } finally {
      setIsLoading(false);
    }
  };
  const handleRemoveWatched = async () => {
    if (!window.confirm(`Remove "${title}" from your watched list?`)) return;

    if (isLoading) return;
    setIsLoading(true);

    try {
      await axios.delete(
        `http://localhost:3001/api/user/me/watched/${
          content.tmdbId || content.id
        }/${mediaType}`,
        { headers: { "x-auth-token": token } }
      );

      setIsWatched(false);

      if (onRemove) onRemove(content.tmdbId || content.id);
      alert(`${title} removed from watched list!`);
    } catch (error) {
      console.error("Error removing from watched:", error);
      alert("Failed to remove from watched list");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (variant === "favorite") {
      await handleRemoveFavorite();
    } else if (variant === "watched") {
      await handleRemoveWatched();
    }
  };
  if (!user || !token) {
    return (
      <div
        className="card mb-3"
        style={{ backgroundColor: "#2c2c2c", border: "1px solid #444" }}
      >
        <div className="card-body text-center">
          <p className="text-muted">Please log in to interact with content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-3" style={{ border: "1px solid #444" }}>
      <div className="card-body">
        <div className="row">
          {/* Poster/Icon */}
          <div className="col-auto">
            <div
              className="d-flex align-items-center justify-content-center rounded"
              style={{
                width: "80px",
                height: "120px",
                backgroundColor: "#3c3c3c",
                border: "1px solid #555",
                backgroundImage: posterUrl ? `url(${posterUrl})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {!posterUrl && (
                <div className="text-center">
                  <i
                    className="bi bi-camera-reels"
                    style={{ fontSize: "2rem", color: "#666" }}
                  ></i>
                  <br />
                  <small className="text-muted">#{content.id}</small>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="col">
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <h5 className="card-title text-white mb-2">{title}</h5>

                {content.overview && (
                  <p className="text-white mb-2" style={{ fontSize: "0.9rem" }}>
                    {content.overview.length > 150
                      ? `${content.overview.substring(0, 150)}...`
                      : content.overview}
                  </p>
                )}

                <div className="d-flex flex-wrap gap-2 mb-3">
                  {(variant === "favorite" || isFavorited) && (
                    <span className="badge bg-danger">
                      <i className="bi bi-heart-fill me-1"></i>
                      FAVORITE
                    </span>
                  )}

                  {(variant === "watched" || isWatched) && (
                    <span className="badge bg-success">
                      <i className="bi bi-check-circle me-1"></i>
                      WATCHED
                    </span>
                  )}

                  <span className="badge bg-info">
                    <i
                      className={`bi ${
                        mediaType === "tv" ? "bi-tv" : "bi-film"
                      } me-1`}
                    ></i>
                    {mediaType === "tv" ? "TV SHOW" : "MOVIE"}
                  </span>

                  {releaseDate && (
                    <span className="badge bg-secondary">
                      <i className="bi bi-calendar me-1"></i>
                      {new Date(releaseDate).getFullYear()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2 flex-wrap">
              {variant === "discovery" && (
                <>
                  {/*  Dynamic favorite button based on state */}
                  {!isFavorited ? (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleAddToFavorites}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm me-1"></span>
                      ) : (
                        <i className="bi bi-heart me-1"></i>
                      )}
                      Add to Favorites
                    </button>
                  ) : (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={handleRemoveFavorite}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm me-1"></span>
                      ) : (
                        <i className="bi bi-heart-fill me-1"></i>
                      )}
                    </button>
                  )}

                  {/*  Dynamic watched button based on state */}
                  {!isWatched ? (
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={handleAddToWatched}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm me-1"></span>
                      ) : (
                        <i className="bi bi-check-circle me-1"></i>
                      )}
                      Mark as Watched
                    </button>
                  ) : (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleRemoveWatched}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm me-1"></span>
                      ) : (
                        <i className="bi bi-check-circle-fill me-1"></i>
                      )}
                      Remove from Watched
                    </button>
                  )}
                </>
              )}

              {(variant === "favorite" || variant === "watched") && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleRemove}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="spinner-border spinner-border-sm me-1"></span>
                  ) : (
                    <i className="bi bi-trash me-1"></i>
                  )}
                  Remove
                </button>
              )}

              <button
                className="btn btn-outline-info btn-sm"
                onClick={() => {
                  console.log("Opening TMDB link:", {
                    mediaType,
                    id: content.id,
                    url: `https://www.themoviedb.org/${mediaType}/${content.id}`,
                  });
                  window.open(
                    `https://www.themoviedb.org/${mediaType}/${content.id}`,
                    "_blank"
                  );
                }}
              >
                <i className="bi bi-link-45deg me-1"></i>
                View on TMDB
              </button>
            </div>
            <TrailerSection
              movieId={content.id}
              contentType={content.media_type || "movie"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
