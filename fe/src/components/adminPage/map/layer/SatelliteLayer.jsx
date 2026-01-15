import React, { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const SatelliteLayer = ({ tracks, highlightedDevice }) => {
  if (!tracks || !Array.isArray(tracks) || tracks.length === 0) return null;

  const markerRefs = useRef({});

  // Tự động mở popup khi thiết bị được highlight
  useEffect(() => {
    if (!highlightedDevice) return;

    const openPopupWithRetry = () => {
      const marker = markerRefs.current[highlightedDevice];
      if (marker && marker.isPopupOpen && marker.isPopupOpen()) return;
      if (marker && typeof marker.openPopup === "function") {
        marker.openPopup();
      } else {
        setTimeout(openPopupWithRetry, 100);
      }
    };

    openPopupWithRetry();
  }, [highlightedDevice]);

  // Icon cố định: pin map màu xanh cho mọi trạng thái
  const fixedIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const formatDate = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "-");

  // Trạng thái số lượng vệ tinh (chỉ dùng để hiển thị trong popup, không ảnh hưởng icon)
  const satStatus = (used) => {
    if (used === null || used === undefined) return "No Data";
    if (used >= 12) return "Excellent";
    if (used >= 8) return "Good";
    if (used >= 5) return "Moderate";
    return "Poor";
  };

  return (
    <>
      {tracks.map((track) => {
        if (!track.location || !track.deviceId) return null;

        const deviceId = track.deviceId;
        const lastSeen = track.timestamp ?? null;

        const constellations = Array.isArray(track.constellations)
          ? track.constellations
          : [];

        // Tính tổng vệ tinh quan sát được (observed)
        const totalObserved = constellations.reduce(
          (sum, c) => sum + (Number(c.num_tracked) || 0),
          0
        );

        // Tính tổng vệ tinh đang sử dụng (used)
        const totalUsedFromConst = constellations.reduce(
          (sum, c) => sum + (Number(c.num_used) || 0),
          0
        );
        const totalUsed =
          Number(track.num_sats_used) || totalUsedFromConst || 0;

        const status = satStatus(totalUsed);
        // Dùng icon xanh cố định cho mọi trường hợp
        const icon = fixedIcon;

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
              minWidth={320}
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

                {/* Tổng quan số vệ tinh */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">
                        Vệ tinh đang sử dụng
                      </div>
                      <div className="font-bold text-4xl text-cyan-400 mt-1">
                        {totalUsed}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-2 ${
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
                      <div className="text-xs text-gray-400">
                        Quan sát được:{" "}
                        <span className="text-white font-bold text-lg">
                          {totalObserved}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chi tiết theo từng hệ thống */}
                <div className="text-xs text-gray-300 font-medium mb-3">
                  Chi tiết theo hệ thống vệ tinh
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {constellations.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      Không có dữ liệu hệ thống vệ tinh
                    </div>
                  ) : (
                    constellations.map((c, i) => {
                      const used = Number(c.num_used) || 0;
                      const tracked = Number(c.num_tracked) || 0;
                      return (
                        <div
                          key={i}
                          className="flex justify-between items-center px-4 py-3 bg-[#1a1f2a]/60 rounded-lg"
                        >
                          <span className="font-medium text-gray-200">
                            {c.name || "Unknown"}
                          </span>
                          <div className="text-right">
                            <div className="text-cyan-300 font-bold">
                              {used} sử dụng
                            </div>
                            <div className="text-gray-400 text-xs">
                              {tracked} quan sát
                            </div>
                          </div>
                        </div>
                      );
                    })
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

export default SatelliteLayer;
