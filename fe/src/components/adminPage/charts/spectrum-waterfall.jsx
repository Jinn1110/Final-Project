import React, { useEffect, useRef, useState } from "react";
import Plotly from "plotly.js-dist-min";
import trackApi from "../../../api/trackApi";

const SpectrumWaterfall = ({ deviceId, startTime, endTime }) => {
  const plotRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!deviceId || !startTime || !endTime) {
      setLoading(false);
      return;
    }

    const fetchWaterfallData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await trackApi.getHistory(
          deviceId,
          startTime,
          endTime,
          1000
        );
        const records = res?.data?.data ?? res?.data ?? [];

        if (records.length === 0) {
          setError("Không có dữ liệu trong khoảng thời gian này");
          setLoading(false);
          return;
        }

        const waterfallRecords = records
          .filter(
            (r) =>
              r.waterfall &&
              Array.isArray(r.waterfall) &&
              r.waterfall.length > 0
          )
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          .slice(-200);

        if (waterfallRecords.length === 0) {
          setError("Không có dữ liệu waterfall hợp lệ");
          setLoading(false);
          return;
        }

        const config = waterfallRecords[0].waterfall[0];
        const centerFreq = config.center;
        const span = config.span;
        const resolution = config.resolution;
        const numBins = config.spectrum.length;

        const freqs = [];
        const startFreq = (centerFreq - span / 2) / 1e6;
        for (let i = 0; i < numBins; i++) {
          freqs.push(
            parseFloat((startFreq + (i * resolution) / 1e6).toFixed(3))
          );
        }

        const z = [];
        const yLabels = [];

        for (let i = waterfallRecords.length - 1; i >= 0; i--) {
          const record = waterfallRecords[i];
          let spectrum = record.waterfall[0].spectrum;

          if (record.waterfall.length > 1) {
            spectrum = new Array(numBins).fill(0);
            for (const slice of record.waterfall) {
              for (let j = 0; j < numBins; j++) {
                spectrum[j] += slice.spectrum[j];
              }
            }
            for (let j = 0; j < numBins; j++) {
              spectrum[j] /= record.waterfall.length;
            }
          }

          z.push(spectrum);

          const timeVN = new Date(record.timestamp);
          yLabels.push(
            timeVN.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          );
        }

        const allValues = z.flat();
        const zmin = Math.min(...allValues);
        const zmax = Math.max(...allValues);
        const zmid = (zmin + zmax) / 2;

        const data = [
          {
            type: "heatmap",
            x: freqs,
            y: yLabels,
            z: z,
            colorscale: [
              [0.0, "#0f172a"],
              [0.2, "#1e3a8a"],
              [0.4, "#22d3ee"],
              [0.6, "#86efac"],
              [0.8, "#fef08a"],
              [1.0, "#fca5a5"],
            ],
            zmin: zmin,
            zmax: zmax,
            zmid: zmid,
            colorbar: {
              title: "Power (dBm)",
              titleside: "right",
              tickfont: { color: "#e2e8f0" },
              titlefont: { color: "#e2e8f0" },
            },
            hovertemplate:
              "Tần số: %{x} MHz<br>Thời gian: %{y}<br>Power: %{z:.1f} dBm<extra></extra>",
          },
        ];

        const layout = {
          title: {
            text: "",
            font: { color: "#e2e8f0" },
          },
          xaxis: {
            title: "Tần số (MHz)",
            range: [freqs[0], freqs[freqs.length - 1]],
            tickfont: { color: "#e2e8f0" },
            titlefont: { color: "#e2e8f0" },
            gridcolor: "#334155",
          },
          yaxis: {
            title: "Thời gian (mới nhất ở trên)",
            tickfont: { color: "#e2e8f0" },
            titlefont: { color: "#e2e8f0" },
            gridcolor: "#334155",
            autorange: "reversed",
          },
          paper_bgcolor: "#0f172a",
          plot_bgcolor: "#0f172a",
          margin: { t: 40, r: 80, b: 60, l: 100 },
          height: 600,
        };

        Plotly.react(plotRef.current, data, layout, { responsive: true });
        setLoading(false);
      } catch (err) {
        console.error("Error loading waterfall data:", err);
        setError("Không thể tải dữ liệu phổ. Vui lòng thử lại.");
        setLoading(false);
      }
    };

    fetchWaterfallData();
  }, [deviceId, startTime, endTime]);

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-emerald-400 text-lg">Đang tải dữ liệu phổ...</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-red-400 text-lg text-center px-4">{error}</p>
        </div>
      )}

      <div ref={plotRef} className="w-full h-full" />
    </div>
  );
};

export default SpectrumWaterfall;
