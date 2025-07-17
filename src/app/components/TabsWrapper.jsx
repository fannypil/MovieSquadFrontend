"use client";

import React from "react";

export default function TabsWrapper({
  tabs,
  activeTab,
  onTabChange,
  children,
  className = "",
  variant = "profile", // "profile", "group", "admin", etc.
}) {
  const getTabStyle = (isActive) => {
    const baseStyle = {
      backgroundColor: isActive ? "#8b5cf6" : "transparent",
      borderColor: isActive ? "#8b5cf6" : "#444",
      color: isActive ? "white" : "#ccc",
      transition: "all 0.3s ease",
    };

    if (variant === "profile") {
      return baseStyle;
    } else if (variant === "group") {
      return {
        ...baseStyle,
        backgroundColor: isActive ? "#10b981" : "transparent",
        borderColor: isActive ? "#10b981" : "#444",
      };
    }

    return baseStyle;
  };

  return (
    <div className={className}>
      {/* Tabs Navigation */}
      <ul
        className="nav nav-tabs justify-content-center mb-4"
        style={{ borderBottom: "1px solid #444" }}
      >
        {tabs.map((tab) => (
          <li key={tab.id} className="nav-item">
            <button
              className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => onTabChange(tab.id)}
              style={getTabStyle(activeTab === tab.id)}
              disabled={tab.disabled}
            >
              {tab.icon && (
                <span className="me-2">
                  {/* Handle both string and component icons */}
                  {typeof tab.icon === "string" ? tab.icon : tab.icon}
                </span>
              )}
              {tab.label}
              {tab.count !== undefined && (
                <span className="badge bg-secondary ms-2">{tab.count}</span>
              )}
              {tab.showBadge && <span className="badge bg-danger ms-2">!</span>}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab Content */}
      <div className="tab-content">{children}</div>
    </div>
  );
}
