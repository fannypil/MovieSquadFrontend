"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/app/hooks/useAuth";

export default function JoinGroupButton({
  groupId,
  groupName,
  isPrivate,
  isMember,
  isCreator,
  onJoined,
  onLeft,
}) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasRequestedJoin, setHasRequestedJoin] = useState(false);
  const [isCheckingRequest, setIsCheckingRequest] = useState(false);

  // Don't show button if user is creator
  if (isCreator) {
    return (
      <div className="d-flex flex-column align-items-center">
        <span className="badge bg-success mb-1" style={{ fontSize: "0.7rem" }}>
          <i className="bi bi-crown-fill me-1"></i>
          Creator
        </span>
        <small className="text-muted" style={{ fontSize: "0.65rem" }}>
          Your Group
        </small>
      </div>
    );
  }
  useEffect(() => {
    const checkPendingRequest = async () => {
      if (!token || !groupId || !isPrivate || isMember) return;

      try {
        setIsCheckingRequest(true);

        // Use the new endpoint to check user's request status
        const response = await axios.get(
          `http://localhost:3001/api/groups/${groupId}/my-request-status`,
          { headers: { "x-auth-token": token } }
        );

        // Update state based on response
        if (response.data?.hasPendingRequest) {
          setHasRequestedJoin(true);
        }
      } catch (error) {
        // If 404, no pending request exists (which is fine)
        if (error.response?.status !== 404) {
          console.error("Error checking request status:", error);
        }
      } finally {
        setIsCheckingRequest(false);
      }
    };

    checkPendingRequest();
  }, [token, groupId, isPrivate, isMember]);

  const handleJoinGroup = async () => {
    if (!groupId || isLoading || !token) return;

    setIsLoading(true);

    try {
      if (isMember) {
        // Leave group
        console.log("Leaving group:", groupId);
        const leaveResponse = await axios.put(
          `http://localhost:3001/api/groups/${groupId}/leave`,
          {},
          { headers: { "x-auth-token": token } }
        );
        console.log("Leave group response:", leaveResponse.data);
        onLeft?.(groupId);
        alert(`You have left "${groupName}"`);
      } else {
        // Join group
        console.log("Joining group:", groupId);

        if (isPrivate) {
          // Request to join private group
          console.log("Requesting to join private group:", groupId);
          const response = await axios.post(
            `http://localhost:3001/api/groups/${groupId}/request-join`,
            {},
            { headers: { "x-auth-token": token } }
          );
          console.log("Join request response:", response.data);

          setHasRequestedJoin(true);
          alert(
            `Join request sent to "${groupName}". You'll be notified when approved.`
          );
        } else {
          // Join public group immediately
          await axios.put(
            `http://localhost:3001/api/groups/${groupId}/join`,
            {},
            { headers: { "x-auth-token": token } }
          );

          onJoined?.(groupId);
          alert(`You have joined "${groupName}"!`);
        }
      }
    } catch (error) {
      console.error("Error with group action:", error);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);

      // Show user-friendly error message
      let errorMessage = "Failed to perform action. Please try again.";

      if (error.response?.status === 400) {
        const message =
          error.response.data?.message || error.response.data?.msg || "";
        if (message.includes("already a member")) {
          errorMessage = "You are already a member of this group.";
        } else if (message.includes("already have a pending request")) {
          errorMessage = "You already have a pending request for this group.";
          setHasRequestedJoin(true); // Update UI state
        } else if (message.includes("not a member")) {
          errorMessage = "You are not a member of this group.";
        } else if (message.includes("cannot leave")) {
          errorMessage =
            "As group admin, you cannot leave the group. Transfer ownership or delete the group instead.";
        } else {
          errorMessage = message || errorMessage;
        }
      } else if (error.response?.status === 401) {
        errorMessage = "Please log in to join groups.";
      } else if (error.response?.status === 403) {
        const message =
          error.response.data?.message || error.response.data?.msg || "";
        if (message.includes("private group")) {
          errorMessage =
            "This is a private group. You need an invitation to join.";
        } else {
          errorMessage = "You don't have permission to perform this action.";
        }
      } else if (error.response?.status === 404) {
        errorMessage = "Group not found. It may have been deleted.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get button configuration based on current state
  const getButtonConfig = () => {
    if (isMember) {
      return {
        text: "Leave Group",
        className: "btn-danger",
        disabled: false,
      };
    } else if (hasRequestedJoin) {
      return {
        text: "Request Sent",
        icon: <i className="bi bi-send-check"></i>,
        className: "btn-secondary",
        disabled: true,
      };
    } else if (isPrivate) {
      return {
        text: "Request Join",
        icon: <i className="bi bi-lock-fill"></i>,
        className: "btn-warning",
        disabled: false,
      };
    } else {
      return {
        text: " Join Group",
        icon: <i class="bi bi-plus-square"></i>,
        className: "btn-success",
        disabled: false,
      };
    }
  };

  const buttonConfig = getButtonConfig();
  if (isCheckingRequest && !isMember && isPrivate) {
    return (
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
        disabled
        style={{
          minWidth: "100px",
          fontSize: "0.8rem",
        }}
      >
        <span
          className="spinner-border spinner-border-sm me-1"
          role="status"
          aria-hidden="true"
        ></span>
        Checking...
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`btn ${buttonConfig.className} btn-sm d-flex align-items-center gap-1`}
      onClick={handleJoinGroup}
      disabled={isLoading || buttonConfig.disabled}
      style={{
        minWidth: "100px",
        fontSize: "0.8rem",
      }}
    >
      {isLoading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-1"
            role="status"
            aria-hidden="true"
          ></span>
          Loading...
        </>
      ) : (
        <>
          <span>{buttonConfig.icon}</span>
          {buttonConfig.text}
        </>
      )}
    </button>
  );
}
