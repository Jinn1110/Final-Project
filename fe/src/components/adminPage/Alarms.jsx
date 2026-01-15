"use client";

import React, { useState, useEffect } from "react";
import warningApi from "../../api/warningApi";

const AlertIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19H3.5L12 5.5z" />
    <circle cx="12" cy="16" r="1.5" />
    <path d="M12 9v5" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ReloadIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const ITEMS_PER_PAGE = 5;

export default function Alarms() {
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [error, setError] = useState(null);

  const [deviceFilter, setDeviceFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const fetchAlarms = async (isReload = false) => {
    try {
      if (isReload) setIsReloading(true);
      else setLoading(true);
      setError(null);

      const response = await warningApi.getAll();

      const mapped = response.data.map((item) => ({
        _id: item._id,
        device_id: item.deviceId,
        type: item.type,
        displayType: item.type.charAt(0).toUpperCase() + item.type.slice(1),
        message: `${item.type.toUpperCase()} detected on device ${
          item.deviceId
        }`,
        timestamp: new Date(item.createdAt).getTime(),
        imageUrl: item.imageUrl || null,
      }));

      setAlarms(mapped);
    } catch (err) {
      console.error("Failed to fetch alarms:", err);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      if (isReload) setIsReloading(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, []);

  const totalPages = Math.ceil(alarms.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const currentAlarms = alarms.slice(start, end);

  const filtered = currentAlarms.filter((a) => {
    const matchDevice = a.device_id
      .toLowerCase()
      .includes(deviceFilter.toLowerCase());
    const matchType = typeFilter ? a.type === typeFilter : true;
    return matchDevice && matchType;
  });

  const formatTime = (ts) => {
    const date = new Date(ts);
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60000) return "Vừa xong";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    return date.toLocaleString("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getTypeStyle = (type) => {
    if (type === "spoofing")
      return "bg-red-950/50 text-red-300 border-red-700/60";
    if (type === "jamming")
      return "bg-amber-950/50 text-amber-300 border-amber-700/60";
    return "bg-zinc-800/50 text-zinc-300 border-zinc-700/60";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-400 animate-pulse">
          <AlertIcon className="w-6 h-6" />
          <span className="text-lg font-medium">Đang tải cảnh báo...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-400 text-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertIcon className="w-8 h-8 text-red-500 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight">GNSS Alarms</h1>
          </div>
          <div className="bg-zinc-900/70 border border-zinc-700 rounded-xl px-4 py-2 text-sm">
            <span className="text-zinc-400">Tổng số: </span>
            <span className="font-semibold text-emerald-400">
              {alarms.length}
            </span>
          </div>
        </div>
      </header>

      {selected ? (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <button
            onClick={() => setSelected(null)}
            className="mb-10 text-emerald-400 hover:text-emerald-300 flex items-center gap-2 text-sm font-medium transition-all duration-200 group"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Quay lại danh sách
          </button>

          <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/50 backdrop-blur-2xl rounded-3xl border border-zinc-800/80 shadow-2xl overflow-hidden">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-red-900/20 via-zinc-900 to-zinc-900 px-8 py-10 border-b border-zinc-800/60">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <AlertIcon className="w-20 h-20 text-red-500 drop-shadow-2xl animate-pulse" />
                    <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full animate-ping"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 tracking-tight">
                    {selected.device_id}
                  </h1>
                  <p className="mt-2 text-zinc-400 text-lg font-medium">
                    {formatTime(selected.timestamp)}
                  </p>
                </div>
                <div
                  className={`px-6 py-2.5 rounded-full text-sm font-bold tracking-wider border ${getTypeStyle(
                    selected.type
                  )}`}
                >
                  {selected.displayType.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 sm:p-10 space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50">
                <div>
                  <p className="text-zinc-500 text-sm uppercase tracking-wider font-medium">
                    Thiết bị
                  </p>
                  <p className="mt-2 text-xl font-mono text-emerald-400">
                    {selected.device_id}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm uppercase tracking-wider font-medium">
                    Loại tấn công
                  </p>
                  <p className="mt-2 text-xl font-semibold text-zinc-100">
                    {selected.displayType}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm uppercase tracking-wider font-medium">
                    Thời gian phát hiện
                  </p>
                  <p className="mt-2 text-xl text-zinc-300">
                    {new Date(selected.timestamp).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              <div className="bg-zinc-900/60 rounded-2xl p-6 border border-zinc-800/40">
                <p className="text-zinc-400 text-sm uppercase tracking-wider font-medium mb-3">
                  Mô tả sự kiện
                </p>
                <p className="text-zinc-100 text-lg leading-relaxed">
                  {selected.message}
                </p>
              </div>

              {selected.imageUrl && (
                <div>
                  <p className="text-zinc-400 text-sm uppercase tracking-wider font-medium mb-5">
                    Hình ảnh bằng chứng
                  </p>
                  <div className="group relative rounded-2xl overflow-hidden border border-zinc-700/70 shadow-2xl hover:shadow-red-900/20 transition-all duration-500">
                    <img
                      src={selected.imageUrl}
                      alt="GNSS Warning Evidence"
                      className="w-full h-auto object-contain max-h-96 sm:max-h-[600px] bg-black/40 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <p className="text-white text-sm font-medium bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg">
                        Nhấn F để xem toàn màn hình
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Filters + Reload */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm Device ID..."
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-600/70 focus:ring-1 focus:ring-emerald-600/30 transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-emerald-600/70 focus:ring-1 focus:ring-emerald-600/30 transition-all"
            >
              <option value="">Tất cả loại</option>
              <option value="jamming">Jamming</option>
              <option value="spoofing">Spoofing</option>
            </select>

            <button
              onClick={() => fetchAlarms(true)}
              disabled={isReloading}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium transition-all ${
                isReloading
                  ? "bg-zinc-800 text-zinc-500 cursor-wait"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              }`}
            >
              <ReloadIcon
                className={`w-5 h-5 ${isReloading ? "animate-spin" : ""}`}
              />
              Làm mới
            </button>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800/80 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800/50 text-sm text-zinc-400 bg-zinc-950/30">
              Hiển thị{" "}
              {filtered.length > 0
                ? `${start + 1}–${Math.min(end, alarms.length)} / `
                : ""}
              {alarms.length} cảnh báo
            </div>

            {filtered.length === 0 ? (
              <div className="py-20 text-center text-zinc-500 text-lg">
                Không tìm thấy cảnh báo phù hợp
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="text-left text-zinc-400 text-sm border-b border-zinc-800/70 bg-zinc-950/20">
                      <th className="px-6 py-4 font-medium">Device ID</th>
                      <th className="px-6 py-4 font-medium">Loại</th>
                      <th className="px-6 py-4 font-medium">Thời gian</th>
                      <th className="px-6 py-4 font-medium text-right pr-10">
                        Chi tiết
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr
                        key={a._id}
                        onClick={() => setSelected(a)}
                        className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 font-mono text-emerald-400/90 group-hover:text-emerald-300">
                          {a.device_id}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium border ${getTypeStyle(
                              a.type
                            )}`}
                          >
                            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                            {a.displayType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400 text-sm">
                          {formatTime(a.timestamp)}
                        </td>
                        <td className="px-6 py-4 text-right pr-10">
                          <span className="text-emerald-400/80 group-hover:text-emerald-300 font-medium text-sm transition-colors">
                            Xem →
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="px-6 py-5 border-t border-zinc-800/50 bg-zinc-950/20 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page === 1
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  }`}
                >
                  Trước
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === i + 1
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page === totalPages
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  }`}
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
