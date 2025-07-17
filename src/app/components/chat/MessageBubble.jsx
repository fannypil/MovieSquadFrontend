"use client";

import { useState } from "react";

export default function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  messageStatus = {},
}) {
  const [showFullTime, setShowFullTime] = useState(false);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return showFullTime
      ? date.toLocaleString()
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const getMessageStatusIcon = () => {
    if (!isOwn) return null;

    if (messageStatus.read) {
      return (
        <span title="Read" style={{ color: "#3b82f6" }}>
          seen
        </span>
      );
    } else {
      return (
        <span title="Sent" style={{ color: "#6b7280" }}>
          <i class="bi bi-check"></i>
        </span>
      );
    }
  };

  return (
    <div
      className={`d-flex mb-3 ${
        isOwn ? "justify-content-end" : "justify-content-start"
      }`}
    >
      {/* Avatar for other user's messages */}
      {showAvatar && !isOwn && (
        <div className="me-3 align-self-end">
          {message.sender?.profilePicture ? (
            <img
              src={message.sender.profilePicture}
              alt={message.sender?.username || "User"}
              className="rounded-circle"
              style={{
                width: "36px",
                height: "36px",
                objectFit: "cover",
                border: "2px solid #374151",
              }}
            />
          ) : (
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
              style={{
                width: "36px",
                height: "36px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                fontSize: "0.9rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {(message.sender?.username || "U").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Message bubble container */}
      <div
        className={`message-bubble-container ${
          isOwn ? "own-message" : "other-message"
        }`}
        style={{
          maxWidth: "75%",
          minWidth: "60px",
        }}
      >
        {/* Message bubble */}
        <div
          className="message-bubble position-relative"
          style={{
            background: isOwn
              ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
              : "linear-gradient(135deg, #374151 0%, #4b5563 100%)",
            borderRadius: isOwn ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
            padding: "12px 16px",
            color: "#ffffff",
            wordBreak: "break-word",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            position: "relative",
            border: "none",
          }}
        >
          {/* Show sender name for other's messages */}
          {!isOwn && showAvatar && (
            <div
              className="sender-name fw-semibold mb-1"
              style={{
                fontSize: "0.8rem",
                color: "#e5e7eb",
                opacity: 0.9,
              }}
            >
              {message.sender?.username || "Unknown User"}
            </div>
          )}

          {/* Message content */}
          <div
            className="message-content"
            style={{
              fontSize: "0.95rem",
              lineHeight: "1.4",
              color: "#ffffff",
            }}
          >
            {message.content}
          </div>

          {/* Message status indicators for own messages */}
          {isOwn && (
            <div
              className="message-status position-absolute d-flex align-items-center"
              style={{
                bottom: "4px",
                right: "8px",
                fontSize: "0.75rem",
                color: "#e5e7eb",
                opacity: 0.9,
              }}
            >
              {getMessageStatusIcon()}
            </div>
          )}
        </div>

        {/* Message time */}
        <div
          className={`message-time mt-1 ${isOwn ? "text-end" : "text-start"}`}
          style={{
            fontSize: "0.72rem",
            color: "#9ca3af",
            cursor: "pointer",
            opacity: 0.7,
            paddingLeft: isOwn ? "0" : "8px",
            paddingRight: isOwn ? "8px" : "0",
          }}
          onClick={() => setShowFullTime(!showFullTime)}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>

      {/* Spacer for own messages to maintain avatar spacing */}
      {isOwn && <div style={{ width: "44px" }} />}
    </div>
  );
}
