"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
} from "recharts";
import trackApi from "../../../api/trackApi";

export default function ScatterPlot({
  deviceId = null,
  limit = 100,
  height = 300,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        setLoading(true);
        const res = await trackApi.getLatest(deviceId || "GNSS-0001", limit);
        const tracks = Array.isArray(res.data) ? res.data : [];
        const points = tracks
          .map((t) => {
            const pd = t.position_deviation || t.positionDeviation || null;
            if (!pd) return null;
            return {
              x: pd.hAcc ?? null,
              y: pd.vAcc ?? null,
              timestamp: t.timestamp
                ? new Date(t.timestamp).toLocaleTimeString()
                : "-",
            };
          })
          .filter(Boolean);
        if (!cancelled) setData(points);
      } catch (err) {
        console.warn("Failed to load position deviation", err);
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => (cancelled = true);
  }, [deviceId, limit]);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[250px] flex items-center justify-center">
        <div className="text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="w-full h-full min-h-[250px] flex items-center justify-center">
        <div className="text-neutral-400">No position deviation data</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />

          <XAxis
            dataKey="x"
            type="number"
            tick={{ fontSize: 12, fill: "#999" }}
            stroke="#444"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) => value.toFixed(2)}
          >
            <Label
              position="bottom"
              offset={10}
              style={{ fill: "#aaa", fontWeight: "bold" }}
            />
          </XAxis>

          <YAxis
            dataKey="y"
            type="number"
            tick={{ fontSize: 12, fill: "#999" }}
            stroke="#444"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(value) => value.toFixed(2)}
          >
            <Label
              angle={-90}
              position="left"
              offset={-10}
              style={{ fill: "#aaa", fontWeight: "bold" }}
            />
          </YAxis>

          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #555",
              borderRadius: "6px",
              padding: "10px",
              fontSize: "13px",
            }}
            cursor={{ stroke: "#06B6D4", strokeWidth: 1 }}
            formatter={(value, name) => [
              typeof value === "number" ? value.toFixed(2) : value,
              name === "x" ? "hAcc (m)" : "vAcc (m)",
            ]}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                return `Time: ${payload[0].payload.timestamp}`;
              }
              return `Time: ${label}`;
            }}
            labelStyle={{ color: "#FBBF24", fontWeight: "bold" }}
            itemStyle={{ color: "#06B6D4", fontWeight: "bold" }}
          />

          <Legend
            wrapperStyle={{ paddingTop: "10px", color: "#aaa" }}
            layout="horizontal"
          />

          <Scatter
            name="Position Deviation"
            data={data}
            fill="#10B981"
            line={{ stroke: "#10B981" }}
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
