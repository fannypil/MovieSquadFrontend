"use client";

import { useState, useEffect, useRef } from "react";

export function useTyping(socket, chatIdentifier) {
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleUserTyping = (data) => {
      if (data.chatIdentifier === chatIdentifier) {
        setOtherUserTyping(true);
        console.log("Other user is typing:", data.username);
      }
    };

    const handleUserStoppedTyping = (data) => {
      if (data.chatIdentifier === chatIdentifier) {
        setOtherUserTyping(false);
        console.log(" Other user stopped typing:", data.username);
      }
    };

    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);

    return () => {
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
    };
  }, [socket, chatIdentifier]);

  useEffect(() => {
    setOtherUserTyping(false);
  }, [chatIdentifier]);

  const startTyping = (recipientId) => {
    if (socket && !isTyping) {
      setIsTyping(true);
      socket.emit("typing", { recipientId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(recipientId);
    }, 1000);
  };

  const stopTyping = (recipientId) => {
    if (socket && isTyping) {
      setIsTyping(false);
      socket.emit("stopTyping", { recipientId });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  return {
    isTyping,
    otherUserTyping,
    startTyping,
    stopTyping,
  };
}
