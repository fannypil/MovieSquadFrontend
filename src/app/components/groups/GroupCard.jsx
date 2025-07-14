"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom" 
import JoinGroupButton from "./JoinGroupButton"

export default function GroupCard({ 
  group, 
  currentUser, 
  onGroupJoined, 
  onGroupLeft, 
  onViewGroup 
}) {
    const navigate = useNavigate()
    const [isExpanded, setIsExpanded] = useState(false)
    
    // Check if user is member or creator
    const isCreator = group.admin === currentUser._id || group.admin?._id === currentUser._id
    const isMember = group.members.some(member => 
        (member._id || member.id || member) === (currentUser._id || currentUser.id)
    )
    
    // Truncate description
    const truncatedDescription = group.description && group.description.length > 120
        ? group.description.substring(0, 120) + "..."
        : group.description

    const handleViewGroup = () => {
        if (onViewGroup) {
            onViewGroup(group._id)
        } else {
            navigate(`/groups/${group._id}`)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now - date)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) return 'Today'
        if (diffDays === 2) return 'Yesterday'
        if (diffDays <= 7) return `${diffDays} days ago`
        return date.toLocaleDateString()
    }

    return (
        <div className="glass-card hover-lift h-100">
            <div className="card-body d-flex flex-column p-4">
                {/* Group Header */}
                <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center flex-grow-1">
                        <div 
                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                                width: '48px',
                                height: '48px',
                                background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)',
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '18px'
                            }}
                        >
                            {group.name?.[0]?.toUpperCase() || 'G'}
                        </div>
                        <div className="flex-grow-1">
                            <h6 className="text-white mb-1 fw-semibold">
                                {group.name}
                            </h6>
                            <p className="text-light opacity-75 mb-0" style={{ fontSize: '0.85rem' }}>
                                by {group.admin?.username || 'Unknown'}
                            </p>
                        </div>
                    </div>
                    
                    {/* Privacy Badge */}
                    <div className="d-flex flex-column align-items-end gap-1">
                        {group.isPrivate && (
                            <span className="badge bg-warning text-dark">
                                <i className="bi bi-lock-fill me-1"></i>
                                Private
                            </span>
                        )}
                        {isCreator && (
                            <span className="badge bg-success">
                                <i className="bi bi-crown me-1"></i>
                                Your Group
                            </span>
                        )}
                    </div>
                </div>

                {/* Group Stats */}
                <div className="d-flex gap-3 mb-3">
                    <div className="d-flex align-items-center text-light opacity-75">
                        <i className="bi bi-people me-1"></i>
                        <small>{group.members?.length || 0} members</small>
                    </div>
                    <div className="d-flex align-items-center text-light opacity-75">
                        <i className="bi bi-chat-text me-1"></i>
                        <small>{group.postsCount || 0} posts</small>
                    </div>
                    <div className="d-flex align-items-center text-light opacity-75">
                        <i className="bi bi-clock me-1"></i>
                        <small>{formatDate(group.createdAt)}</small>
                    </div>
                </div>

                {/* Group Description */}
                {group.description && (
                    <div className="mb-3 flex-grow-1">
                        <p className="text-light mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                            {isExpanded ? group.description : truncatedDescription}
                        </p>
                        {group.description.length > 120 && (
                            <button
                                className="btn btn-link btn-sm p-0 mt-1 text-warning"
                                onClick={() => setIsExpanded(!isExpanded)}
                                style={{ fontSize: '0.8rem' }}
                            >
                                {isExpanded ? (
                                    <>
                                        <i className="bi bi-chevron-up me-1"></i>
                                        Show less
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-chevron-down me-1"></i>
                                        Show more
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-auto">
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-info btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                            onClick={handleViewGroup}
                        >
                            <i className="bi bi-eye"></i>
                            View Group
                        </button>
                        
                        {/* Show Join button only if not creator */}
                        {!isCreator && (
                            <JoinGroupButton
                                groupId={group._id}
                                groupName={group.name}
                                isPrivate={group.isPrivate}
                                isMember={isMember}
                                isCreator={isCreator}
                                onJoined={onGroupJoined}
                                onLeft={onGroupLeft}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}