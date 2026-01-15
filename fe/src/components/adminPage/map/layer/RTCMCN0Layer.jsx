import React, { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const RTCMCN0Layer = ({ tracks, highlightedDevice }) => {
  if (!tracks || !Array.isArray(tracks) || tracks.length === 0) return null;

  const markerRefs = useRef({});

  // Tự động mở popup khi highlightedDevice thay đổi
  useEffect(() => {
    if (!highlightedDevice) return;

    const openPopupWithRetry = () => {
      const marker = markerRefs.current[highlightedDevice];
      if (marker?.isPopupOpen?.()) return;
      if (marker && typeof marker.openPopup === "function") {
        marker.openPopup();
      } else {
        setTimeout(openPopupWithRetry, 100);
      }
    };

    openPopupWithRetry();
  }, [highlightedDevice]);

  // Icon cố định màu xanh lá (giống UBX cho nhất quán)
  const fixedIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const cn0Status = (cn0) => {
    if (cn0 == null || cn0 === undefined) return "No Data";
    if (cn0 >= 38) return "Excellent";
    if (cn0 >= 33) return "Good";
    if (cn0 >= 28) return "Moderate";
    return "Poor";
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  return (
    <>
      {tracks.map((track) => {
        const deviceId = track.deviceId;
        if (!deviceId || !track.location) return null;

        const avgCn0 = track.avg_cn0_dbhz ?? null;
        const lastSeen = track.timestamp ?? null;
        const constellations = Array.isArray(track.constellations)
          ? track.constellations
          : [];

        const status = cn0Status(avgCn0);

        return (
          <Marker
            key={deviceId}
            position={[track.location.latitude, track.location.longitude]}
            icon={fixedIcon}
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
              <div className="p-4 font-sans text-sm text-white rounded-lg shadow-2xl bg-[#0f1419]/95 backdrop-blur">
                <div className="mb-3 border-b border-gray-700 pb-2">
                  <div className="font-bold text-lg truncate">{deviceId}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Cập nhật: {formatDate(lastSeen)}
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">
                        CN0 Trung bình tổng
                      </div>
                      <div className="font-bold text-2xl text-cyan-400">
                        {avgCn0 !== null ? avgCn0.toFixed(1) : "N/A"} dB-Hz
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

                {/* Thông tin bổ sung */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div className="bg-[#1a1f2a]/60 p-2 rounded">
                    <div className="text-gray-400">Tổng vệ tinh</div>
                    <div className="font-bold">{track.total_sats ?? "-"}</div>
                  </div>
                  <div className="bg-[#1a1f2a]/60 p-2 rounded">
                    <div className="text-gray-400">Tổng tín hiệu</div>
                    <div className="font-bold">
                      {track.total_signals ?? "-"}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-300 font-medium mb-2">
                  Chi tiết theo hệ thống GNSS
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {constellations.length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-3">
                      Không có dữ liệu chi tiết
                    </div>
                  ) : (
                    constellations.map((c, i) => (
                      <div
                        key={i}
                        className="flex flex-col px-3 py-2 bg-[#1a1f2a]/50 rounded text-xs"
                      >
                        <div className="flex justify-between font-medium mb-1">
                          <span>{c.constellation || "Unknown"}</span>
                          <span className="text-cyan-300">
                            {c.avg_cn0_dbhz != null
                              ? `${c.avg_cn0_dbhz.toFixed(1)} dB-Hz`
                              : "-"}
                          </span>
                        </div>
                        <div className="text-gray-400 text-[11px]">
                          Vệ tinh: {c.num_sats ?? "-"} | Tín hiệu:{" "}
                          {c.num_signals ?? "-"}
                        </div>
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

export default RTCMCN0Layer;
