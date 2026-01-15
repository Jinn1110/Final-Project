"use client";

import React, { useState } from "react";

// DỮ LIỆU GIẢ TRỰC TIẾP – CHẠY NGAY, KHÔNG CẦN API, KHÔNG CẦN date-fns
const mockAlarms = [
  {
    _id: "a1",
    device_id: "GNSS-001",
    type: "Spoofing Attack",
    status: "CRITICAL",
    message: "Spoofing detected with high confidence",
    timestamp: Date.now() - 300000,
  },
  {
    _id: "a2",
    device_id: "GNSS-002",
    type: "Jamming Signal",
    status: "CRITICAL",
    message: "RF interference level critical",
    timestamp: Date.now() - 900000,
  },
  {
    _id: "a3",
    device_id: "GNSS-003",
    type: "Low C/N₀",
    status: "WARNING",
    message: "Signal quality degraded",
    timestamp: Date.now() - 1800000,
  },
  {
    _id: "a4",
    device_id: "GNSS-004",
    type: "Position Jump",
    status: "WARNING",
    message: "Position deviation > 15m",
    timestamp: Date.now() - 2700000,
  },
  {
    _id: "a5",
    device_id: "GNSS-005",
    type: "Normal",
    status: "NORMAL",
    message: "All systems nominal",
    timestamp: Date.now() - 3600000,
  },
];

const AlertIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19H3.5L12 5.5z" />
    <circle cx="12" cy="16" r="1.5" />
    <path d="M12 9v5" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ITEMS_PER_PAGE = 5;

export default function Alarms() {
  const [alarms] = useState(mockAlarms);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  // Phân trang
  const totalPages = Math.ceil(alarms.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const currentAlarms = alarms.slice(start, end);

  // Lọc
  const filtered = currentAlarms.filter((a) => {
    const matchSearch = a.device_id
      .toLowerCase()
      .includes(filter.toLowerCase());
    const matchStatus = statusFilter ? a.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  // Format thời gian đẹp mà KHÔNG cần date-fns
  const formatTime = (ts) => {
    const date = new Date(ts);
    const now = Date.now();
    const diff = now - ts;

    if (diff < 60000) return "Vừa xong";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    return (
      date.toLocaleDateString("vi-VN") +
      " " +
      date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getColor = (s) => {
    if (s === "CRITICAL") return "text-red-400 bg-red-500/10 border-red-500/30";
    if (s === "WARNING")
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      {/* Header siêu nhỏ gọn */}
      <div className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertIcon className="w-7 h-7 text-red-500 animate-pulse" />
            <h1 className="text-xl font-bold">Alarms</h1>
          </div>
          <div className="flex gap-3 text-xs">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-1.5 text-center">
              <div className="text-zinc-400">Total</div>
              <div className="font-bold text-lg">{alarms.length}</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-1.5 text-center">
              <div className="text-red-400">Critical</div>
              <div className="font-bold text-lg text-red-400">
                {alarms.filter((a) => a.status === "CRITICAL").length}
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-1.5 text-center">
              <div className="text-yellow-400">Warning</div>
              <div className="font-bold text-lg text-yellow-400">
                {alarms.filter((a) => a.status === "WARNING").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selected ? (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => setSelected(null)}
            className="mb-6 text-emerald-400 hover:text-emerald-300 flex items-center gap-2"
          >
            ← Back to List
          </button>
          <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-zinc-800 p-8">
            <div className="flex items-center gap-4 mb-6">
              <AlertIcon className="w-12 h-12 text-red-500 animate-pulse" />
              <div>
                <h2 className="text-2xl font-bold">{selected.device_id}</h2>
                <p className="text-zinc-400">
                  {formatTime(selected.timestamp)}
                </p>
              </div>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-zinc-400">Status:</span>{" "}
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-xs font-bold border ${getColor(
                    selected.status
                  )}`}
                >
                  {selected.status}
                </span>
              </div>
              <div>
                <span className="text-zinc-400">Type:</span>{" "}
                <span className="ml-2 font-medium">{selected.type}</span>
              </div>
              <div>
                <span className="text-zinc-400">Message:</span>{" "}
                <span className="ml-2 font-medium">{selected.message}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Tìm Device ID..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 w-full sm:w-80"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>

          <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-zinc-800 text-sm text-zinc-400">
              Hiển thị {start + 1}–{Math.min(end, alarms.length)} /{" "}
              {alarms.length} alarms
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-left text-zinc-500 text-sm border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4">Device ID</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4 pl-12">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr
                      key={a._id}
                      className="border-b border-zinc-800 hover:bg-zinc-800/50"
                    >
                      <td className="px-6 py-4 font-mono text-emerald-400">
                        {a.device_id}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">{a.type}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getColor(
                            a.status
                          )}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">
                        {formatTime(a.timestamp)}
                      </td>
                      <td className="px-6 py-4 pl-12">
                        <button
                          onClick={() => setSelected(a)}
                          className="text-emerald-400 hover:text-emerald-300 font-medium"
                        >
                          View Details →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-5 border-t border-zinc-800 bg-zinc-900/50 flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    page === 1
                      ? "bg-zinc-800 text-zinc-600"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white"
                  }`}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm ${
                      page === i + 1
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    page === totalPages
                      ? "bg-zinc-800 text-zinc-600"
                      : "bg-zinc-800 hover:bg-zinc-700 text-white"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
