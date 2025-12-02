import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const SatelliteLayer = ({ tracks }) => {
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
  const lastSeen = tracks.timestamp ? new Date(tracks.timestamp) : null;

  const constellations = Array.isArray(tracks.constellations)
    ? tracks.constellations
    : [];

  const totalObserved = constellations.reduce(
    (sum, c) => sum + (Number(c.num_tracked) || 0),
    0
  );
  const totalUsedFromConst = constellations.reduce(
    (sum, c) => sum + (Number(c.num_used) || 0),
    0
  );
  const totalUsed = Number(tracks.num_sats_used) || totalUsedFromConst || 0;

  const formatDate = (d) => {
    if (!d) return "-";
    return d.toLocaleString();
  };

  const satStatus = (used) => {
    if (used === null || used === undefined) return "No Data";
    if (used >= 12) return "Excellent";
    if (used >= 8) return "Good";
    if (used >= 5) return "Moderate";
    return "Poor";
  };

  const status = satStatus(totalUsed);
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
                <div className="text-xs text-gray-400">Satellites Used</div>
                <div className="font-semibold text-lg">{totalUsed}</div>
              </div>
              <div className="flex flex-col items-end">
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
                <div className="text-xs text-gray-400 mt-2">
                  Observed:{" "}
                  <span className="text-white font-medium">
                    {totalObserved}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mb-3">
            Satellite constellation status
          </div>

          <div className="mb-1 text-xs text-gray-400">Per-constellation</div>
          <div className="flex flex-col gap-2">
            {constellations.length === 0 && (
              <div className="text-xs text-gray-500">No constellation data</div>
            )}
            {constellations.map((c, idx) => (
              <div
                key={c._id || c.name || idx}
                className="px-2 py-1 bg-[#111518] rounded text-xs"
                title={`used ${c.num_used ?? 0} | tracked ${
                  c.num_tracked ?? 0
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="text-gray-300 font-medium">{c.name}</div>
                </div>
                <div className="flex gap-4 text-gray-400 text-xs mt-1">
                  <div>
                    Used:{" "}
                    <span className="text-white font-medium">
                      {c.num_used ?? 0}
                    </span>
                  </div>
                  <div>
                    Observed:{" "}
                    <span className="text-white font-medium">
                      {c.num_tracked ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default SatelliteLayer;
