"use client";

import { useState } from "react";

export default function ChatInput({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  disabled = false,
}) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    setIsSending(true);
    try {
      await onSendMessage(message.trim());
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    if (e.target.value.trim()) {
      onStartTyping();
    } else {
      onStopTyping();
    }
  };

  return (
    <div
      className="message-input p-3 border-top"
      style={{ backgroundColor: "#3c3c3c", borderColor: "#444" }}
    >
      <form onSubmit={handleSubmit} className="d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Type a message..."
          value={message}
          onChange={handleInputChange}
          disabled={disabled || isSending}
          style={{
            backgroundColor: "#2c2c2c",
            border: "1px solid #555",
            color: "#ffffff",
            fontSize: "1rem",
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!message.trim() || isSending}
          style={{
            backgroundColor: "#8b5cf6",
            borderColor: "#8b5cf6",
            color: "#ffffff",
          }}
        >
          {isSending ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <i class="bi bi-send-fill"></i>
          )}
        </button>
      </form>
    </div>
  );
}
