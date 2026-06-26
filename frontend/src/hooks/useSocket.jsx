import { useEffect } from 'react';
import { getSocket, onSocketEvent, offSocketEvent } from '../services/socket';

/**
 * A custom hook to listen to Socket.io events within React components.
 * Automatically cleans up the event listener on unmount.
 *
 * @param {string} eventName - The socket event name to listen for
 * @param {Function} callback - The function to run when the event is received
 */
export const useSocket = (eventName, callback) => {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    onSocketEvent(eventName, callback);

    return () => {
      offSocketEvent(eventName, callback);
    };
  }, [eventName, callback]);
};
