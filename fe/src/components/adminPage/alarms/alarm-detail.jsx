"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ALARM_DETAILS = {
  1: {
    probe: "Bleik2",
    probeId: "0773C66",
    type: "Spoofing",
    severity: 100,
    eventStart: "Sep 23, 2022, 10:55:13",
    eventStop: "Sep 23, 2022, 11:10:22",
    duration: "00:15:09",
    relatedAlarms: [
      { name: "Jamming", icon: "●", color: "text-orange-400" },
      { name: "Low Time Accuracy", icon: "●", color: "text-purple-500" },
    ],
    chartData: [
      { time: "10:55:00", gps: 5, bds: 12, glo: 8, gal: 15 },
      { time: "10:58:00", gps: 8, bds: 18, glo: 22, gal: 28 },
      { time: "11:00:00", gps: 25, bds: 35, glo: 42, gal: 55 },
      { time: "11:02:00", gps: 45, bds: 52, glo: 65, gal: 72 },
      { time: "11:04:00", gps: 58, bds: 65, glo: 72, gal: 78 },
      { time: "11:06:00", gps: 65, bds: 68, glo: 75, gal: 80 },
      { time: "11:08:00", gps: 58, bds: 62, glo: 68, gal: 72 },
      { time: "11:10:22", gps: 12, bds: 18, glo: 22, gal: 25 },
    ],
  },
  5: {
    probe: "Bleik2",
    probeId: "0773C66",
    type: "Spoofing",
    severity: 100,
    eventStart: "Sep 23, 2022, 11:22:16",
    eventStop: "Sep 23, 2022, 11:40:42",
    duration: "00:18:26",
    relatedAlarms: [],
    chartData: [
      { time: "11:22:00", gps: 8, bds: 15, glo: 12, gal: 20 },
      { time: "11:25:00", gps: 15, bds: 28, glo: 32, gal: 42 },
      { time: "11:28:00", gps: 32, bds: 48, glo: 55, gal: 65 },
      { time: "11:31:00", gps: 52, bds: 62, glo: 72, gal: 78 },
      { time: "11:34:00", gps: 65, bds: 72, glo: 80, gal: 85 },
      { time: "11:37:00", gps: 72, bds: 75, glo: 82, gal: 88 },
      { time: "11:40:42", gps: 18, bds: 25, glo: 32, gal: 38 },
    ],
  },
};

export function AlarmDetail({ alarmId, onBack }) {
  const alarm = ALARM_DETAILS[alarmId];

  if (!alarm) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <Button onClick={onBack} variant="ghost" className="text-slate-400">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="text-center text-slate-400 mt-8">Alarm not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-700 p-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-slate-400 hover:text-white mb-4 bg-green-500 hover:bg-green-700 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Alarms
        </Button>

        <div className="grid grid-cols-4 gap-6">
          {/* Probe Status */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              PROBE STATUS
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-500 font-bold text-lg">
                    {alarm.severity}
                  </span>
                </div>
                <span className="text-red-500 font-semibold">{alarm.type}</span>
              </div>
              {alarm.relatedAlarms.map((related) => (
                <div key={related.name} className="flex items-center gap-2">
                  <span className={`${related.color}`}>{related.icon}</span>
                  <span className="text-slate-300 text-sm">{related.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Probe Name */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              PROBE NAME
            </h3>
            <div className="text-white text-lg font-medium">{alarm.probe}</div>
            <div className="text-slate-500 text-sm font-mono">
              {alarm.probeId}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              DURATION
            </h3>
            <div className="text-white text-lg font-mono font-medium">
              {alarm.duration}
            </div>
          </div>

          {/* Event Dates */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                EVENT START
              </h3>
              <p className="text-white text-sm">{alarm.eventStart}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                EVENT STOP
              </h3>
              <p className="text-white text-sm">{alarm.eventStop}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-6">
        <div className=" rounded-lg p-6 border border-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-semibold mb-1">
                Spoofing per GNSS (%)
              </h3>
              <p className="text-slate-400 text-sm">
                Real-time signal anomaly tracking
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs">Learn more</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={alarm.chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
              />
              <XAxis dataKey="time" stroke="#78716c" />
              <YAxis stroke="#78716c" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "0.5rem",
                }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Line
                type="monotone"
                dataKey="gps"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="bds"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="glo"
                stroke="#eab308"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="gal"
                stroke="#ec4899"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="flex gap-6 mt-6 pt-4 border-t border-slate-700">
            {[
              { label: "GPS", color: "bg-cyan-500" },
              { label: "BDS", color: "bg-purple-500" },
              { label: "GLO", color: "bg-yellow-400" },
              { label: "GAL", color: "bg-pink-500" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-slate-400 text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spectrogram Section */}
      <div className="p-6">
        <div className=" rounded-lg p-6 border border-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Spectrogram</h3>
            <div className="flex gap-2 items-center">
              <Button
                size="sm"
                variant="ghost"
                className="bg-green-500 hover:bg-green-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-slate-400 text-sm">
                23 SEP 2022 10:55:22
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="bg-green-500 hover:bg-green-700"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-500 via-yellow-500 to-red-500 h-48 rounded" />

          <div className="flex items-center justify-between mt-4">
            <div className="text-slate-400 text-xs">1 dBm</div>
            <div className="flex items-center gap-4">
              <label className="text-slate-400 text-xs">Power Scale:</label>
              <select className="bg-slate-800 text-slate-300 text-sm border border-slate-700 rounded px-2 py-1">
                <option>-30</option>
                <option>-20</option>
                <option>-10</option>
              </select>
              <label className="text-slate-400 text-xs flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                Autoscale
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
