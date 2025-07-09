"use client"

import { useState } from "react"
import axios from "axios"

export default function AddPostModal({ isOpen, onClose, onPostCreated, groupId = null }) {
    
    // TODO:
    // tmdbId = fetch more details from the TMDB API.
    // tmdbType = should be [movie,tv,multi]
    // tmdbTitle= should be a result from search bar using TMDB API.
    // tmdbPosterPath = thumbnail from TMDB API
    //required for tmdbId, tmdbType, tmdbTitle ensures every post is related to content
    // We should fetch them using endpoints... not as inputs...
    const [formData, setFormData] = useState({
        content: '',
        tmdbId: '',
        tmdbType: 'movie',
        tmdbTitle: '',
        tmdbPosterPath: '',
        categories: ['general']
    })
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const handleCategoryClick = (category) => {
        setFormData(prev => ({
            ...prev,
            categories: [category]
        }))
    }

    const validateForm = () => {
        const newErrors = {}
        
        if (!formData.content.trim()) {
            newErrors.content = 'Post content is required'
        }
        
        if (!formData.tmdbId.trim()) {
            newErrors.tmdbId = 'Movie/TV ID is required'
        }
        
        if (!formData.tmdbTitle.trim()) {
            newErrors.tmdbTitle = 'Movie/TV title is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')
            
            const postData = {
                content: formData.content.trim(),
                tmdbId: parseInt(formData.tmdbId),
                tmdbType: formData.tmdbType,
                tmdbTitle: formData.tmdbTitle.trim(),
                tmdbPosterPath: formData.tmdbPosterPath.trim() || null,
                categories: formData.categories
            }

            // Add groupId if posting to a group
            if (groupId) {
                postData.groupId = groupId
            }

            const response = await axios.post(
                'http://localhost:3001/api/posts',
                postData,
                {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                }
            )

            console.log('Post created:', response.data)
            
            // Reset form
            setFormData({
                content: '',
                tmdbId: '',
                tmdbType: 'movie',
                tmdbTitle: '',
                tmdbPosterPath: '',
                categories: ['general']
            })
            
            // Close modal
            onClose()
            
            // Notify parent component
            if (onPostCreated) {
                onPostCreated(response.data)
            }
            
            alert('Post created successfully!')
            
        } catch (error) {
            console.error('Error creating post:', error)
            if (error.response?.data?.msg) {
                alert(`Error: ${error.response.data.msg}`)
            } else {
                alert('Failed to create post. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const categories = [
        { id: 'review', label: 'Review', icon: '⭐' },
        { id: 'recommendation', label: 'Recommendation', icon: '👍' },
        { id: 'discussion', label: 'Discussion', icon: '💬' },
        { id: 'question', label: 'Question', icon: '❓' },
        { id: 'news', label: 'News', icon: '📰' },
        { id: 'general', label: 'General', icon: '📝' }
    ]

    if (!isOpen) return null

    return (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content" style={{backgroundColor: '#2c2c2c', color: 'white', border: 'none'}}>
                    <div className="modal-header border-0">
                        <h5 className="modal-title text-white">
                            Create New Post
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close btn-close-white" 
                            onClick={onClose}
                        ></button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {/* Content Textarea */}
                            <div className="mb-4">
                                <label className="form-label text-white h6">
                                    What's on your mind?
                                </label>
                                <textarea
                                    className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                                    name="content"
                                    rows="4"
                                    placeholder="Share your thoughts about movies, TV shows, or entertainment..."
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    style={{
                                        backgroundColor: '#3c3c3c',
                                        border: '1px solid #555',
                                        color: 'white',
                                        resize: 'none'
                                    }}
                                />
                                {errors.content && (
                                    <div className="invalid-feedback">{errors.content}</div>
                                )}
                            </div>

                            {/* Movie/TV Search */}
                            <div className="mb-4">
                                <label className="form-label text-white h6">
                                    Link to Movie/TV Show (optional)
                                </label>
                                <div className="row">
                                    <div className="col-md-8">
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="tmdbTitle"
                                            placeholder="Search for a movie or TV show..."
                                            value={formData.tmdbTitle}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            style={{
                                                backgroundColor: '#3c3c3c',
                                                border: '1px solid #555',
                                                color: 'white'
                                            }}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="tmdbId"
                                            placeholder="TMDB ID"
                                            value={formData.tmdbId}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            style={{
                                                backgroundColor: '#3c3c3c',
                                                border: '1px solid #555',
                                                color: 'white'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="mb-4">
                                <label className="form-label text-white h6">
                                    Categories (select at least one)
                                </label>
                                <div className="d-flex flex-wrap gap-2">
                                    {categories.map(category => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            className={`btn ${
                                                formData.categories.includes(category.id)
                                                    ? 'btn-warning'
                                                    : 'btn-outline-warning'
                                            }`}
                                            onClick={() => handleCategoryClick(category.id)}
                                            disabled={isLoading}
                                        >
                                            {category.icon} {category.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer border-0">
                            <button 
                                type="button" 
                                className="btn btn-outline-secondary text-white" 
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn"
                                disabled={isLoading}
                                style={{
                                    backgroundColor: '#ff8c00',
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Publishing...
                                    </>
                                ) : (
                                    'Publish Post'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}