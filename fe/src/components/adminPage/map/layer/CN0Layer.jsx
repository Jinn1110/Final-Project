import React, { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const CN0Layer = ({ tracks, highlightedDevice }) => {
  if (!tracks || !Array.isArray(tracks) || tracks.length === 0) return null;

  const markerRefs = useRef({});

  // Tự động mở popup khi highlightedDevice thay đổi
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

  // Icon cố định: pin map màu xanh
  const fixedIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const cn0Status = (cn0) => {
    if (cn0 === null || cn0 === undefined) return "No Data";
    if (cn0 >= 30) return "Excellent";
    if (cn0 >= 25) return "Good";
    if (cn0 >= 20) return "Moderate";
    return "Poor";
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleString("vi-VN");
  };

  return (
    <>
      {tracks.map((track) => {
        const deviceId = track.deviceId;
        if (!deviceId || !track.location) return null;

        const cn0Total = track.cn0_total ?? null;
        const lastSeen = track.timestamp ?? null;
        const constellations = Array.isArray(track.constellations)
          ? track.constellations
          : [];

        const status = cn0Status(cn0Total);
        // Sử dụng icon cố định màu xanh cho mọi trạng thái
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
              minWidth={280}
              autoClose={false}
              closeOnClick={false}
            >
              <div className="p-4 font-sans text-sm text-white rounded-lg shadow-2xl bg-[#0f1419]/95 backdrop-blur">
                <div className="mb-3 border-b border-gray-700 pb-2">
                  <div className="font-bold text-lg truncate">{deviceId}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Cập nhật: {formatDate(lastSeen)}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">
                        CN0 Trung bình
                      </div>
                      <div className="font-bold text-2xl text-cyan-400">
                        {cn0Total !== null ? cn0Total.toFixed(1) : "N/A"}
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
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

                <div className="text-xs text-gray-500 mb-3">
                  Tỷ số sóng mang trên nhiễu (Carrier-to-Noise)
                </div>

                <div className="text-xs text-gray-300 font-medium mb-2">
                  CN0 theo từng hệ thống
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {constellations.length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-2">
                      Không có dữ liệu chi tiết
                    </div>
                  ) : (
                    constellations.map((c, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center px-3 py-2 bg-[#1a1f2a]/50 rounded"
                      >
                        <span className="font-medium">
                          {c.name || "Unknown"}
                        </span>
                        <span className="text-gray-300">
                          {c.cn0 !== undefined
                            ? `${c.cn0.toFixed(1)} dB-Hz`
                            : "-"}
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

export default CN0Layer;
