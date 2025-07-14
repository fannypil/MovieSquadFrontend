"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "../../hooks/useAuth"
import axios from "axios"

import TabsWrapper from "../TabsWrapper"
import PostsTabContent from "../tabs/PostsTabContent"
import EmptyState from "../EmptyState"
import AddPostModal from "../posts/AddPostModal"
import JoinGroupButton from "./JoinGroupButton"

export default function GroupDetailPage() {
    const { groupId } = useParams()
    const { user,token } = useAuth()
    
    // State management
    const [group, setGroup] = useState(null)
    const [posts, setPosts] = useState([])
    const [members, setMembers] = useState([])
    const [joinRequests, setJoinRequests] = useState([])
    const [activeTab, setActiveTab] = useState('posts')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showAddPostModal, setShowAddPostModal] = useState(false)

    // User permissions
    const isMember = group?.members?.some(member => 
        (member._id || member.id || member) === (user?._id || user?.id)
    )
    const isAdmin = (group?.admin?._id || group?.admin?.id) === (user?._id || user?.id)
    const isCreator = isAdmin // Assuming admin is creator

    useEffect(() => {
        if (groupId&& token) {
            fetchGroupData()
        }
    }, [groupId,token])

    const fetchGroupData = async () => {
        if (!token) return
        try {
            setIsLoading(true)            
            // Fetch group details
            const groupResponse = await axios.get(`http://localhost:3001/api/groups/${groupId}`, {
                headers: { 'x-auth-token': token }
            })
            setGroup(groupResponse.data)
            setMembers(groupResponse.data.members || [])

            // Fetch group posts if user is member
            if (groupResponse.data.members?.some(member => 
                (member._id || member.id || member) === (user?._id || user?.id)
            )) {
                try {
                    const postsResponse = await axios.get(`http://localhost:3001/api/groups/${groupId}/posts`, {
                        headers: { 'x-auth-token': token }
                    })
                    setPosts(postsResponse.data)
                } catch (postsError) {
                    // Fallback: filter all posts
                    const allPostsResponse = await axios.get('http://localhost:3001/api/posts', {
                        headers: { 'x-auth-token': token }
                    })
                    const filteredPosts = allPostsResponse.data.filter(post => 
                        post.groupId === groupId || post.group?._id === groupId
                    )
                    setPosts(filteredPosts)
                }
            }

            // Fetch join requests if user is admin
            if (isAdmin) {
                try {
                    const requestsResponse = await axios.get(`http://localhost:3001/api/groups/${groupId}/requests`, {
                        headers: { 'x-auth-token': token }
                    })
                    setJoinRequests(requestsResponse.data)
                } catch (requestsError) {
                    console.log('No join requests or insufficient permissions')
                }
            }

        } catch (error) {
            console.error('Error fetching group data:', error)
            setError('Failed to load group data')
        } finally {
            setIsLoading(false)
        }
    }

    const handlePostCreated = (newPost) => {
        setPosts(prev => [newPost, ...prev])
        setShowAddPostModal(false)
    }

    const handlePostDeleted = (deletedPostId) => {
        setPosts(prev => prev.filter(post => post._id !== deletedPostId))
    }

    const handlePostUpdated = (updatedPost) => {
        setPosts(prev => prev.map(post => 
            post._id === updatedPost._id ? updatedPost : post
        ))
    }

    const handleJoinRequest = async (requestId, action) => {
        if (!token) return
        try {
            await axios.put(
                `http://localhost:3001/api/groups/${groupId}/requests/${requestId}/${action}`,
                {},
                { headers: { 'x-auth-token': token } }
            )
            
            // Remove from join requests
            setJoinRequests(prev => prev.filter(req => req._id !== requestId))
            
            // If approved, refresh members
            if (action === 'approve') {
                fetchGroupData()
            }
        } catch (error) {
            console.error(`Error ${action}ing request:`, error)
        }
    }

    // Define tabs using existing TabsWrapper structure
    const tabs = [
        {
            id: "posts",
            label: "Posts",
            icon: "📝",
            count: posts.length
        },
        {
            id: "members",
            label: "Members",
            icon: "👥",
            count: members.length
        },
        {
            id: "requests",
            label: "Join Requests",
            icon: "📥",
            count: joinRequests.length,
            showBadge: joinRequests.length > 0 && isAdmin
        },
        {
            id: "about",
            label: "About",
            icon: "📋"
        }
    ]

    const renderTabContent = () => {
        // Check if user can view content
        if (!isMember && group?.isPrivate) {
            return (
                <EmptyState
                    icon="lock"
                    title="Private Group"
                    description="This is a private group. You need to join to see the content."
                    showButton={false}
                />
            )
        }

        switch (activeTab) {
            case 'posts':
                return (
                    <div>
                        {isMember && (
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="text-white mb-0"> 
                                    <i className="bi bi-chat-dots me-2 text-warning"></i> Group Posts</h5>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowAddPostModal(true)}
                                >
                                     Create Post
                                </button>
                            </div>
                        )}
                        
                        <PostsTabContent
                            posts={posts}
                            currentUser={user}
                            onPostDeleted={handlePostDeleted}
                            onPostUpdated={handlePostUpdated}
                            isGroupContext={true}
                            groupData={group}
                            isGroupMember={isMember}
                            isGroupAdmin={isAdmin}
                        />
                    </div>
                )

            case 'members':
                return (
                    <div>
                        <h5 className="text-white mb-4">👥 Group Members</h5>
                        {members.length === 0 ? (
                            <EmptyState
                                icon="people"
                                title="No members yet"
                                description="Be the first to join this group!"
                                showButton={false}
                            />
                        ) : (
                            <div className="row">
                                {members.map(member => (
                                    <div key={member._id} className="col-md-6 col-lg-4 mb-3">
                                        <div className="card" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
                                            <div className="card-body text-center">
                                                <div 
                                                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mx-auto mb-3"
                                                    style={{ 
                                                        width: '60px', 
                                                        height: '60px',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        fontSize: '1.5rem'
                                                    }}
                                                >
                                                    {(member.username || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <h6 className="text-white mb-1">{member.username}</h6>
                                                <small className="text-muted">{member.email}</small>
                                                {member._id === group?.admin?._id && (
                                                    <div className="mt-2">
                                                        <span className="badge bg-warning">👑 Admin</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )

            case 'requests':
                if (!isAdmin) {
                    return (
                        <EmptyState
                            icon="shield-x"
                            title="Access Denied"
                            description="Only group admins can view join requests."
                            showButton={false}
                        />
                    )
                }
                
                return (
                    <div>
                        <h5 className="text-white mb-4"><i className="bi bi-person-add"></i> Join Requests</h5>
                        {joinRequests.length === 0 ? (
                            <EmptyState
                                icon="inbox"
                                title="No pending requests"
                                description="No one has requested to join this group yet."
                                showButton={false}
                            />
                        ) : (
                            <div className="space-y-3">
                                {joinRequests.map(request => (
                                    <div key={request._id} className="card" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
                                        <div className="card-body">
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center">
                                                    <div 
                                                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3"
                                                        style={{ 
                                                            width: '50px', 
                                                            height: '50px',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            fontSize: '1.2rem'
                                                        }}
                                                    >
                                                        {(request.username || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h6 className="text-white mb-1">{request.username}</h6>
                                                        <small className="text-muted">{request.email}</small>
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleJoinRequest(request._id, 'approve')}
                                                    >
                                                         Approve
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleJoinRequest(request._id, 'reject')}
                                                    >
                                                         Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )

            case 'about':
                return (
                    <div className="row">
                        <div className="col-md-6">
                            <div className="card" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
                                <div className="card-body">
                                    <h5 className="text-white mb-3">📋 Description</h5>
                                    <p className="text-light">{group?.description || 'No description provided'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
                                <div className="card-body">
                                    <h5 className="text-white mb-3">📊 Group Info</h5>
                                    <div className="text-light">
                                        <p><strong>Members:</strong> {members.length}</p>
                                        <p><strong>Posts:</strong> {posts.length}</p>
                                        <p><strong>Created:</strong> {group?.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'Unknown'}</p>
                                        <p><strong>Admin:</strong> {group?.admin?.username || 'Unknown'}</p>
                                        <p><strong>Privacy:</strong> {group?.isPrivate ? '🔒 Private Group' : '🌐 Public Group'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    if (isLoading) {
        return (
            <div className="container py-4">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-white mt-2">Loading group...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container py-4">
                <EmptyState
                    icon="exclamation-triangle"
                    title="Error Loading Group"
                    description={error}
                    buttonText="Try Again"
                    onButtonClick={fetchGroupData}
                />
            </div>
        )
    }

    if (!group) {
        return (
            <div className="container py-4">
                <EmptyState
                    icon="question-circle"
                    title="Group Not Found"
                    description="The group you're looking for doesn't exist or has been deleted."
                    buttonText="Back to Groups"
                    onButtonClick={() => window.history.back()}
                />
            </div>
        )
    }

    return (
        <div className="container py-4">
            {/* Group Header - Similar to ProfileHeader */}
            <div className="card mb-4" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-auto">
                            <div 
                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                style={{ 
                                    width: '100px', 
                                    height: '100px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    fontSize: '2.5rem'
                                }}
                            >
                                {(group.name || 'G').charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div className="col">
                            <h2 className="mb-1 text-white">{group.name}</h2>
                            <p className="text-light mb-2">{group.description}</p>
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <small className="text-muted">👥 {members.length} members</small>
                                <small className="text-muted">📝 {posts.length} posts</small>
                                <small className="text-muted">📅 Created {new Date(group.createdAt).toLocaleDateString()}</small>
                                <small className="text-muted">{group.isPrivate ? '🔒 Private' : '🌐 Public'}</small>
                            </div>
                        </div>
                        <div className="col-auto">
                            {!isCreator && (
                                <JoinGroupButton
                                    groupId={group._id}
                                    groupName={group.name}
                                    isPrivate={group.isPrivate}
                                    isMember={isMember}
                                    isCreator={isCreator}
                                    onJoined={() => fetchGroupData()}
                                    onLeft={() => fetchGroupData()}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs - Reusing TabsWrapper */}
            <TabsWrapper
                tabs={tabs.filter(tab => {
                    // Hide requests tab for non-admins
                    if (tab.id === 'requests' && !isAdmin) return false
                    return true
                })}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                variant="group"
            >
                {renderTabContent()}
            </TabsWrapper>

            {/* Add Post Modal */}
            {showAddPostModal && (
                <AddPostModal
                    isOpen={showAddPostModal}
                    onClose={() => setShowAddPostModal(false)}
                    onPostCreated={handlePostCreated}
                    groupId={groupId}
                />
            )}
        </div>
    )
}