import React, { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import MapSideBar from "./map/MapSideBar";
import trackApi from "../../api/trackApi";
import trackRtcmApi from "../../api/trackRtcmApi";
import deviceApi from "../../api/deviceApi";

// UBX layers
import TimeAccuracyLayer from "./map/layer/TimeAccuracyLayer";
import CN0Layer from "./map/layer/CN0Layer";
import SatelliteLayer from "./map/layer/SatelliteLayer";
import PDOPLayer from "./map/layer/PDOPLayer";
import TDOPLayer from "./map/layer/TDOPLayer";

// RTCM layers
import RTCMCN0Layer from "./map/layer/RTCMCN0Layer";
import RTCMSatellitesLayer from "./map/layer/RTCMSatellitesLayer";
import RTCMBandsLayer from "./map/layer/RTCMBandsLayer";

// Di chuyển map chỉ khi vị trí thay đổi đáng kể
const MoveMapToDevice = ({ selectedTrack }) => {
  const map = useMap();
  const prevLatLngRef = useRef(null);

  useEffect(() => {
    if (!selectedTrack?.location) return;

    const { latitude, longitude } = selectedTrack.location;
    const currentLatLng = [latitude, longitude];

    if (
      !prevLatLngRef.current ||
      Math.abs(prevLatLngRef.current[0] - latitude) > 0.0001 ||
      Math.abs(prevLatLngRef.current[1] - longitude) > 0.0001
    ) {
      map.setView(currentLatLng, 14, {
        animate: true,
        duration: 1.2,
      });
      prevLatLngRef.current = currentLatLng;
    }
  }, [
    selectedTrack?.location?.latitude,
    selectedTrack?.location?.longitude,
    map,
  ]);

  return null;
};

const Map = () => {
  const [devices, setDevices] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [selectedDataSource, setSelectedDataSource] = useState("");

  const [showSidebar, setShowSidebar] = useState(true);
  const [openMode, setOpenMode] = useState(false);
  const [openDataSource, setOpenDataSource] = useState(false);
  const [selectedMode, setSelectedMode] = useState("real-time");

  // Fetch danh sách thiết bị
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await deviceApi.getActive();
        const list = res?.data || [];
        setDevices(list);

        // Nếu chưa chọn device nào, tự động chọn cái đầu tiên
        if (list.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(list[0].deviceId);
        }
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    };
    fetchDevices();
  }, []);

  // Polling tracks
  useEffect(() => {
    if (!devices.length) return;

    const fetchAllTracks = async () => {
      try {
        const promises = devices.map(async (device) => {
          try {
            if (device.type === "UBX") {
              const res = await trackApi.getLatest(device.deviceId);
              return res?.data?.[0] ?? null;
            }
            if (device.type === "RTCM") {
              const res = await trackRtcmApi.getLatest(device.deviceId);
              return res?.data?.data?.[0] ?? res?.data?.[0] ?? null;
            }
            return null;
          } catch {
            return null;
          }
        });

        const results = (await Promise.all(promises)).filter(Boolean);

        setTracks((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(results)) {
            return prev;
          }
          return results;
        });
      } catch (err) {
        console.error("Batch fetch tracks failed:", err);
      }
    };

    fetchAllTracks();
    const interval = setInterval(fetchAllTracks, 8000);
    return () => clearInterval(interval);
  }, [devices]);

  // Track đang chọn
  const selectedTrack = useMemo(
    () => tracks.find((t) => t?.deviceId === selectedDeviceId) ?? null,
    [tracks, selectedDeviceId]
  );

  // Device info đang chọn
  const selectedDeviceInfo = useMemo(
    () => devices.find((d) => d.deviceId === selectedDeviceId),
    [devices, selectedDeviceId]
  );

  // Danh sách data source theo loại
  const getDataSourceList = (type) => {
    if (type === "UBX") {
      return [
        "Time Accuracy",
        "CN0 Average",
        "Number of Satellites per GNSS",
        "PDOP",
        "TDOP",
      ];
    }
    if (type === "RTCM") {
      return ["Avg CN0", "Number of Satellites", "Bands & Signals"];
    }
    return [];
  };

  // Danh sách cho sidebar
  const deviceList = useMemo(
    () =>
      devices.map((d) => ({
        id: d.deviceId,
        name: d.deviceId,
        type: d.type,
        dataSources: getDataSourceList(d.type),
      })),
    [devices]
  );

  // Tự động chọn data source phù hợp khi đổi device
  useEffect(() => {
    if (!selectedDeviceInfo) {
      setSelectedDataSource("");
      return;
    }

    const available = getDataSourceList(selectedDeviceInfo.type);
    if (available.length > 0 && !available.includes(selectedDataSource)) {
      setSelectedDataSource(available[0]);
    }
  }, [selectedDeviceId, selectedDeviceInfo]);

  // Layer động + lọc tracks theo type
  const ActiveLayer = React.memo(() => {
    const type = selectedDeviceInfo?.type;

    // Lọc tracks chỉ lấy của loại thiết bị đang chọn
    const filteredTracks = useMemo(() => {
      return tracks.filter((t) => {
        const dev = devices.find((d) => d.deviceId === t?.deviceId);
        return dev?.type === type;
      });
    }, [tracks, devices, type]);

    const commonProps = {
      tracks: filteredTracks,
      highlightedDevice: selectedDeviceId,
      isActive: true,
    };

    if (type === "UBX") {
      switch (selectedDataSource) {
        case "Time Accuracy":
          return <TimeAccuracyLayer {...commonProps} />;
        case "CN0 Average":
          return <CN0Layer {...commonProps} />;
        case "Number of Satellites per GNSS":
          return <SatelliteLayer {...commonProps} />;
        case "PDOP":
          return <PDOPLayer {...commonProps} />;
        case "TDOP":
          return <TDOPLayer {...commonProps} />;
        default:
          return null;
      }
    }

    if (type === "RTCM") {
      switch (selectedDataSource) {
        case "Avg CN0":
          return <RTCMCN0Layer {...commonProps} />;
        case "Number of Satellites":
          return <RTCMSatellitesLayer {...commonProps} />;
        case "Bands & Signals":
          return <RTCMBandsLayer {...commonProps} />;
        default:
          return null;
      }
    }

    return null;
  });

  return (
    <div className="h-screen relative bg-[#0c0f11] overflow-hidden">
      <MapSideBar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        openMode={openMode}
        setOpenMode={setOpenMode}
        openDataSource={openDataSource}
        setOpenDataSource={setOpenDataSource}
        selectedMode={selectedMode}
        setSelectedMode={setSelectedMode}
        selectedDevice={selectedDeviceId}
        setSelectedDevice={setSelectedDeviceId}
        selectedDataSource={selectedDataSource}
        setSelectedDataSource={setSelectedDataSource}
        deviceList={deviceList}
      />

      <div className="h-screen w-full">
        <MapContainer
          center={[21.0285, 105.8542]}
          zoom={12}
          className="w-full h-full"
          zoomControl={false}
          key="main-map-container"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <ZoomControl position="bottomright" />

          {selectedTrack && <MoveMapToDevice selectedTrack={selectedTrack} />}

          <ActiveLayer />
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
