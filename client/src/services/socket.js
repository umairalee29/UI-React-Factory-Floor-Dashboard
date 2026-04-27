import { io } from 'socket.io-client';

let socket = null;

export function getSocket(token) {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || '', {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
