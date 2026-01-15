import React, { useEffect, useState, useMemo } from "react";
import deviceApi from "../../api/deviceApi";
import trackApi from "../../api/trackApi";
import SpectrumWaterfall from "./charts/spectrum-waterfall";
import CndAverageChart from "./charts/cnd-average";
import AGCChart from "./charts/agc-chart";
import ScatterPlot from "./charts/scatter-plot";
import BarChart from "./charts/bar-chart";

const GnssIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="3" opacity="0.3" />
    <path
      d="M12 2a10 10 0 0 1 10 10a10 10 0 0 1 -10 10a10 10 0 0 1 -10 -10a10 10 0 0 1 10 -10z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

const ITEMS_PER_PAGE = 8;

export default function Charts() {
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [filter, setFilter] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [timeRange, setTimeRange] = useState("1h");
  const [startDate, setStartDate] = useState(""); // datetime-local value (giờ VN)
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const timePresets = [
    { key: "15min", label: "15 phút" },
    { key: "1h", label: "1 giờ" },
    { key: "6h", label: "6 giờ" },
    { key: "24h", label: "24 giờ" },
    { key: "7d", label: "7 ngày" },
  ];

  // Cập nhật thời gian hiện tại mỗi giây khi modal mở
  useEffect(() => {
    if (!showModal) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [showModal]);

  // Hiển thị thời gian đúng giờ Việt Nam (UTC+7)
  const formatDisplayTime = (isoString) => {
    if (!isoString) return "—";

    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Thời gian gửi API: luôn là UTC ISO full (backend mong nhận UTC)
  const timeFilterForApi = useMemo(() => {
    if (startDate && endDate) {
      // Người dùng chọn giờ Việt Nam → chuyển sang UTC cho API
      return {
        start: new Date(startDate).toISOString(),
        end: new Date(endDate).toISOString(),
      };
    }

    // Preset: tính từ giờ hiện tại (giờ Việt Nam)
    const now = new Date();
    let start = new Date(now);

    switch (timeRange) {
      case "15min":
        start.setMinutes(now.getMinutes() - 15);
        break;
      case "1h":
        start.setHours(now.getHours() - 1);
        break;
      case "6h":
        start.setHours(now.getHours() - 6);
        break;
      case "24h":
        start.setDate(now.getDate() - 1);
        break;
      case "7d":
        start.setDate(now.getDate() - 7);
        break;
      default:
        start.setHours(now.getHours() - 1);
    }

    return {
      start: start.toISOString(),
      end: now.toISOString(),
    };
  }, [timeRange, startDate, endDate]);

  const isCustom = !!startDate && !!endDate;

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setStartDate("");
    setEndDate("");
  };

  // Load danh sách thiết bị
  useEffect(() => {
    const loadDevices = async () => {
      try {
        setLoadingDevices(true);
        const res = await deviceApi.getActive();
        const list = res?.data?.data ?? res?.data ?? [];
        setDevices(list);
        setFilteredDevices(list);
      } catch (err) {
        console.error("Failed to load devices:", err);
        alert("Không thể tải danh sách thiết bị.");
        setDevices([]);
        setFilteredDevices([]);
      } finally {
        setLoadingDevices(false);
      }
    };
    loadDevices();
  }, []);

  // Tìm kiếm
  useEffect(() => {
    const filtered = devices.filter((d) =>
      (d.deviceId || d._id || "")
        .toString()
        .toLowerCase()
        .includes(filter.toLowerCase())
    );
    setFilteredDevices(filtered);
    setCurrentPage(1);
  }, [devices, filter]);

  // Pagination
  const totalPages = Math.ceil(filteredDevices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredDevices.length
  );
  const currentDevices = filteredDevices.slice(startIndex, endIndex);

  const goToPage = (page) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)));

  const openCharts = (deviceId) => {
    setSelectedDevice(deviceId);
    setShowModal(true);
    setTimeRange("1h");
    setStartDate("");
    setEndDate("");
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDevice(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">
          <GnssIcon className="w-8 h-8 text-emerald-500" />
          <h1 className="text-2xl font-semibold tracking-tight">Charts GNSS</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <GnssIcon className="w-6 h-6 text-emerald-500" />
              Danh Sách Thiết Bị ({filteredDevices.length})
            </h2>
            <input
              type="text"
              placeholder="Tìm kiếm Device ID..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="mt-4 w-full max-w-md bg-zinc-800/70 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {loadingDevices ? (
            <div className="text-center py-20 text-zinc-600">
              Đang tải danh sách thiết bị...
            </div>
          ) : currentDevices.length === 0 ? (
            <div className="text-center py-20 text-zinc-600 text-lg">
              {filter ? "Không tìm thấy thiết bị nào" : "Chưa có thiết bị nào"}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-zinc-500 text-sm border-b border-zinc-800">
                      <th className="px-6 py-4 font-medium">Device ID</th>
                      <th className="px-6 py-4 font-medium">Chủ Sở Hữu</th>
                      <th className="px-6 py-4 font-medium">
                        Lần Kết Nối Cuối
                      </th>
                      <th className="px-6 py-4 font-medium text-center">
                        Hành Động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDevices.map((device) => {
                      const id = device.deviceId || device._id || device.id;
                      return (
                        <tr
                          key={id}
                          className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-emerald-400 flex items-center gap-3">
                            <GnssIcon className="w-5 h-5 text-emerald-500" />
                            {id}
                          </td>
                          <td className="px-6 py-4 text-zinc-300">
                            {device.owner || "—"}
                          </td>
                          <td className="px-6 py-4 text-zinc-400 text-sm">
                            {device.lastSeen
                              ? formatDisplayTime(device.lastSeen)
                              : "Chưa kết nối"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => openCharts(id)}
                                className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all shadow-lg shadow-emerald-600/20"
                              >
                                Xem Charts
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="p-5 border-t border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-zinc-400">
                    Hiển thị {startIndex + 1}–{endIndex} trong tổng{" "}
                    {filteredDevices.length} thiết bị
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                        currentPage === 1
                          ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                          : "bg-zinc-800 hover:bg-zinc-700 text-white"
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex gap-2">
                      {Array.from(
                        { length: Math.min(7, totalPages) },
                        (_, i) => {
                          let page = i + 1;
                          if (currentPage > 4 && totalPages > 7) {
                            page = currentPage - 3 + i;
                            if (page > totalPages) page = totalPages;
                          }
                          return page <= totalPages ? (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`w-10 h-10 rounded-lg text-sm font-medium ${
                                currentPage === page
                                  ? "bg-emerald-600 text-white shadow-lg"
                                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                              }`}
                            >
                              {page}
                            </button>
                          ) : null;
                        }
                      )}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                          : "bg-zinc-800 hover:bg-zinc-700 text-white"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Charts */}
      {showModal && selectedDevice && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-7xl max-h-[95vh] bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col">
            {/* Header modal */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={closeModal}
                  className="p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition"
                >
                  ← Quay lại
                </button>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <GnssIcon className="w-8 h-8 text-emerald-500" />
                  Charts — {selectedDevice}
                </h2>
              </div>

              {/* Thời gian hiển thị (giờ Việt Nam) */}
              <div className="text-base font-medium text-emerald-400 text-right sm:text-left">
                Từ: <strong>{formatDisplayTime(timeFilterForApi.start)}</strong>{" "}
                → <strong>{formatDisplayTime(timeFilterForApi.end)}</strong>
              </div>
            </div>

            {/* Time filter */}
            <div className="px-6 py-4 bg-zinc-900/40 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex bg-zinc-800 rounded-xl border border-zinc-700 p-1.5 gap-1">
                {timePresets.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleTimeRangeChange(key)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                      timeRange === key && !isCustom
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-zinc-500 text-sm">
                  Tùy chỉnh (giờ VN):
                </span>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setTimeRange("");
                  }}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
                <span className="text-zinc-500">→</span>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setTimeRange("");
                  }}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Charts grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="lg:col-span-2 bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl">
                  <h3 className="text-2xl font-bold text-emerald-400 mb-6">
                    Spectrum Waterfall
                  </h3>
                  <div className="h-96 rounded-xl overflow-hidden bg-black/50">
                    <SpectrumWaterfall
                      deviceId={selectedDevice}
                      startTime={timeFilterForApi.start}
                      endTime={timeFilterForApi.end}
                    />
                  </div>
                </div>

                <div className="lg:col-span-2 bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl">
                  <h3 className="text-2xl font-bold text-emerald-400 mb-6">
                    Position Deviation (Lat/Lon)
                  </h3>
                  <div className="h-145 rounded-xl overflow-hidden bg-black/50">
                    <ScatterPlot
                      deviceId={selectedDevice}
                      startTime={timeFilterForApi.start}
                      endTime={timeFilterForApi.end}
                    />
                  </div>
                </div>

                <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-emerald-400 mb-5">
                    C/N₀ Average (dB-Hz)
                  </h3>
                  <div className="h-80">
                    <CndAverageChart
                      deviceId={selectedDevice}
                      startTime={timeFilterForApi.start}
                      endTime={timeFilterForApi.end}
                    />
                  </div>
                </div>

                <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-emerald-400 mb-5">
                    AGC Level
                  </h3>
                  <div className="h-80">
                    <AGCChart
                      deviceId={selectedDevice}
                      startTime={timeFilterForApi.start}
                      endTime={timeFilterForApi.end}
                    />
                  </div>
                </div>

                <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-cyan-400 mb-5">
                    Latitude Error (m)
                  </h3>
                  <div className="h-72">
                    <BarChart
                      deviceId={selectedDevice}
                      type="latitude"
                      color="#06B6D4"
                      startTime={timeFilterForApi.start}
                      endTime={timeFilterForApi.end}
                    />
                  </div>
                </div>

                <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-orange-400 mb-5">
                    Longitude Error (m)
                  </h3>
                  <div className="h-72">
                    <BarChart
                      deviceId={selectedDevice}
                      type="longitude"
                      color="#F97316"
                      startTime={timeFilterForApi.start}
                      endTime={timeFilterForApi.end}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
