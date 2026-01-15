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
  ReferenceLine,
  Label,
} from "recharts";
import trackApi from "../../../api/trackApi";

export default function ScatterPlot({
  deviceId = null,
  limit = 1,
  height = 350,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        setLoading(true);
        const res = await trackApi.getLatest(deviceId || "GNSS-0001", 1);
        const tracks = Array.isArray(res.data) ? res.data : [];

        if (tracks.length === 0 || !tracks[0]) {
          if (!cancelled) setData(null);
          return;
        }

        const latest = tracks[0];
        const pd = latest.position_deviation || latest.positionDeviation;

        if (!pd || pd.hAcc == null || pd.vAcc == null) {
          if (!cancelled) setData(null);
          return;
        }

        const point = {
          hAcc: Number(pd.hAcc.toFixed(2)),
          vAcc: Number(pd.vAcc.toFixed(2)),
          timestamp: latest.timestamp
            ? new Date(latest.timestamp).toLocaleString("vi-VN")
            : "—",
        };

        if (!cancelled) setData(point);
      } catch (err) {
        console.warn("Failed to load latest position deviation", err);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => (cancelled = true);
  }, [deviceId]);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-zinc-900/60 rounded-2xl">
        <div className="text-zinc-400 text-lg">
          Đang tải dữ liệu mới nhất...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-zinc-900/60 rounded-2xl">
        <div className="text-center">
          <p className="text-zinc-400 text-lg">
            Không có dữ liệu position deviation
          </p>
          <p className="text-zinc-500 text-sm mt-2">
            Bản tin mới nhất chưa có hAcc/vAcc
          </p>
        </div>
      </div>
    );
  }

  // Tăng margin để điểm chấm nằm gần gốc hơn, tránh dính cạnh
  const maxValue = Math.max(data.hAcc, data.vAcc);
  const domainMax = Math.ceil(maxValue * 1.5 * 10) / 10; // Tăng lên 1.5x để điểm gần gốc

  const chartData = [data];

  return (
    <div className="w-full h-full bg-zinc-900/60 rounded-2xl p-5 shadow-2xl border border-zinc-800">
      <h3 className="text-xl font-bold text-emerald-400 mb-1 text-center">
        Độ Chính Xác Vị Trí Mới Nhất
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart
          margin={{
            top: 20,
            right: 40,
            bottom: 50, // ← Giảm để nhãn không bị cắt
            left: 40, // ← Giảm mạnh để trục vAcc dịch về bên trái
          }}
        >
          <CartesianGrid strokeDasharray="4 4" stroke="#374151" opacity={0.4} />

          <XAxis
            type="number"
            dataKey="hAcc"
            domain={[0, domainMax]}
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            padding={{ left: 10, right: 10 }}
          >
            <Label
              value="hAcc (mét)"
              position="bottom"
              offset={10}
              style={{ fill: "#e5e7eb", fontSize: 13, fontWeight: "bold" }}
            />
          </XAxis>

          <YAxis
            type="number"
            dataKey="vAcc"
            domain={[0, domainMax]}
            stroke="#9ca3af"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            padding={{ top: 10, bottom: 10 }}
          >
            <Label
              value="vAcc (mét)"
              angle={-90}
              position="left"
              offset={10}
              style={{ fill: "#e5e7eb", fontSize: 13, fontWeight: "bold" }}
            />
          </YAxis>

          {/* Đường tham chiếu lý tưởng */}
          <ReferenceLine
            segment={[
              { x: 0, y: 0 },
              { x: domainMax, y: domainMax },
            ]}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            strokeWidth={2}
          >
            <Label
              value="hAcc = vAcc"
              position="insideTopRight"
              fill="#f59e0b"
              fontSize={12}
              fontWeight="bold"
            />
          </ReferenceLine>

          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "10px",
              padding: "10px",
            }}
            labelStyle={{ color: "#fbbf24", fontWeight: "bold" }}
            formatter={(value) => `${value} m`}
            labelFormatter={() => `Thời gian: ${data.timestamp}`}
          />

          {/* 1 điểm duy nhất – to và nổi bật */}
          <Scatter
            name="Đo mới nhất"
            data={chartData}
            fill="#10b981"
            stroke="#059669"
            strokeWidth={4}
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Thông tin chi tiết */}
      <div className="mt-5 grid grid-cols-2 gap-5 text-center">
        <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700">
          <p className="text-zinc-400 text-sm">Độ chính xác ngang</p>
          <p className="text-3xl font-bold text-cyan-400 mt-2">{data.hAcc} m</p>
        </div>
        <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700">
          <p className="text-zinc-400 text-sm">Độ chính xác dọc</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">
            {data.vAcc} m
          </p>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-zinc-400 space-y-1">
        <p>• Hiển thị bản tin mới nhất</p>
        <p>• Gần góc (0,0) → định vị càng chính xác</p>
      </div>
    </div>
  );
}
