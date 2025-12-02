"use client";

import React, { useEffect, useState } from "react";
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

export default function CndAverageChart({
  deviceId = "GNSS-0001",
  limit = 100,
  height = 150,
}) {
  const [data, setData] = useState({ series: [], constNames: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const res = await trackApi.getLatest(deviceId, limit);
        const tracks = Array.isArray(res?.data) ? res.data : [];

        // build constellation name set
        const constNames = Array.from(
          new Set(
            tracks.flatMap((t) =>
              Array.isArray(t.constellations)
                ? t.constellations.map((c) => c.name)
                : []
            )
          )
        );

        // convert tracks to series points
        const newSeries = tracks
          .map((t) => {
            const ts = t.timestamp ? new Date(t.timestamp) : null;
            if (!ts) return null;
            const point = { time: ts.toLocaleTimeString(), ts: ts.getTime() };

            // overall cnd
            if (t.cn0_total !== undefined && t.cn0_total !== null)
              point.cnd = Number(t.cn0_total);
            else if (
              Array.isArray(t.constellations) &&
              t.constellations.length
            ) {
              const nums = t.constellations
                .map((c) => Number(c.cn0))
                .filter(Number.isFinite);
              if (nums.length)
                point.cnd = nums.reduce((s, v) => s + v, 0) / nums.length;
            }

            // per-constellation
            if (Array.isArray(t.constellations)) {
              t.constellations.forEach((c) => {
                if (c && c.name) point[c.name] = Number(c.cn0);
              });
            }

            return point;
          })
          .filter(Boolean)
          .sort((a, b) => a.ts - b.ts);

        if (!mounted) return;

        setData((prev) => {
          const lastTs = prev.series.length
            ? prev.series[prev.series.length - 1].ts
            : 0;
          const pointsToAdd = newSeries.filter((p) => p.ts > lastTs);
          const combinedSeries = [...prev.series, ...pointsToAdd].slice(-limit);
          return { series: combinedSeries, constNames };
        });

        setLoading(false);
      } catch (err) {
        console.error("CndAverageChart fetch error:", err);
        setLoading(false);
      }
    }

    fetchData();
    const iv = setInterval(fetchData, 5000);
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, [deviceId, limit]);

  if (loading) return <div className="text-sm text-gray-400">Loading...</div>;
  if (!data.series || !data.series.length)
    return <div className="text-sm text-gray-400">No data</div>;

  const { series, constNames } = data;
  const palette = [
    "#06B6D4",
    "#3B82F6",
    "#F97316",
    "#22C55E",
    "#A78BFA",
    "#F43F5E",
    "#FBBF24",
  ];

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={series}
          margin={{ top: 5, right: 10, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "#999" }}
            stroke="#333"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#999" }}
            stroke="#333"
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0b1114",
              border: "1px solid #222",
            }}
            labelStyle={{ color: "#fff" }}
            className="z-1000"
          />
          <Legend wrapperStyle={{ color: "#ddd", fontSize: 12 }} />
          {/* overall average */}
          <Line
            type="monotone"
            dataKey="cnd"
            stroke={palette[0]}
            strokeWidth={2}
            dot={false}
            name="Overall"
          />
          {/* per-constellation */}
          {constNames.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={palette[(i + 1) % palette.length]}
              strokeWidth={1.5}
              dot={false}
              name={name}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
