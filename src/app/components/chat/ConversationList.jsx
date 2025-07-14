"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../hooks/useAuth"
import axios from "axios"

export default function ConversationList({ 
    currentUser, 
    conversations, 
    onConversationSelect, 
    selectedConversationId 
}) {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const { token } = useAuth()

    useEffect(() => {
        fetchConversations()
    }, [])

    const fetchConversations = async () => {
        try {
            // Debug: Check if token exists
            console.log('Token exists:', !!token)
            
            if (!token) {
                console.log('No token found, skipping API call')
                setIsLoading(false)
                return
            }

            console.log('Making API call to fetch conversations...')
            const response = await axios.get('http://localhost:3001/api/conversations/me', {
                headers: { 
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            })
            
            console.log('Conversations fetched successfully:', response.data)
            
        } catch (error) {
            console.error('Error fetching conversations:', error)
            
            if (error.response?.status === 401) {
                console.log('Token invalid, user might need to login again')
            } else {
                setError('Failed to load conversations')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const formatLastMessage = (message) => {
        if (!message) return 'No messages yet'
        return message.content.length > 30 
            ? message.content.substring(0, 30) + '...'
            : message.content
    }

    const formatTime = (timestamp) => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now - date
        
        if (diff < 60000) return 'Just now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
        return date.toLocaleDateString()
    }

    if (isLoading) {
        return (
            <div className="text-center p-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="alert alert-danger m-3" role="alert">
                {error}
            </div>
        )
    }

    return (
        <div className="conversation-list">
            <div className="p-3 border-bottom" style={{ backgroundColor: '#3c3c3c', borderColor: '#444' }}>
                <h6 className="mb-0 text-white"><i class="bi bi-chat"></i> Conversations</h6>
            </div>
            
            {conversations.length === 0 ? (
                <div className="text-center p-4">
                    <p className="text-light">No conversations yet</p>
                    <small className="text-muted">Start a new conversation!</small>
                </div>
            ) : (
                <div className="list-group list-group-flush">
                    {conversations.map(conversation => {
                        const isSelected = conversation.chatIdentifier === selectedConversationId
                        
                        return (
                            <div
                                key={conversation.chatIdentifier}
                                className={`list-group-item list-group-item-action ${isSelected ? 'active' : ''}`}
                                onClick={() => onConversationSelect(conversation)}
                                style={{ 
                                    cursor: 'pointer',
                                    backgroundColor: isSelected ? '#8b5cf6' : '#2c2c2c',
                                    borderColor: '#444',
                                    color: isSelected ? 'white' : '#e9ecef'
                                }}
                            >
                                <div className="d-flex justify-content-between">
                                    <div className="d-flex align-items-center flex-grow-1">
                                        <div 
                                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3"
                                            style={{ 
                                                width: '40px', 
                                                height: '40px',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {(conversation.otherParticipant?.username || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between">
                                                <h6 className={`mb-1 ${isSelected ? 'text-white' : 'text-light'}`}>
                                                    {conversation.otherParticipant?.username || 'Unknown User'}
                                                </h6>
                                                <small className={isSelected ? 'text-white-50' : 'text-muted'}>
                                                    {formatTime(conversation.lastMessage?.createdAt)}
                                                </small>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <p className={`mb-1 ${isSelected ? 'text-white-50' : 'text-muted'}`}>
                                                    {formatLastMessage(conversation.lastMessage)}
                                                </p>
                                                {conversation.unreadCount > 0 && (
                                                    <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.7rem' }}>
                                                        {conversation.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}