"use client"

import React, { useState } from "react";
import FriendsList from "../friends/FriendsList";
import FriendRequests from "../friends/FriendRequests";
import UserSearch from "../friends/UserSearch";
import TabsWrapper from "../TabsWrapper";


export default function FriendsTabContent({ currentUser, onViewProfile }) {
  const [activeSubTab, setActiveSubTab] = useState("friends");
  const [friendsCount, setFriendsCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);

  const subTabs = [
    {
      id: "friends",
      label: "Friends",
      icon: "👥",
      count: friendsCount
    },
    {
      id: "requests",
      label: "Requests",
      icon: "📥",
      count: requestsCount,
      showBadge: requestsCount > 0
    },
    {
      id: "search",
      label: "Find Friends",
      icon: "🔍"
    }
  ];

  const handleFriendsCountUpdate = (count) => {
    setFriendsCount(count);
  };

  const handleRequestsCountUpdate = (count) => {
    setRequestsCount(count);
  };

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case "friends":
        return (
          <FriendsList 
            currentUser={currentUser}
            onViewProfile={onViewProfile}
            onFriendsCountUpdate={handleFriendsCountUpdate}
          />
        );
      case "requests":
        return (
          <FriendRequests 
            currentUser={currentUser}
            onRequestsCountUpdate={handleRequestsCountUpdate}
          />
        );
      case "search":
        return <UserSearch />;
      default:
        return null;
    }
  };

  return (
    <TabsWrapper
      tabs={subTabs}
      activeTab={activeSubTab}
      onTabChange={setActiveSubTab}
      variant="profile"
    >
      {renderSubTabContent()}
    </TabsWrapper>
  );
}