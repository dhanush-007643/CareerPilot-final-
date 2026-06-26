import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { onSocketEvent, offSocketEvent } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * Hook that manages notifications — fetch, live updates, mark-read, delete.
 */
export default function useNotifications() {
  const { isAuth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);

  const fetch = useCallback(async () => {
    if (!isAuth) return;
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch {/* silently fail */}
    finally { setLoading(false); }
  }, [isAuth]);

  // Fetch on mount
  useEffect(() => { fetch(); }, [fetch]);

  // Listen for real-time notifications via socket
  useEffect(() => {
    const handleNew = (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((c) => c + 1);
      toast(data.title || 'New notification', { icon: '🔔' });
    };
    const handleStatus = (data) => {
      toast.success(`${data.jobTitle}: ${data.status}`, { duration: 5000 });
      setUnreadCount((c) => c + 1);
      fetch();
    };
    const handleGenericRefresh = (data) => {
      toast.success(data.message || 'New update!', { icon: '✨' });
      fetch();
    };

    onSocketEvent('new_notification', handleNew);
    onSocketEvent('status_changed',   handleStatus);
    onSocketEvent('follow_request',   () => handleGenericRefresh({ message: 'New follow request!' }));
    onSocketEvent('follow_approved',  () => handleGenericRefresh({ message: 'Follow request approved!' }));
    onSocketEvent('new_job_posted',   (data) => handleGenericRefresh({ message: `New job posted: ${data.jobTitle}` }));
    onSocketEvent('invitation_received', (data) => handleGenericRefresh({ message: `You've been invited to apply for ${data.jobTitle}` }));

    return () => {
      offSocketEvent('new_notification', handleNew);
      offSocketEvent('status_changed',   handleStatus);
      offSocketEvent('follow_request');
      offSocketEvent('follow_approved');
      offSocketEvent('new_job_posted');
      offSocketEvent('invitation_received');
    };
  }, [fetch]);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const deleted = notifications.find((n) => n._id === id);
      if (deleted && !deleted.isRead) setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {}
  };

  return { notifications, unreadCount, loading, fetch, markRead, markAllRead, deleteNotif };
}
