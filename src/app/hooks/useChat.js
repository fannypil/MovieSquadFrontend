"use client"

import { useState, useEffect } from 'react'

export function useChat(socket, currentUser) {
    const [conversations, setConversations] = useState([])
    const [messages, setMessages] = useState([])
    const [selectedConversation, setSelectedConversation] = useState(null)

    useEffect(() => {
        if (!socket) return

        const handlePrivateMessage = (message) => {
            console.log(' New message received:', message)
            
            if (selectedConversation?.chatIdentifier === message.chatIdentifier) {
                setMessages(prev => {
                    const exists = prev.some(msg => msg._id === message._id)
                    return exists ? prev : [...prev, message]
                })
            }

            setConversations(prev => {
                const existingIndex = prev.findIndex(conv => 
                    conv.chatIdentifier === message.chatIdentifier
                )
                
                if (existingIndex !== -1) {
                    const updated = [...prev]
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        lastMessage: message
                    }
                    return updated
                }
                return prev
            })
        }

        const handleChatHistory = (data) => {
            console.log(' Chat history received:', data.messages?.length || 0)
            setMessages(data.messages || [])
        }

        const handleConversationsList = (data) => {
            console.log(' Conversations list received:', data.length)
            setConversations(data)
        }

        socket.on('privateMessage', handlePrivateMessage)
        socket.on('privateChatHistory', handleChatHistory)
        socket.on('conversationsList', handleConversationsList)

        return () => {
            socket.off('privateMessage', handlePrivateMessage)
            socket.off('privateChatHistory', handleChatHistory)
            socket.off('conversationsList', handleConversationsList)
        }
    }, [socket, selectedConversation?.chatIdentifier])

    const joinChat = (otherUserId) => {
        if (socket) {
            console.log(' Joining chat with:', otherUserId)
            socket.emit('joinPrivateChat', otherUserId)
        }
    }

    const sendMessage = (content, recipientId) => {
        if (socket && content.trim()) {
            console.log(' Sending message to:', recipientId)
            socket.emit('sendPrivateMessage', {
                recipientId,
                content: content.trim()
            })
        }
    }

    const createConversation = (conversation) => {
        setConversations(prev => {
            const exists = prev.some(conv => conv.chatIdentifier === conversation.chatIdentifier)
            return exists ? prev : [...prev, conversation]
        })
        setSelectedConversation(conversation)
    }

    return {
        conversations,
        messages,
        selectedConversation,
        setConversations,
        setMessages,
        setSelectedConversation,
        joinChat,
        sendMessage,
        createConversation
    }
}