import axios from "axios";

// Tạo instance chung
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_URL_BACKEND,
  headers: {
    "Content-Type": "application/json",
  },
});

//  Thêm interceptor để tự động gắn token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//  Bắt lỗi trả về từ server
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Token hết hạn hoặc không hợp lệ");
      // Có thể logout hoặc refresh token ở đây
    } else if (error.response?.status === 403) {
      console.error("Không có quyền truy cập");
    } else if (error.response?.status >= 500) {
      console.error("Lỗi server:", error.response?.data?.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
