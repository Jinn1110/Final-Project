import React, { useState, useEffect, useMemo } from "react";
import deviceApi from "../../api/deviceApi";

// ===== Small info row in modal =====
const InfoRow = ({ label, value }) => (
  <div>
    <div className="text-xs text-neutral-400">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);

export default function Probes() {
  const [devices, setDevices] = useState([]);
  const [filter, setFilter] = useState(""); // giống Alarms: filter theo tên
  const [status, setStatus] = useState(""); // giống Alarms: filter theo type/status
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedDevice, setSelectedDevice] = useState(null);

  // ===== Fetch devices =====
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await deviceApi.getAll();
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : res?.data?.devices ?? [];
        setDevices(list);
      } catch (err) {
        console.error("Error fetching devices:", err);
        setDevices([]);
      }
    };
    fetchDevices();
  }, []);

  // ===== Sorting =====
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedDevices = useMemo(() => {
    if (!sortConfig.key) return [...devices];
    return [...devices].sort((a, b) => {
      const aVal = (a?.[sortConfig.key] ?? "").toString();
      const bVal = (b?.[sortConfig.key] ?? "").toString();
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [devices, sortConfig]);

  // ===== Device status =====
  const getDeviceStatus = (device) => {
    if (!device) return "Normal";
    if (
      device.spoofingStatus === "SPOOFED" ||
      device.jammingStatus === "JAMMED"
    )
      return "Critical";
    if (
      device.spoofingStatus === "WARNING" ||
      device.jammingStatus === "WARNING"
    )
      return "Warning";
    return "Normal";
  };

  // ===== Filter devices =====
  const filteredDevices = sortedDevices.filter((d) => {
    const matchesFilter = (d?.name ?? "")
      .toLowerCase()
      .includes(filter.toLowerCase());
    const deviceStatus = getDeviceStatus(d);
    const matchesStatus = status ? deviceStatus === status : true;
    return matchesFilter && matchesStatus;
  });

  return (
    <div className="text-white bg-neutral-900 min-h-screen p-6 space-y-6">
      {/* ===== Header + stats ===== */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">GNSS Probes</h2>
        <div className="flex gap-4">
          <div className="bg-neutral-800 px-4 py-2 rounded-lg border border-neutral-700">
            <p className="text-sm text-neutral-400">Total Probes</p>
            <p className="text-xl font-semibold">{devices.length}</p>
          </div>
          <div className="bg-neutral-800 px-4 py-2 rounded-lg border border-neutral-700">
            <p className="text-sm text-neutral-400">Critical</p>
            <p className="text-xl font-semibold text-red-400">
              {
                devices.filter(
                  (d) =>
                    d.spoofingStatus === "SPOOFED" ||
                    d.jammingStatus === "JAMMED"
                ).length
              }
            </p>
          </div>
          <div className="bg-neutral-800 px-4 py-2 rounded-lg border border-neutral-700">
            <p className="text-sm text-neutral-400">Warning</p>
            <p className="text-xl font-semibold text-yellow-400">
              {
                devices.filter(
                  (d) =>
                    (d.spoofingStatus === "WARNING" ||
                      d.jammingStatus === "WARNING") &&
                    d.spoofingStatus !== "SPOOFED" &&
                    d.jammingStatus !== "JAMMED"
                ).length
              }
            </p>
          </div>
        </div>
      </div>

      {/* ===== Filter Bar (giống Alarms) ===== */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          {/* Search by name */}
          <input
            placeholder="Filter probes..."
            className="bg-neutral-800 text-white border border-neutral-700 rounded px-3 py-2 w-48"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />

          {/* Status filter */}
          <select
            className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-white
             outline-none focus:ring-0 focus:border-neutral-500 w-48 [color-scheme:dark]"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Normal">Normal</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* ===== Table ===== */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full text-left text-sm text-neutral-300 border-collapse">
          <thead className="text-neutral-400 border-b border-neutral-700">
            <tr>
              <th
                onClick={() => handleSort("name")}
                className="py-3 px-4 font-medium cursor-pointer hover:text-white"
              >
                Device Name{" "}
                {sortConfig.key === "name" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th
                onClick={() => handleSort("latitude")}
                className="py-3 px-4 font-medium cursor-pointer hover:text-white"
              >
                Location{" "}
                {sortConfig.key === "latitude" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th
                onClick={() => handleSort("cn0")}
                className="py-3 px-4 font-medium cursor-pointer hover:text-white"
              >
                CN0{" "}
                {sortConfig.key === "cn0" &&
                  (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th className="py-3 px-4 font-medium">Details</th>
            </tr>
          </thead>

          <tbody>
            {filteredDevices.map((device) => (
              <tr
                key={device._id}
                className="border-l-4 border-transparent hover:bg-neutral-700 transition"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        device.spoofingStatus === "SPOOFED" ||
                        device.jammingStatus === "JAMMED"
                          ? "bg-red-400"
                          : device.spoofingStatus === "WARNING" ||
                            device.jammingStatus === "WARNING"
                          ? "bg-yellow-400"
                          : "bg-emerald-400"
                      }`}
                    />
                    <span className="font-medium">{device.device_id}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {(device.latitude ?? 0).toFixed(3)},{" "}
                  {(device.longitude ?? 0).toFixed(3)}
                </td>
                <td className="py-4 px-4">
                  {(() => {
                    const status = getDeviceStatus(device);
                    const badgeClass =
                      status === "Critical"
                        ? "bg-red-400/10 text-red-400"
                        : status === "Warning"
                        ? "bg-yellow-400/10 text-yellow-400"
                        : "bg-emerald-400/10 text-emerald-400";
                    return (
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold ${badgeClass}`}
                      >
                        {status}
                      </span>
                    );
                  })()}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {(device.cn0 ?? 0).toFixed(1)}
                    <div className="w-20 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className={`${
                          (device.cn0 ?? 0) >= 45
                            ? "bg-emerald-400"
                            : (device.cn0 ?? 0) >= 35
                            ? "bg-yellow-400"
                            : "bg-red-400"
                        } h-full transition-all`}
                        style={{
                          width: `${Math.max(
                            0,
                            Math.min(100, ((device.cn0 ?? 0) / 60) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => setSelectedDevice(device)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Modal ===== */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSelectedDevice(null)}
          />
          <div className="relative bg-neutral-800 rounded-xl p-6 z-50 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedDevice.name}
                </h3>
                <p className="text-sm text-neutral-400">
                  {(selectedDevice.latitude ?? 0).toFixed(3)},{" "}
                  {(selectedDevice.longitude ?? 0).toFixed(3)}
                </p>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-neutral-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-neutral-300">
              <InfoRow
                label="Spoofing Status"
                value={selectedDevice.spoofingStatus ?? "-"}
              />
              <InfoRow
                label="Jamming Status"
                value={selectedDevice.jammingStatus ?? "-"}
              />
              <InfoRow
                label="CN0"
                value={(selectedDevice.cn0 ?? 0).toFixed(1)}
              />
              <InfoRow
                label="Satellites"
                value={selectedDevice.satellites ?? "-"}
              />
              <InfoRow
                label="Last Update"
                value={selectedDevice.lastUpdate ?? "-"}
              />
              <InfoRow label="Uptime" value={selectedDevice.uptime ?? "-"} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
