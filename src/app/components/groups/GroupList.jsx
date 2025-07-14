"use client"

import GroupCard from "./GroupCard"
import EmptyState from "../EmptyState"

export default function GroupList({ groups = [], currentUser, onGroupJoined, onGroupLeft }) {

    // Handle case where groups is undefined or not an array
    if (!Array.isArray(groups)) {
       return(
         <EmptyState 
            icon="people"
            title="No groups found"
            description="Create or join some groups to see them here!"
            showButton={true}
            buttonText="Create Group"
            onButtonClick={() => {/* handle create */}}
        />
       )
    }

    if (groups.length === 0) {
        return(
        <EmptyState 
            icon="people"
            title="No groups found"
            description="Create or join some groups to see them here!"
            showButton={true}
            buttonText="Create Group"
            onButtonClick={() => {/* handle create */}}
        />
        )
    }

    return (
        <div className="row g-4">
            {groups.map(group => (
                <div key={group._id} className="col-md-6 col-lg-4">
                    <GroupCard
                        group={group}
                        currentUser={currentUser}
                        onGroupJoined={onGroupJoined}
                        onGroupLeft={onGroupLeft}
                    />
                </div>
            ))}
        </div>
    )
}