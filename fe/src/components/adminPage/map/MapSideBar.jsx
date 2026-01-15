import React, { useEffect, useState } from "react";
import { SettingMapIcon } from "../../icons/SettingMapIcon";
import { ArrowIcon } from "../../icons/ArrowIcon";

const MapSideBar = ({
  showSidebar,
  setShowSidebar,
  selectedDevice,
  setSelectedDevice,
  selectedDataSource,
  setSelectedDataSource,
  deviceList = [],
}) => {
  const [expandedDevice, setExpandedDevice] = useState(null);

  useEffect(() => {
    setExpandedDevice(selectedDevice ?? null);
  }, [selectedDevice]);

  return (
    <>
      {/* Sidebar */}
      <div
        className={`absolute inset-y-0 left-0 z-[999] flex flex-col bg-[#0f1417] border-r border-[#1f2426] shadow-2xl transition-all duration-300 ease-in-out overflow-hidden
          ${showSidebar ? "w-80" : "w-0"}`}
      >
        <div className="h-full flex flex-col">
          <h2
            className={`px-6 py-5 text-xl font-semibold text-gray-200 border-b border-[#1f2426] transition-opacity duration-300
              ${showSidebar ? "opacity-100" : "opacity-0"}`}
          >
            GNSS DEVICES
          </h2>

          <div
            className={`flex-1 overflow-y-auto px-4 py-5 transition-opacity duration-300
              ${showSidebar ? "opacity-100" : "opacity-0"}`}
          >
            {/* Danh sách thiết bị */}
            <div className="space-y-2">
              {deviceList.map((device) => {
                const id = device?.id ?? device;
                const name =
                  device?.name ?? (typeof device === "string" ? device : id);
                const type = device?.type || "Unknown";

                // Phân biệt màu sắc theo loại thiết bị
                const typeColor =
                  type === "UBX"
                    ? "bg-blue-600/70 text-blue-200"
                    : type === "RTCM"
                    ? "bg-purple-600/70 text-purple-200"
                    : "bg-gray-600/70 text-gray-200";

                const typeLabel =
                  type === "UBX" ? "UBX" : type === "RTCM" ? "RTCM" : type;

                const isSelected = selectedDevice === id;
                const isExpanded = expandedDevice === id;

                return (
                  <div
                    key={id}
                    className={`rounded-xl overflow-hidden border ${
                      isSelected
                        ? "border-cyan-500/50 bg-[#1a1f22]"
                        : "border-transparent bg-[#1a1f22]/80"
                    } hover:bg-[#22282b] transition-all`}
                  >
                    {/* Header thiết bị */}
                    <button
                      onClick={() => {
                        setSelectedDevice(id);
                        setExpandedDevice(isExpanded ? null : id);
                      }}
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColor}`}
                        >
                          {typeLabel}
                        </div>
                        <span
                          className={`font-medium truncate ${
                            isSelected ? "text-cyan-300" : "text-gray-200"
                          }`}
                        >
                          {name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                        <ArrowIcon
                          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                            isExpanded ? "rotate-90" : "rotate-270" // ← Đổi chiều: mở rộng = xoay xuống
                          }`}
                        />
                      </div>
                    </button>

                    {/* Danh sách Data Sources */}
                    {isExpanded && (
                      <div className="px-5 pb-4 pt-1 bg-[#0f1419]/50">
                        <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
                          Available Data Sources
                        </div>
                        <div className="space-y-1.5">
                          {(device?.dataSources || []).length > 0 ? (
                            device.dataSources.map((ds) => (
                              <button
                                key={ds}
                                onClick={() => {
                                  setSelectedDataSource(ds);
                                  setSelectedDevice(id);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all
                                  ${
                                    selectedDataSource === ds
                                      ? "bg-cyan-600/20 text-cyan-300 border border-cyan-500/40"
                                      : "text-gray-300 hover:bg-[#2f3538] hover:text-white"
                                  }`}
                              >
                                <span className="truncate font-medium">
                                  {ds}
                                </span>
                                {selectedDataSource === ds && (
                                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                )}
                              </button>
                            ))
                          ) : (
                            <div className="text-xs text-gray-500 text-center py-3">
                              No data sources available
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {deviceList.length === 0 && (
              <div className="text-center text-gray-500 py-10">
                No active GNSS devices found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className={`absolute top-1/2 -translate-y-1/2 z-[1001] flex flex-col items-center justify-center
          w-7 h-40 bg-[#1a1f22]/95 backdrop-blur-sm hover:bg-[#1a1f22] text-cyan-400
          rounded-r-xl border border-l-0 border-[#2a2f32] shadow-xl
          transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-cyan-500/40
          ${showSidebar ? "left-80" : "left-0"}`}
      >
        <ArrowIcon
          className={`h-6 w-6 transition-transform duration-300 ${
            showSidebar ? "rotate-0" : "rotate-180"
          }`}
        />
        <div className="flex flex-col items-center leading-none mt-1">
          {"DEVICES".split("").map((letter, i) => (
            <span
              key={i}
              className="text-[9px] font-bold tracking-widest text-cyan-300"
              style={{ lineHeight: "1.0" }}
            >
              {letter}
            </span>
          ))}
        </div>
      </button>
    </>
  );
};

export default MapSideBar;
