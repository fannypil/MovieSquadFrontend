"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { io } from "socket.io-client"
import axios from "axios"
import ConversationList from "../components/chat/ConversationList"
import ChatWindow from "../components/chat/ChatWindow"
import NewConversationModal from "../components/chat/NewConversationModal"
import CanvasLoader from "../components/CanvasLoader"

export default function Chat() {
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [showNewConversationModal, setShowNewConversationModal] = useState(false)
    const [socket, setSocket] = useState(null)
    const [conversations, setConversations] = useState([])
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    // Use refs to get current values in socket event listeners
    const selectedConversationRef = useRef(selectedConversation)
    const userRef = useRef(null)
    const socketRef = useRef(null)
    
    const { user, token, isAuthenticated } = useAuth()

    // Update refs when state changes
    useEffect(() => {
        selectedConversationRef.current = selectedConversation
    }, [selectedConversation])

    useEffect(() => {
        userRef.current = user
    }, [user])

    // Memoize user data to prevent unnecessary re-renders
    const stableUser = useMemo(() => user, [user?.id, user?._id, user?.username])
    const stableToken = useMemo(() => token, [token])

    // Load conversations from backend
    const loadConversations = async () => {
        try {
            if (!stableToken) {
                console.log('No token available')
                return
            }

            console.log('Loading conversations from backend...')
            const response = await axios.get('http://localhost:3001/api/conversations/me', {
                headers: { 'x-auth-token': stableToken }
            })
            
            console.log('Loaded conversations:', response.data.length)
            setConversations(response.data)
        } catch (error) {
            console.error('Error loading conversations:', error)
            if (error.response?.status === 401) {
                console.log('Token invalid, redirecting to login')
                navigate('/')
            }
        }
    }

    // Helper function to find user by ID
    const findUserById = (userId) => {
        return {
            _id: userId,
            username: "User " + userId.substring(0, 6),
            email: "user@example.com",
            profilePicture: "https://via.placeholder.com/40"
        }
    }

    // Initialize socket connection once
    useEffect(() => {
        if (!isAuthenticated || !stableUser || !stableToken) {
            console.log('Not authenticated, redirecting to login')
            navigate('/')
            return
        }

        // Prevent multiple socket connections
        if (socketRef.current) {
            console.log(' Socket already exists, skipping initialization')
            return
        }

        console.log('Initializing socket connection for user:', stableUser.username)

        // Load conversations from backend
        loadConversations()

        // Initialize Socket.io connection
        const newSocket = io('http://localhost:3001', {
            auth: {
                token: stableToken
            }
        })

        socketRef.current = newSocket
        setSocket(newSocket)

        // Socket event listeners
        newSocket.on('connect', () => {
            console.log(' Connected to server')
            setIsLoading(false)
            loadConversations()
        })

        newSocket.on('connect_error', (error) => {
            console.error(' Socket connection error:', error)
            if (error.message.includes('Authentication error')) {
                console.log(' Token invalid, redirecting to login')
                navigate('/')
            }
        })

        newSocket.on('joinedPrivateChat', (data) => {
            console.log(' Joined private chat:', data.chatIdentifier)
        })

        newSocket.on('privateChatHistory', (data) => {
            console.log(' Received chat history:', data.messages?.length || 0, 'messages')
            setMessages(data.messages || [])
        })

        newSocket.on('privateMessage', (message) => {
            console.log(' New message received from:', message.sender.username)
            
            // Add message to current conversation messages
            const currentConversation = selectedConversationRef.current
            const currentUser = userRef.current
            
            if (currentConversation && currentConversation.chatIdentifier === message.chatIdentifier) {
                console.log(' Adding message to current conversation')
                setMessages(prev => {
                    // Check if message already exists
                    const exists = prev.some(msg => msg._id === message._id)
                    if (exists) {
                        console.log(' Message already exists, not adding duplicate')
                        return prev
                    }
                    return [...prev, message]
                })
            } else {
                console.log(' Message for different conversation, updating sidebar only')
            }
            
            // Update conversations list
            setConversations(prev => {
                const existingConvIndex = prev.findIndex(conv => conv.chatIdentifier === message.chatIdentifier)
                
                if (existingConvIndex !== -1) {
                    // Update existing conversation
                    const updatedConversations = [...prev]
                    updatedConversations[existingConvIndex] = {
                        ...updatedConversations[existingConvIndex],
                        lastMessage: message
                    }
                    return updatedConversations
                } else {
                    // Create new conversation
                    const otherParticipant = message.sender._id === currentUser._id 
                        ? message.recipient || findUserById(message.recipientId)
                        : message.sender
                    
                    const newConversation = {
                        chatIdentifier: message.chatIdentifier,
                        otherParticipant,
                        lastMessage: message,
                        participants: [currentUser, otherParticipant]
                    }
                    
                    console.log(' Auto-creating conversation:', newConversation.chatIdentifier)
                    return [newConversation, ...prev]
                }
            })
        })

        newSocket.on('privateChatError', (error) => {
            console.error(' Private chat error:', error)
            alert(error)
        })

        newSocket.on('typing', (data) => {
            // Handle typing indicator
        })

        newSocket.on('stopTyping', (data) => {
            // Handle stop typing indicator
        })

        return () => {
            console.log(' Disconnecting socket')
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
            }
        }
    }, [navigate, isAuthenticated, stableUser?.id, stableToken]) // Only essential dependencies

    const handleConversationSelect = (conversation) => {
        console.log(' Selecting conversation with:', conversation.otherParticipant.username)
        
        setSelectedConversation(conversation)
        setMessages([]) // Clear previous messages
        
        // Join the private chat room
        if (socket && conversation.otherParticipant) {
            console.log(' Joining private chat room')
            socket.emit('joinPrivateChat', conversation.otherParticipant._id)
        }
    }

    const handleSendMessage = (content) => {
        if (socket && selectedConversation && content.trim()) {
            const messageData = {
                recipientId: selectedConversation.otherParticipant._id,
                content: content.trim()
            }
            console.log(' Sending message:', content.substring(0, 30) + '...')
            socket.emit('sendPrivateMessage', messageData)
        }
    }

    const handleNewConversation = (conversation) => {
        console.log(' Creating new conversation with:', conversation.otherParticipant.username)
        setConversations(prev => {
            const exists = prev.some(conv => conv.chatIdentifier === conversation.chatIdentifier)
            if (exists) {
                return prev
            }
            return [conversation, ...prev]
        })
        setSelectedConversation(conversation)
        setShowNewConversationModal(false)
        
        if (socket && conversation.otherParticipant) {
            socket.emit('joinPrivateChat', conversation.otherParticipant._id)
        }
    }

    const handleStartTyping = () => {
        if (socket && selectedConversation) {
            socket.emit('typing', {
                recipientId: selectedConversation.otherParticipant._id
            })
        }
    }

    const handleStopTyping = () => {
        if (socket && selectedConversation) {
            socket.emit('stopTyping', {
                recipientId: selectedConversation.otherParticipant._id
            })
        }
    }
    // Authentication check
    if (!user || !token) {
        return (
            <div className="moviesquad-bg d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
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
          return (
         <CanvasLoader fullscreen={true} text="Loading your messages..." />
        )
    }

    return (
        <div className="moviesquad-bg" style={{ minHeight: '100vh' }}>
            <div className="container py-4">
                 {/* Page Header (matching other pages) */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="display-5 fw-bold text-white mb-2">
                            Messages
                        </h1>
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
                        <div className="card shadow-sm" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
                            <ConversationList
                                currentUser={stableUser}
                                conversations={conversations}
                                onConversationSelect={handleConversationSelect}
                                selectedConversationId={selectedConversation?.chatIdentifier}
                            />
                            <div className="card-footer text-center" style={{ backgroundColor: '#2c2c2c', borderTop: '1px solid #444' }}>
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
                        <div className="glass-card" style={{ height: '70vh' }}>
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
                                        <i className="bi bi-chat-square-dots text-muted" style={{ fontSize: '4rem' }}></i>
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
    )
}