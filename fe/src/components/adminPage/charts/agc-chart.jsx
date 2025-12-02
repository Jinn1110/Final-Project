"use client";

import React, { useEffect, useState } from "react";
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

const AGCChart = ({ deviceId, limit = 100, height = 300 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        if (!data.length) setLoading(true);

        const res = await trackApi.getLatest(deviceId, limit);
        const tracks = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        const map = new Map();
        tracks.forEach((track) => {
          const ts = track.timestamp
            ? new Date(track.timestamp).toISOString()
            : Date.now().toString();

          if (Array.isArray(track.rf_status)) {
            track.rf_status.forEach((rf, idx) => {
              const key = `${ts}_${rf.rf_block ?? idx}`;
              map.set(key, {
                timestamp: new Date(track.timestamp).toLocaleTimeString(),
                timestampISO: ts,
                rfBlock: rf.rf_block ?? idx,
                agc: rf.agc ?? 0,
                noise: rf.noise_per_ms ?? 0,
                jam: rf.jam_indicator ?? 0,
              });
            });
          }
        });

        const chartData = Array.from(map.values()).sort((a, b) =>
          a.timestampISO < b.timestampISO ? -1 : 1
        );

        if (!cancelled) {
          setData(chartData);
        }
      } catch (err) {
        console.error("Failed to load AGC data", err);
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // initial fetch
    fetchData();
    // poll every 3 seconds
    const intervalId = setInterval(fetchData, 3000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [deviceId, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-neutral-400">No AGC data available</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#404040"
          vertical={false}
        />
        <XAxis
          dataKey="timestamp"
          stroke="#a3a3a3"
          tick={{ fontSize: 12 }}
          interval={Math.max(0, Math.floor(data.length / 6))}
        />
        <YAxis stroke="#a3a3a3" tick={{ fontSize: 12 }} width={40} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #404040",
            borderRadius: "4px",
          }}
          cursor={{ stroke: "#666666", strokeWidth: 1 }}
          formatter={(value, name) => {
            if (name === "agc") return [value, "AGC (dB)"];
            if (name === "noise") return [value, "Noise (dB)"];
            if (name === "jam") return [value, "Jam Indicator"];
            return [value, name];
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: "10px" }}
          contentStyle={{ backgroundColor: "transparent", color: "#a3a3a3" }}
        />
        <Line
          type="monotone"
          dataKey="agc"
          stroke="#06b6d4"
          dot={false}
          strokeWidth={2}
          name="AGC"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="noise"
          strokeOpacity={0}
          stroke="#f97316"
          dot={false}
          strokeWidth={2}
          name="Noise"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="jam"
          strokeOpacity={0}
          stroke="#ef4444"
          dot={false}
          strokeWidth={2}
          name="Jam Indicator"
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AGCChart;
