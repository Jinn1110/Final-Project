"use client";

import React, { useEffect, useRef, useState } from "react";
import Plotly from "plotly.js-dist-min";
import trackApi from "../../../api/trackApi";

const MAX_ROWS = 200;

const SpectrumWaterfall = ({ deviceId, latestTrack }) => {
  const plotRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Xử lý 1 record waterfall
  const processRecord = (record) => {
    if (!record?.waterfall?.length) return null;

    const slice = record.waterfall[0];
    if (!slice?.spectrum?.length) return null;

    const { center, span, resolution = span / slice.spectrum.length } = slice;

    const numBins = slice.spectrum.length;
    const startFreq = (center - span / 2) / 1e6;

    const freqs = Array.from(
      { length: numBins },
      (_, i) => +(startFreq + (i * resolution) / 1e6).toFixed(3)
    );

    const timeLabel = new Date(record.timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return {
      ts: new Date(record.timestamp).getTime(),
      freqs,
      spectrum: slice.spectrum,
      timeLabel,
    };
  };

  // INIT: load lịch sử (CŨ → MỚI)
  useEffect(() => {
    if (!deviceId || isInitialized) return;

    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await trackApi.getLatest(deviceId, MAX_ROWS);
        const records = res?.data ?? [];

        const processed = records
          .map(processRecord)
          .filter(Boolean)
          .sort((a, b) => a.ts - b.ts); // CŨ → MỚI

        if (!processed.length) {
          setError("Không có dữ liệu waterfall");
          setLoading(false);
          return;
        }

        const freqs = processed[0].freqs;
        const z = processed.map((p) => p.spectrum);
        const y = processed.map((p) => p.timeLabel);

        Plotly.newPlot(
          plotRef.current,
          [
            {
              type: "heatmap",
              x: freqs,
              y: y,
              z: z,
              colorscale: "Jet",
              zsmooth: false,
              colorbar: {
                title: "Power (dBm)",
                tickfont: { color: "#e2e8f0" },
                titlefont: { color: "#e2e8f0" },
              },
              hovertemplate:
                "Freq: %{x} MHz<br>Time: %{y}<br>Power: %{z:.1f} dBm<extra></extra>",
            },
          ],
          {
            xaxis: {
              title: "Tần số (MHz)",
              gridcolor: "#334155",
              tickfont: { color: "#e2e8f0" },
              titlefont: { color: "#e2e8f0" },
            },
            yaxis: {
              title: "Thời gian (sớm nhất ở trên)",
              gridcolor: "#334155",
              tickfont: { color: "#e2e8f0" },
              titlefont: { color: "#e2e8f0" },
            },
            paper_bgcolor: "#0f172a",
            plot_bgcolor: "#0f172a",
            height: 800,
            margin: { t: 30, r: 80, b: 60, l: 90 },
          },
          { responsive: true }
        );

        setIsInitialized(true);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Không thể khởi tạo waterfall");
        setLoading(false);
      }
    };

    init();
  }, [deviceId, isInitialized]);

  // REALTIME: thêm dòng mới xuống dưới
  useEffect(() => {
    if (!latestTrack || !isInitialized || !plotRef.current) return;

    const p = processRecord(latestTrack);
    if (!p) return;

    Plotly.extendTraces(
      plotRef.current,
      {
        z: [[p.spectrum]],
        y: [[p.timeLabel]],
      },
      [0],
      MAX_ROWS // tự drop dòng cũ nhất (ở trên)
    );
  }, [latestTrack, isInitialized]);

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-emerald-400 text-lg">Đang tải dữ liệu phổ...</p>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      )}

      <div ref={plotRef} className="w-full h-full" />
    </div>
  );
};

export default SpectrumWaterfall;
