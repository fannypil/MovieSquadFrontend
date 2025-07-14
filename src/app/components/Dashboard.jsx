"use client"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import SignIn from "./SignIn"
import SignUp from "./SignUp"
import Home from "../pages/Home"
import { useAuth } from "../hooks/useAuth"

export default function Dashboard() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect authenticated users to home
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate('/home', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleLoginSuccess = (userData) => {
        console.log('Login success:', userData);
        navigate('/home', { replace: true });
    }

    // Only render auth forms if user is not authenticated
    if (isAuthenticated && user) {
        return null; // Component will redirect via useEffect
    }


    return(
        <div >
            {isAuthenticated && user ? (
                <Home/>
            ) : (
                <div className="text-center mb-5">
                    <h1 className="display-4 text-white mb-3">Welcome to MovieSquad</h1>
                    <p className="lead text-light">Connect with fellow movie enthusiasts</p>                    
                    <div className="row justify-content-center">
                        <div className="col-md-6 col-lg-4 mb-3">
                            <SignIn onLoginSuccess={handleLoginSuccess}/>
                        </div>
                        <div className="col-md-6 col-lg-4 mb-3">
                            <SignUp onLoginSuccess={handleLoginSuccess}/>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}