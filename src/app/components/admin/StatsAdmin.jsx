"use client";
import React from "react";
import AppStatsChart from "../AppStatsChart";
import TopGenresChart from "../TopGenresChart ";

export default function StatsAdmin({ stats }) {
  return (
    <div className="card glass-card mb-4">
      <div className="card-header">
        <h3 className="h5 fw-bold text-white mb-0">
          <i className="bi bi-bar-chart-line me-2 text-warning"></i> App
          Statistics
        </h3>
      </div>
      <div className="card-body">
        {stats && <AppStatsChart stats={stats} />}
        <TopGenresChart />
      </div>
    </div>
  );
}
