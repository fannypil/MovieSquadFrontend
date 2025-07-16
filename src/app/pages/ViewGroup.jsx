"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../hooks/useAuth"
import EntityHeader from "../components/EntityHeader"
import TabsWrapper from "../components/TabsWrapper"
import PostsTabContent from "../components/tabs/PostsTabContent"
import GroupMembers from "../components/groups/GroupMembers"
import GroupSharedWatchlist from "../components/groups/GroupSharedWatchlist"
import GroupStatistics from "../components/groups/GroupStatistics"
import CanvasLoader from "../components/CanvasLoader"

export default function ViewGroup() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()

  const [group, setGroup] = useState(null)
  const [groupPosts, setGroupPosts] = useState([])
  const [activeTab, setActiveTab] = useState("posts")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Check user membership status
  const isGroupMember = group?.members?.some(member => 
    (member._id || member.id || member) === (user?._id || user?.id)
  )
  const isGroupAdmin = group?.admin?._id === user?._id || group?.admin?.id === user?.id

  useEffect(() => {
    if (groupId && token) {
      fetchGroupData()
    }
  }, [groupId, token])

  const fetchGroupData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      // Fetch group details and posts in parallel
      const [groupResponse, postsResponse] = await Promise.all([
        axios.get(`http://localhost:3001/api/groups/${groupId}`, {
          headers: { 'x-auth-token': token }
        }),
        axios.get(`http://localhost:3001/api/posts?groupId=${groupId}`, {
          headers: { 'x-auth-token': token }
        })
      ])

      setGroup(groupResponse.data)
      setGroupPosts(postsResponse.data)
    } catch (error) {
      console.error('Error fetching group data:', error)
      
      if (error.response?.status === 404) {
        setError('Group not found')
      } else if (error.response?.status === 403) {
        setError('You don\'t have permission to view this group')
      } else {
        setError('Failed to load group data')
      }
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const handlePostCreated = (newPost) => {
    setGroupPosts(prevPosts => [newPost, ...prevPosts])
  }

  const handlePostDeleted = (deletedPostId) => {
    setGroupPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId))
  }

  const handlePostUpdated = (updatedPost) => {
    setGroupPosts(prevPosts => 
      prevPosts.map(post => post._id === updatedPost._id ? updatedPost : post)
    )
  }

  const handleGroupJoined = () => {
    fetchGroupData(true)
  }

  const handleGroupLeft = () => {
    fetchGroupData(true)
  }

  const handleManageGroup = () => {
    // Navigate to group management page or open management modal
    navigate(`/groups/${groupId}/manage`)
  }

  const handleMemberAdded = () => {
    fetchGroupData(true)
  }

  // Tab configuration
  const tabs = [
    {
      id: "posts",
      label: "Posts",
      icon: <i className="bi bi-chat-text"></i>,
      count: groupPosts.length
    },
    {
      id: "members",
      label: "Members",
      icon: <i className="bi bi-people"></i>,
      count: group?.members?.length || 0
    },
    {
      id: "watchlist",
      label: "Watchlist",
      icon: <i className="bi bi-list-stars"></i>,
      count: group?.sharedWatchlist?.length || 0
    },
    {
      id: "statistics",
      label: "Statistics",
      icon: <i className="bi bi-graph-up"></i>
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return (
          <PostsTabContent
            posts={groupPosts}
            currentUser={user}
            onPostDeleted={isGroupMember ? handlePostDeleted : null}
            onPostUpdated={isGroupMember ? handlePostUpdated : null}
            isViewingOtherUser={false}
            isGroupContext={true}
            groupData={group}
            isGroupMember={isGroupMember}
            isGroupAdmin={isGroupAdmin}
          />
        )
      case "members":
        return (
          <GroupMembers
            groupId={groupId}
            currentUser={user}
            isCreator={isGroupAdmin}
            onMemberAdded={handleMemberAdded}
          />
        )
      case "watchlist":
        return (
          <GroupSharedWatchlist
            groupId={groupId}
            isGroupMember={isGroupMember}
            isGroupAdmin={isGroupAdmin}
          />
        )
      case "statistics":
        return (
          <GroupStatistics
            groupId={groupId}
            group={group}
          />
        )
      default:
        return null
    }
  }

  // Authentication check
  if (!token || !user) {
    return (
      <div className="moviesquad-bg" style={{ minHeight: '100vh' }}>
        <div className="container py-4 d-flex align-items-center justify-content-center">
          <EmptyState
            icon="shield-lock"
            title="Authentication Required"
            description="Please log in to view this group."
            showButton={true}
            buttonText="Sign In"
            buttonAction={() => navigate('/login')}
          />
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="moviesquad-bg" style={{ minHeight: '100vh' }}>
        <div className="container py-4">
          {/* Header Skeleton */}
          <div className="glass-card mb-4">
            <div className="card-body p-4">
              <div className="row align-items-center">
                <div className="col-auto">
                  <div 
                    className="rounded-circle bg-secondary"
                    style={{ width: '100px', height: '100px' }}
                  ></div>
                </div>
                <div className="col">
                  <div className="bg-secondary rounded mb-2" style={{ width: '200px', height: '2rem' }}></div>
                  <div className="bg-secondary rounded mb-3" style={{ width: '300px', height: '1rem' }}></div>
                  <div className="bg-secondary rounded" style={{ width: '250px', height: '1rem' }}></div>
                </div>
                <div className="col-auto">
                  <div className="bg-secondary rounded" style={{ width: '120px', height: '2.5rem' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <CanvasLoader fullscreen={true} text="Loading group..." />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="moviesquad-bg" style={{ minHeight: '100vh' }}>
        <div className="container py-4 d-flex align-items-center justify-content-center">
          <EmptyState
            icon="exclamation-triangle"
            title="Error"
            description={error}
            showButton={true}
            buttonText="Try Again"
            buttonAction={() => fetchGroupData()}
          />
        </div>
      </div>
    )
  }

  // Group not found
  if (!group) {
    return (
      <div className="moviesquad-bg" style={{ minHeight: '100vh' }}>
        <div className="container py-4 d-flex align-items-center justify-content-center">
          <EmptyState
            icon="people"
            title="Group Not Found"
            description="This group doesn't exist or you don't have access to it."
            showButton={true}
            buttonText="Browse Groups"
            buttonAction={() => navigate('/groups')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="moviesquad-bg" style={{ minHeight: '100vh' }}>
      <div className="container py-4">
        {/* Refresh Button */}
        <div className="d-flex justify-content-end mb-3">
          <button 
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
            onClick={() => fetchGroupData(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <span className="spinner-border spinner-border-sm" role="status"></span>
            ) : (
              <i className="bi bi-arrow-clockwise"></i>
            )}
            Refresh
          </button>
        </div>

        {/* Group Header */}
        <EntityHeader
          entity={group}
          type="group"
          currentUser={user}
          onEntityUpdated={fetchGroupData}
          onPostCreated={handlePostCreated}
          isOwnEntity={isGroupAdmin}
          groupId={groupId}
          onGroupJoined={handleGroupJoined}
          onGroupLeft={handleGroupLeft}
          onManageGroup={handleManageGroup}
        />

        {/* Tabs */}
        <TabsWrapper
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="group"
        >
          {renderTabContent()}
        </TabsWrapper>
      </div>
    </div>
  )
}