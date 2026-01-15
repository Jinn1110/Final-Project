// src/api/warningApi.js
import axiosInstance from "./axiosConfig";

const warningApi = {
  create: (data) => axiosInstance.post("/warnings", data),

  getAll: (params = {}) => axiosInstance.get("/warnings", { params }),
};

export default warningApi;
