import React, { useState, useEffect } from "react";
import { SettingMapIcon } from "../../icons/SettingMapIcon";
import { ArrowIcon } from "../../icons/ArrowIcon";

const MapSideBar = ({
  showSidebar,
  setShowSidebar,
  openMode,
  setOpenMode,
  openDataSource,
  setOpenDataSource,
  selectedMode,
  setSelectedMode,
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
      {/* Sidebar - overlay lên map */}
      <div
        className={`absolute inset-y-0 left-0 z-[999] flex flex-col bg-[#0f1417] border-r border-[#1f2426] shadow-2xl transition-all duration-300 ease-in-out overflow-hidden
          ${showSidebar ? "w-72" : "w-0"}`}
      >
        <div className="h-full flex flex-col">
          <h2
            className={`px-6 py-5 text-xl font-semibold text-gray-200 border-b border-[#1f2426] transition-opacity duration-300
              ${showSidebar ? "opacity-100" : "opacity-0"}`}
          >
            MAP SETTINGS
          </h2>

          <div
            className={`flex-1 overflow-y-auto px-4 py-4 transition-opacity duration-300
              ${showSidebar ? "opacity-100" : "opacity-0"}`}
          >
            {/* === MODE SECTION === */}
            <div className="mb-4 rounded-xl bg-[#1a1f22] hover:bg-[#22282b] transition-colors">
              <button
                onClick={() => setOpenMode(!openMode)}
                className="w-full flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <SettingMapIcon className="h-5 w-5 text-green-500" />
                  <span className="text-green-500 font-medium text-sm">
                    Mode
                  </span>
                </div>
                <ArrowIcon
                  className={`h-4 w-4 text-green-500 transition-transform duration-200 ${
                    openMode ? "rotate-90" : "-rotate-90"
                  }`}
                />
              </button>

              {openMode && showSidebar && (
                <div className="px-4 pb-4 space-y-1">
                  {[
                    {
                      value: "real-time",
                      label: "Real-time",
                      color: "blue-500",
                    },
                    {
                      value: "historical",
                      label: "Historical",
                      color: "purple-500",
                    },
                    {
                      value: "statistics",
                      label: "Overlimit Statistics",
                      color: "red-600",
                    },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setSelectedMode(mode.value)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${
                          selectedMode === mode.value
                            ? "bg-[#2f3538] text-white"
                            : "text-gray-300 hover:bg-[#2f3538] hover:text-white"
                        }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full bg-${mode.color}`}
                      />
                      <span>{mode.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* === DEVICES SECTION === */}
            <div className="rounded-xl bg-[#1a1f22] hover:bg-[#22282b] transition-colors">
              <button
                onClick={() => setOpenDataSource(!openDataSource)}
                className="w-full flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <SettingMapIcon className="h-5 w-5 text-cyan-400" />
                  <span className="text-green-500 font-medium text-sm">
                    Devices
                  </span>
                </div>
                <ArrowIcon
                  className={`h-4 w-4 text-green-500 transition-transform duration-200 ${
                    openDataSource ? "rotate-90" : "-rotate-90"
                  }`}
                />
              </button>

              {openDataSource && showSidebar && (
                <div className="px-4 pb-4 space-y-2">
                  {deviceList.map((device) => {
                    const id = device?.id ?? device;
                    const label =
                      device?.name ??
                      (typeof device === "string"
                        ? device.replace(/-/g, " ")
                        : id);

                    const isSelected = selectedDevice === id;
                    const isExpanded = expandedDevice === id;

                    return (
                      <div key={id} className="rounded-lg overflow-hidden">
                        <button
                          onClick={() => {
                            setSelectedDevice(id);
                            setExpandedDevice(isExpanded ? null : id);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all
                            ${isSelected ? "text-white" : "text-gray-300"}`}
                        >
                          <span className="font-medium truncate">{label}</span>
                          <div className="flex items-center gap-3">
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-cyan-400" />
                            )}
                            <ArrowIcon
                              className={`h-4 w-4 text-green-500 transition-transform duration-200 ${
                                isExpanded ? "rotate-90" : "-rotate-90"
                              }`}
                            />
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="pl-8 pr-4 pb-2 space-y-1">
                            {(device?.dataSources || []).length > 0 ? (
                              device.dataSources.map((ds) => (
                                <button
                                  key={ds}
                                  onClick={() => {
                                    setSelectedDataSource(ds);
                                    setSelectedDevice(id);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all
                                    ${
                                      selectedDataSource === ds
                                        ? "bg-[#2f3538] text-white"
                                        : "text-gray-400 hover:bg-[#2f3538] hover:text-white"
                                    }`}
                                >
                                  <span className="truncate">
                                    {ds.replace(/-/g, " ")}
                                  </span>
                                  {selectedDataSource === ds && (
                                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="text-xs text-gray-500 py-1">
                                No data sources
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className={`
          absolute top-1/2 -translate-y-1/2 z-[1001]
          flex flex-col items-center justify-center
          w-6 h-32
          bg-[#1a1f22]/95 backdrop-blur-sm
          hover:bg-[#1a1f22]
          text-green-400
          rounded-r-lg
          border border-l-0 border-[#2a2f32]
          shadow-xl
          transition-all duration-300 ease-in-out
          hover:shadow-2xl hover:ring-2 hover:ring-green-500/40
          ${showSidebar ? "left-72" : "left-0"}
        `}
      >
        {/* Mũi tên */}
        <ArrowIcon
          className={`h-5 w-5 transition-transform duration-300 ${
            showSidebar ? "rotate-180" : "rotate-0"
          }`}
        />

        {/* Chữ SETTINGS tách từng chữ, font nhỏ hơn */}
        <div className="flex flex-col items-center leading-none">
          {"SETTINGS".split("").map((letter, index) => (
            <span
              key={index}
              className="text-[8px] font-bold tracking-widest text-green-300"
              style={{ lineHeight: "1.1" }}
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
