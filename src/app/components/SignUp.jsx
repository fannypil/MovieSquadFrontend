"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export default function SignUp({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters long";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Make API call to your backend
      const response = await axios.post(
        "http://localhost:3001/api/auth/register",
        {
          username: username.trim(),
          email: email.trim(),
          password: password,
        }
      );

      console.log("Registration response:", response.data); // Debug log

      const loginResult = await login(email.trim(), password);

      if (loginResult.success) {
        setSuccess(true);

        // Clear form after successful registration
        setUsername("");
        setEmail("");
        setPassword("");

        // Call the callback to update parent component
        if (onLoginSuccess) {
          onLoginSuccess(loginResult.user);
        } else {
          setErrors({
            general:
              "Registration successful but login failed. Please sign in manually.",
          });
        }
      }
    } catch (error) {
      console.log(error);
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({
          general: "An error occurred during registration. Please try again.",
        });
      }
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
        style={{ maxWidth: 400, width: "100%", height: "100%" }}
      >
        <h2 className="text-center mb-4 text-white">Sign Up</h2>
        {success && (
          <div
            className="alert alert-success alert-dismissible fade show"
            role="alert"
          >
            <strong>Success!</strong> User created successfully! Welcome to
            MovieSquad!
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
        <form onSubmit={handleSignUp}>
          <div className="form-floating mb-3">
            <input
              type="text"
              className={`form-control bg-dark text-light ${
                errors.username ? "is-invalid" : ""
              }`}
              id="signupUsername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              style={{ border: "1px solid #444" }}
            />
            <label htmlFor="signupUsername" className="text-muted">
              User Name
            </label>
            {errors.username && (
              <div className="invalid-feedback">{errors.username}</div>
            )}
          </div>
          <div className="form-floating mb-3">
            <input
              type="email"
              className={`form-control bg-dark text-light ${
                errors.email ? "is-invalid" : ""
              }`}
              id="signupEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              style={{ border: "1px solid #444" }}
            />
            <label htmlFor="signupEmail" className="text-muted">
              Email address
            </label>
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
              id="signupPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              style={{ border: "1px solid #444" }}
            />
            <label htmlFor="signupPassword" className="text-muted">
              Password
            </label>
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
                Signing Up...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
