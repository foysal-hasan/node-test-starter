import { getIO, getUserRoom } from "./socket.js";

// Define app-specific emit helpers here so event names stay centralized.
export const socketEmitter = {
  toRoom<T>(roomId: string, event: string, payload: T) {
    getIO().to(roomId).emit(event, payload);
  },

  toUser<T>(userId: string, event: string, payload: T) {
    getIO().to(getUserRoom(userId)).emit(event, payload);
  },
};
