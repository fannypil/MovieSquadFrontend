import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import TopGenresChart from '../components/TopGenresChart ';
import HomeStatsCards from '../components/stats/HomeStatsCards';

export default function Home(){
    const{user,isAuthenticated}= useAuth()

    return(
        <div className="moviesquad-bg">
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10">            
                {/* Header Section */}
                <div className="text-center mb-5">
                     {/* Cinema Icon */}
                            <div className="d-flex justify-content-center mb-4">
                                <div className="rounded-circle d-flex align-items-center justify-content-center" 
                                     style={{
                                         width: '80px',
                                         height: '80px',
                                         background: 'linear-gradient(45deg, #f59e0b, #d97706)',
                                         boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)'
                                     }}>
                                    <i className="bi bi-film text-dark" style={{ fontSize: '2.5rem' }}></i>
                                </div>
                            </div>
                         {/* Title and Description */}
                         <div className="mb-4">
                                <h1 className="display-4 fw-bold text-white mb-3">
                                    Welcome to <span className="gold-gradient-text">MovieSquad</span>
                                </h1>
                                <p className="lead text-light mx-auto" style={{ maxWidth: '600px' }}>
                                    Connect with fellow movie and TV enthusiasts. Share reviews, discover new content, 
                                    and join passionate discussions about your favorite entertainment.
                                </p>
                            </div>
                     {/* Action Buttons */}
                     {isAuthenticated && (
                                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center mb-5">
                                    <Link to="/feed" className="btn btn-gold btn-lg px-4 py-3 fw-semibold rounded-pill">
                                        <i className="bi bi-play-fill me-2"></i>
                                        Explore Feed
                                    </Link>
                                    <Link to="/groups" className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold rounded-pill">
                                        <i className="bi bi-people me-2"></i>
                                        Join Groups
                                    </Link>
                                </div>
                        )}
                     </div>
                     {/* Stats Cards */}
                     <HomeStatsCards/>

                     {/* Features */}
                        <div className="row g-4 mb-5">
                            <div className="col-md-6">
                                <div className="glass-card h-100 hover-lift rounded">
                                    <div className="card-body p-5">
                                        <div className="rounded-circle mb-4 d-flex align-items-center justify-content-center" 
                                             style={{
                                                 width: '48px',
                                                 height: '48px',
                                                 background: 'rgba(245, 158, 11, 0.2)'
                                             }}>
                                            <i className="bi bi-star text-warning"></i>
                                        </div>
                                        <h3 className="h5 fw-bold text-white mb-3">Share Reviews</h3>
                                        <p className="text-light mb-4">
                                            Write detailed reviews, rate movies and TV shows, and help others discover great content.
                                        </p>
                                        <Link to="/feed" className="btn btn-outline-warning">
                                            Start Reviewing
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div className="glass-card h-100 hover-lift rounded">
                                    <div className="card-body p-5">
                                        <div className="rounded-circle mb-4 d-flex align-items-center justify-content-center" 
                                             style={{
                                                 width: '48px',
                                                 height: '48px',
                                                 background: 'rgba(59, 130, 246, 0.2)'
                                             }}>
                                            <i className="bi bi-people text-info"></i>
                                        </div>
                                        <h3 className="h5 fw-bold text-white mb-3">Join Communities</h3>
                                        <p className="text-light mb-4">
                                            Connect with fans who share your taste in movies and TV shows. Join genre-specific groups.
                                        </p>
                                        <Link to="/groups" className="btn btn-outline-info">
                                            Explore Groups
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>
                  {/* Statistics Chart Section */}
                        <div className="glass-card hover-lift">
                            <div className="card-header bg-transparent border-0">
                                <h2 className="h3 fw-bold text-white text-center mb-0">
                                    <i className="bi bi-bar-chart me-2 text-warning"></i>
                                    Community Insights
                                </h2>
                                <p className="text-light text-center mb-0 mt-2">
                                    Discover what genres our community loves most
                                </p>
                            </div>
                            <div className="card-body p-4">
                                <TopGenresChart />
                            </div>
                        </div>
                </div>
            </div>
        </div>
)
}