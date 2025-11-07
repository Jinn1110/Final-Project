"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

export default function SpectrumWaterfall() {
  // Generate spectrum data
  const generateSpectrumData = () => {
    const data = [];
    for (let i = 0; i < 100; i++) {
      const time = `${12 + Math.floor(i / 60)}:${String(
        (45 + (i % 60)) % 60
      ).padStart(2, "0")}`;
      data.push({
        time,
        cyan: Math.random() * 100,
        yellow: Math.random() * 80,
        red: Math.random() * 60,
        green: Math.random() * 90,
      });
    }
    return data;
  };

  const data = generateSpectrumData();

  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart
          data={data}
          margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
        >
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "#999" }}
            stroke="#444"
            interval={Math.floor(data.length / 5)}
          />
          <YAxis tick={{ fontSize: 11, fill: "#999" }} stroke="#444" />
          <Bar dataKey="cyan" fill="#06B6D4" stackId="a" radius={0} />
          <Bar dataKey="yellow" fill="#FBBF24" stackId="a" radius={0} />
          <Bar dataKey="red" fill="#EF4444" stackId="a" radius={0} />
          <Bar dataKey="green" fill="#22C55E" stackId="a" radius={0} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex justify-between items-center px-4 mt-2 text-xs text-neutral-500">
        <span>12:45:00</span>
        <span>-100dBm</span>
      </div>
    </div>
  );
}
