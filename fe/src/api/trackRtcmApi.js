import axiosInstance from "./axiosConfig";

const trackRtcmApi = {
  // Lấy track mới nhất của một thiết bị RTCM
  getLatest: (deviceId, limit = 1) => {
    return axiosInstance.get(`/track-rtcm/${deviceId}/latest`, {
      params: { limit },
      timeout: 15000,
    });
  },

  // Lấy track mới nhất của tất cả thiết bị RTCM
  getAllLatest: () => {
    return axiosInstance.get("/track-rtcm/latest/all", {
      timeout: 20000,
    });
  },

  // Lấy lịch sử dữ liệu theo khoảng thời gian
  getHistory: (deviceId, startTime, endTime, limit = 1000) => {
    return axiosInstance.get(`/track-rtcm/${deviceId}/history`, {
      params: {
        start: startTime,
        end: endTime,
        limit,
      },
      timeout: 45000,
    });
  },

  // Tạo track mới (ingest dữ liệu từ thiết bị)
  create: (payload) => {
    return axiosInstance.post("/track-rtcm", payload, { timeout: 15000 });
  },
};

export default trackRtcmApi;
