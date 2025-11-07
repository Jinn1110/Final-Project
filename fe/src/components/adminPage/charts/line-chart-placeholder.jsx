"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function LineChartPlaceholder({
  lines,
  height = 200,
  showLabel,
}) {
  // Generate sample data
  const generateData = () => {
    const data = [];
    for (let i = 0; i < 50; i++) {
      const time = `${String(12 + Math.floor(i / 20)).padStart(
        2,
        "0"
      )}:${String((45 + (i % 20) * 3) % 60).padStart(2, "0")}:00`;
      const point = { time };
      lines.forEach((line) => {
        point[line.dataKey] = Math.random() * 100 + 20;
      });
      data.push(point);
    }
    return data;
  };

  const data = generateData();

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-2 px-3 py-2 bg-red-950/30 border border-red-900 rounded text-xs font-semibold text-red-400 text-center">
          {showLabel}
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "#999" }}
            stroke="#444"
            interval={Math.floor(data.length / 5)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#999" }}
            stroke="#444"
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #444",
              borderRadius: "4px",
            }}
            labelStyle={{ color: "#fff" }}
            cursor={{ stroke: "#666" }}
          />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              dot={false}
              strokeWidth={1.5}
              name={line.name}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
