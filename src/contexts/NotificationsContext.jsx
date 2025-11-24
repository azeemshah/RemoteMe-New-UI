import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "../config";
import { useAuth } from "../hooks/useAuth";
import { closeSnackbar, enqueueSnackbar } from "notistack";

function createNotificationsSocket(token) {
  return io(`${API_URL}/ws/notifications`, {
    transports: ["websocket", "polling"],
    auth: { token },
    withCredentials: true,
  });
}

const NotificationsCtx = createContext({
  socket: null,
  unreadCount: 0,
  latest: null,
  items: [],
  refreshList: async () => {},
  markRead: async () => {},
});

export const useNotifications = () => useContext(NotificationsCtx);

export const NotificationsProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState([]);
  const [latest, setLatest] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    const s = createNotificationsSocket(token);
    setSocket(s);

    s.on("notifications:hello", ({ unreadCount }) =>
      setUnreadCount(unreadCount)
    );
    s.on("notifications:unreadCount", ({ unreadCount }) =>
      setUnreadCount(unreadCount)
    );
    s.on("notifications:new", (data) => {
      enqueueSnackbar(data.content, {
        autoHideDuration: 5000,
        variant: "info",
        action: (snackbarId) => (
          <button
            className="btn btn-outline-warning btn-sm"
            onClick={() => closeSnackbar(snackbarId)}
          >
            Dismiss
          </button>
        ),
      });
      setLatest(data);
      setItems((prev) => [{ ...data, isRead: false }, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    s.on("connect", () => console.log("✅ Socket connected", s.id));
    s.on("connect_error", (err) =>
      console.error("❌ connect_error:", err.message)
    );
    s.on("disconnect", (reason) => console.warn("⚠️ disconnect:", reason));

    return () => {
      s.disconnect();
    };
  }, [token]);

  const refreshList = async (opts = {}) => {
    const params = new URLSearchParams();
    if (opts.beforeId) params.set("beforeId", opts.beforeId);
    if (opts.unreadOnly) params.set("unreadOnly", "true");

    const res = await fetch(
      `${API_URL}/notifications${
        params.toString() ? `?${params.toString()}` : ""
      }`,
      {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json(); // { items, unreadCount }
    if (opts.beforeId) {
      setItems((prev) => [...prev, ...data.items]);
    } else {
      setItems(data.items);
    }
    setHasMore(data.hasMore);
    setUnreadCount(data.unreadCount);
  };

  const loadMore = async () => {
    if (!hasMore || items.length === 0) return;
    const lastId = items[items.length - 1]._id;
    await refreshList({ beforeId: lastId });
  };

  const markRead = async (ids) => {
    setItems((prev) =>
      prev.map((n) => (ids.includes(n._id) ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - ids.length));

    const res = await fetch(`${API_URL}/notifications/mark-read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({ ids }),
    });

    const data = await res.json();
    setUnreadCount(data.unreadCount);

    // if (socket) {
    //   socket.emit("notifications:markRead", { ids });
    // }
  };

  const markAllRead = async () => {
    const res = await fetch(`${API_URL}/notifications/mark-all-read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    const data = await res.json();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(data.unreadCount);
  };

  const value = useMemo(
    () => ({
      socket,
      unreadCount,
      latest,
      items,
      refreshList,
      loadMore,
      hasMore,
      markRead,
      markAllRead,
    }),
    [socket, unreadCount, latest, items]
  );

  return (
    <NotificationsCtx.Provider value={value}>
      {children}
    </NotificationsCtx.Provider>
  );
};
