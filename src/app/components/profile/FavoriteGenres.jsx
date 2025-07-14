"use client"

import { useAuth } from "@/app/hooks/useAuth";
import axios from "axios";
import React, { useState, useEffect } from "react";

export default function FavoriteGenres() {
  const { token } =useAuth()
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
      if (token) { 
        fetchFavoriteGenres();
      }
    }, [token]);
      const fetchFavoriteGenres = async () => {
    if (!token) return; 
    
    try {
      setIsLoading(true);
      setError(null);
    
      const response = await axios.get("http://localhost:3001/api/user/me", {
        headers: { 'x-auth-token': token }
      });
      
      setGenres(response.data.favoriteGenres || []);
    } catch (error) {
      console.error('Error fetching favorite genres:', error);
      setError('Failed to load favorite genres');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-2">
        <div className="spinner-border spinner-border-sm text-warning" role="status">
          <span className="visually-hidden">Loading genres...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-2">
        <small className="text-danger">{error}</small>
      </div>
    );
  }

  if (!genres || genres.length === 0) {
    return (
      <div className="text-center py-2">
        <small className="text-white">No favorite genres selected</small>
      </div>
    );
  }

  return (
    <div className="d-flex flex-wrap gap-2">
      {genres.map((genre, index) => (
        <span 
          key={`${genre}-${index}`} 
          className="badge text-white px-2 py-1"
          style={{
            backgroundColor: '#8b5cf6',
            fontSize: '0.8rem',
            borderRadius: '12px'
          }}
        >
          {genre}
        </span>
      ))}
    </div>
  );
}