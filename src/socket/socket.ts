import type { Server as HttpServer } from "node:http";

import { Server, type Socket } from "socket.io";

import {
  type JwtUserPayload,
  verifyAccessToken,
} from "../middlewares/auth.middleware.js";
import { SOCKET_EVENTS } from "./socket-events.js";

interface RoomActionPayload {
  id: string;
}

interface RoomActionResponse {
  success: boolean;
  message: string;
  roomId?: string;
}

interface ClientToServerEvents {
  [event: string]: (...args: any[]) => void;
  [SOCKET_EVENTS.JOIN_ROOM]: (
    payload: RoomActionPayload,
    callback?: (response: RoomActionResponse) => void
  ) => void;
  [SOCKET_EVENTS.LEAVE_ROOM]: (
    payload: RoomActionPayload,
    callback?: (response: RoomActionResponse) => void
  ) => void;
}

interface ServerToClientEvents {
  [event: string]: (...args: any[]) => void;
  [SOCKET_EVENTS.CONNECTED]: (payload: {
    socketId: string;
    userId: string;
    roomId: string;
  }) => void;
  [SOCKET_EVENTS.ROOM_JOINED]: (payload: { roomId: string }) => void;
  [SOCKET_EVENTS.ROOM_LEFT]: (payload: { roomId: string }) => void;
}

interface InterServerEvents {
  [event: string]: (...args: any[]) => void;
}

interface SocketData {
  user: JwtUserPayload;
}

export type AppSocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let io: AppSocketServer | null = null;

export const getUserRoom = (userId: string) => `user:${userId}`;

const getHandshakeToken = (socket: AppSocket) => {
  const authToken = socket.handshake.auth.token;

  if (typeof authToken === "string" && authToken.trim()) {
    return authToken;
  }

  const authorizationHeader = socket.handshake.headers.authorization;
  const rawHeader = Array.isArray(authorizationHeader)
    ? authorizationHeader[0]
    : authorizationHeader;

  if (typeof rawHeader !== "string" || !rawHeader.trim()) {
    return null;
  }

  if (rawHeader.startsWith("Bearer ")) {
    return rawHeader.slice(7);
  }

  return rawHeader;
};

const getRoomId = (payload: RoomActionPayload) => payload.id.trim();

const handleJoinRoom = (socket: AppSocket) => {
  socket.on(SOCKET_EVENTS.JOIN_ROOM, (payload, callback) => {
    const roomId = getRoomId(payload);

    if (!roomId) {
      callback?.({
        success: false,
        message: "Room id is required",
      });
      return;
    }

    socket.join(roomId);
    socket.emit(SOCKET_EVENTS.ROOM_JOINED, { roomId });
    callback?.({
      success: true,
      message: "Joined room successfully",
      roomId,
    });
  });
};

const handleLeaveRoom = (socket: AppSocket) => {
  socket.on(SOCKET_EVENTS.LEAVE_ROOM, (payload, callback) => {
    const roomId = getRoomId(payload);

    if (!roomId) {
      callback?.({
        success: false,
        message: "Room id is required",
      });
      return;
    }

    socket.leave(roomId);
    socket.emit(SOCKET_EVENTS.ROOM_LEFT, { roomId });
    callback?.({
      success: true,
      message: "Left room successfully",
      roomId,
    });
  });
};

export const initializeSocket = (httpServer: HttpServer) => {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    const token = getHandshakeToken(socket);

    if (!token) {
      next(new Error("Unauthorized: token is missing"));
      return;
    }

    try {
      socket.data.user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error("Unauthorized: invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const personalRoom = getUserRoom(socket.data.user.sub);
    socket.join(personalRoom);

    socket.emit(SOCKET_EVENTS.CONNECTED, {
      socketId: socket.id,
      userId: socket.data.user.sub,
      roomId: personalRoom,
    });

    handleJoinRoom(socket);
    handleLeaveRoom(socket);
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};
