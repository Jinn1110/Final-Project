import React, { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const RTCMSatellitesLayer = ({ tracks, highlightedDevice }) => {
  if (!tracks || !Array.isArray(tracks) || tracks.length === 0) return null;

  const markerRefs = useRef({});

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

  const fixedIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const satelliteStatus = (total) => {
    if (total == null) return "No Data";
    if (total >= 12) return "Excellent";
    if (total >= 9) return "Good";
    if (total >= 6) return "Moderate";
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

        const totalSats = track.total_sats ?? null;
        const constellations = Array.isArray(track.constellations)
          ? track.constellations
          : [];
        const status = satelliteStatus(totalSats);

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
                    Cập nhật: {formatDate(track.timestamp)}
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-400">
                        Tổng số vệ tinh
                      </div>
                      <div className="font-bold text-3xl text-cyan-400">
                        {totalSats !== null ? totalSats : "N/A"}
                      </div>
                    </div>
                    <div
                      className={`px-4 py-1.5 rounded-full text-sm font-medium ${
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

                <div className="text-xs text-gray-300 font-medium mb-2">
                  Số vệ tinh theo hệ thống
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {constellations.length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-3">
                      Không có dữ liệu
                    </div>
                  ) : (
                    constellations.map((c, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center px-3 py-2 bg-[#1a1f2a]/50 rounded text-sm"
                      >
                        <span className="font-medium">
                          {c.constellation || "Unknown"}
                        </span>
                        <span className="text-cyan-300 font-bold">
                          {c.num_sats ?? "-"}
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

export default RTCMSatellitesLayer;
