"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import TMDBContentCard from "../TMDBContentCard";
import { useAuth } from "@/app/hooks/useAuth";
import EmptyState from "../EmptyState";

export default function WatchlistContent({
  currentUser,
  userId = null, // If userId is provided, we're viewing another user's collections
}) {
  const { token } = useAuth();
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [watchedContent, setWatchedContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("favorites");
  const [viewedUser, setViewedUser] = useState(null);

  // Check if we're viewing another user's profile
  const isViewingOtherUser =
    userId && userId !== currentUser?._id && userId !== currentUser?.id;

  useEffect(() => {
    if (token) {
      loadUserContent();
    }
  }, [userId, token]);

  const loadUserContent = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const endpoint = isViewingOtherUser
        ? `http://localhost:3001/api/user/profile/${userId}`
        : "http://localhost:3001/api/user/me";

      const response = await axios.get(endpoint, {
        headers: { "x-auth-token": token },
      });

      setFavoriteMovies(response.data.favoriteMovies || []);
      setWatchedContent(response.data.watchedContent || []);

      if (isViewingOtherUser) {
        setViewedUser(response.data);
      }
    } catch (error) {
      console.error("Error loading user content:", error);
      setFavoriteMovies([]);
      setWatchedContent([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveContent = (contentId) => {
    if (isViewingOtherUser) return; // Can't remove from other user's lists

    if (activeSubTab === "favorites") {
      setFavoriteMovies((prev) =>
        prev.filter((item) => item.tmdbId !== contentId)
      );
    } else {
      setWatchedContent((prev) =>
        prev.filter((item) => item.tmdbId !== contentId)
      );
    }
  };

  const subTabs = [
    {
      id: "favorites",
      label: "Favorites",
      icon: <i className="bi bi-heart-fill"></i>,
      count: favoriteMovies.length,
    },
    {
      id: "watched",
      label: "Watched",
      icon: <i className="bi bi-check-circle"></i>,
      count: watchedContent.length,
    },
  ];

  const renderContent = () => {
    const currentContent =
      activeSubTab === "favorites" ? favoriteMovies : watchedContent;
    const contentType = activeSubTab === "favorites" ? "favorites" : "watched";
    const displayUser = isViewingOtherUser ? viewedUser : currentUser;

    if (currentContent.length === 0) {
      return (
        <EmptyState
          icon={activeSubTab === "favorites" ? "heart" : "check-circle"}
          title={`No ${contentType} yet`}
          description={
            isViewingOtherUser
              ? `${
                  displayUser?.username || "This user"
                } hasn't added anything to their ${contentType} yet.`
              : `Start adding movies and shows to your ${contentType}!`
          }
          showButton={false}
        />
      );
    }

    return (
      <div className="row g-3">
        {currentContent.map((item) => (
          <div key={item.tmdbId} className="col-md-6 col-lg-4">
            <TMDBContentCard
              content={{
                id: item.tmdbId,
                title: item.title,
                poster_path: item.posterPath,
                media_type: item.tmdbType,
                tmdbType: item.tmdbType,
                overview: "",
                release_date: "",
                vote_average: 0,
              }}
              variant={contentType}
              currentUser={currentUser}
              onRemove={!isViewingOtherUser ? handleRemoveContent : undefined}
            />
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-white">Loading collections...</p>
      </div>
    );
  }

  const displayUser = isViewingOtherUser ? viewedUser : currentUser;

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h5 className="text-white mb-1">
          <i className="bi bi-camera-reels me-2 text-warning"></i>
          {isViewingOtherUser
            ? `${displayUser?.username || "User"}'s Collections`
            : "My Collections"}
        </h5>
        <p className="text-light small mb-0">
          {isViewingOtherUser
            ? `Movies and shows collected by ${
                displayUser?.username || "this user"
              }`
            : "Your favorite and watched movies and TV shows"}
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="glass-card mb-4">
        <div className="card-body p-0">
          <ul className="nav nav-tabs nav-fill border-0">
            {subTabs.map((tab) => (
              <li key={tab.id} className="nav-item">
                <button
                  className={`nav-link border-0 fw-semibold py-3 ${
                    activeSubTab === tab.id ? "active" : ""
                  }`}
                  onClick={() => setActiveSubTab(tab.id)}
                  style={{
                    backgroundColor:
                      activeSubTab === tab.id
                        ? "rgba(245, 158, 11, 0.2)"
                        : "transparent",
                    borderBottom:
                      activeSubTab === tab.id
                        ? "3px solid #f59e0b"
                        : "3px solid transparent",
                    color: activeSubTab === tab.id ? "#f59e0b" : "#9ca3af",
                  }}
                >
                  <span className="me-2">{tab.icon}</span>
                  {tab.label}
                  <span
                    className="badge ms-2"
                    style={{
                      backgroundColor:
                        activeSubTab === tab.id
                          ? "#f59e0b"
                          : "rgba(156, 163, 175, 0.3)",
                      color: activeSubTab === tab.id ? "#000" : "#fff",
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
