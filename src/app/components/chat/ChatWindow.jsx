"use client"

import { useEffect, useRef } from "react"
import MessageBubble from "./MessageBubble"
import ChatHeader from "./ChatHeader"
import ChatInput from "./ChatInput"
import TypingIndicator from "./TypingIndicator"
import { useTyping } from "../../hooks/useTyping"
import { useMessageStatus } from "../../hooks/useMessageStatus"

export default function ChatWindow({ 
    conversation, 
    currentUser, 
    messages, 
    onSendMessage,
    socket
}) {
    const messagesEndRef = useRef(null)
    
    const { otherUserTyping, startTyping, stopTyping } = useTyping(
        socket, 
        conversation?.chatIdentifier
    )
    
    const { messageStatuses } = useMessageStatus(socket, conversation, messages, currentUser)

    useEffect(() => {
        scrollToBottom()
    }, [messages, otherUserTyping])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSendMessage = (content) => {
        if (conversation) {
            onSendMessage(content, conversation.otherParticipant._id)
        }
    }

    const handleStartTyping = () => {
        if (conversation) {
            startTyping(conversation.otherParticipant._id)
        }
    }

    const handleStopTyping = () => {
        if (conversation) {
            stopTyping(conversation.otherParticipant._id)
        }
    }

    if (!conversation) {
        return (
            <div className="chat-window d-flex align-items-center justify-content-center" style={{ height: '500px', backgroundColor: '#2c2c2c' }}>
                <div className="text-center">
                    <h5 className="text-white mb-3">
                        <i class="bi bi-chat"></i> Select a conversation</h5>
                    <p className="text-light">Choose a conversation from the list to start messaging</p>
                </div>
            </div>
        )
    }

    return (
        <div className="chat-window d-flex flex-column" style={{ height: '500px', backgroundColor: '#2c2c2c' }}>
            <ChatHeader 
                otherUser={conversation.otherParticipant} 
                isTyping={otherUserTyping} 
            />

            <div className="messages-area flex-grow-1 overflow-auto p-3" style={{ backgroundColor: '#2c2c2c' }}>
                {messages.length === 0 ? (
                    <div className="text-center p-4">
                        <p className="text-light mb-2">No messages yet</p>
                        <small className="text-muted">Start the conversation!</small>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <MessageBubble
                                key={message._id}
                                message={message}
                                isOwn={message.sender._id === currentUser._id}
                                showAvatar={index === 0 || messages[index - 1].sender._id !== message.sender._id}
                                messageStatus={messageStatuses[message._id] || {}}
                            />
                        ))}
                        
                        {otherUserTyping && (
                            <TypingIndicator user={conversation.otherParticipant} />
                        )}
                        
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <ChatInput
                onSendMessage={handleSendMessage}
                onStartTyping={handleStartTyping}
                onStopTyping={handleStopTyping}
            />
        </div>
    )
}