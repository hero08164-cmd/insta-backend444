import { getIO } from "./socket.js";

export const emitEvent = (event, data) => {
  const io = getIO();
  if (!io) return;

  io.emit(event, data);
};