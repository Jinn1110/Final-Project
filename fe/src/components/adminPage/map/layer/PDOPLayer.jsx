import React, { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const PDOPLayer = ({ tracks, highlightedDevice }) => {
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

  const pdopStatus = (v) => {
    if (v === null || v === undefined)
      return { label: "N/A", color: "bg-gray-600/80" };
    if (v <= 1.0) return { label: "Xuất sắc", color: "bg-green-600/80" };
    if (v <= 2.0) return { label: "Rất tốt", color: "bg-teal-600/80" };
    if (v <= 4.0) return { label: "Tốt", color: "bg-amber-600/80" };
    if (v < 99.0) return { label: "Kém", color: "bg-red-600/80" };
    return { label: "Không fix", color: "bg-gray-700/80" };
  };

  return (
    <>
      {tracks.map((track) => {
        if (!track.location || !track.deviceId) return null;

        const deviceId = track.deviceId;
        const pdop = track.dop?.pdop ?? null;
        const lastSeen = track.timestamp ?? null;
        const numSatsUsed = track.num_sats_used ?? 0;

        const status = pdopStatus(pdop);
        const pdopFormatted = pdop !== null ? pdop.toFixed(2) : "—";

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

                {/* PDOP chính */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">PDOP</div>
                      <div className="font-bold text-4xl text-cyan-400 mt-1">
                        {pdopFormatted}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-block px-4 py-2 rounded-full text-sm font-semibold mb-3 ${status.color}`}
                      >
                        {status.label}
                      </div>
                      <div className="text-xs text-gray-400">
                        Vệ tinh sử dụng:{" "}
                        <span className="text-white font-bold text-lg">
                          {numSatsUsed}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Giải thích */}
                <div className="text-xs text-gray-500 leading-relaxed">
                  <strong>PDOP</strong> (Position Dilution of Precision) đo
                  lường độ loãng hình học của các vệ tinh – ảnh hưởng trực tiếp
                  đến độ chính xác vị trí.
                  <br />
                  <br />
                  <span className="text-green-400">≤1.0:</span> Xuất sắc •{" "}
                  <span className="text-teal-400">≤2.0:</span> Rất tốt •{" "}
                  <span className="text-amber-400">≤4.0:</span> Chấp nhận được •{" "}
                  <span className="text-red-400">&gt;4.0:</span> Kém
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default PDOPLayer;
