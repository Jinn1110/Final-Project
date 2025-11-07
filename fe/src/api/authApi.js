import axiosInstance from "./axiosConfig";

const authApi = {
  login: (data) => axiosInstance.post("/login", data),
  register: (data) => axiosInstance.post("/users", data),
  profile: () => axiosInstance.get("/profile"),
};

export default authApi;
