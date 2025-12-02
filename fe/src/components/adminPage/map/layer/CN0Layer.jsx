import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const CN0Layer = ({ tracks }) => {
  if (!tracks || !tracks.location) return null;

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

  const deviceId = tracks.device_id || tracks.id || "Unknown device";
  const cn0Total = tracks.cn0_total ?? tracks.cn0 ?? null;
  const lastSeen = tracks.timestamp ? new Date(tracks.timestamp) : null;

  const formatDate = (d) => {
    if (!d) return "-";
    return d.toLocaleString();
  };

  const constellations = Array.isArray(tracks.constellations)
    ? tracks.constellations
    : [];

  const cn0Status = (cn0) => {
    if (cn0 === null || cn0 === undefined) return "No Data";
    if (cn0 >= 30) return "Excellent";
    if (cn0 >= 25) return "Good";
    if (cn0 >= 20) return "Moderate";
    return "Poor";
  };

  const status = cn0Status(cn0Total);
  const icon = getIconByStatus(status);

  return (
    <Marker
      key={deviceId}
      position={[tracks.location.latitude, tracks.location.longitude]}
      icon={icon}
    >
      <Popup closeButton={false} minWidth={260}>
        <div className="p-3 w-[260px] font-sans text-sm text-white rounded-lg shadow-lg">
          <div className="mb-2">
            <div className="font-semibold truncate">{deviceId}</div>
            <div className="text-xs text-gray-400 mt-1">
              Last seen: {formatDate(lastSeen)}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-gray-400">CN0 Average</div>
                <div className="font-semibold text-lg">{cn0Total ?? "N/A"}</div>
              </div>
              <div>
                <div
                  className={`text-xs px-2 py-1 rounded ${
                    status === "Excellent"
                      ? "bg-green-600"
                      : status === "Good"
                      ? "bg-teal-600"
                      : status === "Moderate"
                      ? "bg-amber-600"
                      : status === "Poor"
                      ? "bg-red-600"
                      : "bg-gray-600"
                  }`}
                >
                  {status}
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500">Carrier-to-Noise Ratio</div>

          <div className="mb-1 text-xs text-gray-400 mt-3">
            Per-constellation CN0
          </div>
          <div className="flex flex-col gap-2">
            {constellations.length === 0 && (
              <div className="text-xs text-gray-500">No constellation data</div>
            )}
            {constellations.map((c, idx) => (
              <div
                key={c._id || c.name || idx}
                className="px-2 py-1 bg-[#111518] rounded text-xs flex justify-between items-center"
              >
                <div className="text-gray-300 font-medium">{c.name}</div>
                <div className="text-gray-400">{c.cn0 ?? "-"} dB-Hz</div>
              </div>
            ))}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default CN0Layer;
