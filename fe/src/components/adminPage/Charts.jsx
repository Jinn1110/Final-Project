import React, { useState } from "react";
import ChartPanel from "./chart-panel";
import SpectrumWaterfall from "./charts/spectrum-waterfall";
import LineChartPlaceholder from "./charts/line-chart-placeholder";
import ScatterPlot from "./charts/scatter-plot";
import BarChart from "./charts/bar-chart";

export default function Charts() {
  const [timeRange, setTimeRange] = useState("1h");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="bg-neutral-900 text-white min-h-screen p-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-max">
        {/* Spectrum Waterfall */}
        <ChartPanel
          title="Spectrum Waterfall"
          className="lg:col-span-2 xl:col-span-2 lg:row-span-2"
        >
          <SpectrumWaterfall
            timeRange={timeRange}
            startDate={startDate}
            endDate={endDate}
          />
        </ChartPanel>

        {/* Power in Band per GNSS */}
        <ChartPanel
          title="Power in Band per GNSS (dBm/MHz)"
          className="lg:col-span-2 lg:row-span-2"
        >
          <LineChartPlaceholder
            lines={[
              { dataKey: "gps", stroke: "#06B6D4", name: "GPS" },
              { dataKey: "bds", stroke: "#3B82F6", name: "BDS" },
              { dataKey: "glo", stroke: "#F97316", name: "GLO" },
              { dataKey: "gal", stroke: "#22C55E", name: "GAL" },
            ]}
            height={250}
            timeRange={timeRange}
            startDate={startDate}
            endDate={endDate}
          />
        </ChartPanel>

        {/* Spoofing per GNSS */}
        <ChartPanel title="Spoofing per GNSS (%)" className="lg:col-span-2">
          <LineChartPlaceholder
            lines={[
              { dataKey: "spoofing", stroke: "#DC2626", name: "Spoofing" },
            ]}
            height={150}
            showLabel="GPS + Galileo Spoofing"
            timeRange={timeRange}
            startDate={startDate}
            endDate={endDate}
          />
        </ChartPanel>

        {/* Jamming per GNSS */}
        <ChartPanel title="Jamming per GNSS (%)" className="lg:col-span-2">
          <LineChartPlaceholder
            lines={[{ dataKey: "jamming", stroke: "#F59E0B", name: "Jamming" }]}
            height={150}
            showLabel="Pre-jamming of all GNSS & GLONASS Jamming"
            timeRange={timeRange}
            startDate={startDate}
            endDate={endDate}
          />
        </ChartPanel>

        {/* CND Average */}
        <ChartPanel title="CND Average (dB)" className="lg:col-span-2">
          <LineChartPlaceholder
            lines={[
              { dataKey: "cnd1", stroke: "#06B6D4", name: "CND 1" },
              { dataKey: "cnd2", stroke: "#F97316", name: "CND 2" },
            ]}
            height={150}
            timeRange={timeRange}
            startDate={startDate}
            endDate={endDate}
          />
        </ChartPanel>

        {/* Position Deviation */}
        <ChartPanel
          title="Position Deviation (m)"
          className="lg:col-span-2 lg:row-span-2"
        >
          <ScatterPlot
            timeRange={timeRange}
            startDate={startDate}
            endDate={endDate}
          />
        </ChartPanel>

        {/* Latitude error */}
        <ChartPanel title="Latitude error (m)" className="lg:col-span-1">
          <BarChart
            color="#06B6D4"
            height={150}
            timeRange={timeRange}
            startDate={startDate}
            endDate={endDate}
          />
        </ChartPanel>

        {/* Longitude error */}
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
  );
}
