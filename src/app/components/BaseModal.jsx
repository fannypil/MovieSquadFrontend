"use client";

import React from "react";

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  isLoading = false,
  size = "md", // "sm", "md", "lg", "xl"
  footer = null,
  closeOnBackdropClick = true,
  theme = "dark", // "dark", "light"
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick && !isLoading) {
      onClose();
    }
  };

  const bgColor = theme === "dark" ? "#23272b" : "#fff";
  const textColor = theme === "dark" ? "#fff" : "#212529";
  const borderColor = theme === "dark" ? "#444" : "#dee2e6";

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={handleBackdropClick}
    >
      <div className={`modal-dialog modal-${size}`}>
        <div
          className="modal-content"
          style={{ 
            backgroundColor: bgColor, 
            color: textColor,
            border: `1px solid ${borderColor}`
          }}
        >
          <div 
            className="modal-header"
            style={{ borderBottom: `1px solid ${borderColor}` }}
          >
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className={`btn-close ${theme === "dark" ? "btn-close-white" : ""}`}
              onClick={onClose}
              disabled={isLoading}
            ></button>
          </div>
          
          <div className="modal-body">{children}</div>
          
          {footer && (
            <div 
              className="modal-footer"
              style={{ borderTop: `1px solid ${borderColor}` }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}