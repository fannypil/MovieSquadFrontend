import React, { useEffect, useState } from "react";
import axios from "axios";

export default function HomeStatsCards() {
    const [reviewCount, setReviewCount] = useState(0);
    const [activeGroupsCount, setActiveGroupsCount] = useState(0);
    const [discussionsCount, setDiscussionsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:3001/api/stats/stats-for-home");
                const stats = response.data;
                setReviewCount(stats.reviewCount || 0);
                setActiveGroupsCount(stats.activeGroupsCount || 0);
                setDiscussionsCount(stats.discussionsCount || 0);
            }
            catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="row g-4 mb-5">
            <div className="col-md-4">
                <div className="glass-card h-100 hover-lift rounded">
                    <div className="card-body text-center p-4">
                        <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                            style={{
                                width: '48px',
                                height: '48px',
                                background: 'rgba(59, 130, 246, 0.2)'
                            }}>
                            <i className="bi bi-film text-info"></i>
                        </div>
                        <h3 className="h2 fw-bold text-white mb-2">
                            {loading ? <span className="spinner-border spinner-border-sm text-info"></span> : reviewCount}
                        </h3>
                        <p className="text-light mb-0">Movie Reviews</p>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="glass-card h-100 hover-lift rounded">
                    <div className="card-body text-center p-4">
                        <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                            style={{
                                width: '48px',
                                height: '48px',
                                background: 'rgba(34, 197, 94, 0.2)'
                            }}>
                            <i className="bi bi-people text-success"></i>
                        </div>
                        <h3 className="h2 fw-bold text-white mb-2">
                            {loading ? <span className="spinner-border spinner-border-sm text-success"></span> : activeGroupsCount}
                        </h3>
                        <p className="text-light mb-0">Active Groups</p>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="glass-card h-100 hover-lift rounded">
                    <div className="card-body text-center p-4">
                        <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                            style={{
                                width: '48px',
                                height: '48px',
                                background: 'rgba(168, 85, 247, 0.2)'
                            }}>
                            <i className="bi bi-chat-dots text-primary"></i>
                        </div>
                        <h3 className="h2 fw-bold text-white mb-2">
                            {loading ? <span className="spinner-border spinner-border-sm text-primary"></span> : discussionsCount}
                        </h3>
                        <p className="text-light mb-0">Discussions</p>
                    </div>
                </div>
            </div>
        </div>
    );
}