"use client"

import { useState } from "react"
import axios from "axios"
import { useAuth } from "../../hooks/useAuth"

export default function CreateGroupForm({ isOpen, onClose, onGroupCreated }) {
    const { user, token } = useAuth() 

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPrivate: false
    })
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const validateForm = () => {
        const newErrors = {}
        
        if (!formData.name.trim()) {
            newErrors.name = 'Group name is required'
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Group name must be at least 3 characters'
        } else if (formData.name.trim().length > 50) {
            newErrors.name = 'Group name must be less than 50 characters'
        }
        
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required'
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters'
        } else if (formData.description.trim().length > 500) {
            newErrors.description = 'Description must be less than 500 characters'
        }
        
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validationErrors = validateForm()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }
        
        if (!token) {
            setErrors({ submit: 'Authentication required. Please log in again.' })
            return
        }
        
        setIsLoading(true)
        setErrors({})

        try {
            const response = await axios.post('http://localhost:3001/api/groups', {
                name: formData.name.trim(),
                description: formData.description.trim(),
                isPrivate: formData.isPrivate
            }, {
                headers: { 'x-auth-token': token } 
            })

            onGroupCreated?.(response.data)
            setFormData({ name: '', description: '', isPrivate: false })
            setErrors({})
            onClose()
            
        } catch (error) {
            console.error('API error:', error)
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.msg || 
                                'Failed to create group'
            setErrors({ submit: errorMessage })
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content" style={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
                    <div className="modal-header border-bottom border-secondary">
                        <h5 className="modal-title text-white d-flex align-items-center gap-2">
                            <i className="bi bi-plus-circle text-warning"></i>
                            Create New Group
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close btn-close-white" 
                            onClick={onClose}
                            disabled={isLoading}
                        ></button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {/* Error Message */}
                            {errors.submit && (
                                <div className="alert alert-danger d-flex align-items-center gap-2">
                                    <i className="bi bi-exclamation-triangle"></i>
                                    {errors.submit}
                                </div>
                            )}

                            {/* Group Name */}
                            <div className="mb-4">
                                <label className="form-label text-white fw-semibold">
                                    Group Name <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter a memorable group name..."
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    maxLength={50}
                                    disabled={isLoading}
                                />
                                <div className="d-flex justify-content-between mt-1">
                                    {errors.name ? (
                                        <small className="text-danger">{errors.name}</small>
                                    ) : (
                                        <small className="text-muted">Choose a name that represents your group's focus</small>
                                    )}
                                    <small className="text-muted">{formData.name.length}/50</small>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="form-label text-white fw-semibold">
                                    Description <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="What's this group about? What kind of movies or shows do you discuss?"
                                    rows={4}
                                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                    maxLength={500}
                                    disabled={isLoading}
                                />
                                <div className="d-flex justify-content-between mt-1">
                                    {errors.description ? (
                                        <small className="text-danger">{errors.description}</small>
                                    ) : (
                                        <small className="text-muted">Describe your group's purpose and what members can expect</small>
                                    )}
                                    <small className="text-muted">{formData.description.length}/500</small>
                                </div>
                            </div>

                            {/* Privacy Settings */}
                            <div className="glass-card">
                                <div className="card-body">
                                    <div className="d-flex align-items-start gap-3">
                                        <div className="flex-grow-1">
                                            <h6 className="text-white mb-2 d-flex align-items-center gap-2">
                                                <i className="bi bi-shield-lock text-warning"></i>
                                                Privacy Settings
                                            </h6>
                                            <div className="form-check form-switch">
                                                <input
                                                    type="checkbox"
                                                    name="isPrivate"
                                                    id="isPrivate"
                                                    checked={formData.isPrivate}
                                                    onChange={handleInputChange}
                                                    className="form-check-input"
                                                    disabled={isLoading}
                                                />
                                                <label className="form-check-label text-white" htmlFor="isPrivate">
                                                    Make this group private
                                                </label>
                                            </div>
                                            <small className="text-light opacity-75">
                                                {formData.isPrivate ? (
                                                    <>
                                                        <i className="bi bi-lock me-1"></i>
                                                        Private groups require approval to join. You'll review join requests.
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-globe me-1"></i>
                                                        Public groups allow anyone to join immediately.
                                                    </>
                                                )}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer border-top border-secondary">
                            <button 
                                type="button" 
                                className="btn btn-outline-light" 
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                <i className="bi bi-x-circle me-2"></i>
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-gold"
                                disabled={!formData.name.trim() || !formData.description.trim() || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Create Group
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}