import axiosInstance from "./axiosConfig";

const trackApi = {
  getLatest: (deviceId, limit = 1) => {
    return axiosInstance.get(`/tracks/${deviceId}/latest`, {
      params: { limit },
      timeout: 15000,
    });
  },

  getAllLatest: () => {
    return axiosInstance.get("/tracks/latest/all", {
      timeout: 20000,
    });
  },

  getHistory: (deviceId, startTime, endTime, limit = 1000) => {
    return axiosInstance.get(`/tracks/${deviceId}/history`, {
      params: {
        start: startTime,
        end: endTime,
        limit,
      },
      timeout: 45000,
    });
  },
};

export default trackApi;
