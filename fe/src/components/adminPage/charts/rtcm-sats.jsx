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

export default function RTCMSatsChart({
  deviceId,
  latestTrack,
  limit = 120,
  height = 450,
}) {
  const [series, setSeries] = useState([]);
  const [constNames, setConstNames] = useState([]);
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
      totalSats: typeof t.total_sats === "number" ? t.total_sats : 0,
    };

    if (Array.isArray(t.constellations)) {
      t.constellations.forEach((c) => {
        if (c?.constellation && typeof c.num_sats === "number") {
          point[c.constellation] = c.num_sats;
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
    setConstNames([]);
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

        const allNames = Array.from(
          new Set(
            tracks.flatMap((t) =>
              Array.isArray(t.constellations)
                ? t.constellations.map((c) => c?.constellation).filter(Boolean)
                : []
            )
          )
        );

        if (mounted) {
          setSeries(latestPoints);
          setConstNames(allNames);
        }
      } catch (err) {
        console.error("RTCMSatsChart init error:", err);
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

    if (Array.isArray(latestTrack.constellations)) {
      setConstNames((prev) => {
        const newNames = latestTrack.constellations
          .map((c) => c?.constellation)
          .filter(Boolean);
        return Array.from(new Set([...prev, ...newNames]));
      });
    }
  }, [latestTrack, deviceId, limit]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        Đang tải số lượng vệ tinh RTCM...
      </div>
    );
  }

  if (!series.length) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        Chưa có dữ liệu số vệ tinh RTCM
      </div>
    );
  }

  const palette = [
    "#06B6D4", // GPS
    "#3B82F6", // GLONASS
    "#F97316", // Galileo
    "#22C55E", // QZSS
    "#A78BFA", // BeiDou
    "#F43F5E",
    "#FBBF24",
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
            value: "Số vệ tinh",
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

        {/* Đường cho từng chòm sao */}
        {constNames.map((name, i) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            name={`${name}`}
            stroke={palette[i % palette.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            connectNulls={false}
          />
        ))}

        {/* Tổng số vệ tinh (nét đứt, nổi bật hơn) */}
        <Line
          type="monotone"
          dataKey="totalSats"
          name="Tổng số vệ tinh"
          stroke="#10b981"
          strokeWidth={2.5}
          strokeDasharray="5 5"
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
