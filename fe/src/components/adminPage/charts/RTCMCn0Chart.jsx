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

export default function RTCMCn0Chart({
  deviceId,
  latestTrack,
  limit = 120,
  height = 380,
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
      overallCn0:
        typeof t.avg_cn0_dbhz === "number" && !isNaN(t.avg_cn0_dbhz)
          ? t.avg_cn0_dbhz
          : null,
    };

    if (Array.isArray(t.constellations)) {
      t.constellations.forEach((c) => {
        if (
          c?.constellation &&
          typeof c.avg_cn0_dbhz === "number" &&
          !isNaN(c.avg_cn0_dbhz)
        ) {
          point[c.constellation] = c.avg_cn0_dbhz;
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
        console.error("RTCMCn0Chart init error:", err);
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
        Đang tải dữ liệu RTCM C/N₀...
      </div>
    );
  }

  if (!series.length) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        Chưa có dữ liệu RTCM C/N₀
      </div>
    );
  }

  const palette = [
    "#06B6D4", // Overall
    "#3B82F6",
    "#F97316",
    "#22C55E",
    "#A78BFA",
    "#F43F5E",
    "#FBBF24",
  ];

  // Custom Tooltip để hiển thị tên chòm sao + giá trị
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload; // Dữ liệu điểm hover
      const time = label; // Thời gian

      return (
        <div
          className="bg-[#0f172a] border border-[#334155] rounded-lg p-4 shadow-xl text-white text-sm"
          style={{ minWidth: "200px" }}
        >
          <p className="font-bold mb-2 border-b border-[#334155] pb-1">
            Thời gian: {time}
          </p>
          {payload.map((entry, index) => {
            const name = entry.name;
            const value = entry.value != null ? entry.value.toFixed(1) : "N/A";

            // Nếu là overall
            if (name === "Overall Avg C/N₀") {
              return (
                <p key={index} className="mt-1">
                  <span
                    className="font-semibold"
                    style={{ color: entry.color }}
                  >
                    Overall Avg C/N₀:
                  </span>{" "}
                  {value} dB-Hz
                </p>
              );
            }

            // Nếu là chòm sao
            return (
              <p key={index} className="mt-1">
                <span className="font-semibold" style={{ color: entry.color }}>
                  {name}:
                </span>{" "}
                {value} dB-Hz
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

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
          width={60}
          domain={["dataMin - 5", "dataMax + 5"]}
          label={{
            value: "C/N₀ (dB-Hz)",
            angle: -90,
            position: "insideLeft",
            fill: "#aaa",
            fontSize: 12,
            offset: -5,
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{ color: "#ddd", fontSize: 12 }}
        />

        <Line
          type="monotone"
          dataKey="overallCn0"
          name="Overall Avg C/N₀"
          stroke={palette[0]}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 6 }}
        />

        {constNames.map((name, i) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            name={`${name}`}
            stroke={palette[(i + 1) % palette.length]}
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
