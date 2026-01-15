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
import trackRtcmApi from "../../../api/trackRtcmApi";

export default function RTCMSignalsPerBandChart({
  deviceId,
  latestTrack,
  limit = 120,
  height = 380,
}) {
  const [series, setSeries] = useState([]);
  const [bandNames, setBandNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastTsRef = useRef(0);

  const trackToPoint = (t) => {
    if (!t?.timestamp || !Array.isArray(t.constellations)) return null;

    const tsDate = new Date(t.timestamp);
    if (isNaN(tsDate.getTime())) return null;

    const point = {
      ts: tsDate.getTime(),
      time: tsDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };

    // Thu thập tất cả bands từ tất cả constellations
    if (Array.isArray(t.constellations)) {
      t.constellations.forEach((c) => {
        if (c?.signals_per_band && typeof c.signals_per_band === "object") {
          Object.entries(c.signals_per_band).forEach(([band, num]) => {
            if (typeof num === "number") {
              const key = `${c.constellation}-${band}`; // ví dụ: GPS-L1, BeiDou-B1
              point[key] = num;
            }
          });
        }
      });
    }

    return point;
  };

  useEffect(() => {
    if (!deviceId) return;

    let mounted = true;
    setIsLoading(true);
    setSeries([]);
    setBandNames([]);
    lastTsRef.current = 0;

    const fetchInitial = async () => {
      try {
        const res = await trackRtcmApi.getLatest(deviceId, limit + 20);
        const tracks = Array.isArray(res?.data) ? res.data : [];

        if (!tracks.length) return;

        const points = tracks
          .map(trackToPoint)
          .filter(Boolean)
          .sort((a, b) => a.ts - b.ts);

        if (!points.length) return;

        const latestPoints = points.slice(-limit);
        lastTsRef.current = latestPoints[latestPoints.length - 1]?.ts || 0;

        // Thu thập tất cả band keys duy nhất
        const allBands = Array.from(
          new Set(
            points.flatMap((p) => Object.keys(p).filter((k) => k.includes("-")))
          )
        );

        if (mounted) {
          setSeries(latestPoints);
          setBandNames(allBands);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("RTCMSignalsPerBandChart init error:", err);
      } finally {
        mounted && setIsLoading(false);
      }
    };

    fetchInitial();

    return () => {
      mounted = false;
    };
  }, [deviceId, limit]);

  useEffect(() => {
    if (!latestTrack || latestTrack.deviceId !== deviceId) return;

    const point = trackToPoint(latestTrack);
    if (!point || point.ts <= lastTsRef.current) return;

    lastTsRef.current = point.ts;

    setSeries((prev) => {
      const updated = [...prev, point];
      return updated.length > limit ? updated.slice(-limit) : updated;
    });

    // Cập nhật band names mới nếu có
    if (Array.isArray(latestTrack.constellations)) {
      const newBands = [];
      latestTrack.constellations.forEach((c) => {
        if (c?.signals_per_band) {
          Object.keys(c.signals_per_band).forEach((band) => {
            const key = `${c.constellation}-${band}`;
            if (!newBands.includes(key)) newBands.push(key);
          });
        }
      });
      setBandNames((prev) => Array.from(new Set([...prev, ...newBands])));
    }
  }, [latestTrack, deviceId, limit]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        Đang tải tín hiệu theo băng tần RTCM...
      </div>
    );
  }

  if (!series.length) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        Chưa có dữ liệu tín hiệu theo băng tần RTCM
      </div>
    );
  }

  const palette = [
    "#06B6D4",
    "#3B82F6",
    "#F97316",
    "#22C55E",
    "#A78BFA",
    "#F43F5E",
    "#FBBF24",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={series}
        margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: "#aaa" }}
          stroke="#444"
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#aaa" }}
          stroke="#444"
          width={50}
          domain={["dataMin - 5", "dataMax + 10"]}
          label={{
            value: "Số tín hiệu",
            angle: -90,
            position: "insideLeft",
            fill: "#aaa",
            fontSize: 12,
            offset: -5,
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
        />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{ color: "#ddd", fontSize: 12 }}
        />

        {/* Chỉ vẽ các đường băng tần, không có tổng */}
        {bandNames.map((bandKey, i) => (
          <Line
            key={bandKey}
            type="monotone"
            dataKey={bandKey}
            name={bandKey} // hiển thị GPS-L1, BeiDou-B1...
            stroke={palette[i % palette.length]}
            strokeWidth={1.8}
            dot={false}
            activeDot={{ r: 5 }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
