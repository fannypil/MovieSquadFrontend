"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export default function SignIn({ onLoginSuccess,onSwitchToSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        setSuccess(true);

        // Clear form after successful login
        setEmail("");
        setPassword("");

        // Call the callback to update parent component
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        }
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.log(error);
      setErrors({
        general: "An error occurred during sign in. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "70vh" }}
    >
      <div
        className="glass-card p-4 shadow-lg"
        style={{ maxWidth: 400, width: "100%" }}
      >
        <h2 className="text-center mb-4 text-white">Sign In</h2>
        {success && (
          <div
            className="alert alert-success alert-dismissible fade show"
            role="alert"
          >
            <strong>Success!</strong> Welcome back to MovieSquad!
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccess(false)}
              aria-label="Close"
            ></button>
          </div>
        )}
        {errors.general && (
          <div className="alert alert-danger" role="alert">
            {errors.general}
          </div>
        )}
        <form onSubmit={handleSignIn}>
          <div className="form-floating mb-3 position-relative">
            <input
              type="email"
              className={`form-control bg-dark text-light ${
                errors.email ? "is-invalid" : ""
              }`}
              id="signinEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              style={{ border: "1px solid #444" }}
            />
            <label htmlFor="signinEmail" className="text-muted">
              Email address
            </label>
            <i 
              className="bi bi-envelope-fill position-absolute text-muted"
              style={{
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                fontSize: '1rem'
              }}
            ></i>
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>
          <div className="form-floating mb-3">
            <input
              type="password"
              className={`form-control bg-dark text-light ${
                errors.password ? "is-invalid" : ""
              }`}
              id="signinPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ border: "1px solid #444" }}
            />
            <label htmlFor="signinPassword" className="text-muted">
              Password
            </label>
            <i 
                className="bi bi-lock-fill position-absolute text-muted"
                style={{
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  fontSize: '1rem'
                }}
              ></i>
            {errors.password && (
              <div className="invalid-feedback">{errors.password}</div>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-gold w-100"
            disabled={isLoading}
          >
            
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
            <p className="text-center mt-3 text-white">
              <button 
                type="button"
                className="btn btn-link text-white text-decoration-none p-0"
                onClick={onSwitchToSignUp}
                style={{ background: 'none', border: 'none' }}
              >
                Don't have an account? <span className="text-warning">Register here</span>
              </button>
            </p>
        </form>
      </div>
    </div>
  );
}
