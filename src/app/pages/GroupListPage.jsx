"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import GroupList from "../components/groups/GroupList"
import CreateGroupForm from "../components/groups/CreateGroupForm" 
import EmptyState from "../components/EmptyState"
import { useAuth } from "../hooks/useAuth"

export default function GroupListPage({ defaultTab = "discover", isEmbedded = false, 
  currentUser: propCurrentUser,onViewGroup,onGroupsCountChange}) {    
    const { user:authUser, token } = useAuth()
    const user = propCurrentUser || authUser

    const [groups, setGroups] = useState([])
    const [myGroups, setMyGroups] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showCreateForm, setShowCreateForm] = useState(false) 
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState(defaultTab)
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        if (token) {
            fetchGroups()
        } else {
            setIsLoading(false)
        }
    }, [token])

     useEffect(() => {
        if (isEmbedded && onGroupsCountChange) {
            onGroupsCountChange(myGroups.length)
        }
    }, [myGroups.length, isEmbedded, onGroupsCountChange])

     const fetchGroups = async (showRefreshLoader = false) => {
        if (!token) {
            console.log('No token available, skipping group fetch')
            setIsLoading(false)
            return
        }
        
        try {
            if (showRefreshLoader) {
                setIsRefreshing(true)
            } else {
                setIsLoading(true)
            }
            setError(null)
            
            const response = await axios.get('http://localhost:3001/api/groups', {
                headers: { 'x-auth-token': token }
            })
            
            setGroups(response.data)
            
            if (user) {
                const userGroups = response.data.filter(group => 
                    group.members?.some(member => 
                        (member._id || member.id || member) === (user._id || user.id)
                    )
                )
                setMyGroups(userGroups)
                
                if (isEmbedded && onGroupsCountChange) {
                    onGroupsCountChange(userGroups.length)
                }
            }
        } catch (error) {
            console.error('Error fetching groups:', error)
            setError('Failed to load groups. Please try again.')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    const handleGroupCreated = (newGroup) => {
        setGroups(prev => [newGroup, ...prev])
        if (user && newGroup.members?.some(member => 
            (member._id || member.id || member) === (user._id || user.id)
        )) {
            setMyGroups(prev => [newGroup, ...prev])
        }
        setShowCreateForm(false) 
        //Fetch fresh data to ensure consistency
        fetchGroups(true)
    }

    const handleGroupJoined = (groupId) => {
        fetchGroups(true)
    }

    const handleGroupLeft = (groupId) => {
        fetchGroups(true)
    }

    const filteredGroups = groups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const filteredMyGroups = myGroups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
     // Enhanced tab configuration
     const tabs = [
        {
            id: "discover",
            label: "Discover",
            icon: <i className="bi bi-compass"></i>,
            count: filteredGroups.length,
            description: "Find new groups to join"
        },
        {
            id: "my-groups",
            label: "My Groups",
            icon: <i className="bi bi-people"></i>,
            count: filteredMyGroups.length,
            description: "Groups you're a member of"
        }
    ]
    //Not authenticated state
    if (!token) {
        return (
            <div className="moviesquad-bg" style={{ minHeight: '100vh' }}>
                <div className="container py-4">
                    <div className="text-center py-5">
                        <div className="glass-card mx-auto" style={{ maxWidth: '500px' }}>
                            <div className="card-body p-5">
                                <div className="text-warning mb-4" style={{ fontSize: '4rem' }}>
                                    <i className="bi bi-shield-lock"></i>
                                </div>
                                <h3 className="text-white mb-3">Authentication Required</h3>
                                <p className="text-light mb-4">
                                    Please log in to discover and join groups with fellow movie enthusiasts.
                                </p>
                                <button 
                                    className="btn btn-gold px-4 py-2"
                                    onClick={() => window.location.href = '/login'}
                                >
                                    <i className="bi bi-box-arrow-in-right me-2"></i>
                                    Sign In
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    // Loading state
    if (isLoading) {
       return (
             <div className="moviesquad-bg d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
               <div className="text-center">
                 <div className="spinner-border text-warning mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
                   <span className="visually-hidden">Loading...</span>
                 </div>
                 <h5 className="text-white">Loading Groups Page...</h5>
                 <p className="text-muted">Please wait while we fetch your data</p>
               </div>
             </div>
           );
    }
    // Error state
    if (error) {
        return (
            <div className="moviesquad-bg" style={{ minHeight: '100vh' }}>
                <div className="container py-4">
                    <EmptyState
                        icon="exclamation-triangle"
                        title="Error Loading Groups"
                        description={error}
                        showButton={true}
                        buttonText="Try Again"
                        buttonAction={() => fetchGroups()}
                    />
                </div>
            </div>
        )
    }

       return (
        <div className="moviesquad-bg" style={{ minHeight: '100vh' }}>
            <div className="container py-4">
                {/* Enhanced Header */}
                <div className="d-flex flex-column flex-sm-row align-items-start align-sm-center justify-content-between gap-3 mb-4">
                    <div>
                        <h1 className={`${isEmbedded ? 'h3' : 'display-6'} fw-bold text-white mb-2`}>
                            {isEmbedded ? (
                                <>
                                    <i className="bi bi-people me-2 text-warning"></i>
                                    My Groups ({myGroups.length})
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-collection me-2 text-warning"></i>
                                    Groups
                                </>
                            )}
                        </h1>
                        {!isEmbedded && (
                            <p className="text-light mb-0">
                                Connect with fellow movie and TV enthusiasts
                            </p>
                        )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="d-flex gap-2">
                        {!isEmbedded && (
                            <button 
                                className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
                                onClick={() => fetchGroups(true)}
                                disabled={isRefreshing}
                            >
                                {isRefreshing ? (
                                    <span className="spinner-border spinner-border-sm" role="status"></span>
                                ) : (
                                    <i className="bi bi-arrow-clockwise"></i>
                                )}
                                Refresh
                            </button>
                        )}
                        
                        {user && (
                            <button 
                                className={`btn btn-gold d-flex align-items-center gap-2 ${
                                    isEmbedded ? 'btn-sm' : ''
                                }`}
                                onClick={() => setShowCreateForm(true)} 
                            >
                                <i className="bi bi-plus-circle"></i>
                                Create Group
                            </button>
                        )}
                    </div>
                </div>

                {/* Enhanced Search */}
                <div className="glass-card mb-4">
                    <div className="card-body">
                        <div className="position-relative">
                            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-light"></i>
                            <input
                                type="text"
                                placeholder={isEmbedded ? "Search your groups..." : "Search groups by name or description..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="form-control ps-5"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: '#fff'
                                }}
                            />
                            {searchQuery && (
                                <button
                                    className="btn btn-sm btn-outline-light position-absolute top-50 end-0 translate-middle-y me-2"
                                    onClick={() => setSearchQuery("")}
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    <i className="bi bi-x"></i>
                                </button>
                            )}
                        </div>
                        
                        {/* Search Stats */}
                        {searchQuery && (
                            <div className="mt-3">
                                <small className="text-light">
                                    <i className="bi bi-info-circle me-1"></i>
                                    {activeTab === "discover" 
                                        ? `${filteredGroups.length} of ${groups.length} groups match your search`
                                        : `${filteredMyGroups.length} of ${myGroups.length} groups match your search`
                                    }
                                </small>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Tabs (only for non-embedded) */}
                {!isEmbedded && (
                    <div className="glass-card mb-4">
                        <div className="card-body p-0">
                            <ul className="nav nav-tabs nav-fill border-0">
                                {tabs.map(tab => (
                                    <li key={tab.id} className="nav-item">
                                        <button
                                            className={`nav-link border-0 fw-semibold py-3 px-4 ${
                                                activeTab === tab.id ? "active" : ""
                                            }`}
                                            onClick={() => setActiveTab(tab.id)}
                                            style={{
                                                backgroundColor: activeTab === tab.id 
                                                    ? 'rgba(245, 158, 11, 0.2)' 
                                                    : 'transparent',
                                                borderBottom: activeTab === tab.id 
                                                    ? '3px solid #f59e0b' 
                                                    : '3px solid transparent',
                                                color: activeTab === tab.id ? '#f59e0b' : '#9ca3af',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div className="d-flex align-items-center justify-content-center gap-2">
                                                <span>{tab.icon}</span>
                                                <span>{tab.label}</span>
                                                <span 
                                                    className="badge" 
                                                    style={{
                                                        backgroundColor: activeTab === tab.id 
                                                            ? '#f59e0b' 
                                                            : 'rgba(156, 163, 175, 0.3)',
                                                        color: activeTab === tab.id ? '#000' : '#fff'
                                                    }}
                                                >
                                                    {tab.count}
                                                </span>
                                            </div>
                                            {activeTab === tab.id && (
                                                <small className="d-block mt-1 opacity-75">
                                                    {tab.description}
                                                </small>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Tab Content */}
                {(activeTab === "discover" && !isEmbedded) && (
                    <div>
                        {filteredGroups.length === 0 ? (
                            searchQuery ? (
                                <EmptyState 
                                    icon="search"
                                    title="No groups found"
                                    description={`No groups match "${searchQuery}". Try different keywords or create a new group.`}
                                    showButton={true}
                                    buttonText="Create Group"
                                    buttonAction={() => setShowCreateForm(true)}
                                />
                            ) : (
                                <EmptyState 
                                    icon="people"
                                    title="No groups available"
                                    description="Be the first to create a group and connect with fellow movie enthusiasts!"
                                    showButton={true}
                                    buttonText="Create First Group"
                                    buttonAction={() => setShowCreateForm(true)}
                                />
                            )
                        ) : (
                            <GroupList
                                groups={filteredGroups}
                                currentUser={user}
                                onGroupJoined={handleGroupJoined}
                                onGroupLeft={handleGroupLeft}
                                searchQuery={searchQuery}
                                onViewGroup={onViewGroup}
                            />
                        )}
                    </div>
                )}

                {(activeTab === "my-groups" || isEmbedded) && (
                    <div>
                        {filteredMyGroups.length === 0 ? (
                            searchQuery ? (
                                <EmptyState 
                                    icon="search"
                                    title="No groups found"
                                    description={`None of your groups match "${searchQuery}".`}
                                    showButton={false}
                                />
                            ) : (
                                <EmptyState 
                                    icon="people"
                                    title="No groups joined yet"
                                    description="Join or create groups to connect with other movie enthusiasts!"
                                    showButton={!isEmbedded}
                                    buttonText="Discover Groups"
                                    buttonAction={() => setActiveTab("discover")}
                                />
                            )
                        ) : (
                            <GroupList
                                groups={filteredMyGroups}
                                currentUser={user}
                                onGroupJoined={handleGroupJoined}
                                onGroupLeft={handleGroupLeft}
                                searchQuery={searchQuery}
                                isMyGroups={true}
                                onViewGroup={onViewGroup}
                            />
                        )}
                    </div>
                )}

                {/* Create Group Modal */}
                <CreateGroupForm
                    isOpen={showCreateForm}
                    onClose={() => setShowCreateForm(false)}
                    onGroupCreated={handleGroupCreated}
                />
            </div>
        </div>
    )
}