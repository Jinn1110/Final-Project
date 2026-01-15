import React, { useEffect, useState, useMemo } from "react";
import deviceApi from "../../api/deviceApi";
import trackApi from "../../api/trackApi";
import trackRtcmApi from "../../api/trackRtcmApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Memoized Card
const MemoizedCard = React.memo(({ label, value, colorClass }) => (
  <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl text-center">
    <div className="text-sm text-zinc-400 mb-2">{label}</div>
    <div className={`text-4xl font-bold ${colorClass}`}>{value}</div>
  </div>
));

const Dashboard = () => {
  const [devices, setDevices] = useState([]);
  const [latestTracks, setLatestTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (isMounted) setLoading(true);

        const devRes = await deviceApi.getActive();
        const devList = devRes?.data ?? [];
        if (isMounted) setDevices(devList);

        const [ubxRes, rtcmRes] = await Promise.all([
          trackApi.getAllLatest(),
          trackRtcmApi.getAllLatest(),
        ]);

        const allTracks = [...(ubxRes?.data ?? []), ...(rtcmRes?.data ?? [])];

        if (isMounted) {
          // Log để debug dữ liệu thô từ RTCM
          console.log("RTCM Tracks:", rtcmRes?.data);
          console.log("All Tracks count:", allTracks.length);

          setLatestTracks((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(allTracks)) {
              return prev;
            }
            return allTracks;
          });
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const stats = useMemo(() => {
    const totalDevices = devices.length;
    const connectedCount = devices.filter((d) => d.lastSeen).length;

    const allCn0 = latestTracks
      .map((t) => t?.cn0_total ?? t?.avg_cn0_dbhz ?? null)
      .filter((v) => v !== null);
    const avgCn0 =
      allCn0.length > 0
        ? (allCn0.reduce((a, b) => a + b, 0) / allCn0.length).toFixed(1)
        : "—";

    // Tính tổng số vệ tinh - sửa lại để ưu tiên đúng field
    const allSats = latestTracks.map((t) => {
      // Ưu tiên total_sats cho RTCM (field chính xác)
      if (t?.total_sats != null && typeof t.total_sats === "number") {
        return t.total_sats; // RTCM: 12
      }

      // UBX: tổng num_tracked từ constellations
      if (Array.isArray(t?.constellations)) {
        const sumTracked = t.constellations.reduce(
          (sum, c) => sum + (c?.num_tracked || 0),
          0
        );
        if (sumTracked > 0) return sumTracked;
      }

      // Fallback nếu không có gì
      return 0;
    });

    const validSats = allSats.filter((v) => v > 0);
    const avgSats =
      validSats.length > 0
        ? (validSats.reduce((a, b) => a + b, 0) / validSats.length).toFixed(0)
        : "—";

    // Debug: in ra giá trị vệ tinh từng thiết bị
    console.log("Số vệ tinh từng thiết bị:", allSats);

    const cn0ChartData = latestTracks.map((t) => ({
      name: t.deviceId
        ? t.deviceId.length > 15
          ? t.deviceId.slice(0, 12) + "..."
          : t.deviceId
        : "Unknown",
      cn0: t?.cn0_total ?? t?.avg_cn0_dbhz ?? 0,
    }));

    const satsChartData = latestTracks.map((t) => {
      let totalSat = 0;
      // Ưu tiên total_sats cho RTCM
      if (t?.total_sats != null && typeof t.total_sats === "number") {
        totalSat = t.total_sats;
      }
      // UBX: tổng num_tracked
      else if (Array.isArray(t?.constellations)) {
        totalSat = t.constellations.reduce(
          (sum, c) => sum + (c?.num_tracked || 0),
          0
        );
      }

      return {
        name: t.deviceId
          ? t.deviceId.length > 15
            ? t.deviceId.slice(0, 12) + "..."
            : t.deviceId
          : "Unknown",
        satellites: totalSat,
      };
    });

    return {
      totalDevices,
      connectedCount,
      avgCn0,
      avgSats,
      cn0ChartData,
      satsChartData,
    };
  }, [devices, latestTracks]);

  const tooltipStyle = {
    backgroundColor: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "8px",
    padding: "12px",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
  };

  const tooltipLabelStyle = { color: "#e5e7eb", fontWeight: "bold" };
  const tooltipItemStyle = { color: "#d1d5db" };

  if (loading && !lastUpdated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-emerald-500 text-xl">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
          GNSS Dashboard
        </h1>

        {/* Cards */}
        <div
          key="stats-cards"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10"
        >
          <MemoizedCard
            label="Tổng thiết bị"
            value={stats.totalDevices}
            colorClass="text-emerald-400"
          />
          <MemoizedCard
            label="Đã kết nối"
            value={stats.connectedCount}
            colorClass="text-cyan-400"
          />
          <MemoizedCard
            label="CN₀ TB"
            value={`${stats.avgCn0} dB-Hz`}
            colorClass="text-purple-400"
          />
          <MemoizedCard
            label="Vệ tinh TB"
            value={stats.avgSats}
            colorClass="text-orange-400"
          />
        </div>

        {/* Biểu đồ */}
        <div
          key="charts-container"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* CN0 Chart */}
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-emerald-400 mb-6 text-center">
              CN₀ Trung Bình Theo Thiết Bị
            </h3>
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.cn0ChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 90 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    angle={0}
                    textAnchor="middle"
                    height={90}
                    stroke="#06B6D4"
                    tick={{ fill: "#06B6D4", fontSize: 12, fontWeight: "bold" }}
                    tickLine={{ stroke: "#06B6D4" }}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                    cursor={{ fill: "transparent" }}
                  />
                  <Legend wrapperStyle={{ color: "#fff" }} />
                  <Bar
                    dataKey="cn0"
                    fill="#10B981"
                    name="CN₀ (dB-Hz)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Satellites Chart */}
          <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-cyan-400 mb-6 text-center">
              Số Lượng Vệ Tinh Theo Thiết Bị
            </h3>
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.satsChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 90 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    angle={0}
                    textAnchor="middle"
                    height={90}
                    stroke="#F97316"
                    tick={{ fill: "#F97316", fontSize: 12, fontWeight: "bold" }}
                    tickLine={{ stroke: "#F97316" }}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                    cursor={{ fill: "transparent" }}
                  />
                  <Legend wrapperStyle={{ color: "#fff" }} />
                  <Bar
                    dataKey="satellites"
                    fill="#06B6D4"
                    name="Số vệ tinh"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-zinc-500 text-sm">
          Cập nhật lần cuối:{" "}
          {lastUpdated ? lastUpdated.toLocaleString("vi-VN") : "Đang tải..."}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
