// src/components/adminPage/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import deviceApi from "../../api/deviceApi";

Chart.register(...registerables);

const Dashboard = () => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await deviceApi.getAll();
        setDevices(res.data);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };
    fetchDevices();
  }, []);

  // ====== Xử lý dữ liệu cơ bản ======
  const spoofed = devices.filter((d) => d.spoofingStatus === "SPOOFED").length;
  const jammed = devices.filter((d) => d.jammingStatus === "JAMMED").length;
  const warning =
    devices.filter(
      (d) =>
        d.spoofingStatus === "WARNING" ||
        d.jammingStatus === "WARNING" ||
        d.cn0 < 45
    ).length -
    (spoofed + jammed);
  const normal = devices.length - (spoofed + jammed + warning);

  const avgCN0 =
    devices.length > 0
      ? (
          devices.reduce((sum, d) => sum + (d.cn0 || 0), 0) / devices.length
        ).toFixed(2)
      : 0;

  // ====== PIE CHART: Device Status ======
  const pieData = {
    labels: ["Normal", "Warning", "Spoofed/Jammed"],
    datasets: [
      {
        data: [normal, warning, spoofed + jammed],
        backgroundColor: ["#4ade80", "#fcd34d", "#ff4444"],
      },
    ],
  };

  // ====== BAR CHART: CN0 Distribution ======
  const cn0Ranges = ["<35", "35-45", ">45"];
  const cn0Counts = [
    devices.filter((d) => d.cn0 < 35).length,
    devices.filter((d) => d.cn0 >= 35 && d.cn0 < 45).length,
    devices.filter((d) => d.cn0 >= 45).length,
  ];
  const barData = {
    labels: cn0Ranges,
    datasets: [
      {
        label: "CN0 Quality",
        data: cn0Counts,
        backgroundColor: ["#ff4444", "#fcd34d", "#4ade80"],
      },
    ],
  };

  // ====== LINE CHART: CN0 Weekly Trend (dữ liệu thật) ======
  const groupedByDay = {};
  devices.forEach((d) => {
    if (!d.createdAt || d.cn0 == null) return;
    const day = new Date(d.createdAt).toLocaleDateString("en-US", {
      weekday: "short",
    }); // Mon, Tue, Wed...
    if (!groupedByDay[day]) groupedByDay[day] = [];
    groupedByDay[day].push(d.cn0);
  });

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const avgByDay = daysOfWeek.map((day) => {
    const cn0List = groupedByDay[day] || [];
    if (cn0List.length === 0) return 0;
    const sum = cn0List.reduce((a, b) => a + b, 0);
    return (sum / cn0List.length).toFixed(2);
  });

  const lineData = {
    labels: daysOfWeek,
    datasets: [
      {
        label: "Average CN0",
        data: avgByDay,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // ====== Giao diện ======
  return (
    <div className="p-6 min-h-screen text-white bg-gradient-to-br from-[#121212] to-[#1a1a1a]">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          GNSS System Dashboard
        </h1>

        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#1E1E1E] to-[#252525] p-6 rounded-2xl shadow-lg border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Total Devices</p>
            <p className="text-4xl font-bold text-blue-500">{devices.length}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1E1E1E] to-[#252525] p-6 rounded-2xl shadow-lg border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Spoofed</p>
            <p className="text-4xl font-bold text-red-500">{spoofed}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1E1E1E] to-[#252525] p-6 rounded-2xl shadow-lg border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Jammed</p>
            <p className="text-4xl font-bold text-orange-400">{jammed}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1E1E1E] to-[#252525] p-6 rounded-2xl shadow-lg border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Average CN0</p>
            <p className="text-4xl font-bold text-green-400">{avgCN0}</p>
          </div>
        </div>

        {/* Biểu đồ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* PIE CHART */}
          <div className="bg-gradient-to-br from-[#1E1E1E] to-[#252525] p-6 rounded-2xl shadow-lg border border-gray-800">
            <h2 className="text-lg font-semibold mb-6 text-gray-200">
              Device Status Distribution
            </h2>
            <Pie
              data={pieData}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { color: "#9ca3af", padding: 20 },
                  },
                },
              }}
            />
          </div>

          {/* BAR CHART */}
          <div className="bg-gradient-to-br from-[#1E1E1E] to-[#252525] p-6 rounded-2xl shadow-lg border border-gray-800">
            <h2 className="text-lg font-semibold mb-6 text-gray-200">
              CN0 Quality Distribution
            </h2>
            <Bar
              data={barData}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { color: "#9ca3af", padding: 20 },
                  },
                },
                scales: {
                  y: {
                    grid: { color: "#2a2a2a" },
                    ticks: { color: "#9ca3af" },
                  },
                  x: {
                    grid: { color: "#2a2a2a" },
                    ticks: { color: "#9ca3af" },
                  },
                },
              }}
            />
          </div>

          {/* LINE CHART */}
          <div className="bg-gradient-to-br from-[#1E1E1E] to-[#252525] p-6 rounded-2xl shadow-lg border border-gray-800">
            <h2 className="text-lg font-semibold mb-6 text-gray-200">
              CN0 Weekly Trend
            </h2>
            <Line
              data={lineData}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { color: "#9ca3af", padding: 20 },
                  },
                },
                scales: {
                  y: {
                    grid: { color: "#2a2a2a" },
                    ticks: { color: "#9ca3af" },
                  },
                  x: {
                    grid: { color: "#2a2a2a" },
                    ticks: { color: "#9ca3af" },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
