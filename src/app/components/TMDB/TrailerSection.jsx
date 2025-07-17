import React, { useEffect, useState } from "react";
import axios from "axios";
import VideoPlayer from "./VideoPlayer";

export default function TrailerSection({ movieId, contentType }) {
  const [loading, setLoading] = useState(true);
  const [trailer, setTrailer] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:3001/api/tmdb/${movieId}/videos`, {
        params: { type: contentType },
      })
      .then((res) => {
        setTrailer(res.data.trailer);
        setVideos(res.data.videos || []);
        setSelectedKey(res.data.trailer?.key || null);
      })
      .catch(() => setError("No trailer available"))
      .finally(() => setLoading(false));
  }, [movieId]);

  // Optional: allow user to select trailer if multiple available
  const youtubeVideos = videos.filter((v) => v.site === "YouTube");
  const showDropdown = youtubeVideos.length > 1;

  return (
    <div className="mb-4">
      <h5 className="text-white mb-3">
        <i className="bi bi-play-circle me-2 text-warning"></i>
        Watch Trailer
      </h5>
      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border text-warning mb-2"></div>
          <div className="text-light">Loading trailer...</div>
        </div>
      ) : error ? (
        <div className="alert alert-secondary">No trailer available.</div>
      ) : selectedKey ? (
        <>
          <VideoPlayer youtubeKey={selectedKey} />
        </>
      ) : (
        <div className="alert alert-secondary">No trailer available.</div>
      )}
    </div>
  );
}
