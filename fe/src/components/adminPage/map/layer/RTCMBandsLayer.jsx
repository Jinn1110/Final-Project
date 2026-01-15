import React, { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const RTCMBandsLayer = ({ tracks, highlightedDevice }) => {
  if (!tracks?.length) return null;

  const markerRefs = useRef({});

  useEffect(() => {
    if (!highlightedDevice) return;

    const marker = markerRefs.current[highlightedDevice];
    if (marker && !marker.isPopupOpen()) {
      marker.openPopup();
    }
  }, [highlightedDevice]);

  const fixedIcon = L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const getStatus = (signals) => {
    if (signals == null) return { text: "No Data", color: "gray" };
    if (signals >= 20) return { text: "Excellent", color: "green" };
    if (signals >= 15) return { text: "Good", color: "teal" };
    if (signals >= 10) return { text: "Moderate", color: "amber" };
    return { text: "Poor", color: "red" };
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
      : "-";

  return (
    <>
      {tracks.map((track) => {
        if (!track?.deviceId || !track?.location) return null;

        const {
          deviceId,
          timestamp,
          total_bands,
          total_signals,
          constellations = [],
        } = track;
        const { text: statusText, color: statusColor } =
          getStatus(total_signals);

        return (
          <Marker
            key={deviceId}
            position={[track.location.latitude, track.location.longitude]}
            icon={fixedIcon}
            ref={(el) => el && (markerRefs.current[deviceId] = el)}
          >
            <Popup
              minWidth={300}
              closeButton
              autoClose={false}
              closeOnClick={false}
            >
              <div className="p-3 text-sm text-white bg-[#0f1419]/95 backdrop-blur rounded shadow-lg font-sans">
                {/* Header */}
                <div className="mb-2 pb-2 border-b border-gray-700">
                  <div className="font-bold text-base truncate">{deviceId}</div>
                  <div className="text-xs text-gray-400">
                    Cập nhật: {formatDate(timestamp)}
                  </div>
                </div>

                {/* Tổng quan + Trạng thái */}
                <div className="flex gap-3 mb-3">
                  <div className="flex-1 bg-[#1a1f2a]/60 p-2 rounded text-center">
                    <div className="text-xs text-gray-400">Băng tần</div>
                    <div className="text-xl font-bold text-cyan-400">
                      {total_bands ?? "—"}
                    </div>
                  </div>
                  <div className="flex-1 bg-[#1a1f2a]/60 p-2 rounded text-center">
                    <div className="text-xs text-gray-400">Tín hiệu</div>
                    <div className="text-xl font-bold text-cyan-400">
                      {total_signals ?? "—"}
                    </div>
                  </div>
                  <div
                    className={`self-center px-3 py-1 rounded-full text-xs font-medium bg-${statusColor}-600/80`}
                  >
                    {statusText}
                  </div>
                </div>

                {/* Chi tiết từng hệ thống */}
                <div className="text-xs text-gray-300 font-medium mb-1.5">
                  Chi tiết GNSS
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
                  {constellations.length === 0 ? (
                    <div className="text-gray-500 text-center py-2">
                      Không có dữ liệu
                    </div>
                  ) : (
                    constellations.map((c, i) => (
                      <div key={i} className="bg-[#1a1f2a]/50 p-2 rounded">
                        <div className="flex justify-between font-medium mb-1">
                          <span>{c.constellation || "Unknown"}</span>
                          <span className="text-cyan-300">
                            {c.num_signals ?? "—"} tín hiệu
                          </span>
                        </div>
                        <div className="text-gray-400 mb-1">
                          Vệ tinh: {c.num_sats ?? "—"}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {Object.entries(c.signals_per_band || {}).map(
                            ([band, count]) => (
                              <div
                                key={band}
                                className="bg-[#0f1419]/60 p-1 rounded text-center"
                              >
                                {band}:{" "}
                                <span className="font-bold text-cyan-400">
                                  {count}
                                </span>
                              </div>
                            )
                          )}
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

export default RTCMBandsLayer;
