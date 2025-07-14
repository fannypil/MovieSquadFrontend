"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../hooks/useAuth"

export default function SignIn({onLoginSuccess}){
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [success, setSuccess] = useState(false)
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const { login } = useAuth();

    const validateForm = () => {
        const newErrors = {}
        
        // Email validation
        if (!email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email address"
        }
        
        // Password validation
        if (!password) {
            newErrors.password = "Password is required"
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSignIn = async (e) => {
        e.preventDefault()
        setErrors({})
        
        // Validate form before submitting
        if (!validateForm()) {
            return
        }
        
        setIsLoading(true)
        
         try {
            const result = await login(email.trim(), password);
            
            if (result.success) {
                setSuccess(true)
                
                // Clear form after successful login
                setEmail("")
                setPassword("")

                // Call the callback to update parent component
                if (onLoginSuccess) {
                    onLoginSuccess(result.user)
                }
            } else {
                setErrors({ general: result.error })
            }

        } catch (error) {
            console.log(error)
            setErrors({ general: "An error occurred during sign in. Please try again." })
        } finally {
            setIsLoading(false)
        }
    }

    return(
        <div className="card p-4 shadow-sm">
            <h2 className="text-center mb-4">Sign In</h2>
            
            {/* Success Message */}
            {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <strong>Success!</strong> Welcome back to MovieSquad!
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setSuccess(false)}
                        aria-label="Close"
                    ></button>
                </div>
            )}
            
            {/* General Error Message */}
            {errors.general && (
                <div className="alert alert-danger" role="alert">
                    {errors.general}
                </div>
            )}
            
            <form onSubmit={handleSignIn}>
                <div className="form-floating mb-3">
                    <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="signinEmail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                    />
                    <label htmlFor="signinEmail">Email address</label>
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                
                <div className="form-floating mb-3">
                    <input
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="signinPassword"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <label htmlFor="signinPassword">Password</label>
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>
                
                <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Signing In...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>
            
            <div className="text-center mt-3">
                <small className="text-muted">
                    Don't have an account? <a href="#" className="text-decoration-none">Sign up here</a>
                </small>
            </div>
        </div>
    )
}