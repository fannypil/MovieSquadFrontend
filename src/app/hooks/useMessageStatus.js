"use client"

import { useState, useEffect, useRef } from 'react'

export function useMessageStatus(socket, conversation, messages, currentUser) {
    const [messageStatuses, setMessageStatuses] = useState({})
    const processedMessagesRef = useRef(new Set()) // Track which messages we've already processed
    const markingTimeoutRef = useRef(null)

    useEffect(() => {
        if (!socket || !conversation) return

        const handleMessageReadStatus = (data) => {
            // Remove the excessive logging
            // console.log('👁️ Message read status:', data)
            setMessageStatuses(prev => ({
                ...prev,
                [data.messageId]: {
                    ...prev[data.messageId],
                    read: true,
                    readAt: data.readAt,
                    readBy: data.readBy
                }
            }))
        }

        socket.on('messageReadStatus', handleMessageReadStatus)

        return () => {
            socket.off('messageReadStatus', handleMessageReadStatus)
        }
    }, [socket, conversation?.chatIdentifier])

    useEffect(() => {
        const markUnreadMessagesAsRead = () => {
            if (!socket || !conversation || !currentUser) return

            const unreadMessages = messages.filter(msg => {
                const isOwnMessage = msg.sender._id === currentUser._id
                const alreadyProcessed = processedMessagesRef.current.has(msg._id)
                const alreadyRead = messageStatuses[msg._id]?.read
                
                return !isOwnMessage && !alreadyProcessed && !alreadyRead
            })

            if (unreadMessages.length === 0) return

            // Mark messages as processed to prevent duplicates
            unreadMessages.forEach(message => {
                processedMessagesRef.current.add(message._id)
                
                socket.emit('messageRead', {
                    messageId: message._id,
                    chatIdentifier: conversation.chatIdentifier
                })
                
                setMessageStatuses(prev => ({
                    ...prev,
                    [message._id]: {
                        ...prev[message._id],
                        read: true,
                        readAt: new Date()
                    }
                }))
            })

            console.log(`📖 Marked ${unreadMessages.length} messages as read`)
        }

        // Clear any existing timeout
        if (markingTimeoutRef.current) {
            clearTimeout(markingTimeoutRef.current)
        }

        // Debounce the marking process
        if (messages.length > 0) {
            markingTimeoutRef.current = setTimeout(markUnreadMessagesAsRead, 500)
        }

        const handleWindowFocus = () => {
            // Clear timeout and mark immediately on focus
            if (markingTimeoutRef.current) {
                clearTimeout(markingTimeoutRef.current)
            }
            markUnreadMessagesAsRead()
        }

        window.addEventListener('focus', handleWindowFocus)
        return () => {
            window.removeEventListener('focus', handleWindowFocus)
            if (markingTimeoutRef.current) {
                clearTimeout(markingTimeoutRef.current)
            }
        }
    }, [messages, socket, conversation, currentUser._id]) 

    useEffect(() => {
        // Reset state when conversation changes
        setMessageStatuses({})
        processedMessagesRef.current.clear()
    }, [conversation?.chatIdentifier])

    return { messageStatuses }
}