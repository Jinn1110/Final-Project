import axiosInstance from "./axiosConfig";

const trackApi = {
  getLatest: (deviceId, limit = 100) => {
    return axiosInstance.get(`/tracks/${deviceId}/latest`, {
      params: { limit },
    });
  },
  getAll: () => axiosInstance.get("/tracks"),
};

export default trackApi;
