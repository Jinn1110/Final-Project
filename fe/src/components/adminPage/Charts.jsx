"use client";

import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import trackApi from "../../api/trackApi";
import deviceApi from "../../api/deviceApi";
import trackRtcmApi from "../../api/trackRtcmApi";
import SpectrumWaterfall from "./charts/spectrum-waterfall";
import CndAverageChart from "./charts/cnd-average";
import AGCChart from "./charts/agc-chart";
import RTCMCn0Chart from "./charts/RTCMCn0Chart";
import RTCMSatsChart from "./charts/rtcm-sats";
import RTCMSignalsPerBandChart from "./charts/rtcm-signals-per-band";

const SOCKET_URL =
  import.meta.env.VITE_URL_BACKEND || "http://18.142.240.186:3001";

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
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [deviceType, setDeviceType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [latestTrack, setLatestTrack] = useState(null);

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => console.log("Socket.IO connected!"));
    socketRef.current.on("connect_error", (err) =>
      console.error("Socket connect error:", err.message)
    );
    socketRef.current.on("disconnect", (reason) =>
      console.log("Socket disconnected:", reason)
    );

    return () => socketRef.current.disconnect();
  }, []);

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
        setDevices([]);
        setFilteredDevices([]);
      } finally {
        setLoadingDevices(false);
      }
    };
    loadDevices();
  }, []);

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

  const totalPages = Math.ceil(filteredDevices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredDevices.length
  );
  const currentDevices = filteredDevices.slice(startIndex, endIndex);

  const goToPage = (page) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)));

  useEffect(() => {
    if (!showModal || !selectedDevice || !socketRef.current) return;

    const fetchInitial = async () => {
      try {
        let res;
        if (deviceType === "RTCM") {
          res = await trackRtcmApi.getLatest(selectedDevice, 1);
        } else {
          res = await trackApi.getLatest(selectedDevice, 1);
        }
        const data = res?.data?.[0];
        if (data) setLatestTrack(data);
      } catch (err) {
        console.error("Error fetching initial latest track:", err);
      }
    };
    fetchInitial();

    socketRef.current.emit("subscribeDevice", selectedDevice);

    const handleNewTrack = (newTrack) => {
      if (newTrack.deviceId === selectedDevice) {
        console.log(
          "New track received for",
          selectedDevice,
          "at",
          newTrack.timestamp
        );
        setLatestTrack(newTrack);
      }
    };
    socketRef.current.on("newTrack", handleNewTrack);

    return () => {
      socketRef.current.emit("unsubscribeDevice", selectedDevice);
      socketRef.current.off("newTrack", handleNewTrack);
    };
  }, [showModal, selectedDevice, deviceType]);

  const openCharts = (deviceId, type) => {
    setSelectedDevice(deviceId);
    setDeviceType(type);
    setLatestTrack(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDevice(null);
    setDeviceType(null);
    setLatestTrack(null);
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
              <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
              <p className="mt-4">Đang tải danh sách thiết bị...</p>
            </div>
          ) : currentDevices.length === 0 ? (
            <div className="text-center py-20 text-zinc-600 text-lg">
              {filter ? "Không tìm thấy thiết bị nào" : "Chưa có thiết bị nào"}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="text-left text-zinc-500 text-sm border-b border-zinc-800">
                      <th className="px-6 py-4 font-medium">Device ID</th>
                      <th className="px-6 py-4 font-medium">Type</th>
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
                      const type = device.type || "Unknown";
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
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                type === "UBX"
                                  ? "bg-blue-600/70 text-blue-200"
                                  : type === "RTCM"
                                  ? "bg-purple-600/70 text-purple-200"
                                  : "bg-gray-600/70 text-gray-200"
                              }`}
                            >
                              {type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-300">
                            {device.owner || "—"}
                          </td>
                          <td className="px-6 py-4 text-zinc-400 text-sm">
                            {device.lastSeen
                              ? new Date(device.lastSeen).toLocaleString(
                                  "vi-VN",
                                  { timeZone: "Asia/Ho_Chi_Minh" }
                                )
                              : "Chưa kết nối"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => openCharts(id, type)}
                              className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all shadow-lg shadow-emerald-600/20"
                            >
                              Xem Charts
                            </button>
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
            {/* Header */}
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
                  Real-time Charts — {selectedDevice} ({deviceType})
                </h2>
              </div>
            </div>

            {/* Charts */}
            <div className="flex-1 overflow-y-auto p-6">
              {deviceType === "UBX" ? (
                <div className="space-y-12">
                  <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl">
                    <h3 className="text-2xl font-bold text-emerald-400 mb-6 text-center">
                      Spectrum Waterfall (Real-time)
                    </h3>
                    <div className="h-[500px] rounded-xl overflow-hidden bg-black/50">
                      <SpectrumWaterfall
                        deviceId={selectedDevice}
                        latestTrack={latestTrack}
                      />
                    </div>
                  </div>

                  <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl">
                    <h3 className="text-2xl font-bold text-emerald-400 mb-6 text-center">
                      C/N₀ Average (Real-time)
                    </h3>
                    <div className="h-80">
                      <CndAverageChart
                        deviceId={selectedDevice}
                        latestTrack={latestTrack}
                      />
                    </div>
                  </div>

                  <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl">
                    <h3 className="text-2xl font-bold text-emerald-400 mb-6 text-center">
                      AGC Level (Real-time)
                    </h3>
                    <div className="h-80">
                      <AGCChart
                        deviceId={selectedDevice}
                        latestTrack={latestTrack}
                      />
                    </div>
                  </div>
                </div>
              ) : deviceType === "RTCM" ? (
                <div className="space-y-12">
                  <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl">
                    <h3 className="text-2xl font-bold text-emerald-400 mb-6 text-center">
                      RTCM C/N₀ Quality (Real-time)
                    </h3>
                    <div className="h-96">
                      <RTCMCn0Chart
                        deviceId={selectedDevice}
                        latestTrack={latestTrack}
                      />
                    </div>
                  </div>

                  <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl">
                    <h3 className="text-2xl font-bold text-emerald-400 mb-6 text-center">
                      Số lượng vệ tinh theo chòm sao (Real-time)
                    </h3>
                    <div className="h-96">
                      <RTCMSatsChart
                        deviceId={selectedDevice}
                        latestTrack={latestTrack}
                      />
                    </div>
                  </div>

                  <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 p-6 shadow-xl">
                    <h3 className="text-2xl font-bold text-emerald-400 mb-6 text-center">
                      Số tín hiệu theo băng tần (Real-time)
                    </h3>
                    <div className="h-110">
                      <RTCMSignalsPerBandChart
                        deviceId={selectedDevice}
                        latestTrack={latestTrack}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-zinc-400">
                  Loại thiết bị không hỗ trợ chart
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
