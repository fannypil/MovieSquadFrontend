"use client"

import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export function useSocket(user, token) {
    const [socket, setSocket] = useState(null)
    const [isConnected, setIsConnected] = useState(false)
    const socketRef = useRef(null)

    useEffect(() => {
        if (!user || !token) return
        if (socketRef.current) return

        const newSocket = io('http://localhost:3001', {
            auth: { token }
        })

        socketRef.current = newSocket
        setSocket(newSocket)

        newSocket.on('connect', () => {
            console.log('✅ Socket connected')
            setIsConnected(true)
        })

        newSocket.on('disconnect', () => {
            console.log('❌ Socket disconnected')
            setIsConnected(false)
        })

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error)
            setIsConnected(false)
        })

        return () => {
            if (socketRef.current) {
                console.log('🔌 Disconnecting socket')
                socketRef.current.disconnect()
                socketRef.current = null
                setSocket(null)
                setIsConnected(false)
            }
        }
    }, [user?.id, token])

    return { socket, isConnected }
}