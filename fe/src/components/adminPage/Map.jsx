import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import deviceApi from "../../api/deviceApi";
import MapSideBar from "./map/MapSideBar";

const Map = () => {
  const [devices, setDevices] = useState([]);
  const [openMode, setOpenMode] = useState(false);
  const [openDataSource, setOpenDataSource] = useState(false);
  const [selectedMode, setSelectedMode] = useState("real-time");
  const [selectedDataSource, setSelectedDataSource] = useState("Status");
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await deviceApi.getAll();
        setDevices(res.data);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };
    fetchDevices();
  }, []);

  // Xác định trạng thái dựa trên giá trị
  const getStatus = (value) => {
    if (value >= 75) return { label: "Normal", color: "green" };
    if (value >= 50) return { label: "Warning", color: "yellow" };
    return { label: "Critical", color: "red" };
  };

  // Tạo icon Marker
  const getIcon = (device) => {
    let valueToShow;
    let color;

    switch (selectedDataSource) {
      case "Status": {
        const total = device.total_quality ?? 0;
        const status = getStatus(total);
        valueToShow = status.label;
        color = status.color;
        break;
      }
      case "Total Quality": {
        const total = device.total_quality ?? 0;
        const status = getStatus(total);
        valueToShow = total;
        color = status.color;
        break;
      }
      case "Quality per GNSS": {
        const gps = device.gps_quality ?? 0;
        const gal = device.gal_quality ?? 0;
        const glo = device.glo_quality ?? 0;
        const bds = device.bds_quality ?? 0;
        const avg = Math.round((gps + gal + glo + bds) / 4);
        valueToShow = avg;
        color = getStatus(avg).color;
        break;
      }
      case "Spoofing per GNSS": {
        const spoofStatus = [
          "gps_spoofing",
          "gal_spoofing",
          "glo_spoofing",
          "bds_spoofing",
        ];
        let spoofSum = 0;
        spoofStatus.forEach((key) => {
          spoofSum += device[key] ?? 0;
        });
        const avgSpoof = Math.round(spoofSum / 4);
        valueToShow = avgSpoof;
        color = getStatus(avgSpoof).color;
        break;
      }
      case "CN0 Average": {
        valueToShow = device.cn0 ?? 0;
        color = getStatus(device.cn0 ?? 0).color;
        break;
      }
      case "Number of Satellites per GNSS": {
        valueToShow = device.sats ?? 0;
        color = getStatus(device.sats ?? 0).color;
        break;
      }
      default: {
        valueToShow = device.total_quality ?? 0;
        color = getStatus(valueToShow).color;
      }
    }

    const gradient =
      color === "green"
        ? "linear-gradient(145deg,#4ade80,#16a34a)"
        : color === "yellow"
        ? "linear-gradient(145deg,#facc15,#f59e0b)"
        : "linear-gradient(145deg,#dc2626,#b91c1c)";

    return new L.DivIcon({
      html: `
        <div style="
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background: ${gradient};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: bold;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3), inset 0 -3px 6px rgba(255,255,255,0.3);
          border: 1px solid rgba(255,255,255,0.3);
        ">
          ${valueToShow}
        </div>
      `,
      className: "",
      iconSize: [35, 35],
      iconAnchor: [17, 17],
      popupAnchor: [0, -17],
    });
  };

  return (
    <div className="h-screen relative bg-[#0c0f11]">
      <MapSideBar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        openMode={openMode}
        setOpenMode={setOpenMode}
        openDataSource={openDataSource}
        setOpenDataSource={setOpenDataSource}
        selectedMode={selectedMode}
        setSelectedMode={setSelectedMode}
        selectedDataSource={selectedDataSource}
        setSelectedDataSource={setSelectedDataSource}
        dataSourceList={[
          "Status",
          "Total Quality",
          "Quality per GNSS",
          "Spoofing per GNSS",
          "Jamming per GNSS",
          "Time Accuracy",
          "CN0 Average",
          "Number of Satellites per GNSS",
          "PDOP",
          "TDOP",
        ]}
      />

      <div className="h-screen w-full">
        <MapContainer
          center={[21.0285, 105.8542]}
          zoom={12}
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ZoomControl position="topright" />

          {devices.map(
            (d) =>
              d.latitude &&
              d.longitude && (
                <Marker
                  key={d.device_id}
                  position={[d.latitude, d.longitude]}
                  icon={getIcon(d)}
                >
                  <Popup closeButton={false}>
                    <div className="p-2 w-[240px] font-sans text-sm bg-[#1a1a1a] text-white rounded-lg shadow-lg">
                      <div className="font-semibold truncate mb-1">
                        {d.device_id || "Unknown device"}
                      </div>

                      {/* Status */}
                      {selectedDataSource === "Status" && (
                        <div className="mb-2">
                          <span className="text-xs">Status: </span>
                          <span
                            className={`font-medium text-xs ${
                              getStatus(d.total_quality ?? 0).color === "red"
                                ? "text-red-600"
                                : getStatus(d.total_quality ?? 0).color ===
                                  "yellow"
                                ? "text-yellow-500"
                                : "text-green-400"
                            }`}
                          >
                            {getStatus(d.total_quality ?? 0).label}
                          </span>
                        </div>
                      )}

                      {/* Total Quality */}
                      {selectedDataSource === "Total Quality" && (
                        <div className="mb-2">
                          <span>Total Quality: </span>
                          <span
                            className={`font-medium ${
                              getStatus(d.total_quality ?? 0).color === "red"
                                ? "text-red-600"
                                : getStatus(d.total_quality ?? 0).color ===
                                  "yellow"
                                ? "text-yellow-500"
                                : "text-green-400"
                            }`}
                          >
                            {d.total_quality ?? 0}
                          </span>
                        </div>
                      )}

                      {/* Quality per GNSS */}
                      {selectedDataSource === "Quality per GNSS" && (
                        <div className="mb-2">
                          {["gps", "gal", "glo", "bds"].map((gnss) => {
                            const value = d[`${gnss}_quality`] ?? 0;
                            const color =
                              value >= 75
                                ? "bg-green-500"
                                : value >= 50
                                ? "bg-yellow-500"
                                : "bg-red-600";
                            return (
                              <div
                                key={gnss}
                                className="mb-2 flex items-center gap-1"
                              >
                                <span className="w-10 text-xs text-gray-400">
                                  {gnss.toUpperCase()}:
                                </span>
                                <div className="flex-1 h-2 bg-gray-700 rounded">
                                  <div
                                    className={`${color} h-2 rounded`}
                                    style={{ width: `${value}%` }}
                                  ></div>
                                </div>
                                <span className="w-8 text-xs text-gray-400 text-right">
                                  {value}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Spoofing per GNSS */}
                      {selectedDataSource === "Spoofing per GNSS" && (
                        <div className="mb-2">
                          {["gps", "gal", "glo", "bds"].map((gnss) => {
                            const value = d[`${gnss}_spoofing`] ?? 0;
                            const color =
                              value >= 75
                                ? "bg-red-600"
                                : value >= 50
                                ? "bg-yellow-500"
                                : "bg-green-500";
                            return (
                              <div
                                key={gnss}
                                className="mb-2 flex items-center gap-1"
                              >
                                <span className="w-10 text-xs text-gray-400">
                                  {gnss.toUpperCase()}:
                                </span>
                                <div className="flex-1 h-2 bg-gray-700 rounded">
                                  <div
                                    className={`${color} h-2 rounded`}
                                    style={{ width: `${value}%` }}
                                  ></div>
                                </div>
                                <span className="w-8 text-xs text-gray-400 text-right">
                                  {value}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* CN0 Average */}
                      {selectedDataSource === "CN0 Average" && (
                        <div className="mb-2">
                          <span>CN0 Average: </span>
                          <span
                            className={`font-medium ${
                              getStatus(d.cn0 ?? 0).color === "red"
                                ? "text-red-600"
                                : getStatus(d.cn0 ?? 0).color === "yellow"
                                ? "text-yellow-500"
                                : "text-green-400"
                            }`}
                          >
                            {d.cn0 ?? 0}
                          </span>
                        </div>
                      )}

                      {/* Number of Satellites */}
                      {selectedDataSource ===
                        "Number of Satellites per GNSS" && (
                        <div className="mb-2">
                          <span>Number of Satellites: </span>
                          <span
                            className={`font-medium ${
                              getStatus(d.sats ?? 0).color === "red"
                                ? "text-red-600"
                                : getStatus(d.sats ?? 0).color === "yellow"
                                ? "text-yellow-500"
                                : "text-green-400"
                            }`}
                          >
                            {d.sats ?? 0}
                          </span>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              )
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
