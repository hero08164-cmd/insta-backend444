import { Server } from "socket.io";

let io = null;
let initialized = false;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  process.env.FRONTEND_URL,
].filter(Boolean);

export const initSocket = (server) => {
  if (initialized) return io;

  io = new Server(server, {
    cors: {
      origin(origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.log("❌ Socket CORS Blocked:", origin);
        return callback(new Error("Socket CORS Not Allowed"));
      },
      credentials: true,
      methods: ["GET", "POST"],
    },

    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log("🟢 Realtime Connected:", socket.id);

    socket.on("disconnect", (reason) => {
      console.log("🔴 Realtime Disconnected:", socket.id, reason);
    });
  });

  initialized = true;

  return io;
};

export const emitEvent = (event, data = {}) => {
  if (!io) return;

  io.emit(event, data);
};

export const getIO = () => io;