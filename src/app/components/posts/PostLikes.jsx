"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "@/app/hooks/useAuth"

export default function PostLikes({ postId, likes }) {
    const { user, token } = useAuth()
    const [likesData, setLikesData] = useState(likes || [])
    const [isLiked, setIsLiked] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (user) {
            const userLiked = likesData.some(like => 
                like === user._id || like === user.id || 
                like._id === user._id || like._id === user.id
            )
            setIsLiked(userLiked)
        }
    }, [likesData, user])

    const handleLike = async () => {
    setIsLoading(true)
    try {
        const response = await axios.put(
                `http://localhost:3001/api/posts/${postId}/like`,
                {},
                {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                }
            )
            const updatedPostResponse = await axios.get(`http://localhost:3001/api/posts/${postId}`)
            setLikesData(updatedPostResponse.data.likes)
           
    } catch (error) {
        console.error('Error liking/unliking post:', error)
        alert('Failed to update like. Please try again.')
    } finally {
        setIsLoading(false)
    }
}

     return (
        <div className="d-flex align-items-center mb-2">
            <button 
                className={`btn ${isLiked ? 'btn-primary' : 'btn-outline-primary'} btn-sm me-2`}
                onClick={handleLike}
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="spinner-border spinner-border-sm me-1"></span>
                ) : (
                    <i className={`${isLiked ? 'bi bi-heart-fill text-danger' : 'bi bi-heart'} me-1`}></i>
                )}
                {isLiked ? 'Liked' : 'Like'} ({likesData.length})
            </button>
        </div>
    )
}