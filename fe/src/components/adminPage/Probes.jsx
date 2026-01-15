import React, { useState, useEffect } from "react";
import deviceApi from "../../api/deviceApi";

// Icons
const DeviceIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ViewIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const RestoreIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
    />
  </svg>
);

const ITEMS_PER_PAGE = 8;

export default function DeviceManagement() {
  const [devices, setDevices] = useState([]);
  const [deletedDevices, setDeletedDevices] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deletingDevice, setDeletingDevice] = useState(null);
  const [restoringDevice, setRestoringDevice] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    deviceId: "",
    type: "UBX",
  });

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activeRes, deletedRes] = await Promise.all([
        deviceApi.getActive(),
        deviceApi.getDeleted(),
      ]);
      setDevices(activeRes?.data?.data || activeRes?.data || []);
      setDeletedDevices(deletedRes?.data?.data || deletedRes?.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách thiết bị:", err);
      setError("Không thể tải danh sách thiết bị. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const currentList = activeTab === "active" ? devices : deletedDevices;
  const filteredList = currentList.filter((d) =>
    d.deviceId?.toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredList.length);
  const displayedDevices = filteredList.slice(startIndex, endIndex);

  const goToPage = (page) => {
    const newPage = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(newPage);
  };

  const getDaysLeft = (deletedAt) => {
    if (!deletedAt) return "—";
    const deleteDate = new Date(deletedAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expireDate = new Date(deleteDate);
    expireDate.setDate(expireDate.getDate() + 7);

    const diffMs = expireDate - today;
    if (diffMs <= 0) return "Sẽ bị xóa vĩnh viễn đêm nay";

    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days > 1
      ? `Còn ${days} ngày`
      : "Còn 1 ngày (xóa đêm nay nếu không khôi phục)";
  };

  const handleSoftDelete = async () => {
    if (!deletingDevice) return;
    try {
      await deviceApi.delete(deletingDevice.deviceId);
      alert("Thiết bị đã được đánh dấu xóa. Có thể khôi phục trong 7 ngày.");
      setDeletingDevice(null);
      fetchDevices();
    } catch (err) {
      alert("Xóa thất bại: " + (err.response?.data?.message || "Lỗi hệ thống"));
    }
  };

  const handleRestore = async () => {
    if (!restoringDevice) return;
    try {
      await deviceApi.restore(restoringDevice.deviceId);
      alert("Khôi phục thiết bị thành công!");
      setRestoringDevice(null);
      fetchDevices();
    } catch (err) {
      alert(
        "Khôi phục thất bại: " +
          (err.response?.data?.message || "Có thể đã quá 7 ngày")
      );
    }
  };

  const handleAdd = async () => {
    if (!formData.deviceId.trim()) {
      alert("Device ID là bắt buộc!");
      return;
    }
    try {
      await deviceApi.create({
        deviceId: formData.deviceId.trim(),
        type: formData.type,
      });
      alert("Thêm thiết bị thành công!");
      setFormData({ deviceId: "", type: "UBX" });
      setIsAdding(false);
      fetchDevices();
    } catch (err) {
      alert(
        "Thêm thất bại: " +
          (err.response?.data?.message || "Device ID có thể đã tồn tại")
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center gap-4">
          <DeviceIcon className="w-8 h-8 text-emerald-500" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Quản Lý Thiết Bị
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-900/40 border border-red-700 rounded-xl text-red-300">
            {error}
          </div>
        )}

        <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => {
                setActiveTab("active");
                setCurrentPage(1);
                setFilter("");
              }}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "active"
                  ? "text-emerald-400 border-b-2 border-emerald-500"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Thiết bị hoạt động ({devices.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("deleted");
                setCurrentPage(1);
                setFilter("");
              }}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === "deleted"
                  ? "text-orange-400 border-b-2 border-orange-500"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Đang chờ xóa ({deletedDevices.length})
            </button>
          </div>

          {/* Header + Search + Add Button */}
          <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <DeviceIcon className="w-6 h-6 text-emerald-500" />
                {activeTab === "active"
                  ? "Danh Sách Thiết Bị"
                  : "Thiết Bị Đang Chờ Xóa"}{" "}
                ({filteredList.length})
              </h2>
              <input
                type="text"
                placeholder="Tìm kiếm Device ID..."
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-3 w-full sm:w-80 bg-zinc-800/70 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {activeTab === "active" && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all shadow-lg shadow-emerald-600/20 whitespace-nowrap"
              >
                + Thêm Thiết Bị
              </button>
            )}
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="text-center py-20 text-zinc-500">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto mb-4"></div>
              Đang tải...
            </div>
          ) : displayedDevices.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              {filter
                ? "Không tìm thấy thiết bị nào"
                : activeTab === "active"
                ? "Chưa có thiết bị hoạt động nào"
                : "Không có thiết bị nào đang chờ xóa"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="text-left text-zinc-400 text-sm border-b border-zinc-800 bg-zinc-900/40">
                    <th className="px-6 py-4 font-medium">Device ID</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Last Seen</th>
                    <th className="px-6 py-4 font-medium">Chủ sở hữu</th>
                    {activeTab === "deleted" && (
                      <>
                        <th className="px-6 py-4 font-medium">Xóa lúc</th>
                        <th className="px-6 py-4 font-medium">Còn lại</th>
                      </>
                    )}
                    <th className="px-6 py-4 font-medium text-right pr-10">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedDevices.map((device) => (
                    <tr
                      key={device._id}
                      className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono text-emerald-400 flex items-center gap-3">
                        <DeviceIcon className="w-5 h-5 text-emerald-500" />
                        {device.deviceId}
                      </td>
                      <td className="px-6 py-4">
                        {device.type || "Undefined"}
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">
                        {device.lastSeen
                          ? new Date(device.lastSeen).toLocaleString("vi-VN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "Chưa kết nối"}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        {device.owner || "—"}
                      </td>

                      {activeTab === "deleted" && (
                        <>
                          <td className="px-6 py-4 text-zinc-400 text-sm">
                            {new Date(device.deletedAt).toLocaleString("vi-VN")}
                          </td>
                          <td className="px-6 py-4 font-medium text-orange-400">
                            {getDaysLeft(device.deletedAt)}
                          </td>
                        </>
                      )}

                      <td className="px-6 py-4 text-right pr-10">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setSelectedDevice(device)}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 transition"
                            title="Xem chi tiết"
                          >
                            <ViewIcon />
                          </button>

                          {activeTab === "active" ? (
                            <button
                              onClick={() => setDeletingDevice(device)}
                              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-red-400 transition"
                              title="Xóa (có thể khôi phục trong 7 ngày)"
                            >
                              <DeleteIcon />
                            </button>
                          ) : (
                            <button
                              onClick={() => setRestoringDevice(device)}
                              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 transition"
                              title="Khôi phục thiết bị"
                            >
                              <RestoreIcon />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="p-5 border-t border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-zinc-400">
                Hiển thị {startIndex + 1}–{endIndex} trong {filteredList.length}{" "}
                thiết bị
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    currentPage === 1
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  }`}
                >
                  Trước
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? "bg-emerald-600 text-white shadow-lg"
                          : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    currentPage === totalPages
                      ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  }`}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Thêm thiết bị */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Thêm thiết bị mới</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-zinc-400 text-sm mb-2">
                  Device ID
                </label>
                <input
                  type="text"
                  value={formData.deviceId}
                  onChange={(e) =>
                    setFormData({ ...formData, deviceId: e.target.value })
                  }
                  placeholder="Nhập Device ID"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-5 py-3 focus:border-emerald-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:border-emerald-500 outline-none"
                >
                  <option value="UBX">UBX</option>
                  <option value="RTCM">RTCM</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-10">
              <button
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleAdd}
                className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium transition"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Xóa */}
      {deletingDevice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-400 mb-4">
              Xác nhận xóa thiết bị
            </h3>
            <p className="text-zinc-300 mb-6">
              Bạn có chắc chắn muốn xóa{" "}
              <span className="font-mono text-emerald-400">
                {deletingDevice?.deviceId}
              </span>
              ?
              <br />
              <span className="text-sm text-zinc-500 mt-2 block">
                Thiết bị sẽ được đánh dấu xóa và có thể khôi phục trong 7 ngày.
              </span>
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeletingDevice(null)}
                className="px-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700"
              >
                Hủy
              </button>
              <button
                onClick={handleSoftDelete}
                className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận Khôi phục */}
      {restoringDevice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-emerald-400 mb-4">
              Xác nhận khôi phục
            </h3>
            <p className="text-zinc-300 mb-6">
              Bạn muốn khôi phục thiết bị{" "}
              <span className="font-mono text-emerald-400">
                {restoringDevice?.deviceId}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setRestoringDevice(null)}
                className="px-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700"
              >
                Hủy
              </button>
              <button
                onClick={handleRestore}
                className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium"
              >
                Khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
