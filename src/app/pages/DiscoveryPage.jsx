"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import TMDBContentCard from "../components/TMDBContentCard";
import TMDBSearch from "../components/TMDBSearch";
import EmptyState from "../components/EmptyState";

export default function DiscoveryPage() {
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState([]);
  const [trendingContent, setTrendingContent] = useState([]);
  const [activeTab, setActiveTab] = useState("trending");
  const [isLoadingTrending, setIsLoadingTrending] = useState(false);
  const [contentType, setContentType] = useState("movie"); // "movie", "tv"
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false); // Track if user has performed a search

  useEffect(() => {
    loadTrendingContent();
  }, [contentType]);

  const loadTrendingContent = async () => {
    setIsLoadingTrending(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/api/tmdb/trending?type=${contentType}&time_window=week`
      );
      setTrendingContent(response.data.results || []);
    } catch (error) {
      console.error("Error loading trending content:", error);
      setTrendingContent([]);
    } finally {
      setIsLoadingTrending(false);
    }
  };

  const handleSearchComplete = async (query, results) => {
    if (results && results.length > 0) {
      setSearchResults(results);
      setLastSearchQuery(query);
      setHasSearched(true);
      setActiveTab("search");
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setLastSearchQuery("");
    setHasSearched(false);
    setActiveTab("trending");
  };

  const tabs = [
    {
      id: "trending",
      label: "Trending",
      icon: <i className="bi bi-fire"></i>,
      count: trendingContent.length
    },
    {
      id: "search",
      label: "Search Results",
      icon: <i className="bi bi-search"></i>,
      count: searchResults.length,
      disabled: false // Always enabled now
    }
  ];

  const renderContent = () => {
    if (activeTab === "search") {
      // If user hasn't searched yet or no query entered
      if (!hasSearched && !lastSearchQuery) {
        return (
          <EmptyState
            icon="search"
            title="Start searching"
            description="Enter a movie or TV show name to search"
            showButton={false}
          />
        );
      }

      // If user searched but got no results
      if (hasSearched && searchResults.length === 0) {
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white mb-0">
                Search Results {lastSearchQuery && `for "${lastSearchQuery}"`} (0)
              </h5>
              <button className="btn btn-outline-secondary btn-sm" onClick={clearSearch}>
                <i className="bi bi-x-circle me-1"></i>
                Clear Search
              </button>
            </div>
            
            <EmptyState
              icon="search"
              title="No results found"
              description={`No movies or TV shows found matching "${lastSearchQuery}". Try different keywords.`}
              showButton={true}
              buttonText="Back to Trending"
              buttonAction={clearSearch}
            />
          </div>
        );
      }

      // If user has search results
      if (hasSearched && searchResults.length > 0) {
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white mb-0">
                Search Results {lastSearchQuery && `for "${lastSearchQuery}"`} ({searchResults.length})
              </h5>
              <button className="btn btn-outline-secondary btn-sm" onClick={clearSearch}>
                <i className="bi bi-x-circle me-1"></i>
                Clear Search
              </button>
            </div>
            
            {searchResults.map((item) => (
              <TMDBContentCard
                key={`${item.id}-${item.media_type || (item.title ? 'movie' : 'tv')}`}
                content={item}
                variant="discovery"
                currentUser={user}
              />
            ))}
          </div>
        );
      }

      // Fallback - shouldn't reach here but just in case
      return (
        <EmptyState
          icon="search"
          title="Start searching"
          description="Enter a movie or TV show name to search"
          showButton={false}
        />
      );
    }

    // Trending tab
    if (isLoadingTrending) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-warning mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-white">Loading trending content...</p>
        </div>
      );
    }

    if (trendingContent.length === 0) {
      return (
        <EmptyState
          icon="exclamation-triangle"
          title="Unable to load trending content"
          description="There was an issue loading trending movies and TV shows. Please try again."
          showButton={true}
          buttonText="Retry"
          buttonAction={loadTrendingContent}
        />
      );
    }

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="text-white mb-0">
            <i className="bi bi-fire me-2"></i>
            Trending {contentType === "movie" ? "Movies" : "TV Shows"}
          </h5>
          
          {/* Content Type Filter */}
          <div className="btn-group" role="group">
            <input 
              type="radio" 
              className="btn-check" 
              name="contentType" 
              id="movie" 
              checked={contentType === "movie"} 
              onChange={() => setContentType("movie")} 
            />
            <label className="btn btn-outline-warning btn-sm" htmlFor="movie">Movies</label>

            <input 
              type="radio" 
              className="btn-check" 
              name="contentType" 
              id="tv" 
              checked={contentType === "tv"} 
              onChange={() => setContentType("tv")} 
            />
            <label className="btn btn-outline-warning btn-sm" htmlFor="tv">TV Shows</label>
          </div>
        </div>

        {trendingContent.map((item) => (
          <TMDBContentCard
            key={`${item.id}-${item.media_type || contentType}`}
            content={{...item, media_type: item.media_type || contentType}}
            variant="discovery"
            currentUser={user}
          />
        ))}
      </div>
    );
  };

return (
    <div className="moviesquad-bg" style={{ minHeight: '100vh' }}>
      <div className="container py-4">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-5 fw-bold text-white mb-3">
            Discover Movies & TV Shows
          </h1>
          <p className="text-light">Explore trending content and search for your favorites</p>
        </div>

        {/* Enhanced Search Bar */}
        <div className="card mb-4"
        style={{ position: 'relative', zIndex: 999 }}>
          <div className="card-body p-4">
            <TMDBSearch
              onSelectItem={(item) => {
                // When item is selected, show it in search results
                setSearchResults([item]);
                setLastSearchQuery(item.title || item.name);
                setHasSearched(true);
                setActiveTab("search");
              }}
              placeholder="Search for movies, TV shows..."
              searchType="multi"
              showSelected={false} // Don't show selection in discovery
            />
          </div>
        </div>

        {/* Content Tabs */}
        <ul className="nav nav-tabs justify-content-center mb-4" style={{ borderBottom: '1px solid #444' }}>
          {tabs.map((tab) => (
            <li key={tab.id} className="nav-item">
              <button
                className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                style={{
                  backgroundColor: activeTab === tab.id ? '#ff8c00' : 'transparent',
                  borderColor: activeTab === tab.id ? '#ff8c00' : '#444',
                  color: activeTab === tab.id ? 'white' : '#ccc',
                  transition: 'all 0.3s ease'
                }}
              >
                <span className="me-2">{tab.icon}</span>
                {tab.label}
                {tab.count !== undefined && (
                  <span className="badge bg-secondary ms-2">{tab.count}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}