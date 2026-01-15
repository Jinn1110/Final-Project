"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import trackApi from "../../../api/trackApi";

const MAX_BLOCK = 6;

const AGCChart = ({
  deviceId,
  latestTrack,
  limit = 120,
  height = 380,
  agcScaleDivider = 100,
}) => {
  const [data, setData] = useState([]); // rows: { ts, timestamp, agc_1, agc_2, ... }
  const [isLoading, setIsLoading] = useState(true);
  const lastTsRef = useRef(0);

  // Helper: 1 track → 1 row (chỉ AGC của các block)
  const trackToRow = (track) => {
    if (!track?.timestamp || !Array.isArray(track.rf_status)) return null;

    const date = new Date(track.timestamp);
    if (isNaN(date.getTime())) return null;

    const ts = date.getTime();
    const timestamp = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const row = { ts, timestamp };

    track.rf_status.forEach((rf, idx) => {
      const block = rf.rf_block ?? idx + 1;
      if (block <= MAX_BLOCK) {
        row[`agc_${block}`] =
          typeof rf.agc === "number" ? rf.agc / agcScaleDivider : null;
      }
    });

    return row;
  };

  // INIT: Load lịch sử
  useEffect(() => {
    if (!deviceId) return;

    let mounted = true;
    setIsLoading(true);
    setData([]);
    lastTsRef.current = 0;

    const fetchInitial = async () => {
      try {
        const res = await trackApi.getLatest(deviceId, limit + 50);
        const tracks = Array.isArray(res?.data) ? res.data : [];

        if (!tracks.length) {
          mounted && setIsLoading(false);
          return;
        }

        const rows = tracks
          .map(trackToRow)
          .filter(Boolean)
          .sort((a, b) => a.ts - b.ts); // cũ → mới

        if (!rows.length) {
          mounted && setIsLoading(false);
          return;
        }

        const latestRows = rows.slice(-limit);
        lastTsRef.current = latestRows[latestRows.length - 1]?.ts || 0;

        if (mounted) {
          setData(latestRows);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("AGCChart init error:", err);
        mounted && setIsLoading(false);
      }
    };

    fetchInitial();

    return () => {
      mounted = false;
    };
  }, [deviceId, limit]);

  // REALTIME: append từ latestTrack
  useEffect(() => {
    if (!latestTrack || latestTrack.deviceId !== deviceId) return;

    const row = trackToRow(latestTrack);
    if (!row || row.ts <= lastTsRef.current) return;

    lastTsRef.current = row.ts;

    setData((prev) => {
      const updated = [...prev, row];
      return updated.length > limit ? updated.slice(-limit) : updated;
    });
  }, [latestTrack, deviceId, limit]);

  // Tìm các block có dữ liệu AGC thực tế
  const activeBlocks = Array.from(
    new Set(
      data.flatMap((row) =>
        Object.keys(row)
          .filter((k) => k.startsWith("agc_"))
          .map((k) => Number(k.split("_")[1]))
      )
    )
  ).sort((a, b) => a - b);

  const colors = [
    "#06b6d4",
    "#f59e0b",
    "#10b981",
    "#f43f5e",
    "#8b5cf6",
    "#ec4899",
  ];

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        Đang tải dữ liệu AGC...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        Chưa có dữ liệu AGC
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#222" />

        <XAxis
          dataKey="timestamp"
          tick={{ fontSize: 11, fill: "#aaa" }}
          stroke="#444"
          interval="preserveStartEnd"
        />

        <YAxis
          width={60}
          stroke="#444"
          tick={{ fontSize: 11, fill: "#aaa" }}
          domain={["dataMin - 5", "dataMax + 10"]}
          label={{
            value: `AGC (${agcScaleDivider > 1 ? "scaled" : ""} dB)`,
            angle: -90,
            position: "insideLeft",
            fill: "#aaa",
            fontSize: 12,
          }}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "6px",
            color: "#e2e8f0",
          }}
          labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
          formatter={(value, name) => [
            value == null ? "N/A" : value.toFixed(2),
            name,
          ]}
          labelFormatter={(label) => `Thời gian: ${label}`}
        />

        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{ color: "#ddd", fontSize: 12 }}
        />

        {activeBlocks.map((block) => (
          <Line
            key={block}
            type="monotone"
            dataKey={`agc_${block}`}
            name={`Block ${block}`}
            stroke={colors[(block - 1) % colors.length]}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6 }}
            connectNulls={true}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AGCChart;
