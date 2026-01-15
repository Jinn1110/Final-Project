import axiosInstance from "./axiosConfig";

const deviceApi = {
  getActive: () => axiosInstance.get("/devices/active"),

  getDeleted: () => axiosInstance.get("devices/deleted"),

  getOne: (id) => axiosInstance.get(`/devices/${id}`),

  create: (data) => axiosInstance.post("/devices", data),

  delete: (id) => axiosInstance.delete(`/devices/${id}`),

  restore: (id) => axiosInstance.patch(`/devices/${id}/restore`),
};

export default deviceApi;
