"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import { useChat } from "../hooks/useChat";
import axios from "axios";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import NewConversationModal from "../components/chat/NewConversationModal";
import CanvasLoader from "../components/CanvasLoader";

export default function Chat() {
  const [showNewConversationModal, setShowNewConversationModal] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();

  // Memoize user data to prevent unnecessary re-renders
  const stableUser = useMemo(() => user, [user?.id, user?._id, user?.username]);
  const stableToken = useMemo(() => token, [token]);

  // Initialize socket using useSocket hook
  const { socket, isConnected } = useSocket(stableUser, stableToken);
  // Initialize chat functionality using useChat hook
  const {
    conversations,
    messages,
    selectedConversation,
    setConversations,
    setSelectedConversation,
    joinChat,
    sendMessage,
  } = useChat(socket, stableUser);

  // Load conversations from backend
  useEffect(() => {
    const loadConversations = async () => {
      try {
        if (!stableToken) {
          console.log("No token available");
          return;
        }

        console.log("Loading conversations from backend...");
        const response = await axios.get(
          "http://localhost:3001/api/conversations/me",
          {
            headers: { "x-auth-token": stableToken },
          }
        );

        console.log("Loaded conversations:", response.data.length);
        setConversations(response.data);
      } catch (error) {
        console.error("Error loading conversations:", error);
        if (error.response?.status === 401) {
          console.log("Token invalid, redirecting to login");
          navigate("/");
        }
      }
    };

    if (isAuthenticated && stableToken && isConnected) {
      loadConversations();
      setIsLoading(false);
    }
  }, [isAuthenticated, stableToken, isConnected, setConversations, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      console.log("Not authenticated, redirecting to login");
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleConversationSelect = (conversation) => {
    console.log(
      "Selecting conversation with:",
      conversation.otherParticipant.username
    );

    setSelectedConversation(conversation);

    // Join the private chat room
    if (conversation.otherParticipant) {
      joinChat(conversation.otherParticipant._id);
    }
  };

  const handleSendMessage = (content) => {
    if (selectedConversation && content.trim()) {
      sendMessage(content, selectedConversation.otherParticipant._id);
    }
  };

  const handleNewConversation = (conversation) => {
    console.log(
      "Creating new conversation with:",
      conversation.otherParticipant.username
    );

    setConversations((prev) => {
      const exists = prev.some(
        (conv) => conv.chatIdentifier === conversation.chatIdentifier
      );
      if (exists) {
        return prev;
      }
      return [conversation, ...prev];
    });

    setSelectedConversation(conversation);
    setShowNewConversationModal(false);

    if (conversation.otherParticipant) {
      joinChat(conversation.otherParticipant._id);
    }
  };

  const handleStartTyping = () => {
    if (socket && selectedConversation) {
      socket.emit("typing", {
        recipientId: selectedConversation.otherParticipant._id,
      });
    }
  };

  const handleStopTyping = () => {
    if (socket && selectedConversation) {
      socket.emit("stopTyping", {
        recipientId: selectedConversation.otherParticipant._id,
      });
    }
  };
  // Authentication check
  if (!user || !token) {
    return (
      <div
        className="moviesquad-bg d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <div className="alert alert-warning" role="alert">
            <h4 className="alert-heading">
              <i className="bi bi-lock me-2"></i>
              Authentication Required
            </h4>
            <p>Please log in to access your messages.</p>
          </div>
        </div>
      </div>
    );
  }
  // Show loading until currentUser is available
  if (isLoading || !stableUser || !isAuthenticated) {
    return <CanvasLoader fullscreen={true} text="Loading your messages..." />;
  }

  return (
    <div className="moviesquad-bg" style={{ minHeight: "100vh" }}>
      <div className="container py-4">
        {/* Page Header (matching other pages) */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="display-5 fw-bold text-white mb-2">Messages</h1>
            <p className="text-light mb-0">Connect with your movie squad</p>
          </div>

          {/* New Message Button */}
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setShowNewConversationModal(true)}
          >
            <i className="bi bi-plus-lg"></i>
            <span>New Message</span>
          </button>
        </div>
        <div className="row g-4">
          {/* Conversations Sidebar */}
          <div className="col-md-4">
            <div
              className="card shadow-sm"
              style={{ backgroundColor: "#2c2c2c", border: "1px solid #444" }}
            >
              <ConversationList
                currentUser={stableUser}
                conversations={conversations}
                onConversationSelect={handleConversationSelect}
                selectedConversationId={selectedConversation?.chatIdentifier}
              />
              <div
                className="card-footer text-center"
                style={{
                  backgroundColor: "#2c2c2c",
                  borderTop: "1px solid #444",
                }}
              >
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowNewConversationModal(true)}
                >
                  <i class="bi bi-plus-lg"></i> New Message
                </button>
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="col-lg-8">
            <div className="glass-card" style={{ height: "70vh" }}>
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  currentUser={stableUser}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onStartTyping={handleStartTyping}
                  onStopTyping={handleStopTyping}
                  socket={socket}
                />
              ) : (
                // Empty state when no conversation is selected
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-5">
                  <div className="mb-4">
                    <i
                      className="bi bi-chat-square-dots text-muted"
                      style={{ fontSize: "4rem" }}
                    ></i>
                  </div>
                  <h4 className="text-white mb-3">Select a conversation</h4>
                  <p className="text-light mb-4">
                    Choose a conversation from the sidebar to start chatting
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowNewConversationModal(true)}
                  >
                    <i className="bi bi-plus-lg me-2"></i>
                    Start New Conversation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <NewConversationModal
          isOpen={showNewConversationModal}
          onClose={() => setShowNewConversationModal(false)}
          onConversationCreated={handleNewConversation}
          currentUser={stableUser}
        />
      )}
    </div>
  );
}
