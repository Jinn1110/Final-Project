import React, { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const TimeAccuracyLayer = ({ tracks, highlightedDevice }) => {
  if (!tracks || !Array.isArray(tracks) || tracks.length === 0) return null;

  const markerRefs = useRef({});

  // Tự động mở popup khi thiết bị được highlight
  useEffect(() => {
    if (!highlightedDevice) return;

    const openPopupWithRetry = () => {
      const marker = markerRefs.current[highlightedDevice];
      if (marker && marker.isPopupOpen && marker.isPopupOpen()) return; // Đã mở
      if (marker && typeof marker.openPopup === "function") {
        marker.openPopup();
      } else {
        setTimeout(openPopupWithRetry, 100); // Thử lại nếu marker chưa mount xong
      }
    };

    openPopupWithRetry();
  }, [highlightedDevice]);

  const getIconByStatus = (status) => {
    const iconMap = {
      Excellent:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
      Good: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-teal.png",
      Moderate:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
      Poor: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      "No Data":
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
    };

    return new L.Icon({
      iconUrl: iconMap[status] || iconMap["No Data"],
      shadowUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "-");

  // Đánh giá trạng thái độ chính xác thời gian (nanosecond)
  const timeAccuracyStatus = (accuracy) => {
    if (accuracy === null || accuracy === undefined) return "No Data";
    const ns = Number(accuracy);
    if (ns <= 100000) return "Excellent"; // ≤ 100 µs
    if (ns <= 500000) return "Good"; // ≤ 500 µs
    if (ns <= 1000000) return "Moderate"; // ≤ 1 ms
    return "Poor"; // > 1 ms
  };

  // Định dạng đẹp: ns → µs → ms
  const formatAccuracy = (accuracy) => {
    if (accuracy === null || accuracy === undefined) return "-";
    const ns = Number(accuracy);
    if (ns >= 1000000) return `${(ns / 1000000).toFixed(2)} ms`;
    if (ns >= 1000) return `${Math.round(ns / 1000)} µs`;
    return `${ns} ns`;
  };

  return (
    <>
      {tracks.map((track) => {
        if (!track.location || !track.deviceId) return null;

        const deviceId = track.deviceId; // ← QUAN TRỌNG: dùng đúng key từ API
        const lastSeen = track.timestamp ?? null;
        const timeAccuracy = track.time_accuracy || {};

        // Tính trung bình độ chính xác thời gian (nếu có nhiều hệ thống)
        const values = Object.values(timeAccuracy).filter(
          (v) => typeof v === "number"
        );
        const avgTimeAccuracy =
          values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : null;

        const status = timeAccuracyStatus(avgTimeAccuracy);
        const icon = getIconByStatus(status);

        return (
          <Marker
            key={deviceId}
            position={[track.location.latitude, track.location.longitude]}
            icon={icon}
            ref={(el) => {
              if (el) markerRefs.current[deviceId] = el;
            }}
          >
            <Popup
              closeButton={true}
              minWidth={300}
              autoClose={false}
              closeOnClick={false}
            >
              <div className="p-5 font-sans text-sm text-white rounded-xl shadow-2xl bg-[#0f1419]/95 backdrop-blur-lg">
                {/* Header */}
                <div className="mb-4 border-b border-gray-700 pb-3">
                  <div className="font-bold text-lg truncate">{deviceId}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Cập nhật: {formatDate(lastSeen)}
                  </div>
                </div>

                {/* Average Time Accuracy */}
                <div className="mb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">
                        Độ chính xác thời gian TB
                      </div>
                      <div className="font-bold text-3xl text-cyan-400 mt-1">
                        {avgTimeAccuracy !== null
                          ? formatAccuracy(avgTimeAccuracy)
                          : "N/A"}
                      </div>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        status === "Excellent"
                          ? "bg-green-600/80"
                          : status === "Good"
                          ? "bg-teal-600/80"
                          : status === "Moderate"
                          ? "bg-amber-600/80"
                          : status === "Poor"
                          ? "bg-red-600/80"
                          : "bg-gray-600/80"
                      }`}
                    >
                      {status}
                    </div>
                  </div>
                </div>

                {/* Per Constellation */}
                <div className="text-xs text-gray-300 font-medium mb-3">
                  Độ chính xác theo từng hệ thống
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {Object.keys(timeAccuracy).length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      Không có dữ liệu độ chính xác thời gian
                    </div>
                  ) : (
                    Object.entries(timeAccuracy).map(([system, acc]) => (
                      <div
                        key={system}
                        className="flex justify-between items-center px-4 py-3 bg-[#1a1f2a]/60 rounded-lg"
                      >
                        <span className="font-medium text-gray-200">
                          {system}
                        </span>
                        <span className="font-semibold text-cyan-300">
                          {formatAccuracy(acc)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default TimeAccuracyLayer;
