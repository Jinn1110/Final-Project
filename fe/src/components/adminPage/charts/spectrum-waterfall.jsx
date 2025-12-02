"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import trackApi from "../../../api/trackApi";

const SpectrumWaterfall = ({ deviceId = "GNSS-0001", limit = 50 }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const waterfallRef = useRef([]);
  const [size, setSize] = useState({ width: 800, height: 420 });
  const [redrawTrigger, setRedrawTrigger] = useState(0);

  const margin = { top: 36, bottom: 36, left: 64, right: 72 };
  const maxRows = 200; // số lượng row tối đa hiển thị

  const intensityToColor = (p) => {
    const clamped = Math.max(0, Math.min(1, p));
    const hue = (1 - clamped) * 240; // blue -> red
    const lightness = 28 + clamped * 44; // 28% -> 72%
    return `hsl(${hue}deg 100% ${lightness}%)`;
  };

  const drawColorbar = (ctx, x, y, w, h, minVal, maxVal) => {
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    for (let t = 0; t <= 1; t += 0.02)
      grad.addColorStop(t, intensityToColor(1 - t));
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "11px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(maxVal.toFixed(2), x + w + 6, y);
    ctx.textBaseline = "bottom";
    ctx.fillText(minVal.toFixed(2), x + w + 6, y + h);
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = size.width;
    const height = size.height;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const waterfall = waterfallRef.current || [];
    if (!waterfall.length) {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Waiting...", width / 2, height / 2);
      return;
    }

    const numRows = Math.min(waterfall.length, maxRows);
    const numBins = waterfall[0].spectrum.length;

    // Min/Max values
    const flat = waterfall.flatMap((r) =>
      r.spectrum.map(Number).filter(Number.isFinite)
    );
    const minVal = flat.length ? Math.min(...flat) : 0;
    const maxVal = flat.length ? Math.max(...flat) : 1;

    // X axis labels
    const first = waterfall[0];
    if (first && first.center && first.span) {
      const centerHz = Number(first.center);
      const spanHz = Number(first.span);
      const steps = 4;
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "11px Arial";
      ctx.textAlign = "center";
      for (let i = 0; i <= steps; i++) {
        const freq = centerHz - spanHz / 2 + (spanHz / steps) * i;
        const xPos = margin.left + (innerW / steps) * i;
        let label = "";
        if (freq >= 1e9) label = (freq / 1e9).toFixed(2) + " GHz";
        else if (freq >= 1e6) label = (freq / 1e6).toFixed(2) + " MHz";
        else if (freq >= 1e3) label = (freq / 1e3).toFixed(2) + " kHz";
        else label = freq + " Hz";
        ctx.fillText(label, xPos, height - 10);
      }
    }

    // draw waterfall
    const rowH = Math.max(1, Math.floor(innerH / maxRows));
    const binW = innerW / numBins;

    for (let r = 0; r < numRows; r++) {
      const row = waterfall[waterfall.length - numRows + r]; // lấy row cuối cùng
      const y = margin.top + r * rowH; // vẽ từ trên xuống
      for (let b = 0; b < numBins; b++) {
        const val = Number(row.spectrum[b]);
        const p = Math.min(
          1,
          Math.max(0, (val - minVal) / (maxVal - minVal || 1))
        );
        ctx.fillStyle = intensityToColor(p);
        const x = margin.left + b * binW;
        ctx.fillRect(x, y, binW, rowH);
      }
    }

    // Y ticks (time)
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "11px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const labels = Math.min(6, numRows);
    for (let i = 0; i < labels; i++) {
      const idx = Math.floor((i / (labels - 1 || 1)) * (numRows - 1));
      const row = waterfall[waterfall.length - numRows + idx];
      const t = row?.timestamp
        ? new Date(row.timestamp).toLocaleTimeString()
        : String(idx);
      const yPos = margin.top + idx * rowH + rowH / 2;
      ctx.fillText(t, margin.left - 8, yPos);
    }

    // draw colorbar
    const waterfallHeight = rowH * numRows;
    drawColorbar(
      ctx,
      width - margin.right + 8,
      margin.top,
      12,
      waterfallHeight,
      minVal,
      maxVal
    );
  }, [size]);

  // fetch data
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await trackApi.getLatest(deviceId, limit);
        const data = res?.data || [];
        const blocks = data.flatMap((t) =>
          (t.waterfall || []).map((b) => ({
            ...b,
            timestamp: b.timestamp || t.timestamp,
          }))
        );

        const existingTs = new Set(
          waterfallRef.current.map((b) => b.timestamp)
        );
        const newBlocks = blocks.filter((b) => !existingTs.has(b.timestamp));

        if (newBlocks.length) {
          waterfallRef.current = [...waterfallRef.current, ...newBlocks].slice(
            -maxRows
          );
          setRedrawTrigger((prev) => prev + 1);
        }
      } catch (err) {
        console.warn("fetch spectrum failed", err);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [deviceId, limit]);

  // resize observer
  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const r = e.contentRect;
        if (r.width > 0 && r.width !== size.width) {
          setSize((prevSize) => ({ ...prevSize, width: Math.floor(r.width) }));
        }
      }
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [size.width]);

  // redraw
  useEffect(() => {
    drawCanvas();
  }, [size, redrawTrigger, drawCanvas]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: 420, position: "relative" }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default SpectrumWaterfall;
