"use client"
import { useEffect, useState } from "react"
import SignIn from "./SignIn"
import SignUp from "./SignUp"
import Profile from "../pages/Profile"

export default function Dashboard() {
    const [user, setUser] = useState(null)

    useEffect(() => {
        // Check if user is logged in by checking localStorage
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        
        if (token && userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    const handleSignOut = () => {
        // Clear localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        alert("User signed out!")
    }

    const handleLoginSuccess = (userData) => {
        setUser(userData)
    }

    return(
        <div className="container mt-5">
            {user ? (
                <div className="text-center">
                    <h1 className="mb-4">Welcome {user.email}</h1>
                    <button className="btn btn-danger" onClick={handleSignOut}>Sign out</button>
                    <div className="mt-4">
                        <Profile />
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <h2 className="mb-4">Sign in or SignUp</h2>
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