import React from "react";
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
  selectedDataSource,
  setSelectedDataSource,
  dataSourceList,
}) => {
  return (
    <>
      <div
        className={`h-screen bg-[#0f1417] border-r border-[#1f2426] shadow-xl select-none flex flex-col transition-all duration-300 overflow-hidden
            absolute top-0 left-0 z-[1000]
            ${showSidebar ? "w-66" : "w-0"}`}
      >
        <h2
          className={`text-gray-200 text-xl font-medium px-4 py-5 border-b border-[#1f2426] transition-opacity duration-300
              ${showSidebar ? "opacity-100" : "opacity-0"}`}
        >
          MAP SETTING
        </h2>

        <div
          className={`flex-1 overflow-y-auto pr-1 transition-opacity duration-300
              ${showSidebar ? "opacity-100" : "opacity-0"}`}
        >
          {/* Mode */}
          <div className="mt-2 mx-2 bg-[#1a1f22] rounded-lg hover:bg-[#22282b] transition-all duration-200">
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer"
              onClick={() => setOpenMode(!openMode)}
            >
              <div className="flex items-center gap-3">
                <SettingMapIcon className="h-5 w-5 text-green-500" />
                <p className="text-green-500 font-medium text-sm">Mode</p>
              </div>
              <ArrowIcon
                className={`h-4 w-4 text-green-500 ${
                  openMode ? "rotate-90" : "rotate-270"
                }`}
              />
            </div>

            {openMode && (
              <div className="px-2 pb-2">
                {["real-time", "historical", "statistics"].map((m) => (
                  <div
                    key={m}
                    onClick={() => setSelectedMode(m)}
                    className={`px-3 py-1.5 rounded cursor-pointer transition-colors flex items-center gap-2 text-sm mb-1
                          ${
                            selectedMode === m
                              ? "bg-[#2f3538] text-white"
                              : "text-gray-300 hover:bg-[#2f3538] hover:text-white"
                          }`}
                  >
                    {m === "real-time" && (
                      <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                    )}
                    {m === "historical" && (
                      <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                    )}
                    {m === "statistics" && (
                      <div className="w-1 h-1 rounded-full bg-red-700"></div>
                    )}
                    {m === "real-time"
                      ? "Real-time"
                      : m === "historical"
                      ? "Historical"
                      : "Overlimit Statistics"}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data Source */}
          <div className="mt-2 mx-2 bg-[#1a1f22] rounded-lg hover:bg-[#22282b] transition-all duration-200 mb-4">
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer"
              onClick={() => setOpenDataSource(!openDataSource)}
            >
              <div className="flex items-center gap-3">
                <SettingMapIcon className="h-5 w-5 text-cyan-400" />
                <p className="text-green-500 font-medium text-sm">
                  Data Source
                </p>
              </div>
              <ArrowIcon
                className={`h-4 w-4 text-green-500 ${
                  openDataSource ? "rotate-90" : "rotate-270"
                }`}
              />
            </div>

            {openDataSource && (
              <div className="px-2 pb-3 space-y-1">
                {dataSourceList.map((ds) => (
                  <div
                    key={ds}
                    onClick={() => setSelectedDataSource(ds)}
                    className={`px-3 py-1.5 rounded cursor-pointer transition-colors flex items-center justify-between text-sm
                          ${
                            selectedDataSource === ds
                              ? "bg-[#2f3538] text-white"
                              : "text-gray-300 hover:bg-[#2f3538] hover:text-white"
                          }`}
                  >
                    <span>{ds.replaceAll("-", " ")}</span>
                    {selectedDataSource === ds && (
                      <div className="w-1 h-1 rounded-full bg-cyan-400"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className={`absolute top-1/2 -translate-y-1/2 z-[1000] bg-[#1a1f22] text-white px-1.5 py-1.5 rounded-r-lg border border-[#2a2f32] hover:bg-[#22282b] transition-all duration-300 flex flex-col items-center justify-center ${
          showSidebar ? "left-66" : "left-0"
        }`}
      >
        <ArrowIcon
          className={`text-green-500 transition-transform duration-300 ${
            showSidebar ? "rotate-0" : "rotate-180"
          }`}
        />
        <div className="flex flex-col items-center text-[7px] tracking-wider">
          {"Map SETTINGS".split("").map((c, i) => (
            <span key={i}>{c === " " ? "\u00A0" : c}</span>
          ))}
        </div>
      </button>
    </>
  );
};

export default MapSideBar;
