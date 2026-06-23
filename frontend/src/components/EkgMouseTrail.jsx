import React, { useEffect, useRef } from 'react';

export default function EkgMouseTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let points = [];
    let lastX = null;
    let lastY = null;
    let totalDist = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const getEkgOffset = (d) => {
      const wavelength = 130;
      let phase = d % wavelength;
      if (phase < 0) phase += wavelength;
      const pct = phase / wavelength;

      if (pct < 0.15) {
        return 0;
      } else if (pct < 0.25) {
        const pPct = (pct - 0.15) / 0.10;
        return Math.sin(pPct * Math.PI) * 5;
      } else if (pct < 0.30) {
        return 0;
      } else if (pct < 0.32) {
        const qPct = (pct - 0.30) / 0.02;
        return -qPct * 6;
      } else if (pct < 0.35) {
        const rPct = (pct - 0.32) / 0.03;
        return -6 + rPct * 46;
      } else if (pct < 0.38) {
        const sPct = (pct - 0.35) / 0.03;
        return 40 - sPct * 55;
      } else if (pct < 0.42) {
        const retPct = (pct - 0.38) / 0.04;
        return -15 + retPct * 15;
      } else if (pct < 0.48) {
        return 0;
      } else if (pct < 0.60) {
        const tPct = (pct - 0.48) / 0.12;
        return Math.sin(tPct * Math.PI) * 10;
      } else {
        return 0;
      }
    };

    const onMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;

      if (lastX === null || lastY === null) {
        lastX = x;
        lastY = y;
        return;
      }

      const dx = x - lastX;
      const dy = y - lastY;
      const segmentLen = Math.sqrt(dx * dx + dy * dy);

      if (segmentLen > 3) {
        totalDist += segmentLen;
        points.push({
          x,
          y,
          dist: totalDist,
          createdAt: Date.now(),
        });
        lastX = x;
        lastY = y;
      }
    };

    const onMouseLeave = () => {
      lastX = null;
      lastY = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    let animId;
    const maxAge = 1200;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();

      points = points.filter(p => now - p.createdAt < maxAge);

      if (points.length < 2) {
        animId = requestAnimationFrame(draw);
        return;
      }

      const drawPoints = [];
      const waveSpeed = 0.18; // speed of heartbeat wave propagation along path

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const age = now - p.createdAt;

        let tx = 0;
        let ty = 0;
        if (i === 0) {
          tx = points[1].x - p.x;
          ty = points[1].y - p.y;
        } else if (i === points.length - 1) {
          tx = p.x - points[i - 1].x;
          ty = p.y - points[i - 1].y;
        } else {
          tx = points[i + 1].x - points[i - 1].x;
          ty = points[i + 1].y - points[i - 1].y;
        }

        const len = Math.sqrt(tx * tx + ty * ty) || 1;
        const nx = -ty / len;
        const ny = tx / len;

        // Smoothly damp near cursor (0ms to 120ms) and fade out at tail (maxAge)
        const cursorDamp = Math.min(1, age / 120);
        const tailDamp = Math.max(0, 1 - age / maxAge);
        const damp = cursorDamp * tailDamp;

        // Pass propagating phase to getEkgOffset
        const offset = getEkgOffset(p.dist + now * waveSpeed) * damp;

        drawPoints.push({
          x: p.x + nx * offset,
          y: p.y + ny * offset,
          age,
        });
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Pass 1: Draw neon glow (wider, lower opacity)
      for (let i = 1; i < drawPoints.length; i++) {
        const p1 = drawPoints[i - 1];
        const p2 = drawPoints[i];

        const avgAge = (p1.age + p2.age) / 2;
        const opacity = Math.max(0, 1 - avgAge / maxAge);

        const r = Math.round(110 + (138 - 110) * (1 - opacity));
        const g = Math.round(231 - (231 - 124) * (1 - opacity));
        const b = Math.round(212 + (255 - 212) * (1 - opacity));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = 6;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.22})`;
        ctx.stroke();
      }

      // Pass 2: Draw sharp core line (thinner, bright opacity)
      for (let i = 1; i < drawPoints.length; i++) {
        const p1 = drawPoints[i - 1];
        const p2 = drawPoints[i];

        const avgAge = (p1.age + p2.age) / 2;
        const opacity = Math.max(0, 1 - avgAge / maxAge);

        const r = Math.round(110 + (138 - 110) * (1 - opacity));
        const g = Math.round(231 - (231 - 124) * (1 - opacity));
        const b = Math.round(212 + (255 - 212) * (1 - opacity));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.85})`;
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.5,
      }}
    />
  );
}
