"use client";

import {
  ResponsiveContainer,
  Bar as RechartsBar,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
} from "recharts";

export default function BarChartComponent({ color, height = 150 }) {
  // Generate bar data
  const generateData = () => {
    const data = [];
    for (let i = 0; i < 20; i++) {
      data.push({
        time: `${String(12 + Math.floor(i / 10)).padStart(2, "0")}:${String(
          (i % 10) * 6
        ).padStart(2, "0")}`,
        value: Math.random() * 50 - 25,
      });
    }
    return data;
  };

  const data = generateData();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10, fill: "#999" }}
          stroke="#444"
          interval={Math.floor(data.length / 4)}
        />
        <YAxis tick={{ fontSize: 10, fill: "#999" }} stroke="#444" width={35} />
        <RechartsBar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
