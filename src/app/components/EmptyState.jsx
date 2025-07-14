import React from "react";

export default function EmptyState({ 
  icon = "exclamation-circle", 
  title, 
  description, 
  showButton = false, 
  buttonText, 
  buttonAction,
  onButtonClick // For backward compatibility
}) {
  
  const handleButtonClick = buttonAction || onButtonClick;

  return (
    <div className="glass-card text-center py-5 my-4">
      {/* Bootstrap Icon */}
      <div className="mb-4">
        <i 
          className={`bi bi-${icon} text-warning`} 
          style={{ 
            fontSize: '4rem',
            opacity: 0.8
          }}
        ></i>
      </div>

      {/* Title */}
      {title && (
        <h4 className="text-white mb-3 fw-bold">
          {title}
        </h4>
      )}

      {/* Description */}
      {description && (
        <p 
          className="text-light mb-4 mx-auto" 
          style={{ 
            maxWidth: '500px',
            lineHeight: '1.6'
          }}
        >
          {description}
        </p>
      )}

      {/* Action Button */}
      {showButton && buttonText && handleButtonClick && (
        <button
          className="btn btn-primary"
          onClick={handleButtonClick}
        >
          <i className="bi bi-plus me-2"></i>
          {buttonText}
        </button>
      )}
    </div>
  );
}