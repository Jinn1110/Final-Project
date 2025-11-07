"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function ScatterPlot() {
  // Generate scatter data
  const generateScatterData = () => {
    const data = [];
    for (let i = 0; i < 50; i++) {
      data.push({
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20,
      });
    }
    return data;
  };

  const data = generateScatterData();

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height={250}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="x"
            type="number"
            tick={{ fontSize: 11, fill: "#999" }}
            stroke="#444"
          />
          <YAxis
            dataKey="y"
            type="number"
            tick={{ fontSize: 11, fill: "#999" }}
            stroke="#444"
          />
          <Scatter name="Position" data={data} fill="#06B6D4" />
        </ScatterChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
        <div>
          <div className="text-neutral-500 text-xs">W - E</div>
          <div className="text-neutral-100 font-semibold">±10m</div>
        </div>
        <div>
          <div className="text-neutral-500 text-xs">S - N</div>
          <div className="text-neutral-100 font-semibold">±15m</div>
        </div>
      </div>
    </div>
  );
}
