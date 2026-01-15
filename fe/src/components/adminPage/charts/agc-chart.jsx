"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import trackApi from "../../../api/trackApi";

const AGCChart = ({ deviceId, limit = 100, height = 350 }) => {
  const [data, setData] = useState([]); // Tất cả điểm dữ liệu (có rfBlock)
  const [loading, setLoading] = useState(true);
  const prevDataRef = useRef(new Map());

  useEffect(() => {
    if (!deviceId) return;

    let cancelled = false;
    let intervalId;

    const fetchData = async () => {
      try {
        if (!data.length) setLoading(true);

        const res = await trackApi.getLatest(deviceId, limit);
        const tracks = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        const newMap = new Map();

        tracks.forEach((track) => {
          const timestampISO = track.timestamp
            ? new Date(track.timestamp).toISOString()
            : new Date().toISOString();
          const timestamp = new Date(timestampISO).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          const ts = new Date(timestampISO).getTime();

          if (Array.isArray(track.rf_status) && track.rf_status.length > 0) {
            track.rf_status.forEach((rf, idx) => {
              const blockId = rf.rf_block ?? idx;
              const key = `${ts}_${blockId}`;

              // Tái sử dụng object cũ để tránh re-render không cần thiết
              const existing = prevDataRef.current.get(key);
              if (existing) {
                newMap.set(key, existing);
              } else {
                newMap.set(key, {
                  timestamp,
                  timestampISO,
                  rfBlock: blockId,
                  agc: rf.agc ?? 0,
                  noise: rf.noise_per_ms ?? 0,
                  jam: rf.jam_indicator ?? 0,
                });
              }
            });
          }
        });

        // Gộp dữ liệu cũ + mới
        const mergedMap = new Map(prevDataRef.current);
        newMap.forEach((val, key) => mergedMap.set(key, val));

        // Giữ lại tối đa limit * 12 (an toàn cho ~8 block)
        const allEntries = Array.from(mergedMap.entries());
        const sorted = allEntries
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-limit * 12);

        const finalMap = new Map(sorted);
        const finalData = Array.from(finalMap.values());

        if (!cancelled) {
          prevDataRef.current = finalMap;
          setData(finalData);
        }
      } catch (err) {
        console.error("Failed to load AGC data", err);
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    intervalId = setInterval(fetchData, 3000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [deviceId, limit]);

  // Reset khi đổi device
  useEffect(() => {
    setData([]);
    prevDataRef.current = new Map();
    setLoading(true);
  }, [deviceId]);

  // Lấy danh sách rfBlock duy nhất để vẽ từng đường
  const rfBlocks = Array.from(new Set(data.map((d) => d.rfBlock))).sort(
    (a, b) => a - b
  );

  // Màu sắc đẹp, phân biệt rõ từng block
  const colors = [
    "#06b6d4", // cyan
    "#f59e0b", // amber
    "#10b981", // emerald
    "#f43f5e", // rose
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#3b82f6", // blue
    "#eab308", // yellow
  ];

  if (loading && !data.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-400">Đang tải dữ liệu AGC...</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-400">Không có dữ liệu AGC</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#333" vertical={false} />

        <XAxis
          dataKey="timestamp"
          stroke="#a3a3a3"
          tick={{ fontSize: 12 }}
          interval={Math.floor(data.length / 8)}
        />

        <YAxis
          stroke="#a3a3a3"
          tick={{ fontSize: 12 }}
          label={{
            value: "AGC (dB)",
            angle: -90,
            position: "insideLeft",
            style: { fill: "#a3a3a3" },
          }}
          domain={["dataMin - 10", "dataMax + 10"]}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #404040",
            borderRadius: "8px",
            padding: "8px 12px",
          }}
          labelStyle={{ color: "#e5e7eb", marginBottom: "4px" }}
          formatter={(value, name, props) => {
            if (name.includes("AGC")) {
              return [`${value} dB`, `Block ${props.payload.rfBlock} - AGC`];
            }
            return [value, name];
          }}
          labelFormatter={(label) => `Thời gian: ${label}`}
        />

        <Legend wrapperStyle={{ paddingTop: "10px" }} iconType="line" />

        {/* Vẽ riêng một Line cho mỗi rf_block */}
        {rfBlocks.map((blockId, index) => {
          const blockData = data.filter((d) => d.rfBlock === blockId);

          return (
            <Line
              key={blockId}
              type="monotone"
              data={blockData}
              dataKey="agc"
              name={`Block ${blockId}`}
              stroke={colors[index % colors.length]}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
              connectNulls={true}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AGCChart;
