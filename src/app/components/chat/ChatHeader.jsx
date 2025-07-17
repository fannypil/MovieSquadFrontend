"use client";

export default function ChatHeader({ otherUser, isTyping }) {
  return (
    <div
      className="chat-header p-3 border-bottom"
      style={{ backgroundColor: "#3c3c3c", borderColor: "#444" }}
    >
      <div className="d-flex align-items-center">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3"
          style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            fontSize: "0.9rem",
          }}
        >
          {(otherUser?.username || "U").charAt(0).toUpperCase()}
        </div>
        <div>
          <h6 className="mb-0 text-white">
            {otherUser?.username || "Unknown User"}
          </h6>
          <small style={{ color: "#9ca3af" }}>
            {isTyping ? (
              <span className="text-warning">
                <i class="bi bi-keyboard"></i> typing...
              </span>
            ) : (
              <span className="text-muted">
                <i class="bi bi-chat"></i> Chat
              </span>
            )}
          </small>
        </div>
      </div>
    </div>
  );
}
