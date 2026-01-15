import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001"; // Thay bằng URL backend NestJS của bạn (cùng port với WebSocketGateway)

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      // withCredentials: true, // nếu sau này dùng auth
    });

    socket.on("connect", () => {
      console.log("Đã kết nối WebSocket:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Mất kết nối WebSocket");
    });

    socket.on("connect_error", (err) => {
      console.error("Lỗi kết nối:", err.message);
    });
  }

  return socket;
};

export const getSocket = () => {
  return socket || connectSocket();
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
