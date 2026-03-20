export const SOCKET_EVENTS = {
  CONNECTED: "socket:connected",
  JOIN_ROOM: "room:join",
  ROOM_JOINED: "room:joined",
  LEAVE_ROOM: "room:leave",
  ROOM_LEFT: "room:left",
} as const;
