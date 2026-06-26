import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;
let currentUserId = null;

/**
 * Connect to Socket.io server and join the user's personal room.
 * Prevents duplicate connections from React StrictMode double-mounts.
 * @param {string} userId - The logged-in user's ID
 */
export const connectSocket = (userId) => {
  // If already connected with same user, skip
  if (socket?.connected && currentUserId === userId) return socket;

  // If connected with different user, disconnect first
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  currentUserId = userId;

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id);
    if (currentUserId) socket.emit('join', currentUserId);
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
    // Don't log if the client intentionally disconnected
  });

  socket.on('connect_error', (err) => {
    console.warn('⚠️  Socket error:', err.message);
  });

  return socket;
};

/**
 * Disconnect the socket cleanly.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }
};

/**
 * Get the current socket instance.
 */
export const getSocket = () => socket;

/**
 * Listen for real-time events.
 */
export const onSocketEvent = (event, callback) => {
  if (!socket) return;
  socket.on(event, callback);
};

/**
 * Remove a socket event listener.
 */
export const offSocketEvent = (event, callback) => {
  if (!socket) return;
  socket.off(event, callback);
};

/**
 * Emit a socket event.
 */
export const emitSocketEvent = (event, data) => {
  if (!socket?.connected) return;
  socket.emit(event, data);
};

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
  onSocketEvent,
  offSocketEvent,
  emitSocketEvent,
};
