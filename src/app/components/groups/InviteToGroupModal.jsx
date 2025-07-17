import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/app/hooks/useAuth";
import UserSearch from "../friends/UserSearch";

export default function InviteToGroupModal({
  isOpen,
  onClose,
  group,
  currentMembers = [],
  onInviteSent,
}) {
  const { token, user } = useAuth();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Debug: log modal props and state
  useEffect(() => {
    console.log("InviteToGroupModal rendered, isOpen:", isOpen);
    console.log("group:", group);
    console.log("currentMembers:", currentMembers);
    console.log("selectedUsers:", selectedUsers);
  }, [isOpen, group, currentMembers, selectedUsers]);

  // IDs of users already in the group
  const memberIds = currentMembers.map((m) => m._id || m.id);

  const handleUserSelect = (user) => {
    const id = user._id || user.id;
    if (memberIds.includes(id)) return; // Already member
    if (selectedUsers.some((u) => (u._id || u.id) === id)) {
      setSelectedUsers(selectedUsers.filter((u) => (u._id || u.id) !== id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleSendInvites = async () => {
    if (selectedUsers.length === 0) return;
    setSending(true);
    setStatusMsg("");
    try {
      for (const userToInvite of selectedUsers) {
        console.log("Inviting user:", userToInvite._id || userToInvite.id);
        await axios.post(
          `http://localhost:3001/api/groups/${group._id}/invite`,
          { inviteeId: userToInvite._id || userToInvite.id },
          { headers: { "x-auth-token": token } }
        );
      }
      setStatusMsg("Invitations sent!");
      setSelectedUsers([]);
      onInviteSent?.();
    } catch (e) {
      console.error("Error sending invitations:", e);
      setStatusMsg("Failed to send invitations.");
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) {
    console.log("InviteToGroupModal not open, returning null");
    return null;
  }
  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog">
        <div
          className="modal-content"
          style={{ background: "#23272b", color: "#fff" }}
        >
          <div className="modal-header">
            <h5 className="modal-title">Invite Friends to {group.name}</h5>
            <button
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={sending}
            ></button>
          </div>
          <div className="modal-body">
            <UserSearch
              variant="invite"
              onUserSelect={handleUserSelect}
              selectedUsers={selectedUsers}
              excludeUserIds={memberIds}
              placeholder="Search friends to invite..."
              showSelectedBadge={true}
            />
            <div className="mt-3">
              <button
                className="btn btn-warning"
                onClick={handleSendInvites}
                disabled={sending || selectedUsers.length === 0}
              >
                {sending ? "Sending..." : "Send Invitation(s)"}
              </button>
              {statusMsg && (
                <div
                  className={`mt-2 text-${
                    statusMsg.includes("Failed") ? "danger" : "success"
                  }`}
                >
                  {statusMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
