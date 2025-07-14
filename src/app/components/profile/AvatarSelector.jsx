"use client"

import { useState, useEffect } from "react"
import axios from "axios"

export default function AvatarSelector({ 
    currentAvatar, 
    onAvatarSelect, 
    isVisible = false 
}) {
    const [avatars, setAvatars] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (isVisible) {
            fetchAvatars()
        }
    }, [isVisible])

    const fetchAvatars = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const response = await axios.get('http://localhost:3001/api/avatars')
            setAvatars(response.data.data || [])
        } catch (error) {
            console.error('Error fetching avatars:', error)
            setError('Failed to load avatars. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAvatarClick = (avatar) => {
        onAvatarSelect(avatar.url)
    }

    if (!isVisible) return null

    return (
        <div className="mb-3">
            <label className="form-label text-white mb-3">
                <i className="bi bi-person-circle me-2"></i>
                Choose from Available Avatars
            </label>
            
            {error && (
                <div className="alert alert-danger mb-3" style={{ backgroundColor: '#421f1f', border: '1px solid #842029', color: '#f5c2c7' }}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                    <button 
                        className="btn btn-sm btn-outline-danger ms-2"
                        onClick={fetchAvatars}
                        style={{ borderColor: '#842029', color: '#f5c2c7' }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Avatar Grid */}
            {isLoading ? (
                <div className="text-center py-4" style={{ backgroundColor: '#3c3c3c', borderRadius: '8px' }}>
                    <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">Loading avatars...</span>
                    </div>
                    <p className="text-light mt-2 mb-0">Loading avatar options...</p>
                </div>
            ) : (
                <div 
                    className="row g-2 p-3"
                    style={{ 
                        maxHeight: '300px', 
                        overflowY: 'auto',
                        backgroundColor: '#3c3c3c',
                        borderRadius: '8px',
                        border: '1px solid #555'
                    }}
                >
                    {avatars.map((avatar) => (
                        <div key={avatar.id} className="col-3 col-sm-2">
                            <button
                                type="button"
                                className={`btn p-1 w-100 border-2 ${
                                    currentAvatar === avatar.url 
                                        ? 'border-warning' 
                                        : 'border-secondary'
                                }`}
                                onClick={() => handleAvatarClick(avatar)}
                                style={{
                                    backgroundColor: currentAvatar === avatar.url 
                                        ? 'rgba(245, 158, 11, 0.2)' 
                                        : '#2c2c2c',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease',
                                    aspectRatio: '1'
                                }}
                                title={avatar.name}
                            >
                                <img 
                                    src={avatar.url} 
                                    alt={avatar.name}
                                    className="rounded-circle w-100 h-100"
                                    style={{ objectFit: 'cover' }}
                                />
                            </button>
                            <small 
                                className="text-center d-block mt-1 text-light"
                                style={{ fontSize: '0.7rem' }}
                            >
                                {avatar.name}
                            </small>
                        </div>
                    ))}
                </div>
            )}

            {avatars.length === 0 && !isLoading && !error && (
                <div className="text-center py-4" style={{ backgroundColor: '#3c3c3c', borderRadius: '8px' }}>
                    <i className="bi bi-emoji-frown text-muted" style={{ fontSize: '2rem' }}></i>
                    <p className="text-light mt-2 mb-0">No avatars available</p>
                </div>
            )}

            <small className="text-muted mt-2 d-block">
                <i className="bi bi-info-circle me-1"></i>
                Select an avatar from our collection or keep your current selection.
            </small>
        </div>
    )
}