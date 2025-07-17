"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/app/hooks/useAuth";

export default function ProfileStats({ userId }) {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    posts: 0,
    friends: 0,
    watched: 0,
    loading: true,
  });

  useEffect(() => {
    if (token) {
      fetchUserStats();
    }
  }, [userId, token]);

  const fetchUserStats = async () => {
    try {
      if (!token) return;

      // Fetch user data to get current stats
      const userResponse = await axios.get(
        "http://localhost:3001/api/user/me",
        {
          headers: { "x-auth-token": token },
        }
      );

      // Fetch posts count
      const postsResponse = await axios.get("http://localhost:3001/api/posts", {
        headers: { "x-auth-token": token },
      });
      const userPosts = postsResponse.data.filter(
        (post) => post.author._id === userId || post.author.id === userId
      );

      setStats({
        posts: userPosts.length,
        friends: userResponse.data.friends?.length || 0,
        watched: userResponse.data.watchedContent?.length || 0,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return (
      <div className="row text-center">
        <div className="col-4">
          <div
            className="spinner-border spinner-border-sm text-light"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="small text-white">Posts</div>
        </div>
        <div className="col-4">
          <div
            className="spinner-border spinner-border-sm text-light"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="small text-white">Friends</div>
        </div>
        <div className="col-4">
          <div
            className="spinner-border spinner-border-sm text-light"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="small text-white">Watched</div>
        </div>
      </div>
    );
  }

  return (
    <div className="row text-center">
      <div className="col-4">
        <strong className="text-white">{stats.posts}</strong>
        <div className="small text-white">Posts</div>
      </div>
      <div className="col-4">
        <strong className="text-white">{stats.friends}</strong>
        <div className="small text-white">Friends</div>
      </div>
      <div className="col-4">
        <strong className="text-white">{stats.watched}</strong>
        <div className="small text-white">Watched</div>
      </div>
    </div>
  );
}
