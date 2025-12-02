import React, { useState, useEffect } from "react";
import ChartPanel from "./chart-panel";
import deviceApi from "../../api/deviceApi";
import SpectrumWaterfall from "./charts/spectrum-waterfall";
import LineChartPlaceholder from "./charts/line-chart-placeholder";
import CndAverageChart from "./charts/cnd-average";
import ScatterPlot from "./charts/scatter-plot";
import BarChart from "./charts/bar-chart";
import AGCChart from "./charts/agc-chart";

export default function Charts() {
  const [timeRange, setTimeRange] = useState("1h");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await deviceApi.getAll();
        const data = res && res.data ? res.data : [];
        if (mounted) setDevices(data);
      } catch (err) {
        console.warn("Failed to load devices", err);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  return (
    <div className="bg-neutral-900 text-white min-h-screen p-6 relative">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <h2 className="text-2xl font-semibold">Charts</h2>
          <div className="flex gap-2">
            {["15min", "1h", "3h"].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-md border text-sm ${
                  timeRange === r
                    ? "bg-teal-600 border-teal-500"
                    : "border-neutral-700 bg-neutral-800 hover:bg-neutral-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-1 text-sm"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-1 text-sm"
          />
        </div>
      </div>

      {/* Charts Grid */}
      {/* Devices table */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Devices</h3>
        <div className="overflow-x-auto bg-neutral-800 border border-neutral-700 rounded">
          <table className="w-full text-sm text-left">
            <thead className="text-neutral-300">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Last Seen</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-neutral-400">
                    No devices found
                  </td>
                </tr>
              )}
              {devices.map((d) => (
                <tr
                  key={d.device_id || d.id || d._id}
                  className="border-t border-neutral-700"
                >
                  <td className="px-4 py-2 align-top">
                    {d.device_id || d._id || d.id}
                  </td>
                  <td className="px-4 py-2 align-top">{d.name || "—"}</td>
                  <td className="px-4 py-2 align-top">
                    {d.last_seen
                      ? new Date(d.last_seen).toLocaleString()
                      : d.timestamp
                      ? new Date(d.timestamp).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-2 align-top">
                    <button
                      onClick={() => {
                        setSelectedDevice(d.device_id || d._id || d.id);
                        setShowModal(true);
                      }}
                      className="px-3 py-1 rounded-md bg-teal-600 border border-teal-500 text-sm"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Grid for selected device */}
      {/* Modal overlay for charts (appears above) */}
      {showModal && selectedDevice && (
        <div className="absolute inset-0 z-50 bg-neutral-900/95 text-white overflow-auto rounded">
          <div className="h-full w-full p-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 rounded-md bg-neutral-800 border border-neutral-700"
              >
                ← Back
              </button>
              <h3 className="text-xl font-semibold">
                Charts — {selectedDevice}
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-max">
              <ChartPanel
                title={`Spectrum Waterfall — ${selectedDevice}`}
                className="lg:col-span-2 xl:col-span-2"
              >
                <SpectrumWaterfall
                  deviceId={selectedDevice}
                  timeRange={timeRange}
                  startDate={startDate}
                  endDate={endDate}
                />
              </ChartPanel>

              <ChartPanel
                title={`CND Average — ${selectedDevice}`}
                className="lg:col-span-2"
              >
                <CndAverageChart
                  deviceId={selectedDevice}
                  limit={100}
                  height={280}
                />
              </ChartPanel>

              <ChartPanel
                title={`AGC — ${selectedDevice}`}
                className="lg:col-span-2"
              >
                <AGCChart deviceId={selectedDevice} limit={100} height={280} />
              </ChartPanel>

              <ChartPanel
                title={`Position Deviation — ${selectedDevice}`}
                className="lg:col-span-2 lg:row-span-2"
              >
                <ScatterPlot
                  deviceId={selectedDevice}
                  timeRange={timeRange}
                  startDate={startDate}
                  endDate={endDate}
                />
              </ChartPanel>

              <ChartPanel title="Latitude error (m)" className="lg:col-span-1">
                <BarChart
                  color="#06B6D4"
                  height={150}
                  timeRange={timeRange}
                  startDate={startDate}
                  endDate={endDate}
                />
              </ChartPanel>

              <ChartPanel title="Longitude error (m)" className="lg:col-span-1">
                <BarChart
                  color="#F97316"
                  height={150}
                  timeRange={timeRange}
                  startDate={startDate}
                  endDate={endDate}
                />
              </ChartPanel>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
