"use client";
import React, { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import CanvasLoader from "../CanvasLoader";

// Create context
const UserDataContext = createContext();

export function useUserData() {
  return useContext(UserDataContext);
}

export default function UserData({ children }) {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users and stats
  useEffect(() => {
    if (!token) return;
    setLoading(true);

    Promise.all([
      axios.get("http://localhost:3001/api/admin/users", {
        headers: { "x-auth-token": token },
      }),
      axios.get("http://localhost:3001/api/stats/summary", {
        headers: { "x-auth-token": token },
      }),
    ])
      .then(([usersRes, statsRes]) => {
        setUsers(usersRes.data);
        setStats(statsRes.data);
      })
      .catch((err) => setError("Failed to load admin data"))
      .finally(() => setLoading(false));
  }, [token]);

  // Handle user update
  const updateUser = async (userId, userData) => {
    try {
      const res = await axios.put(
        `http://localhost:3001/api/admin/users/${userId}`,
        userData,
        { headers: { "x-auth-token": token } }
      );

      setUsers((prev) => prev.map((u) => (u._id === userId ? res.data : u)));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Handle user deletion
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:3001/api/admin/users/${userId}`, {
        headers: { "x-auth-token": token },
      });

      setUsers((prev) => prev.filter((u) => u._id !== userId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Value object to be provided by context
  const value = {
    users,
    stats,
    loading,
    error,
    updateUser,
    deleteUser,
  };

  if (loading) {
    return <CanvasLoader fullscreen={true} text="Loading admin data..." />;
  }

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}
