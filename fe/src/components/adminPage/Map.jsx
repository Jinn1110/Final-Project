import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import MapSideBar from "./map/MapSideBar";
import trackApi from "../../api/trackApi";
import SpoofingLayer from "./map/layer/SpoofingLayer";
import JammingLayer from "./map/layer/JammingLayer";
import TimeAccuracyLayer from "./map/layer/TimeAccuracyLayer";
import CN0Layer from "./map/layer/CN0Layer";
import SatelliteLayer from "./map/layer/SatelliteLayer";
import PDOPLayer from "./map/layer/PDOPLayer";
import TDOPLayer from "./map/layer/TDOPLayer";

const MoveMapToDevice = ({ device }) => {
  const map = useMap();
  useEffect(() => {
    if (device && device.location) {
      map.setView([device.location.latitude, device.location.longitude], 14, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [device, map]);
  return null;
};

const Map = () => {
  const [tracks, setTracks] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const [showSidebar, setShowSidebar] = useState(true);
  const [openMode, setOpenMode] = useState(false);
  const [openDataSource, setOpenDataSource] = useState(false);
  const [selectedMode, setSelectedMode] = useState("real-time");
  const [selectedDataSource, setSelectedDataSource] = useState("Time Accuracy");

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await trackApi.getAllLatest();
        console.log(res.data);
        setTracks(res.data || []);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };
    fetchTracks();
    const timer = setInterval(fetchTracks, 3000);
    return () => clearInterval(timer);
  }, []);

  const dataSourceList = [
    "Time Accuracy",
    "CN0 Average",
    "Number of Satellites per GNSS",
    "PDOP",
    "TDOP",
    "Spoofing per GNSS",
    "Jamming per GNSS",
  ];

  const deviceList = tracks.map((t) => ({
    id: t.deviceId,
    name: t.deviceId,
    dataSources: dataSourceList,
  }));

  const handleSelectDevice = (id) => {
    const dev = tracks.find((t) => t.deviceId === id);
    setSelectedDevice(dev || null);
  };

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
        selectedDevice={selectedDevice?.deviceId}
        setSelectedDevice={handleSelectDevice}
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
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ZoomControl position="bottomright" />

          {selectedDevice && <MoveMapToDevice device={selectedDevice} />}

          {/* Mỗi layer thêm prop isActive={true} khi được chọn */}
          {selectedDataSource === "Spoofing per GNSS" && (
            <SpoofingLayer
              tracks={tracks}
              highlightedDevice={selectedDevice?.deviceId}
              isActive={true}
            />
          )}
          {selectedDataSource === "Jamming per GNSS" && (
            <JammingLayer
              tracks={tracks}
              highlightedDevice={selectedDevice?.deviceId}
              isActive={true}
            />
          )}
          {selectedDataSource === "Time Accuracy" && (
            <TimeAccuracyLayer
              tracks={tracks}
              highlightedDevice={selectedDevice?.deviceId}
              isActive={true}
            />
          )}
          {selectedDataSource === "CN0 Average" && (
            <CN0Layer
              tracks={tracks}
              highlightedDevice={selectedDevice?.deviceId}
              isActive={true}
            />
          )}
          {selectedDataSource === "Number of Satellites per GNSS" && (
            <SatelliteLayer
              tracks={tracks}
              highlightedDevice={selectedDevice?.deviceId}
              isActive={true}
            />
          )}
          {selectedDataSource === "PDOP" && (
            <PDOPLayer
              tracks={tracks}
              highlightedDevice={selectedDevice?.deviceId}
              isActive={true}
            />
          )}
          {selectedDataSource === "TDOP" && (
            <TDOPLayer
              tracks={tracks}
              highlightedDevice={selectedDevice?.deviceId}
              isActive={true}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
