import React, { useEffect, useState, useMemo, useRef } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import trackApi from "../../api/trackApi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const firstLoadRef = useRef(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (firstLoadRef.current) setLoading(true);
        const res = await trackApi.getAllLatest();
        const newData = res.data || [];

        setTracks((prev) => {
          const same =
            prev.length === newData.length &&
            prev.every(
              (p, i) =>
                p &&
                newData[i] &&
                p.deviceId === newData[i].deviceId &&
                p.cn0_total === newData[i].cn0_total &&
                p.dop?.pdop === newData[i]?.dop?.pdop &&
                p.num_sats_used === newData[i].num_sats_used &&
                JSON.stringify(p.rf_status) ===
                  JSON.stringify(newData[i].rf_status)
            );
          return same ? prev : newData;
        });

        setLastUpdated(new Date());
      } catch (err) {
        console.error("Error fetching tracks:", err);
      } finally {
        if (firstLoadRef.current) {
          setLoading(false);
          firstLoadRef.current = false;
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // === Các giá trị tính toán an toàn ===
  const deviceCount = useMemo(() => tracks.length, [tracks]);

  const avgCN0 = useMemo(() => {
    if (!tracks.length) return "0.0";
    const sum = tracks.reduce((acc, t) => acc + (t?.cn0_total || 0), 0);
    return (sum / tracks.length).toFixed(1);
  }, [tracks]);

  const avgPDOP = useMemo(() => {
    if (!tracks.length) return "0.00";
    const sum = tracks.reduce((acc, t) => acc + (t?.dop?.pdop || 0), 0);
    return (sum / tracks.length).toFixed(2);
  }, [tracks]);

  const avgSats = useMemo(() => {
    if (!tracks.length) return 0;
    const sum = tracks.reduce((acc, t) => acc + (t?.num_sats_used || 0), 0);
    return Math.round(sum / tracks.length);
  }, [tracks]);

  const attackedDevices = useMemo(
    () =>
      tracks.filter((t) =>
        t?.rf_status?.some?.((rf) => rf?.jam_indicator > 0.5)
      ).length,
    [tracks]
  );

  const warningDevices = useMemo(
    () =>
      tracks.filter(
        (t) =>
          (t?.cn0_total && t.cn0_total < 35) || (t?.dop?.pdop && t.dop.pdop > 4)
      ).length,
    [tracks]
  );

  const healthyDevices = useMemo(
    () => deviceCount - attackedDevices - warningDevices,
    [deviceCount, attackedDevices, warningDevices]
  );

  const cn0Distribution = useMemo(
    () => ({
      poor: tracks.filter((t) => t?.cn0_total && t.cn0_total < 35).length,
      fair: tracks.filter(
        (t) => t?.cn0_total && t.cn0_total >= 35 && t.cn0_total < 45
      ).length,
      good: tracks.filter((t) => t?.cn0_total && t.cn0_total >= 45).length,
    }),
    [tracks]
  );

  // === Labels an toàn nhất ===
  const deviceLabels = useMemo(
    () =>
      tracks.map((t) =>
        t?.deviceId ? String(t.deviceId).slice(-8) : "Unknown"
      ),
    [tracks]
  );

  // Pie Chart
  const pieData = useMemo(
    () => ({
      labels: ["Bình thường", "Cảnh báo", "Bị tấn công"],
      datasets: [
        {
          data: [healthyDevices, warningDevices, attackedDevices],
          backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
          borderWidth: 0,
          hoverOffset: 10,
        },
      ],
    }),
    [healthyDevices, warningDevices, attackedDevices]
  );

  const pieOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      plugins: { legend: { position: "bottom" } },
    }),
    []
  );

  // Bar Chart
  const barData = useMemo(
    () => ({
      labels: ["Yếu (<35)", "Trung bình (35-45)", "Tốt (>45)"],
      datasets: [
        {
          label: "Thiết bị",
          data: [
            cn0Distribution.poor,
            cn0Distribution.fair,
            cn0Distribution.good,
          ],
          backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
          borderRadius: 6,
        },
      ],
    }),
    [cn0Distribution]
  );

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      plugins: { legend: { display: false } },
    }),
    []
  );

  // Line Chart - an toàn nhất
  const lineData = useMemo(
    () => ({
      labels: deviceLabels,
      datasets: [
        {
          label: "PDOP",
          data: tracks.map((t) => t?.dop?.pdop ?? null),
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "CN0",
          data: tracks.map((t) => t?.cn0_total ?? null),
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.1)",
          tension: 0.4,
          yAxisID: "y1",
        },
      ],
    }),
    [tracks, deviceLabels]
  );

  const lineOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      animation: { duration: 0 },
      plugins: { legend: { labels: { color: "rgb(156 163 175)" } } },
      scales: {
        y: {
          position: "left",
          title: { display: true, text: "PDOP", color: "#8b5cf6" },
          grid: { color: "rgba(55, 65, 81, 0.3)" },
          ticks: { color: "#9ca3af" },
        },
        y1: {
          position: "right",
          title: { display: true, text: "CN0 (dB-Hz)", color: "#06b6d4" },
          grid: { display: false },
          ticks: { color: "#9ca3af" },
        },
        x: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(55, 65, 81, 0.3)" },
        },
      },
    }),
    []
  );

  // === Render ===
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">
            GNSS Monitoring Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg flex items-center gap-3">
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                loading ? "bg-yellow-400 animate-pulse" : "bg-green-400"
              }`}
            />
            <span>
              Cập nhật lúc{" "}
              {lastUpdated
                ? new Date(lastUpdated).toLocaleString("vi-VN")
                : "Chưa cập nhật"}
            </span>
          </p>
        </div>

        {/* Cards tổng quan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {[
            { label: "Tổng thiết bị", value: deviceCount, accent: "cyan" },
            {
              label: "CN0 Trung bình",
              value: `${avgCN0} dB-Hz`,
              accent: "green",
            },
            { label: "PDOP Trung bình", value: avgPDOP, accent: "purple" },
            { label: "Vệ tinh TB", value: avgSats, accent: "blue" },
            {
              label: "Bị tấn công",
              value: attackedDevices,
              accent: attackedDevices > 0 ? "red" : "gray",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br from-${item.accent}-500 to-${item.accent}-600 opacity-10 dark:opacity-20`}
              />
              <p className="relative text-gray-500 dark:text-gray-400 text-sm mb-3">
                {item.label}
              </p>
              <p
                className={`relative text-4xl font-bold ${
                  item.accent === "red"
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Biểu đồ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Pie */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-200">
              Tình trạng hệ thống
            </h2>
            {loading || tracks.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-gray-400">
                {loading ? "Đang tải..." : "Chưa có dữ liệu"}
              </div>
            ) : (
              <div className="h-72">
                <Pie data={pieData} options={pieOptions} />
              </div>
            )}
          </div>

          {/* Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-200">
              Phân bố chất lượng CN0
            </h2>
            {loading || tracks.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-gray-400">
                {loading ? "Đang tải..." : "Chưa có dữ liệu"}
              </div>
            ) : (
              <div className="h-72">
                <Bar data={barData} options={barOptions} />
              </div>
            )}
          </div>

          {/* Line */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-200">
              PDOP & CN0 theo thiết bị
            </h2>
            {loading || tracks.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-gray-400">
                {loading ? "Đang tải..." : "Chưa có dữ liệu"}
              </div>
            ) : (
              <div className="h-72">
                <Line data={lineData} options={lineOptions} />
              </div>
            )}
          </div>
        </div>

        {/* Danh sách cảnh báo */}
        {(attackedDevices > 0 || warningDevices > 0) && (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-red-600 dark:text-red-400">
              🚨 Thiết bị cần chú ý ({attackedDevices + warningDevices})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {tracks
                .filter(
                  (t) =>
                    t &&
                    (t?.rf_status?.some?.((rf) => rf?.jam_indicator > 0.5) ||
                      (t?.cn0_total && t.cn0_total < 35) ||
                      (t?.dop?.pdop && t.dop.pdop > 4))
                )
                .map((t) => (
                  <div
                    key={t?.deviceId || Math.random()}
                    className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700/70 p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                  >
                    <p className="font-bold text-lg text-red-700 dark:text-red-300">
                      {t?.deviceId || "Unknown"}
                    </p>
                    <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                      CN0:{" "}
                      <span className="font-semibold">
                        {t?.cn0_total?.toFixed(1) ?? "N/A"}
                      </span>{" "}
                      | PDOP:{" "}
                      <span className="font-semibold">
                        {t?.dop?.pdop?.toFixed(2) ?? "N/A"}
                      </span>{" "}
                      | Sats:{" "}
                      <span className="font-semibold">
                        {t?.num_sats_used ?? 0}
                      </span>
                    </p>
                    {t?.rf_status?.some?.((rf) => rf?.jam_indicator > 0.5) && (
                      <p className="mt-3 text-red-600 dark:text-red-400 font-bold">
                        ⚠️ Phát hiện nhiễu mạnh (có thể là Jamming)
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
