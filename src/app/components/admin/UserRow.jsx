"use client";
import React from "react";

const DEFAULTPIC = "https://www.w3schools.com/howto/img_avatar.png";

export default function UserRow({ user, onEdit, onDelete, isLoading }) {
  return (
    <tr>
      <td>
        <img
          src={user.profilePicture || DEFAULTPIC}
          alt={user.username}
          className="rounded-circle"
          style={{ width: 40, height: 40, objectFit: "cover" }}
        />
      </td>
      <td>{user.username}</td>
      <td>{user.email}</td>
      <td>
        <span
          className={`badge bg-${
            user.role === "admin"
              ? "warning"
              : user.role === "groupAdmin"
              ? "info"
              : "secondary"
          }`}
        >
          {user.role}
        </span>
      </td>
      <td>
        <button
          className="btn btn-outline-info btn-sm me-2"
          onClick={() => onEdit(user)}
          disabled={isLoading}
        >
          <i className="bi bi-pencil"></i>
        </button>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => onDelete(user._id)}
          disabled={isLoading}
        >
          <i className="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  );
}
