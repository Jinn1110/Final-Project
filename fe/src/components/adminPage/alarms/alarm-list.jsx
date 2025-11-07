"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Search } from "lucide-react";

const ALARMS = [
  {
    id: "1",
    probe: "Bleik2",
    probeId: "0773C66",
    type: "Jamming",
    eventStart: "Sep 23, 2022 11:53:39",
    eventStop: "Sep 23, 2022 11:55:43",
    duration: "00:02:04",
  },
  {
    id: "2",
    probe: "Bleik",
    probeId: "4C4B61D0",
    type: "Jamming",
    eventStart: "Sep 23, 2022 11:54:00",
    eventStop: "Sep 23, 2022 11:55:28",
    duration: "00:01:28",
  },
  {
    id: "3",
    probe: "In-car probe",
    probeId: "A6A1B3A0",
    type: "Jamming",
    eventStart: "Sep 23, 2022 11:53:52",
    eventStop: "Sep 23, 2022 11:55:24",
    duration: "00:01:32",
  },
  {
    id: "4",
    probe: "Bleik",
    probeId: "4C4B61D0",
    type: "Low Time Accuracy",
    eventStart: "Sep 23, 2022 11:40:53",
    eventStop: "Sep 23, 2022 11:40:54",
    duration: "00:00:01",
  },
  {
    id: "5",
    probe: "Bleik2",
    probeId: "0773C66",
    type: "Spoofing",
    eventStart: "Sep 23, 2022 11:22:16",
    eventStop: "Sep 23, 2022 11:40:42",
    duration: "00:18:26",
  },
];

const getTypeColor = (type) => {
  switch (type) {
    case "Jamming":
      return "text-orange-400";
    case "Spoofing":
      return "text-red-500";
    case "Low Time Accuracy":
      return "text-purple-500";
    default:
      return "text-gray-400";
  }
};

export function AlarmList({ onSelectAlarm }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);

  const filteredAlarms = ALARMS.filter((alarm) => {
    const matchesSearch =
      alarm.probe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alarm.probeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || alarm.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen p-6">
      {/* Filters */}
      <div className="flex gap-4 mb-6 items-center justify-between">
        <input
          placeholder="Filter probes..."
          className="bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-2 w-60 h-13"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <select
            className="bg-neutral-800 border border-neutral-700 rounded w-48 mt-1 p-1 h-13 pr-3"
            value={typeFilter || ""}
            onChange={(e) => setTypeFilter(e.target.value || null)}
          >
            <option
              className="text-white px-2 py-1 rounded hover:bg-neutral-700 cursor-pointer"
              value=""
            >
              All Types
            </option>
            <option
              className="text-orange-400 px-2 py-1 rounded hover:bg-neutral-700 cursor-pointer"
              value="Jamming"
            >
              Jamming
            </option>
            <option
              className="text-red-500 px-2 py-1 rounded hover:bg-neutral-700 cursor-pointer"
              value="Spoofing"
            >
              Spoofing
            </option>
            <option
              className="text-purple-500 px-2 py-1 rounded hover:bg-neutral-700 cursor-pointer"
              value="Low Time Accuracy"
            >
              Low Time Accuracy
            </option>
          </select>
          <input
            type="date"
            value={dateFilter || ""}
            onChange={(e) => setDateFilter(e.target.value)}
            className=" bg-neutral-800  text-white  border border-neutral-700 rounded px-3 py-1 h-13 text-sm outline-none focus:ring-0 focus:border-neutral-500 placeholder:text-neutral-400 [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-green-100 rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-green-100 ">
              <th className="px-6 py-4 text-left text-sm font-semibold">
                PROBE
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                TYPE
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                EVENT START
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                EVENT STOP
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                DURATION
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAlarms.map((alarm) => (
              <tr
                key={alarm.id}
                onClick={() => onSelectAlarm(alarm.id)}
                className="border-b border-slate-700 hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 text-sm text-white">
                  <div className="font-mono">
                    <div className="text-green-50">{alarm.probe}</div>
                    <div className="text-slate-500">{alarm.probeId}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`${getTypeColor(alarm.type)} font-medium`}>
                    ● {alarm.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {alarm.eventStart}
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {alarm.eventStop}
                </td>
                <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                  {alarm.duration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      <div className="mt-4 text-sm text-slate-400">
        Showing {filteredAlarms.length} of {ALARMS.length} alarms
      </div>
    </div>
  );
}
