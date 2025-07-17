"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as d3 from "d3";
import { useAuth } from "@/app/hooks/useAuth";

export default function GroupStatistics({ groupId, group }) {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (groupId && token) {
      fetchGroupStats();
    }
  }, [groupId, token]);

  useEffect(() => {
    if (stats?.monthlyPosts) {
      renderChart();
    }
  }, [stats]);

  const fetchGroupStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(
        `http://localhost:3001/api/stats/group/${groupId}`,
        { headers: { "x-auth-token": token } }
      );
      console.log("Group stats response:", response.data);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching group stats:", error);
      setError("Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = () => {
    if (!stats?.monthlyPosts || !chartRef.current) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    const data = stats.monthlyPosts;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.bottom - margin.top;

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, width])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.posts) || 1])
      .nice()
      .range([height, 0]);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "#ffffff")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", "#ffffff");

    // Bars
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.month))
      .attr("width", xScale.bandwidth())
      .attr("y", (d) => yScale(d.posts))
      .attr("height", (d) => height - yScale(d.posts))
      .attr("fill", "#f59e0b")
      .attr("opacity", 0.8)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 1);

        // Tooltip
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "#2c2c2c")
          .style("color", "white")
          .style("padding", "10px")
          .style("border-radius", "5px")
          .style("border", "1px solid #444")
          .style("pointer-events", "none")
          .style("z-index", "1000")
          .text(`${d.month}: ${d.posts} posts`);

        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.8);
        d3.selectAll(".tooltip").remove();
      });

    // Axis labels
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .text("Number of Posts");

    svg
      .append("text")
      .attr(
        "transform",
        `translate(${width / 2 + margin.left}, ${height + margin.top + 35})`
      )
      .style("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .text("Month");
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning mb-3" role="status">
          <span className="visually-hidden">Loading statistics...</span>
        </div>
        <p className="text-white">Loading group statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button className="btn btn-warning btn-sm" onClick={fetchGroupStats}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h5 className="text-white mb-1">
          <i className="bi bi-graph-up me-2 text-warning"></i>
          Group Statistics
        </h5>
        <p className="text-light small mb-0">
          Activity insights for {group?.name}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="glass-card text-center">
            <div className="card-body">
              <div className="text-warning" style={{ fontSize: "2rem" }}>
                <i className="bi bi-people-fill"></i>
              </div>
              <h4 className="text-white mb-0">
                {group?.members?.length || stats?.memberCount || 0}
              </h4>
              <small className="text-light">Total Members</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card text-center">
            <div className="card-body">
              <div className="text-warning" style={{ fontSize: "2rem" }}>
                <i className="bi bi-chat-text"></i>
              </div>
              <h4 className="text-white mb-0">{stats?.totalPosts || 0}</h4>
              <small className="text-light">Total Posts</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card text-center">
            <div className="card-body">
              <div className="text-warning" style={{ fontSize: "2rem" }}>
                <i className="bi bi-list-stars"></i>
              </div>
              <h4 className="text-white mb-0">
                {group?.sharedWatchlist?.length || 0}
              </h4>
              <small className="text-light">Watchlist Items</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="glass-card text-center">
            <div className="card-body">
              <div className="text-warning" style={{ fontSize: "2rem" }}>
                <i className="bi bi-calendar-event"></i>
              </div>
              <h4 className="text-white mb-0">
                {stats?.daysActive ||
                  Math.ceil(
                    (Date.now() - new Date(group?.createdAt)) /
                      (1000 * 60 * 60 * 24)
                  ) ||
                  0}
              </h4>
              <small className="text-light">Days Active</small>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Chart */}
      {stats?.monthlyPosts && stats.monthlyPosts.length > 0 && (
        <div className="glass-card mb-4">
          <div className="card-body">
            <h6 className="text-white mb-3">
              <i className="bi bi-bar-chart me-2"></i>
              Posts Per Month (Last 12 Months)
            </h6>
            <div ref={chartRef} className="d-flex justify-content-center"></div>
          </div>
        </div>
      )}
      {/* Top Contributors */}
      {stats?.topContributors && stats.topContributors.length > 0 && (
        <div className="glass-card">
          <div className="card-body">
            <h6 className="text-white mb-3">
              <i className="bi bi-trophy me-2"></i>
              Top Contributors
            </h6>
            <div className="row">
              {stats.topContributors.slice(0, 6).map((contributor, index) => (
                <div
                  key={contributor.userId}
                  className="col-md-6 col-lg-4 mb-3"
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor:
                          index === 0
                            ? "#ffd700"
                            : index === 1
                            ? "#c0c0c0"
                            : index === 2
                            ? "#cd7f32"
                            : "#8b5cf6",
                        color: index < 3 ? "#000" : "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      {contributor.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-white fw-semibold">
                        {contributor.username}
                      </div>
                      <small className="text-light">
                        {contributor.postCount} posts
                      </small>
                    </div>
                    {index < 3 && <div className="ms-auto"></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Empty state if no data */}
      {(!stats?.monthlyPosts || stats.monthlyPosts.length === 0) &&
        (!stats?.topContributors || stats.topContributors.length === 0) && (
          <div className="glass-card">
            <div className="card-body text-center py-5">
              <div className="text-muted mb-3">
                <i className="bi bi-graph-up display-4"></i>
              </div>
              <h6 className="text-white mb-2">No Activity Data Yet</h6>
              <p className="text-light small mb-0">
                Statistics will appear here once group members start posting
                content.
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
