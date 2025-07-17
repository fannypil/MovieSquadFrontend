import React from "react";

export default function VideoPlayer({ src, youtubeKey }) {
  if (src) {
    return (
      <div className="mb-3">
        <video
          controls
          width="100%"
          style={{ borderRadius: "12px", background: "#232323" }}
        >
          <source src={src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }
  if (youtubeKey) {
    return (
      <div className="mb-3">
        <iframe
          width="100%"
          height="200"
          src={`https://www.youtube.com/embed/${youtubeKey}`}
          title="Trailer"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ borderRadius: "12px", background: "#232323" }}
        ></iframe>
      </div>
    );
  }
  return null;
}
