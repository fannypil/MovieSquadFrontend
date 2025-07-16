import React, { useState } from "react";

const GENRES = [
  { id: "", name: "Any" },
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 10749, name: "Romance" },
  { id: 27, name: "Horror" },
];

export default function TMDBFilter({ filters, setFilters, contentType }) {
    const currentYear = new Date().getFullYear();
    const [errors, setErrors] = useState({});

      const validate = (field, value) => {
    let error = "";
    if (field === "year") {
      if (value && (isNaN(value) || value < 1900 || value > currentYear)) {
        error = `Year must be between 1900 and ${currentYear}`;
      }
    }
    if (field === "minRating") {
      if (value && (isNaN(value) || value < 0 || value > 10)) {
        error = "Rating must be between 0 and 10";
      }
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

 
  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label text-light">Genre</label>
            <select
              className="form-select"
              value={filters.genre}
              onChange={e => setFilters(f => ({ ...f, genre: e.target.value }))}
            >
              {GENRES.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label text-light">Year</label>
            <input
              type="number"
              className={`form-control ${errors.year ? "is-invalid" : ""}`}
              placeholder={`e.g. ${currentYear}`}
              value={filters.year}
              min={1900}
              max={currentYear}
              onChange={e => {
                setFilters(f => ({ ...f, year: e.target.value }));
                validate("year", e.target.value);
              }}
            />
            {errors.year && (
              <div className="invalid-feedback">{errors.year}</div>
            )}
          </div>
          <div className="col-md-3">
            <label className="form-label text-light">Min Rating</label>
            <input
              type="number"
              className={`form-control ${errors.minRating ? "is-invalid" : ""}`}
              min={0}
              max={10}
              step={0.1}
              placeholder="e.g. 7.5"
              value={filters.minRating || ""}
              onChange={e => {
                setFilters(f => ({ ...f, minRating: e.target.value }));
                validate("minRating", e.target.value);
              }}
            />
            {errors.minRating && (
              <div className="invalid-feedback">{errors.minRating}</div>
            )}
          </div>
          <div className="col-md-3">
            <label className="form-label text-light">Sort By</label>
            <select
              className="form-select"
              value={filters.sortBy}
              onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value }))}
            >
              <option value="popularity.desc">Popularity</option>
              <option value="vote_average.desc">Rating</option>
              <option value="release_date.desc">Release Date</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => {
              setFilters({ genre: "", year: "", minRating: "", sortBy: "popularity.desc" });
              setErrors({});
            }}
          >
            Clear Filters
          </button>
          <span className="text-light ms-2">
            Active Filters: {Object.entries(filters).filter(([k, v]) => v).map(([k, v]) => `${k}: ${v}`).join(", ") || "None"}
          </span>
        </div>
      </div>
    </div>
  );
}