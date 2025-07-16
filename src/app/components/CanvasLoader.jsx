import React, { useRef, useEffect } from "react";

export default function CanvasLoader({ fullscreen = true, text = "Loading..." }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = fullscreen ? window.innerWidth : 120;
    let height = fullscreen ? window.innerHeight : 120;
    let animationId;

    function resize() {
      width = fullscreen ? window.innerWidth : 120;
      height = fullscreen ? window.innerHeight : 120;
      canvas.width = width;
      canvas.height = height;
    }
    resize();
    if (fullscreen) window.addEventListener("resize", resize);

    let angle = 0;
    const numDots = 12;
    const radius = fullscreen ? Math.min(width, height) / 8 : 40;
    const dotRadius = fullscreen ? 12 : 5;

    function draw() {
      ctx.clearRect(0, 0, width, height);

      if (fullscreen) {
        ctx.fillStyle = "rgba(20, 20, 30, 0.85)";
        ctx.fillRect(0, 0, width, height);
      }
        for (let i = 0; i < numDots; i++) {
        const theta = angle + (i * (2 * Math.PI)) / numDots;
        const x = width / 2 + radius * Math.cos(theta);
        const y = height / 2 + radius * Math.sin(theta);

        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(139,92,246,${0.5 + 0.5 * Math.sin(theta)})`; // purple
        ctx.shadowColor = "#8b5cf6"; // purple
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;
        }

      // Custom loading text
      ctx.font = fullscreen ? "bold 2rem sans-serif" : "bold 1rem sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.globalAlpha = 0.8;
      ctx.fillText(text, width / 2, height / 2);
      ctx.globalAlpha = 1;

      angle += 0.04;
      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      if (fullscreen) window.removeEventListener("resize", resize);
    };
  }, [fullscreen, text]);
  

  return (
    <div
      style={{
        position: fullscreen ? "fixed" : "absolute",
        top: 0,
        left: 0,
        width: fullscreen ? "100vw" : 120,
        height: fullscreen ? "100vh" : 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: fullscreen ? "rgba(20,20,30,0.85)" : "none",
        zIndex: 9999,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          margin: "auto",
          borderRadius: "16px",
        boxShadow: fullscreen ? "0 0 40px #8b5cf644" : "none",
        }}
        aria-label="Loading animation"
      />
    </div>
  );
}