import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  ZoomControl,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import MapSideBar from "./map/MapSideBar";
import trackApi from "../../api/trackApi";
import StatusLayer from "./map/layer/StatusLayer";
import QualityLayer from "./map/layer/QualityLayer";
import QualityPerGNSSLayer from "./map/layer/QualityPerGNSSLayer";
import SpoofingLayer from "./map/layer/SpoofingLayer";
import JammingLayer from "./map/layer/JammingLayer";
import TimeAccuracyLayer from "./map/layer/TimeAccuracyLayer";
import CN0Layer from "./map/layer/CN0Layer";
import SatelliteLayer from "./map/layer/SatelliteLayer";
import PDOPLayer from "./map/layer/PDOPLayer";
import TDOPLayer from "./map/layer/TDOPLayer";

const Map = () => {
  const [tracks, setTracks] = useState([]);
  const [openMode, setOpenMode] = useState(false);
  const [openDataSource, setOpenDataSource] = useState(false);
  const [selectedMode, setSelectedMode] = useState("real-time");
  const [selectedDataSource, setSelectedDataSource] = useState("Status");
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const res = await trackApi.getLatest("GNSS-0001", 100);
        console.log(res.data[0]);
        setTracks(res.data[0]);
      } catch (error) {
        console.error("Error fetching devices:", error);
      }
    };
    fetchTracks();
  }, []);
  console.log(selectedDataSource);

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
          {selectedDataSource === "Status" && <StatusLayer tracks={tracks} />}
          {selectedDataSource === "Total Quality" && (
            <QualityLayer tracks={tracks} />
          )}
          {selectedDataSource === "Quality per GNSS" && (
            <QualityPerGNSSLayer tracks={tracks} />
          )}
          {selectedDataSource === "Spoofing per GNSS" && (
            <SpoofingLayer tracks={tracks} />
          )}
          {selectedDataSource === "Jamming per GNSS" && (
            <JammingLayer tracks={tracks} />
          )}
          {selectedDataSource === "Time Accuracy" && (
            <TimeAccuracyLayer tracks={tracks} />
          )}
          {selectedDataSource === "CN0 Average" && <CN0Layer tracks={tracks} />}
          {selectedDataSource === "Number of Satellites per GNSS" && (
            <SatelliteLayer tracks={tracks} />
          )}
          {selectedDataSource === "PDOP" && <PDOPLayer tracks={tracks} />}
          {selectedDataSource === "TDOP" && <TDOPLayer tracks={tracks} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
