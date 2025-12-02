import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

const TimeAccuracyLayer = ({ tracks }) => {
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
  const timeAccuracy = tracks.time_accuracy || {};
  const lastSeen = tracks.timestamp ? new Date(tracks.timestamp) : null;

  const formatDate = (d) => {
    if (!d) return "-";
    return d.toLocaleString();
  };

  // Calculate average time accuracy across all constellations
  const timeAccuracyValues = Object.values(timeAccuracy).filter(
    (v) => typeof v === "number"
  );
  const avgTimeAccuracy =
    timeAccuracyValues.length > 0
      ? (
          timeAccuracyValues.reduce((a, b) => a + b, 0) /
          timeAccuracyValues.length
        ).toFixed(0)
      : null;

  const timeAccuracyStatus = (accuracy) => {
    if (accuracy === null || accuracy === undefined) return "No Data";
    const numAccuracy = Number(accuracy);
    if (numAccuracy <= 100000) return "Excellent"; // <= 100 microseconds
    if (numAccuracy <= 500000) return "Good"; // <= 500 microseconds
    if (numAccuracy <= 1000000) return "Moderate"; // <= 1 millisecond
    if (numAccuracy <= 5000000) return "Poor"; // <= 5 milliseconds
    return "Poor";
  };

  const status = timeAccuracyStatus(avgTimeAccuracy);
  const icon = getIconByStatus(status);

  const formatAccuracy = (accuracy) => {
    if (accuracy === null || accuracy === undefined) return "-";
    const num = Number(accuracy);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)} ms`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)} µs`;
    }
    return `${num} ns`;
  };

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
                <div className="text-xs text-gray-400">Time Accuracy Avg</div>
                <div className="font-semibold text-lg">
                  {formatAccuracy(avgTimeAccuracy)}
                </div>
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

          <div className="text-xs text-gray-500 mb-3">
            Time Accuracy per Constellation
          </div>

          <div className="flex flex-col gap-2">
            {Object.keys(timeAccuracy).length === 0 ? (
              <div className="text-xs text-gray-500">No time accuracy data</div>
            ) : (
              Object.entries(timeAccuracy).map(([constellation, accuracy]) => (
                <div
                  key={constellation}
                  className="px-2 py-1 bg-[#111518] rounded text-xs flex justify-between items-center"
                >
                  <div className="text-gray-300 font-medium">
                    {constellation}
                  </div>
                  <div className="text-gray-400">
                    {formatAccuracy(accuracy)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default TimeAccuracyLayer;
