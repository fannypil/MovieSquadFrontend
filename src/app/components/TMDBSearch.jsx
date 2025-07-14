"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export default function TMDBSearch({ 
  onSelectItem, 
  placeholder = "Search for movies, TV shows...",
  searchType = "multi", // "movie", "tv", "multi"
  showSelected = true,
  selectedItem = null,
  onClearSelection,
  disabled = false 
}) {
    const { token } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType]);

const performSearch = async () => {
  if (!searchQuery.trim() || !token) return; 

  setIsSearching(true);
  setShowResults(true);

  try {
    const response = await axios.get(
      `http://localhost:3001/api/tmdb/search?query=${encodeURIComponent(searchQuery)}&type=${searchType}`,
      {
        headers: { "x-auth-token": token } 
      }
    );
    
    setSearchResults(response.data.results || []);
  } catch (error) {
    console.error("Error searching TMDB:", error);
    setSearchResults([]);
  } finally {
    setIsSearching(false);
  }
};

  const handleSelectItem = (item) => {
    if (onSelectItem) {
      onSelectItem(item);
    }
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleClearSelection = () => {
    if (onClearSelection) {
      onClearSelection();
    }
  };

  return (
    <div className="tmdb-search-component">
      {/* Search Input */}
      <div className="position-relative">
        <div className="input-group">
          <span 
            className="input-group-text" 
            style={{ backgroundColor: '#3c3c3c', border: '1px solid #555' }}
          >
            <i className="bi bi-search text-muted"></i>
          </span>
          
          <input
            type="text"
            className="form-control"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            style={{ 
              backgroundColor: '#3c3c3c', 
              border: '1px solid #555', 
              color: 'white' 
            }}
          />
          
          {(searchQuery || showResults) && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleClearSearch}
              disabled={disabled}
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>

        {/* Loading indicator */}
        {isSearching && (
           <div className="position-absolute top-100 start-0 w-100 bg-dark border p-2 text-center" 
               style={{ zIndex: 9999 }}> 
            <div className="spinner-border spinner-border-sm text-primary me-2"></div>
            <small className="text-white">Searching...</small>
          </div>
        )}

        {/* Search Results Dropdown */}
        {showResults && !isSearching && searchResults.length > 0 && (
          <div 
            className="position-absolute top-100 start-0 w-100 bg-dark border border-secondary rounded mt-1"
            style={{ 
              maxHeight: '300px', 
              overflowY: 'auto', 
              zIndex: 9999, 
              backgroundColor: '#2c2c2c !important'
            }}
          >
            {searchResults.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="p-3 border-bottom border-secondary cursor-pointer search-result-item"
                onClick={() => handleSelectItem(item)}
                style={{
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#3c3c3c'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <div className="d-flex align-items-center">
                  {/* Poster thumbnail */}
                  <div 
                    className="flex-shrink-0 me-3 rounded"
                    style={{
                      width: '40px',
                      height: '60px',
                      backgroundColor: '#444',
                      backgroundImage: item.poster_path 
                        ? `url(https://image.tmdb.org/t/p/w92${item.poster_path})` 
                        : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!item.poster_path && (
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <i className="bi bi-film text-muted" style={{ fontSize: '1.2rem' }}></i>
                      </div>
                    )}
                  </div>
                  
                  {/* Content info */}
                  <div className="flex-grow-1">
                    <div className="text-white fw-bold">
                      {item.title || item.name}
                    </div>
                    <div className="d-flex gap-2 mt-1">
                      <span className="badge bg-info">
                        {item.media_type || (item.title ? 'movie' : 'tv')}
                      </span>
                      {(item.release_date || item.first_air_date) && (
                        <span className="badge bg-secondary">
                          {new Date(item.release_date || item.first_air_date).getFullYear()}
                        </span>
                      )}
                      {item.vote_average > 0 && (
                        <span className="badge bg-warning text-dark">
                          <i className="bi bi-star-fill me-1"></i>
                          {item.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {item.overview && (
                      <small className="text-white">
                        {item.overview.length > 100 
                          ? `${item.overview.substring(0, 100)}...` 
                          : item.overview
                        }
                      </small>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results message */}
        {showResults && !isSearching && searchQuery && searchResults.length === 0 && (
          <div 
            className="position-absolute top-100 start-0 w-100 bg-dark border border-secondary rounded mt-1 p-3 text-center"
            style={{ zIndex: 9999 }} 
          >
            <i className="bi bi-search text-muted me-2"></i>
            <small className="text-muted">No results found for "{searchQuery}"</small>
          </div>
        )}
      </div>

      {/* Selected Item Display */}
      {showSelected && selectedItem && (
        <div className="mt-3 p-3 bg-success bg-opacity-25 border border-success rounded">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <i className="bi bi-check-circle text-success me-2"></i>
              <div>
                <strong className="text-success">Selected:</strong>
                <span className="text-white ms-2">
                  {selectedItem.title || selectedItem.name}
                </span>
                <div className="mt-1">
                  <span className="badge bg-info me-1">
                    {selectedItem.media_type || (selectedItem.title ? 'movie' : 'tv')}
                  </span>
                  {(selectedItem.release_date || selectedItem.first_air_date) && (
                    <span className="badge bg-secondary">
                      {new Date(selectedItem.release_date || selectedItem.first_air_date).getFullYear()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button 
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={handleClearSelection}
              disabled={disabled}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}