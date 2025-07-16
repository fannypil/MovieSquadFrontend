import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export default function AppStatsChart() {
  const svgRef = useRef();
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3001/api/stats/summary", {
        headers: { "x-auth-token": token }
      });
      setStats(response.data);
    } catch (err) {
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    if (loading || !stats || !stats.data || !stats.data.overview) return;
    const overview = stats.data.overview;
    const data = [
      { label: "Active Users", value: overview.activeUsers },
      { label: "Total Users", value: overview.totalUsers },
      { label: "Groups", value: overview.totalGroups },
      { label: "Posts", value: overview.totalPosts },
      { label: "Recent Posts", value: overview.recentPosts },
    ];
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    svg.attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, width])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([height, 0])
      .nice();

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .attr("transform", "rotate(-25)");

    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .selectAll("text")
      .attr("fill", "#fff")
      .attr("font-size", "12px");

    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(d3.schemeSet3);

    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.label))
      .attr("width", x.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", d => colorScale(d.label))
      .attr("rx", 4)
      .attr("ry", 4)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr("y", d => y(d.value))
      .attr("height", d => height - y(d.value));

    g.selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("x", d => x(d.label) + x.bandwidth() / 2)
      .attr("y", d => y(d.value) - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "13px")
      .attr("font-weight", "bold")
      .text(d => d.value);
  }, [stats, loading]);

  return (
    <div className="w-100">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3 className="h5 fw-bold text-white mb-0">
          <i className="bi bi-bar-chart me-2 text-warning"></i>
          App Statistics
        </h3>
        <button
          onClick={fetchStats}
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
          disabled={loading}
        >
          <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
          Refresh
        </button>
      </div>
      <div className="p-3 rounded" style={{
        background: 'rgba(17, 24, 39, 0.5)',
        backdropFilter: 'blur(10px)'
      }}>
        {loading ? (
          <div className="d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
            <div className="text-center">
              <div className="spinner-border text-warning mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-light">Loading app statistics...</p>
            </div>
          </div>
        ) : (
          <svg ref={svgRef} className="w-100" style={{ minHeight: '300px' }}></svg>
        )}
      </div>
    </div>
  );
}