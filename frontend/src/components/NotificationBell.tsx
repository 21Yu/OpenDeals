import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/api";
import type { Notification } from "../models/types";

const POLL_INTERVAL = 30_000;

function formatNotificationDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const knownIds = useRef(new Set<number>());
  const initialLoad = useRef(true);

  useEffect(() => {
    if (!user) {
      knownIds.current.clear();
      initialLoad.current = true;
      return;
    }

    let active = true;
    const loadNotifications = async () => {
      try {
        const data = await fetchNotifications();
        if (!active) return;

        const newNotifications = data.notifications.filter(
          (notification) => !knownIds.current.has(notification.id),
        );
        if (!initialLoad.current && newNotifications.length > 0) {
          setToast(newNotifications[0].message);
        }
        data.notifications.forEach((notification) => knownIds.current.add(notification.id));
        initialLoad.current = false;
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, POLL_INTERVAL);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 6_000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const handleRead = async (notification: Notification) => {
    if (notification.is_read) return;
    try {
      await markNotificationRead(notification.id);
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, is_read: true } : item
      )));
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleReadAll = async () => {
    if (unreadCount === 0) return;
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };

  if (!user) return null;

  return (
    <div className="notification-center">
      <button
        type="button"
        className="notification-button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="bell-icon" aria-hidden="true">🔔</span>
        {unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? "99+" : unreadCount}</span>}
      </button>

      {isOpen && (
        <section className="notification-popover" aria-label="Notifications">
          <div className="notification-popover-heading">
            <h2>Notifications</h2>
            <button type="button" onClick={handleReadAll} disabled={unreadCount === 0}>
              Mark all read
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="notification-empty">You are all caught up.</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((notification) => (
                <li key={notification.id} className={notification.is_read ? "" : "is-unread"}>
                  <button type="button" onClick={() => handleRead(notification)}>
                    <span>{notification.message}</span>
                    <time dateTime={notification.created_at}>{formatNotificationDate(notification.created_at)}</time>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {toast && (
        <div className="notification-toast" role="status" aria-live="polite">
          <span className="toast-kicker">PRICE UPDATE</span>
          <span>{toast}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}>×</button>
        </div>
      )}
    </div>
  );
}