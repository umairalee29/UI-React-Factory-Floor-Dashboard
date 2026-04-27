import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || '', {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
