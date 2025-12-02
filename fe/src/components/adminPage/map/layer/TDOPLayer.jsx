import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const TDOPLayer = ({ tracks }) => {
  if (!tracks || !tracks.location) return null;

  const getIconByStatus = (status) => {
    const iconMap = {
      Excellent:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
      Good: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
      Moderate:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
      Poor: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      "No Fix":
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
      "N/A":
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
    };
    return new L.Icon({
      iconUrl: iconMap[status] || iconMap["N/A"],
      shadowUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  };

  const deviceId = tracks.device_id || tracks.id || "Unknown device";
  const tdop = tracks.dop?.tdop ?? null;
  const lastSeen = tracks.timestamp ? new Date(tracks.timestamp) : null;

  const formatDate = (d) => {
    if (!d) return "-";
    return d.toLocaleString();
  };

  const tdopStatus = (v) => {
    if (v === null || v === undefined)
      return { label: "N/A", color: "bg-gray-600" };
    if (v <= 1.0) return { label: "Excellent", color: "bg-green-600" };
    if (v <= 2.0) return { label: "Good", color: "bg-teal-600" };
    if (v <= 4.0) return { label: "Moderate", color: "bg-amber-600" };
    if (v < 99.0) return { label: "Poor", color: "bg-red-600" };
    return { label: "No Fix", color: "bg-gray-700" };
  };

  const loc = tracks.location || {};
  const lat = loc.latitude ?? 21.0045663;
  const lng = loc.longitude ?? 105.8466955;

  const status = tdopStatus(tdop);
  const tdopFormatted =
    tdop !== null && tdop !== undefined ? tdop.toFixed(2) : "—";
  const icon = getIconByStatus(status.label);

  return (
    <Marker key={deviceId} position={[lat, lng]} icon={icon}>
      <Popup closeButton={false} minWidth={240}>
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
                <div className="text-xs text-gray-400">TDOP (Time)</div>
                <div className="font-semibold text-lg">{tdopFormatted}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className={`text-xs px-2 py-1 rounded ${status.color}`}>
                  {status.label}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Used:{" "}
                  <span className="text-white font-medium">
                    {tracks.num_sats_used ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Time Dilution of Precision
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default TDOPLayer;
