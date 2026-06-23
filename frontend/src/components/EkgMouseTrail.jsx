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

    const hump = (pct, center, width, amp) => {
      const diff = pct - center;
      if (Math.abs(diff) > width / 2) return 0;
      const angle = (diff / (width / 2)) * Math.PI;
      return ((Math.cos(angle) + 1) / 2) * amp;
    };

    const getEkgOffset = (d) => {
      const wavelength = 220;
      let phase = d % wavelength;
      if (phase < 0) phase += wavelength;
      const pct = phase / wavelength;

      const p = hump(pct, 0.18, 0.12, 6);
      const q = hump(pct, 0.28, 0.05, -7);
      const r = hump(pct, 0.32, 0.07, 36);
      const s = hump(pct, 0.37, 0.06, -12);
      const t = hump(pct, 0.52, 0.18, 9);

      return p + q + r + s + t;
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
        let nx = -ty / len;
        let ny = tx / len;

        // Orient normal to always point in the upper/left half-plane.
        // This ensures EKG peaks always point UP (or LEFT on vertical moves) 
        // and prevents wave flipping / visual kinks when changing mouse directions.
        if (ny > 0 || (ny === 0 && nx > 0)) {
          nx = -nx;
          ny = -ny;
        }

        // Smoothly damp near cursor (0ms to 120ms) and fade out at tail (maxAge)
        const cursorDamp = Math.min(1, age / 120);
        const tailDamp = Math.max(0, 1 - age / maxAge);
        const damp = cursorDamp * tailDamp;

        // Pass propagating phase to getEkgOffset
        const phaseVal = p.dist + now * waveSpeed;
        const offset = getEkgOffset(phaseVal) * damp;

        // Calculate R-peak factor for localized styling and glowing beads
        const wavelength = 220;
        let phase = phaseVal % wavelength;
        if (phase < 0) phase += wavelength;
        const pct = phase / wavelength;
        const rPeak = hump(pct, 0.32, 0.07, 1.0) * damp;

        drawPoints.push({
          x: p.x + nx * offset,
          y: p.y + ny * offset,
          age,
          rPeak,
        });
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Pass 1: Draw neon glow (wider, lower opacity, thickened at R-peaks)
      for (let i = 1; i < drawPoints.length; i++) {
        const p1 = drawPoints[i - 1];
        const p2 = drawPoints[i];

        const avgAge = (p1.age + p2.age) / 2;
        const opacity = Math.max(0, 1 - avgAge / maxAge);
        const avgRPeak = (p1.rPeak + p2.rPeak) / 2;

        const r = Math.round(110 + (138 - 110) * (1 - opacity));
        const g = Math.round(231 - (231 - 124) * (1 - opacity));
        const b = Math.round(212 + (255 - 212) * (1 - opacity));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = 6 + avgRPeak * 6;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(opacity * 0.22) + (avgRPeak * 0.15)})`;
        ctx.stroke();
      }

      // Pass 2: Draw sharp core line (thinner, bright, thickened and brightened at R-peaks)
      for (let i = 1; i < drawPoints.length; i++) {
        const p1 = drawPoints[i - 1];
        const p2 = drawPoints[i];

        const avgAge = (p1.age + p2.age) / 2;
        const opacity = Math.max(0, 1 - avgAge / maxAge);
        const avgRPeak = (p1.rPeak + p2.rPeak) / 2;

        const r = Math.round(110 + (138 - 110) * (1 - opacity));
        const g = Math.round(231 - (231 - 124) * (1 - opacity));
        const b = Math.round(212 + (255 - 212) * (1 - opacity));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = 2.0 + avgRPeak * 1.5;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(opacity * 0.85) + (avgRPeak * 0.15)})`;
        ctx.stroke();

        // Pass 2b: Draw white core overlay for maximum electrical hot-spark glow at peaks
        if (avgRPeak > 0.1) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineWidth = 1.0 + avgRPeak * 1.0;
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * avgRPeak * 0.95})`;
          ctx.stroke();
        }
      }

      // Pass 3: Draw soft traveling glow beads centered on the heartbeat R-peaks
      for (let i = 0; i < drawPoints.length; i++) {
        const p = drawPoints[i];
        if (p.rPeak > 0.15) {
          const opacity = Math.max(0, 1 - p.age / maxAge);
          const r = Math.round(110 + (138 - 110) * (1 - opacity));
          const g = Math.round(231 - (231 - 124) * (1 - opacity));
          const b = Math.round(212 + (255 - 212) * (1 - opacity));

          ctx.beginPath();
          const rad = 4 + p.rPeak * 8; // Bead size up to 12px
          const beadGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
          beadGlow.addColorStop(0, `rgba(255, 255, 255, ${opacity * p.rPeak * 0.95})`);
          beadGlow.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${opacity * p.rPeak * 0.55})`);
          beadGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = beadGlow;
          ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
          ctx.fill();
        }
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
        zIndex: 99999,
        opacity: 0.5,
      }}
    />
  );
}
