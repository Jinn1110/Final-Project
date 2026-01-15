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
  const [devices, setDevices] = useState([]); // Thiết bị hoạt động
  const [deletedDevices, setDeletedDevices] = useState([]); // Thiết bị đã soft-delete
  const [activeTab, setActiveTab] = useState("active"); // "active" | "deleted"
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [deletingDevice, setDeletingDevice] = useState(null);
  const [restoringDevice, setRestoringDevice] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ deviceId: "" });

  // Fetch dữ liệu
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const [activeRes, deletedRes] = await Promise.all([
        deviceApi.getActive(), // API lấy thiết bị chưa xóa
        deviceApi.getDeleted(), // API lấy thiết bị đã soft-delete
      ]);

      setDevices(activeRes?.data?.data ?? activeRes?.data ?? []);
      setDeletedDevices(deletedRes?.data?.data ?? deletedRes?.data ?? []);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
      alert("Không thể tải danh sách thiết bị");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Lọc theo tab và tìm kiếm
  const currentList = activeTab === "active" ? devices : deletedDevices;
  const filteredList = currentList.filter((d) =>
    d.deviceId?.toLowerCase().includes(filter.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredList.length);
  const displayedDevices = filteredList.slice(startIndex, endIndex);

  const goToPage = (page) =>
    setCurrentPage(Math.max(1, Math.min(page, totalPages || 1)));

  // Tính số ngày còn lại — CHÍNH XÁC với cron chạy lúc 00:00 mỗi ngày
  const getDaysLeft = (deletedAt) => {
    if (!deletedAt) return "—";

    const deleteDate = new Date(deletedAt);
    // Lấy ngày bị xóa (00:00 của ngày đó)
    const deleteDay = new Date(
      deleteDate.getFullYear(),
      deleteDate.getMonth(),
      deleteDate.getDate()
    );

    // Ngày hôm nay lúc 00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ngày bị xóa vĩnh viễn: đúng 7 ngày sau ngày bị xóa
    const expireDay = new Date(deleteDay);
    expireDay.setDate(expireDay.getDate() + 7);

    // Khoảng cách đến ngày expire
    const diffMs = expireDay.getTime() - today.getTime();

    if (diffMs <= 0) {
      return "Sẽ bị xóa vĩnh viễn đêm nay";
    }

    const daysLeft = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

    if (daysLeft > 1) {
      return `Còn ${daysLeft} ngày`;
    } else {
      return "Còn 1 ngày (xóa đêm nay nếu không khôi phục)";
    }
  };

  // Soft delete
  const handleSoftDelete = async () => {
    if (!deletingDevice) return;
    try {
      await deviceApi.softDelete(deletingDevice.deviceId);
      alert("Thiết bị đã được đánh dấu xóa. Bạn có 7 ngày để khôi phục!");
      setDeletingDevice(null);
      fetchDevices();
    } catch (err) {
      alert(
        "Xóa thất bại: " + (err.response?.data?.message || "Lỗi không xác định")
      );
    }
  };

  // Khôi phục
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

  // Thêm thiết bị
  const handleAdd = async () => {
    if (!formData.deviceId.trim()) {
      alert("Device ID là bắt buộc!");
      return;
    }
    try {
      await deviceApi.create({ deviceId: formData.deviceId.trim() });
      alert("Thêm thiết bị thành công!");
      setFormData({ deviceId: "" });
      setIsAdding(false);
      fetchDevices();
    } catch (err) {
      alert(
        "Thêm thất bại: " +
          (err.response?.data?.message || "Device ID đã tồn tại")
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
        <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => {
                setActiveTab("active");
                setCurrentPage(1);
                setFilter("");
              }}
              className={`px-6 py-4 font-medium transition-colors ${
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
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "deleted"
                  ? "text-orange-400 border-b-2 border-orange-500"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Đang chờ xóa ({deletedDevices.length})
            </button>
          </div>

          {/* Header bảng */}
          <div className="p-6 border-b border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
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
                onChange={(e) => setFilter(e.target.value)}
                className="mt-3 w-full max-w-sm bg-zinc-800/70 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {activeTab === "active" && (
              <button
                onClick={() => {
                  setFormData({ deviceId: "" });
                  setIsAdding(true);
                }}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-all shadow-lg shadow-emerald-600/20"
              >
                + Thêm Thiết Bị
              </button>
            )}
          </div>

          {/* Bảng */}
          {loading ? (
            <div className="text-center py-20 text-zinc-600">
              Đang tải thiết bị...
            </div>
          ) : displayedDevices.length === 0 ? (
            <div className="text-center py-20 text-zinc-600 text-lg">
              {filter
                ? "Không tìm thấy thiết bị nào"
                : activeTab === "active"
                ? "Chưa có thiết bị"
                : "Không có thiết bị nào đang chờ xóa"}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-zinc-500 text-sm border-b border-zinc-800">
                      <th className="px-6 py-4 font-medium">Device ID</th>
                      <th className="px-6 py-4 font-medium">Last Seen</th>
                      <th className="px-6 py-4 font-medium">Chủ Sở Hữu</th>
                      {activeTab === "deleted" && (
                        <th className="px-6 py-4 font-medium">Thời gian xóa</th>
                      )}
                      {activeTab === "deleted" && (
                        <th className="px-6 py-4 font-medium">
                          Thời gian còn lại
                        </th>
                      )}
                      <th className="px-6 py-4 font-medium text-right pr-10">
                        Hành Động
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
                        <td className="px-6 py-4 text-zinc-400 text-sm">
                          {device.lastSeen
                            ? new Date(device.lastSeen).toLocaleString("vi-VN")
                            : "Chưa kết nối"}
                        </td>
                        <td className="px-6 py-4 text-zinc-300">
                          {device.owner || "—"}
                        </td>

                        {activeTab === "deleted" && (
                          <>
                            <td className="px-6 py-4 text-zinc-400 text-sm">
                              {new Date(device.deletedAt).toLocaleString(
                                "vi-VN"
                              )}
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
                                title="Xóa (có thể hoàn tác trong 7 ngày)"
                              >
                                <DeleteIcon />
                              </button>
                            ) : (
                              <button
                                onClick={() => setRestoringDevice(device)}
                                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-orange-400 transition"
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-5 border-t border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-zinc-400">
                    Hiển thị {startIndex + 1}–{endIndex} trong tổng{" "}
                    {filteredList.length} thiết bị
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                        currentPage === 1
                          ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                          : "bg-zinc-800 hover:bg-zinc-700 text-white"
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex gap-2">
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
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                          : "bg-zinc-800 hover:bg-zinc-700 text-white"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Xem chi tiết */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedDevice(null)}
                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
              >
                ← Quay lại
              </button>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <DeviceIcon className="w-8 h-8 text-emerald-500" />
                {selectedDevice.deviceId}
              </h2>
              <div className="w-10" />
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-zinc-400 text-sm mb-2">Device ID</p>
                <p className="font-mono text-xl text-emerald-400">
                  {selectedDevice.deviceId}
                </p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm mb-2">Chủ sở hữu</p>
                <p className="text-lg">
                  {selectedDevice.owner || "Không xác định"}
                </p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm mb-2">Lần kết nối cuối</p>
                <p className="text-lg">
                  {selectedDevice.lastSeen
                    ? new Date(selectedDevice.lastSeen).toLocaleString("vi-VN")
                    : "Chưa kết nối"}
                </p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm mb-2">Ngày tạo</p>
                <p className="text-lg">
                  {new Date(selectedDevice.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              {selectedDevice.deletedAt && (
                <div className="md:col-span-2">
                  <p className="text-zinc-400 text-sm mb-2">Thời gian bị xóa</p>
                  <p className="text-lg text-orange-400">
                    {new Date(selectedDevice.deletedAt).toLocaleString("vi-VN")}
                  </p>
                  <p className="text-lg text-orange-300 mt-3 font-medium">
                    {getDaysLeft(selectedDevice.deletedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm thiết bị */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-8">Thêm thiết bị mới</h3>
            <input
              type="text"
              value={formData.deviceId}
              onChange={(e) => setFormData({ deviceId: e.target.value })}
              placeholder="Nhập Device ID"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-5 py-4 text-white focus:border-emerald-500 outline-none"
            />
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700"
              >
                Hủy
              </button>
              <button
                onClick={handleAdd}
                className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận soft delete */}
      {deletingDevice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-orange-400 mb-6">
              Xóa thiết bị?
            </h3>
            <p className="text-zinc-300 mb-8 leading-relaxed">
              Thiết bị{" "}
              <strong className="text-emerald-400">
                {deletingDevice.deviceId}
              </strong>{" "}
              sẽ bị đánh dấu xóa.
              <br />
              <br />
              <span className="text-emerald-400 font-medium">
                Bạn có thể khôi phục trong vòng 7 ngày đầy đủ.
              </span>
              <br />
              Sau đó, thiết bị sẽ bị xóa vĩnh viễn vào đêm ngày thứ 8.
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
                className="px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 font-medium"
              >
                Xóa (7 ngày hoàn tác)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Khôi phục */}
      {restoringDevice && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-emerald-400 mb-6">
              Khôi phục thiết bị
            </h3>
            <p className="text-zinc-300 mb-8 leading-relaxed">
              Bạn có muốn khôi phục thiết bị{" "}
              <strong className="text-emerald-400">
                {restoringDevice.deviceId}
              </strong>
              ?
              <br />
              <br />
              <span className="text-lg font-medium text-orange-400">
                {getDaysLeft(restoringDevice.deletedAt)}
              </span>
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
                Khôi phục ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
